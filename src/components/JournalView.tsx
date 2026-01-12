import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, ChevronLeft, ChevronRight, Flame, Calendar, Tag, X, Search, Lightbulb, Heart } from 'lucide-react';
import { journalService, JournalEntry } from '../services/journal/JournalService';
import { journalPromptService, JournalPrompt } from '../services/journal/JournalPromptService';

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

    // Phase 3B: Gratitude Mode
    const [gratitudeMode, setGratitudeMode] = useState(false);
    const [gratitudeItems, setGratitudeItems] = useState<[string, string, string]>(['', '', '']);

    // Phase 1: Auto-save states
    const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | null>(null);
    const [wordCount, setWordCount] = useState(0);
    const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSavedContentRef = useRef('');

    // Calculate word count when content changes
    useEffect(() => {
        const words = content.trim() ? content.trim().split(/\s+/).length : 0;
        setWordCount(words);
    }, [content]);

    // Auto-save with debounce (3 seconds after typing stops)
    useEffect(() => {
        // Only auto-save if content has changed from last saved version
        if (content === lastSavedContentRef.current) {
            return;
        }

        // Show unsaved indicator
        if (content.trim()) {
            setAutoSaveStatus('unsaved');
        }

        // Clear existing timeout
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }

        // Set new timeout for auto-save
        autoSaveTimeoutRef.current = setTimeout(async () => {
            if (content.trim() && content !== lastSavedContentRef.current) {
                setAutoSaveStatus('saving');
                try {
                    await journalService.createOrUpdateEntry(currentDate, content, mood, tags);
                    lastSavedContentRef.current = content;
                    setAutoSaveStatus('saved');
                    // Load entries to update list
                    loadAllEntries();
                    calculateStreak();
                } catch (error) {
                    console.error('Auto-save failed:', error);
                    setAutoSaveStatus('unsaved');
                }
            }
        }, 3000);

        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [content, currentDate, mood, tags]);

    // Phase 2: AI Writing Prompts
    const [prompts, setPrompts] = useState<JournalPrompt[]>([]);
    const [promptsVisible, setPromptsVisible] = useState(true);

    // Load prompts when viewing an empty entry
    useEffect(() => {
        const loadPrompts = async () => {
            // Only show prompts for today's empty entry
            const isToday = currentDate === new Date().toISOString().split('T')[0];
            if (isToday && !content.trim()) {
                const contextualPrompts = await journalPromptService.getPrompts(3);
                setPrompts(contextualPrompts);
                setPromptsVisible(true);
            } else {
                setPrompts([]);
            }
        };
        loadPrompts();
    }, [currentDate]);

    // Hide prompts when user starts writing
    useEffect(() => {
        if (content.trim().length > 20) {
            setPromptsVisible(false);
        }
    }, [content]);

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
            lastSavedContentRef.current = entry.content;
            setAutoSaveStatus('saved');
        } else {
            setContent('');
            setMood(undefined);
            setTags([]);
            lastSavedContentRef.current = '';
            setAutoSaveStatus(null);
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
        setAutoSaveStatus('saving');
        try {
            await journalService.createOrUpdateEntry(currentDate, content, mood, tags);
            lastSavedContentRef.current = content;
            setAutoSaveStatus('saved');
            await loadAllEntries();
            await calculateStreak();
        } catch (error) {
            console.error('Save failed:', error);
            setAutoSaveStatus('unsaved');
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

    // Keyboard shortcuts (Cmd+S / Ctrl+S to save)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                if (content.trim() && !isSaving) {
                    handleSave();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [content, isSaving, currentDate, mood, tags]);

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

                        {/* AI Writing Prompts */}
                        <AnimatePresence>
                            {prompts.length > 0 && promptsVisible && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-white/60">
                                            <Lightbulb size={18} />
                                            <span className="text-sm font-medium">Writing prompts for you</span>
                                        </div>
                                        <button
                                            onClick={() => setPromptsVisible(false)}
                                            className="text-white/40 hover:text-white/60 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {prompts.map((prompt) => (
                                            <motion.button
                                                key={prompt.id}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => {
                                                    setContent(prompt.text + '\n\n');
                                                    setPromptsVisible(false);
                                                }}
                                                className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 text-left transition-all group"
                                            >
                                                <div className="text-2xl mb-2">{prompt.icon}</div>
                                                <div className="text-sm text-white/70 group-hover:text-white/90 transition-colors leading-relaxed">
                                                    {prompt.text}
                                                </div>
                                                <div className="mt-2 text-xs text-purple-400/60 capitalize">
                                                    {prompt.category}
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Editor with Gratitude Mode Toggle */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-xl font-bold text-white/70">
                                        {gratitudeMode ? 'Three things I\'m grateful for' : 'What\'s on your mind?'}
                                    </h3>
                                    {/* Gratitude Mode Toggle */}
                                    <button
                                        onClick={() => {
                                            const newMode = !gratitudeMode;
                                            setGratitudeMode(newMode);
                                            if (newMode) {
                                                // Parse existing content into gratitude items if switching to gratitude mode
                                                setGratitudeItems(['', '', '']);
                                                if (!tags.includes('gratitude')) {
                                                    setTags([...tags, 'gratitude']);
                                                }
                                            } else {
                                                // Convert gratitude items to content when switching off
                                                const nonEmpty = gratitudeItems.filter(item => item.trim());
                                                if (nonEmpty.length > 0) {
                                                    setContent(`Today I'm grateful for:\n\n1. ${gratitudeItems[0] || '...'}\n2. ${gratitudeItems[1] || '...'}\n3. ${gratitudeItems[2] || '...'}`);
                                                }
                                            }
                                        }}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${gratitudeMode
                                                ? 'bg-pink-500 text-white'
                                                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
                                            }`}
                                    >
                                        <Heart size={16} className={gratitudeMode ? 'fill-current' : ''} />
                                        Gratitude
                                    </button>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    {/* Word count */}
                                    {!gratitudeMode && (
                                        <span className="text-white/40">
                                            {wordCount} {wordCount === 1 ? 'word' : 'words'}
                                        </span>
                                    )}
                                    {/* Auto-save status */}
                                    {autoSaveStatus && (
                                        <span className={`flex items-center gap-1 ${autoSaveStatus === 'saved' ? 'text-green-400' :
                                            autoSaveStatus === 'saving' ? 'text-yellow-400' :
                                                'text-orange-400'
                                            }`}>
                                            {autoSaveStatus === 'saved' && '✓ Saved'}
                                            {autoSaveStatus === 'saving' && '↻ Saving...'}
                                            {autoSaveStatus === 'unsaved' && '○ Unsaved'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Gratitude Mode Inputs */}
                            {gratitudeMode ? (
                                <div className="space-y-4">
                                    {[0, 1, 2].map((index) => (
                                        <div key={index} className="flex items-start gap-4">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500/30 to-purple-500/30 flex items-center justify-center text-lg font-bold text-pink-300">
                                                {index + 1}
                                            </div>
                                            <input
                                                type="text"
                                                value={gratitudeItems[index]}
                                                onChange={(e) => {
                                                    const newItems = [...gratitudeItems] as [string, string, string];
                                                    newItems[index] = e.target.value;
                                                    setGratitudeItems(newItems);
                                                    // Update content for auto-save
                                                    const formatted = `Today I'm grateful for:\n\n1. ${newItems[0] || '...'}\n2. ${newItems[1] || '...'}\n3. ${newItems[2] || '...'}`;
                                                    setContent(formatted);
                                                }}
                                                placeholder={[
                                                    "Something that made me smile...",
                                                    "Someone I appreciate...",
                                                    "A small win or moment..."
                                                ][index]}
                                                className="flex-1 p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-white text-lg placeholder-white/20 focus:outline-none focus:border-pink-500/50 focus:bg-white/[0.03] transition-all"
                                            />
                                        </div>
                                    ))}
                                    <p className="text-sm text-white/40 text-center pt-4">
                                        💝 Taking a moment to appreciate the good in your life
                                    </p>
                                </div>
                            ) : (
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Write freely about your day, thoughts, wins, challenges, or anything else..."
                                    className="w-full h-96 p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-white text-lg leading-relaxed placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.03] resize-none transition-all"
                                    style={{ lineHeight: '1.8' }}
                                />
                            )}
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
