import { AIProvider, AIProviderType, Message, ModelInfo, ProviderStatus, AIConfig, DEFAULT_AI_CONFIG } from "./types";
import { OllamaProvider } from "./providers/OllamaProvider";
import { OpenAIProvider } from "./providers/OpenAIProvider";
import { ClaudeProvider } from "./providers/ClaudeProvider";
import { GeminiProvider } from "./providers/GeminiProvider";
import { byokService } from "./BYOKService";
import { zennerApiClient } from "../api/ZennerApiClient";

// AI routing mode
export type AIRoutingMode = 'backend' | 'byok';

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
    private routingMode: AIRoutingMode = 'byok';
    private routingModeInitialized = false;

    // Server persona (fetched from Zenner backend)
    private cachedPersona: any = null;
    private personaLastFetched: number = 0;
    private readonly PERSONA_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    // Context window management
    private readonly MAX_HISTORY_TOKENS = 4000; // Max tokens for conversation history
    private readonly TOKEN_ESTIMATION_CHARS_PER_TOKEN = 4; // ~4 chars per token

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
            console.log('[AIService] Loading config from localStorage...');

            if (stored) {
                const parsed = JSON.parse(stored);
                console.log('[AIService] Parsed stored config:', {
                    activeProvider: parsed.activeProvider,
                    fallbackPriority: parsed.fallbackPriority,
                    hasProviders: !!parsed.providers
                });

                // Deep merge each provider individually to preserve defaults
                const mergedProviders = { ...DEFAULT_AI_CONFIG.providers };
                if (parsed.providers) {
                    for (const [key, value] of Object.entries(parsed.providers)) {
                        if (value && typeof value === 'object') {
                            (mergedProviders as any)[key] = {
                                ...(DEFAULT_AI_CONFIG.providers as any)[key],
                                ...value
                            };
                        }
                    }
                }

                this.config = {
                    ...DEFAULT_AI_CONFIG,
                    ...parsed,
                    providers: mergedProviders as typeof DEFAULT_AI_CONFIG.providers
                };

                // Migrate old configs with low maxTokens to new minimum
                if (!this.config.maxTokens || this.config.maxTokens < 32768) {
                    console.log(`[AIService] Migrating maxTokens from ${this.config.maxTokens} to 32768`);
                    this.config.maxTokens = 32768;
                    this.saveConfig();
                }

                console.log('[AIService] Final loaded config:', {
                    activeProvider: this.config.activeProvider,
                    fallbackPriority: this.config.fallbackPriority
                });
            } else {
                console.log('[AIService] No stored config found, using defaults');
            }
        } catch (error) {
            console.error('[AIService] Failed to load config:', error);
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

        // If in backend mode, fetch persona
        if (this.routingMode === 'backend') {
            await this.fetchServerPersona();
        }
    }

    /**
     * Fetch server persona and cache it
     * Called when in backend mode to get the AI personality from the server
     */
    async fetchServerPersona(): Promise<any | null> {
        const now = Date.now();

        // Return cached if still valid
        if (this.cachedPersona && (now - this.personaLastFetched) < this.PERSONA_CACHE_TTL) {
            return this.cachedPersona;
        }

        try {
            const personaData = await zennerApiClient.getPersona();
            if (personaData?.active_persona) {
                this.cachedPersona = personaData.active_persona;
                this.personaLastFetched = now;
                console.log('[AIService] Fetched server persona:', this.cachedPersona.display_name);
                return this.cachedPersona;
            }
        } catch (error) {
            console.error('[AIService] Failed to fetch server persona:', error);
        }

        return null;
    }

    /**
     * Get the effective system prompt
     * Uses server persona when in backend mode, otherwise uses config
     */
    getEffectiveSystemPrompt(mode?: string): string {
        // If we have a server persona, use its prompts
        if (this.cachedPersona) {
            // Check for mode-specific prompts
            if (mode === 'productivity' && this.cachedPersona.prompt_productivity) {
                return this.cachedPersona.prompt_productivity;
            }
            if (mode === 'venting' && this.cachedPersona.prompt_venting) {
                return this.cachedPersona.prompt_venting;
            }
            if (mode === 'strategy' && this.cachedPersona.prompt_strategy) {
                return this.cachedPersona.prompt_strategy;
            }
            // Fall back to main system prompt
            return this.cachedPersona.system_prompt || this.config.systemPrompt;
        }

        // No server persona, use local config
        return this.config.systemPrompt;
    }

    /**
     * Get cached persona info
     */
    getCachedPersona(): any | null {
        return this.cachedPersona;
    }

    /**
     * Clear persona cache (call when logging out)
     */
    clearPersonaCache(): void {
        this.cachedPersona = null;
        this.personaLastFetched = 0;
    }

    updateConfig(updates: Partial<AIConfig>): void {
        console.log('[AIService] Updating config with:', {
            activeProvider: updates.activeProvider,
            fallbackPriority: updates.fallbackPriority,
            hasProviders: !!updates.providers
        });

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
            for (const type of Object.keys(updates.providers)) {
                this.configureProvider(type as AIProviderType);
            }
        }

        console.log('[AIService] Config after update:', {
            activeProvider: this.config.activeProvider,
            fallbackPriority: this.config.fallbackPriority
        });

        // Save to localStorage - this is the KEY part
        this.saveConfig();
        this.notifyListeners();

        // If Ollama became the active provider, preload the model in the background
        if (updates.activeProvider === 'ollama' ||
            (updates.fallbackPriority && updates.fallbackPriority[0] === 'ollama')) {
            this.preloadOllamaModel();
        }
    }

    /**
     * Preload Ollama model in the background.
     * This warms up the model so the first chat request is fast.
     */
    private async preloadOllamaModel(): Promise<void> {
        const ollamaProvider = this.providers.get('ollama') as OllamaProvider | undefined;
        if (!ollamaProvider) return;

        // Configure with saved settings first
        this.configureProvider('ollama');

        console.log('[AIService] Preloading Ollama model in background...');
        const result = await ollamaProvider.preloadModel();

        if (result.success) {
            console.log('[AIService] Ollama model ready for fast responses');
        } else {
            console.warn('[AIService] Ollama preload failed:', result.error);
        }
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

    /**
     * Configure a provider with the saved config.
     * This MUST be called before isAvailable() or fetchModels() to ensure
     * the provider uses the user's saved settings, not defaults.
     */
    private configureProvider(type: AIProviderType): void {
        const provider = this.providers.get(type);
        const pConfig = this.config.providers[type];

        if (provider && pConfig) {
            provider.configure({
                apiKey: pConfig.apiKey,
                baseUrl: (pConfig as { baseUrl?: string }).baseUrl,
                model: pConfig.model,
            });
        }
    }

    async checkProvider(type: AIProviderType): Promise<ProviderStatus> {
        const provider = this.providers.get(type);
        if (!provider) {
            return { available: false, error: "Provider not found" };
        }

        // Configure provider with saved settings BEFORE checking availability
        this.configureProvider(type);

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

        // Configure provider with saved settings BEFORE fetching models
        this.configureProvider(type);

        try {
            return await provider.fetchModels();
        } catch {
            return provider.defaultModels.map(id => ({ id, name: id }));
        }
    }

    /**
     * Check if at least one provider is ready for chat.
     * Call this before first chat to warn user if no providers available.
     */
    async healthCheck(): Promise<{
        ready: boolean;
        availableProviders: AIProviderType[];
        error?: string;
    }> {
        const availableProviders: AIProviderType[] = [];

        for (const [type, provider] of this.providers) {
            const pConfig = this.config.providers[type];

            // Check if provider is configured
            if (!pConfig) continue;
            if (type !== 'ollama' && !pConfig.apiKey) continue;
            if (type === 'ollama' && !pConfig.baseUrl) continue;

            // Quick check if provider is available
            this.configureProvider(type);
            try {
                const status = await provider.isAvailable();
                if (status.available) {
                    availableProviders.push(type);
                }
            } catch {
                // Provider not available
            }
        }

        if (availableProviders.length === 0) {
            return {
                ready: false,
                availableProviders: [],
                error: 'No AI providers available. Please configure at least one provider in Settings → AI Engine.'
            };
        }

        console.log('[AIService] Health check passed, available providers:', availableProviders);
        return {
            ready: true,
            availableProviders
        };
    }

    // ============================================================
    // Routing Mode
    // ============================================================

    /**
     * Initialize routing mode from stored settings
     */
    private async initRoutingMode(): Promise<void> {
        if (this.routingModeInitialized) return;

        try {
            this.routingMode = await byokService.getMode();
            this.routingModeInitialized = true;
            console.log('[AIService] Routing mode:', this.routingMode);
        } catch (e) {
            console.warn('[AIService] Failed to get routing mode, defaulting to byok');
            this.routingMode = 'byok';
            this.routingModeInitialized = true;
        }
    }

    /**
     * Get current routing mode
     */
    getRoutingMode(): AIRoutingMode {
        return this.routingMode;
    }

    /**
     * Set routing mode
     */
    async setRoutingMode(mode: AIRoutingMode): Promise<void> {
        this.routingMode = mode;
        await byokService.setMode(mode);
        console.log('[AIService] Routing mode changed to:', mode);
        this.notifyListeners();
    }

    /**
     * Check if backend mode is available (authenticated with Zenner)
     */
    async isBackendAvailable(): Promise<boolean> {
        return zennerApiClient.isAuthenticated();
    }

    // ============================================================
    // Chat
    // ============================================================

    async chat(userMessage: string, context?: Record<string, any>): Promise<string> {
        // Initialize routing mode on first call
        await this.initRoutingMode();

        // If backend mode and authenticated, route through Zenner
        if (this.routingMode === 'backend') {
            const backendAvailable = await zennerApiClient.isAuthenticated();
            if (backendAvailable) {
                try {
                    return await this.chatViaBackend(userMessage, context);
                } catch (error) {
                    console.warn('[AIService] Backend failed, falling back to BYOK:', error);
                    // Fall through to BYOK mode
                }
            } else {
                console.log('[AIService] Backend mode but not authenticated, using BYOK');
            }
        }

        // BYOK mode or backend fallback - use existing provider logic
        return this.chatViaBYOK(userMessage, context);
    }

    /**
     * Chat via Zenner backend (license server)
     */
    private async chatViaBackend(userMessage: string, context?: Record<string, any>): Promise<string> {
        const skipHistory = context?.skipHistory === true;

        // Build system prompt
        let systemPrompt = this.config.systemPrompt;
        if (context && typeof context.systemPrompt === 'string') {
            systemPrompt = context.systemPrompt;
        } else if (context && !context.skipHistory) {
            systemPrompt += `\n\nCurrent context: ${JSON.stringify(context)}`;
        }

        // Build messages array
        let messages: Message[];
        if (skipHistory) {
            messages = [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ];
        } else {
            this.conversationHistory.push({ role: "user", content: userMessage });
            const trimmedHistory = this.trimHistoryToTokenBudget();
            messages = [
                { role: "system", content: systemPrompt },
                ...trimmedHistory,
            ];
        }

        // Determine which model to use (based on active provider setting)
        const pConfig = this.config.providers[this.config.activeProvider];
        const model = pConfig?.model || 'gpt-4o-mini';

        try {
            // Call Zenner backend
            const response = await zennerApiClient.chat(
                model,
                messages.map(m => ({ role: m.role, content: m.content })),
                {
                    temperature: this.config.temperature,
                    max_tokens: this.config.maxTokens || 32768,
                }
            );

            const assistantContent = response.choices[0]?.message?.content || '';

            // Add to history if not skipping
            if (!skipHistory) {
                this.conversationHistory.push({ role: "assistant", content: assistantContent });
                if (this.conversationHistory.length > 20) {
                    this.conversationHistory = this.conversationHistory.slice(-16);
                }
            }

            console.log('[AIService] Backend response received, tokens used:', response.usage?.total_tokens);
            return assistantContent;
        } catch (error) {
            // Remove the user message we added if request failed
            if (!skipHistory) {
                this.conversationHistory.pop();
            }
            throw error;
        }
    }

    /**
     * Chat via BYOK (direct to providers)
     */
    private async chatViaBYOK(userMessage: string, context?: Record<string, any>): Promise<string> {
        const errors: { provider: AIProviderType; error: string }[] = [];

        console.log('[AIService] Current config state:', {
            activeProvider: this.config.activeProvider,
            fallbackPriority: this.config.fallbackPriority
        });

        // Build list of providers to try (active first, then fallbacks)
        const providersToTry = [
            this.config.activeProvider,
            ...this.config.fallbackPriority.filter(p => p !== this.config.activeProvider)
        ];

        console.log('[AIService] Providers to try (in order):', providersToTry);

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

            // Check if this is a one-shot call (no history)
            const skipHistory = context?.skipHistory === true;

            try {
                console.log(`[AIService] Trying provider: ${providerType}`);

                // Configure provider with saved settings (uses centralized helper)
                this.configureProvider(providerType);

                // Build context-aware system message
                let systemPrompt = this.config.systemPrompt;

                // precise override if provided in context
                if (context && typeof context.systemPrompt === 'string') {
                    systemPrompt = context.systemPrompt;
                } else if (context && !context.skipHistory) {
                    // Append context if it's not an override (skip if skipHistory mode)
                    systemPrompt += `\n\nCurrent context: ${JSON.stringify(context)}`;
                }

                let messages: Message[];

                if (skipHistory) {
                    // One-shot mode: just system + user message, no history
                    messages = [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userMessage }
                    ];
                } else {
                    // Normal mode: add to history and include previous messages
                    this.conversationHistory.push({ role: "user", content: userMessage });
                    const trimmedHistory = this.trimHistoryToTokenBudget();
                    messages = [
                        { role: "system", content: systemPrompt },
                        ...trimmedHistory,
                    ];
                }

                // Attempt chat
                const response = await provider.chat(messages, {
                    temperature: this.config.temperature,
                    maxTokens: this.config.maxTokens || 32768,
                    model: pConfig.model,
                });

                // Success!
                console.log(`[AIService] Success with ${providerType}`);

                // Add assistant response to history (only if not skipping history)
                if (!skipHistory) {
                    this.conversationHistory.push({ role: "assistant", content: response });

                    // Keep history manageable
                    if (this.conversationHistory.length > 20) {
                        this.conversationHistory = this.conversationHistory.slice(-16);
                    }
                }

                return response;

            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                console.error(`[AIService] ${providerType} failed:`, errorMsg);
                errors.push({ provider: providerType, error: errorMsg });

                // Remove the failed user message before trying next provider (only if we added it)
                if (!skipHistory) {
                    this.conversationHistory.pop();
                }
                continue;
            }
        }

        // All providers failed
        console.error('[AIService] All providers failed:', errors);
        const errorSummary = errors.map(e => `${e.provider}: ${e.error}`).join('\n');
        throw new Error(`All AI providers failed:\n${errorSummary}\n\nCheck your API keys in Settings → AI Settings.`);
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

    /**
     * Estimate token count for a string
     * Uses ~4 chars per token approximation (works well for English)
     */
    private estimateTokens(text: string): number {
        return Math.ceil(text.length / this.TOKEN_ESTIMATION_CHARS_PER_TOKEN);
    }

    /**
     * Trim conversation history to fit within token budget
     * Keeps most recent messages that fit within MAX_HISTORY_TOKENS
     */
    private trimHistoryToTokenBudget(): Message[] {
        let tokenCount = 0;
        const trimmed: Message[] = [];

        // Iterate from most recent to oldest
        for (let i = this.conversationHistory.length - 1; i >= 0; i--) {
            const msg = this.conversationHistory[i];
            const msgTokens = this.estimateTokens(msg.content);

            if (tokenCount + msgTokens > this.MAX_HISTORY_TOKENS) {
                console.log(`[AIService] History trimmed: keeping ${trimmed.length} messages (${tokenCount} tokens)`);
                break;
            }

            trimmed.unshift(msg);
            tokenCount += msgTokens;
        }

        return trimmed;
    }

    /**
     * Get current history token usage stats
     */
    getHistoryStats(): { messageCount: number; estimatedTokens: number; maxTokens: number } {
        const estimatedTokens = this.conversationHistory.reduce(
            (sum, msg) => sum + this.estimateTokens(msg.content),
            0
        );
        return {
            messageCount: this.conversationHistory.length,
            estimatedTokens,
            maxTokens: this.MAX_HISTORY_TOKENS
        };
    }

    async embed(text: string): Promise<number[]> {
        // First, try the active provider
        const provider = this.getActiveProvider();
        if (provider && 'embed' in provider && typeof (provider as any).embed === 'function') {
            try {
                return await (provider as any).embed(text);
            } catch (e) {
                console.warn('[AIService] Active provider embed failed, trying Gemini fallback');
            }
        }

        // Fallback to Gemini (it has the best embedding support)
        const geminiProvider = this.providers.get('gemini');
        if (geminiProvider && 'embed' in geminiProvider) {
            this.configureProvider('gemini');
            try {
                return await (geminiProvider as any).embed(text);
            } catch (e) {
                console.warn('[AIService] Gemini embed fallback failed:', e);
            }
        }

        // Last resort: return empty array (RAG will gracefully skip)
        console.warn('[AIService] No embedding provider available, RAG will be disabled');
        return [];
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
