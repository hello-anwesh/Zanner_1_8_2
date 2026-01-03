import React, { useState } from 'react';
import { Clock, Plus, Trash2, Edit2, Check, X } from 'lucide-react';

interface RhythmPattern {
    id: string;
    name: string;
    description: string;
    schedule: {
        day: string;
        startTime: string;
        endTime: string;
        focusDuration: number;
        breakDuration: number;
    }[];
    active: boolean;
}

interface AIRhythmsProps {
    accent: string;
    onClose?: () => void;
}

export const AIRhythmsView: React.FC<AIRhythmsProps> = ({ accent }) => {
    const [patterns, setPatterns] = useState<RhythmPattern[]>([
        {
            id: '1',
            name: 'Morning Focus',
            description: 'Deep work sessions in the morning',
            schedule: [
                { day: 'Mon-Fri', startTime: '09:00', endTime: '12:00', focusDuration: 50, breakDuration: 10 }
            ],
            active: true
        },
        {
            id: '2',
            name: 'Evening Study',
            description: 'Light study sessions after work',
            schedule: [
                { day: 'Mon-Wed-Fri', startTime: '18:00', endTime: '20:00', focusDuration: 25, breakDuration: 5 }
            ],
            active: false
        }
    ]);

    const [editingId, setEditingId] = useState<string | null>(null);

    const togglePattern = (id: string) => {
        setPatterns(prev => prev.map(p =>
            p.id === id ? { ...p, active: !p.active } : p
        ));
    };

    const deletePattern = (id: string) => {
        setPatterns(prev => prev.filter(p => p.id !== id));
    };

    return (
        <div className="p-8 sm:p-12 md:p-16 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2 gradient-text">AI Rhythms</h2>
                <p className="text-white/50">Configure automated focus patterns based on your schedule</p>
            </div>

            {/* Active Patterns */}
            <div className="space-y-4">
                {patterns.map((pattern) => (
                    <div
                        key={pattern.id}
                        className="card-premium p-6 relative overflow-hidden group"
                        style={{
                            borderLeft: `4px solid ${pattern.active ? accent : 'rgba(255,255,255,0.1)'}`
                        }}
                    >
                        {/* Shimmer effect on active */}
                        {pattern.active && (
                            <div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"
                                style={{ pointerEvents: 'none' }}
                            />
                        )}

                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-bold text-white">{pattern.name}</h3>
                                    {pattern.active && (
                                        <span
                                            className="px-3 py-1 rounded-full text-xs font-bold"
                                            style={{
                                                background: `${accent}20`,
                                                color: accent
                                            }}
                                        >
                                            ACTIVE
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-white/60 mb-4">{pattern.description}</p>

                                {/* Schedule */}
                                <div className="space-y-2">
                                    {pattern.schedule.map((sched, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-4 text-sm p-3 rounded-xl"
                                            style={{ background: 'rgba(255,255,255,0.03)' }}
                                        >
                                            <Clock size={16} style={{ color: accent }} />
                                            <span className="font-bold text-white/80">{sched.day}</span>
                                            <span className="text-white/50">{sched.startTime} - {sched.endTime}</span>
                                            <span className="text-white/50">•</span>
                                            <span className="text-white/50">{sched.focusDuration}m focus / {sched.breakDuration}m break</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => togglePattern(pattern.id)}
                                    className="p-2 rounded-lg transition-all hover:bg-white/10"
                                >
                                    {pattern.active ? (
                                        <Check size={18} style={{ color: accent }} />
                                    ) : (
                                        <X size={18} className="text-white/40" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setEditingId(pattern.id)}
                                    className="p-2 rounded-lg transition-all hover:bg-white/10"
                                >
                                    <Edit2 size={18} className="text-white/60" />
                                </button>
                                <button
                                    onClick={() => deletePattern(pattern.id)}
                                    className="p-2 rounded-lg transition-all hover:bg-red-500/20"
                                >
                                    <Trash2 size={18} className="text-red-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add New Pattern */}
            <button
                className="w-full p-6 rounded-2xl border-2 border-dashed transition-all duration-300 hover:scale-[1.02]"
                style={{
                    borderColor: `${accent}40`,
                    background: `${accent}05`
                }}
            >
                <div className="flex items-center justify-center gap-3">
                    <Plus size={24} style={{ color: accent }} />
                    <span className="font-bold" style={{ color: accent }}>Create New Rhythm Pattern</span>
                </div>
            </button>

            {/* Info Card */}
            <div
                className="p-6 rounded-2xl"
                style={{
                    background: `${accent}10`,
                    border: `1px solid ${accent}30`
                }}
            >
                <h4 className="font-bold mb-2" style={{ color: accent }}>💡 How AI Rhythms Work</h4>
                <p className="text-sm text-white/70 leading-relaxed">
                    AI Rhythms automatically start focus sessions based on your schedule. When a pattern is active,
                    the timer will automatically begin at the specified times with your configured durations.
                </p>
            </div>
        </div>
    );
};
