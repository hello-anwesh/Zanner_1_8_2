/**
 * CompactTimer - Ultra-premium floating timer
 * Uses Tauri's startDragging API for native window dragging
 */

import { getCurrentWindow } from '@tauri-apps/api/window';

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

const MODES: Record<string, { label: string; color: string }> = {
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
    const config = MODES[mode] || { label: 'FOCUS', color: accent };

    const handleMouseDown = async (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button')) return;
        try {
            await getCurrentWindow().startDragging();
        } catch (err) {
            console.error('Failed to start dragging:', err);
        }
    };

    // Icon button base style - overrides global button CSS
    const iconBtnStyle: React.CSSProperties = {
        padding: 0,
        minHeight: 'unset',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    };

    return (
        <div
            onMouseDown={handleMouseDown}
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0a0a0c',
                cursor: 'grab',
                userSelect: 'none',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Mode & Session */}
                <div style={{ minWidth: 65 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <div
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: config.color,
                                boxShadow: isRunning ? `0 0 10px ${config.color}` : 'none',
                            }}
                        />
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: config.color }}>
                            {config.label}
                        </span>
                    </div>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                        Session {sessions + 1}
                    </span>
                </div>

                {/* Divider */}
                <div style={{ width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.08)' }} />

                {/* Timer Display */}
                <div
                    style={{
                        fontSize: 44,
                        fontWeight: 600,
                        color: '#FFFFFF',
                        letterSpacing: '-0.02em',
                        fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
                        fontVariantNumeric: 'tabular-nums',
                        lineHeight: 1,
                        textShadow: `0 0 40px ${config.color}40`
                    }}
                >
                    {formatTime(timeLeft)}
                </div>

                {/* Divider */}
                <div style={{ width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.08)' }} />

                {/* Play/Pause Button */}
                <button
                    className="unstyled"
                    onClick={onToggleTimer}
                    style={{
                        ...iconBtnStyle,
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        backgroundColor: config.color,
                        boxShadow: `0 6px 24px ${config.color}50`,
                    }}
                >
                    {isRunning ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                        </svg>
                    ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 2 }}>
                            <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                    )}
                </button>

                {/* Expand Button */}
                <button
                    className="unstyled"
                    onClick={onExpand}
                    style={{
                        ...iconBtnStyle,
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        backgroundColor: 'rgba(255,255,255,0.06)',
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                </button>

                {/* Close Button */}
                <button
                    className="unstyled"
                    onClick={onClose}
                    style={{
                        ...iconBtnStyle,
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        backgroundColor: 'rgba(255,255,255,0.06)',
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
