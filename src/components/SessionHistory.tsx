import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Search, Filter, Tag, Edit3, Trash2, Download } from 'lucide-react';

export interface Session {
    id: string;
    date: string;
    time: string;
    duration: number;
    type: 'focus' | 'break';
    preset: string;
    completed: boolean;
    notes?: string;
    tags?: string[];
}

interface SessionHistoryProps {
    accent: string;
    sessions: Session[];
}

export function SessionHistory({ accent, sessions = [] }: SessionHistoryProps) {
    // Legacy state removed, using props


    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);

    const groupedSessions = sessions.reduce((acc, session) => {
        const date = session.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(session);
        return acc;
    }, {} as Record<string, Session[]>);

    const exportData = () => {
        const data = JSON.stringify(sessions, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zenner-sessions-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{
                            background: `linear-gradient(135deg, ${accent}, ${accent}DD)`,
                            boxShadow: `0 4px 16px ${accent}40`
                        }}
                    >
                        <Calendar size={24} color="#000" strokeWidth={2} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white leading-none mb-1">Session History</h2>
                        <p className="text-sm text-white/50">{sessions.length} total sessions</p>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={exportData}
                    className="px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10"
                >
                    <Download size={16} />
                    Export
                </motion.button>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search sessions, notes, tags..."
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-white/20"
                    />
                </div>
                <button className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 flex items-center gap-2">
                    <Filter size={18} />
                    <span className="text-sm font-medium">Filter</span>
                </button>
            </div>

            {/* Session List */}
            <div className="space-y-6">
                {Object.entries(groupedSessions).map(([date, daySessions]) => (
                    <div key={date}>
                        {/* Date Header */}
                        <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-sm font-bold text-white/70">
                                {new Date(date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </h3>
                            <div className="h-px flex-1 bg-white/10" />
                        </div>

                        {/* Sessions for this date */}
                        <div className="space-y-3">
                            {daySessions.map((session) => (
                                <motion.div
                                    key={session.id}
                                    whileHover={{ scale: 1.01, x: 4 }}
                                    onClick={() => setSelectedSession(session)}
                                    className="p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 cursor-pointer transition-all"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div
                                            className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${session.completed ? 'bg-green-500/20' : 'bg-red-500/20'
                                                }`}
                                        >
                                            {session.type === 'focus' ? (
                                                <Clock size={20} className={session.completed ? 'text-green-400' : 'text-red-400'} />
                                            ) : (
                                                <span className="text-lg">☕</span>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="font-bold text-white text-base">{session.preset}</h4>
                                                <span className="text-xs text-white/50">{session.time}</span>
                                                {session.completed ? (
                                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-500/20 text-green-400">
                                                        ✓ Completed
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400">
                                                        Abandoned
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-white/60 mb-2">
                                                <span>{session.duration} minutes</span>
                                                <span>•</span>
                                                <span className="capitalize">{session.type}</span>
                                            </div>

                                            {session.notes && (
                                                <p className="text-sm text-white/70 mb-2">{session.notes}</p>
                                            )}

                                            {session.tags && session.tags.length > 0 && (
                                                <div className="flex gap-2 flex-wrap">
                                                    {session.tags.map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="px-2 py-1 rounded text-xs font-medium bg-white/10 text-white/70 flex items-center gap-1"
                                                        >
                                                            <Tag size={10} />
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-1 shrink-0">
                                            <button className="p-2 rounded-lg hover:bg-white/10">
                                                <Edit3 size={16} className="text-white/60" />
                                            </button>
                                            <button className="p-2 rounded-lg hover:bg-red-500/20">
                                                <Trash2 size={16} className="text-red-400/60" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Session Detail Modal */}
            <AnimatePresence>
                {selectedSession && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedSession(null)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed inset-0 m-auto w-full max-w-lg h-fit p-6 rounded-2xl bg-gray-900 border border-white/10 z-50"
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Session Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-white/50 mb-1">Preset</p>
                                    <p className="text-base font-bold text-white">{selectedSession.preset}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-white/50 mb-1">Duration</p>
                                    <p className="text-base font-bold text-white">{selectedSession.duration} minutes</p>
                                </div>
                                {selectedSession.notes && (
                                    <div>
                                        <p className="text-xs text-white/50 mb-1">Notes</p>
                                        <p className="text-sm text-white/80">{selectedSession.notes}</p>
                                    </div>
                                )}
                                <button
                                    onClick={() => setSelectedSession(null)}
                                    className="w-full px-4 py-3 rounded-lg font-bold bg-white/10 hover:bg-white/20"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Empty State */}
            {sessions.length === 0 && (
                <div className="text-center py-20">
                    <Calendar size={48} className="mx-auto mb-4 text-white/20" />
                    <p className="text-white/50">No sessions yet. Start a timer to begin tracking!</p>
                </div>
            )}
        </div>
    );
}
