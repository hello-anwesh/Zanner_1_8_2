import { useState, useEffect, useCallback } from "react";
import { aiService, AIRoutingMode } from "../services/ai/AIService";
import { AIProviderType, ModelInfo, AIConfig, Message } from "../services/ai/types";

interface ProviderInfo {
    type: AIProviderType;
    name: string;
    requiresApiKey: boolean;
    defaultModels: string[];
}

interface ProviderStatus {
    available: boolean;
    error?: string;
    models?: ModelInfo[];
}

export function useAI() {
    const [config, setConfig] = useState<AIConfig>(aiService.getConfig());
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [providerStatus, setProviderStatus] = useState<Map<AIProviderType, ProviderStatus>>(new Map());
    const [models, setModels] = useState<ModelInfo[]>([]);
    const [routingMode, setRoutingModeState] = useState<AIRoutingMode>(aiService.getRoutingMode());

    // Subscribe to service changes
    useEffect(() => {
        const updateState = () => {
            setConfig(aiService.getConfig());
            setMessages(aiService.getHistory());
            setRoutingModeState(aiService.getRoutingMode());
        };

        const unsubscribe = aiService.subscribe(updateState);
        return () => unsubscribe();
    }, []);

    // Load models when provider changes
    useEffect(() => {
        loadModels(config.activeProvider);
    }, [config.activeProvider]);

    // Get providers list
    const getProviders = useCallback((): ProviderInfo[] => {
        return aiService.getProviders();
    }, []);

    // Check provider availability
    const checkProvider = useCallback(async (type: AIProviderType): Promise<ProviderStatus> => {
        const status = await aiService.checkProvider(type);
        setProviderStatus(prev => new Map(prev).set(type, status));
        return status;
    }, []);

    // Check all providers
    const checkAllProviders = useCallback(async (): Promise<void> => {
        const statuses = await aiService.checkAllProviders();
        setProviderStatus(statuses);
    }, []);

    // Load models for a provider
    const loadModels = useCallback(async (type: AIProviderType): Promise<ModelInfo[]> => {
        const fetchedModels = await aiService.fetchModels(type);
        setModels(fetchedModels);
        return fetchedModels;
    }, []);

    // Set active provider
    const setProvider = useCallback(async (type: AIProviderType): Promise<boolean> => {
        return aiService.setActiveProvider(type);
    }, []);

    // Update config
    const updateConfig = useCallback((updates: Partial<AIConfig>) => {
        aiService.updateConfig(updates);
        setConfig(aiService.getConfig());
    }, []);

    // Update provider config
    const updateProviderConfig = useCallback((
        provider: AIProviderType,
        updates: { apiKey?: string; model?: string; baseUrl?: string; enabled?: boolean }
    ) => {
        const currentConfig = aiService.getConfig();
        aiService.updateConfig({
            providers: {
                ...currentConfig.providers,
                [provider]: {
                    ...currentConfig.providers[provider],
                    ...updates,
                },
            },
        });
        setConfig(aiService.getConfig());
    }, []);

    // Set routing mode
    const setRoutingMode = useCallback(async (mode: AIRoutingMode): Promise<void> => {
        await aiService.setRoutingMode(mode);
        setRoutingModeState(mode);
    }, []);

    // Check if backend is available
    const checkBackendAvailable = useCallback(async (): Promise<boolean> => {
        return aiService.isBackendAvailable();
    }, []);

    // Send message
    const sendMessage = useCallback(async (
        message: string,
        context?: Record<string, unknown>
    ): Promise<string> => {
        setIsLoading(true);
        try {
            const response = await aiService.chat(message, context);
            setMessages(aiService.getHistory());
            return response;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Stream message
    const streamMessage = useCallback(async function* (
        message: string,
        context?: Record<string, unknown>
    ): AsyncGenerator<string, void, unknown> {
        setIsStreaming(true);
        try {
            for await (const chunk of aiService.streamChat(message, context)) {
                yield chunk;
            }
            setMessages(aiService.getHistory());
        } finally {
            setIsStreaming(false);
        }
    }, []);

    // Clear history
    const clearHistory = useCallback(() => {
        aiService.clearHistory();
        setMessages([]);
    }, []);

    // Get status for active provider
    const getActiveStatus = useCallback((): ProviderStatus | undefined => {
        return providerStatus.get(config.activeProvider);
    }, [providerStatus, config.activeProvider]);

    return {
        // State
        config,
        messages,
        models,
        isLoading,
        isStreaming,
        providerStatus,
        isAvailable: getActiveStatus()?.available || false,
        routingMode,

        // Provider management
        getProviders,
        setProvider,
        checkProvider,
        checkAllProviders,
        loadModels,
        getActiveStatus,

        // Config
        updateConfig,
        updateProviderConfig,

        // Routing Mode
        setRoutingMode,
        checkBackendAvailable,

        // Chat
        sendMessage,
        streamMessage,
        clearHistory,

        // Alias for compatibility
        checkAvailability: () => checkProvider(config.activeProvider),
    };
}

