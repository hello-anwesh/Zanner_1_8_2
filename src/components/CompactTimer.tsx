import { motion } from 'framer-motion';
import { Play, Pause, Maximize2, X } from 'lucide-react';

interface CompactTimerProps {
    timeLeft: number;
    isRunning: boolean;
    mode: string;
    accent: string;
    onToggleTimer: () => void;
    onExpand: () => void;
    onClose: () => void;
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function CompactTimer({
    timeLeft,
    isRunning,
    mode,
    accent,
    onToggleTimer,
    onExpand,
    onClose
}: CompactTimerProps) {
    const modeLabels: { [key: string]: string } = {
        work: '💼 Work',
        shortBreak: '☕ Break',
        longBreak: '🌴 Long Break'
    };

    return (
        <div
            className="w-full h-full p-2 flex items-center justify-center bg-transparent"
        >
            <div
                data-tauri-drag-region
                className="w-full h-full max-w-[320px] max-h-[160px] rounded-xl backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
                style={{
                    background: 'rgba(12, 12, 16, 0.98)',
                    borderColor: `${accent}40`,
                    boxShadow: `0 0 60px ${accent}20`
                }}
            >
                {/* Header */}
                <div
                    data-tauri-drag-region
                    className="px-4 py-2 flex items-center justify-between border-b shrink-0"
                    style={{ borderColor: `${accent}20`, background: `${accent}08` }}
                >
                    <span data-tauri-drag-region className="text-[10px] font-bold uppercase tracking-wider text-white/70 select-none">
                        {modeLabels[mode] || mode}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={onExpand}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                            title="Expand"
                        >
                            <Maximize2 size={14} className="text-white/60" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                            title="Close"
                        >
                            <X size={14} className="text-white/60" />
                        </button>
                    </div>
                </div>

                {/* Timer Display */}
                <div data-tauri-drag-region className="flex-1 flex items-center justify-between px-6 pb-2">
                    <div data-tauri-drag-region className="flex flex-col">
                        <span
                            data-tauri-drag-region
                            className="text-5xl font-light tracking-tighter select-none"
                            style={{
                                fontVariantNumeric: 'tabular-nums',
                                color: accent,
                                textShadow: isRunning ? `0 0 30px ${accent}60` : 'none'
                            }}
                        >
                            {formatTime(timeLeft)}
                        </span>
                        <div data-tauri-drag-region className="flex items-center gap-1.5 mt-1 opacity-60">
                            <div
                                className="w-1.5 h-1.5 rounded-full transition-all"
                                style={{
                                    background: isRunning ? '#4ade80' : '#6b7280',
                                    boxShadow: isRunning ? '0 0 8px #4ade80' : 'none'
                                }}
                            />
                            <span
                                data-tauri-drag-region
                                className="text-[10px] font-bold uppercase tracking-wider text-white"
                            >
                                {isRunning ? 'Running' : 'Paused'}
                            </span>
                        </div>
                    </div>

                    {/* Controls */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onToggleTimer}
                        className="p-4 rounded-xl shadow-lg"
                        style={{
                            background: `linear-gradient(135deg, ${accent}, ${accent}DD)`,
                            boxShadow: `0 8px 24px ${accent}40`
                        }}
                    >
                        {isRunning ? (
                            <Pause size={20} color="#000" strokeWidth={2.5} />
                        ) : (
                            <Play size={20} color="#000" strokeWidth={2.5} fill="#000" />
                        )}
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
