import { AIProvider, Message, AIOptions, ModelInfo, ProviderStatus } from "../types";

/**
 * Gemini Provider (Google)
 * Gemini Pro, Flash, Ultra support
 */
export class GeminiProvider implements AIProvider {
    readonly name = "Gemini";
    readonly type = "gemini" as const;
    readonly requiresApiKey = true;
    readonly defaultModels = [
        "gemini-2.0-flash-exp",
        "gemini-1.5-pro",
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b",
    ];

    private apiKey = "";
    private model = "gemini-1.5-flash";
    private baseUrl = "https://generativelanguage.googleapis.com/v1beta";

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
            const response = await fetch(
                `${this.baseUrl}/models?key=${this.apiKey}`,
                { signal: AbortSignal.timeout(5000) }
            );

            if (response.status === 400 || response.status === 401) {
                return { available: false, error: "Invalid API key" };
            }

            if (!response.ok) {
                return { available: false, error: `API error: ${response.status}` };
            }

            const data = await response.json();
            const models = (data.models || [])
                .filter((m: { name: string; supportedGenerationMethods?: string[] }) =>
                    m.supportedGenerationMethods?.includes("generateContent")
                )
                .map((m: { name: string; displayName?: string; description?: string }) => ({
                    id: m.name.replace("models/", ""),
                    name: m.displayName || m.name.replace("models/", ""),
                    description: m.description?.slice(0, 60),
                }));

            return { available: true, models };
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
            const response = await fetch(`${this.baseUrl}/models?key=${this.apiKey}`);
            if (!response.ok) return [];

            const data = await response.json();
            return (data.models || [])
                .filter((m: { name: string; supportedGenerationMethods?: string[] }) =>
                    m.supportedGenerationMethods?.includes("generateContent") &&
                    m.name.includes("gemini")
                )
                .map((m: { name: string; displayName?: string; description?: string }) => ({
                    id: m.name.replace("models/", ""),
                    name: m.displayName || m.name.replace("models/", ""),
                    description: m.description?.slice(0, 60),
                }));
        } catch {
            return [];
        }
    }

    async chat(messages: Message[], options?: AIOptions): Promise<string> {
        if (!this.apiKey) throw new Error("API key required");

        // Convert messages to Gemini format
        const systemMessage = messages.find(m => m.role === "system")?.content;
        const chatMessages = messages.filter(m => m.role !== "system");

        const contents = chatMessages.map(m => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
        }));

        const model = options?.model || this.model;

        console.log('[Gemini] Request:', {
            model,
            messageCount: contents.length,
            hasSystemPrompt: !!systemMessage,
            temperature: options?.temperature ?? 0.7,
            maxTokens: options?.maxTokens ?? 2000
        });

        const response = await fetch(
            `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents,
                    systemInstruction: systemMessage ? { parts: [{ text: systemMessage }] } : undefined,
                    generationConfig: {
                        temperature: options?.temperature ?? 0.7,
                        maxOutputTokens: options?.maxTokens ?? 65536, // Maximum for Gemini
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Gemini] API Error Response:', errorText);
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                throw new Error(`Gemini HTTP ${response.status}: ${errorText}`);
            }
            throw new Error(errorData.error?.message || `Gemini error: ${response.status}`);
        }

        const data = await response.json();
        console.log('[Gemini] Full Response:', JSON.stringify(data, null, 2));

        // Validate response structure
        if (!data.candidates || data.candidates.length === 0) {
            console.error('[Gemini] No candidates in response');
            throw new Error('Gemini returned no response candidates. This may be due to safety filters or API issues.');
        }

        const candidate = data.candidates[0];

        // Check for safety blocks
        if (candidate.finishReason === 'SAFETY') {
            console.error('[Gemini] Response blocked by safety filters:', candidate.safetyRatings);
            throw new Error('Response blocked by Gemini safety filters. Try rephrasing your message.');
        }

        const text = candidate?.content?.parts?.[0]?.text;

        if (!text || text.trim() === "") {
            console.error('[Gemini] Empty text in response:', candidate);
            throw new Error('Gemini returned an empty response. Check the model and prompt.');
        }

        console.log('[Gemini] Extracted text length:', text.length);
        return text;
    }

    async *streamChat(messages: Message[], options?: AIOptions): AsyncGenerator<string, void, unknown> {
        if (!this.apiKey) throw new Error("API key required");

        const systemMessage = messages.find(m => m.role === "system")?.content;
        const chatMessages = messages.filter(m => m.role !== "system");

        const contents = chatMessages.map(m => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
        }));

        const model = options?.model || this.model;
        const response = await fetch(
            `${this.baseUrl}/models/${model}:streamGenerateContent?key=${this.apiKey}&alt=sse`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents,
                    systemInstruction: systemMessage ? { parts: [{ text: systemMessage }] } : undefined,
                    generationConfig: {
                        temperature: options?.temperature ?? 0.7,
                        maxOutputTokens: options?.maxTokens ?? 500,
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini error: ${response.status}`);
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
                    const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (content) yield content;
                } catch {
                    // Skip invalid JSON
                }
            }
        }
    }

    async embed(text: string): Promise<number[]> {
        if (!this.apiKey) throw new Error("API key required");

        const response = await fetch(
            `${this.baseUrl}/models/text-embedding-004:embedContent?key=${this.apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: { parts: [{ text }] }
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini embedding error: ${response.status}`);
        }

        const data = await response.json();
        return data.embedding.values;
    }
}
