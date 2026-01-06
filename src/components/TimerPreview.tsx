/**
 * TimerPreview Component
 * Shows a small static preview of the selected timer style
 */

interface TimerPreviewProps {
    style: string;
    accent: string;
}

export function TimerPreview({ style, accent }: TimerPreviewProps) {
    const size = 200;
    const stroke = 4;
    const radius = size / 2 - stroke / 2 - 10;
    const circ = 2 * Math.PI * radius;
    const progress = 0.6; // 60% for preview
    const offset = circ * (1 - progress);

    return (
        <div className="relative w-[200px] h-[200px] flex items-center justify-center bg-black/20 rounded-2xl border border-white/10">
            {/* Minimal Style */}
            {style === 'minimal' && (
                <div className="flex flex-col items-center">
                    <div className="text-4xl font-light text-white tabular-nums">25:00</div>
                    <div className="mt-2">
                        <span className="text-[10px] font-medium uppercase tracking-wider px-3 py-1 rounded-lg bg-white/5 text-white/40 border border-white/10">
                            Ready
                        </span>
                    </div>
                </div>
            )}

            {/* Circular Style */}
            {style === 'circular' && (
                <div className="relative">
                    <svg width={size} height={size} className="-rotate-90">
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth={stroke}
                        />
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={accent}
                            strokeWidth={stroke}
                            strokeLinecap="round"
                            strokeDasharray={circ}
                            strokeDashoffset={offset}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-light text-white tabular-nums">25:00</span>
                        <div className="mt-1">
                            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: accent }}>
                                60%
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* 3D/Clean Ring Style */}
            {style === '3d' && (
                <div className="relative">
                    <svg width={size} height={size} className="-rotate-90">
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth={stroke}
                        />
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={accent}
                            strokeWidth={stroke}
                            strokeLinecap="round"
                            strokeDasharray={circ}
                            strokeDashoffset={offset}
                        />
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius - 20}
                            fill="none"
                            stroke="rgba(255,255,255,0.04)"
                            strokeWidth={1}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-light text-white tabular-nums">25:00</span>
                        <div className="mt-2 flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                            <span className="text-[9px] font-medium uppercase tracking-wider text-white/50">
                                Paused
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Analog Style */}
            {style === 'analog' && (
                <div className="relative">
                    <svg width={size} height={size}>
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="rgba(255,255,255,0.02)"
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth={2}
                        />
                        {/* Hour markers */}
                        {Array.from({ length: 12 }).map((_, i) => {
                            const angle = (i * 30 - 90) * (Math.PI / 180);
                            const x1 = size / 2 + (radius - 8) * Math.cos(angle);
                            const y1 = size / 2 + (radius - 8) * Math.sin(angle);
                            const x2 = size / 2 + (radius - 3) * Math.cos(angle);
                            const y2 = size / 2 + (radius - 3) * Math.sin(angle);
                            return (
                                <line
                                    key={i}
                                    x1={x1} y1={y1} x2={x2} y2={y2}
                                    stroke="rgba(255,255,255,0.2)"
                                    strokeWidth={i % 3 === 0 ? 1.5 : 0.8}
                                />
                            );
                        })}
                        {/* Progress arc */}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius - 8}
                            fill="none"
                            stroke={accent}
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeDasharray={circ}
                            strokeDashoffset={offset}
                            className="-rotate-90 origin-center"
                            style={{ transformOrigin: '50% 50%' }}
                        />
                        {/* Clock hand */}
                        <line
                            x1={size / 2}
                            y1={size / 2}
                            x2={size / 2 + (radius - 30) * Math.cos((progress * 360 - 90) * (Math.PI / 180))}
                            y2={size / 2 + (radius - 30) * Math.sin((progress * 360 - 90) * (Math.PI / 180))}
                            stroke={accent}
                            strokeWidth={1.5}
                            strokeLinecap="round"
                        />
                        <circle cx={size / 2} cy={size / 2} r={3} fill={accent} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-light text-white tabular-nums">25:00</span>
                    </div>
                </div>
            )}

            {/* Bar Style */}
            {style === 'bar' && (
                <div className="flex flex-col items-center gap-4 w-full px-6">
                    <div className="text-4xl font-light text-white tabular-nums">25:00</div>
                    <div className="w-full">
                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                            <div
                                className="h-full rounded-full"
                                style={{
                                    width: '60%',
                                    background: accent,
                                }}
                            />
                        </div>
                        <div className="mt-2 text-center">
                            <span className="text-xs font-medium" style={{ color: accent }}>60%</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
