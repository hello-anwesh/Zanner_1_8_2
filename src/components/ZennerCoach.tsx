import { useState, useRef, useEffect } from "react";
import { Send, Plus, Sparkles, RotateCcw, Copy, Check, X, Bot, User, Mic, Clock, Trash2, MessageSquare, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { coachService } from "../services/ai/CoachService";

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

interface ZennerCoachProps {
    accent: string;
    onClose?: () => void;
}

export function ZennerCoach({ accent, onClose }: ZennerCoachProps) {
    // Session State
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    // UI State
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Initial Load
    useEffect(() => {
        const savedSessions = localStorage.getItem('zenner_sessions');
        let initialSessions: ChatSession[] = [];

        if (savedSessions) {
            try {
                initialSessions = JSON.parse(savedSessions);
            } catch (e) {
                console.error('Failed to parse sessions');
            }
        }

        // AGGRESSIVE Migration: Check for legacy chat history if not already present
        const legacyChat = localStorage.getItem('zenner_chat_history');
        if (legacyChat) {
            // Check if we already imported it (avoid duplicates)
            const alreadyImported = initialSessions.some(s => s.title === 'Restored Chat');
            if (!alreadyImported) {
                try {
                    const legacyMessages: Message[] = JSON.parse(legacyChat);
                    if (legacyMessages.length > 0) {
                        const legacySession: ChatSession = {
                            id: 'legacy_restored_' + Date.now(),
                            title: 'Restored Chat',
                            messages: legacyMessages,
                            createdAt: Date.now(),
                            mode: 'productivity'
                        };
                        // Add to FRONT of list
                        initialSessions.unshift(legacySession);
                    }
                } catch (e) {
                    console.error('Failed to migrate legacy chat');
                }
            }
        }

        if (initialSessions.length > 0) {
            setSessions(initialSessions);
            // If we just restored, switch to it
            const mostRecent = initialSessions[0];
            setCurrentSessionId(mostRecent.id);
            setMessages(mostRecent.messages);
            setActiveMode(mostRecent.mode || 'productivity');
        } else {
            // Start fresh if truly nothing exists
            const newId = Date.now().toString();
            const newSession: ChatSession = { id: newId, title: 'New Chat', messages: [], createdAt: Date.now(), mode: 'productivity' };
            setSessions([newSession]);
            setCurrentSessionId(newId);
        }
    }, []);

    // Save Sessions
    useEffect(() => {
        if (sessions.length > 0) {
            localStorage.setItem('zenner_sessions', JSON.stringify(sessions));
        }
    }, [sessions]);

    // Auto-update current session content
    useEffect(() => {
        if (!currentSessionId) return;

        setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
                // Only update if content changed to avoid infinite loops if refs not unstable
                if (s.messages === messages) return s;

                return {
                    ...s,
                    messages: messages,
                    title: messages.length > 0 && (s.title === 'New Chat' || !s.title)
                        ? (messages[0].content.slice(0, 30) + (messages[0].content.length > 30 ? '...' : ''))
                        : s.title
                };
            }
            return s;
        }));
    }, [messages, currentSessionId]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsgText = input.trim();
        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: userMsgText,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");

        // Reset height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        setIsTyping(true);

        try {
            // Context placeholder - in real app connect to timer/state
            const context = {
                sessionsToday: 0,
                currentSession: 1,
                isRunning: false,
                timeLeft: "25:00",
                timeOfDay: "Day"
            };

            const responseObj = await coachService.chat(userMsgText, context);

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: responseObj.message,
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);

            // Show the ACTUAL error to the user
            const errorMessage = error instanceof Error ? error.message : String(error);

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: `❌ ERROR:\n\n${errorMessage}`,
                timestamp: Date.now()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const startNewSession = () => {
        const newId = Date.now().toString();
        const newSession: ChatSession = {
            id: newId,
            title: 'New Chat',
            messages: [],
            createdAt: Date.now(),
            mode: activeMode
        };

        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newId);
        setMessages([]);
        setShowMenu(false);
    };

    const handleSwitchSession = (sessionId: string) => {
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
            setCurrentSessionId(session.id);
            setMessages(session.messages);
            setActiveMode(session.mode);
            setShowMenu(false);
        }
    };

    const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation();
        if (confirm('Delete this chat history?')) {
            const newSessions = sessions.filter(s => s.id !== sessionId);
            setSessions(newSessions);

            if (currentSessionId === sessionId) {
                if (newSessions.length > 0) {
                    handleSwitchSession(newSessions[0].id);
                } else {
                    startNewSession();
                }
            }
            if (newSessions.length === 0) {
                localStorage.removeItem('zenner_sessions');
            }
        }
    };

    const handleExportSession = (e: React.MouseEvent, session: ChatSession) => {
        e.stopPropagation();
        const text = session.messages.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join('\n\n');
        navigator.clipboard.writeText(text);
        alert('Chat copied to clipboard!');
    };

    const handleCopy = (content: string, id: string) => {
        navigator.clipboard.writeText(content);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleRegenerate = async () => {
        if (messages.length < 2) return;

        const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
        if (!lastUserMessage) return;

        // Remove last AI response
        setMessages(prev => prev.filter(m => m.role !== 'assistant' || m !== prev[prev.length - 1]));
        setIsTyping(true);

        try {
            const context = {
                sessionsToday: 0,
                currentSession: 1,
                isRunning: false,
                timeLeft: "25:00",
                timeOfDay: "Day"
            };

            const responseObj = await coachService.chat(lastUserMessage.content, context);

            const assistantMessage: Message = {
                id: Date.now().toString(),
                role: "assistant",
                content: responseObj.message,
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Regenerate error:', error);
        } finally {
            setIsTyping(false);
        }
    };

    const [showMenu, setShowMenu] = useState(false);
    const [activeMode, setActiveMode] = useState<'productivity' | 'venting' | 'strategy'>('productivity');

    return (
        <div className="fixed right-6 top-24 bottom-6 w-[500px] z-[60] flex flex-col bg-[#050505] shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)] border border-white/10 rounded-2xl overflow-hidden font-sans">

            {/* --- Professional Header --- */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl z-20 relative">
                <div className="flex items-center gap-3">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shadow-[0_0_15px_-3px_var(--accent)]"
                        style={{
                            background: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
                            '--accent': accent
                        } as any}
                    >
                        <Bot size={20} className="text-white" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-[17px] font-semibold text-white tracking-tight">Zenner AI</h1>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs text-white/40 font-medium capitalize">{activeMode} Mode</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className={`p-2.5 rounded-xl hover:bg-white/5 transition-all duration-200 ${showMenu ? 'text-white bg-white/10' : 'text-white/40 hover:text-white'}`}
                        title="Options"
                    >
                        <div className="flex flex-col gap-1.5">
                            <span className={`w-5 h-0.5 bg-current transition-all ${showMenu ? 'rotate-45 translate-y-2' : ''}`}></span>
                            <span className={`w-5 h-0.5 bg-current transition-all ${showMenu ? 'opacity-0' : ''}`}></span>
                            <span className={`w-5 h-0.5 bg-current transition-all ${showMenu ? '-rotate-45 -translate-y-2' : ''}`}></span>
                        </div>
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2.5 rounded-xl hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all duration-200"
                        >
                            <X size={18} strokeWidth={2} />
                        </button>
                    )}
                </div>
            </div>

            {/* --- Options Menu (Slide Down) --- */}
            <AnimatePresence>
                {showMenu && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-[#0a0a0a] border-b border-white/5 z-10 overflow-hidden"
                    >
                        <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar">
                            {/* Modes */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles size={12} />
                                    Mode
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'productivity', label: 'Focus', icon: Check },
                                        { id: 'venting', label: 'Vent', icon: Mic },
                                        { id: 'strategy', label: 'Plan', icon: Bot }
                                    ].map((mode) => (
                                        <button
                                            key={mode.id}
                                            onClick={() => {
                                                setActiveMode(mode.id as any);
                                                setShowMenu(false);
                                            }}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${activeMode === mode.id
                                                ? 'bg-white/10 border-white/20 text-white'
                                                : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            <mode.icon size={18} />
                                            <span className="text-[11px] font-medium">{mode.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                <button
                                    onClick={startNewSession}
                                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all text-sm font-medium group"
                                >
                                    <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                                    Start New Chat
                                </button>
                            </div>

                            {/* History List */}
                            <div className="space-y-3 pt-2 border-t border-white/5">
                                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
                                    <Clock size={12} />
                                    History
                                </h3>
                                <div className="space-y-1">
                                    {sessions.length === 0 ? (
                                        <p className="text-sm text-white/20 italic p-2">No history yet.</p>
                                    ) : (
                                        sessions.map(session => (
                                            <div
                                                key={session.id}
                                                onClick={() => handleSwitchSession(session.id)}
                                                className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${currentSessionId === session.id
                                                    ? 'bg-white/10 text-white'
                                                    : 'hover:bg-white/5 text-white/50 hover:text-white'
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-md ${currentSessionId === session.id ? 'bg-white/10' : 'bg-white/5'}`}>
                                                    <MessageSquare size={14} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{session.title || 'Untitled Chat'}</p>
                                                    <p className="text-[10px] opacity-50 flex items-center gap-1.5">
                                                        <span>{new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                        <span>•</span>
                                                        <span className="capitalize">{session.mode}</span>
                                                    </p>
                                                </div>
                                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                                    <button
                                                        onClick={(e) => handleExportSession(e, session)}
                                                        className="p-1.5 hover:bg-white/10 rounded-md text-white/40 hover:text-white"
                                                        title="Copy Chat"
                                                    >
                                                        <FileText size={12} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteSession(e, session.id)}
                                                        className="p-1.5 hover:bg-red-500/10 rounded-md text-white/40 hover:text-red-400"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Chat Area --- */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-[#050505]">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center px-10 text-center animate-in fade-in zoom-in duration-300">
                        <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_-5px_var(--accent)]"
                            style={{
                                background: `linear-gradient(135deg, ${accent}20, ${accent}10)`,
                                border: `1px solid ${accent}30`,
                                '--accent': accent
                            } as any}
                        >
                            <Bot size={32} style={{ color: accent }} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
                            Zenner AI
                        </h2>
                        <p className="text-white/40 max-w-[280px] leading-relaxed text-[15px]">
                            {activeMode === 'productivity' && "Let's crush some tasks. What's the goal?"}
                            {activeMode === 'venting' && "I'm listening. Tell me what's on your mind."}
                            {activeMode === 'strategy' && "Let's build a plan. What are we optimizing?"}
                        </p>
                    </div>
                ) : (
                    <div className="px-5 py-8 space-y-8">
                        <AnimatePresence mode="popLayout">
                            {messages.map((message, index) => {
                                const isUser = message.role === 'user';

                                return (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                                        className={`flex gap-6 ${isUser ? 'flex-row-reverse' : 'flex-row'} group mb-4`}
                                    >
                                        {/* Avatar - Large & Floating */}
                                        <div className="flex-shrink-0 -mt-2">
                                            {isUser ? (
                                                <div
                                                    className="w-11 h-11 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)] border-2 border-white/5"
                                                    style={{ background: `${accent}40` }}
                                                >
                                                    <User size={20} className="text-white opacity-80" />
                                                </div>
                                            ) : (
                                                <div
                                                    className="w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_20px_-5px_var(--accent)] border-2 border-white/10"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #1a1a1a, #0a0a0a)',
                                                        borderColor: `${accent}40`,
                                                        '--accent': accent
                                                    } as any}
                                                >
                                                    <img
                                                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Zeni&backgroundColor=transparent"
                                                        alt="AI"
                                                        className="w-8 h-8 opacity-90"
                                                        // Fallback to Z logo if image fails or user prefers logo
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.parentElement!.innerHTML = `<span class="font-bold text-white text-lg">Z</span>`
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Message Bubble + Meta */}
                                        <div className={`flex flex-col max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
                                            {/* Name Label */}
                                            <span className={`text-[12px] font-medium text-white/40 mb-2 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                                                {isUser ? 'You' : 'Zenner'}
                                            </span>

                                            {/* The Bubble */}
                                            <div
                                                className={`relative px-10 py-8 text-[15px] leading-[1.8] text-white shadow-2xl ${isUser
                                                    ? 'rounded-[30px] rounded-tr-[4px]'
                                                    : 'rounded-[30px] rounded-tl-[4px]'
                                                    }`}
                                                style={{
                                                    background: isUser
                                                        ? `linear-gradient(135deg, ${accent}dd, ${accent}80)`
                                                        : '#111111',
                                                    border: isUser
                                                        ? `1px solid ${accent}60`
                                                        : '1px solid rgba(255,255,255,0.08)',
                                                    boxShadow: isUser
                                                        ? `0 0 30px -5px ${accent}50, 0 10px 20px -5px rgba(0,0,0,0.5)` // Strong glow
                                                        : '0 4px 20px rgba(0,0,0,0.4)',
                                                    textAlign: 'left',
                                                    wordBreak: 'break-word'
                                                }}
                                            >
                                                <ReactMarkdown
                                                    className="markdown-content whitespace-normal break-words w-full min-w-0 font-normal opacity-95"
                                                    remarkPlugins={[remarkGfm]}
                                                    rehypePlugins={[rehypeHighlight]}
                                                    components={{
                                                        code: ({ node, inline, className, children, ...props }: any) => {
                                                            return inline ? (
                                                                <code className="px-1.5 py-0.5 rounded bg-white/10 text-sm font-mono" {...props}>
                                                                    {children}
                                                                </code>
                                                            ) : (
                                                                <code className={`block p-4 rounded-lg bg-black/40 text-sm font-mono overflow-x-auto ${className}`} {...props}>
                                                                    {children}
                                                                </code>
                                                            );
                                                        },
                                                        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                                                        ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                                                        ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                                                        li: ({ children }) => <li className="ml-2">{children}</li>,
                                                        h1: ({ children }) => <h1 className="text-2xl font-bold mb-3 mt-4 first:mt-0">{children}</h1>,
                                                        h2: ({ children }) => <h2 className="text-xl font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
                                                        h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-2 first:mt-0">{children}</h3>,
                                                        a: ({ children, href }) => (
                                                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                                                                {children}
                                                            </a>
                                                        ),
                                                        blockquote: ({ children }) => (
                                                            <blockquote className="border-l-4 border-white/20 pl-4 italic my-3 text-white/70">
                                                                {children}
                                                            </blockquote>
                                                        ),
                                                        strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                                                        em: ({ children }) => <em className="italic">{children}</em>,
                                                    }}
                                                >
                                                    {message.content}
                                                </ReactMarkdown>
                                            </div>

                                            {/* Actions Bar - visible on hover */}
                                            {message.role === 'assistant' && (
                                                <div className="flex items-center gap-1 mt-2 px-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                    <button
                                                        onClick={() => handleCopy(message.content, message.id)}
                                                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                                        title="Copy text"
                                                    >
                                                        {copiedId === message.id ? (
                                                            <Check size={14} className="text-emerald-400" />
                                                        ) : (
                                                            <Copy size={14} />
                                                        )}
                                                    </button>
                                                    {index === messages.length - 1 && !isTyping && (
                                                        <button
                                                            onClick={handleRegenerate}
                                                            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                                            title="Regenerate response"
                                                        >
                                                            <RotateCcw size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {/* Typing Indicator */}
                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-4"
                            >
                                <div
                                    className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-white/5"
                                    style={{
                                        background: 'linear-gradient(135deg, #1a1a1a, #0a0a0a)',
                                        borderColor: `${accent}40`
                                    }}
                                >
                                    <span className="font-bold text-white text-lg">Z</span>
                                </div>
                                <div>
                                    <span className="text-[12px] font-medium text-white/30 mb-2 block text-left">
                                        Zenner
                                    </span>
                                    <div className="px-6 py-5 rounded-[30px] rounded-tl-[4px] bg-[#111111] border border-white/[0.08] flex items-center gap-1.5 shadow-lg">
                                        <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} className="h-12" />
                    </div>
                )}
            </div>

            {/* --- Professional Input Area --- */}
            <div className="p-6 pt-2 bg-[#050505]">
                <div
                    className="relative flex items-end gap-2 p-2 pl-4 rounded-[24px] border border-white/10 transition-all duration-200 focus-within:border-white/20 focus-within:shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)]"
                    style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)' }}
                >
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Message Zenner..."
                        disabled={isTyping}
                        className="flex-1 bg-transparent border-none outline-none text-[15px] text-white placeholder:text-white/30 resize-none py-3 max-h-[150px] min-h-[24px] leading-relaxed custom-scrollbar"
                        rows={1}
                        style={{ height: 'auto', minHeight: '44px' }}
                    />

                    <div className="flex items-center gap-1 pb-1">
                        {!input.trim() && (
                            <button className="p-2.5 rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-colors">
                                <Mic size={18} />
                            </button>
                        )}
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className={`p-2.5 rounded-full transition-all duration-200 flex items-center justify-center ${input.trim() && !isTyping
                                ? 'text-white shadow-lg scale-100'
                                : 'text-white/20 scale-95 cursor-not-allowed bg-transparent'
                                }`}
                            style={input.trim() && !isTyping ? {
                                background: accent,
                                boxShadow: `0 4px 12px ${accent}40`
                            } : {}}
                        >
                            <Send size={18} fill={input.trim() ? "currentColor" : "none"} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
                <div className="text-center mt-3">
                    <p className="text-[11px] text-white/20">Zenner can make mistakes. Verify important info.</p>
                </div>
            </div>
        </div>
    );
}
