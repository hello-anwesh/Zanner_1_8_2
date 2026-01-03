// Voice Provider Types
export type VoiceProviderType = "system" | "elevenlabs" | "deepgram";
export type STTProviderType = "whisper" | "deepgram";

export interface VoiceInfo {
    id: string;
    name: string;
    lang?: string;
    preview_url?: string;
    category?: string;
}

export interface VoiceOptions {
    voice?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
}

export interface ProviderStatus {
    available: boolean;
    error?: string;
    voices?: VoiceInfo[];
}

export interface VoiceProvider {
    readonly name: string;
    readonly type: VoiceProviderType;
    readonly requiresApiKey: boolean;

    configure(config: { apiKey?: string }): void;
    isAvailable(): Promise<ProviderStatus>;
    getVoices(): Promise<VoiceInfo[]>;
    speak(text: string, options?: VoiceOptions): Promise<void>;
    stop(): void;
}

// STT Types
export interface TranscriptionResult {
    text: string;
    confidence?: number;
    words?: { word: string; start: number; end: number }[];
}

export interface STTProvider {
    readonly name: string;
    readonly type: STTProviderType;
    readonly requiresApiKey: boolean;

    configure(config: { apiKey?: string }): void;
    isAvailable(): Promise<ProviderStatus>;
    transcribe(audio: Blob): Promise<TranscriptionResult>;
    startStream?(onResult: (result: TranscriptionResult) => void): void;
    stopStream?(): void;
}

// Configuration
export interface VoiceConfig {
    enabled: boolean;
    ttsProvider: VoiceProviderType;
    sttProvider: STTProviderType;
    voice?: string;
    rate: number;
    pitch: number;
    volume: number;
    announceStart: boolean;
    announceEnd: boolean;
    announceWarning: boolean;
    apiKeys: {
        elevenlabs?: string;
        deepgram?: string;
        openai?: string; // For Whisper
    };
    messages: VoiceMessages;
}

export interface VoiceMessages {
    focusStart: string;
    focusEnd: string;
    shortBreakStart: string;
    shortBreakEnd: string;
    longBreakStart: string;
    longBreakEnd: string;
    oneMinuteWarning: string;
    paused: string;
    resumed: string;
}

export const DEFAULT_VOICE_CONFIG: VoiceConfig = {
    enabled: true,
    ttsProvider: "system",
    sttProvider: "whisper",
    rate: 1,
    pitch: 1,
    volume: 0.8,
    announceStart: true,
    announceEnd: true,
    announceWarning: true,
    apiKeys: {},
    messages: {
        focusStart: "Focus session started. Good luck!",
        focusEnd: "Great work! Time for a break.",
        shortBreakStart: "Take a short break. Stretch and relax.",
        shortBreakEnd: "Break's over. Ready to focus?",
        longBreakStart: "Time for a long break. You've earned it!",
        longBreakEnd: "Long break complete. Ready when you are.",
        oneMinuteWarning: "One minute remaining.",
        paused: "Timer paused.",
        resumed: "Timer resumed.",
    },
};
