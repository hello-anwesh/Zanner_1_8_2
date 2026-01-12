/**
 * CompactTimer - Ultra-premium floating timer
 * Minimal, dark, glass aesthetic with glowing accents
 */

import { useState, useRef } from 'react';
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

const MODES: { [key: string]: { label: string; color: string } } = {
    focus: { label: 'FOCUS', color: '#A855F7' },
    work: { label: 'FOCUS', color: '#A855F7' },
    shortBreak: { label: 'BREAK', color: '#22C55E' },
    longBreak: { label: 'REST', color: '#3B82F6' }
};

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
    const [position, setPosition] = useState(() => {
        const saved = localStorage.getItem('compactTimerPosition');
        return saved ? JSON.parse(saved) : { x: 0, y: 0 };
    });
    const constraintsRef = useRef<HTMLDivElement>(null);

    const config = MODES[mode] || { label: 'FOCUS', color: accent };

    const containerStyle: React.CSSProperties = {
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        cursor: 'grab',
    };

    const cardStyle: React.CSSProperties = {
        backgroundColor: '#0a0a0c',
        background: '#0a0a0c',
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: `0 25px 50px -12px rgba(0,0,0,0.9), 0 0 60px -10px ${config.color}25`,
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
    };

    return (
        <>
            <div ref={constraintsRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99998 }} />

            <motion.div
                drag
                dragMomentum={false}
                dragElastic={0.05}
                dragConstraints={constraintsRef}
                initial={position}
                onDragEnd={(_, info) => {
                    const newPos = { x: position.x + info.offset.x, y: position.y + info.offset.y };
                    setPosition(newPos);
                    localStorage.setItem('compactTimerPosition', JSON.stringify(newPos));
                }}
                style={containerStyle}
                whileDrag={{ cursor: 'grabbing' }}
            >
                <motion.div
                    initial={{ opacity: 0, y: -30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    style={cardStyle}
                >
                    {/* Mode Badge */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: config.color,
                                    boxShadow: isRunning ? `0 0 12px ${config.color}` : 'none',
                                }}
                            />
                            <span style={{
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                color: config.color
                            }}>
                                {config.label}
                            </span>
                        </div>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
                            Session {sessions + 1}
                        </span>
                    </div>

                    {/* Divider */}
                    <div style={{ width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.1)' }} />

                    {/* Timer */}
                    <div style={{
                        fontSize: 42,
                        fontWeight: 700,
                        color: '#FFFFFF',
                        letterSpacing: '-0.02em',
                        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                        fontVariantNumeric: 'tabular-nums',
                        lineHeight: 1,
                        textShadow: `0 0 40px ${config.color}40`
                    }}>
                        {formatTime(timeLeft)}
                    </div>

                    {/* Play/Pause */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onToggleTimer}
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 14,
                            border: 'none',
                            backgroundColor: config.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: `0 8px 24px ${config.color}50`
                        }}
                    >
                        {isRunning ? (
                            <Pause size={22} color="#fff" strokeWidth={2.5} />
                        ) : (
                            <Play size={22} color="#fff" strokeWidth={2.5} style={{ marginLeft: 2 }} />
                        )}
                    </motion.button>

                    {/* Divider */}
                    <div style={{ width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.1)' }} />

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 4 }}>
                        <button
                            onClick={onExpand}
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                border: 'none',
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            <Maximize2 size={14} color="rgba(255,255,255,0.5)" />
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                border: 'none',
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            <X size={14} color="rgba(255,255,255,0.5)" />
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </>
    );
}
