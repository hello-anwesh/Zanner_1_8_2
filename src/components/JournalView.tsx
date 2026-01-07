import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Trash2, Zap, Heart, Target, Brain, CheckCircle2, XCircle } from 'lucide-react';
import { journalService, JournalEntry } from '../services/journal/JournalService';

const JOURNAL_PROMPTS = [
    {
        id: 'wins',
        icon: CheckCircle2,
        question: "What's one win from today (no matter how small)?",
        color: '#10b981',
        placeholder: 'Finished a task, learned something new, helped someone...'
    },
    {
        id: 'struggle',
        icon: XCircle,
        question: "What's blocking you or draining your energy?",
        color: '#f59e0b',
        placeholder: 'Distractions, unclear goals, tiredness, procrastination...'
    },
    {
        id: 'focus',
        icon: Target,
        question: "What ONE thing deserves your focus tomorrow?",
        color: '#8b5cf6',
        placeholder: 'Most important task, key priority, critical decision...'
    },
    {
        id: 'energy',
        icon: Zap,
        question: "How's your energy? What would help?",
        color: '#06b6d4',
        placeholder: 'Feel energized/drained, need a break/challenge, want to...'
    }
];

export function JournalView() {
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const [responses, setResponses] = useState<Record<string, string>>({});
    const [mood, setMood] = useState<'great' | 'good' | 'okay' | 'struggling' | 'burnt-out' | undefined>();
    const [isSaving, setIsSaving] = useState(false);
    const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        loadEntry(currentDate);
        loadRecentEntries();
    }, [currentDate]);

    const loadEntry = async (date: string) => {
        const entry = await journalService.getEntry(date);
        if (entry) {
            // Parse structured responses from content
            try {
                const parsed = JSON.parse(entry.content);
                setResponses(parsed);
            } catch {
                // Old format fallback
                setResponses({ freeform: entry.content });
            }
            setMood(entry.mood);
        } else {
            setResponses({});
            setMood(undefined);
        }
        setHasChanges(false);
    };

    const loadRecentEntries = async () => {
        const entries = await journalService.getRecentEntries(7);
        setRecentEntries(entries);
    };

    const handleSave = async () => {
        const hasContent = Object.values(responses).some(r => r.trim());
        if (!hasContent) return;

        setIsSaving(true);
        try {
            const content = JSON.stringify(responses);
            await journalService.createOrUpdateEntry(currentDate, content, mood);
            setHasChanges(false);
            await loadRecentEntries();
        } catch (error) {
            alert('Failed to save journal entry');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this journal entry?')) return;

        try {
            await journalService.deleteEntry(currentDate);
            setResponses({});
            setMood(undefined);
            await loadRecentEntries();
        } catch (error) {
            alert('Failed to delete entry');
        }
    };

    const moodEmojis = {
        'great': { emoji: '🔥', label: 'On Fire', color: 'from-green-500 to-emerald-600' },
        'good': { emoji: '😊', label: 'Good', color: 'from-blue-500 to-cyan-600' },
        'okay': { emoji: '😐', label: 'Meh', color: 'from-yellow-500 to-amber-600' },
        'struggling': { emoji: '😓', label: 'Struggling', color: 'from-orange-500 to-red-600' },
        'burnt-out': { emoji: '🥵', label: 'Burnt Out', color: 'from-red-600 to-rose-700' }
    };

    return (
        <div className="flex-1 flex overflow-hidden">
            {/* Main Editor */}
            <div className="flex-1 flex flex-col px-16 py-10 overflow-y-auto custom-scrollbar">
                {/* Premium Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Daily Reflection</h1>
                        <p className="text-white/50 text-sm">Help Zeni understand you better</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <input
                            type="date"
                            value={currentDate}
                            onChange={(e) => setCurrentDate(e.target.value)}
                            className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white font-medium focus:border-white/30 outline-none transition-all"
                        />

                        {hasChanges && (
                            <span className="text-xs text-amber-400 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                                Unsaved
                            </span>
                        )}

                        <button
                            onClick={handleDelete}
                            className="p-2.5 rounded-xl hover:bg-red-500/10 text-white/40 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all"
                            title="Delete entry"
                        >
                            <Trash2 size={18} />
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={!Object.values(responses).some(r => r.trim()) || isSaving}
                            className="px-6 py-2.5 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white font-semibold hover:from-fuchsia-600 hover:to-purple-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg hover:shadow-fuchsia-500/50"
                        >
                            <Save size={16} />
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>

                {/* Mood Selector - Premium */}
                <div className="mb-10">
                    <label className="text-sm font-semibold text-white/70 mb-4 block">How are you feeling today?</label>
                    <div className="grid grid-cols-5 gap-3">
                        {Object.entries(moodEmojis).map(([value, { emoji, label, color }]) => (
                            <button
                                key={value}
                                onClick={() => {
                                    setMood(value as any);
                                    setHasChanges(true);
                                }}
                                className={`group relative p-6 rounded-2xl border transition-all duration-300 hover:scale-105 ${mood === value
                                        ? `border-white/30 bg-gradient-to-br ${color} shadow-lg`
                                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className="text-4xl mb-2">{emoji}</div>
                                <div className={`text-sm font-medium ${mood === value ? 'text-white' : 'text-white/60'}`}>
                                    {label}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Structured Questions */}
                <div className="space-y-6">
                    {JOURNAL_PROMPTS.map((prompt) => {
                        const Icon = prompt.icon;
                        return (
                            <motion.div
                                key={prompt.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group"
                            >
                                <div className="flex items-start gap-4 mb-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
                                        style={{
                                            background: `linear-gradient(135deg, ${prompt.color}20 0%, ${prompt.color}10 100%)`,
                                            border: `1px solid ${prompt.color}30`
                                        }}
                                    >
                                        <Icon size={20} style={{ color: prompt.color }} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-base font-semibold text-white mb-1 block">
                                            {prompt.question}
                                        </label>
                                        <textarea
                                            value={responses[prompt.id] || ''}
                                            onChange={(e) => {
                                                setResponses({ ...responses, [prompt.id]: e.target.value });
                                                setHasChanges(true);
                                            }}
                                            placeholder={prompt.placeholder}
                                            rows={3}
                                            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-white/30 focus:bg-white/8 resize-none transition-all"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-3">
                        <Brain className="text-purple-400" size={20} />
                        <p className="text-sm text-white/70">
                            <span className="font-semibold text-white">Zeni reads this:</span> Your recent entries help me understand your patterns, struggles, and wins to give you better advice.
                        </p>
                    </div>
                </div>
            </div>

            {/* Sidebar - Recent Entries */}
            <div className="w-96 border-l border-white/10 p-8 overflow-y-auto custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-6">Recent Entries</h3>

                <div className="space-y-3">
                    <AnimatePresence>
                        {recentEntries.map((entry) => {
                            let parsedContent: Record<string, string> = {};
                            try {
                                parsedContent = JSON.parse(entry.content);
                            } catch {
                                parsedContent = { freeform: entry.content };
                            }

                            const preview = Object.values(parsedContent).find(v => v.trim()) || '';

                            return (
                                <motion.button
                                    key={entry.date}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onClick={() => setCurrentDate(entry.date)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all ${entry.date === currentDate
                                            ? 'border-fuchsia-500/50 bg-fuchsia-500/10 shadow-lg'
                                            : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-bold text-white">
                                            {new Date(entry.date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                        {entry.mood && moodEmojis[entry.mood as keyof typeof moodEmojis] && (
                                            <span className="text-lg">
                                                {moodEmojis[entry.mood as keyof typeof moodEmojis].emoji}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                                        {preview}
                                    </p>
                                </motion.button>
                            );
                        })}
                    </AnimatePresence>

                    {recentEntries.length === 0 && (
                        <div className="text-center py-16 text-white/30 text-sm">
                            <div className="text-4xl mb-4">📓</div>
                            No entries yet.<br />Start reflecting!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
