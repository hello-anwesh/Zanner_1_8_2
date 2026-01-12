/**
 * Cache Service
 * LRU cache for embeddings and retrieval results
 * Reduces API calls for repeated queries
 */

interface CacheEntry<T> {
    value: T;
    timestamp: number;
    accessCount: number;
}

class CacheService {
    private embeddingCache = new Map<string, CacheEntry<number[]>>();
    private retrievalCache = new Map<string, CacheEntry<string>>();

    private readonly MAX_CACHE_SIZE = 100;
    private readonly EMBEDDING_TTL = 30 * 60 * 1000; // 30 minutes
    private readonly RETRIEVAL_TTL = 5 * 60 * 1000;  // 5 minutes

    // Stats for monitoring
    private stats = {
        embeddingHits: 0,
        embeddingMisses: 0,
        retrievalHits: 0,
        retrievalMisses: 0
    };

    /**
     * Get cached embedding for a query
     */
    getEmbedding(query: string): number[] | null {
        const normalized = this.normalizeQuery(query);
        const entry = this.embeddingCache.get(normalized);

        if (!entry) {
            this.stats.embeddingMisses++;
            return null;
        }

        // Check if expired
        if (Date.now() - entry.timestamp > this.EMBEDDING_TTL) {
            this.embeddingCache.delete(normalized);
            this.stats.embeddingMisses++;
            return null;
        }

        // Update access count
        entry.accessCount++;
        this.stats.embeddingHits++;
        return entry.value;
    }

    /**
     * Cache an embedding
     */
    setEmbedding(query: string, embedding: number[]): void {
        const normalized = this.normalizeQuery(query);

        // Evict if at capacity
        if (this.embeddingCache.size >= this.MAX_CACHE_SIZE) {
            this.evictLRU(this.embeddingCache);
        }

        this.embeddingCache.set(normalized, {
            value: embedding,
            timestamp: Date.now(),
            accessCount: 1
        });
    }

    /**
     * Get cached retrieval result
     */
    getRetrieval(query: string): string | null {
        const normalized = this.normalizeQuery(query);
        const entry = this.retrievalCache.get(normalized);

        if (!entry) {
            this.stats.retrievalMisses++;
            return null;
        }

        // Check if expired
        if (Date.now() - entry.timestamp > this.RETRIEVAL_TTL) {
            this.retrievalCache.delete(normalized);
            this.stats.retrievalMisses++;
            return null;
        }

        // Update access count
        entry.accessCount++;
        this.stats.retrievalHits++;
        return entry.value;
    }

    /**
     * Cache a retrieval result
     */
    setRetrieval(query: string, result: string): void {
        const normalized = this.normalizeQuery(query);

        // Evict if at capacity
        if (this.retrievalCache.size >= this.MAX_CACHE_SIZE) {
            this.evictLRU(this.retrievalCache);
        }

        this.retrievalCache.set(normalized, {
            value: result,
            timestamp: Date.now(),
            accessCount: 1
        });
    }

    /**
     * Normalize query for cache key
     * Trims, lowercases, and removes extra whitespace
     */
    private normalizeQuery(query: string): string {
        return query.trim().toLowerCase().replace(/\s+/g, ' ');
    }

    /**
     * Evict least recently used entry
     */
    private evictLRU<T>(cache: Map<string, CacheEntry<T>>): void {
        let lruKey: string | null = null;
        let lruTime = Infinity;

        cache.forEach((entry, key) => {
            // Consider both timestamp and access count
            const score = entry.timestamp + (entry.accessCount * 60000); // Each access adds 1 min
            if (score < lruTime) {
                lruTime = score;
                lruKey = key;
            }
        });

        if (lruKey) {
            cache.delete(lruKey);
        }
    }

    /**
     * Get cache statistics
     */
    getStats(): {
        embeddingHitRate: number;
        retrievalHitRate: number;
        embeddingCacheSize: number;
        retrievalCacheSize: number;
    } {
        const embeddingTotal = this.stats.embeddingHits + this.stats.embeddingMisses;
        const retrievalTotal = this.stats.retrievalHits + this.stats.retrievalMisses;

        return {
            embeddingHitRate: embeddingTotal > 0 ? this.stats.embeddingHits / embeddingTotal : 0,
            retrievalHitRate: retrievalTotal > 0 ? this.stats.retrievalHits / retrievalTotal : 0,
            embeddingCacheSize: this.embeddingCache.size,
            retrievalCacheSize: this.retrievalCache.size
        };
    }

    /**
     * Clear all caches
     */
    clear(): void {
        this.embeddingCache.clear();
        this.retrievalCache.clear();
        this.stats = {
            embeddingHits: 0,
            embeddingMisses: 0,
            retrievalHits: 0,
            retrievalMisses: 0
        };
    }

    /**
     * Invalidate caches (e.g., when new data is added)
     */
    invalidateRetrievals(): void {
        this.retrievalCache.clear();
    }
}

export const cacheService = new CacheService();
