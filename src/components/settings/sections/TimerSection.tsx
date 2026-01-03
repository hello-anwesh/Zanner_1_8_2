import { Clock, PlayCircle, Coffee, Zap, RotateCcw } from "lucide-react";

interface TimerSectionProps {
    config: {
        focusDuration: number;
        shortBreakDuration: number;
        longBreakDuration: number;
        autoStartBreaks: boolean;
        autoStartFocus: boolean;
        sessionsUntilLongBreak: number;
    };
    onChange: (key: string, value: any) => void;
    accent: string;
}

export function TimerSection({ config, onChange, accent }: TimerSectionProps) {
    const durations = [
        {
            key: "focusDuration",
            label: "Focus Duration",
            desc: "Time for deep work sessions",
            value: config.focusDuration,
            icon: Zap,
            color: "#3B82F6",
            min: 1,
            max: 120,
            unit: "min",
        },
        {
            key: "shortBreakDuration",
            label: "Short Break",
            desc: "Quick rest between sessions",
            value: config.shortBreakDuration,
            icon: Coffee,
            color: "#10B981",
            min: 1,
            max: 30,
            unit: "min",
        },
        {
            key: "longBreakDuration",
            label: "Long Break",
            desc: "Extended rest after cycle",
            value: config.longBreakDuration,
            icon: RotateCcw,
            color: "#8B5CF6",
            min: 5,
            max: 60,
            unit: "min",
        },
    ];

    const toggles = [
        {
            key: "autoStartBreaks",
            label: "Auto-start Breaks",
            desc: "Automatically begin breaks after focus sessions",
            value: config.autoStartBreaks,
        },
        {
            key: "autoStartFocus",
            label: "Auto-start Focus",
            desc: "Automatically begin focus after breaks",
            value: config.autoStartFocus,
        },
    ];

    return (
        <div className="space-y-8">
            {/* Duration Cards */}
            <div>
                <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
                    Session Durations
                </h4>
                <div className="grid grid-cols-3 gap-4">
                    {durations.map(item => (
                        <div
                            key={item.key}
                            className="group relative p-5 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                            style={{
                                background: `linear-gradient(145deg, ${item.color}08 0%, transparent 60%)`,
                                border: `1px solid ${item.color}20`,
                            }}
                        >
                            {/* Icon */}
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                                style={{ background: `${item.color}15` }}
                            >
                                <item.icon size={18} style={{ color: item.color }} />
                            </div>

                            {/* Label */}
                            <p className="text-sm font-medium text-white mb-1">{item.label}</p>
                            <p className="text-[11px] text-white/30 mb-4">{item.desc}</p>

                            {/* Value Display */}
                            <div className="flex items-baseline gap-1 mb-3">
                                <span className="text-3xl font-bold text-white tabular-nums">
                                    {item.value}
                                </span>
                                <span className="text-sm text-white/30">{item.unit}</span>
                            </div>

                            {/* Slider */}
                            <input
                                type="range"
                                min={item.min}
                                max={item.max}
                                value={item.value}
                                onChange={(e) => onChange(item.key, Number(e.target.value))}
                                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, ${item.color} ${((item.value - item.min) / (item.max - item.min)) * 100}%, rgba(255,255,255,0.08) ${((item.value - item.min) / (item.max - item.min)) * 100}%)`,
                                }}
                            />

                            {/* Range Labels */}
                            <div className="flex justify-between mt-2">
                                <span className="text-[10px] text-white/20">{item.min}m</span>
                                <span className="text-[10px] text-white/20">{item.max}m</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sessions Counter */}
            <div
                className="p-5 rounded-2xl"
                style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: `${accent}15` }}
                        >
                            <Clock size={18} style={{ color: accent }} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">Sessions Until Long Break</p>
                            <p className="text-[11px] text-white/30">How many focus sessions before a long break</p>
                        </div>
                    </div>

                    {/* Counter Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onChange("sessionsUntilLongBreak", Math.max(2, config.sessionsUntilLongBreak - 1))}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                        >
                            −
                        </button>
                        <div
                            className="w-16 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                            style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}
                        >
                            {config.sessionsUntilLongBreak}
                        </div>
                        <button
                            onClick={() => onChange("sessionsUntilLongBreak", Math.min(10, config.sessionsUntilLongBreak + 1))}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>

            {/* Toggle Switches */}
            <div>
                <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
                    Automation
                </h4>
                <div className="space-y-3">
                    {toggles.map(toggle => (
                        <div
                            key={toggle.key}
                            className="flex items-center justify-between p-4 rounded-xl transition-all"
                            style={{
                                background: "rgba(255,255,255,0.02)",
                                border: "1px solid rgba(255,255,255,0.05)",
                            }}
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                                    style={{ background: "rgba(255,255,255,0.03)" }}
                                >
                                    <PlayCircle size={16} className="text-white/40" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{toggle.label}</p>
                                    <p className="text-[11px] text-white/30">{toggle.desc}</p>
                                </div>
                            </div>

                            {/* Toggle Switch */}
                            <button
                                onClick={() => onChange(toggle.key, !toggle.value)}
                                className="relative w-12 h-7 rounded-full transition-all duration-300"
                                style={{
                                    background: toggle.value ? accent : "rgba(255,255,255,0.1)",
                                }}
                            >
                                <div
                                    className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-all duration-300"
                                    style={{
                                        left: toggle.value ? "calc(100% - 24px)" : "4px",
                                    }}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
