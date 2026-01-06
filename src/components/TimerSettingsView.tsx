import { motion } from 'framer-motion';
import { metronomeService } from '../services/MetronomeService';
import { TimerPreview } from './TimerPreview';

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
                <div className="flex items-start justify-between">
                    <h3 className="font-black text-2xl text-white leading-none">Timer Style</h3>
                    <div className="flex flex-col items-end gap-2">
                        <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Preview</span>
                        <TimerPreview style={timerStyle} accent={accent} />
                    </div>
                </div>
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

            {/* Metronome Section */}
            <div className="space-y-6">
                <h3 className="font-black text-2xl text-white leading-none">Metronome</h3>
                <motion.div
                    className="p-8 rounded-[28px] space-y-6"
                    style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        backdropFilter: "blur(30px)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
                    }}
                >
                    {/* Enable Toggle */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold text-lg text-white mb-1">Enable Metronome</p>
                            <p className="text-sm font-medium text-white/50">Background tick sound during focus sessions</p>
                        </div>
                        <button
                            onClick={() => {
                                const newState = !metronomeService.getState().enabled;
                                metronomeService.setEnabled(newState);
                            }}
                            className="relative w-14 h-8 rounded-full transition-all"
                            style={{
                                background: metronomeService.getState().enabled ? accent : 'rgba(255,255,255,0.1)',
                                boxShadow: metronomeService.getState().enabled ? `0 0 20px ${accent}40` : 'none'
                            }}
                        >
                            <div
                                className="absolute top-1 w-6 h-6 rounded-full bg-white transition-transform"
                                style={{
                                    transform: metronomeService.getState().enabled ? 'translateX(24px)' : 'translateX(4px)'
                                }}
                            />
                        </button>
                    </div>

                    {/* BPM Slider */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="font-bold text-base text-white">BPM (Beats Per Minute)</label>
                            <span className="text-sm font-bold px-3 py-1 rounded-lg" style={{ background: `${accent}20`, color: accent }}>
                                {metronomeService.getState().bpm}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="30"
                            max="240"
                            value={metronomeService.getState().bpm}
                            onChange={(e) => metronomeService.setBPM(parseInt(e.target.value))}
                            className="w-full h-2 rounded-full appearance-none cursor-pointer"
                            style={{
                                background: `linear-gradient(to right, ${accent} 0%, ${accent} ${((metronomeService.getState().bpm - 30) / (240 - 30)) * 100}%, rgba(255,255,255,0.1) ${((metronomeService.getState().bpm - 30) / (240 - 30)) * 100}%, rgba(255,255,255,0.1) 100%)`
                            }}
                        />
                        <div className="flex justify-between mt-2">
                            <span className="text-xs font-medium text-white/40">30 BPM</span>
                            <span className="text-xs font-medium text-white/40">240 BPM</span>
                        </div>
                    </div>

                    {/* Volume Slider */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="font-bold text-base text-white">Volume</label>
                            <span className="text-sm font-bold px-3 py-1 rounded-lg" style={{ background: `${accent}20`, color: accent }}>
                                {Math.round(metronomeService.getState().volume * 100)}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={metronomeService.getState().volume * 100}
                            onChange={(e) => metronomeService.setVolume(parseInt(e.target.value) / 100)}
                            className="w-full h-2 rounded-full appearance-none cursor-pointer"
                            style={{
                                background: `linear-gradient(to right, ${accent} 0%, ${accent} ${metronomeService.getState().volume * 100}%, rgba(255,255,255,0.1) ${metronomeService.getState().volume * 100}%, rgba(255,255,255,0.1) 100%)`
                            }}
                        />
                        <div className="flex justify-between mt-2">
                            <span className="text-xs font-medium text-white/40">0%</span>
                            <span className="text-xs font-medium text-white/40">100%</span>
                        </div>
                    </div>
                </motion.div>
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
