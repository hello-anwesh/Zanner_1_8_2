import { VoiceProvider, VoiceOptions, VoiceInfo, ProviderStatus } from "../types";

/**
 * ElevenLabs Provider
 * Premium AI voices with natural speech
 */
export class ElevenLabsProvider implements VoiceProvider {
    readonly name = "ElevenLabs";
    readonly type = "elevenlabs" as const;
    readonly requiresApiKey = true;

    private apiKey = "";
    private baseUrl = "https://api.elevenlabs.io/v1";
    private audioElement: HTMLAudioElement | null = null;

    configure(config: { apiKey?: string }): void {
        if (config.apiKey) this.apiKey = config.apiKey;
    }

    async isAvailable(): Promise<ProviderStatus> {
        if (!this.apiKey) {
            return { available: false, error: "API key required" };
        }

        try {
            const response = await fetch(`${this.baseUrl}/voices`, {
                headers: { "xi-api-key": this.apiKey },
                signal: AbortSignal.timeout(5000),
            });

            if (response.status === 401) {
                return { available: false, error: "Invalid API key" };
            }

            if (!response.ok) {
                return { available: false, error: `API error: ${response.status}` };
            }

            const data = await response.json();
            const voices = (data.voices || []).map((v: { voice_id: string; name: string; category: string; preview_url: string }) => ({
                id: v.voice_id,
                name: v.name,
                category: v.category,
                preview_url: v.preview_url,
            }));

            return { available: true, voices };
        } catch (error) {
            return {
                available: false,
                error: error instanceof Error ? error.message : "Connection failed",
            };
        }
    }

    async getVoices(): Promise<VoiceInfo[]> {
        if (!this.apiKey) return [];

        try {
            const response = await fetch(`${this.baseUrl}/voices`, {
                headers: { "xi-api-key": this.apiKey },
            });

            if (!response.ok) return [];

            const data = await response.json();
            return (data.voices || []).map((v: { voice_id: string; name: string; category: string; labels?: { accent?: string }; preview_url: string }) => ({
                id: v.voice_id,
                name: v.name,
                category: v.category,
                lang: v.labels?.accent || "en",
                preview_url: v.preview_url,
            }));
        } catch {
            return [];
        }
    }

    async speak(text: string, options?: VoiceOptions): Promise<void> {
        if (!this.apiKey) throw new Error("API key required");

        const voiceId = options?.voice || "21m00Tcm4TlvDq8ikWAM"; // Rachel (default)

        const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
            method: "POST",
            headers: {
                "xi-api-key": this.apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text,
                model_id: "eleven_turbo_v2_5",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`ElevenLabs error: ${response.status}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        return new Promise((resolve, reject) => {
            this.audioElement = new Audio(audioUrl);
            this.audioElement.volume = options?.volume ?? 0.8;

            this.audioElement.onended = () => {
                URL.revokeObjectURL(audioUrl);
                resolve();
            };

            this.audioElement.onerror = () => {
                URL.revokeObjectURL(audioUrl);
                reject(new Error("Audio playback failed"));
            };

            this.audioElement.play().catch(reject);
        });
    }

    stop(): void {
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement = null;
        }
    }
}
