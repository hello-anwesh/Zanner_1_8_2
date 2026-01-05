import { useState, useEffect } from "react";
import { X, Clock, Brain, Music2, Palette, Sparkles, ChevronRight } from "lucide-react";
import { TimerSection } from "./sections/TimerSection";
import { SoundsSection } from "./sections/SoundsSection";
import { AppearanceSection } from "./sections/AppearanceSection";
import { AISection } from "./sections/AISection";
import { configService } from "../../services/config/ConfigService";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    accent: string;
    theme: string;
    themes: Record<string, any>;
    onThemeChange: (theme: string) => void;
}

type Tab = "general" | "ai" | "sounds" | "appearance";

export function SettingsModal({ isOpen, onClose, accent, theme, themes, onThemeChange }: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState<Tab>("general");
    const [timerConfig, setTimerConfig] = useState({
        focusDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        autoStartBreaks: false,
        autoStartFocus: false,
        sessionsUntilLongBreak: 4,
    });
    const [aiProvider, setAiProvider] = useState("ollama");
    const [ttsProvider, setTtsProvider] = useState("system");
    const [sttProvider, setSttProvider] = useState("system");
    const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            const saved = configService.getTimer();
            setTimerConfig({
                focusDuration: saved.focusDuration,
                shortBreakDuration: saved.shortBreakDuration,
                longBreakDuration: saved.longBreakDuration,
                autoStartBreaks: saved.autoStartBreaks,
                autoStartFocus: saved.autoStartFocus,
                sessionsUntilLongBreak: saved.longBreakInterval,
            });
        }
    }, [isOpen]);

    const handleTimerChange = (key: string, value: any) => {
        setTimerConfig(prev => ({ ...prev, [key]: value }));
        const keyMap: Record<string, string> = {
            focusDuration: "focusDuration",
            shortBreakDuration: "shortBreakDuration",
            longBreakDuration: "longBreakDuration",
            autoStartBreaks: "autoStartBreaks",
            autoStartFocus: "autoStartFocus",
            sessionsUntilLongBreak: "longBreakInterval",
        };
        configService.updateTimer({ [keyMap[key] || key]: value });
    };

    const handleProviderChange = (category: "ai" | "tts" | "stt", provider: string) => {
        if (category === "ai") {
            setAiProvider(provider);
            configService.updateAI({ activeProvider: provider as any });
        } else if (category === "tts") {
            setTtsProvider(provider);
            configService.updateVoice({ ttsProvider: provider as any });
        } else {
            setSttProvider(provider);
            configService.updateVoice({ sttProvider: provider as any });
        }
    };

    const handleApiKeyChange = (provider: string, key: string) => {
        setApiKeys(prev => ({ ...prev, [provider]: key }));
        const current = configService.getVoice();
        configService.updateVoice({
            apiKeys: { ...current.apiKeys, [provider]: key }
        });
    };

    if (!isOpen) return null;

    const tabs = [
        { id: "general" as Tab, icon: Clock, label: "Timer", desc: "Focus & break durations", color: "#3B82F6" },
        { id: "ai" as Tab, icon: Brain, label: "AI & Voice", desc: "Providers & API keys", color: "#8B5CF6" },
        { id: "sounds" as Tab, icon: Music2, label: "Sound Library", desc: "Music & frequencies", color: "#10B981" },
        { id: "appearance" as Tab, icon: Palette, label: "Appearance", desc: "Theme & colors", color: "#F59E0B" },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            {/* Backdrop with gradient */}
            <div
                className="absolute inset-0"
                style={{
                    background: "radial-gradient(circle at 50% 30%, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.95) 100%)",
                    backdropFilter: "blur(20px)",
                }}
                onClick={onClose}
            />

            {/* Modal Container */}
            <div
                className="relative w-full max-w-5xl h-[90vh] max-h-[800px] flex rounded-3xl overflow-hidden shadow-2xl"
                style={{
                    background: "linear-gradient(165deg, rgba(26,26,31,0.98) 0%, rgba(10,10,13,0.99) 100%)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: `0 0 0 1px rgba(0,0,0,0.3), 0 25px 80px -15px rgba(0,0,0,0.8), 0 0 120px -40px ${accent}30`,
                }}
            >
                {/* Left Sidebar Navigation */}
                <div
                    className="w-64 shrink-0 flex flex-col"
                    style={{
                        background: "rgba(0,0,0,0.4)",
                        borderRight: "1px solid rgba(255,255,255,0.04)",
                    }}
                >
                    {/* Logo Header */}
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-1">
                            <div
                                className="w-11 h-11 rounded-2xl flex items-center justify-center"
                                style={{
                                    background: `linear-gradient(135deg, ${accent}30 0%, ${accent}10 100%)`,
                                    border: `1px solid ${accent}30`,
                                }}
                            >
                                <Sparkles size={20} style={{ color: accent }} />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-white">Settings</h2>
                                <p className="text-[11px] text-white/30">Configure Chronos</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <nav className="flex-1 px-3 py-2 space-y-1">
                        {tabs.map(tab => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className="group w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200"
                                    style={{
                                        background: isActive
                                            ? `linear-gradient(135deg, ${tab.color}15 0%, transparent 100%)`
                                            : "transparent",
                                        border: isActive
                                            ? `1px solid ${tab.color}25`
                                            : "1px solid transparent",
                                    }}
                                >
                                    <div
                                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                                        style={{
                                            background: isActive ? `${tab.color}20` : "rgba(255,255,255,0.03)",
                                        }}
                                    >
                                        <tab.icon
                                            size={17}
                                            strokeWidth={1.8}
                                            style={{ color: isActive ? tab.color : "rgba(255,255,255,0.4)" }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className="text-[13px] font-medium transition-colors duration-200"
                                            style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.6)" }}
                                        >
                                            {tab.label}
                                        </p>
                                        <p className="text-[10px] text-white/25 truncate">{tab.desc}</p>
                                    </div>
                                    <ChevronRight
                                        size={14}
                                        className="transition-all duration-200"
                                        style={{
                                            color: isActive ? tab.color : "transparent",
                                            opacity: isActive ? 0.6 : 0,
                                        }}
                                    />
                                </button>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 mx-3 mb-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
                        <p className="text-[10px] text-white/20 text-center">Chronos v1.0</p>
                        <p className="text-[9px] text-white/10 text-center mt-0.5">Focus Timer Pro</p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header Bar */}
                    <div
                        className="flex items-center justify-between px-8 py-5"
                        style={{
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                            background: "rgba(0,0,0,0.2)",
                        }}
                    >
                        <div>
                            <h3 className="text-xl font-semibold text-white tracking-tight">
                                {tabs.find(t => t.id === activeTab)?.label}
                            </h3>
                            <p className="text-sm text-white/30 mt-0.5">
                                {tabs.find(t => t.id === activeTab)?.desc}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                            style={{
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.08)",
                            }}
                        >
                            <X size={18} className="text-white/50" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-8">
                            {activeTab === "general" && (
                                <TimerSection
                                    config={timerConfig}
                                    onChange={handleTimerChange}
                                    accent={accent}
                                />
                            )}

                            {activeTab === "ai" && (
                                <AISection
                                    aiProvider={aiProvider}
                                    ttsProvider={ttsProvider}
                                    sttProvider={sttProvider}
                                    apiKeys={apiKeys}
                                    onProviderChange={handleProviderChange}
                                    onApiKeyChange={handleApiKeyChange}
                                    accent={accent}
                                />
                            )}

                            {activeTab === "sounds" && (
                                <SoundsSection accent={accent} />
                            )}

                            {activeTab === "appearance" && (
                                <AppearanceSection
                                    theme={theme}
                                    themes={themes}
                                    onThemeChange={onThemeChange}
                                    accent={accent}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
