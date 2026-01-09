import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, Trash2, Search, Tag, Calendar, TrendingUp, Sparkles,
    ChevronLeft, ChevronRight, Filter, Star, Flame
} from 'lucide-react';
import { journalService, JournalEntry } from '../services/journal/JournalService';

const MOODS = [
    { id: 'amazing', emoji: '🔥', label: 'On Fire', gradient: 'from-green-400 to-emerald-500' },
    { id: 'good', emoji: '😊', label: 'Good', gradient: 'from-blue-400 to-cyan-500' },
    { id: 'okay', emoji: '😐', label: 'Okay', gradient: 'from-yellow-400 to-amber-500' },
    { id: 'struggling', emoji: '😓', label: 'Struggling', gradient: 'from-orange-400 to-red-500' },
    { id: 'exhausted', emoji: '😵', label: 'Exhausted', gradient: 'from-red-500 to-pink-600' }
];

const TEMPLATES = [
    {
        name: '🎯 Focus Session',
        prompts: [
            { label: 'What did you accomplish?', placeholder: 'Completed tasks, made progress on...' },
            { label: 'What challenged you?', placeholder: 'Distractions, blocks, difficulties...' },
            { label: 'What did you learn?', placeholder: 'Insights, realizations, discoveries...' }
        ]
    },
    {
        name: '🌅 Morning Intention',
        prompts: [
            { label: 'Today\'s top priority', placeholder: 'The ONE thing that matters most...' },
            { label: 'How do you want to feel?', placeholder: 'Focused, energized, calm...' },
            { label: 'What might derail you?', placeholder: 'Potential distractions, obstacles...' }
        ]
    },
    {
        name: '🌙 Evening Reflection',
        prompts: [
            { label: 'What went well?', placeholder: 'Wins, successes, proud moments...' },
            { label: 'What could be better?', placeholder: 'Lessons, improvements, changes...' },
            { label: 'Gratitude moment', placeholder: 'Something you\'re grateful for today...' }
        ]
    },
    {
        name: '✨ Free Form',
        prompts: [
            { label: 'What\'s on your mind?', placeholder: 'Thoughts, feelings, ideas, anything...' }
        ]
    }
];

const INSPIRING_QUOTES = [
    '"The secret of getting ahead is getting started." - Mark Twain',
    '"Small daily improvements are the key to staggering long-term results." - Robin Sharma',
    '"Focus on being productive instead of busy." - Tim Ferriss',
    '"The way to get started is to quit talking and begin doing." - Walt Disney',
    '"Don\'t watch the clock; do what it does. Keep going." - Sam Levenson'
];

export function JournalView() {
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const [content, setContent] = useState('');
    const [mood, setMood] = useState<string>();
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [allEntries, setAllEntries] = useState<JournalEntry[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState(0);
    const [templateResponses, setTemplateResponses] = useState<Record<number, string>>({});
    const [streak, setStreak] = useState(0);
    const [totalEntries, setTotalEntries] = useState(0);
    const [quote] = useState(INSPIRING_QUOTES[Math.floor(Math.random() * INSPIRING_QUOTES.length)]);

    useEffect(() => {
        loadEntry(currentDate);
        loadAllEntries();
        calculateStreak();
    }, [currentDate]);

    const loadEntry = async (date: string) => {
        const entry = await journalService.getEntry(date);
        if (entry) {
            try {
                const parsed = JSON.parse(entry.content);
                if (parsed.template !== undefined) {
                    setSelectedTemplate(parsed.template);
                    setTemplateResponses(parsed.responses || {});
                } else {
                    setContent(entry.content);
                }
            } catch {
                setContent(entry.content);
            }
            setMood(entry.mood);
            setTags(entry.tags || []);
        } else {
            setContent('');
            setMood(undefined);
            setTags([]);
            setTemplateResponses({});
        }
    };

    const loadAllEntries = async () => {
        const entries = await journalService.getRecentEntries(30);
        setAllEntries(entries);
        setTotalEntries(entries.length);
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
        setIsSaving(true);
        try {
            const savedContent = TEMPLATES[selectedTemplate].name === '✨ Free Form'
                ? content
                : JSON.stringify({ template: selectedTemplate, responses: templateResponses });

            await journalService.createOrUpdateEntry(currentDate, savedContent, mood, tags);
            await loadAllEntries();
            await calculateStreak();
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this entry?')) return;
        await journalService.deleteEntry(currentDate);
        setContent('');
        setMood(undefined);
        setTags([]);
        setTemplateResponses({});
        loadAllEntries();
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

    const navigateDate = (days: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        setCurrentDate(newDate.toISOString().split('T')[0]);
    };

    const filteredEntries = allEntries.filter(entry => {
        if (!searchQuery) return true;
        return entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    });

    const hasContent = TEMPLATES[selectedTemplate].name === '✨ Free Form'
        ? content.trim().length > 0
        : Object.values(templateResponses).some(r => r?.trim());

    return (
        <div className="flex h-screen" style={{ background: 'linear-gradient(to bottom, #0a0a0a, #1a0a1a)' }}>

            {/* Sidebar - History & Stats */}
            <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                className="w-80 border-r border-white/10 flex flex-col"
                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)' }}
            >
                {/* Stats */}
                <div className="p-8 border-b border-white/10 space-y-6">
                    <h2 className="text-2xl font-black text-white">Your Journey</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
                            <Flame className="text-orange-400 mb-2" size={24} />
                            <div className="text-3xl font-black text-white">{streak}</div>
                            <div className="text-xs text-white/50">Day Streak</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                            <Star className="text-purple-400 mb-2" size={24} />
                            <div className="text-3xl font-black text-white">{totalEntries}</div>
                            <div className="text-xs text-white/50">Total Entries</div>
                        </div>
                    </div>

                    <p className="text-sm text-white/40 italic">"{quote}"</p>
                </div>

                {/* Search */}
                <div className="p-6 border-b border-white/10">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                        <input
                            type="text"
                            placeholder="Search entries..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                        />
                    </div>
                </div>

                {/* Recent Entries */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-4 space-y-2">
                        {filteredEntries.map((entry) => (
                            <button
                                key={entry.date}
                                onClick={() => setCurrentDate(entry.date)}
                                className={`w-full p-4 rounded-xl text-left transition-all hover:bg-white/5 ${entry.date === currentDate ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-white/[0.02] border border-white/10'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-white">{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    {entry.mood && (
                                        <span className="text-xl">{MOODS.find(m => m.id === entry.mood)?.emoji}</span>
                                    )}
                                </div>
                                <p className="text-xs text-white/40 line-clamp-2">{entry.content.substring(0, 60)}...</p>
                                {entry.tags && entry.tags.length > 0 && (
                                    <div className="flex gap-1 mt-2 flex-wrap">
                                        {entry.tags.slice(0, 2).map(tag => (
                                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Main Editor */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Header */}
                <div className="p-8 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigateDate(-1)}
                            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
                        >
                            <ChevronLeft size={20} className="text-white/70" />
                        </button>

                        <div>
                            <h1 className="text-3xl font-black text-white">
                                {new Date(currentDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </h1>
                            <p className="text-white/40 text-sm mt-1">How are you feeling today?</p>
                        </div>

                        <button
                            onClick={() => navigateDate(1)}
                            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
                            disabled={currentDate >= new Date().toISOString().split('T')[0]}
                        >
                            <ChevronRight size={20} className="text-white/70" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                        >
                            <Trash2 size={18} />
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!hasContent || isSaving}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold disabled:opacity-50 hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
                        >
                            {isSaving ? 'Saving...' : <><Save size={18} /> Save</>}
                        </button>
                    </div>
                </div>

                {/* Mood Selector */}
                <div className="px-8 py-6 border-b border-white/10">
                    <p className="text-sm text-white/50 mb-4">Today's Mood</p>
                    <div className="flex gap-3">
                        {MOODS.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setMood(m.id)}
                                className={`flex-1 p-4 rounded-2xl transition-all ${mood === m.id
                                        ? `bg-gradient-to-br ${m.gradient} text-white shadow-lg`
                                        : 'bg-white/5 text-white/40 hover:bg-white/10'
                                    }`}
                            >
                                <div className="text-3xl mb-2">{m.emoji}</div>
                                <div className="text-xs font-bold">{m.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Template Selector */}
                <div className="px-8 py-6 border-b border-white/10">
                    <p className="text-sm text-white/50 mb-4">Writing Style</p>
                    <div className="flex gap-2">
                        {TEMPLATES.map((template, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedTemplate(i)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedTemplate === i
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                                    }`}
                            >
                                {template.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Editor */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                    {TEMPLATES[selectedTemplate].name === '✨ Free Form' ? (
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's on your mind today? Write freely..."
                            className="w-full h-96 p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-white text-lg placeholder-white/20 focus:outline-none focus:border-purple-500/50 resize-none"
                        />
                    ) : (
                        <div className="space-y-6">
                            {TEMPLATES[selectedTemplate].prompts.map((prompt, i) => (
                                <div key={i} className="space-y-3">
                                    <label className="block text-lg font-bold text-white">{prompt.label}</label>
                                    <textarea
                                        value={templateResponses[i] || ''}
                                        onChange={(e) => setTemplateResponses({ ...templateResponses, [i]: e.target.value })}
                                        placeholder={prompt.placeholder}
                                        className="w-full h-32 p-4 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 resize-none"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tags */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-white/70">Tags</label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {tags.map(tag => (
                                <span
                                    key={tag}
                                    onClick={() => removeTag(tag)}
                                    className="px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-300 text-sm cursor-pointer hover:bg-purple-500/30 transition-all"
                                >
                                    #{tag} ×
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                placeholder="Add a tag..."
                                className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                            />
                            <button
                                onClick={addTag}
                                className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-all"
                            >
                                <Tag size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
