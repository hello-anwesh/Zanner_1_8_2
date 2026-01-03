import { VoiceProvider, VoiceOptions, VoiceInfo, ProviderStatus } from "../types";

/**
 * System Voice Provider
 * Uses the Web Speech API - no API key required, works offline
 */
export class SystemVoiceProvider implements VoiceProvider {
    readonly name = "System Voice";
    readonly type = "system" as const;
    readonly requiresApiKey = false;

    private synth: SpeechSynthesis;
    private voicesLoaded = false;
    private voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

    constructor() {
        this.synth = window.speechSynthesis;
    }

    configure(_config: { apiKey?: string }): void {
        // No configuration needed for system voice
    }

    async isAvailable(): Promise<ProviderStatus> {
        if (!this.synth) {
            return { available: false, error: "Speech synthesis not supported" };
        }

        try {
            const voices = await this.loadVoices();
            return {
                available: true,
                voices: voices.map((v) => ({
                    id: v.voiceURI,
                    name: v.name,
                    lang: v.lang,
                })),
            };
        } catch (error) {
            return {
                available: false,
                error: error instanceof Error ? error.message : "Failed to load voices",
            };
        }
    }

    private async loadVoices(): Promise<SpeechSynthesisVoice[]> {
        if (this.voicesLoaded) {
            return this.synth.getVoices();
        }

        if (this.voicesPromise) {
            return this.voicesPromise;
        }

        this.voicesPromise = new Promise((resolve) => {
            const voices = this.synth.getVoices();
            if (voices.length > 0) {
                this.voicesLoaded = true;
                resolve(voices);
                return;
            }

            // Voices may load asynchronously
            const handleVoicesChanged = () => {
                const v = this.synth.getVoices();
                if (v.length > 0) {
                    this.voicesLoaded = true;
                    this.synth.removeEventListener("voiceschanged", handleVoicesChanged);
                    resolve(v);
                }
            };

            this.synth.addEventListener("voiceschanged", handleVoicesChanged);

            // Timeout fallback
            setTimeout(() => {
                this.voicesLoaded = true;
                resolve(this.synth.getVoices());
            }, 1000);
        });

        return this.voicesPromise;
    }

    async getVoices(): Promise<VoiceInfo[]> {
        const voices = await this.loadVoices();
        return voices.map((v) => ({
            id: v.voiceURI,
            name: v.name,
            lang: v.lang,
            category: v.localService ? "Local" : "Network",
        }));
    }

    async speak(text: string, options?: VoiceOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.synth) {
                reject(new Error("Speech synthesis not supported"));
                return;
            }

            // Cancel any ongoing speech
            this.synth.cancel();

            const utterance = new SpeechSynthesisUtterance(text);

            // Set voice if specified
            if (options?.voice) {
                const voices = this.synth.getVoices();
                const voice = voices.find((v) => v.voiceURI === options.voice || v.name === options.voice);
                if (voice) utterance.voice = voice;
            }

            // Set options
            utterance.rate = options?.rate ?? 1;
            utterance.pitch = options?.pitch ?? 1;
            utterance.volume = options?.volume ?? 1;

            utterance.onend = () => resolve();
            utterance.onerror = (e) => reject(new Error(e.error));

            this.synth.speak(utterance);
        });
    }

    stop(): void {
        if (this.synth) {
            this.synth.cancel();
        }
    }
}
