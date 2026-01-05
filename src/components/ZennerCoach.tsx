import { useState, useRef, useEffect } from "react";
import { Send, X, Sparkles, Heart, Zap, Loader, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
        <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[600px] z-[60] flex flex-col"
        >
            {/* Ultra Premium Glass Background */}
            <div
                className="absolute inset-0 backdrop-blur-[60px]"
                style={{
                    background: "linear-gradient(165deg, rgba(20,20,28,0.96) 0%, rgba(14,14,20,0.98) 100%)",
                    boxShadow: "-40px 0 120px rgba(0,0,0,0.8)"
                }}
            />

            {/* Floating Ambient Glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -top-80 -right-80 w-[700px] h-[700px] rounded-full blur-[140px]"
                    style={{
                        background: "radial-gradient(circle, rgba(217, 70, 239, 0.3) 0%, transparent 70%)"
                    }}
                />
                <motion.div
                    animate={{
                        scale: [1.3, 1, 1.3],
                        opacity: [0.15, 0.35, 0.15]
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 3
                    }}
                    className="absolute bottom-40 -right-60 w-[500px] h-[500px] rounded-full blur-[120px]"
                    style={{
                        background: "radial-gradient(circle, rgba(147, 51, 234, 0.25) 0%, transparent 70%)"
                    }}
                />
            </div>

            {/* Content Container */}
            <div className="relative flex flex-col h-full">
                {/* Ultra Spacious Header */}
                <div className="px-12 py-10">
                    <div className="flex items-start justify-between mb-10">
                        <div className="flex items-center gap-6">
                            <motion.div
                                whileHover={{ scale: 1.08, rotate: 8 }}
                                whileTap={{ scale: 0.92 }}
                                className="relative w-20 h-20 rounded-[24px] flex items-center justify-center overflow-hidden cursor-pointer group"
                                style={{
                                    background: "linear-gradient(135deg, #D946EF 0%, #9333EA 100%)",
                                    boxShadow: "0 16px 48px rgba(217, 70, 239, 0.4), 0 0 0 1px rgba(255,255,255,0.1)"
                                }}
                            >
                                <div className="absolute inset-0 bg-white/20 blur-2xl group-hover:blur-3xl transition-all duration-700" />
                                <Sparkles size={36} color="#FFF" strokeWidth={2.5} className="relative z-10" />

                                <motion.div
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ duration: 2.5, repeat: Infinity }}
                                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-green-400"
                                    style={{
                                        boxShadow: "0 0 20px rgba(74, 222, 128, 1)"
                                    }}
                                />
                            </motion.div>

                            <div>
                                <h3 className="text-4xl font-black tracking-tight text-white mb-2">Zeni</h3>
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-base font-semibold text-white/60 flex items-center gap-2.5"
                                >
                                    <motion.span
                                        animate={{ opacity: [0.4, 1, 0.4] }}
                                        transition={{ duration: 2.5, repeat: Infinity }}
                                        className="w-2.5 h-2.5 rounded-full bg-green-400"
                                    />
                                    Online & Ready
                                </motion.p>
                            </div>
                        </div>

                        {onClose && (
                            <motion.button
                                whileHover={{ scale: 1.15, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
                            >
                                <X size={22} className="text-white/70" />
                            </motion.button>
                        )}
                    </div>

                    {/* Beautiful Stats Card */}
                    <motion.div
                        whileHover={{ scale: 1.02, y: -4 }}
                        transition={{ type: "spring", stiffness: 400 }}
                        className="p-7 rounded-[28px] border cursor-pointer group"
                        style={{
                            background: "linear-gradient(135deg, rgba(217, 70, 239, 0.1) 0%, rgba(147, 51, 234, 0.05) 100%)",
                            borderColor: "rgba(217, 70, 239, 0.25)",
                            boxShadow: "0 12px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)"
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.7 }}
                                    className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-xl"
                                >
                                    <span className="text-3xl font-black">{sessionsToday}</span>
                                </motion.div>
                                <div>
                                    <p className="text-xs text-white/60 font-bold uppercase tracking-[0.15em] mb-1.5">Sessions Today</p>
                                    <p className="text-lg font-black text-white">{isRunning ? `⏱️ ${timeLeft}` : "Ready to Focus"}</p>
                                </div>
                            </div>
                            <motion.div
                                animate={{
                                    scale: [1, 1.15, 1],
                                }}
                                transition={{ duration: 2.5, repeat: Infinity }}
                            >
                                <Heart size={28} className="text-pink-400" fill="rgba(244, 114, 182, 0.3)" />
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* Massive Spacious Messages Area */}
                <div className="flex-1 overflow-y-auto px-12 py-6 space-y-8 custom-scrollbar">
                    <AnimatePresence mode="popLayout">
                        {messages.map((message, index) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 40, scale: 0.85 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.85 }}
                                transition={{
                                    type: "spring",
                                    damping: 25,
                                    stiffness: 300,
                                    delay: index * 0.06
                                }}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {message.role === "coach" && (
                                    <div className="flex items-start gap-5 max-w-[85%]">
                                        <motion.div
                                            whileHover={{ scale: 1.12, rotate: 12 }}
                                            className="w-12 h-12 rounded-[18px] flex items-center justify-center flex-shrink-0 mt-1"
                                            style={{
                                                background: "linear-gradient(135deg, #D946EF 0%, #9333EA 100%)",
                                                boxShadow: "0 8px 24px rgba(217, 70, 239, 0.35)"
                                            }}
                                        >
                                            <Sparkles size={20} color="#FFF" strokeWidth={2.5} />
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ scale: 1.01, x: 6 }}
                                            className="flex-1 px-7 py-6 rounded-[28px] rounded-tl-md relative overflow-hidden group cursor-pointer"
                                            style={{
                                                background: "linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.05) 100%)",
                                                border: "1px solid rgba(255,255,255,0.15)",
                                                backdropFilter: "blur(30px)",
                                                boxShadow: "0 12px 48px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)"
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                            <p className="text-white text-base leading-[1.8] font-medium break-words whitespace-pre-wrap relative z-10" style={{ wordBreak: "break-word", overflowWrap: "break-word" }}>
                                                {message.content}
                                            </p>
                                        </motion.div>
                                    </div>
                                )}

                                {message.role === "user" && (
                                    <motion.div
                                        whileHover={{ scale: 1.02, x: -6 }}
                                        className="px-7 py-6 rounded-[28px] rounded-tr-md max-w-[85%] relative overflow-hidden cursor-pointer group"
                                        style={{
                                            background: "linear-gradient(135deg, #D946EF 0%, #9333EA 100%)",
                                            boxShadow: "0 12px 40px rgba(217, 70, 239, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)"
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                                        <p className="text-white text-base leading-[1.8] font-medium break-words whitespace-pre-wrap relative z-10" style={{ wordBreak: "break-word", overflowWrap: "break-word" }}>
                                            {message.content}
                                        </p>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex items-start gap-5"
                        >
                            <div
                                className="w-12 h-12 rounded-[18px] flex items-center justify-center"
                                style={{
                                    background: "linear-gradient(135deg, #D946EF 0%, #9333EA 100%)"
                                }}
                            >
                                <Sparkles size={20} color="#FFF" strokeWidth={2.5} />
                            </div>
                            <div
                                className="px-7 py-6 rounded-[28px] rounded-tl-md flex items-center gap-3.5"
                                style={{
                                    background: "linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.05) 100%)",
                                    border: "1px solid rgba(255,255,255,0.15)"
                                }}
                            >
                                <Loader size={20} className="text-white/70 animate-spin" />
                                <span className="text-white/70 text-base font-semibold">Zeni is thinking...</span>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Ultra Spacious Input Zone */}
                <div className="px-12 py-10 border-t border-white/12">
                    <div className="relative mb-6">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Message Zeni..."
                            disabled={isTyping}
                            className="w-full px-7 py-6 pr-20 rounded-[24px] text-white text-base font-medium outline-none transition-all duration-300 placeholder:text-white/35 focus:ring-2 focus:ring-fuchsia-500/40"
                            style={{
                                background: "linear-gradient(135deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.06) 100%)",
                                border: "1.5px solid rgba(255,255,255,0.18)",
                                backdropFilter: "blur(30px)",
                                boxShadow: "0 10px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.12)"
                            }}
                        />
                        <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 rounded-[18px] flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{
                                background: input.trim() && !isTyping
                                    ? "linear-gradient(135deg, #D946EF 0%, #9333EA 100%)"
                                    : "rgba(255,255,255,0.08)",
                                boxShadow: input.trim() && !isTyping
                                    ? "0 8px 24px rgba(217, 70, 239, 0.45)"
                                    : "none"
                            }}
                        >
                            <Send size={22} color="#FFF" strokeWidth={2.5} />
                        </motion.button>
                    </div>

                    {/* Stylish Quick Actions */}
                    <div className="flex gap-3.5">
                        <QuickActionChip
                            icon={Zap}
                            label="Motivate Me"
                            onClick={() => {
                                setInput("I need motivation");
                                setTimeout(() => inputRef.current?.focus(), 50);
                            }}
                        />
                        <QuickActionChip
                            icon={TrendingUp}
                            label="My Progress"
                            onClick={() => {
                                setInput("Show me my progress");
                                setTimeout(() => inputRef.current?.focus(), 50);
                            }}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function QuickActionChip({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
    return (
        <motion.button
            whileHover={{ scale: 1.06, y: -3 }}
            whileTap={{ scale: 0.94 }}
            onClick={onClick}
            className="flex items-center gap-3 px-6 py-3.5 rounded-[18px] text-sm font-bold transition-all duration-300 hover:bg-white/12"
            style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.85)"
            }}
        >
            <Icon size={18} strokeWidth={2.5} />
            {label}
        </motion.button>
    );
}
