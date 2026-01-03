import { AIConfig, DEFAULT_AI_CONFIG } from "../ai/types";
import { VoiceConfig, DEFAULT_VOICE_CONFIG } from "../voice/types";

// Timer configuration
export interface TimerConfig {
    focusDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    longBreakInterval: number;
    autoStartBreaks: boolean;
    autoStartFocus: boolean;
    dailyGoal: number;
}

// UI configuration
export interface UIConfig {
    theme: string;
    isDark: boolean;
    sidebarOpen: boolean;
    soundEnabled: boolean;
}

// Complete application configuration
export interface AppConfig {
    ai: AIConfig;
    voice: VoiceConfig;
    timer: TimerConfig;
    ui: UIConfig;
}

const DEFAULT_TIMER_CONFIG: TimerConfig = {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartFocus: false,
    dailyGoal: 8,
};

const DEFAULT_UI_CONFIG: UIConfig = {
    theme: "ocean",
    isDark: true,
    sidebarOpen: true,
    soundEnabled: true,
};

const DEFAULT_CONFIG: AppConfig = {
    ai: DEFAULT_AI_CONFIG,
    voice: DEFAULT_VOICE_CONFIG,
    timer: DEFAULT_TIMER_CONFIG,
    ui: DEFAULT_UI_CONFIG,
};

const STORAGE_KEY = "chronos_config";

class ConfigService {
    private config: AppConfig = DEFAULT_CONFIG;
    private listeners: Set<(config: AppConfig) => void> = new Set();

    constructor() {
        this.load();
    }

    private load(): void {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.config = this.deepMerge(DEFAULT_CONFIG, parsed);
            }
        } catch (error) {
            console.error("Failed to load config:", error);
            this.config = DEFAULT_CONFIG;
        }
    }

    private save(): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
        } catch (error) {
            console.error("Failed to save config:", error);
        }
    }

    private deepMerge(target: AppConfig, source: Partial<AppConfig>): AppConfig {
        const result = { ...target };

        if (source.ai) {
            result.ai = { ...target.ai, ...source.ai };
            if (source.ai.providers) {
                result.ai.providers = {
                    ...target.ai.providers,
                    ...source.ai.providers,
                };
            }
        }
        if (source.voice) {
            result.voice = { ...target.voice, ...source.voice };
            if (source.voice.apiKeys) {
                result.voice.apiKeys = {
                    ...target.voice.apiKeys,
                    ...source.voice.apiKeys,
                };
            }
        }
        if (source.timer) {
            result.timer = { ...target.timer, ...source.timer };
        }
        if (source.ui) {
            result.ui = { ...target.ui, ...source.ui };
        }

        return result;
    }

    get(): AppConfig {
        return { ...this.config };
    }

    getAI(): AIConfig {
        return { ...this.config.ai };
    }

    getVoice(): VoiceConfig {
        return { ...this.config.voice };
    }

    getTimer(): TimerConfig {
        return { ...this.config.timer };
    }

    getUI(): UIConfig {
        return { ...this.config.ui };
    }

    update(updates: Partial<AppConfig>): void {
        this.config = this.deepMerge(this.config, updates);
        this.save();
        this.notifyListeners();
    }

    updateAI(updates: Partial<AIConfig>): void {
        this.update({ ai: { ...this.config.ai, ...updates } });
    }

    updateVoice(updates: Partial<VoiceConfig>): void {
        this.update({ voice: { ...this.config.voice, ...updates } });
    }

    updateTimer(updates: Partial<TimerConfig>): void {
        this.update({ timer: { ...this.config.timer, ...updates } });
    }

    updateUI(updates: Partial<UIConfig>): void {
        this.update({ ui: { ...this.config.ui, ...updates } });
    }

    subscribe(listener: (config: AppConfig) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(): void {
        this.listeners.forEach((listener) => listener(this.config));
    }

    reset(): void {
        this.config = DEFAULT_CONFIG;
        this.save();
        this.notifyListeners();
    }
}

// Singleton instance
export const configService = new ConfigService();
