// AI Provider Types
export type AIProviderType = "ollama" | "openai" | "claude" | "gemini";

export interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}

export interface AIOptions {
    temperature?: number;
    maxTokens?: number;
    model?: string;
}

export interface ModelInfo {
    id: string;
    name: string;
    description?: string;
    contextWindow?: number;
}

export interface ProviderStatus {
    available: boolean;
    error?: string;
    models?: ModelInfo[];
}

export interface AIProvider {
    readonly name: string;
    readonly type: AIProviderType;
    readonly requiresApiKey: boolean;
    readonly defaultModels: string[];

    // Configuration
    configure(config: { apiKey?: string; baseUrl?: string; model?: string }): void;

    // Validation
    isAvailable(): Promise<ProviderStatus>;

    // Dynamic model fetching
    fetchModels(): Promise<ModelInfo[]>;

    // Chat
    chat(messages: Message[], options?: AIOptions): Promise<string>;
    streamChat?(messages: Message[], options?: AIOptions): AsyncGenerator<string, void, unknown>;
}

// Provider configurations
export interface AIProviderConfig {
    enabled: boolean;
    apiKey?: string;
    baseUrl?: string;
    model?: string;
}

export interface AIConfig {
    activeProvider: AIProviderType;
    fallbackPriority: AIProviderType[]; // Order of providers to try if active fails
    systemPrompt: string;
    temperature: number;
    maxTokens: number;
    providers: {
        ollama: AIProviderConfig & { baseUrl: string };
        openai: AIProviderConfig;
        claude: AIProviderConfig;
        gemini: AIProviderConfig;
    };
}

export const DEFAULT_AI_CONFIG: AIConfig = {
    activeProvider: "gemini",
    fallbackPriority: ["gemini", "openai", "claude", "ollama"], // Try in this order
    systemPrompt: "You are Chronos, a helpful AI focus companion. Be supportive, concise, and practical. Help users stay focused and suggest productive break activities.",
    temperature: 0.7,
    maxTokens: 1000,
    providers: {
        ollama: {
            enabled: false,
            baseUrl: "http://localhost:11434",
        },
        openai: {
            enabled: false,
            model: "gpt-4o-mini",
        },
        claude: {
            enabled: false,
            model: "claude-3-haiku-20240307",
        },
        gemini: {
            enabled: true,
            apiKey: "AIzaSyA5q8sXegiMQgJJDr9Clxo7FZUxTqJycHU",
            model: "gemini-1.5-flash",
        },
    },
};
