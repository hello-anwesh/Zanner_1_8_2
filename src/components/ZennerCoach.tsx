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
        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now().toString() + "-error",
                role: "coach",
                content: "I apologize, Sir. I'm having trouble connecting. Please try again."
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
                        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <X size={18} className="text-white/50" />
                    </button>
                )}
            </div>

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

            {/* Input Area */}
            <div className="px-6 py-4 border-t border-white/10">
                {/* Quick Actions */}
                <div className="flex gap-2 mb-3">
                    <button
                        onClick={() => {
                            setInput("I need motivation");
                            setTimeout(() => inputRef.current?.focus(), 50);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-colors text-sm text-white/70"
                    >
                        <Zap size={14} strokeWidth={2} />
                        Motivate Me
                    </button>
                    <button
                        onClick={() => {
                            setInput("Show me my progress");
                            setTimeout(() => inputRef.current?.focus(), 50);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-colors text-sm text-white/70"
                    >
                        <TrendingUp size={14} strokeWidth={2} />
                        My Progress
                    </button>
                </div>

                {/* Input */}
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Message Zeni..."
                        disabled={isTyping}
                        className="w-full px-4 py-3 pr-12 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 outline-none focus:border-fuchsia-500/50 transition-colors"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-fuchsia-500 hover:bg-fuchsia-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={16} color="#FFF" strokeWidth={2} />
                    </button>
                </div>
            </div>
        </div>
    );
}
