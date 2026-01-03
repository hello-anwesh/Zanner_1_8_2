import { X, Settings as SettingsIcon, Clock, Zap, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "../hooks/useSettings";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    accent: string;
    theme: string;
    themes: any;
    onThemeChange: (theme: string) => void;
}

export function SettingsModal({ isOpen, onClose, accent, theme, themes, onThemeChange }: SettingsModalProps) {
    const { settings, updateSetting } = useSettings();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40"
                        style={{
                            background: "radial-gradient(circle at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.85) 100%)",
                            backdropFilter: "blur(8px)"
                        }}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 40 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-0 m-auto z-50 w-full max-w-2xl h-fit max-h-[85vh] overflow-hidden"
                        style={{
                            background: "linear-gradient(160deg, rgba(12,12,18,0.95) 0%, rgba(8,8,12,0.98) 100%)",
                            backdropFilter: "blur(80px) saturate(200%)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "32px",
                            boxShadow: `0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05), inset 0 0 60px rgba(${parseInt(accent.slice(1, 3), 16)}, ${parseInt(accent.slice(3, 5), 16)}, ${parseInt(accent.slice(5, 7), 16)}, 0.05)`
                        }}
                    >
                        {/* Ambient Glow Effects */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-[120px]" style={{ background: `radial-gradient(circle, ${accent}20 0%, transparent 70%)` }} />
                            <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-[120px]" style={{ background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)` }} />
                        </div>

                        {/* Header */}
                        <div className="relative p-8 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div
                                        className="p-5 rounded-3xl relative overflow-hidden group"
                                        style={{
                                            background: `linear-gradient(135deg, ${accent} 0%, ${accent}DD 100%)`,
                                            boxShadow: `0 12px 40px ${accent}40, inset 0 2px 0 rgba(255,255,255,0.3)`
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 blur-xl group-hover:blur-2xl transition-all" />
                                        <SettingsIcon size={28} color="#000" strokeWidth={2.5} className="relative z-10" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold tracking-tight mb-1">Settings</h2>
                                        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Customize your focus experience</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-3 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95"
                                    style={{ background: "rgba(255,255,255,0.05)" }}
                                >
                                    <X size={20} style={{ color: "rgba(255,255,255,0.5)" }} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="relative overflow-y-auto max-h-[calc(85vh-120px)] p-8 space-y-8 custom-scrollbar">
                            {/* Timer Durations */}
                            <section className="space-y-5">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-xl" style={{ background: `${accent}15` }}>
                                        <Clock size={20} style={{ color: accent }} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg tracking-tight">Timer Durations</h3>
                                        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Set session lengths in minutes</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { label: "Focus", value: settings.workDuration, key: "workDuration", icon: "🎯" },
                                        { label: "Short Break", value: settings.shortBreakDuration, key: "shortBreakDuration", icon: "☕" },
                                        { label: "Long Break", value: settings.longBreakDuration, key: "longBreakDuration", icon: "🌴" }
                                    ].map(({ label, value, key, icon }) => (
                                        <div
                                            key={key}
                                            className="group relative overflow-hidden rounded-2xl p-5"
                                            style={{
                                                background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                                                border: "1px solid rgba(255,255,255,0.08)",
                                                backdropFilter: "blur(20px)",
                                                boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)"
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <label className="block space-y-3 relative z-10">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xl">{icon}</span>
                                                    <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>{label}</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    value={value}
                                                    onChange={(e) => updateSetting(key as any, Number(e.target.value))}
                                                    className="w-full bg-black/30 rounded-xl px-4 py-3 text-white font-bold text-lg outline-none transition-all duration-300"
                                                    style={{
                                                        border: `1px solid rgba(255,255,255,0.1)`,
                                                        boxShadow: "inset 0 2px 8px rgba(0,0,0,0.3)"
                                                    }}
                                                    onFocus={(e) => {
                                                        e.target.style.borderColor = accent;
                                                        e.target.style.boxShadow = `0 0 0 3px ${accent}30, inset 0 2px 8px rgba(0,0,0,0.3)`;
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.borderColor = "rgba(255,255,255,0.1)";
                                                        e.target.style.boxShadow = "inset 0 2px 8px rgba(0,0,0,0.3)";
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Behavior */}
                            <section className="space-y-5">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-xl" style={{ background: `${accent}15` }}>
                                        <Zap size={20} style={{ color: accent }} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg tracking-tight">Auto-Start Behavior</h3>
                                        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Automatically start next session</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { label: "Auto-start Breaks", key: "autoStartBreaks", desc: "Automatically begin break sessions" },
                                        { label: "Auto-start Focus", key: "autoStartWork", desc: "Automatically begin focus sessions" }
                                    ].map(({ label, key, desc }) => (
                                        <label
                                            key={key}
                                            className="group flex items-center justify-between p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.01]"
                                            style={{
                                                background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
                                                border: "1px solid rgba(255,255,255,0.06)",
                                                backdropFilter: "blur(20px)"
                                            }}
                                        >
                                            <div>
                                                <span className="font-semibold text-white/90 group-hover:text-white transition-colors">{label}</span>
                                                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>{desc}</p>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={settings[key as keyof typeof settings] as boolean}
                                                    onChange={(e) => updateSetting(key as any, e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div
                                                    className="w-14 h-8 rounded-full transition-all duration-300 peer-checked:shadow-lg"
                                                    style={{
                                                        background: settings[key as keyof typeof settings]
                                                            ? `linear-gradient(135deg, ${accent} 0%, ${accent}DD 100%)`
                                                            : "rgba(255,255,255,0.1)",
                                                        boxShadow: settings[key as keyof typeof settings]
                                                            ? `0 4px 16px ${accent}50, inset 0 1px 0 rgba(255,255,255,0.3)`
                                                            : "inset 0 2px 4px rgba(0,0,0,0.3)"
                                                    }}
                                                >
                                                    <div
                                                        className="w-6 h-6 bg-white rounded-full transition-all duration-300 absolute top-1 shadow-lg"
                                                        style={{
                                                            left: settings[key as keyof typeof settings] ? "28px" : "4px",
                                                            boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </section>

                            {/* AI Provider */}
                            <section className="space-y-5">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-xl" style={{ background: `${accent}15` }}>
                                        <Sparkles size={20} style={{ color: accent }} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg tracking-tight">AI Companion</h3>
                                        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Choose your AI provider</p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <select
                                        value={settings.aiProvider}
                                        onChange={(e) => updateSetting("aiProvider", e.target.value as any)}
                                        className="w-full appearance-none rounded-2xl px-6 py-4 text-white font-semibold outline-none transition-all duration-300 cursor-pointer"
                                        style={{
                                            background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            backdropFilter: "blur(20px)",
                                            boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)"
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = accent;
                                            e.target.style.boxShadow = `0 0 0 3px ${accent}30, 0 4px 24px rgba(0,0,0,0.2)`;
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = "rgba(255,255,255,0.1)";
                                            e.target.style.boxShadow = "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)";
                                        }}
                                    >
                                        <option value="local" style={{ background: "#1A1A1A", color: "#fff" }}>🤖 Local (Ollama)</option>
                                        <option value="openai" style={{ background: "#1A1A1A", color: "#fff" }}>☁️ OpenAI / Cloud</option>
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                                            <path d="M1 1L6 6L11 1" stroke={accent} strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                </div>
                            </section>

                            {/* Theme Selector */}
                            <section className="space-y-5">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-xl" style={{ background: `${accent}15` }}>
                                        <div className="w-5 h-5 rounded-full" style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}80 100%)` }} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg tracking-tight">Color Theme</h3>
                                        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Choose your accent color</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-5 gap-4">
                                    {Object.entries(themes).map(([key, themeData]: [string, any]) => (
                                        <button
                                            key={key}
                                            onClick={() => onThemeChange(key)}
                                            className="group relative aspect-square rounded-2xl transition-all duration-500 hover:scale-110"
                                            style={{
                                                background: `linear-gradient(135deg, ${themeData.accent} 0%, ${themeData.accent}CC 100%)`,
                                                boxShadow: theme === key
                                                    ? `0 0 0 3px rgba(0,0,0,0.5), 0 0 0 6px ${themeData.accent}, 0 12px 40px ${themeData.accent}60, inset 0 2px 0 rgba(255,255,255,0.3)`
                                                    : `0 6px 24px ${themeData.accent}40, inset 0 2px 0 rgba(255,255,255,0.2)`,
                                                transform: theme === key ? "scale(1.1)" : "scale(1)"
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            {theme === key && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-3 h-3 bg-black rounded-full shadow-xl" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
