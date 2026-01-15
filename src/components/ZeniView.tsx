/**
 * ZeniView - Full Page AI Coach Interface
 * 
 * A premium, spacious chat interface for Zeni that matches the app's design language.
 * Features:
 * - Multi-conversation support with conversation sidebar
 * - Beautiful message bubbles with markdown support
 * - Typing indicators and smooth animations
 * - Voice input support
 * - Session modes (productivity, venting, strategy)
 */

import { useState, useRef, useEffect, useCallback } from "react";
import {
    Send, Plus, Sparkles, Copy, Check, User,
    Trash2, MessageSquare, Settings2,
    ChevronLeft, Brain, Zap, Heart, Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { coachService, CoachContext } from "../services/ai/CoachService";

// Types
interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: number;
}

interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    createdAt: number;
    mode: 'productivity' | 'venting' | 'strategy';
}

interface ZeniViewProps {
    accent: string;
    onNavigate?: (view: string) => void;
}

// Session modes with their styling
const SESSION_MODES = {
    productivity: {
        icon: Target,
        label: 'Productivity',
        color: '#8B5CF6',
        gradient: 'from-violet-500 to-purple-600'
    },
    venting: {
        icon: Heart,
        label: 'Venting',
        color: '#F43F5E',
        gradient: 'from-rose-500 to-pink-600'
    },
    strategy: {
        icon: Zap,
        label: 'Strategy',
        color: '#06B6D4',
        gradient: 'from-cyan-500 to-blue-600'
    }
};

const STORAGE_KEY = 'zenner_sessions';

// Zeni's local avatar (bundled with app)
const ZENI_AVATAR = `data:image/svg+xml,${encodeURIComponent(`
<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="zeniGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B5CF6"/>
      <stop offset="100%" style="stop-color:#EC4899"/>
    </linearGradient>
  </defs>
  <circle cx="24" cy="24" r="24" fill="url(#zeniGrad)"/>
  <circle cx="24" cy="24" r="20" fill="#1a1a2e" fill-opacity="0.3"/>
  <path d="M24 14 C18 14 14 18 14 24 C14 30 18 34 24 34 C30 34 34 30 34 24" stroke="white" stroke-width="2" stroke-linecap="round"/>
  <circle cx="18" cy="22" r="2" fill="white"/>
  <circle cx="30" cy="22" r="2" fill="white"/>
  <path d="M20 28 Q24 32 28 28" stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none"/>
</svg>
`)}`;

export function ZeniView({ accent, onNavigate }: ZeniViewProps) {
    // Session state
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [showSidebar, setShowSidebar] = useState(true);

    // Message state
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Get current session
    const currentSession = sessions.find(s => s.id === currentSessionId);
    const messages = currentSession?.messages || [];

    // Track if initial load has happened
    const [isInitialized, setIsInitialized] = useState(false);

    // Load sessions on mount - ONLY runs once
    useEffect(() => {
        const savedSessions = localStorage.getItem(STORAGE_KEY);
        if (savedSessions) {
            try {
                const parsed = JSON.parse(savedSessions);
                if (parsed.length > 0) {
                    setSessions(parsed);
                    // Open the most recent session (first in array)
                    setCurrentSessionId(parsed[0].id);
                    setIsInitialized(true);
                    return;
                }
            } catch (e) {
                console.error('[ZeniView] Failed to load sessions:', e);
            }
        }

        // Only create new session if no sessions exist
        const newSession: ChatSession = {
            id: `session_${Date.now()}`,
            title: 'New Chat',
            messages: [],
            createdAt: Date.now(),
            mode: 'productivity'
        };
        setSessions([newSession]);
        setCurrentSessionId(newSession.id);
        setIsInitialized(true);
    }, []);

    // Save sessions to localStorage (but only after initial load)
    useEffect(() => {
        if (isInitialized && sessions.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
        }
    }, [sessions, isInitialized]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input on session change
    useEffect(() => {
        inputRef.current?.focus();
    }, [currentSessionId]);

    // Create new session (for "New Chat" button)
    const createNewSession = useCallback((mode: 'productivity' | 'venting' | 'strategy' = 'productivity') => {
        const newSession: ChatSession = {
            id: `session_${Date.now()}`,
            title: 'New Chat',
            messages: [],
            createdAt: Date.now(),
            mode
        };
        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
    }, []);

    // Handle sending message
    const handleSend = async () => {
        if (!input.trim() || isLoading || !currentSessionId) return;

        const userMessage: Message = {
            id: `msg_${Date.now()}`,
            role: 'user',
            content: input.trim(),
            timestamp: Date.now()
        };

        // Add user message
        setSessions(prev => prev.map(s =>
            s.id === currentSessionId
                ? { ...s, messages: [...s.messages, userMessage] }
                : s
        ));
        setInput("");
        setIsLoading(true);

        try {
            // Build context for coach
            const hour = new Date().getHours();
            let timeOfDay = 'morning';
            if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
            else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
            else if (hour >= 21 || hour < 6) timeOfDay = 'night';

            const context: CoachContext = {
                sessionsToday: 0,
                currentSession: 0,
                isRunning: false,
                timeLeft: '0:00',
                timeOfDay
            };

            // Get AI response
            const response = await coachService.chat(userMessage.content, context);

            const assistantMessage: Message = {
                id: `msg_${Date.now()}`,
                role: 'assistant',
                content: response?.message || "I'm having trouble responding right now. Please try again.",
                timestamp: Date.now()
            };

            // Add assistant message and update title if first message
            setSessions(prev => prev.map(s => {
                if (s.id === currentSessionId) {
                    const updatedSession = {
                        ...s,
                        messages: [...s.messages, assistantMessage]
                    };
                    // Auto-generate title from first message
                    if (s.messages.length === 1) {
                        updatedSession.title = userMessage.content.slice(0, 40) + (userMessage.content.length > 40 ? '...' : '');
                    }
                    return updatedSession;
                }
                return s;
            }));
        } catch (error) {
            console.error('[ZeniView] Chat error:', error);
            const errorMessage: Message = {
                id: `msg_${Date.now()}`,
                role: 'assistant',
                content: "Sorry, I encountered an error. Please check your AI settings and try again.",
                timestamp: Date.now()
            };
            setSessions(prev => prev.map(s =>
                s.id === currentSessionId
                    ? { ...s, messages: [...s.messages, errorMessage] }
                    : s
            ));
        } finally {
            setIsLoading(false);
        }
    };

    // Delete session
    const handleDeleteSession = (sessionId: string) => {
        setSessions(prev => {
            const filtered = prev.filter(s => s.id !== sessionId);
            if (currentSessionId === sessionId) {
                setCurrentSessionId(filtered[0]?.id || null);
            }
            return filtered;
        });
    };

    // Copy message
    const handleCopy = (content: string, id: string) => {
        navigator.clipboard.writeText(content);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Handle key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Format timestamp
    const formatTime = (ts: number) => {
        return new Date(ts).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // Format date for session groups
    const formatDate = (ts: number) => {
        const date = new Date(ts);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Group sessions by date
    const groupedSessions = sessions.reduce((acc, session) => {
        const dateKey = formatDate(session.createdAt);
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(session);
        return acc;
    }, {} as Record<string, ChatSession[]>);

    return (
        <div className="min-h-screen flex" style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0a0a1a 100%)' }}>

            {/* Conversation Sidebar */}
            <AnimatePresence>
                {showSidebar && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 320, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="h-screen flex flex-col border-r border-white/[0.06] bg-black/20"
                    >
                        {/* Sidebar Header */}
                        <div className="p-6 border-b border-white/[0.06]">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                        style={{ background: `linear-gradient(135deg, ${accent}40, ${accent}20)` }}
                                    >
                                        <Brain size={24} style={{ color: accent }} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Zeni</h2>
                                        <p className="text-xs text-white/40">Your AI Coach</p>
                                    </div>
                                </div>
                            </div>

                            {/* New Chat Button */}
                            <button
                                onClick={() => createNewSession()}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all hover:scale-[1.02]"
                                style={{
                                    background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                                    boxShadow: `0 4px 20px ${accent}40`
                                }}
                            >
                                <Plus size={18} />
                                New Chat
                            </button>
                        </div>

                        {/* Session List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {Object.entries(groupedSessions).map(([date, dateSessions]) => (
                                <div key={date}>
                                    <p className="text-xs font-medium text-white/30 uppercase tracking-wider mb-2 px-2">
                                        {date}
                                    </p>
                                    <div className="space-y-2">
                                        {dateSessions.map(session => (
                                            <motion.button
                                                key={session.id}
                                                onClick={() => setCurrentSessionId(session.id)}
                                                whileHover={{ scale: 1.02, x: 4 }}
                                                whileTap={{ scale: 0.98 }}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className={`w-full p-4 rounded-2xl text-left transition-all group relative overflow-hidden ${currentSessionId === session.id
                                                        ? ''
                                                        : 'hover:bg-white/[0.06]'
                                                    }`}
                                                style={currentSessionId === session.id ? {
                                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                                                    border: '1px solid rgba(255,255,255,0.15)',
                                                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                                                } : {
                                                    border: '1px solid transparent'
                                                }}
                                            >
                                                {/* Active shimmer effect */}
                                                {currentSessionId === session.id && (
                                                    <motion.div
                                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                                                        animate={{ x: ['-100%', '200%'] }}
                                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                                    />
                                                )}

                                                <div className="flex items-start gap-3 relative z-10">
                                                    <motion.div
                                                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                                        whileHover={{ rotate: 5 }}
                                                        style={{
                                                            background: currentSessionId === session.id
                                                                ? `linear-gradient(135deg, ${SESSION_MODES[session.mode].color}40, ${SESSION_MODES[session.mode].color}20)`
                                                                : `${SESSION_MODES[session.mode].color}15`,
                                                            border: currentSessionId === session.id
                                                                ? `1px solid ${SESSION_MODES[session.mode].color}40`
                                                                : 'none'
                                                        }}
                                                    >
                                                        <MessageSquare
                                                            size={15}
                                                            style={{ color: SESSION_MODES[session.mode].color }}
                                                        />
                                                    </motion.div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className={`text-sm font-semibold truncate ${currentSessionId === session.id ? 'text-white' : 'text-white/80'
                                                                }`}>
                                                                {session.title}
                                                            </p>

                                                            {/* Active indicator */}
                                                            {currentSessionId === session.id && (
                                                                <motion.div
                                                                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    style={{ background: 'rgba(34, 197, 94, 0.15)' }}
                                                                >
                                                                    <motion.div
                                                                        className="w-1.5 h-1.5 rounded-full bg-green-400"
                                                                        animate={{
                                                                            scale: [1, 1.3, 1],
                                                                            opacity: [1, 0.7, 1]
                                                                        }}
                                                                        transition={{
                                                                            duration: 1.5,
                                                                            repeat: Infinity,
                                                                            ease: 'easeInOut'
                                                                        }}
                                                                        style={{ boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)' }}
                                                                    />
                                                                    <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">
                                                                        Active
                                                                    </span>
                                                                </motion.div>
                                                            )}
                                                        </div>

                                                        <p className={`text-xs mt-1 ${currentSessionId === session.id ? 'text-white/50' : 'text-white/40'
                                                            }`}>
                                                            {session.messages.length} {session.messages.length === 1 ? 'message' : 'messages'}
                                                        </p>
                                                    </div>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteSession(session.id);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Sidebar Footer */}
                        <div className="p-4 border-t border-white/[0.06]">
                            <button
                                onClick={() => onNavigate?.('settings-ai')}
                                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all"
                            >
                                <Settings2 size={16} />
                                AI Settings
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-screen">

                {/* Chat Header */}
                <header className="flex items-center justify-between px-8 py-5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowSidebar(!showSidebar)}
                            className="p-2 rounded-lg hover:bg-white/[0.06] transition-all"
                        >
                            <ChevronLeft size={20} className={`text-white/60 transition-transform ${showSidebar ? '' : 'rotate-180'}`} />
                        </button>

                        {currentSession && (
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: `${SESSION_MODES[currentSession.mode].color}20` }}
                                >
                                    {(() => {
                                        const ModeIcon = SESSION_MODES[currentSession.mode].icon;
                                        return <ModeIcon size={20} style={{ color: SESSION_MODES[currentSession.mode].color }} />;
                                    })()}
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-white">{currentSession.title}</h1>
                                    <p className="text-xs text-white/40">
                                        {SESSION_MODES[currentSession.mode].label} Mode
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mode Selector */}
                    <div className="flex items-center gap-2 p-1 bg-white/[0.04] rounded-xl">
                        {Object.entries(SESSION_MODES).map(([mode, config]) => (
                            <button
                                key={mode}
                                onClick={() => {
                                    if (currentSessionId) {
                                        setSessions(prev => prev.map(s =>
                                            s.id === currentSessionId
                                                ? { ...s, mode: mode as any }
                                                : s
                                        ));
                                    }
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentSession?.mode === mode
                                    ? 'text-white'
                                    : 'text-white/40 hover:text-white/60'
                                    }`}
                                style={currentSession?.mode === mode ? {
                                    background: `${config.color}30`,
                                    color: config.color
                                } : {}}
                            >
                                <config.icon size={16} />
                                {config.label}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-8">

                        {/* Empty State */}
                        {messages.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center py-20"
                            >
                                <div
                                    className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
                                    style={{
                                        background: `linear-gradient(135deg, ${accent}30, ${accent}10)`,
                                        border: `1px solid ${accent}30`
                                    }}
                                >
                                    <Sparkles size={40} style={{ color: accent }} />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Hey, I'm Zeni! 👋
                                </h2>
                                <p className="text-white/50 text-center max-w-md mb-8">
                                    Your personal AI coach here to help you stay focused,
                                    work through challenges, and celebrate your wins.
                                </p>

                                {/* Quick Prompts */}
                                <div className="grid grid-cols-2 gap-3 max-w-lg">
                                    {[
                                        "Help me plan my day",
                                        "I'm feeling stuck",
                                        "Celebrate a win with me",
                                        "Give me motivation"
                                    ].map((prompt) => (
                                        <button
                                            key={prompt}
                                            onClick={() => {
                                                setInput(prompt);
                                                inputRef.current?.focus();
                                            }}
                                            className="p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.12] text-left text-sm text-white/70 hover:text-white/90 transition-all"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Messages */}
                        {messages.map((message, index) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className={`flex gap-5 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                {/* Avatar */}
                                <div
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${message.role === 'user' ? '' : ''
                                        }`}
                                    style={message.role === 'assistant' ? {
                                        background: `linear-gradient(135deg, ${accent}50, ${accent}25)`,
                                        border: `1px solid ${accent}40`,
                                        boxShadow: `0 4px 16px ${accent}20`
                                    } : {
                                        background: 'rgba(255,255,255,0.08)',
                                        border: '1px solid rgba(255,255,255,0.12)'
                                    }}
                                >
                                    {message.role === 'user' ? (
                                        <User size={20} className="text-white/80" />
                                    ) : (
                                        <img src={ZENI_AVATAR} alt="Zeni" className="w-full h-full rounded-2xl" />
                                    )}
                                </div>

                                {/* Message Bubble */}
                                <div className={`flex-1 max-w-[75%] ${message.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                                    <div
                                        className="rounded-3xl"
                                        style={message.role === 'user' ? {
                                            background: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
                                            padding: '20px 24px',
                                            boxShadow: `0 8px 32px ${accent}30`
                                        } : {
                                            // Glassmorphic assistant bubble
                                            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
                                            backdropFilter: 'blur(20px)',
                                            border: '1px solid rgba(255,255,255,0.12)',
                                            padding: '24px 28px',
                                            boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05) inset'
                                        }}
                                    >
                                        {message.role === 'assistant' ? (
                                            <div className="prose prose-invert prose-base max-w-none">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    rehypePlugins={[rehypeHighlight]}
                                                    components={{
                                                        p: ({ children }) => (
                                                            <p className="text-white/90 leading-[1.8] mb-4 last:mb-0 text-[15px]">
                                                                {children}
                                                            </p>
                                                        ),
                                                        ul: ({ children }) => (
                                                            <ul className="list-none text-white/90 mb-4 space-y-2 pl-0">
                                                                {children}
                                                            </ul>
                                                        ),
                                                        ol: ({ children }) => (
                                                            <ol className="list-none text-white/90 mb-4 space-y-2 pl-0 counter-reset-item">
                                                                {children}
                                                            </ol>
                                                        ),
                                                        li: ({ children }) => (
                                                            <li className="text-white/90 flex items-start gap-3 text-[15px]">
                                                                <span className="text-purple-400 mt-0.5">•</span>
                                                                <span className="flex-1">{children}</span>
                                                            </li>
                                                        ),
                                                        strong: ({ children }) => (
                                                            <strong className="text-white font-bold">
                                                                {children}
                                                            </strong>
                                                        ),
                                                        em: ({ children }) => (
                                                            <em className="text-white/95 italic">
                                                                {children}
                                                            </em>
                                                        ),
                                                        code: ({ className, children }) => {
                                                            const isBlock = className?.includes('language-');
                                                            return isBlock ? (
                                                                <pre className="bg-black/50 rounded-xl p-4 overflow-x-auto my-4 border border-white/10">
                                                                    <code className={`${className} text-sm`}>{children}</code>
                                                                </pre>
                                                            ) : (
                                                                <code
                                                                    className="px-2 py-1 rounded-lg text-sm font-mono text-purple-300"
                                                                    style={{ background: 'rgba(139, 92, 246, 0.2)' }}
                                                                >
                                                                    {children}
                                                                </code>
                                                            );
                                                        },
                                                        h1: ({ children }) => (
                                                            <h1 className="text-xl font-bold text-white mb-4 mt-2">{children}</h1>
                                                        ),
                                                        h2: ({ children }) => (
                                                            <h2 className="text-lg font-bold text-white mb-3 mt-4">{children}</h2>
                                                        ),
                                                        h3: ({ children }) => (
                                                            <h3 className="text-base font-bold text-white mb-2 mt-3">{children}</h3>
                                                        ),
                                                        blockquote: ({ children }) => (
                                                            <blockquote
                                                                className="border-l-3 pl-4 my-4 text-white/80 italic"
                                                                style={{ borderColor: accent }}
                                                            >
                                                                {children}
                                                            </blockquote>
                                                        )
                                                    }}
                                                >
                                                    {message.content}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p className="text-white leading-[1.7] text-[15px]">{message.content}</p>
                                        )}
                                    </div>

                                    {/* Message Meta */}
                                    <div className={`flex items-center gap-3 mt-3 px-2 ${message.role === 'user' ? 'justify-end' : ''}`}>
                                        <span className="text-xs text-white/40 font-medium">
                                            {formatTime(message.timestamp)}
                                        </span>
                                        {message.role === 'assistant' && (
                                            <button
                                                onClick={() => handleCopy(message.content, message.id)}
                                                className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 transition-all"
                                            >
                                                {copiedId === message.id ? (
                                                    <Check size={14} className="text-green-400" />
                                                ) : (
                                                    <Copy size={14} />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Loading Indicator */}
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex gap-4"
                            >
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: `linear-gradient(135deg, ${accent}40, ${accent}20)` }}
                                >
                                    <img src={ZENI_AVATAR} alt="Zeni" className="w-full h-full rounded-xl" />
                                </div>
                                <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                                    <div className="flex gap-1.5">
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                            className="w-2 h-2 rounded-full"
                                            style={{ background: accent }}
                                        />
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                            className="w-2 h-2 rounded-full"
                                            style={{ background: accent }}
                                        />
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                            className="w-2 h-2 rounded-full"
                                            style={{ background: accent }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="px-10 py-8 border-t border-white/[0.06]">
                    <div className="max-w-4xl mx-auto">
                        <div
                            className="flex items-end gap-4 p-5 rounded-3xl transition-all"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.05) inset'
                            }}
                        >
                            {/* Text Input */}
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Message Zeni..."
                                rows={1}
                                className="flex-1 bg-transparent text-white text-[15px] placeholder-white/40 focus:outline-none resize-none max-h-40 leading-relaxed"
                                style={{ minHeight: '32px' }}
                            />

                            {/* Send Button */}
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="p-3.5 rounded-2xl font-semibold transition-all disabled:opacity-30 hover:scale-105"
                                style={{
                                    background: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
                                    boxShadow: input.trim() && !isLoading ? `0 8px 24px ${accent}40` : 'none'
                                }}
                            >
                                <Send size={20} />
                            </button>
                        </div>

                        <p className="text-center text-xs text-white/25 mt-4 font-medium">
                            Zeni uses AI to provide personalized coaching. Responses may vary.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ZeniView;
