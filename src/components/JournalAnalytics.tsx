/**
 * Journal Analytics Component
 * Visualizes mood trends, writing stats, and patterns
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, PenLine, Flame, Brain } from 'lucide-react';
import { journalService, JournalEntry } from '../services/journal/JournalService';

interface AnalyticsData {
    entries: JournalEntry[];
    moodCounts: Record<string, number>;
    totalWords: number;
    averageWords: number;
    streak: number;
    entriesByDay: Record<string, number>;
    moodOverTime: { date: string; mood: string; score: number }[];
}

const MOOD_SCORES: Record<string, number> = {
    'amazing': 5,
    'good': 4,
    'okay': 3,
    'struggling': 2,
    'exhausted': 1
};

const MOOD_COLORS: Record<string, string> = {
    'amazing': '#f97316', // orange
    'good': '#22c55e',    // green
    'okay': '#eab308',    // yellow
    'struggling': '#a855f7', // purple
    'exhausted': '#ef4444' // red
};

const MOOD_EMOJIS: Record<string, string> = {
    'amazing': '🔥',
    'good': '😊',
    'okay': '😐',
    'struggling': '😓',
    'exhausted': '😵'
};

export function JournalAnalytics() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');

    useEffect(() => {
        loadAnalytics();
    }, [timeRange]);

    const loadAnalytics = async () => {
        setIsLoading(true);
        try {
            let entries: JournalEntry[];

            if (timeRange === 'week') {
                entries = await journalService.getRecentEntries(7);
            } else if (timeRange === 'month') {
                entries = await journalService.getRecentEntries(30);
            } else {
                entries = await journalService.getAllEntries();
            }

            // Calculate mood counts
            const moodCounts: Record<string, number> = {
                amazing: 0,
                good: 0,
                okay: 0,
                struggling: 0,
                exhausted: 0
            };

            entries.forEach(e => {
                if (e.mood && moodCounts[e.mood] !== undefined) {
                    moodCounts[e.mood]++;
                }
            });

            // Calculate word stats
            let totalWords = 0;
            entries.forEach(e => {
                const words = e.content.trim().split(/\s+/).filter(w => w.length > 0).length;
                totalWords += words;
            });

            // Calculate streak
            let streak = 0;
            let checkDate = new Date();
            for (let i = 0; i < 365; i++) {
                const dateStr = checkDate.toISOString().split('T')[0];
                if (entries.some(e => e.date === dateStr)) {
                    streak++;
                } else {
                    break;
                }
                checkDate.setDate(checkDate.getDate() - 1);
            }

            // Entries by day of week
            const entriesByDay: Record<string, number> = {
                'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0
            };
            entries.forEach(e => {
                const day = new Date(e.date).toLocaleDateString('en-US', { weekday: 'short' });
                entriesByDay[day]++;
            });

            // Mood over time (last 14 days for chart)
            const moodOverTime: { date: string; mood: string; score: number }[] = [];
            const last14Days = entries.slice(0, 14).reverse();
            last14Days.forEach(e => {
                if (e.mood) {
                    moodOverTime.push({
                        date: e.date,
                        mood: e.mood,
                        score: MOOD_SCORES[e.mood] || 3
                    });
                }
            });

            setAnalytics({
                entries,
                moodCounts,
                totalWords,
                averageWords: entries.length > 0 ? Math.round(totalWords / entries.length) : 0,
                streak,
                entriesByDay,
                moodOverTime
            });
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-white/50">Loading analytics...</div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-white/50">No data available</div>
            </div>
        );
    }

    const totalMoods = Object.values(analytics.moodCounts).reduce((a, b) => a + b, 0);
    const maxDayCount = Math.max(...Object.values(analytics.entriesByDay), 1);

    return (
        <div className="space-y-8">
            {/* Header with Time Range */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <BarChart3 className="text-purple-400" size={24} />
                    <h2 className="text-2xl font-bold text-white">Journal Analytics</h2>
                </div>
                <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
                    {(['week', 'month', 'all'] as const).map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === range
                                ? 'bg-purple-500 text-white'
                                : 'text-white/50 hover:text-white/70'
                                }`}
                        >
                            {range === 'week' ? '7 Days' : range === 'month' ? '30 Days' : 'All Time'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20"
                >
                    <PenLine className="text-purple-400 mb-3" size={24} />
                    <div className="text-3xl font-bold text-white">{analytics.entries.length}</div>
                    <div className="text-sm text-white/50">Total Entries</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20"
                >
                    <Flame className="text-orange-400 mb-3" size={24} />
                    <div className="text-3xl font-bold text-white">{analytics.streak}</div>
                    <div className="text-sm text-white/50">Day Streak</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
                >
                    <TrendingUp className="text-blue-400 mb-3" size={24} />
                    <div className="text-3xl font-bold text-white">{analytics.totalWords.toLocaleString()}</div>
                    <div className="text-sm text-white/50">Words Written</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20"
                >
                    <Brain className="text-green-400 mb-3" size={24} />
                    <div className="text-3xl font-bold text-white">{analytics.averageWords}</div>
                    <div className="text-sm text-white/50">Avg Words/Entry</div>
                </motion.div>
            </div>

            {/* Mood Distribution */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/10"
            >
                <h3 className="text-lg font-bold text-white mb-6">Mood Distribution</h3>
                <div className="space-y-4">
                    {Object.entries(analytics.moodCounts).map(([mood, count]) => {
                        const percentage = totalMoods > 0 ? (count / totalMoods) * 100 : 0;
                        return (
                            <div key={mood} className="flex items-center gap-4">
                                <div className="w-20 flex items-center gap-2">
                                    <span className="text-xl">{MOOD_EMOJIS[mood]}</span>
                                    <span className="text-sm text-white/60 capitalize">{mood}</span>
                                </div>
                                <div className="flex-1 h-8 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 0.8, delay: 0.6 }}
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: MOOD_COLORS[mood] }}
                                    />
                                </div>
                                <div className="w-16 text-right">
                                    <span className="text-white font-medium">{count}</span>
                                    <span className="text-white/40 text-sm ml-1">({Math.round(percentage)}%)</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Mood Trend Chart */}
            {analytics.moodOverTime.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="p-6 rounded-2xl bg-white/[0.02] border border-white/10"
                >
                    <h3 className="text-lg font-bold text-white mb-6">Mood Trend (Recent)</h3>
                    <div className="flex items-end gap-2 h-40">
                        {analytics.moodOverTime.map((item, index) => (
                            <div key={item.date} className="flex-1 flex flex-col items-center gap-2">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(item.score / 5) * 100}%` }}
                                    transition={{ duration: 0.5, delay: 0.7 + index * 0.05 }}
                                    className="w-full rounded-t-lg"
                                    style={{ backgroundColor: MOOD_COLORS[item.mood] }}
                                    title={`${item.date}: ${item.mood}`}
                                />
                                <span className="text-xs text-white/40">
                                    {new Date(item.date).getDate()}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-white/40">
                        <span>← Earlier</span>
                        <span>Recent →</span>
                    </div>
                </motion.div>
            )}

            {/* Writing Days */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/10"
            >
                <h3 className="text-lg font-bold text-white mb-6">Writing Days</h3>
                <div className="flex gap-4">
                    {Object.entries(analytics.entriesByDay).map(([day, count]) => (
                        <div key={day} className="flex-1 text-center">
                            <div className="h-24 flex items-end justify-center mb-2">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(count / maxDayCount) * 100}%` }}
                                    transition={{ duration: 0.5, delay: 0.8 }}
                                    className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-purple-500 to-pink-500"
                                    style={{ minHeight: count > 0 ? '8px' : '0' }}
                                />
                            </div>
                            <div className="text-sm font-medium text-white">{count}</div>
                            <div className="text-xs text-white/40">{day}</div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
