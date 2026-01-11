import { AIProvider, Message, AIOptions, ModelInfo, ProviderStatus } from "../types";

/**
 * Claude Provider (Anthropic)
 * Claude 3 Opus, Sonnet, Haiku support
 */
export class ClaudeProvider implements AIProvider {
    readonly name = "Claude";
    readonly type = "claude" as const;
    readonly requiresApiKey = true;
    readonly defaultModels = [
        "claude-3-5-sonnet-20241022",
        "claude-3-5-haiku-20241022",
        "claude-3-opus-20240229",
        "claude-3-sonnet-20240229",
        "claude-3-haiku-20240307",
    ];

    private apiKey = "";
    private model = "claude-3-5-haiku-20241022";
    private baseUrl = "https://api.anthropic.com/v1";

    configure(config: { apiKey?: string; baseUrl?: string; model?: string }): void {
        if (config.apiKey) this.apiKey = config.apiKey;
        if (config.baseUrl) this.baseUrl = config.baseUrl;
        if (config.model) this.model = config.model;
    }

    async isAvailable(): Promise<ProviderStatus> {
        if (!this.apiKey) {
            return { available: false, error: "API key required" };
        }

        try {
            // Claude doesn't have a models endpoint, so we test with a minimal request
            const response = await fetch(`${this.baseUrl}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.apiKey,
                    "anthropic-version": "2023-06-01",
                    "anthropic-dangerous-direct-browser-access": "true",
                },
                body: JSON.stringify({
                    model: this.model,
                    max_tokens: 1,
                    messages: [{ role: "user", content: "hi" }],
                }),
                signal: AbortSignal.timeout(5000),
            });

            if (response.status === 401) {
                return { available: false, error: "Invalid API key" };
            }

            // Return default models since Claude doesn't have a list endpoint
            const models: ModelInfo[] = this.defaultModels.map(id => ({
                id,
                name: this.formatModelName(id),
                description: this.getModelDescription(id),
            }));

            return { available: response.ok || response.status === 400, models };
        } catch (error) {
            return {
                available: false,
                error: error instanceof Error ? error.message : "Connection failed",
            };
        }
    }

    private formatModelName(id: string): string {
        if (id.includes("opus")) return "Claude 3 Opus";
        if (id.includes("3-5-sonnet")) return "Claude 3.5 Sonnet";
        if (id.includes("sonnet")) return "Claude 3 Sonnet";
        if (id.includes("3-5-haiku")) return "Claude 3.5 Haiku";
        if (id.includes("haiku")) return "Claude 3 Haiku";
        return id;
    }

    private getModelDescription(id: string): string {
        if (id.includes("opus")) return "Most powerful, complex tasks";
        if (id.includes("3-5-sonnet")) return "Best balance of speed and intelligence";
        if (id.includes("sonnet")) return "Balanced performance";
        if (id.includes("3-5-haiku")) return "Fast and efficient";
        if (id.includes("haiku")) return "Fastest, simple tasks";
        return "";
    }

    async fetchModels(): Promise<ModelInfo[]> {
        // Claude doesn't have a public models endpoint
        return this.defaultModels.map(id => ({
            id,
            name: this.formatModelName(id),
            description: this.getModelDescription(id),
        }));
    }

    async chat(messages: Message[], options?: AIOptions): Promise<string> {
        if (!this.apiKey) throw new Error("API key required");

        // Extract system message
        const systemMessage = messages.find(m => m.role === "system")?.content;
        const chatMessages = messages.filter(m => m.role !== "system");

        const response = await fetch(`${this.baseUrl}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": this.apiKey,
                "anthropic-version": "2023-06-01",
                "anthropic-dangerous-direct-browser-access": "true",
            },
            body: JSON.stringify({
                model: options?.model || this.model,
                max_tokens: options?.maxTokens ?? 8192, // Maximum for Claude 3
                system: systemMessage,
                messages: chatMessages.map(m => ({ role: m.role, content: m.content })),
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `Claude error: ${response.status}`);
        }

        const data = await response.json();
        return data.content?.[0]?.text || "";
    }

    async *streamChat(messages: Message[], options?: AIOptions): AsyncGenerator<string, void, unknown> {
        if (!this.apiKey) throw new Error("API key required");

        const systemMessage = messages.find(m => m.role === "system")?.content;
        const chatMessages = messages.filter(m => m.role !== "system");

        const response = await fetch(`${this.baseUrl}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": this.apiKey,
                "anthropic-version": "2023-06-01",
                "anthropic-dangerous-direct-browser-access": "true",
            },
            body: JSON.stringify({
                model: options?.model || this.model,
                max_tokens: options?.maxTokens ?? 8192,
                system: systemMessage,
                messages: chatMessages.map(m => ({ role: m.role, content: m.content })),
                stream: true,
            }),
        });

        if (!response.ok) {
            throw new Error(`Claude error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = decoder.decode(value);
            const lines = text.split("\n").filter(line => line.startsWith("data: "));

            for (const line of lines) {
                try {
                    const json = JSON.parse(line.slice(6));
                    if (json.type === "content_block_delta" && json.delta?.text) {
                        yield json.delta.text;
                    }
                } catch {
                    // Skip invalid JSON
                }
            }
        }
    }
}
