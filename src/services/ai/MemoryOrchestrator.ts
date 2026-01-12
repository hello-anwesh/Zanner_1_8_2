/**
 * Memory Orchestrator
 * Unified interface for all memory systems
 * Combines RAG, Training Memory, and manages token budgets
 */

import { ragService } from "./RAGService";
import { trainingService } from "../training/TrainingService";
import { cacheService } from "./CacheService";

interface MemoryConfig {
    maxSemanticTokens: number;      // Max tokens for RAG + knowledge
    maxProceduralTokens: number;    // Max tokens for rules
    maxContextTokens: number;       // Max tokens for experiences
}

interface RetrievalResult {
    ragContext: string;
    memoryContext: string;
    rulesContext: string;
    experienceContext: string;
    totalEstimatedTokens: number;
}

const DEFAULT_CONFIG: MemoryConfig = {
    maxSemanticTokens: 1000,
    maxProceduralTokens: 500,
    maxContextTokens: 500
};

class MemoryOrchestrator {
    private config: MemoryConfig = DEFAULT_CONFIG;

    /**
     * Retrieve all relevant memory for a query
     * Manages token budgets and deduplicates across sources
     */
    async retrieve(query: string): Promise<RetrievalResult> {
        // Start all retrievals in parallel
        const [ragContext, memoryContext, rulesContext, experienceContext] = await Promise.all([
            this.getRAGContext(query),
            this.getMemoryContext(query),
            this.getRulesContext(),
            this.getExperienceContext()
        ]);

        // Calculate total tokens
        const totalEstimatedTokens =
            this.estimateTokens(ragContext) +
            this.estimateTokens(memoryContext) +
            this.estimateTokens(rulesContext) +
            this.estimateTokens(experienceContext);

        return {
            ragContext,
            memoryContext,
            rulesContext,
            experienceContext,
            totalEstimatedTokens
        };
    }

    /**
     * Get RAG context with token budget
     */
    private async getRAGContext(query: string): Promise<string> {
        try {
            const context = await ragService.retrieve(query, 3);
            return this.trimToTokenBudget(context, this.config.maxSemanticTokens / 2);
        } catch (e) {
            console.warn("[MemoryOrchestrator] RAG retrieval failed:", e);
            return "";
        }
    }

    /**
     * Get training memory context (facts, preferences, goals)
     */
    private getMemoryContext(query: string): string {
        try {
            const context = trainingService.getContext(query);
            return this.trimToTokenBudget(context, this.config.maxSemanticTokens / 2);
        } catch (e) {
            console.warn("[MemoryOrchestrator] Memory retrieval failed:", e);
            return "";
        }
    }

    /**
     * Get active rules (procedural memory)
     */
    private getRulesContext(): string {
        try {
            const profile = trainingService.getProfile();
            const rules = profile.rules?.filter(r => r.isActive) || [];

            if (rules.length === 0) return "";

            const rulesText = rules
                .map(r => `[${r.triggerContext.toUpperCase()}] ${r.rule}`)
                .join("\n");

            return this.trimToTokenBudget(
                `BEHAVIORAL RULES:\n${rulesText}`,
                this.config.maxProceduralTokens
            );
        } catch (e) {
            console.warn("[MemoryOrchestrator] Rules retrieval failed:", e);
            return "";
        }
    }

    /**
     * Get recent experiences (episodic memory)
     */
    private getExperienceContext(): string {
        try {
            const profile = trainingService.getProfile();
            const experiences = profile.experiences?.slice(0, 3) || []; // Last 3

            if (experiences.length === 0) return "";

            const expText = experiences
                .map(e => `- ${new Date(e.timestamp).toLocaleDateString()}: ${e.summary}`)
                .join("\n");

            return this.trimToTokenBudget(
                `RECENT HISTORY:\n${expText}`,
                this.config.maxContextTokens
            );
        } catch (e) {
            console.warn("[MemoryOrchestrator] Experience retrieval failed:", e);
            return "";
        }
    }

    /**
     * Estimate tokens for a string (4 chars per token approximation)
     */
    private estimateTokens(text: string): number {
        return Math.ceil(text.length / 4);
    }

    /**
     * Trim text to fit within token budget
     */
    private trimToTokenBudget(text: string, maxTokens: number): string {
        const currentTokens = this.estimateTokens(text);

        if (currentTokens <= maxTokens) return text;

        // Trim to approximate character limit
        const maxChars = maxTokens * 4;
        const trimmed = text.substring(0, maxChars);

        // Try to cut at a newline for cleaner output
        const lastNewline = trimmed.lastIndexOf("\n");
        if (lastNewline > maxChars * 0.7) {
            return trimmed.substring(0, lastNewline) + "\n[...truncated]";
        }

        return trimmed + "[...truncated]";
    }

    /**
     * Build combined context string for AI
     */
    async buildContext(query: string): Promise<string> {
        const result = await this.retrieve(query);

        const sections: string[] = [];

        if (result.ragContext) {
            sections.push(`KNOWLEDGE BASE:\n${result.ragContext}`);
        }

        if (result.memoryContext) {
            sections.push(`USER MEMORY:\n${result.memoryContext}`);
        }

        if (result.rulesContext) {
            sections.push(result.rulesContext);
        }

        if (result.experienceContext) {
            sections.push(result.experienceContext);
        }

        console.log(`[MemoryOrchestrator] Built context: ~${result.totalEstimatedTokens} tokens`);

        return sections.join("\n\n");
    }

    /**
     * Invalidate caches when memory changes
     */
    invalidateCaches(): void {
        cacheService.invalidateRetrievals();
    }

    /**
     * Update configuration
     */
    updateConfig(config: Partial<MemoryConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Get current configuration
     */
    getConfig(): MemoryConfig {
        return { ...this.config };
    }

    /**
     * Get statistics
     */
    getStats(): { cacheStats: ReturnType<typeof cacheService.getStats>; config: MemoryConfig } {
        return {
            cacheStats: cacheService.getStats(),
            config: this.config
        };
    }
}

export const memoryOrchestrator = new MemoryOrchestrator();
