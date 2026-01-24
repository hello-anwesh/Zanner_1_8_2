/**
 * BYOK (Bring Your Own Key) Service
 * Manages user's own API keys stored locally in SQLite
 * Keys are encrypted at rest and never sent to our servers
 */

import { databaseService } from '../db/DatabaseService';

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'groq' | 'ollama';

export interface BYOKKey {
    id: string;
    provider: AIProvider;
    displayName: string; // Masked key for UI, e.g., "sk-...abc"
    isValid: boolean;
    lastValidatedAt: number | null;
    createdAt: number;
    updatedAt: number;
}

interface BYOKKeyRow {
    id: string;
    provider: string;
    api_key_encrypted: string;
    display_name: string | null;
    is_valid: number;
    last_validated_at: number | null;
    created_at: number;
    updated_at: number;
}

// Provider validation endpoints
const PROVIDER_VALIDATION: Record<AIProvider, {
    testEndpoint: string;
    authHeader: string;
    authPrefix?: string;
}> = {
    openai: {
        testEndpoint: 'https://api.openai.com/v1/models',
        authHeader: 'Authorization',
        authPrefix: 'Bearer ',
    },
    anthropic: {
        testEndpoint: 'https://api.anthropic.com/v1/messages',
        authHeader: 'x-api-key',
    },
    google: {
        testEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
        authHeader: 'x-goog-api-key',
    },
    groq: {
        testEndpoint: 'https://api.groq.com/openai/v1/models',
        authHeader: 'Authorization',
        authPrefix: 'Bearer ',
    },
    ollama: {
        testEndpoint: 'http://localhost:11434/api/tags',
        authHeader: '', // No auth needed
    },
};

class BYOKService {
    private encryptionKey: string | null = null;

    /**
     * Initialize encryption key derived from device/app
     * In production, use Tauri's secure storage or keychain
     */
    private getEncryptionKey(): string {
        if (this.encryptionKey) return this.encryptionKey;

        // For now, use a static key (NOT SECURE for production)
        // TODO: Use Tauri's secure storage or derive from device ID
        this.encryptionKey = 'zenner-byok-local-key-2026';
        return this.encryptionKey;
    }

    /**
     * Simple XOR encryption for local storage
     * In production, use AES-256-GCM via Tauri's crypto APIs
     */
    private encrypt(plaintext: string): string {
        const key = this.getEncryptionKey();
        let result = '';
        for (let i = 0; i < plaintext.length; i++) {
            result += String.fromCharCode(
                plaintext.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }
        return btoa(result); // Base64 encode
    }

    private decrypt(ciphertext: string): string {
        const key = this.getEncryptionKey();
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
     * Create a masked display name for a key
     */
    private maskKey(apiKey: string): string {
        if (!apiKey || apiKey.length < 8) return '••••••••';
        const prefix = apiKey.slice(0, 4);
        const suffix = apiKey.slice(-4);
        return `${prefix}...${suffix}`;
    }

    /**
     * Generate a unique ID
     */
    private generateId(): string {
        return 'byok_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    /**
     * Save or update a BYOK key
     */
    async saveKey(provider: AIProvider, apiKey: string): Promise<BYOKKey> {
        const db = await databaseService.getDb();
        const encrypted = this.encrypt(apiKey);
        const displayName = this.maskKey(apiKey);
        const now = Date.now();

        // Check if key already exists for this provider
        const existing: BYOKKeyRow[] = await db.select(
            'SELECT id FROM byok_keys WHERE provider = $1',
            [provider]
        );

        if (existing.length > 0) {
            // Update existing
            await db.execute(
                `UPDATE byok_keys 
                 SET api_key_encrypted = $1, display_name = $2, is_valid = 0, updated_at = $3 
                 WHERE provider = $4`,
                [encrypted, displayName, now, provider]
            );

            return {
                id: existing[0].id,
                provider,
                displayName,
                isValid: false, // Will need re-validation
                lastValidatedAt: null,
                createdAt: now,
                updatedAt: now,
            };
        } else {
            // Insert new
            const id = this.generateId();
            await db.execute(
                `INSERT INTO byok_keys (id, provider, api_key_encrypted, display_name, is_valid, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, 0, $5, $5)`,
                [id, provider, encrypted, displayName, now]
            );

            return {
                id,
                provider,
                displayName,
                isValid: false,
                lastValidatedAt: null,
                createdAt: now,
                updatedAt: now,
            };
        }
    }

    /**
     * Get decrypted API key for a provider
     */
    async getKey(provider: AIProvider): Promise<string | null> {
        const db = await databaseService.getDb();
        const rows: BYOKKeyRow[] = await db.select(
            'SELECT api_key_encrypted FROM byok_keys WHERE provider = $1',
            [provider]
        );

        if (rows.length === 0) return null;

        try {
            return this.decrypt(rows[0].api_key_encrypted);
        } catch {
            return null;
        }
    }

    /**
     * Check if a provider has a configured key
     */
    async hasKey(provider: AIProvider): Promise<boolean> {
        const db = await databaseService.getDb();
        const rows: BYOKKeyRow[] = await db.select(
            'SELECT id FROM byok_keys WHERE provider = $1',
            [provider]
        );
        return rows.length > 0;
    }

    /**
     * List all configured BYOK keys (without exposing actual keys)
     */
    async listKeys(): Promise<BYOKKey[]> {
        const db = await databaseService.getDb();
        const rows: BYOKKeyRow[] = await db.select(
            'SELECT * FROM byok_keys ORDER BY provider'
        );

        return rows.map(row => ({
            id: row.id,
            provider: row.provider as AIProvider,
            displayName: row.display_name || '••••••••',
            isValid: row.is_valid === 1,
            lastValidatedAt: row.last_validated_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        }));
    }

    /**
     * Delete a BYOK key
     */
    async deleteKey(provider: AIProvider): Promise<void> {
        const db = await databaseService.getDb();
        await db.execute('DELETE FROM byok_keys WHERE provider = $1', [provider]);
    }

    /**
     * Validate a provider's API key
     */
    async validateKey(provider: AIProvider): Promise<{ valid: boolean; error?: string }> {
        const apiKey = await this.getKey(provider);
        if (!apiKey) {
            return { valid: false, error: 'No key configured' };
        }

        const config = PROVIDER_VALIDATION[provider];
        if (!config) {
            return { valid: false, error: 'Unknown provider' };
        }

        try {
            // Ollama doesn't need auth
            if (provider === 'ollama') {
                const response = await fetch(config.testEndpoint, {
                    method: 'GET',
                    signal: AbortSignal.timeout(5000),
                });
                const valid = response.ok;
                await this.updateValidationStatus(provider, valid, valid ? undefined : 'Ollama not running');
                return { valid, error: valid ? undefined : 'Ollama not running or not accessible' };
            }

            // Other providers need auth header
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            if (config.authHeader) {
                headers[config.authHeader] = (config.authPrefix || '') + apiKey;
            }

            // For Anthropic, we need to send a minimal request, not just check models
            if (provider === 'anthropic') {
                headers['anthropic-version'] = '2023-06-01';
                // Try to get a validation error rather than making an actual request
                const response = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        model: 'claude-3-haiku-20240307',
                        max_tokens: 1,
                        messages: [{ role: 'user', content: 'hi' }],
                    }),
                    signal: AbortSignal.timeout(10000),
                });

                // 200 = valid, 401 = invalid key, anything else = valid key but other issue
                const valid = response.status !== 401;
                await this.updateValidationStatus(provider, valid, valid ? undefined : 'Invalid API key');
                return { valid, error: valid ? undefined : 'Invalid API key' };
            }

            // For OpenAI, Google, Groq - just hit the models endpoint
            const response = await fetch(config.testEndpoint, {
                method: 'GET',
                headers,
                signal: AbortSignal.timeout(5000),
            });

            const valid = response.ok;
            await this.updateValidationStatus(provider, valid, valid ? undefined : `HTTP ${response.status}`);
            return { valid, error: valid ? undefined : `Validation failed: HTTP ${response.status}` };
        } catch (error: any) {
            const errorMsg = error.message || 'Connection failed';
            await this.updateValidationStatus(provider, false, errorMsg);
            return { valid: false, error: errorMsg };
        }
    }

    /**
     * Update validation status in database
     */
    private async updateValidationStatus(provider: AIProvider, valid: boolean, _error?: string): Promise<void> {
        const db = await databaseService.getDb();
        const now = Date.now();
        await db.execute(
            'UPDATE byok_keys SET is_valid = $1, last_validated_at = $2, updated_at = $3 WHERE provider = $4',
            [valid ? 1 : 0, now, now, provider]
        );
    }

    /**
     * Get AI settings
     */
    async getSetting(key: string): Promise<string | null> {
        const db = await databaseService.getDb();
        const rows: { value: string }[] = await db.select(
            'SELECT value FROM ai_settings WHERE key = $1',
            [key]
        );
        return rows.length > 0 ? rows[0].value : null;
    }

    /**
     * Set AI setting
     */
    async setSetting(key: string, value: string): Promise<void> {
        const db = await databaseService.getDb();
        await db.execute(
            `INSERT INTO ai_settings (key, value, updated_at) 
             VALUES ($1, $2, $3) 
             ON CONFLICT(key) DO UPDATE SET value = $2, updated_at = $3`,
            [key, value, Date.now()]
        );
    }

    /**
     * Get current AI mode
     */
    async getMode(): Promise<'backend' | 'byok'> {
        const mode = await this.getSetting('ai_mode');
        return mode === 'backend' ? 'backend' : 'byok';
    }

    /**
     * Set AI mode
     */
    async setMode(mode: 'backend' | 'byok'): Promise<void> {
        await this.setSetting('ai_mode', mode);
    }
}

export const byokService = new BYOKService();
