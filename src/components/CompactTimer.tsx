import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Maximize2, X, GripVertical } from 'lucide-react';

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
    // Drag state for browser/electron
    const [position, setPosition] = useState(() => {
        const saved = localStorage.getItem('compactTimerPosition');
        return saved ? JSON.parse(saved) : { x: 0, y: 0 };
    });
    const constraintsRef = useRef<HTMLDivElement>(null);

    const modeConfig: { [key: string]: { label: string; emoji: string; color: string } } = {
        work: { label: 'Focus', emoji: '🎯', color: '#7C3AED' },
        focus: { label: 'Focus', emoji: '🎯', color: '#7C3AED' },
        shortBreak: { label: 'Short Break', emoji: '☕', color: '#10B981' },
        longBreak: { label: 'Long Break', emoji: '🌴', color: '#3B82F6' }
    };

    const config = modeConfig[mode] || { label: mode, emoji: '⏱️', color: accent };

    // Calculate progress based on mode
    const getTotalSeconds = () => {
        if (mode === 'focus' || mode === 'work') return 25 * 60;
        if (mode === 'shortBreak') return 5 * 60;
        if (mode === 'longBreak') return 15 * 60;
        return 25 * 60;
    };
    const progress = ((getTotalSeconds() - timeLeft) / getTotalSeconds()) * 100;

    return (
        <>
            {/* Drag Constraints */}
            <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[9998]" />

            <motion.div
                drag
                dragMomentum={false}
                dragElastic={0.1}
                dragConstraints={constraintsRef}
                initial={position}
                onDragEnd={(_, info) => {
                    const newPos = { x: position.x + info.offset.x, y: position.y + info.offset.y };
                    setPosition(newPos);
                    localStorage.setItem('compactTimerPosition', JSON.stringify(newPos));
                }}
                className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] cursor-grab active:cursor-grabbing"
                data-tauri-drag-region
            >
                <div
                    className="rounded-3xl overflow-hidden shadow-2xl"
                    style={{
                        background: 'linear-gradient(180deg, rgba(30,30,30,0.98) 0%, rgba(20,20,20,0.98) 100%)',
                        border: `2px solid ${config.color}30`,
                        backdropFilter: 'blur(20px)',
                        boxShadow: `0 25px 60px rgba(0,0,0,0.5), 0 0 40px ${config.color}20`
                    }}
                >
                    {/* Drag Handle */}
                    <div
                        className="flex items-center justify-center py-2 cursor-grab active:cursor-grabbing"
                        data-tauri-drag-region
                    >
                        <div className="flex items-center gap-1 opacity-30 hover:opacity-60 transition-opacity">
                            <GripVertical size={14} className="text-white" />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="px-8 pb-6 pt-2">
                        {/* Mode & Session */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{config.emoji}</span>
                                <div>
                                    <p
                                        className="text-sm font-bold uppercase tracking-wider"
                                        style={{ color: config.color }}
                                    >
                                        {config.label}
                                    </p>
                                    <p className="text-xs text-white/40">
                                        Session {sessions + 1}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={onExpand}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    title="Expand"
                                >
                                    <Maximize2 size={14} className="text-white/50 hover:text-white" />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    title="Close"
                                >
                                    <X size={14} className="text-white/50 hover:text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Timer Display */}
                        <div className="flex items-center justify-between gap-8">
                            <div className="flex flex-col items-start">
                                <span
                                    className="text-6xl font-black tracking-tighter tabular-nums"
                                    style={{
                                        color: '#fff',
                                        textShadow: `0 0 40px ${config.color}40`,
                                        fontFamily: "'Inter', system-ui, sans-serif"
                                    }}
                                >
                                    {formatTime(timeLeft)}
                                </span>

                                {/* Status */}
                                <div className="flex items-center gap-2 mt-2">
                                    <div
                                        className={`w-2 h-2 rounded-full ${isRunning ? 'animate-pulse' : ''}`}
                                        style={{ background: isRunning ? '#10B981' : '#6B7280' }}
                                    />
                                    <span
                                        className="text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: isRunning ? '#10B981' : '#6B7280' }}
                                    >
                                        {isRunning ? 'Running' : 'Paused'}
                                    </span>
                                </div>
                            </div>

                            {/* Play/Pause Button */}
                            <motion.button
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onToggleTimer}
                                className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all"
                                style={{
                                    background: `linear-gradient(135deg, ${config.color}, ${config.color}DD)`,
                                    boxShadow: `0 8px 32px ${config.color}50`
                                }}
                            >
                                {isRunning ? (
                                    <Pause size={26} color="#fff" strokeWidth={2.5} />
                                ) : (
                                    <Play size={26} color="#fff" strokeWidth={2.5} className="ml-1" />
                                )}
                            </motion.button>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-5 h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full rounded-full"
                                style={{ background: config.color }}
                                initial={{ width: '0%' }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
