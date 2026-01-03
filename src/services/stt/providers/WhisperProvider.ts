import { STTProvider, TranscriptionResult, ProviderStatus } from "../../voice/types";

/**
 * Whisper Provider (OpenAI)
 * High-accuracy speech-to-text
 */
export class WhisperProvider implements STTProvider {
    readonly name = "Whisper";
    readonly type = "whisper" as const;
    readonly requiresApiKey = true;

    private apiKey = "";
    private baseUrl = "https://api.openai.com/v1";

    configure(config: { apiKey?: string }): void {
        if (config.apiKey) this.apiKey = config.apiKey;
    }

    async isAvailable(): Promise<ProviderStatus> {
        if (!this.apiKey) {
            return { available: false, error: "API key required" };
        }

        try {
            // Test API key validity
            const response = await fetch(`${this.baseUrl}/models`, {
                headers: { Authorization: `Bearer ${this.apiKey}` },
                signal: AbortSignal.timeout(5000),
            });

            if (response.status === 401) {
                return { available: false, error: "Invalid API key" };
            }

            return { available: response.ok };
        } catch (error) {
            return {
                available: false,
                error: error instanceof Error ? error.message : "Connection failed",
            };
        }
    }

    async transcribe(audio: Blob): Promise<TranscriptionResult> {
        if (!this.apiKey) throw new Error("API key required");

        const formData = new FormData();
        formData.append("file", audio, "audio.webm");
        formData.append("model", "whisper-1");
        formData.append("response_format", "verbose_json");

        const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `Whisper error: ${response.status}`);
        }

        const data = await response.json();

        return {
            text: data.text || "",
            words: data.words?.map((w: { word: string; start: number; end: number }) => ({
                word: w.word,
                start: w.start,
                end: w.end,
            })),
        };
    }
}
