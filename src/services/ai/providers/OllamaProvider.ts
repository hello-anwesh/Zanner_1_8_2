import { AIProvider, Message, AIOptions, ModelInfo, ProviderStatus } from "../types";

/**
 * Ollama Provider
 * Local LLM support via Ollama - no API key required, runs locally
 */
export class OllamaProvider implements AIProvider {
    readonly name = "Ollama";
    readonly type = "ollama" as const;
    readonly requiresApiKey = false;
    readonly defaultModels = ["llama3.2", "mistral", "codellama", "gemma2"];

    private baseUrl = "http://localhost:11434";
    private model = "llama3.2";

    configure(config: { baseUrl?: string; model?: string }): void {
        if (config.baseUrl) this.baseUrl = config.baseUrl;
        if (config.model) this.model = config.model;
    }

    async isAvailable(): Promise<ProviderStatus> {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`, {
                method: "GET",
                signal: AbortSignal.timeout(3000),
            });

            if (!response.ok) {
                return { available: false, error: "Ollama not responding" };
            }

            const data = await response.json();
            const models = (data.models || []).map((m: { name: string; modified_at: string; size: number }) => ({
                id: m.name.split(":")[0],
                name: m.name,
                description: `Size: ${(m.size / 1e9).toFixed(1)}GB`,
            }));

            return { available: true, models };
        } catch (error) {
            return {
                available: false,
                error: error instanceof Error ? error.message : "Connection failed"
            };
        }
    }

    async fetchModels(): Promise<ModelInfo[]> {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`);
            if (!response.ok) return [];

            const data = await response.json();
            return (data.models || []).map((m: { name: string; size: number; details?: { parameter_size?: string } }) => ({
                id: m.name.split(":")[0],
                name: m.name,
                description: m.details?.parameter_size || `${(m.size / 1e9).toFixed(1)}GB`,
            }));
        } catch {
            return [];
        }
    }

    async chat(messages: Message[], options?: AIOptions): Promise<string> {
        const response = await fetch(`${this.baseUrl}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: options?.model || this.model,
                messages: messages.map(m => ({ role: m.role, content: m.content })),
                stream: false,
                options: {
                    temperature: options?.temperature ?? 0.7,
                    num_predict: options?.maxTokens ?? 32768, // Maximum for most local models
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.message?.content || "";
    }

    async *streamChat(messages: Message[], options?: AIOptions): AsyncGenerator<string, void, unknown> {
        const response = await fetch(`${this.baseUrl}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: options?.model || this.model,
                messages: messages.map(m => ({ role: m.role, content: m.content })),
                stream: true,
                options: {
                    temperature: options?.temperature ?? 0.7,
                    num_predict: options?.maxTokens ?? 32768,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama error: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = decoder.decode(value);
            const lines = text.split("\n").filter(Boolean);

            for (const line of lines) {
                try {
                    const json = JSON.parse(line);
                    if (json.message?.content) {
                        yield json.message.content;
                    }
                } catch {
                    // Skip invalid JSON
                }
            }
        }
    }
}
