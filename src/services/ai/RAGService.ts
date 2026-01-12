import { aiService } from "./AIService";
import { cacheService } from "./CacheService";
import { PRESET_MIXES } from "../../components/frequency/frequencies";

interface RAGDocument {
    id: string;
    content: string;
    embedding: number[];
    metadata?: any;
}

const STORAGE_KEY = "zenner_rag_index_v1";

class RAGService {
    private documents: RAGDocument[] = [];
    private isInitialized = false;

    async init() {
        if (this.isInitialized) return;

        // Load index from storage
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                this.documents = JSON.parse(stored);
                this.isInitialized = true;

                // Simple re-index check
                const presetDocs = this.documents.filter(d => d.metadata?.type === 'preset');
                if (presetDocs.length < PRESET_MIXES.length) {
                    console.log("RAG Index outdated (preset count mismatch), refreshing...");
                    // We don't await here to not block UI, we let it run in bg
                    this.refreshIndex();
                }
                return;
            }
        } catch (e) {
            console.warn("Failed to load RAG index", e);
        }

        console.log("Building initial RAG Index...");
        this.indexPresets().then(() => {
            this.saveIndex();
            this.isInitialized = true;
        });
    }

    private saveIndex() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.documents));
        } catch (e) {
            console.warn("RAG Index too large for localStorage", e);
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
