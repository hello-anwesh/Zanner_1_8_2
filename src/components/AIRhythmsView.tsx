import React, { useState } from 'react';
import { Clock, Plus, Trash2, Edit2, Check, X, Sparkles, Calendar, Zap, Target, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    icon: string;
    color: string;
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
            description: 'Deep work in the morning',
            schedule: [
                { day: 'Mon-Fri', startTime: '09:00', endTime: '12:00', focusDuration: 50, breakDuration: 10 }
            ],
            active: true,
            icon: '🌅',
            color: '#F59E0B'
        },
        {
            id: '2',
            name: 'Evening Study',
            description: 'Light study after work',
            schedule: [
                { day: 'Mon-Wed-Fri', startTime: '18:00', endTime: '20:00', focusDuration: 25, breakDuration: 5 }
            ],
            active: false,
            icon: '🌙',
            color: '#8B5CF6'
        }
    ]);

    const [_editingId, setEditingId] = useState<string | null>(null);

    const togglePattern = (id: string) => {
        setPatterns(prev => prev.map(p =>
            p.id === id ? { ...p, active: !p.active } : p
        ));
    };

    const deletePattern = (id: string) => {
        setPatterns(prev => prev.filter(p => p.id !== id));
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                        background: `linear-gradient(135deg, ${accent}, ${accent}DD)`,
                        boxShadow: `0 4px 16px ${accent}40`
                    }}
                >
                    <Zap size={24} color="#000" strokeWidth={2} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white leading-none mb-1">AI Rhythms</h2>
                    <p className="text-sm text-white/50">Automated focus patterns</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-2">
                        <Target size={16} className="text-blue-400" />
                        <div>
                            <p className="text-xs text-white/50">Total</p>
                            <p className="text-lg font-bold text-white">{patterns.length}</p>
                        </div>
                    </div>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-400" />
                        <div>
                            <p className="text-xs text-white/50">Active</p>
                            <p className="text-lg font-bold text-white">{patterns.filter(p => p.active).length}</p>
                        </div>
                    </div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: `${accent}10`, border: `1px solid ${accent}20` }}>
                    <div className="flex items-center gap-2">
                        <Sparkles size={16} style={{ color: accent }} />
                        <div>
                            <p className="text-xs text-white/50">AI Mode</p>
                            <p className="text-lg font-bold text-white">ON</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Patterns */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar size={20} style={{ color: accent }} />
                    Rhythm Patterns
                </h3>

                <AnimatePresence>
                    {patterns.map((pattern) => (
                        <motion.div
                            key={pattern.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="p-5 rounded-xl relative overflow-hidden group"
                            style={{
                                background: pattern.active
                                    ? `linear-gradient(135deg, ${pattern.color}15, ${pattern.color}08)`
                                    : "rgba(255,255,255,0.04)",
                                border: pattern.active
                                    ? `1px solid ${pattern.color}40`
                                    : "1px solid rgba(255,255,255,0.08)"
                            }}
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0"
                                    style={{
                                        background: `linear-gradient(135deg, ${pattern.color}, ${pattern.color}CC)`
                                    }}
                                >
                                    {pattern.icon}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-base font-bold text-white">{pattern.name}</h3>
                                        {pattern.active && (
                                            <span
                                                className="px-2 py-0.5 rounded text-xs font-bold"
                                                style={{
                                                    background: `${pattern.color}20`,
                                                    color: pattern.color
                                                }}
                                            >
                                                ACTIVE
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-white/60 mb-3">{pattern.description}</p>

                                    {/* Schedule */}
                                    <div className="space-y-2">
                                        {pattern.schedule.map((sched, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 text-sm"
                                            >
                                                <Clock size={14} style={{ color: pattern.color }} />
                                                <span className="font-bold text-white/90 min-w-[80px]">{sched.day}</span>
                                                <span className="text-white/60">{sched.startTime} - {sched.endTime}</span>
                                                <span className="text-white/30">•</span>
                                                <span className="px-2 py-0.5 rounded bg-white/10 text-xs font-medium text-white/80">
                                                    {sched.focusDuration}m / {sched.breakDuration}m
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={() => togglePattern(pattern.id)}
                                        className="p-2 rounded-lg transition-all"
                                        style={{
                                            background: pattern.active ? `${pattern.color}15` : 'rgba(255,255,255,0.05)',
                                            border: pattern.active ? `1px solid ${pattern.color}40` : '1px solid rgba(255,255,255,0.1)'
                                        }}
                                    >
                                        {pattern.active ? (
                                            <Check size={16} style={{ color: pattern.color }} />
                                        ) : (
                                            <X size={16} className="text-white/40" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setEditingId(pattern.id)}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                                    >
                                        <Edit2 size={16} className="text-white/60" />
                                    </button>
                                    <button
                                        onClick={() => deletePattern(pattern.id)}
                                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all"
                                    >
                                        <Trash2 size={16} className="text-red-400" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Add New */}
            <button
                className="w-full p-4 rounded-xl border-2 border-dashed transition-all hover:bg-white/5"
                style={{
                    borderColor: `${accent}40`,
                    background: `${accent}05`
                }}
            >
                <div className="flex items-center justify-center gap-2">
                    <Plus size={20} style={{ color: accent }} />
                    <span className="font-bold text-sm" style={{ color: accent }}>Create New Rhythm</span>
                </div>
            </button>

            {/* Info */}
            <div
                className="p-4 rounded-xl"
                style={{
                    background: `${accent}10`,
                    border: `1px solid ${accent}30`
                }}
            >
                <div className="flex gap-3">
                    <div className="flex gap-2">
                        <Sun size={20} style={{ color: accent }} />
                        <Moon size={20} style={{ color: accent }} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold mb-1 flex items-center gap-2" style={{ color: accent }}>
                            <Sparkles size={16} />
                            How AI Rhythms Work
                        </h4>
                        <p className="text-sm text-white/70 leading-relaxed">
                            AI Rhythms auto-start focus sessions based on your schedule for consistent work habits.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
