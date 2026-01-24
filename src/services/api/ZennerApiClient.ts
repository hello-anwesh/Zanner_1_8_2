/**
 * Zenner API Client
 * Connects desktop app to the license server for backend AI mode
 */

import { databaseService } from '../db/DatabaseService';

interface ZennerAuthData {
    api_key: string;
    user_id: string;
    user_email: string;
    user_plan: string;
    tokens_balance: number;
    expires_at: number;
}

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface ChatResponse {
    id: string;
    model: string;
    choices: {
        index: number;
        message: ChatMessage;
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

interface TokenBalance {
    balance: number;
    used_today: number;
    used_this_month: number;
    daily_limit: number;
}

interface ZennerAuthRow {
    id: string;
    api_key_encrypted: string | null;
    user_id: string | null;
    user_email: string | null;
    user_plan: string | null;
    tokens_balance: number;
    tokens_used_today: number;
    expires_at: number | null;
    updated_at: number;
}

class ZennerApiClient {
    private serverUrl: string = import.meta.env.VITE_ZENNER_SERVER_URL || 'http://localhost:3000';
    private cachedAuth: ZennerAuthData | null = null;

    /**
     * Initialize client with server URL from settings
     */
    async init(): Promise<void> {
        const db = await databaseService.getDb();
        const rows: { value: string }[] = await db.select(
            "SELECT value FROM ai_settings WHERE key = 'zenner_server_url'"
        );
        if (rows.length > 0) {
            this.serverUrl = rows[0].value;
        }
    }

    /**
     * Simple encryption for local storage
     */
    private encrypt(plaintext: string): string {
        const key = 'zenner-api-client-2026';
        let result = '';
        for (let i = 0; i < plaintext.length; i++) {
            result += String.fromCharCode(
                plaintext.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }
        return btoa(result);
    }

    private decrypt(ciphertext: string): string {
        const key = 'zenner-api-client-2026';
        const decoded = atob(ciphertext);
        let result = '';
        for (let i = 0; i < decoded.length; i++) {
            result += String.fromCharCode(
                decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }
        return result;
    }

    /**
     * Get authentication headers
     */
    private async getAuthHeaders(): Promise<Record<string, string>> {
        const auth = await this.getStoredAuth();
        if (!auth) {
            throw new Error('Not authenticated with Zenner');
        }

        return {
            'Authorization': `Bearer ${auth.api_key}`,
            'Content-Type': 'application/json',
        };
    }

    /**
     * Get stored authentication data
     */
    async getStoredAuth(): Promise<ZennerAuthData | null> {
        if (this.cachedAuth && this.cachedAuth.expires_at > Date.now()) {
            return this.cachedAuth;
        }

        const db = await databaseService.getDb();
        const rows: ZennerAuthRow[] = await db.select(
            "SELECT * FROM zenner_auth WHERE id = 'default'"
        );

        if (rows.length === 0 || !rows[0].api_key_encrypted) {
            return null;
        }

        const row = rows[0];

        // Check if expired
        if (row.expires_at && row.expires_at < Date.now()) {
            return null;
        }

        try {
            this.cachedAuth = {
                api_key: this.decrypt(row.api_key_encrypted!),
                user_id: row.user_id || '',
                user_email: row.user_email || '',
                user_plan: row.user_plan || 'free',
                tokens_balance: row.tokens_balance || 0,
                expires_at: row.expires_at || 0,
            };
            return this.cachedAuth;
        } catch {
            return null;
        }
    }

    /**
     * Check if authenticated with Zenner
     */
    async isAuthenticated(): Promise<boolean> {
        const auth = await this.getStoredAuth();
        return auth !== null;
    }

    /**
     * Login with email and password
     */
    async login(email: string, password: string, deviceId?: string): Promise<{
        success: boolean;
        error?: string;
        user?: { id: string; email: string; plan: string };
    }> {
        await this.init();

        try {
            const response = await fetch(`${this.serverUrl}/api/v1/auth/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    device_id: deviceId || crypto.randomUUID(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'Login failed' };
            }

            // Store credentials
            const db = await databaseService.getDb();
            const now = Date.now();

            await db.execute(
                `INSERT INTO zenner_auth (id, api_key_encrypted, user_id, user_email, user_plan, tokens_balance, expires_at, updated_at)
                 VALUES ('default', $1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT(id) DO UPDATE SET 
                    api_key_encrypted = $1, user_id = $2, user_email = $3, 
                    user_plan = $4, tokens_balance = $5, expires_at = $6, updated_at = $7`,
                [
                    this.encrypt(data.api_key),
                    data.user.id,
                    data.user.email,
                    data.user.plan,
                    data.tokens?.balance || 0,
                    new Date(data.expires_at).getTime(),
                    now,
                ]
            );

            // Clear cache
            this.cachedAuth = null;

            return {
                success: true,
                user: data.user,
            };
        } catch (error: any) {
            return { success: false, error: error.message || 'Connection failed' };
        }
    }

    /**
     * Logout - clear stored credentials
     */
    async logout(): Promise<void> {
        const db = await databaseService.getDb();
        await db.execute("DELETE FROM zenner_auth WHERE id = 'default'");
        this.cachedAuth = null;
    }

    /**
     * Get token balance
     */
    async getTokenBalance(): Promise<TokenBalance | null> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.serverUrl}/api/v1/usage`, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                return null;
            }

            const data = await response.json();

            // Update local cache
            const db = await databaseService.getDb();
            await db.execute(
                `UPDATE zenner_auth SET tokens_balance = $1, tokens_used_today = $2, updated_at = $3 WHERE id = 'default'`,
                [data.quota?.remaining || 0, data.quota?.used_today || 0, Date.now()]
            );

            return {
                balance: data.quota?.remaining || 0,
                used_today: data.quota?.used_today || 0,
                used_this_month: data.quota?.used_this_month || 0,
                daily_limit: data.quota?.daily_limit || 0,
            };
        } catch (error) {
            console.error('Failed to get token balance:', error);
            return null;
        }
    }

    /**
     * Get available models for user's plan
     */
    async getModels(): Promise<{ id: string; name: string; provider: string }[]> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.serverUrl}/api/v1/models`, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                return [];
            }

            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Failed to get models:', error);
            return [];
        }
    }

    /**
     * Send chat request through backend
     */
    async chat(
        model: string,
        messages: ChatMessage[],
        options?: { temperature?: number; max_tokens?: number }
    ): Promise<ChatResponse> {
        const headers = await this.getAuthHeaders();

        const response = await fetch(`${this.serverUrl}/api/v1/chat/completions`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model,
                messages,
                temperature: options?.temperature ?? 0.7,
                max_tokens: options?.max_tokens ?? 1000,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `Request failed: ${response.status}`);
        }

        const data: ChatResponse = await response.json();

        // Update token usage from headers
        const tokensUsed = response.headers.get('X-Zenner-Tokens-Used');
        const quotaRemaining = response.headers.get('X-Zenner-Quota-Remaining');

        if (tokensUsed || quotaRemaining) {
            const db = await databaseService.getDb();
            await db.execute(
                `UPDATE zenner_auth SET tokens_balance = $1, updated_at = $2 WHERE id = 'default'`,
                [parseInt(quotaRemaining || '0'), Date.now()]
            );
        }

        return data;
    }

    /**
     * Get user info
     */
    async getUserInfo(): Promise<{ id: string; email: string; plan: string } | null> {
        const auth = await this.getStoredAuth();
        if (!auth) return null;

        return {
            id: auth.user_id,
            email: auth.user_email,
            plan: auth.user_plan,
        };
    }

    /**
     * Get server URL
     */
    getServerUrl(): string {
        return this.serverUrl;
    }

    /**
     * Set server URL (for dev/testing)
     */
    async setServerUrl(url: string): Promise<void> {
        this.serverUrl = url;
        const db = await databaseService.getDb();
        await db.execute(
            `INSERT INTO ai_settings (key, value, updated_at) 
             VALUES ('zenner_server_url', $1, $2) 
             ON CONFLICT(key) DO UPDATE SET value = $1, updated_at = $2`,
            [url, Date.now()]
        );
    }

    /**
     * Get active persona and available personas for the user's plan
     */
    async getPersona(): Promise<{
        active_persona: any;
        available_personas: Array<{
            id: string;
            name: string;
            display_name: string;
            avatar_emoji: string;
            description: string;
            is_default_for_plan: boolean;
        }>;
        user_plan: string;
    } | null> {
        const auth = await this.getStoredAuth();
        if (!auth) return null;

        try {
            const response = await fetch(`${this.serverUrl}/api/v1/persona`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${auth.api_key}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.error('Failed to fetch persona:', response.status);
                return null;
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching persona:', error);
            return null;
        }
    }

    /**
     * Select a persona for the user
     */
    async selectPersona(personaId: string, customName?: string): Promise<any | null> {
        const auth = await this.getStoredAuth();
        if (!auth) return null;

        try {
            const response = await fetch(`${this.serverUrl}/api/v1/persona`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${auth.api_key}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    persona_id: personaId,
                    custom_name: customName,
                }),
            });

            if (!response.ok) {
                console.error('Failed to select persona:', response.status);
                return null;
            }

            const data = await response.json();
            return data.persona;
        } catch (error) {
            console.error('Error selecting persona:', error);
            return null;
        }
    }
}

export const zennerApiClient = new ZennerApiClient();
export type { ChatMessage, ChatResponse, TokenBalance };
