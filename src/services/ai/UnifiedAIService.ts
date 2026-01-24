/**
 * Unified AI Service
 * Routes AI requests to either BYOK (direct to provider) or Backend (through license server)
 * Provides seamless fallback when BYOK key is missing
 */

import { byokService, type AIProvider } from './BYOKService';
import { zennerApiClient, type ChatMessage, type ChatResponse } from '../api/ZennerApiClient';

export type AIMode = 'backend' | 'byok';

export interface UnifiedChatOptions {
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
}

export interface UnifiedChatResult {
    success: boolean;
    content: string;
    model: string;
    provider: string;
    mode: AIMode;
    tokensUsed?: number;
    error?: string;
}

// Map model IDs to their providers
const MODEL_PROVIDER_MAP: Record<string, AIProvider> = {
    // OpenAI
    'gpt-4': 'openai',
    'gpt-4-turbo': 'openai',
    'gpt-4o': 'openai',
    'gpt-4o-mini': 'openai',
    'gpt-3.5-turbo': 'openai',
    // Anthropic
    'claude-3-opus': 'anthropic',
    'claude-3-sonnet': 'anthropic',
    'claude-3-haiku': 'anthropic',
    'claude-3-5-sonnet': 'anthropic',
    'claude-3-5-haiku': 'anthropic',
    // Google
    'gemini-pro': 'google',
    'gemini-1.5-pro': 'google',
    'gemini-1.5-flash': 'google',
    'gemini-2.0-flash': 'google',
    // Groq
    'llama-3-70b': 'groq',
    'llama-3-8b': 'groq',
    'mixtral-8x7b': 'groq',
    // Ollama (local)
    'llama3': 'ollama',
    'llama3.2': 'ollama',
    'mistral': 'ollama',
    'codellama': 'ollama',
    'phi3': 'ollama',
    'qwen2': 'ollama',
};

class UnifiedAIService {
    private mode: AIMode = 'byok';
    private initialized = false;
    private listeners: (() => void)[] = [];

    /**
     * Initialize the service and load mode from settings
     */
    async init(): Promise<void> {
        if (this.initialized) return;

        this.mode = await byokService.getMode();
        await zennerApiClient.init();
        this.initialized = true;
    }

    /**
     * Get current AI mode
     */
    getMode(): AIMode {
        return this.mode;
    }

    /**
     * Set AI mode
     */
    async setMode(mode: AIMode): Promise<void> {
        this.mode = mode;
        await byokService.setMode(mode);
        this.notifyListeners();
    }

    /**
     * Get the provider for a model
     */
    getProviderForModel(model: string): AIProvider {
        // Check exact match
        if (MODEL_PROVIDER_MAP[model]) {
            return MODEL_PROVIDER_MAP[model];
        }

        // Check prefix match
        for (const [key, provider] of Object.entries(MODEL_PROVIDER_MAP)) {
            if (model.startsWith(key)) {
                return provider;
            }
        }

        // Default to ollama for local models
        return 'ollama';
    }

    /**
     * Check if backend mode is available (authenticated)
     */
    async isBackendAvailable(): Promise<boolean> {
        return zennerApiClient.isAuthenticated();
    }

    /**
     * Check if BYOK mode is available for a specific model
     */
    async isByokAvailable(model: string): Promise<boolean> {
        const provider = this.getProviderForModel(model);
        return byokService.hasKey(provider);
    }

    /**
     * Main chat method - routes based on mode and availability
     */
    async chat(
        model: string,
        messages: ChatMessage[],
        options?: UnifiedChatOptions
    ): Promise<UnifiedChatResult> {
        await this.init();

        const provider = this.getProviderForModel(model);

        // Try BYOK mode first if that's the preference
        if (this.mode === 'byok') {
            const byokKey = await byokService.getKey(provider);

            if (byokKey) {
                try {
                    return await this.callDirect(provider, model, messages, byokKey, options);
                } catch (error: any) {
                    console.warn(`BYOK call failed for ${provider}, falling back to backend:`, error.message);
                    // Fall through to backend
                }
            } else {
                console.log(`No BYOK key for ${provider}, trying backend...`);
            }
        }

        // Try backend mode
        const backendAvailable = await this.isBackendAvailable();
        if (backendAvailable) {
            try {
                return await this.callBackend(model, messages, options);
            } catch (error: any) {
                console.warn('Backend call failed:', error.message);
                // If we haven't tried BYOK yet, try it now
                if (this.mode === 'backend') {
                    const byokKey = await byokService.getKey(provider);
                    if (byokKey) {
                        return await this.callDirect(provider, model, messages, byokKey, options);
                    }
                }
                throw error;
            }
        }

        // Nothing available
        return {
            success: false,
            content: '',
            model,
            provider,
            mode: this.mode,
            error: this.mode === 'byok'
                ? `No API key configured for ${provider}. Add one in AI Settings.`
                : 'Not logged in to Zenner. Please login or switch to BYOK mode.',
        };
    }

    /**
     * Call backend (license server) for AI
     */
    private async callBackend(
        model: string,
        messages: ChatMessage[],
        options?: UnifiedChatOptions
    ): Promise<UnifiedChatResult> {
        const response = await zennerApiClient.chat(model, messages, options);

        return {
            success: true,
            content: response.choices[0]?.message?.content || '',
            model: response.model,
            provider: 'zenner-backend',
            mode: 'backend',
            tokensUsed: response.usage?.total_tokens,
        };
    }

    /**
     * Call AI provider directly with BYOK key
     */
    private async callDirect(
        provider: AIProvider,
        model: string,
        messages: ChatMessage[],
        apiKey: string,
        options?: UnifiedChatOptions
    ): Promise<UnifiedChatResult> {
        switch (provider) {
            case 'openai':
                return this.callOpenAI(model, messages, apiKey, options);
            case 'anthropic':
                return this.callAnthropic(model, messages, apiKey, options);
            case 'google':
                return this.callGoogle(model, messages, apiKey, options);
            case 'groq':
                return this.callGroq(model, messages, apiKey, options);
            case 'ollama':
                return this.callOllama(model, messages, options);
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }

    /**
     * Direct call to OpenAI
     */
    private async callOpenAI(
        model: string,
        messages: ChatMessage[],
        apiKey: string,
        options?: UnifiedChatOptions
    ): Promise<UnifiedChatResult> {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: options?.temperature ?? 0.7,
                max_tokens: options?.max_tokens ?? 1000,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `OpenAI error: ${response.status}`);
        }

        const data: ChatResponse = await response.json();
        return {
            success: true,
            content: data.choices[0]?.message?.content || '',
            model: data.model,
            provider: 'openai',
            mode: 'byok',
            tokensUsed: data.usage?.total_tokens,
        };
    }

    /**
     * Direct call to Anthropic
     */
    private async callAnthropic(
        model: string,
        messages: ChatMessage[],
        apiKey: string,
        options?: UnifiedChatOptions
    ): Promise<UnifiedChatResult> {
        const systemMessage = messages.find(m => m.role === 'system');
        const userMessages = messages.filter(m => m.role !== 'system');

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                max_tokens: options?.max_tokens ?? 1000,
                system: systemMessage?.content,
                messages: userMessages.map(m => ({
                    role: m.role === 'assistant' ? 'assistant' : 'user',
                    content: m.content,
                })),
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `Anthropic error: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            content: data.content?.[0]?.text || '',
            model,
            provider: 'anthropic',
            mode: 'byok',
            tokensUsed: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        };
    }

    /**
     * Direct call to Google (Gemini)
     */
    private async callGoogle(
        model: string,
        messages: ChatMessage[],
        apiKey: string,
        options?: UnifiedChatOptions
    ): Promise<UnifiedChatResult> {
        const modelId = model.startsWith('models/') ? model : `models/${model}`;

        const contents = messages
            .filter(m => m.role !== 'system')
            .map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }],
            }));

        const systemInstruction = messages.find(m => m.role === 'system');

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/${modelId}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents,
                    systemInstruction: systemInstruction
                        ? { parts: [{ text: systemInstruction.content }] }
                        : undefined,
                    generationConfig: {
                        temperature: options?.temperature ?? 0.7,
                        maxOutputTokens: options?.max_tokens ?? 1000,
                    },
                }),
            }
        );

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `Google error: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
            model,
            provider: 'google',
            mode: 'byok',
            tokensUsed: data.usageMetadata?.totalTokenCount,
        };
    }

    /**
     * Direct call to Groq
     */
    private async callGroq(
        model: string,
        messages: ChatMessage[],
        apiKey: string,
        options?: UnifiedChatOptions
    ): Promise<UnifiedChatResult> {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: options?.temperature ?? 0.7,
                max_tokens: options?.max_tokens ?? 1000,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `Groq error: ${response.status}`);
        }

        const data: ChatResponse = await response.json();
        return {
            success: true,
            content: data.choices[0]?.message?.content || '',
            model: data.model,
            provider: 'groq',
            mode: 'byok',
            tokensUsed: data.usage?.total_tokens,
        };
    }

    /**
     * Direct call to Ollama (local)
     */
    private async callOllama(
        model: string,
        messages: ChatMessage[],
        options?: UnifiedChatOptions
    ): Promise<UnifiedChatResult> {
        const response = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model,
                messages,
                stream: false,
                options: {
                    temperature: options?.temperature ?? 0.7,
                    num_predict: options?.max_tokens ?? 1000,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama error: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            content: data.message?.content || '',
            model,
            provider: 'ollama',
            mode: 'byok',
            tokensUsed: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        };
    }

    /**
     * Subscribe to mode changes
     */
    subscribe(listener: () => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notifyListeners(): void {
        this.listeners.forEach(l => l());
    }
}

export const unifiedAIService = new UnifiedAIService();
