import { motion } from 'framer-motion';
import { Play, Pause, Maximize2, X } from 'lucide-react';

interface CompactTimerProps {
    timeLeft: number;
    isRunning: boolean;
    mode: string;
    accent: string;
    sessions: number;
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
    sessions = 0,
    onToggleTimer,
    onExpand,
    onClose
}: CompactTimerProps) {
    const modeConfig: { [key: string]: { label: string; emoji: string; bg: string } } = {
        work: { label: 'Focus', emoji: '🎯', bg: '#7C3AED' },
        focus: { label: 'Focus', emoji: '🎯', bg: '#7C3AED' },
        shortBreak: { label: 'Break', emoji: '☕', bg: '#10B981' },
        longBreak: { label: 'Long Break', emoji: '🌴', bg: '#3B82F6' }
    };

    const config = modeConfig[mode] || { label: mode, emoji: '⏱️', bg: accent };
    const percentage = mode === 'work' || mode === 'focus' ? (timeLeft / (25 * 60)) * 100 : (timeLeft / (5 * 60)) * 100;

    return (
        <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: '#1E1E1E' }}
        >
            <div
                data-tauri-drag-region
                className="w-full h-full max-w-[400px] max-h-[200px] rounded-2xl border flex flex-col overflow-hidden"
                style={{
                    background: '#1E1E1E',
                    borderColor: 'rgba(255,255,255,0.1)',
                }}
            >
                {/* Header - Flat Design */}
                <div
                    data-tauri-drag-region
                    className="px-6 py-4 flex items-center justify-between border-b shrink-0"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                >
                    <div data-tauri-drag-region className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                            style={{ background: `${config.bg}20`, border: `1px solid ${config.bg}40` }}
                        >
                            {config.emoji}
                        </div>
                        <div data-tauri-drag-region>
                            <p data-tauri-drag-region className="text-sm font-bold text-white uppercase tracking-wider leading-none">
                                {config.label}
                            </p>
                            <p data-tauri-drag-region className="text-xs font-medium text-white/40 mt-1">
                                Session {sessions + 1}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onExpand}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title="Expand"
                        >
                            <Maximize2 size={16} className="text-white/60" strokeWidth={2} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title="Close"
                        >
                            <X size={16} className="text-white/60" strokeWidth={2} />
                        </button>
                    </div>
                </div>

                {/* Main Content - Clean Layout */}
                <div data-tauri-drag-region className="flex-1 flex items-center justify-between px-8 py-6">
                    {/* Timer Display */}
                    <div data-tauri-drag-region className="flex flex-col gap-3">
                        <span
                            data-tauri-drag-region
                            className="text-6xl font-black tracking-tight select-none"
                            style={{
                                fontVariantNumeric: 'tabular-nums',
                                color: accent,
                                fontFamily: "'Inter', -apple-system, sans-serif"
                            }}
                        >
                            {formatTime(timeLeft)}
                        </span>

                        {/* Status Indicator */}
                        <div data-tauri-drag-region className="flex items-center gap-2">
                            <div
                                className="relative w-2 h-2 rounded-full"
                                style={{
                                    background: isRunning ? '#10B981' : '#6B7280',
                                }}
                            >
                                {isRunning && (
                                    <motion.div
                                        className="absolute inset-0 rounded-full"
                                        style={{ background: '#10B981' }}
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [0.5, 0, 0.5]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                )}
                            </div>
                            <span
                                data-tauri-drag-region
                                className="text-xs font-bold uppercase tracking-wider"
                                style={{ color: isRunning ? '#10B981' : '#6B7280' }}
                            >
                                {isRunning ? 'Active' : 'Paused'}
                            </span>
                        </div>
                    </div>

                    {/* Control Button - Flat Design */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onToggleTimer}
                        className="w-16 h-16 rounded-xl shadow-lg flex items-center justify-center transition-all"
                        style={{
                            background: accent,
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        {isRunning ? (
                            <Pause size={24} color="#000" strokeWidth={2.5} />
                        ) : (
                            <Play size={24} color="#000" strokeWidth={2.5} fill="#000" />
                        )}
                    </motion.button>
                </div>

                {/* Progress Bar - Minimal */}
                <div className="h-1 bg-white/5 shrink-0 relative overflow-hidden">
                    <motion.div
                        className="absolute inset-y-0 left-0"
                        style={{ background: accent }}
                        initial={{ width: '0%' }}
                        animate={{ width: `${100 - percentage}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>
        </div>
    );
}
