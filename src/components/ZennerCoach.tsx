import { useState, useRef, useEffect } from "react";
import { Send, X, Sparkles, Zap, Loader, TrendingUp } from "lucide-react";
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
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const context = {
            sessionsToday,
            currentSession: sessionsToday + 1,
            isRunning,
            timeLeft,
            timeOfDay: new Date().toLocaleTimeString()
        };

        coachService.getSessionStartMessage(context).then(msg => {
            setMessages([{
                id: "welcome",
                role: "coach",
                content: msg
            }]);
        });
    }, []);

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
                        <h3 className="text-base font-semibold text-white">Zeni</h3>
                        <p className="text-xs text-white/40">AI Coach</p>
                    </div>
                </div>

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
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Ask Zeni anything..."
                        disabled={isTyping}
                        className="w-full px-5 py-4 pr-14 rounded-xl bg-white/5 border-2 border-white/10 text-base font-medium text-white placeholder:text-white/40 outline-none focus:border-fuchsia-500/50 focus:bg-white/8 transition-all disabled:opacity-50"
                        style={{
                            boxShadow: input.length > 0 ? '0 0 0 4px rgba(217, 70, 239, 0.1)' : 'none'
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-fuchsia-500/50 hover:scale-105 active:scale-95"
                    >
                        <Send size={18} color="#FFF" strokeWidth={2.5} />
                    </button>
                </div>

                {/* Hint Text */}
                <p className="text-xs text-white/30 mt-3 text-center">
                    Press <kbd className="px-2 py-0.5 rounded bg-white/10 text-white/50 font-mono">Enter</kbd> to send
                </p>
            </div>
        </div>
    );
}
