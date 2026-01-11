import { AIProvider, AIProviderType, Message, ModelInfo, ProviderStatus, AIConfig, DEFAULT_AI_CONFIG } from "./types";
import { OllamaProvider } from "./providers/OllamaProvider";
import { OpenAIProvider } from "./providers/OpenAIProvider";
import { ClaudeProvider } from "./providers/ClaudeProvider";
import { GeminiProvider } from "./providers/GeminiProvider";

/**
 * AI Service
 * Orchestrates multiple AI providers with dynamic switching
 */
class AIService {
    private providers: Map<AIProviderType, AIProvider> = new Map();
    private config: AIConfig = DEFAULT_AI_CONFIG;
    private conversationHistory: Message[] = [];
    private providerStatus: Map<AIProviderType, ProviderStatus> = new Map();
    private listeners: Set<() => void> = new Set();
    private readonly STORAGE_KEY = 'ai-service-config';

    constructor() {
        // Register all providers
        this.providers.set("ollama", new OllamaProvider());
        this.providers.set("openai", new OpenAIProvider());
        this.providers.set("claude", new ClaudeProvider());
        this.providers.set("gemini", new GeminiProvider());

        // Load saved config from localStorage
        this.loadConfig();
    }

    private loadConfig(): void {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.config = {
                    ...DEFAULT_AI_CONFIG,
                    ...parsed,
                    providers: {
                        ...DEFAULT_AI_CONFIG.providers,
                        ...(parsed.providers || {})
                    }
                };
            }
        } catch (error) {
            console.error('Failed to load AI config:', error);
        }
    }

    private saveConfig(): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.config));
        } catch (error) {
            console.error('Failed to save AI config:', error);
        }
    }

    // ============================================================
    // Configuration
    // ============================================================

    async initialize(config?: Partial<AIConfig>): Promise<void> {
        if (config) {
            this.config = { ...this.config, ...config };
        }

        // Configure all providers
        for (const [type, provider] of this.providers) {
            const providerConfig = this.config.providers[type];
            if (providerConfig) {
                provider.configure({
                    apiKey: providerConfig.apiKey,
                    baseUrl: (providerConfig as { baseUrl?: string }).baseUrl,
                    model: providerConfig.model,
                });
            }
        }

        // Check availability of active provider
        await this.checkProvider(this.config.activeProvider);
    }

    updateConfig(updates: Partial<AIConfig>): void {
        // Deep merge providers at the individual provider level to preserve all fields
        if (updates.providers) {
            const mergedProviders = { ...this.config.providers };

            // Merge each provider's config individually
            for (const [providerKey, providerConfig] of Object.entries(updates.providers)) {
                if (providerConfig) {
                    (mergedProviders as any)[providerKey] = {
                        ...(mergedProviders as any)[providerKey],
                        ...providerConfig
                    };
                }
            }

            // Create updates without the providers key to prevent overwriting
            const { providers: _, ...restUpdates } = updates;

            this.config = {
                ...this.config,
                ...restUpdates,  // Apply other updates (activeProvider, etc) but NOT providers
                providers: mergedProviders as any  // Use our carefully merged providers
            };
        } else {
            this.config = { ...this.config, ...updates };
        }

        // Re-configure providers if their config changed
        if (updates.providers) {
            for (const [type, providerConfig] of Object.entries(updates.providers)) {
                const provider = this.providers.get(type as AIProviderType);
                if (provider && providerConfig) {
                    provider.configure({
                        apiKey: providerConfig.apiKey,
                        baseUrl: (providerConfig as { baseUrl?: string }).baseUrl,
                        model: providerConfig.model,
                    });
                }
            }
        }

        // Save to localStorage - this is the KEY part
        this.saveConfig();
        this.notifyListeners();
    }

    getConfig(): AIConfig {
        return { ...this.config };
    }

    // ============================================================
    // Provider Management
    // ============================================================

    getProviders(): { type: AIProviderType; name: string; requiresApiKey: boolean; defaultModels: string[] }[] {
        return Array.from(this.providers.entries()).map(([type, provider]) => ({
            type,
            name: provider.name,
            requiresApiKey: provider.requiresApiKey,
            defaultModels: provider.defaultModels,
        }));
    }

    getActiveProvider(): AIProvider | null {
        return this.providers.get(this.config.activeProvider) || null;
    }

    async setActiveProvider(type: AIProviderType): Promise<boolean> {
        const provider = this.providers.get(type);
        if (!provider) return false;

        this.config.activeProvider = type;
        await this.checkProvider(type);
        this.notifyListeners();

        return this.providerStatus.get(type)?.available || false;
    }

    // ============================================================
    // Validation & Models
    // ============================================================

    async checkProvider(type: AIProviderType): Promise<ProviderStatus> {
        const provider = this.providers.get(type);
        if (!provider) {
            return { available: false, error: "Provider not found" };
        }

        const status = await provider.isAvailable();
        this.providerStatus.set(type, status);
        this.notifyListeners();

        return status;
    }

    async checkAllProviders(): Promise<Map<AIProviderType, ProviderStatus>> {
        const results = await Promise.all(
            Array.from(this.providers.keys()).map(async type => {
                const status = await this.checkProvider(type);
                return [type, status] as const;
            })
        );

        return new Map(results);
    }

    getProviderStatus(type: AIProviderType): ProviderStatus | undefined {
        return this.providerStatus.get(type);
    }

    async fetchModels(type: AIProviderType): Promise<ModelInfo[]> {
        const provider = this.providers.get(type);
        if (!provider) return [];

        try {
            return await provider.fetchModels();
        } catch {
            return provider.defaultModels.map(id => ({ id, name: id }));
        }
    }

    // ============================================================
    // Chat
    // ============================================================

    async chat(userMessage: string, context?: Record<string, any>): Promise<string> {
        const errors: { provider: AIProviderType; error: string }[] = [];

        // Build list of providers to try (active first, then fallbacks)
        const providersToTry = [
            this.config.activeProvider,
            ...this.config.fallbackPriority.filter(p => p !== this.config.activeProvider)
        ];

        console.log('[AIService] Providers to try:', providersToTry);

        for (const providerType of providersToTry) {
            const provider = this.providers.get(providerType);
            const pConfig = this.config.providers[providerType];

            // Skip if provider not available or not configured
            if (!provider) {
                console.log(`[AIService] Skipping ${providerType}: not initialized`);
                continue;
            }

            if (!pConfig || (providerType !== 'ollama' && !pConfig.apiKey)) {
                console.log(`[AIService] Skipping ${providerType}: no API key`);
                continue;
            }

            try {
                console.log(`[AIService] Trying provider: ${providerType}`);

                // Configure provider with latest settings
                provider.configure({
                    apiKey: pConfig.apiKey,
                    model: pConfig.model,
                    baseUrl: (pConfig as any).baseUrl
                });

                // Build context-aware system message
                let systemPrompt = this.config.systemPrompt;

                // precise override if provided in context
                if (context && typeof context.systemPrompt === 'string') {
                    systemPrompt = context.systemPrompt;
                } else if (context) {
                    // Append context if it's not an override
                    systemPrompt += `\n\nCurrent context: ${JSON.stringify(context)}`;
                }

                // Add user message to history
                this.conversationHistory.push({ role: "user", content: userMessage });

                // Build messages array
                const messages: Message[] = [
                    { role: "system", content: systemPrompt },
                    ...this.conversationHistory,
                ];

                // Attempt chat
                const response = await provider.chat(messages, {
                    temperature: this.config.temperature,
                    maxTokens: this.config.maxTokens || 2000,
                    model: pConfig.model,
                });

                // Success!
                console.log(`[AIService] Success with ${providerType}`);

                // Add assistant response to history
                this.conversationHistory.push({ role: "assistant", content: response });

                // Keep history manageable
                if (this.conversationHistory.length > 20) {
                    this.conversationHistory = this.conversationHistory.slice(-16);
                }

                return response;

            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                console.error(`[AIService] ${providerType} failed:`, errorMsg);
                errors.push({ provider: providerType, error: errorMsg });

                // Remove the failed user message before trying next provider
                this.conversationHistory.pop();
                continue;
            }
        }

        // All providers failed
        console.error('[AIService] All providers failed:', errors);
        const errorSummary = errors.map(e => `${e.provider}: ${e.error}`).join('\n');
        throw new Error(`All AI providers failed:\n${errorSummary}\n\nCheck your API keys in Settings → AI Engine.`);
    }

    async *streamChat(userMessage: string, context?: Record<string, any>): AsyncGenerator<string, void, unknown> {
        const provider = this.getActiveProvider();
        if (!provider || !provider.streamChat) {
            throw new Error("Streaming not supported");
        }

        let systemPrompt = this.config.systemPrompt;

        if (context && typeof context.systemPrompt === 'string') {
            systemPrompt = context.systemPrompt;
        } else if (context) {
            systemPrompt += `\n\nCurrent context: ${JSON.stringify(context)}`;
        }

        this.conversationHistory.push({ role: "user", content: userMessage });

        const messages: Message[] = [
            { role: "system", content: systemPrompt },
            ...this.conversationHistory,
        ];

        let fullResponse = "";
        try {
            for await (const chunk of provider.streamChat(messages, {
                temperature: this.config.temperature,
                maxTokens: this.config.maxTokens,
                model: this.config.providers[this.config.activeProvider].model,
            })) {
                fullResponse += chunk;
                yield chunk;
            }

            this.conversationHistory.push({ role: "assistant", content: fullResponse });

            if (this.conversationHistory.length > 20) {
                this.conversationHistory = this.conversationHistory.slice(-16);
            }
        } catch (error) {
            this.conversationHistory.pop();
            throw error;
        }
    }

    clearHistory(): void {
        this.conversationHistory = [];
    }

    async embed(text: string): Promise<number[]> {
        const provider = this.getActiveProvider();
        if (!provider) throw new Error("No active provider");

        // Check if provider supports embeddings
        if ('embed' in provider && typeof (provider as any).embed === 'function') {
            return await (provider as any).embed(text);
        }

        throw new Error("Active provider does not support embeddings. Please enable Gemini.");
    }

    getHistory(): Message[] {
        return [...this.conversationHistory];
    }

    // ============================================================
    // Subscriptions
    // ============================================================

    subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener());
    }
}

// Singleton
export const aiService = new AIService();
