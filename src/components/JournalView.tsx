import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Save, Trash2, Smile, Meh, Frown, Zap, AlertCircle } from 'lucide-react';
import { journalService, JournalEntry } from '../services/journal/JournalService';

export function JournalView() {
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const [content, setContent] = useState('');
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
            setContent(entry.content);
            setMood(entry.mood);
        } else {
            setContent('');
            setMood(undefined);
        }
        setHasChanges(false);
    };

    const loadRecentEntries = async () => {
        const entries = await journalService.getRecentEntries(5);
        setRecentEntries(entries);
    };

    const handleSave = async () => {
        if (!content.trim()) return;

        setIsSaving(true);
        try {
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
            setContent('');
            setMood(undefined);
            await loadRecentEntries();
        } catch (error) {
            alert('Failed to delete entry');
        }
    };

    const moodOptions = [
        { value: 'great', icon: Zap, color: 'text-green-400', label: 'Great' },
        { value: 'good', icon: Smile, color: 'text-blue-400', label: 'Good' },
        { value: 'okay', icon: Meh, color: 'text-yellow-400', label: 'Okay' },
        { value: 'struggling', icon: Frown, color: 'text-orange-400', label: 'Struggling' },
        { value: 'burnt-out', icon: AlertCircle, color: 'text-red-400', label: 'Burnt Out' },
    ];

    return (
        <div className="flex-1 flex">
            {/* Main Editor */}
            <div className="flex-1 flex flex-col px-12 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <input
                            type="date"
                            value={currentDate}
                            onChange={(e) => setCurrentDate(e.target.value)}
                            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-white/30 outline-none"
                        />
                        {hasChanges && (
                            <span className="text-xs text-yellow-400 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                                Unsaved changes
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDelete}
                            className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-red-400 transition-all"
                            title="Delete entry"
                        >
                            <Trash2 size={18} />
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!content.trim() || isSaving}
                            className="px-4 py-2 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white hover:from-fuchsia-600 hover:to-purple-700 disabled:opacity-30 transition-all flex items-center gap-2"
                        >
                            <Save size={16} />
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>

                {/* Mood Selector */}
                <div className="mb-6">
                    <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">How are you feeling?</label>
                    <div className="flex gap-2">
                        {moodOptions.map(({ value, icon: Icon, color, label }) => (
                            <button
                                key={value}
                                onClick={() => {
                                    setMood(value as any);
                                    setHasChanges(true);
                                }}
                                className={`flex-1 p-3 rounded-xl border transition-all ${mood === value
                                        ? `border-white/30 bg-white/10 ${color}`
                                        : 'border-white/10 bg-white/5 text-white/40 hover:bg-white/10'
                                    }`}
                            >
                                <Icon size={20} className="mx-auto mb-1" />
                                <div className="text-xs">{label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Text Editor */}
                <div className="flex-1 mb-4">
                    <textarea
                        value={content}
                        onChange={(e) => {
                            setContent(e.target.value);
                            setHasChanges(true);
                        }}
                        placeholder="What's on your mind? Zeni can read these entries to understand your journey better..."
                        className="w-full h-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-white/30 resize-none custom-scrollbar"
                    />
                </div>

                <p className="text-xs text-white/30 text-center">
                    💡 Zeni uses your recent journal entries to give you more personalized advice
                </p>
            </div>

            {/* Sidebar - Recent Entries */}
            <div className="w-80 border-l border-white/10 p-6 overflow-y-auto custom-scrollbar">
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">Recent Entries</h3>

                <div className="space-y-3">
                    <AnimatePresence>
                        {recentEntries.map((entry) => (
                            <motion.button
                                key={entry.date}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onClick={() => setCurrentDate(entry.date)}
                                className={`w-full text-left p-4 rounded-xl border transition-all ${entry.date === currentDate
                                        ? 'border-fuchsia-500/50 bg-fuchsia-500/10'
                                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-white">
                                        {new Date(entry.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                    {entry.mood && (
                                        <span className="text-xs text-white/40 capitalize">{entry.mood}</span>
                                    )}
                                </div>
                                <p className="text-xs text-white/60 line-clamp-2">
                                    {entry.content}
                                </p>
                            </motion.button>
                        ))}
                    </AnimatePresence>

                    {recentEntries.length === 0 && (
                        <div className="text-center py-8 text-white/30 text-sm">
                            No entries yet.<br />Start writing!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
