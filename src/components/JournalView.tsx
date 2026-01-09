import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, ChevronLeft, ChevronRight, Flame, Calendar, Tag, X, Search } from 'lucide-react';
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
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [allEntries, setAllEntries] = useState<JournalEntry[]>([]);
    const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [streak, setStreak] = useState(0);
    const [viewMode, setViewMode] = useState<'today' | 'all'>('today');

    useEffect(() => {
        loadEntry(currentDate);
        loadAllEntries();
        calculateStreak();
    }, [currentDate]);

    useEffect(() => {
        if (searchQuery) {
            const filtered = allEntries.filter(entry =>
                entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                entry.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setFilteredEntries(filtered);
        } else {
            setFilteredEntries(allEntries);
        }
    }, [searchQuery, allEntries]);

    const loadEntry = async (date: string) => {
        const entry = await journalService.getEntry(date);
        if (entry) {
            setContent(entry.content);
            setMood(entry.mood);
            setTags(entry.tags || []);
        } else {
            setContent('');
            setMood(undefined);
            setTags([]);
        }
    };

    const loadAllEntries = async () => {
        const entries = await journalService.getRecentEntries(365);
        setAllEntries(entries);
        setFilteredEntries(entries);
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
            await journalService.createOrUpdateEntry(currentDate, content, mood, tags);
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
        setViewMode('today');
    };

    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    const isToday = currentDate === new Date().toISOString().split('T')[0];

    return (
        <div className="min-h-screen p-16" style={{ background: 'linear-gradient(to bottom, #0a0a0a, #0a0a1a)' }}>
            <div className="max-w-5xl mx-auto space-y-16">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <Calendar className="text-purple-400" size={24} />
                        <h1 className="text-2xl font-black text-white">Journal</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {streak > 0 && (
                            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30">
                                <Flame className="text-orange-400" size={20} />
                                <div className="text-2xl font-black text-white">{streak}</div>
                                <div className="text-xs text-white/50">day streak</div>
                            </div>
                        )}

                        <div className="flex gap-2 bg-white/5 p-2 rounded-2xl">
                            <button
                                onClick={() => setViewMode('today')}
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'today' ? 'bg-purple-500 text-white' : 'text-white/50 hover:text-white/70'
                                    }`}
                            >
                                Today
                            </button>
                            <button
                                onClick={() => setViewMode('all')}
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'all' ? 'bg-purple-500 text-white' : 'text-white/50 hover:text-white/70'
                                    }`}
                            >
                                All Entries
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Today's Entry View */}
                {viewMode === 'today' && (
                    <div className="space-y-12">
                        {/* Date Navigation */}
                        <div className="flex items-center justify-center gap-8">
                            <button
                                onClick={() => navigateDate(-1)}
                                className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
                            >
                                <ChevronLeft size={24} className="text-white/70" />
                            </button>

                            <div className="text-center">
                                <h2 className="text-4xl font-black text-white mb-2">
                                    {new Date(currentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                </h2>
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
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white/70 text-center">How are you feeling?</h3>
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
                        </div>

                        {/* Editor */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white/70">What's on your mind?</h3>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write freely about your day, thoughts, wins, challenges, or anything else..."
                                className="w-full h-96 p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-white text-lg leading-relaxed placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.03] resize-none transition-all"
                                style={{ lineHeight: '1.8' }}
                            />
                        </div>

                        {/* Tags */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white/70">Tags</h3>
                            <div className="flex flex-wrap gap-3">
                                {tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium border border-purple-500/30"
                                    >
                                        #{tag}
                                        <button
                                            onClick={() => removeTag(tag)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                        placeholder="Add tag..."
                                        className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                                    />
                                    <button
                                        onClick={addTag}
                                        className="px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-all"
                                    >
                                        <Tag size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-center pt-8">
                            <button
                                onClick={handleSave}
                                disabled={!content.trim() || isSaving}
                                className="px-12 py-5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-bold disabled:opacity-50 hover:shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105 flex items-center gap-3"
                            >
                                <Save size={24} />
                                {isSaving ? 'Saving...' : 'Save Entry'}
                            </button>
                        </div>
                    </div>
                )}

                {/* All Entries View */}
                {viewMode === 'all' && (
                    <div className="space-y-12">
                        {/* Search */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search entries or tags..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                                />
                            </div>
                        </div>

                        {/* Entries Grid */}
                        <div className="grid grid-cols-3 gap-6">
                            {filteredEntries.map((entry) => (
                                <motion.button
                                    key={entry.date}
                                    onClick={() => { setCurrentDate(entry.date); setViewMode('today'); }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -4 }}
                                    className="p-6 rounded-3xl text-left transition-all bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] hover:border-purple-500/30"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-bold text-white">
                                            {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        {entry.mood && (
                                            <span className="text-3xl">{MOODS.find(m => m.id === entry.mood)?.emoji}</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-white/60 line-clamp-4 leading-relaxed mb-4">
                                        {entry.content}
                                    </p>
                                    {entry.tags && entry.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {entry.tags.slice(0, 3).map(tag => (
                                                <span key={tag} className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </motion.button>
                            ))}
                        </div>

                        {filteredEntries.length === 0 && (
                            <div className="text-center py-20">
                                <p className="text-white/40 text-lg">No entries found</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
