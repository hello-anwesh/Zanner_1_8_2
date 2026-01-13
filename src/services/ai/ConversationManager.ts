/**
 * Conversation Manager
 * Handles sliding window summaries for long conversations
 * Maintains context while respecting token budgets
 */

import { aiService } from "./AIService";
import { databaseService } from "../db/DatabaseService";

interface ConversationMessage {
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: number;
}

interface ConversationState {
    messages: ConversationMessage[];
    summaries: string[];
    lastSummaryIndex: number;
}

const STORAGE_KEY = "zenner_conversation_state";
const MESSAGES_TABLE = "conversation_messages";
const SUMMARIES_TABLE = "conversation_summaries";

class ConversationManager {
    private state: ConversationState = {
        messages: [],
        summaries: [],
        lastSummaryIndex: 0
    };

    // Configuration
    private readonly SUMMARY_THRESHOLD = 20; // Summarize every 20 messages
    private readonly MESSAGES_TO_SUMMARIZE = 10; // Summarize oldest 10 when triggered
    private readonly MAX_SUMMARIES = 5; // Keep last 5 summaries
    private readonly MAX_SUMMARY_TOKENS = 200; // Each summary ~200 tokens

    private isSummarizing = false;
    private initialized = false;
    private initPromise: Promise<void> | null = null;

    constructor() {
        this.loadState(); // Load from localStorage first for immediate access
        this.init().catch(console.error); // Then init SQLite in background
    }

    /**
     * Initialize SQLite tables
     */
    async init(): Promise<void> {
        if (this.initialized) return;
        if (this.initPromise) return this.initPromise;
        this.initPromise = this._doInit();
        await this.initPromise;
    }

    private async _doInit(): Promise<void> {
        try {
            const db = await databaseService.getDb();

            // Create tables
            await db.execute(`
                CREATE TABLE IF NOT EXISTS ${MESSAGES_TABLE} (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    timestamp INTEGER NOT NULL
                )
            `);

            await db.execute(`
                CREATE TABLE IF NOT EXISTS ${SUMMARIES_TABLE} (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    summary TEXT NOT NULL,
                    created_at INTEGER NOT NULL
                )
            `);

            // Migrate localStorage to SQLite if SQLite is empty
            const msgCount = await db.select<{ count: number }[]>(
                `SELECT COUNT(*) as count FROM ${MESSAGES_TABLE}`
            );

            if ((!msgCount || msgCount[0]?.count === 0) && this.state.messages.length > 0) {
                // Migrate
                for (const msg of this.state.messages) {
                    await db.execute(
                        `INSERT INTO ${MESSAGES_TABLE} (role, content, timestamp) VALUES (?, ?, ?)`,
                        [msg.role, msg.content, msg.timestamp]
                    );
                }
                for (const summary of this.state.summaries) {
                    await db.execute(
                        `INSERT INTO ${SUMMARIES_TABLE} (summary, created_at) VALUES (?, ?)`,
                        [summary, Date.now()]
                    );
                }
                console.log("[ConversationManager] Migrated to SQLite");
            } else if (msgCount && msgCount[0]?.count > 0) {
                // Load from SQLite
                await this.loadFromSQLite();
            }

            this.initialized = true;
        } catch (error) {
            console.error("[ConversationManager] SQLite init failed:", error);
            this.initialized = true; // Continue with localStorage
        }
    }

    private async loadFromSQLite(): Promise<void> {
        const db = await databaseService.getDb();
        const messages = await db.select<ConversationMessage[]>(
            `SELECT role, content, timestamp FROM ${MESSAGES_TABLE} ORDER BY timestamp ASC LIMIT 100`
        );
        const summaries = await db.select<{ summary: string }[]>(
            `SELECT summary FROM ${SUMMARIES_TABLE} ORDER BY created_at ASC`
        );
        this.state.messages = messages || [];
        this.state.summaries = (summaries || []).map(s => s.summary);
        console.log("[ConversationManager] Loaded from SQLite");
    }

    private async saveToSQLite(role: string, content: string, timestamp: number): Promise<void> {
        if (!this.initialized) return;
        try {
            const db = await databaseService.getDb();
            await db.execute(
                `INSERT INTO ${MESSAGES_TABLE} (role, content, timestamp) VALUES (?, ?, ?)`,
                [role, content, timestamp]
            );
        } catch (e) {
            console.warn("[ConversationManager] SQLite save failed:", e);
        }
    }

    /**
     * Load saved state from storage
     */
    private loadState(): void {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                this.state = JSON.parse(stored);
            }
        } catch (e) {
            console.warn("[ConversationManager] Failed to load state:", e);
        }
    }

    /**
     * Save state to storage
     */
    private saveState(): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.warn("[ConversationManager] Failed to save state:", e);
        }
    }

    /**
     * Add a message and check if summarization is needed
     */
    async addMessage(role: "user" | "assistant", content: string): Promise<void> {
        const timestamp = Date.now();
        this.state.messages.push({
            role,
            content,
            timestamp
        });

        // Save to SQLite
        await this.saveToSQLite(role, content, timestamp);

        // Check if we need to summarize
        if (this.state.messages.length >= this.SUMMARY_THRESHOLD && !this.isSummarizing) {
            await this.summarizeOldMessages();
        }

        this.saveState();
    }

    /**
     * Summarize old messages to compress context
     */
    private async summarizeOldMessages(): Promise<void> {
        if (this.state.messages.length < this.SUMMARY_THRESHOLD) return;

        this.isSummarizing = true;
        console.log("[ConversationManager] Summarizing old messages...");

        try {
            const toSummarize = this.state.messages.slice(0, this.MESSAGES_TO_SUMMARIZE);

            // Format messages for summarization
            const messageText = toSummarize
                .map(m => `${m.role.toUpperCase()}: ${m.content}`)
                .join("\n");

            const prompt = `Summarize this conversation segment in 2-3 sentences, capturing:
1. Key topics discussed
2. Important decisions or preferences expressed
3. Any tasks or goals mentioned

CONVERSATION:
${messageText}

Provide a concise summary only, no preamble:`;

            const summary = await aiService.chat(prompt, {
                systemPrompt: "You are a conversation summarizer. Output only the summary, nothing else."
            });

            if (summary && summary.trim()) {
                // Add new summary
                this.state.summaries.push(summary.trim());

                // Keep only recent summaries
                if (this.state.summaries.length > this.MAX_SUMMARIES) {
                    // Combine oldest summaries
                    const oldestTwo = this.state.summaries.slice(0, 2);
                    const combined = `Earlier: ${oldestTwo.join(" Then: ")}`;
                    this.state.summaries = [combined, ...this.state.summaries.slice(2)];
                }

                // Remove summarized messages
                this.state.messages = this.state.messages.slice(this.MESSAGES_TO_SUMMARIZE);
                this.state.lastSummaryIndex = Date.now();

                console.log("[ConversationManager] Summary created, messages trimmed");
            }
        } catch (e) {
            console.error("[ConversationManager] Summarization failed:", e);
        } finally {
            this.isSummarizing = false;
            this.saveState();
        }
    }

    /**
     * Get context string with summaries + recent messages
     */
    getContext(): string {
        const sections: string[] = [];

        // Add summaries if any
        if (this.state.summaries.length > 0) {
            const summaryText = this.state.summaries
                .map((s, i) => `[Session ${i + 1}] ${s}`)
                .join("\n");
            sections.push(`PREVIOUS CONVERSATION CONTEXT:\n${summaryText}`);
        }

        // Add recent messages
        if (this.state.messages.length > 0) {
            const recentText = this.state.messages
                .slice(-10) // Last 10 messages
                .map(m => `${m.role.toUpperCase()}: ${m.content.substring(0, 200)}${m.content.length > 200 ? '...' : ''}`)
                .join("\n");
            sections.push(`RECENT MESSAGES:\n${recentText}`);
        }

        return sections.join("\n\n");
    }

    /**
     * Get recent messages for display
     */
    getRecentMessages(count: number = 20): ConversationMessage[] {
        return this.state.messages.slice(-count);
    }

    /**
     * Get all summaries
     */
    getSummaries(): string[] {
        return [...this.state.summaries];
    }

    /**
     * Get statistics
     */
    getStats(): {
        messageCount: number;
        summaryCount: number;
        estimatedTokens: number;
        lastSummaryTime: number | null;
    } {
        const contextTokens = Math.ceil(this.getContext().length / 4);
        return {
            messageCount: this.state.messages.length,
            summaryCount: this.state.summaries.length,
            estimatedTokens: contextTokens,
            lastSummaryTime: this.state.lastSummaryIndex || null
        };
    }

    /**
     * Clear all conversation data
     */
    async clear(): Promise<void> {
        this.state = {
            messages: [],
            summaries: [],
            lastSummaryIndex: 0
        };
        localStorage.removeItem(STORAGE_KEY);

        // Clear SQLite
        if (this.initialized) {
            try {
                const db = await databaseService.getDb();
                await db.execute(`DELETE FROM ${MESSAGES_TABLE}`);
                await db.execute(`DELETE FROM ${SUMMARIES_TABLE}`);
                console.log("[ConversationManager] Cleared SQLite data");
            } catch (e) {
                console.warn("[ConversationManager] Failed to clear SQLite:", e);
            }
        }
    }

    /**
     * Force summarization (useful for ending a session)
     */
    async forceSummarize(): Promise<void> {
        if (this.state.messages.length >= 4) { // At least 2 exchanges
            const originalThreshold = this.SUMMARY_THRESHOLD;
            // Temporarily lower threshold
            (this as any).SUMMARY_THRESHOLD = this.state.messages.length;
            await this.summarizeOldMessages();
            (this as any).SUMMARY_THRESHOLD = originalThreshold;
        }
    }
}

export const conversationManager = new ConversationManager();
