/**
 * Memory Analytics Service
 * Tracks usage patterns, costs, and memory growth
 * Powers the analytics dashboard (Premium feature)
 */

import { aiService } from "./AIService";
import { cacheService } from "./CacheService";
import { conversationManager } from "./ConversationManager";
import { trainingService } from "../training/TrainingService";

interface DailyStats {
    date: string; // YYYY-MM-DD
    messagesCount: number;
    tokensUsed: number;
    memoryItemsAdded: number;
    cacheHits: number;
    cacheMisses: number;
    avgResponseTime: number;
    responseTimes: number[]; // For calculating avg
}

interface CostEstimate {
    provider: string;
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
}

const STORAGE_KEY = "zenner_memory_analytics";
const PROVIDER_COSTS: Record<string, { input: number; output: number }> = {
    gemini: { input: 0.00015, output: 0.0006 }, // per 1K tokens
    openai: { input: 0.0025, output: 0.01 },    // GPT-4
    claude: { input: 0.003, output: 0.015 },    // Claude 3
    ollama: { input: 0, output: 0 }              // Local, free
};

class MemoryAnalyticsService {
    private stats: Map<string, DailyStats> = new Map();
    private sessionStart = Date.now();
    private messageStartTime = 0;

    constructor() {
        this.loadStats();
    }

    /**
     * Load stats from storage
     */
    private loadStats(): void {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.stats = new Map(Object.entries(parsed));
            }
        } catch (e) {
            console.warn("[Analytics] Failed to load stats:", e);
        }
    }

    /**
     * Save stats to storage
     */
    private saveStats(): void {
        try {
            const obj = Object.fromEntries(this.stats);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
        } catch (e) {
            console.warn("[Analytics] Failed to save stats:", e);
        }
    }

    /**
     * Get today's date key
     */
    private getDateKey(): string {
        return new Date().toISOString().split("T")[0];
    }

    /**
     * Get or create today's stats
     */
    private getTodayStats(): DailyStats {
        const key = this.getDateKey();
        if (!this.stats.has(key)) {
            this.stats.set(key, {
                date: key,
                messagesCount: 0,
                tokensUsed: 0,
                memoryItemsAdded: 0,
                cacheHits: 0,
                cacheMisses: 0,
                avgResponseTime: 0,
                responseTimes: []
            });
        }
        return this.stats.get(key)!;
    }

    /**
     * Start timing a message (call before AI request)
     */
    startMessage(): void {
        this.messageStartTime = Date.now();
    }

    /**
     * Record a completed message
     */
    recordMessage(tokensUsed: number): void {
        const stats = this.getTodayStats();
        stats.messagesCount++;
        stats.tokensUsed += tokensUsed;

        // Calculate response time
        if (this.messageStartTime > 0) {
            const responseTime = Date.now() - this.messageStartTime;
            stats.responseTimes.push(responseTime);
            stats.avgResponseTime =
                stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length;
            this.messageStartTime = 0;
        }

        this.saveStats();
    }

    /**
     * Record memory item addition
     */
    recordMemoryItem(): void {
        const stats = this.getTodayStats();
        stats.memoryItemsAdded++;
        this.saveStats();
    }

    /**
     * Update cache stats
     */
    updateCacheStats(): void {
        const cacheStats = cacheService.getStats();
        const stats = this.getTodayStats();

        // These are cumulative, so we track deltas
        const embeddingTotal = Math.round(
            cacheStats.embeddingHitRate * stats.messagesCount +
            (1 - cacheStats.embeddingHitRate) * stats.messagesCount
        );
        stats.cacheHits = Math.round(cacheStats.embeddingHitRate * embeddingTotal);
        stats.cacheMisses = embeddingTotal - stats.cacheHits;

        this.saveStats();
    }

    /**
     * Get summary for dashboard
     */
    getSummary(): {
        today: DailyStats;
        thisWeek: { messages: number; tokens: number; avgResponseTime: number };
        thisMonth: { messages: number; tokens: number; memoryGrowth: number };
        costEstimate: CostEstimate;
    } {
        const today = this.getTodayStats();

        // Calculate weekly stats
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        let weekMessages = 0, weekTokens = 0, weekResponseTimes: number[] = [];

        this.stats.forEach((stat, date) => {
            if (new Date(date) >= weekAgo) {
                weekMessages += stat.messagesCount;
                weekTokens += stat.tokensUsed;
                weekResponseTimes.push(...stat.responseTimes);
            }
        });

        // Calculate monthly stats
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        let monthMessages = 0, monthTokens = 0, monthMemory = 0;

        this.stats.forEach((stat, date) => {
            if (new Date(date) >= monthAgo) {
                monthMessages += stat.messagesCount;
                monthTokens += stat.tokensUsed;
                monthMemory += stat.memoryItemsAdded;
            }
        });

        // Cost estimate
        const config = aiService.getConfig();
        const provider = config.activeProvider || "gemini";
        const costs = PROVIDER_COSTS[provider] || PROVIDER_COSTS.gemini;

        const estimatedCost =
            (monthTokens * 0.6 * costs.input / 1000) + // ~60% input
            (monthTokens * 0.4 * costs.output / 1000);  // ~40% output

        return {
            today,
            thisWeek: {
                messages: weekMessages,
                tokens: weekTokens,
                avgResponseTime: weekResponseTimes.length > 0
                    ? weekResponseTimes.reduce((a, b) => a + b, 0) / weekResponseTimes.length
                    : 0
            },
            thisMonth: {
                messages: monthMessages,
                tokens: monthTokens,
                memoryGrowth: monthMemory
            },
            costEstimate: {
                provider,
                inputTokens: Math.round(monthTokens * 0.6),
                outputTokens: Math.round(monthTokens * 0.4),
                estimatedCost: Math.round(estimatedCost * 100) / 100
            }
        };
    }

    /**
     * Get historical data for charts
     */
    getChartData(days: number = 7): {
        dates: string[];
        messages: number[];
        tokens: number[];
        responseTime: number[];
    } {
        const result = {
            dates: [] as string[],
            messages: [] as number[],
            tokens: [] as number[],
            responseTime: [] as number[]
        };

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const key = date.toISOString().split("T")[0];

            const stat = this.stats.get(key);

            result.dates.push(date.toLocaleDateString("en-US", { weekday: "short" }));
            result.messages.push(stat?.messagesCount || 0);
            result.tokens.push(stat?.tokensUsed || 0);
            result.responseTime.push(stat?.avgResponseTime || 0);
        }

        return result;
    }

    /**
     * Get memory breakdown
     */
    getMemoryBreakdown(): {
        facts: number;
        preferences: number;
        rules: number;
        experiences: number;
        conversations: number;
        summaries: number;
    } {
        const profile = trainingService.getProfile();
        const convStats = conversationManager.getStats();

        return {
            facts: profile.knowledgeBase?.filter(k => k.category === "fact").length || 0,
            preferences: profile.knowledgeBase?.filter(k => k.category === "preference").length || 0,
            rules: profile.rules?.length || 0,
            experiences: profile.experiences?.length || 0,
            conversations: convStats.messageCount,
            summaries: convStats.summaryCount
        };
    }

    /**
     * Get session duration
     */
    getSessionDuration(): number {
        return Date.now() - this.sessionStart;
    }

    /**
     * Clear all analytics data
     */
    clear(): void {
        this.stats.clear();
        localStorage.removeItem(STORAGE_KEY);
    }

    /**
     * Export data for backup
     */
    export(): string {
        return JSON.stringify({
            stats: Object.fromEntries(this.stats),
            exportedAt: new Date().toISOString()
        }, null, 2);
    }
}

export const memoryAnalyticsService = new MemoryAnalyticsService();
