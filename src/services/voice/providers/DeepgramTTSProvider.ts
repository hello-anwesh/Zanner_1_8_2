import { VoiceProvider, VoiceOptions, VoiceInfo, ProviderStatus } from "../types";

/**
 * Deepgram TTS Provider  
 * Low-latency AI text-to-speech
 */
export class DeepgramTTSProvider implements VoiceProvider {
    readonly name = "Deepgram";
    readonly type = "deepgram" as const;
    readonly requiresApiKey = true;

    private apiKey = "";
    private baseUrl = "https://api.deepgram.com/v1";
    private audioElement: HTMLAudioElement | null = null;

    // Available Aura voices
    private readonly voices: VoiceInfo[] = [
        { id: "aura-asteria-en", name: "Asteria", lang: "en-US", category: "Female" },
        { id: "aura-luna-en", name: "Luna", lang: "en-US", category: "Female" },
        { id: "aura-stella-en", name: "Stella", lang: "en-US", category: "Female" },
        { id: "aura-athena-en", name: "Athena", lang: "en-UK", category: "Female" },
        { id: "aura-hera-en", name: "Hera", lang: "en-US", category: "Female" },
        { id: "aura-orion-en", name: "Orion", lang: "en-US", category: "Male" },
        { id: "aura-arcas-en", name: "Arcas", lang: "en-US", category: "Male" },
        { id: "aura-perseus-en", name: "Perseus", lang: "en-US", category: "Male" },
        { id: "aura-angus-en", name: "Angus", lang: "en-Ireland", category: "Male" },
        { id: "aura-orpheus-en", name: "Orpheus", lang: "en-US", category: "Male" },
        { id: "aura-helios-en", name: "Helios", lang: "en-UK", category: "Male" },
        { id: "aura-zeus-en", name: "Zeus", lang: "en-US", category: "Male" },
    ];

    configure(config: { apiKey?: string }): void {
        if (config.apiKey) this.apiKey = config.apiKey;
    }

    async isAvailable(): Promise<ProviderStatus> {
        if (!this.apiKey) {
            return { available: false, error: "API key required" };
        }

        try {
            // Test with a minimal TTS request
            const response = await fetch(`${this.baseUrl}/speak?model=aura-asteria-en`, {
                method: "POST",
                headers: {
                    Authorization: `Token ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: "test" }),
                signal: AbortSignal.timeout(5000),
            });

            if (response.status === 401 || response.status === 403) {
                return { available: false, error: "Invalid API key" };
            }

            return { available: response.ok, voices: this.voices };
        } catch (error) {
            return {
                available: false,
                error: error instanceof Error ? error.message : "Connection failed",
            };
        }
    }

    async getVoices(): Promise<VoiceInfo[]> {
        // Deepgram voices are predefined
        return this.voices;
    }

    async speak(text: string, options?: VoiceOptions): Promise<void> {
        if (!this.apiKey) throw new Error("API key required");

        const model = options?.voice || "aura-asteria-en";

        const response = await fetch(`${this.baseUrl}/speak?model=${model}`, {
            method: "POST",
            headers: {
                Authorization: `Token ${this.apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            throw new Error(`Deepgram error: ${response.status}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        return new Promise((resolve, reject) => {
            this.audioElement = new Audio(audioUrl);
            this.audioElement.volume = options?.volume ?? 0.8;
            this.audioElement.playbackRate = options?.rate ?? 1;

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
