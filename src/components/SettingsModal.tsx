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
                            backdropFilter: "blur(12px)"
                        }}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 40 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-0 m-auto z-50 w-full max-w-3xl h-fit max-h-[88vh] overflow-hidden"
                        style={{
                            background: "linear-gradient(160deg, rgba(16,16,24,0.96) 0%, rgba(10,10,16,0.98) 100%)",
                            backdropFilter: "blur(80px) saturate(200%)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: "32px",
                            boxShadow: `0 32px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)`,
                            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                        }}
                    >
                        {/* Ambient Glow Effects */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                                transition={{ duration: 8, repeat: Infinity }}
                                className="absolute -top-60 -right-60 w-[500px] h-[500px] rounded-full blur-[140px]"
                                style={{ background: `radial-gradient(circle, ${accent}40 0%, transparent 70%)` }}
                            />
                            <motion.div
                                animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
                                transition={{ duration: 10, repeat: Infinity, delay: 2 }}
                                className="absolute -bottom-60 -left-60 w-[500px] h-[500px] rounded-full blur-[140px]"
                                style={{ background: `radial-gradient(circle, ${accent}30 0%, transparent 70%)` }}
                            />
                        </div>

                        {/* Header */}
                        <div className="relative px-12 py-10 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <motion.div
                                        whileHover={{ scale: 1.05, rotate: 5 }}
                                        className="p-5 rounded-[22px] relative overflow-hidden"
                                        style={{
                                            background: `linear-gradient(135deg, ${accent} 0%, ${accent}DD 100%)`,
                                            boxShadow: `0 16px 48px ${accent}50, inset 0 2px 0 rgba(255,255,255,0.3)`
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 blur-xl" />
                                        <SettingsIcon size={32} color="#000" strokeWidth={2.5} className="relative z-10" />
                                    </motion.div>
                                    <div>
                                        <h2 className="text-3xl font-black tracking-tight mb-2 text-white leading-none">Settings</h2>
                                        <p className="text-base font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>Customize your focus experience</p>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="p-3.5 rounded-2xl transition-all"
                                    style={{ background: "rgba(255,255,255,0.06)" }}
                                >
                                    <X size={22} style={{ color: "rgba(255,255,255,0.6)" }} />
                                </motion.button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="relative overflow-y-auto max-h-[calc(88vh-140px)] px-12 py-10 space-y-12 custom-scrollbar">
                            {/* Timer Durations */}
                            <section className="space-y-7">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-4 rounded-2xl" style={{ background: `${accent}18` }}>
                                        <Clock size={24} style={{ color: accent }} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-2xl tracking-tight text-white leading-none mb-2">Timer Durations</h3>
                                        <p className="text-sm font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>Set session lengths in minutes</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-6">
                                    {[
                                        { label: "Focus", value: settings.workDuration, key: "workDuration", icon: "🎯" },
                                        { label: "Short Break", value: settings.shortBreakDuration, key: "shortBreakDuration", icon: "☕" },
                                        { label: "Long Break", value: settings.longBreakDuration, key: "longBreakDuration", icon: "🌴" }
                                    ].map(({ label, value, key, icon }) => (
                                        <motion.div
                                            key={key}
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            className="group relative overflow-hidden rounded-[24px] p-7"
                                            style={{
                                                background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                                                border: "1px solid rgba(255,255,255,0.12)",
                                                backdropFilter: "blur(30px)",
                                                boxShadow: "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)"
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                            <label className="block space-y-4 relative z-10">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="text-2xl">{icon}</span>
                                                    <span className="text-base font-bold leading-none" style={{ color: "rgba(255,255,255,0.8)" }}>{label}</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    value={value}
                                                    onChange={(e) => updateSetting(key as any, Number(e.target.value))}
                                                    className="w-full bg-black/40 rounded-[18px] px-5 py-4 text-white font-black text-xl outline-none transition-all duration-300"
                                                    style={{
                                                        border: `1.5px solid rgba(255,255,255,0.12)`,
                                                        boxShadow: "inset 0 2px 12px rgba(0,0,0,0.4)"
                                                    }}
                                                    onFocus={(e) => {
                                                        e.target.style.borderColor = accent;
                                                        e.target.style.boxShadow = `0 0 0 4px ${accent}25, inset 0 2px 12px rgba(0,0,0,0.4)`;
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.borderColor = "rgba(255,255,255,0.12)";
                                                        e.target.style.boxShadow = "inset 0 2px 12px rgba(0,0,0,0.4)";
                                                    }}
                                                />
                                            </label>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>

                            {/* Behavior */}
                            <section className="space-y-7">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-4 rounded-2xl" style={{ background: `${accent}18` }}>
                                        <Zap size={24} style={{ color: accent }} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-2xl tracking-tight text-white leading-none mb-2">Auto-Start Behavior</h3>
                                        <p className="text-sm font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>Automatically start next session</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: "Auto-start Breaks", key: "autoStartBreaks", desc: "Automatically begin break sessions" },
                                        { label: "Auto-start Focus", key: "autoStartWork", desc: "Automatically begin focus sessions" }
                                    ].map(({ label, key, desc }) => (
                                        <motion.label
                                            key={key}
                                            whileHover={{ scale: 1.01, x: 4 }}
                                            className="group flex items-center justify-between p-6 rounded-[24px] cursor-pointer transition-all"
                                            style={{
                                                background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)",
                                                border: "1px solid rgba(255,255,255,0.08)",
                                                backdropFilter: "blur(30px)"
                                            }}
                                        >
                                            <div>
                                                <span className="font-bold text-lg text-white/95 group-hover:text-white transition-colors leading-none block mb-2">{label}</span>
                                                <p className="text-sm font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{desc}</p>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={settings[key as keyof typeof settings] as boolean}
                                                    onChange={(e) => updateSetting(key as any, e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div
                                                    className="w-16 h-9 rounded-full transition-all duration-300"
                                                    style={{
                                                        background: settings[key as keyof typeof settings]
                                                            ? `linear-gradient(135deg, ${accent} 0%, ${accent}DD 100%)`
                                                            : "rgba(255,255,255,0.12)",
                                                        boxShadow: settings[key as keyof typeof settings]
                                                            ? `0 6px 20px ${accent}60, inset 0 2px 0 rgba(255,255,255,0.3)`
                                                            : "inset 0 2px 6px rgba(0,0,0,0.4)"
                                                    }}
                                                >
                                                    <div
                                                        className="w-7 h-7 bg-white rounded-full transition-all duration-300 absolute top-1 shadow-xl"
                                                        style={{
                                                            left: settings[key as keyof typeof settings] ? "32px" : "4px",
                                                            boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </motion.label>
                                    ))}
                                </div>
                            </section>

                            {/* AI Provider */}
                            <section className="space-y-7">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-4 rounded-2xl" style={{ background: `${accent}18` }}>
                                        <Sparkles size={24} style={{ color: accent }} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-2xl tracking-tight text-white leading-none mb-2">AI Companion</h3>
                                        <p className="text-sm font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>Choose your AI provider</p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <select
                                        value={settings.aiProvider}
                                        onChange={(e) => updateSetting("aiProvider", e.target.value as any)}
                                        className="w-full appearance-none rounded-[24px] px-7 py-5 text-white font-bold text-lg outline-none transition-all duration-300 cursor-pointer"
                                        style={{
                                            background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                                            border: "1.5px solid rgba(255,255,255,0.12)",
                                            backdropFilter: "blur(30px)",
                                            boxShadow: "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)"
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = accent;
                                            e.target.style.boxShadow = `0 0 0 4px ${accent}25, 0 8px 32px rgba(0,0,0,0.2)`;
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = "rgba(255,255,255,0.12)";
                                            e.target.style.boxShadow = "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)";
                                        }}
                                    >
                                        <option value="local" style={{ background: "#1A1A1A", color: "#fff" }}>🤖 Local (Ollama)</option>
                                        <option value="openai" style={{ background: "#1A1A1A", color: "#fff" }}>☁️ OpenAI / Cloud</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                                            <path d="M1 1L7 7L13 1" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                </div>
                            </section>

                            {/* Theme Selector */}
                            <section className="space-y-7">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-4 rounded-2xl" style={{ background: `${accent}18` }}>
                                        <div className="w-6 h-6 rounded-full" style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}80 100%)` }} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-2xl tracking-tight text-white leading-none mb-2">Color Theme</h3>
                                        <p className="text-sm font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>Choose your accent color</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-5 gap-5">
                                    {Object.entries(themes).map(([key, themeData]: [string, any]) => (
                                        <motion.button
                                            key={key}
                                            whileHover={{ scale: 1.12, y: -4 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => onThemeChange(key)}
                                            className="group relative aspect-square rounded-[22px] transition-all duration-500"
                                            style={{
                                                background: `linear-gradient(135deg, ${themeData.accent} 0%, ${themeData.accent}CC 100%)`,
                                                boxShadow: theme === key
                                                    ? `0 0 0 4px rgba(0,0,0,0.6), 0 0 0 8px ${themeData.accent}, 0 16px 48px ${themeData.accent}70, inset 0 2px 0 rgba(255,255,255,0.3)`
                                                    : `0 8px 32px ${themeData.accent}50, inset 0 2px 0 rgba(255,255,255,0.2)`,
                                                transform: theme === key ? "scale(1.1)" : "scale(1)"
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            {theme === key && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-4 h-4 bg-black rounded-full shadow-2xl" />
                                                </div>
                                            )}
                                        </motion.button>
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
