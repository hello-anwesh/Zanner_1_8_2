import { aiService } from "./AIService";
import { cacheService } from "./CacheService";
import { databaseService } from "../db/DatabaseService";
import { PRESET_MIXES } from "../../components/frequency/frequencies";

interface RAGDocument {
    id: string;
    content: string;
    embedding: number[];
    metadata?: any;
}

const STORAGE_KEY = "zenner_rag_index_v1";
const RAG_TABLE = "rag_documents";

class RAGService {
    private documents: RAGDocument[] = [];
    private isInitialized = false;
    private sqliteInitialized = false;

    async init() {
        if (this.isInitialized) return;

        // Initialize SQLite table
        await this.initSQLite();

        // Try to load from SQLite first, then localStorage fallback
        let loaded = await this.loadFromSQLite();
        if (!loaded) {
            loaded = this.loadFromLocalStorage();
        }

        if (loaded) {
            this.isInitialized = true;
            // Check if we need to re-index
            const presetDocs = this.documents.filter(d => d.metadata?.type === 'preset');
            if (presetDocs.length < PRESET_MIXES.length) {
                console.log("RAG Index outdated, refreshing...");
                this.refreshIndex();
            }
            return;
        }

        console.log("Building initial RAG Index...");
        await this.indexPresets();
        await this.saveIndex();
        this.isInitialized = true;
    }

    private async initSQLite(): Promise<void> {
        try {
            const db = await databaseService.getDb();
            await db.execute(`
                CREATE TABLE IF NOT EXISTS ${RAG_TABLE} (
                    id TEXT PRIMARY KEY,
                    content TEXT NOT NULL,
                    embedding TEXT NOT NULL,
                    metadata TEXT
                )
            `);
            this.sqliteInitialized = true;
        } catch (e) {
            console.warn("[RAGService] SQLite init failed:", e);
        }
    }

    private async loadFromSQLite(): Promise<boolean> {
        if (!this.sqliteInitialized) return false;
        try {
            const db = await databaseService.getDb();
            const rows = await db.select<{ id: string; content: string; embedding: string; metadata: string }[]>(
                `SELECT * FROM ${RAG_TABLE}`
            );
            if (rows && rows.length > 0) {
                this.documents = rows.map(r => ({
                    id: r.id,
                    content: r.content,
                    embedding: JSON.parse(r.embedding),
                    metadata: r.metadata ? JSON.parse(r.metadata) : undefined
                }));
                console.log(`[RAGService] Loaded ${rows.length} documents from SQLite`);
                return true;
            }
        } catch (e) {
            console.warn("[RAGService] Failed to load from SQLite:", e);
        }
        return false;
    }

    private loadFromLocalStorage(): boolean {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                this.documents = JSON.parse(stored);
                console.log(`[RAGService] Loaded ${this.documents.length} documents from localStorage`);
                // Migrate to SQLite
                this.migrateToSQLite();
                return true;
            }
        } catch (e) {
            console.warn("[RAGService] Failed to load from localStorage:", e);
        }
        return false;
    }

    private async migrateToSQLite(): Promise<void> {
        if (!this.sqliteInitialized) return;
        try {
            const db = await databaseService.getDb();
            for (const doc of this.documents) {
                await db.execute(
                    `INSERT OR REPLACE INTO ${RAG_TABLE} (id, content, embedding, metadata) VALUES (?, ?, ?, ?)`,
                    [doc.id, doc.content, JSON.stringify(doc.embedding), JSON.stringify(doc.metadata)]
                );
            }
            console.log(`[RAGService] Migrated ${this.documents.length} documents to SQLite`);
        } catch (e) {
            console.warn("[RAGService] Migration failed:", e);
        }
    }

    private async saveIndex() {
        // Save to SQLite
        if (this.sqliteInitialized) {
            try {
                const db = await databaseService.getDb();
                // Clear and rewrite
                await db.execute(`DELETE FROM ${RAG_TABLE}`);
                for (const doc of this.documents) {
                    await db.execute(
                        `INSERT INTO ${RAG_TABLE} (id, content, embedding, metadata) VALUES (?, ?, ?, ?)`,
                        [doc.id, doc.content, JSON.stringify(doc.embedding), JSON.stringify(doc.metadata)]
                    );
                }
                console.log(`[RAGService] Saved ${this.documents.length} documents to SQLite`);
            } catch (e) {
                console.warn("[RAGService] SQLite save failed:", e);
            }
        }
        // Also save to localStorage as fallback
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.documents));
        } catch (e) {
            console.warn("[RAGService] localStorage save failed:", e);
        }
    }

    async indexPresets() {
        // Clear existing preset docs
        this.documents = this.documents.filter(d => d.metadata?.type !== 'preset');

        console.log(`Indexing ${PRESET_MIXES.length} presets...`);
        for (const preset of PRESET_MIXES) {
            const content = `Frequency Preset Name: ${preset.name}. 
Description: ${preset.description || ''}. 
Experience to Expect: ${preset.experience || ''}. 
Recommended Usage: ${preset.usage || ''}. 
Frequencies: ${preset.frequencies.map(f => f.hz + "Hz").join(", ")}.`;

            try {
                const embedding = await aiService.embed(content);
                this.documents.push({
                    id: `preset-${preset.id}`,
                    content,
                    embedding,
                    metadata: { type: "preset", ...preset }
                });
                // Small delay to prevent rate limits
                await new Promise(r => setTimeout(r, 100));
            } catch (e) {
                console.error(`Failed to embed preset ${preset.name}`, e);
            }
        }
        console.log("RAG Indexing complete.");
    }

    // Cosine similarity
    private similarity(a: number[], b: number[]) {
        let dot = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    async retrieve(query: string, k: number = 3): Promise<string> {
        // If query is short or generic, maybe skip?
        if (query.length < 3) return "";

        // Check cache first
        const cached = cacheService.getRetrieval(query);
        if (cached !== null) {
            console.log('[RAG] Cache hit for query');
            return cached;
        }

        // If not initialized, try to load
        if (!this.documents.length) {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) this.documents = JSON.parse(stored);
        }

        // If still empty, return nothing (don't block on live embedding usually)
        if (!this.documents.length) return "";

        try {
            // Check embedding cache
            let queryEmbedding = cacheService.getEmbedding(query);
            if (!queryEmbedding) {
                queryEmbedding = await aiService.embed(query);
                cacheService.setEmbedding(query, queryEmbedding);
            }

            const scored = this.documents.map(doc => ({
                doc,
                score: this.similarity(queryEmbedding!, doc.embedding)
            }));

            scored.sort((a, b) => b.score - a.score);

            const topK = scored.slice(0, k);
            const result = topK.map(item => `[RAG KNOWLEDGE: ${item.doc.metadata.name} (Match: ${Math.round(item.score * 100)}%)]\n${item.doc.content}`).join("\n\n");

            // Cache the result
            cacheService.setRetrieval(query, result);

            return result;
        } catch (e) {
            console.error("RAG Retrieve error:", e);
            return "";
        }
    }

    async refreshIndex() {
        await this.indexPresets();
        this.saveIndex();
    }
}

export const ragService = new RAGService();
