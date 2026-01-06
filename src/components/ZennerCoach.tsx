import { useState, useRef, useEffect } from "react";
import { Send, X, Sparkles, Zap, Loader, TrendingUp, Mic, MicOff, Paperclip } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { coachService } from "../services/ai/CoachService";

interface Message {
    id: string;
    role: "user" | "coach";
    content: string;
}

interface ZennerCoachProps {
    accent: string;
    sessionsToday: number;
    isRunning: boolean;
    timeLeft: string;
    onClose?: () => void;
    onMusicSelect?: (trackUrl: string, trackName: string) => void;
}

export function ZennerCoach({
    sessionsToday,
    isRunning,
    timeLeft,
    onClose
}: ZennerCoachProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const recognitionRef = useRef<any>(null);
    const isInitializedRef = useRef(false);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            if ('webkitSpeechRecognition' in window) {
                const recognition = new (window as any).webkitSpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = true;

                recognition.onstart = () => setIsListening(true);
                recognition.onend = () => setIsListening(false);
                recognition.onerror = (e: any) => {
                    console.error("Speech recognition error", e);
                    setIsListening(false);
                };

                recognition.onresult = (event: any) => {
                    let finalTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        }
                    }

                    if (finalTranscript) {
                        setInput(prev => {
                            const spacer = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
                            return prev + spacer + finalTranscript;
                        });
                    }
                };

                recognitionRef.current = recognition;
                recognition.start();
            } else {
                alert("Voice input not supported in this environment");
            }
        }
    };

    useEffect(() => {
        // Prevent duplicate initialization (React Strict Mode issue)
        if (isInitializedRef.current) return;
        isInitializedRef.current = true;

        // 1. Try to load saved history
        const savedHistory = localStorage.getItem('zenner_chat_history');
        if (savedHistory) {
            try {
                const parsed = JSON.parse(savedHistory);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setMessages(parsed);
                    // Scroll to bottom after loading
                    setTimeout(() => messagesEndRef.current?.scrollIntoView(), 100);
                    return;
                }
            } catch (e) {
                console.error("Failed to parse chat history", e);
            }
        }

        // 2. If no history, fetch fresh welcome message
        const context = {
            sessionsToday,
            currentSession: sessionsToday + 1,
            isRunning,
            timeLeft,
            timeOfDay: new Date().toLocaleTimeString()
        };

        coachService.getSessionStartMessage(context).then(msg => {
            setMessages([{
                id: "welcome-" + Date.now(),
                role: "coach",
                content: msg
            }]);
        });
    }, []);

    // 3. Auto-save history whenever it changes
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('zenner_chat_history', JSON.stringify(messages));
        }
    }, [messages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMessage = input.trim();
        setInput("");

        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: "user",
            content: userMessage
        }]);

        setIsTyping(true);

        try {
            const context = {
                sessionsToday,
                currentSession: sessionsToday + 1,
                isRunning,
                timeLeft,
                timeOfDay: new Date().toLocaleTimeString()
            };

            const response = await coachService.chat(userMessage, context);

            setMessages(prev => [...prev, {
                id: Date.now().toString() + "-coach",
                role: "coach",
                content: response.message
            }]);
        } catch (error: any) {
            console.error("Zeni connection error:", error);

            // Determine the specific error and provide helpful guidance
            let errorMessage = "🔌 **Not Connected**\n\n";

            if (error?.message?.includes("No active provider") || error?.message?.includes("not available")) {
                errorMessage += "I need an AI provider to work. Here's how to set me up:\n\n";
                errorMessage += "**Option 1: Local (Free)**\n";
                errorMessage += "1. Install Ollama: https://ollama.ai\n";
                errorMessage += "2. Run: `ollama run llama3.2`\n";
                errorMessage += "3. I'll auto-detect it!\n\n";
                errorMessage += "**Option 2: Cloud (OpenAI)**\n";
                errorMessage += "1. Go to Settings → AI (coming soon)\n";
                errorMessage += "2. Add your OpenAI API key\n";
                errorMessage += "3. Select a model\n\n";
                errorMessage += "💡 Until then, I can still help with quick actions below!";
            } else {
                errorMessage += "Connection issue. Please check:\n\n";
                errorMessage += "• Is Ollama running? (`ollama serve`)\n";
                errorMessage += "• Is your OpenAI key valid?\n";
                errorMessage += "• Internet connection OK?\n\n";
                errorMessage += "Try again in a moment!";
            }

            setMessages(prev => [...prev, {
                id: Date.now().toString() + "-error",
                role: "coach",
                content: errorMessage
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed right-0 top-0 bottom-0 w-[700px] z-[60] flex flex-col bg-[#1E1E1E] border-l border-white/10">
            {/* Clean Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
                        <Sparkles size={16} color="#FFF" strokeWidth={2} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-white">Zeni</h3>
                            <div className="px-1.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 flex items-center gap-1" title="Chats are automatically saved">
                                <div className="w-1 h-1 rounded-full bg-green-400"></div>
                                <span className="text-[9px] font-medium text-green-400 tracking-wide uppercase">Autosave</span>
                            </div>
                        </div>
                        <p className="text-xs text-white/40">AI Coach</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            if (window.confirm("Clear chat history?")) {
                                setMessages([]);
                                localStorage.removeItem('zenner_chat_history');
                            }
                        }}
                        className="p-2 rounded-xl hover:bg-white/10 transition-all group"
                        title="Clear History"
                    >
                        {/* Use simple SVG to avoid new import for now, or use X icon logic */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 group-hover:text-red-400">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                    </button>

                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-white/10 transition-all hover:scale-110 group"
                            style={{ background: 'rgba(255,255,255,0.05)' }}
                        >
                            <X size={20} className="text-white/70 group-hover:text-white transition-colors" />
                        </button>
                    )}
                </div>
            </div>

            {/* Floating Close Button - Extra Prominent */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-3 rounded-2xl transition-all hover:scale-110 shadow-2xl"
                    style={{
                        background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <X size={24} className="text-white" strokeWidth={2.5} />
                </button>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {message.role === "coach" && (
                                <div className="flex items-start gap-3 max-w-[85%]">
                                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                                        <Sparkles size={12} color="#FFF" strokeWidth={2} />
                                    </div>
                                    <div className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10">
                                        <p className="text-sm leading-relaxed text-white/90" style={{ wordBreak: "break-word" }}>
                                            {message.content}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {message.role === "user" && (
                                <div className="px-4 py-3 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/30 max-w-[85%]">
                                    <p className="text-sm leading-relaxed text-white" style={{ wordBreak: "break-word" }}>
                                        {message.content}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </AnimatePresence>

                {isTyping && (
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <Sparkles size={12} color="#FFF" strokeWidth={2} />
                        </div>
                        <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                            <Loader size={14} className="text-white/50 animate-spin" />
                            <span className="text-sm text-white/50">Thinking...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area - AWESOME VERSION */}
            <div className="px-8 py-6 border-t border-white/10 bg-black/20">
                {/* Suggested Questions - Quick Access */}
                <div className="mb-4">
                    <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 px-1">Suggested Questions</p>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => {
                                setInput("I need motivation to start working");
                                setTimeout(() => inputRef.current?.focus(), 50);
                            }}
                            className="group flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500/10 to-purple-500/10 border border-fuchsia-500/20 hover:border-fuchsia-500/40 hover:from-fuchsia-500/20 hover:to-purple-500/20 transition-all text-xs font-medium text-white/80 hover:text-white"
                        >
                            <Zap size={14} className="group-hover:scale-110 transition-transform flex-shrink-0" strokeWidth={2.5} />
                            <span className="text-left">Motivate Me</span>
                        </button>
                        <button
                            onClick={() => {
                                setInput("Show me my productivity insights");
                                setTimeout(() => inputRef.current?.focus(), 50);
                            }}
                            className="group flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover:border-blue-500/40 hover:from-blue-500/20 hover:to-cyan-500/20 transition-all text-xs font-medium text-white/80 hover:text-white"
                        >
                            <TrendingUp size={14} className="group-hover:scale-110 transition-transform flex-shrink-0" strokeWidth={2.5} />
                            <span className="text-left">My Progress</span>
                        </button>
                        <button
                            onClick={() => {
                                setInput("What's my best time to work?");
                                setTimeout(() => inputRef.current?.focus(), 50);
                            }}
                            className="group flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 hover:border-green-500/40 hover:from-green-500/20 hover:to-emerald-500/20 transition-all text-xs font-medium text-white/80 hover:text-white"
                        >
                            <Sparkles size={14} className="group-hover:scale-110 transition-transform flex-shrink-0" strokeWidth={2.5} />
                            <span className="text-left">Best Time</span>
                        </button>
                        <button
                            onClick={() => {
                                setInput("How do I use Zenner effectively?");
                                setTimeout(() => inputRef.current?.focus(), 50);
                            }}
                            className="group flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 hover:border-orange-500/40 hover:from-orange-500/20 hover:to-amber-500/20 transition-all text-xs font-medium text-white/80 hover:text-white"
                        >
                            <Loader size={14} className="group-hover:scale-110 transition-transform flex-shrink-0" strokeWidth={2.5} />
                            <span className="text-left">How to Use</span>
                        </button>
                        <button
                            onClick={() => {
                                setInput("What frequency should I use for deep focus?");
                                setTimeout(() => inputRef.current?.focus(), 50);
                            }}
                            className="group flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20 hover:border-pink-500/40 hover:from-pink-500/20 hover:to-rose-500/20 transition-all text-xs font-medium text-white/80 hover:text-white"
                        >
                            <Sparkles size={14} className="group-hover:scale-110 transition-transform flex-shrink-0" strokeWidth={2.5} />
                            <span className="text-left">Best Frequency</span>
                        </button>
                        <button
                            onClick={() => {
                                setInput("Give me a quick tip");
                                setTimeout(() => inputRef.current?.focus(), 50);
                            }}
                            className="group flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 hover:border-violet-500/40 hover:from-violet-500/20 hover:to-purple-500/20 transition-all text-xs font-medium text-white/80 hover:text-white"
                        >
                            <Sparkles size={14} className="group-hover:scale-110 transition-transform flex-shrink-0" strokeWidth={2.5} />
                            <span className="text-left">Quick Tip</span>
                        </button>
                    </div>
                </div>


                {/* Input - Premium Design */}
                <div className="relative flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 transition-all focus-within:border-fuchsia-500/50 focus-within:bg-white/8 focus-within:ring-4 focus-within:ring-fuchsia-500/10 hover:border-white/20">

                    {/* Attachment Button */}
                    <button
                        className="p-3 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        title="Attach file (coming soon)"
                        onClick={() => alert("File attachment coming soon!")}
                    >
                        <Paperclip size={20} />
                    </button>

                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            // Auto-grow height
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        onPaste={(e) => {
                            const items = e.clipboardData.items;
                            for (let i = 0; i < items.length; i++) {
                                if (items[i].type.indexOf("image") !== -1) {
                                    e.preventDefault();
                                    alert("Image pasting support coming in the next update!");
                                    return;
                                }
                            }
                        }}
                        placeholder={isListening ? "Listening..." : "Ask Zeni anything..."}
                        disabled={isTyping}
                        rows={1}
                        className="flex-1 bg-transparent border-none outline-none text-base font-medium text-white placeholder:text-white/30 resize-none py-3 min-h-[48px] max-h-[120px] custom-scrollbar"
                        style={{ height: 'auto' }}
                    />

                    <div className="flex items-center gap-1 pb-0.5">
                        {/* Mic Button */}
                        <button
                            onClick={toggleListening}
                            className={`p-3 rounded-xl transition-all duration-300 ${isListening
                                ? 'bg-red-500/20 text-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                                : 'text-white/40 hover:text-white hover:bg-white/10'
                                }`}
                            title={isListening ? "Stop listening" : "Start voice input"}
                        >
                            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>

                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="p-3 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-fuchsia-500/50 hover:scale-105 active:scale-95"
                        >
                            <Send size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* Hint Text */}
                <div className="flex justify-between items-center px-2 mt-3 text-xs text-white/30">
                    <span>Markdown supported</span>
                    <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/50 font-mono text-[10px] mx-1">Enter</kbd> to send</span>
                </div>
            </div>
        </div>
    );
}
