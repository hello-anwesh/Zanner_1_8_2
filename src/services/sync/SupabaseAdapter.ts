/**
 * Supabase Backend Adapter
 * Connect to Supabase for cloud sync (Premium feature)
 * 
 * SETUP REQUIRED:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Set up the database tables matching your schema
 * 3. Add your Supabase URL and anon key below
 * 4. Enable Row Level Security (RLS) for user isolation
 */

import { SyncBackendAdapter } from "./SyncService";

// TODO: Replace with your Supabase credentials
const SUPABASE_URL = "";  // e.g., "https://xxxxx.supabase.co"
const SUPABASE_ANON_KEY = ""; // Your anon/public key

interface SupabaseConfig {
    url: string;
    anonKey: string;
    userId?: string;
}

class SupabaseAdapter implements SyncBackendAdapter {
    private config: SupabaseConfig;
    private headers: Record<string, string>;

    constructor(config?: Partial<SupabaseConfig>) {
        this.config = {
            url: config?.url || SUPABASE_URL,
            anonKey: config?.anonKey || SUPABASE_ANON_KEY,
            userId: config?.userId
        };

        this.headers = {
            "apikey": this.config.anonKey,
            "Authorization": `Bearer ${this.config.anonKey}`,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        };
    }

    /**
     * Set user session (call after authentication)
     */
    setSession(accessToken: string, userId: string): void {
        this.config.userId = userId;
        this.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    /**
     * Check if properly configured
     */
    isConfigured(): boolean {
        return !!(this.config.url && this.config.anonKey);
    }

    /**
     * Make API request to Supabase
     */
    private async request(
        method: string,
        table: string,
        options: {
            body?: any;
            query?: Record<string, string>;
        } = {}
    ): Promise<any> {
        if (!this.isConfigured()) {
            throw new Error("Supabase not configured. Please set URL and anon key.");
        }

        let url = `${this.config.url}/rest/v1/${table}`;

        if (options.query) {
            const params = new URLSearchParams(options.query);
            url += `?${params.toString()}`;
        }

        const response = await fetch(url, {
            method,
            headers: this.headers,
            body: options.body ? JSON.stringify(options.body) : undefined
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Supabase error: ${response.status} - ${error}`);
        }

        const text = await response.text();
        return text ? JSON.parse(text) : null;
    }

    /**
     * Create a new record
     */
    async create(table: string, data: any): Promise<any> {
        const record = {
            ...data,
            user_id: this.config.userId,
            is_synced: true,
            updated_at: Date.now()
        };

        const result = await this.request("POST", table, { body: record });
        return result?.[0];
    }

    /**
     * Update an existing record
     */
    async update(table: string, id: string, data: any): Promise<any> {
        const record = {
            ...data,
            is_synced: true,
            updated_at: Date.now()
        };

        const result = await this.request("PATCH", table, {
            body: record,
            query: { id: `eq.${id}` }
        });

        return result?.[0];
    }

    /**
     * Delete a record (soft delete)
     */
    async delete(table: string, id: string): Promise<void> {
        await this.request("PATCH", table, {
            body: { deleted_at: Date.now(), is_synced: true },
            query: { id: `eq.${id}` }
        });
    }

    /**
     * Get changes since a timestamp
     */
    async getChangesSince(table: string, timestamp: number): Promise<any[]> {
        if (!this.config.userId) {
            return [];
        }

        const result = await this.request("GET", table, {
            query: {
                user_id: `eq.${this.config.userId}`,
                updated_at: `gt.${timestamp}`,
                order: "updated_at.asc"
            }
        });

        return result || [];
    }

    /**
     * Get a local record by ID
     * Note: This reads from Supabase, for true local storage
     * you should implement IndexedDB or SQLite reads
     */
    async getLocal(table: string, id: string): Promise<any | null> {
        // In a real implementation, this would read from local SQLite/IndexedDB
        // For now, we return null to indicate no local record
        console.log(`[SupabaseAdapter] getLocal called for ${table}/${id} - implement local storage`);
        return null;
    }

    /**
     * Apply remote data to local storage
     * Note: In real implementation, this would write to SQLite/IndexedDB
     */
    async applyLocal(table: string, data: any): Promise<void> {
        // In a real implementation, this would write to local SQLite/IndexedDB
        console.log(`[SupabaseAdapter] applyLocal called for ${table} - implement local storage`);

        // For now, we'll store in localStorage as a simple cache
        const key = `zenner_sync_cache_${table}`;
        const cache = JSON.parse(localStorage.getItem(key) || "{}");
        cache[data.id] = data;
        localStorage.setItem(key, JSON.stringify(cache));
    }

    /**
     * Authenticate user (email/password)
     */
    async signIn(email: string, password: string): Promise<{ success: boolean; userId?: string; error?: string }> {
        try {
            const response = await fetch(`${this.config.url}/auth/v1/token?grant_type=password`, {
                method: "POST",
                headers: {
                    "apikey": this.config.anonKey,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const error = await response.json();
                return { success: false, error: error.error_description || "Authentication failed" };
            }

            const data = await response.json();
            this.setSession(data.access_token, data.user.id);

            return { success: true, userId: data.user.id };
        } catch (e) {
            return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
        }
    }

    /**
     * Sign up new user
     */
    async signUp(email: string, password: string): Promise<{ success: boolean; userId?: string; error?: string }> {
        try {
            const response = await fetch(`${this.config.url}/auth/v1/signup`, {
                method: "POST",
                headers: {
                    "apikey": this.config.anonKey,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const error = await response.json();
                return { success: false, error: error.error_description || "Sign up failed" };
            }

            const data = await response.json();
            return { success: true, userId: data.user?.id };
        } catch (e) {
            return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
        }
    }

    /**
     * Sign out
     */
    async signOut(): Promise<void> {
        this.config.userId = undefined;
        this.headers["Authorization"] = `Bearer ${this.config.anonKey}`;
    }
}

// Export singleton instance
export const supabaseAdapter = new SupabaseAdapter();

// Export class for custom configuration
export { SupabaseAdapter };
