import { AIProvider, Message, AIOptions, ModelInfo, ProviderStatus } from "../types";
import { safeFetch } from "../../../lib/tauriFetch";

/**
 * OpenAI Provider
 * GPT-4, GPT-4o, GPT-3.5-turbo support
 */
export class OpenAIProvider implements AIProvider {
    readonly name = "OpenAI";
    readonly type = "openai" as const;
    readonly requiresApiKey = true;
    readonly defaultModels = ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"];

    private apiKey = "";
    private model = "gpt-4o-mini";
    private baseUrl = "https://api.openai.com/v1";

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
            const response = await safeFetch(`${this.baseUrl}/models`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                },
                signal: AbortSignal.timeout(5000),
            });

            if (response.status === 401) {
                return { available: false, error: "Invalid API key" };
            }

            if (!response.ok) {
                return { available: false, error: `API error: ${response.status}` };
            }

            const data = await response.json();
            const chatModels = (data.data || [])
                .filter((m: { id: string }) => m.id.includes("gpt"))
                .map((m: { id: string }) => ({
                    id: m.id,
                    name: m.id,
                }));

            return { available: true, models: chatModels };
        } catch (error) {
            return {
                available: false,
                error: error instanceof Error ? error.message : "Connection failed",
            };
        }
    }

    async fetchModels(): Promise<ModelInfo[]> {
        if (!this.apiKey) return [];

        try {
            const response = await safeFetch(`${this.baseUrl}/models`, {
                headers: { Authorization: `Bearer ${this.apiKey}` },
            });

            if (!response.ok) return [];

            const data = await response.json();
            return (data.data || [])
                .filter((m: { id: string }) => m.id.includes("gpt"))
                .sort((a: { id: string }, b: { id: string }) => b.id.localeCompare(a.id))
                .map((m: { id: string }) => ({
                    id: m.id,
                    name: m.id,
                    description: m.id.includes("4o") ? "Most capable" : m.id.includes("4") ? "Advanced" : "Fast",
                }));
        } catch {
            return [];
        }
    }

    async chat(messages: Message[], options?: AIOptions): Promise<string> {
        if (!this.apiKey) throw new Error("API key required");

        const response = await safeFetch(`${this.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: options?.model || this.model,
                messages: messages.map(m => ({ role: m.role, content: m.content })),
                temperature: options?.temperature ?? 0.7,
                max_tokens: options?.maxTokens ?? 16384, // Maximum for GPT-4
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `OpenAI error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "";
    }

    async *streamChat(messages: Message[], options?: AIOptions): AsyncGenerator<string, void, unknown> {
        if (!this.apiKey) throw new Error("API key required");

        const response = await safeFetch(`${this.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: options?.model || this.model,
                messages: messages.map(m => ({ role: m.role, content: m.content })),
                temperature: options?.temperature ?? 0.7,
                max_tokens: options?.maxTokens ?? 16384,
                stream: true,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI error: ${response.status}`);
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
                const data = line.slice(6);
                if (data === "[DONE]") return;

                try {
                    const json = JSON.parse(data);
                    const content = json.choices?.[0]?.delta?.content;
                    if (content) yield content;
                } catch {
                    // Skip invalid JSON
                }
            }
        }
    }
}
