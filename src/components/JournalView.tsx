import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, ChevronLeft, ChevronRight, Flame, Calendar } from 'lucide-react';
import { journalService, JournalEntry } from '../services/journal/JournalService';

const MOODS = [
    { id: 'amazing', emoji: '🔥', label: 'Amazing' },
    { id: 'good', emoji: '😊', label: 'Good' },
    { id: 'okay', emoji: '😐', label: 'Okay' },
    { id: 'struggling', emoji: '😓', label: 'Struggling' },
    { id: 'exhausted', emoji: '😵', label: 'Exhausted' }
];

export function JournalView() {
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const [content, setContent] = useState('');
    const [mood, setMood] = useState<string>();
    const [isSaving, setIsSaving] = useState(false);
    const [allEntries, setAllEntries] = useState<JournalEntry[]>([]);
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        loadEntry(currentDate);
        loadAllEntries();
        calculateStreak();
    }, [currentDate]);

    const loadEntry = async (date: string) => {
        const entry = await journalService.getEntry(date);
        if (entry) {
            setContent(entry.content);
            setMood(entry.mood);
        } else {
            setContent('');
            setMood(undefined);
        }
    };

    const loadAllEntries = async () => {
        const entries = await journalService.getRecentEntries(30);
        setAllEntries(entries);
    };

    const calculateStreak = async () => {
        const entries = await journalService.getRecentEntries(365);
        let currentStreak = 0;
        let checkDate = new Date();

        for (let i = 0; i < 365; i++) {
            const dateStr = checkDate.toISOString().split('T')[0];
            if (entries.some(e => e.date === dateStr)) {
                currentStreak++;
            } else {
                break;
            }
            checkDate.setDate(checkDate.getDate() - 1);
        }
        setStreak(currentStreak);
    };

    const handleSave = async () => {
        if (!content.trim()) return;

        setIsSaving(true);
        try {
            await journalService.createOrUpdateEntry(currentDate, content, mood);
            await loadAllEntries();
            await calculateStreak();
        } finally {
            setIsSaving(false);
        }
    };

    const navigateDate = (days: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        setCurrentDate(newDate.toISOString().split('T')[0]);
    };

    const isToday = currentDate === new Date().toISOString().split('T')[0];

    return (
        <div className="min-h-screen p-16" style={{ background: 'linear-gradient(to bottom, #0a0a0a, #0a0a1a)' }}>
            <div className="max-w-4xl mx-auto space-y-16">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-6"
                >
                    <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/5">
                        <Calendar className="text-purple-400" size={20} />
                        <span className="text-white/60 text-sm font-medium">Daily Reflection</span>
                    </div>

                    {streak > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-3xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30"
                        >
                            <Flame className="text-orange-400" size={28} />
                            <div>
                                <div className="text-4xl font-black text-white">{streak}</div>
                                <div className="text-xs text-white/50">Day Streak</div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Date Navigation */}
                <div className="flex items-center justify-center gap-8">
                    <button
                        onClick={() => navigateDate(-1)}
                        className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
                    >
                        <ChevronLeft size={24} className="text-white/70" />
                    </button>

                    <div className="text-center">
                        <h1 className="text-4xl font-black text-white mb-2">
                            {new Date(currentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </h1>
                        <p className="text-white/40">
                            {new Date(currentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric' })}
                        </p>
                    </div>

                    <button
                        onClick={() => navigateDate(1)}
                        disabled={isToday}
                        className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all disabled:opacity-30"
                    >
                        <ChevronRight size={24} className="text-white/70" />
                    </button>
                </div>

                {/* Mood Selector */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                >
                    <h2 className="text-2xl font-bold text-white text-center">How are you feeling?</h2>
                    <div className="flex gap-4">
                        {MOODS.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setMood(m.id)}
                                className={`flex-1 p-6 rounded-3xl transition-all ${mood === m.id
                                        ? 'bg-purple-500 text-white scale-105 shadow-2xl shadow-purple-500/50'
                                        : 'bg-white/[0.02] text-white/40 hover:bg-white/[0.05] border border-white/10'
                                    }`}
                            >
                                <div className="text-5xl mb-3">{m.emoji}</div>
                                <div className="text-sm font-bold">{m.label}</div>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Editor */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    <h2 className="text-2xl font-bold text-white">What's on your mind?</h2>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write freely about your day, thoughts, wins, challenges, or anything else..."
                        className="w-full h-96 p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-white text-lg leading-relaxed placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.03] resize-none transition-all"
                        style={{ lineHeight: '1.8' }}
                    />
                </motion.div>

                {/* Actions */}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={handleSave}
                        disabled={!content.trim() || isSaving}
                        className="px-12 py-5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-bold disabled:opacity-50 hover:shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105 flex items-center gap-3"
                    >
                        <Save size={24} />
                        {isSaving ? 'Saving...' : 'Save Entry'}
                    </button>
                </div>

                {/* Recent Entries - Minimalist Grid */}
                {allEntries.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-8 pt-16 border-t border-white/10"
                    >
                        <h2 className="text-3xl font-black text-white">Past Entries</h2>
                        <div className="grid grid-cols-4 gap-4">
                            {allEntries.slice(0, 12).map((entry) => (
                                <button
                                    key={entry.date}
                                    onClick={() => setCurrentDate(entry.date)}
                                    className={`p-6 rounded-2xl text-left transition-all group ${entry.date === currentDate
                                            ? 'bg-purple-500/20 border-2 border-purple-500/50'
                                            : 'bg-white/[0.02] border border-white/10 hover:bg-white/[0.05]'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-bold text-white">
                                            {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                        {entry.mood && (
                                            <span className="text-2xl">{MOODS.find(m => m.id === entry.mood)?.emoji}</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-white/40 line-clamp-3 leading-relaxed">
                                        {entry.content.substring(0, 80)}...
                                    </p>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
