import { VoiceProvider, VoiceProviderType, VoiceInfo, VoiceConfig, DEFAULT_VOICE_CONFIG, STTProvider, STTProviderType, TranscriptionResult } from "./types";
import { SystemVoiceProvider } from "./providers/SystemVoiceProvider";
import { ElevenLabsProvider } from "./providers/ElevenLabsProvider";
import { DeepgramTTSProvider } from "./providers/DeepgramTTSProvider";
import { WhisperProvider } from "../stt/providers/WhisperProvider";
import { DeepgramSTTProvider } from "../stt/providers/DeepgramSTTProvider";
import { eventBus, TimerEvent, TimerMode } from "../events/EventBus";

interface ProviderStatus {
    available: boolean;
    error?: string;
    voices?: VoiceInfo[];
}

/**
 * Voice Service
 * Orchestrates TTS and STT providers with event subscriptions
 */
class VoiceService {
    private config: VoiceConfig = DEFAULT_VOICE_CONFIG;

    // TTS
    private ttsProviders: Map<VoiceProviderType, VoiceProvider> = new Map();
    private activeTTSProvider: VoiceProvider | null = null;

    // STT
    private sttProviders: Map<STTProviderType, STTProvider> = new Map();
    private activeSTTProvider: STTProvider | null = null;
    private isListening = false;

    // Status
    private ttsStatus: Map<VoiceProviderType, ProviderStatus> = new Map();
    private sttStatus: Map<STTProviderType, ProviderStatus> = new Map();

    private unsubscribers: (() => void)[] = [];
    private listeners: Set<() => void> = new Set();

    constructor() {
        // Register TTS providers
        this.ttsProviders.set("system", new SystemVoiceProvider());
        this.ttsProviders.set("elevenlabs", new ElevenLabsProvider());
        this.ttsProviders.set("deepgram", new DeepgramTTSProvider());

        // Register STT providers
        this.sttProviders.set("whisper", new WhisperProvider());
        this.sttProviders.set("deepgram", new DeepgramSTTProvider());
    }

    // ============================================================
    // Configuration
    // ============================================================

    async initialize(config?: Partial<VoiceConfig>): Promise<void> {
        if (config) {
            this.config = { ...this.config, ...config };
        }

        // Configure all TTS providers
        for (const provider of this.ttsProviders.values()) {
            if (provider.requiresApiKey) {
                const apiKey = this.config.apiKeys[provider.type as keyof typeof this.config.apiKeys];
                provider.configure({ apiKey });
            }
        }

        // Configure all STT providers
        for (const provider of this.sttProviders.values()) {
            const apiKey = provider.type === "whisper"
                ? this.config.apiKeys.openai
                : this.config.apiKeys[provider.type as keyof typeof this.config.apiKeys];
            provider.configure({ apiKey });
        }

        // Set active providers
        await this.setTTSProvider(this.config.ttsProvider);
        await this.setSTTProvider(this.config.sttProvider);

        // Setup event listeners
        this.setupEventListeners();
    }

    updateConfig(updates: Partial<VoiceConfig>): void {
        this.config = { ...this.config, ...updates };

        // Re-configure providers if API keys changed
        if (updates.apiKeys) {
            for (const provider of this.ttsProviders.values()) {
                if (provider.requiresApiKey) {
                    const apiKey = this.config.apiKeys[provider.type as keyof typeof this.config.apiKeys];
                    provider.configure({ apiKey });
                }
            }
            for (const provider of this.sttProviders.values()) {
                const apiKey = provider.type === "whisper"
                    ? this.config.apiKeys.openai
                    : this.config.apiKeys[provider.type as keyof typeof this.config.apiKeys];
                provider.configure({ apiKey });
            }
        }

        this.notifyListeners();
    }

    getConfig(): VoiceConfig {
        return { ...this.config };
    }

    // ============================================================
    // TTS Provider Management
    // ============================================================

    getTTSProviders(): { type: VoiceProviderType; name: string; requiresApiKey: boolean }[] {
        return Array.from(this.ttsProviders.entries()).map(([type, provider]) => ({
            type,
            name: provider.name,
            requiresApiKey: provider.requiresApiKey,
        }));
    }

    async setTTSProvider(type: VoiceProviderType): Promise<boolean> {
        const provider = this.ttsProviders.get(type);
        if (!provider) return false;

        this.activeTTSProvider = provider;
        this.config.ttsProvider = type;

        await this.checkTTSProvider(type);
        this.notifyListeners();

        return this.ttsStatus.get(type)?.available || false;
    }

    async checkTTSProvider(type: VoiceProviderType): Promise<ProviderStatus> {
        const provider = this.ttsProviders.get(type);
        if (!provider) return { available: false, error: "Provider not found" };

        const status = await provider.isAvailable();
        this.ttsStatus.set(type, status);
        this.notifyListeners();

        return status;
    }

    getTTSStatus(type: VoiceProviderType): ProviderStatus | undefined {
        return this.ttsStatus.get(type);
    }

    async getVoices(type?: VoiceProviderType): Promise<VoiceInfo[]> {
        const provider = type ? this.ttsProviders.get(type) : this.activeTTSProvider;
        if (!provider) return [];

        try {
            return await provider.getVoices();
        } catch {
            return [];
        }
    }

    // ============================================================
    // STT Provider Management
    // ============================================================

    getSTTProviders(): { type: STTProviderType; name: string; requiresApiKey: boolean }[] {
        return Array.from(this.sttProviders.entries()).map(([type, provider]) => ({
            type,
            name: provider.name,
            requiresApiKey: provider.requiresApiKey,
        }));
    }

    async setSTTProvider(type: STTProviderType): Promise<boolean> {
        const provider = this.sttProviders.get(type);
        if (!provider) return false;

        this.activeSTTProvider = provider;
        this.config.sttProvider = type;

        await this.checkSTTProvider(type);
        this.notifyListeners();

        return this.sttStatus.get(type)?.available || false;
    }

    async checkSTTProvider(type: STTProviderType): Promise<ProviderStatus> {
        const provider = this.sttProviders.get(type);
        if (!provider) return { available: false, error: "Provider not found" };

        const status = await provider.isAvailable();
        this.sttStatus.set(type, status);
        this.notifyListeners();

        return status;
    }

    getSTTStatus(type: STTProviderType): ProviderStatus | undefined {
        return this.sttStatus.get(type);
    }

    // ============================================================
    // Speech Functions
    // ============================================================

    async speak(text: string): Promise<void> {
        if (!this.config.enabled || !this.activeTTSProvider) return;

        try {
            await this.activeTTSProvider.speak(text, {
                voice: this.config.voice,
                rate: this.config.rate,
                pitch: this.config.pitch,
                volume: this.config.volume,
            });
        } catch (error) {
            console.error("TTS error:", error);
        }
    }

    stop(): void {
        this.activeTTSProvider?.stop();
    }

    async transcribe(audio: Blob): Promise<TranscriptionResult | null> {
        if (!this.activeSTTProvider) return null;

        try {
            return await this.activeSTTProvider.transcribe(audio);
        } catch (error) {
            console.error("STT error:", error);
            return null;
        }
    }

    async startListening(onResult: (result: TranscriptionResult) => void): Promise<void> {
        if (!this.activeSTTProvider?.startStream) {
            throw new Error("Streaming not supported by current STT provider");
        }

        this.isListening = true;
        await this.activeSTTProvider.startStream(onResult);
        this.notifyListeners();
    }

    stopListening(): void {
        if (this.activeSTTProvider?.stopStream) {
            this.activeSTTProvider.stopStream();
        }
        this.isListening = false;
        this.notifyListeners();
    }

    getIsListening(): boolean {
        return this.isListening;
    }

    // ============================================================
    // Event Handling
    // ============================================================

    private setupEventListeners(): void {
        // Clean up existing listeners
        this.unsubscribers.forEach(unsub => unsub());
        this.unsubscribers = [];

        // Subscribe to timer events
        const handleTimerEvent = (event: TimerEvent) => {
            if (!this.config.enabled) return;

            const { messages } = this.config;

            switch (event.type) {
                case "SESSION_START":
                    if (this.config.announceStart) {
                        this.speak(this.getStartMessage(event.mode, messages));
                    }
                    break;
                case "SESSION_END":
                    if (this.config.announceEnd) {
                        this.speak(this.getEndMessage(event.mode, messages));
                    }
                    break;
                case "BREAK_WARNING":
                    if (this.config.announceWarning) {
                        this.speak(messages.oneMinuteWarning);
                    }
                    break;
                case "SESSION_PAUSE":
                    this.speak(messages.paused);
                    break;
                case "SESSION_RESUME":
                    this.speak(messages.resumed);
                    break;
            }
        };

        this.unsubscribers.push(
            eventBus.on("SESSION_START", handleTimerEvent),
            eventBus.on("SESSION_END", handleTimerEvent),
            eventBus.on("SESSION_PAUSE", handleTimerEvent),
            eventBus.on("SESSION_RESUME", handleTimerEvent),
            eventBus.on("BREAK_WARNING", handleTimerEvent)
        );
    }

    private getStartMessage(mode: TimerMode, messages: VoiceConfig["messages"]): string {
        switch (mode) {
            case "focus": return messages.focusStart;
            case "shortBreak": return messages.shortBreakStart;
            case "longBreak": return messages.longBreakStart;
            default: return "";
        }
    }

    private getEndMessage(mode: TimerMode, messages: VoiceConfig["messages"]): string {
        switch (mode) {
            case "focus": return messages.focusEnd;
            case "shortBreak": return messages.shortBreakEnd;
            case "longBreak": return messages.longBreakEnd;
            default: return "";
        }
    }

    // ============================================================
    // Subscriptions
    // ============================================================

    subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener());
    }

    destroy(): void {
        this.unsubscribers.forEach(unsub => unsub());
        this.unsubscribers = [];
    }
}

// Singleton
export const voiceService = new VoiceService();

