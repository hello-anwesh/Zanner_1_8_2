import { motion } from 'framer-motion';

interface TimerSettingsViewProps {
    accent: string;
    activePreset: any;
    timerStyle: string;
    onTimerStyleChange: (style: string) => void;
}

const TIMER_STYLES = [
    { id: 'minimal', name: 'Minimal', icon: '⚪', desc: 'Clean text display' },
    { id: 'circular', name: 'Circular', icon: '🔵', desc: 'Progress ring' },
    { id: 'analog', name: 'Analog', icon: '🕐', desc: 'Clock face' },
    { id: 'bar', name: 'Bar', icon: '📊', desc: 'Progress bar' },
    { id: '3d', name: '3D', icon: '🎲', desc: 'Depth effect' }
];

export function TimerSettingsView({ accent, activePreset, timerStyle, onTimerStyleChange }: TimerSettingsViewProps) {
    return (
        <div className="p-12 max-w-5xl mx-auto space-y-10" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
            {/* Header */}
            <span className="px-5 py-2.5 rounded-2xl text-sm font-black uppercase tracking-wider bg-white/[0.08] text-white/60 border border-white/[0.15] inline-block">
                Timer Settings
            </span>

            {/* Current Preset */}
            <motion.div
                whileHover={{ scale: 1.01 }}
                className="p-8 rounded-[28px]"
                style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    backdropFilter: "blur(30px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
                }}
            >
                <div className="flex items-center gap-6 mb-8">
                    <span className="text-4xl">{activePreset.icon}</span>
                    <div>
                        <h3 className="font-black text-2xl text-white mb-2 leading-none">{activePreset.name}</h3>
                        <p className="text-base font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>{activePreset.description}</p>
                    </div>
                </div>

                {/* Duration Pills */}
                <div className="grid grid-cols-3 gap-5">
                    <div
                        className="p-6 rounded-[20px] text-center transition-all"
                        style={{
                            background: `${activePreset.color}20`,
                            border: `1.5px solid ${activePreset.color}40`,
                            boxShadow: `0 4px 16px ${activePreset.color}20`
                        }}
                    >
                        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: activePreset.color }}>
                            Production
                        </p>
                        <p className="text-4xl font-black mb-2" style={{ color: activePreset.color }}>
                            {activePreset.focus}
                        </p>
                        <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>minutes</p>
                    </div>

                    <div className="p-6 rounded-[20px] bg-white/[0.04] border border-white/[0.1] text-center">
                        <p className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">
                            Quick Break
                        </p>
                        <p className="text-4xl font-black text-white/70 mb-2">
                            {activePreset.shortBreak}
                        </p>
                        <p className="text-sm font-medium text-white/40">minutes</p>
                    </div>

                    <div className="p-6 rounded-[20px] bg-white/[0.04] border border-white/[0.1] text-center">
                        <p className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">
                            Extended Rest
                        </p>
                        <p className="text-4xl font-black text-white/70 mb-2">
                            {activePreset.longBreak}
                        </p>
                        <p className="text-sm font-medium text-white/40">minutes</p>
                    </div>
                </div>
            </motion.div>

            {/* Timer Style Selector */}
            <div className="space-y-6">
                <h3 className="font-black text-2xl text-white leading-none">Timer Style</h3>
                <div className="grid grid-cols-2 gap-5">
                    {TIMER_STYLES.map((style) => (
                        <motion.button
                            key={style.id}
                            whileHover={{ scale: 1.03, y: -4 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => onTimerStyleChange(style.id)}
                            className="p-6 rounded-[24px] text-left transition-all"
                            style={{
                                background: timerStyle === style.id
                                    ? `linear-gradient(135deg, ${accent}25 0%, ${accent}10 100%)`
                                    : "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                                border: timerStyle === style.id
                                    ? `1.5px solid ${accent}60`
                                    : "1px solid rgba(255,255,255,0.12)",
                                boxShadow: timerStyle === style.id
                                    ? `0 8px 24px ${accent}30`
                                    : "0 4px 16px rgba(0,0,0,0.1)"
                            }}
                        >
                            <div className="flex items-center gap-5 mb-4">
                                <div
                                    className="w-16 h-16 rounded-[20px] flex items-center justify-center text-3xl"
                                    style={{
                                        background: timerStyle === style.id
                                            ? `${accent}30`
                                            : 'rgba(255,255,255,0.06)'
                                    }}
                                >
                                    {style.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="font-black text-xl text-white leading-none mb-2">{style.name}</p>
                                    <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>{style.desc}</p>
                                </div>
                            </div>
                            {timerStyle === style.id && (
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ background: accent, boxShadow: `0 0 12px ${accent}` }} />
                                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: accent }}>Active</span>
                                </div>
                            )}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Info */}
            <div className="p-6 rounded-[24px] bg-white/[0.04] border border-white/[0.1]">
                <p className="text-sm font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                    💡 Choose a timer style that matches your workflow. Each style offers a unique visual experience while maintaining the same functionality.
                </p>
            </div>
        </div>
    );
}
