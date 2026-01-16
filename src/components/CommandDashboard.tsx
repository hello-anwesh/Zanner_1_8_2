import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play as _Play, Pause as _Pause, SkipForward as _SkipForward, Flame, Target, Brain, Sparkles,
    Calendar, PenLine, Music, TrendingUp, Zap,
    ChevronRight, BarChart3, Heart, Moon, Sun, Coffee, ChevronDown
} from 'lucide-react';
import { journalService } from '../services/journal/JournalService';
import { journalPromptService } from '../services/journal/JournalPromptService';

interface TimerPresetBasic {
    id: string;
    name: string;
    icon: string;
    color: string;
    focus: number;
    shortBreak: number;
    longBreak: number;
    description?: string;
}

interface DashboardProps {
    // Timer
    timeLeft: number;
    totalSeconds: number;
    isRunning: boolean;
    mode: 'focus' | 'shortBreak' | 'longBreak';
    sessions: number;
    onToggleTimer: () => void;
    onSkip: () => void;
    onModeChange?: (mode: 'focus' | 'shortBreak' | 'longBreak') => void;
    accent: string;
    // Presets
    activePreset?: TimerPresetBasic;
    allPresets?: TimerPresetBasic[];
    onPresetChange?: (preset: TimerPresetBasic) => void;
    // Navigation
    onNavigate: (view: string) => void;
    // Status
    streakDays?: number;
    aiReady?: boolean;
    musicPlaying?: boolean;
}

// Motivational quotes for different times
const TIME_GREETINGS = {
    morning: { text: "Good morning", icon: Sun, message: "Start your day with intention" },
    afternoon: { text: "Good afternoon", icon: Coffee, message: "Keep the momentum going" },
    evening: { text: "Good evening", icon: Moon, message: "Wind down mindfully" },
    night: { text: "Late night", icon: Sparkles, message: "Rest is productive too" }
};

const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
};

export function CommandDashboard({
    timeLeft,
    totalSeconds,
    isRunning,
    mode,
    sessions,
    onToggleTimer,
    onSkip,
    onModeChange,
    accent,
    activePreset,
    allPresets,
    onPresetChange,
    onNavigate,
    streakDays = 0,
    aiReady = true,
    musicPlaying = false
}: DashboardProps) {
    const [greeting] = useState(TIME_GREETINGS[getTimeOfDay()]);
    const [todayJournalWords, setTodayJournalWords] = useState(0);
    const [dailyPrompt, setDailyPrompt] = useState({ text: '', icon: '💭' });
    const [currentTime, setCurrentTime] = useState(new Date());
    const [animatedProgress, setAnimatedProgress] = useState(0);
    const [showModeSelector, setShowModeSelector] = useState(false);
    const [showPresetPicker, setShowPresetPicker] = useState(false);

    // Update time every second
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Load dashboard data
    useEffect(() => {
        const loadData = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const entry = await journalService.getEntry(today);
                if (entry) {
                    // Filter out template placeholder content (markdown headers and empty placeholders)
                    const cleanContent = entry.content
                        .replace(/^##.*$/gm, '') // Remove markdown headers
                        .replace(/^\*\*.*\*\*$/gm, '') // Remove bold prompts like **How am I feeling?**
                        .replace(/^[0-9]+\.\s*$/gm, '') // Remove numbered list placeholders "1. "
                        .replace(/^-\s*$/gm, '') // Remove empty bullet points
                        .trim();

                    // Only count actual written content
                    const words = cleanContent ? cleanContent.split(/\s+/).filter((w: string) => w.length > 0).length : 0;
                    setTodayJournalWords(words);
                }

                const prompt = journalPromptService.getRandomPrompt();
                setDailyPrompt({ text: prompt.text, icon: prompt.icon });
            } catch (e) {
                console.error('Dashboard data load failed:', e);
            }
        };
        loadData();
    }, []);

    // Animate progress
    useEffect(() => {
        const progress = totalSeconds > 0 ? 1 - timeLeft / totalSeconds : 0;
        setAnimatedProgress(progress);
    }, [timeLeft, totalSeconds]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const modeLabels = {
        focus: 'Focus Session',
        shortBreak: 'Short Break',
        longBreak: 'Long Break'
    };

    const modeColors = {
        focus: accent,
        shortBreak: '#22c55e',
        longBreak: '#3b82f6'
    };

    const GreetingIcon = greeting.icon;

    return (
        <div className="w-full max-w-6xl mx-auto p-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-8"
            >
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
                        <GreetingIcon className="text-purple-400" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">{greeting.text}</h1>
                        <p className="text-white/50">{greeting.message}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-light text-white/80 tabular-nums">
                        {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-sm text-white/40">
                        {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                </div>
            </motion.div>

            {/* Bento Grid */}
            <div className="grid grid-cols-12 gap-4 auto-rows-[100px]">

                {/* ========== TIMER - Main Card (spans 6 cols, 4 rows) ========== */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="col-span-6 row-span-4 relative overflow-hidden rounded-3xl border border-white/10"
                    style={{
                        background: `linear-gradient(135deg, ${modeColors[mode]}10, ${modeColors[mode]}05)`
                    }}
                >
                    {/* Animated background glow */}
                    <div
                        className="absolute inset-0 opacity-30 blur-3xl"
                        style={{
                            background: `radial-gradient(circle at 50% 50%, ${modeColors[mode]}40, transparent 70%)`
                        }}
                    />

                    <div className="relative h-full flex flex-col items-center justify-center p-8">
                        {/* Preset Picker */}
                        {activePreset && allPresets && onPresetChange && (
                            <div className="relative mb-4">
                                <button
                                    onClick={() => setShowPresetPicker(!showPresetPicker)}
                                    className="flex items-center gap-3 px-4 py-2 rounded-2xl transition-all hover:scale-[1.02]"
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${activePreset.color}40`
                                    }}
                                >
                                    <span className="text-xl">{activePreset.icon}</span>
                                    <div className="text-left">
                                        <p className="text-xs font-semibold text-white">{activePreset.name}</p>
                                        <p className="text-[10px] text-white/40">
                                            {activePreset.focus}m focus · {activePreset.shortBreak}m break
                                        </p>
                                    </div>
                                    <ChevronDown
                                        size={14}
                                        className={`text-white/40 transition-transform ml-2 ${showPresetPicker ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {/* Preset Dropdown */}
                                <AnimatePresence>
                                    {showPresetPicker && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-3 rounded-2xl z-50"
                                            style={{
                                                width: 320,
                                                background: 'rgba(15,15,18,0.98)',
                                                backdropFilter: 'blur(40px)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                boxShadow: '0 24px 60px rgba(0,0,0,0.6)'
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-3 px-1">
                                                <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider">Choose Preset</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto">
                                                {allPresets.map(preset => (
                                                    <button
                                                        key={preset.id}
                                                        onClick={() => {
                                                            onPresetChange(preset);
                                                            setShowPresetPicker(false);
                                                        }}
                                                        className="text-left p-3 rounded-xl transition-all hover:scale-[1.02]"
                                                        style={{
                                                            background: activePreset.id === preset.id ? `${preset.color}15` : 'rgba(255,255,255,0.03)',
                                                            border: `1px solid ${activePreset.id === preset.id ? preset.color + '40' : 'rgba(255,255,255,0.06)'}`,
                                                            outline: activePreset.id === preset.id ? `2px solid ${preset.color}` : 'none',
                                                            outlineOffset: '2px'
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-base">{preset.icon}</span>
                                                            <span className="font-semibold text-xs text-white">{preset.name}</span>
                                                        </div>
                                                        <div className="flex gap-1.5">
                                                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/50">{preset.focus}m</span>
                                                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/50">{preset.shortBreak}m</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Mode Selector Dropdown */}
                        <div className="relative mb-6">
                            <button
                                onClick={() => setShowModeSelector(!showModeSelector)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:scale-105"
                                style={{
                                    background: `${modeColors[mode]}20`,
                                    border: `1px solid ${modeColors[mode]}40`
                                }}
                            >
                                <div
                                    className={`w-2 h-2 rounded-full ${isRunning ? 'animate-pulse' : ''}`}
                                    style={{ background: modeColors[mode] }}
                                />
                                <span className="text-sm font-medium" style={{ color: modeColors[mode] }}>
                                    {modeLabels[mode]}
                                </span>
                                <ChevronDown
                                    size={14}
                                    style={{ color: modeColors[mode] }}
                                    className={`transition-transform ${showModeSelector ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* Dropdown */}
                            <AnimatePresence>
                                {showModeSelector && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 rounded-2xl bg-[#1a1a1a] border border-white/10 shadow-2xl z-50 min-w-[180px]"
                                    >
                                        {(['focus', 'shortBreak', 'longBreak'] as const).map((m) => (
                                            <button
                                                key={m}
                                                onClick={() => {
                                                    onModeChange?.(m);
                                                    setShowModeSelector(false);
                                                }}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${mode === m ? 'bg-white/10' : 'hover:bg-white/5'
                                                    }`}
                                            >
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ background: modeColors[m] }}
                                                />
                                                <span className="text-sm font-medium text-white">
                                                    {modeLabels[m]}
                                                </span>
                                                {mode === m && (
                                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                                                )}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Timer Ring */}
                        <div className="relative">
                            <svg width="220" height="220" className="-rotate-90">
                                <circle
                                    cx="110"
                                    cy="110"
                                    r="100"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.05)"
                                    strokeWidth="8"
                                />
                                <motion.circle
                                    cx="110"
                                    cy="110"
                                    r="100"
                                    fill="none"
                                    stroke={modeColors[mode]}
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={628}
                                    initial={{ strokeDashoffset: 628 }}
                                    animate={{ strokeDashoffset: 628 * (1 - animatedProgress) }}
                                    transition={{ duration: 0.5 }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-6xl font-light text-white tabular-nums tracking-tight">
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-4 mt-8">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onToggleTimer}
                                className="unstyled w-16 h-16 rounded-2xl flex items-center justify-center transition-all"
                                style={{
                                    background: modeColors[mode],
                                    boxShadow: `0 8px 32px ${modeColors[mode]}40`,
                                    padding: 0,
                                    minHeight: 'unset',
                                    border: 'none',
                                }}
                            >
                                {isRunning ? (
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="6" y="4" width="4" height="16" />
                                        <rect x="14" y="4" width="4" height="16" />
                                    </svg>
                                ) : (
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4 }}>
                                        <polygon points="5 3 19 12 5 21 5 3" />
                                    </svg>
                                )}
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onSkip}
                                className="unstyled w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                                style={{ padding: 0, minHeight: 'unset' }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="5 4 15 12 5 20 5 4" />
                                    <line x1="19" y1="5" x2="19" y2="19" />
                                </svg>
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* ========== SESSION STATS (spans 3 cols, 2 rows) ========== */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="col-span-3 row-span-2 rounded-3xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 p-6 flex flex-col justify-between"
                >
                    <div className="flex items-center justify-between">
                        <Flame className="text-orange-400" size={24} />
                        <span className="text-xs text-orange-300/60 uppercase tracking-wider font-medium">Today</span>
                    </div>
                    <div>
                        <div className="text-5xl font-bold text-white">{sessions}</div>
                        <div className="text-sm text-white/50">sessions completed</div>
                    </div>
                </motion.div>

                {/* ========== STREAK (spans 3 cols, 2 rows) ========== */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="col-span-3 row-span-2 rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-6 flex flex-col justify-between"
                >
                    <div className="flex items-center justify-between">
                        <Target className="text-purple-400" size={24} />
                        <span className="text-xs text-purple-300/60 uppercase tracking-wider font-medium">Streak</span>
                    </div>
                    <div>
                        <div className="text-5xl font-bold text-white">{streakDays}</div>
                        <div className="text-sm text-white/50">day{streakDays !== 1 ? 's' : ''} in a row</div>
                    </div>
                </motion.div>

                {/* ========== AI STATUS (spans 3 cols, 1 row) ========== */}
                <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onNavigate('zeni')}
                    className="col-span-3 row-span-1 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 p-4 flex items-center gap-4 cursor-pointer"
                >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${aiReady ? 'bg-cyan-500/20' : 'bg-white/5'}`}>
                        <Brain className={aiReady ? 'text-cyan-400' : 'text-white/30'} size={20} />
                    </div>
                    <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-white">AI Coach</div>
                        <div className={`text-xs ${aiReady ? 'text-cyan-400' : 'text-white/40'}`}>
                            {aiReady ? '● Ready' : '○ Configure'}
                        </div>
                    </div>
                    <ChevronRight className="text-white/30" size={16} />
                </motion.button>

                {/* ========== MUSIC STATUS (spans 3 cols, 1 row) ========== */}
                <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onNavigate('settings-spotify')}
                    className="col-span-3 row-span-1 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-4 flex items-center gap-4 cursor-pointer"
                >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${musicPlaying ? 'bg-green-500/20' : 'bg-white/5'}`}>
                        <Music className={musicPlaying ? 'text-green-400' : 'text-white/30'} size={20} />
                    </div>
                    <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-white">Music</div>
                        <div className={`text-xs ${musicPlaying ? 'text-green-400' : 'text-white/40'}`}>
                            {musicPlaying ? '♪ Playing' : '○ Connect'}
                        </div>
                    </div>
                    <ChevronRight className="text-white/30" size={16} />
                </motion.button>

                {/* ========== JOURNAL CARD (spans 4 cols, 2 rows) ========== */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onNavigate('journal')}
                    className="col-span-4 row-span-2 rounded-3xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 p-6 flex flex-col justify-between text-left cursor-pointer overflow-hidden relative group"
                >
                    {/* Background pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                        <PenLine size={128} className="text-pink-400" />
                    </div>

                    <div className="flex items-center gap-3">
                        <Calendar className="text-pink-400" size={24} />
                        <span className="text-sm font-medium text-pink-300/80">Today's Journal</span>
                    </div>

                    <div className="relative z-10">
                        {todayJournalWords > 0 ? (
                            <>
                                <div className="text-4xl font-bold text-white">{todayJournalWords}</div>
                                <div className="text-sm text-white/50">words written</div>
                            </>
                        ) : (
                            <>
                                <div className="text-lg font-medium text-white/70 mb-1">{dailyPrompt.icon} Start writing</div>
                                <div className="text-sm text-white/40 line-clamp-2">{dailyPrompt.text}</div>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-pink-300/60 group-hover:text-pink-300 transition-colors">
                        <span className="text-xs font-medium">Open Journal</span>
                        <ChevronRight size={14} />
                    </div>
                </motion.button>

                {/* ========== ANALYTICS PREVIEW (spans 4 cols, 2 rows) ========== */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onNavigate('stats')}
                    className="col-span-4 row-span-2 rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 p-6 flex flex-col justify-between text-left cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <BarChart3 className="text-blue-400" size={24} />
                        <span className="text-sm font-medium text-blue-300/80">Analytics</span>
                    </div>

                    {/* Mini chart preview */}
                    <div className="flex items-end gap-1 h-16 px-2">
                        {[40, 65, 45, 80, 60, 90, 55].map((height, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{ delay: 0.6 + i * 0.05 }}
                                className="flex-1 rounded-t-sm bg-gradient-to-t from-blue-500 to-blue-400"
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-2 text-blue-300/60 group-hover:text-blue-300 transition-colors">
                        <span className="text-xs font-medium">View Analytics</span>
                        <ChevronRight size={14} />
                    </div>
                </motion.button>

                {/* ========== QUICK ACTIONS - Horizontal Pills ========== */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="col-span-12 row-span-1 flex items-center gap-3"
                >
                    <div className="flex items-center gap-2 text-white/40 mr-2">
                        <Zap className="text-yellow-400" size={16} />
                        <span className="text-xs font-medium uppercase tracking-wider">Quick</span>
                    </div>



                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onNavigate('frequencies')}
                        className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all"
                    >
                        <TrendingUp className="text-cyan-400" size={18} />
                        <span className="text-sm font-medium text-white">Focus Tones</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onNavigate('ai-training')}
                        className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                    >
                        <Brain className="text-blue-400" size={18} />
                        <span className="text-sm font-medium text-white">Train AI</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onNavigate('integrations')}
                        className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 transition-all"
                    >
                        <Heart className="text-pink-400" size={18} />
                        <span className="text-sm font-medium text-white">Integrations</span>
                    </motion.button>
                </motion.div>
            </div>
        </div>
    );
}
