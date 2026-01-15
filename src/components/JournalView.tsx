import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, ChevronLeft, ChevronRight, Flame, Calendar, Tag, Search, Lightbulb, Heart, Sparkles, Loader2, BarChart3, Edit3, Eye } from 'lucide-react';
import { journalService, JournalEntry } from '../services/journal/JournalService';
import { journalPromptService, JournalPrompt } from '../services/journal/JournalPromptService';
import { journalAIService, JournalReflection } from '../services/journal/JournalAIService';
import { JournalAnalytics } from './JournalAnalytics';
import { RichTextEditor } from './editor/RichTextEditor';
import { JournalContentRenderer } from './journal/JournalContentRenderer';
import { SessionNotesTimeline } from './journal/SessionNotesTimeline';
import { getLocalDateString } from '../utils/dateUtils';

const MOODS = [
    { id: 'amazing', emoji: '🔥', label: 'Amazing' },
    { id: 'good', emoji: '😊', label: 'Good' },
    { id: 'okay', emoji: '😐', label: 'Okay' },
    { id: 'struggling', emoji: '😓', label: 'Struggling' },
    { id: 'exhausted', emoji: '😵', label: 'Exhausted' }
];

// Phase 3A: Journal Templates
const JOURNAL_TEMPLATES = [
    {
        id: 'freewrite',
        name: 'Freewrite',
        emoji: '✍️',
        description: 'Write freely without structure',
        content: ''
    },
    {
        id: 'morning',
        name: 'Morning Check-in',
        emoji: '🌅',
        description: 'Start your day with intention',
        content: `## Morning Check-in

**How am I feeling this morning?**


**My top 3 priorities for today:**
1. 
2. 
3. 

**I'm grateful for:**


**One intention for today:**

`
    },
    {
        id: 'evening',
        name: 'Evening Reflection',
        emoji: '🌙',
        description: 'Reflect on your day',
        content: `## Evening Reflection

**Today's biggest win:**


**What did I learn today?**


**What could I have done better?**


**Three things I'm grateful for:**
1. 
2. 
3. 

**How am I feeling as the day ends?**

`
    },
    {
        id: 'session',
        name: 'Session Debrief',
        emoji: '🎯',
        description: 'Reflect after a focus session',
        content: `## Session Debrief

**What I accomplished:**


**What helped me focus:**


**Distractions I noticed:**


**Next steps:**

`
    },
    {
        id: 'weekly',
        name: 'Weekly Review',
        emoji: '📊',
        description: 'Review your week',
        content: `## Weekly Review

**This week's highlights:**
- 
- 
- 

**Challenges I faced:**


**What I learned:**


**Goals for next week:**
1. 
2. 
3. 

**One thing I'm proud of:**

`
    }
];

export function JournalView() {
    const [currentDate, setCurrentDate] = useState(getLocalDateString());
    const [content, setContent] = useState('');
    const [mood, setMood] = useState<string>();
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [allEntries, setAllEntries] = useState<JournalEntry[]>([]);
    const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [streak, setStreak] = useState(0);
    const [viewMode, setViewMode] = useState<'today' | 'all' | 'analytics'>('today');

    // Phase 3B: Gratitude Mode
    const [gratitudeMode, setGratitudeMode] = useState(false);
    const [gratitudeItems, setGratitudeItems] = useState<[string, string, string]>(['', '', '']);

    // Phase 1: Auto-save states
    const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'idle'>('idle');
    const [wordCount, setWordCount] = useState(0);
    const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSavedContentRef = useRef('');

    // Phase 2B: AI Reflection
    const [showReflection, setShowReflection] = useState(false);
    const [isReflecting, setIsReflecting] = useState(false);
    const [reflection, setReflection] = useState<JournalReflection | null>(null);

    // Phase 3A: Templates (showTemplates removed - unused)
    const [selectedTemplate, setSelectedTemplate] = useState<string>('freewrite');

    // Edit/View mode toggle
    const [isEditMode, setIsEditMode] = useState(true);

    // Separate user content from AI reflections for hybrid display
    const { userContent, aiReflections } = useMemo(() => {
        const parts = content.split(/---\s*##?\s*🪞?\s*AI Reflection/i);
        return {
            userContent: parts[0]?.trim() || '',
            aiReflections: parts.slice(1).map(p => '## 🪞 AI Reflection' + p).join('\n\n---\n\n')
        };
    }, [content]);

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
            const isToday = currentDate === getLocalDateString();
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
            setAutoSaveStatus('idle');
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

    const isToday = currentDate === getLocalDateString();

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
                            <button
                                onClick={() => setViewMode('analytics')}
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'analytics' ? 'bg-purple-500 text-white' : 'text-white/50 hover:text-white/70'
                                    }`}
                            >
                                <BarChart3 size={16} />
                                Analytics
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

                        {/* Template Selector - Always Visible */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white/70">Choose a template</h3>
                            <div className="grid grid-cols-5 gap-3">
                                {JOURNAL_TEMPLATES.map((template) => (
                                    <motion.button
                                        key={template.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setSelectedTemplate(template.id);
                                            if (template.content) {
                                                setContent(template.content);
                                            }
                                        }}
                                        className={`p-4 rounded-2xl text-center transition-all ${selectedTemplate === template.id
                                            ? 'bg-purple-500/20 border-purple-500/50 border-2'
                                            : 'bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] hover:border-white/20'
                                            }`}
                                    >
                                        <div className="text-2xl mb-2">{template.emoji}</div>
                                        <div className="text-sm font-medium text-white/80">{template.name}</div>
                                        <div className="text-xs text-white/40 mt-1">{template.description}</div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* AI Writing Prompts - Always Visible */}
                        {prompts.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-white/60">
                                    <Lightbulb size={18} />
                                    <span className="text-sm font-medium">Writing prompts for you</span>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {prompts.map((prompt) => (
                                        <motion.button
                                            key={prompt.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                setContent(prompt.text + '\n\n');
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
                            </div>
                        )}

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
                                    {autoSaveStatus !== 'idle' && (
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
                                <div className="space-y-6">
                                    {/* Edit/View Toggle */}
                                    <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl w-fit">
                                        <button
                                            onClick={() => setIsEditMode(true)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isEditMode
                                                ? 'bg-purple-500/20 text-purple-300'
                                                : 'text-white/40 hover:text-white/60'
                                                }`}
                                        >
                                            <Edit3 size={14} />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setIsEditMode(false)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${!isEditMode
                                                ? 'bg-cyan-500/20 text-cyan-300'
                                                : 'text-white/40 hover:text-white/60'
                                                }`}
                                        >
                                            <Eye size={14} />
                                            Preview
                                        </button>
                                    </div>

                                    {/* Edit Mode - TipTap Editor */}
                                    {isEditMode ? (
                                        <RichTextEditor
                                            key={currentDate}
                                            content={userContent}
                                            onChange={(newContent) => {
                                                // Preserve AI reflections when editing user content
                                                if (aiReflections) {
                                                    setContent(newContent + '\n\n---\n\n' + aiReflections);
                                                } else {
                                                    setContent(newContent);
                                                }
                                            }}
                                            placeholder="Write freely about your day, thoughts, wins, challenges, or anything else..."
                                            autoSaveStatus={autoSaveStatus}
                                        />
                                    ) : (
                                        /* View Mode - Beautiful Rendered Content */
                                        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6 min-h-[400px]">
                                            <JournalContentRenderer content={content} />
                                        </div>
                                    )}

                                    {/* AI Reflections - Always shown beautifully in edit mode too */}
                                    {isEditMode && aiReflections && (
                                        <div className="mt-6">
                                            <h3 className="text-sm font-medium text-white/40 mb-4 flex items-center gap-2">
                                                <Sparkles size={14} className="text-purple-400" />
                                                AI Reflections
                                            </h3>
                                            <JournalContentRenderer content={aiReflections} />
                                        </div>
                                    )}
                                </div>
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
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
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

                        {/* Session Notes Timeline */}
                        <div className="space-y-4">
                            <SessionNotesTimeline date={currentDate} />
                        </div>

                        {/* Save & Reflect Buttons */}
                        <div className="flex justify-center gap-6 pt-10 pb-4">
                            <button
                                onClick={handleSave}
                                disabled={!content.trim() || isSaving}
                                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-base font-bold disabled:opacity-50 hover:shadow-xl hover:shadow-purple-500/30 transition-all hover:scale-[1.02] flex items-center gap-3"
                            >
                                <Save size={20} />
                                {isSaving ? 'Saving...' : 'Save Entry'}
                            </button>

                            {/* AI Reflection Button - shows when content exists */}
                            {content.trim().length > 50 && (
                                <button
                                    onClick={async () => {
                                        setIsReflecting(true);
                                        setShowReflection(true);
                                        try {
                                            const entry: JournalEntry = {
                                                id: 0,
                                                date: currentDate,
                                                content,
                                                mood: mood as JournalEntry['mood'],
                                                tags,
                                                created_at: Date.now(),
                                                updated_at: Date.now()
                                            };
                                            const result = await journalAIService.getReflection(entry);
                                            setReflection(result);

                                            // Auto-save the reflection to the journal
                                            if (result) {
                                                const timeStr = new Date().toLocaleTimeString('en-US', {
                                                    hour: 'numeric',
                                                    minute: '2-digit'
                                                });

                                                let reflectionContent = `\n\n---\n## 🪞 AI Reflection (${timeStr})\n\n`;
                                                reflectionContent += `**Summary:** ${result.summary}\n\n`;

                                                if (result.emotions) {
                                                    reflectionContent += `**Emotions:** ${result.emotions.primary}`;
                                                    if (result.emotions.secondary) {
                                                        reflectionContent += ` + ${result.emotions.secondary}`;
                                                    }
                                                    reflectionContent += ` (${result.emotions.intensity} intensity)\n\n`;
                                                }

                                                if (result.insights && result.insights.length > 0) {
                                                    reflectionContent += `**Insights:**\n`;
                                                    result.insights.forEach((insight: string) => {
                                                        reflectionContent += `- 💡 ${insight}\n`;
                                                    });
                                                    reflectionContent += '\n';
                                                }

                                                if (result.affirmation) {
                                                    reflectionContent += `**✨ Affirmation:** ${result.affirmation}\n\n`;
                                                }

                                                if (result.suggestions && result.suggestions.length > 0) {
                                                    reflectionContent += `**Gentle Suggestions:**\n`;
                                                    result.suggestions.forEach((suggestion: string) => {
                                                        reflectionContent += `- → ${suggestion}\n`;
                                                    });
                                                }

                                                // Append to content and save
                                                const newContent = content + reflectionContent;
                                                setContent(newContent);
                                                lastSavedContentRef.current = newContent;

                                                // Add reflection tag if not present
                                                const newTags = tags.includes('ai-reflection') ? tags : [...tags, 'ai-reflection'];
                                                setTags(newTags);

                                                await journalService.createOrUpdateEntry(currentDate, newContent, mood, newTags);
                                                setAutoSaveStatus('saved');
                                            }
                                        } catch (error) {
                                            console.error('Reflection failed:', error);
                                        } finally {
                                            setIsReflecting(false);
                                        }
                                    }}
                                    disabled={isReflecting}
                                    className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 text-base font-bold hover:shadow-xl hover:shadow-cyan-500/20 transition-all hover:scale-[1.02] flex items-center gap-3 disabled:opacity-50"
                                >
                                    {isReflecting ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <Sparkles size={20} />
                                    )}
                                    {isReflecting ? 'Reflecting...' : 'Reflect with AI'}
                                </button>
                            )}
                        </div>

                        {/* AI Reflection Modal */}
                        <AnimatePresence>
                            {showReflection && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
                                    onClick={() => setShowReflection(false)}
                                >
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                        className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/10"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center">
                                                    <Sparkles className="text-cyan-400" size={24} />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-white">AI Reflection</h2>
                                                    <p className="text-sm text-white/50">Insights from your entry</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setShowReflection(false)}
                                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="18" y1="6" x2="6" y2="18" />
                                                    <line x1="6" y1="6" x2="18" y2="18" />
                                                </svg>
                                            </button>
                                        </div>

                                        {isReflecting ? (
                                            <div className="flex flex-col items-center justify-center py-16 gap-4">
                                                <Loader2 size={48} className="animate-spin text-cyan-400" />
                                                <p className="text-white/60">Analyzing your entry...</p>
                                            </div>
                                        ) : reflection ? (
                                            <div className="space-y-6">
                                                {/* Summary */}
                                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                                    <h3 className="text-sm font-medium text-white/50 mb-2">Summary</h3>
                                                    <p className="text-white leading-relaxed">{reflection.summary}</p>
                                                </div>

                                                {/* Emotions */}
                                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                                    <h3 className="text-sm font-medium text-white/50 mb-3">Emotions Detected</h3>
                                                    <div className="flex gap-3">
                                                        <span className="px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium">
                                                            {reflection.emotions.primary}
                                                        </span>
                                                        {reflection.emotions.secondary && (
                                                            <span className="px-4 py-2 rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium">
                                                                {reflection.emotions.secondary}
                                                            </span>
                                                        )}
                                                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${reflection.emotions.intensity === 'high' ? 'bg-orange-500/20 text-orange-300' :
                                                            reflection.emotions.intensity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                                                'bg-green-500/20 text-green-300'
                                                            }`}>
                                                            {reflection.emotions.intensity} intensity
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Insights */}
                                                {reflection.insights.length > 0 && (
                                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                                        <h3 className="text-sm font-medium text-white/50 mb-3">Insights</h3>
                                                        <ul className="space-y-2">
                                                            {reflection.insights.map((insight, i) => (
                                                                <li key={i} className="flex gap-3 text-white/80">
                                                                    <span className="text-cyan-400">💡</span>
                                                                    {insight}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Affirmation */}
                                                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                                                    <h3 className="text-sm font-medium text-purple-300 mb-2">✨ Affirmation</h3>
                                                    <p className="text-lg text-white font-medium leading-relaxed">{reflection.affirmation}</p>
                                                </div>

                                                {/* Suggestions */}
                                                {reflection.suggestions.length > 0 && (
                                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                                        <h3 className="text-sm font-medium text-white/50 mb-3">Gentle Suggestions</h3>
                                                        <ul className="space-y-2">
                                                            {reflection.suggestions.map((suggestion, i) => (
                                                                <li key={i} className="flex gap-3 text-white/80">
                                                                    <span className="text-green-400">→</span>
                                                                    {suggestion}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
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

                {/* Analytics View */}
                {viewMode === 'analytics' && (
                    <JournalAnalytics />
                )}
            </div>
        </div>
    );
}
