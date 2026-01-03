import { useState, useRef, useEffect } from "react";
import { Brain, Send, Zap, Coffee, Music, X, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { coachService } from "../services/ai/CoachService";
import { musicSelectionService } from "../services/music/MusicSelectionService";
import { accountabilityService } from "../services/accountability/AccountabilityService";

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
    accent,
    sessionsToday,
    isRunning,
    timeLeft,
    onClose,
    onMusicSelect
}: ZennerCoachProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showCommitmentPrompt, setShowCommitmentPrompt] = useState(false);
    const [dailyTarget, setDailyTarget] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const accountability = accountabilityService.getTodayAccountability();
        if (accountability.status === "no-commitment" && sessionsToday === 0) {
            setShowCommitmentPrompt(true);
        }
    }, [sessionsToday]);

    useEffect(() => {
        const context = {
            sessionsToday,
            currentSession: sessionsToday + 1,
            isRunning,
            timeLeft,
            timeOfDay: new Date().toLocaleTimeString()
        };

        coachService.getSessionStartMessage(context).then(msg => {
            const accountabilityMsg = accountabilityService.getAccountabilityMessage();

            setMessages([{
                id: "welcome",
                role: "coach",
                content: `${msg}\n\n${accountabilityMsg}`
            }]);
        });
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const addCoachMessage = (content: string) => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: "coach",
            content
        }]);
    };

    const handleSetCommitment = () => {
        const target = parseInt(dailyTarget);
        if (target > 0) {
            accountabilityService.setDailyCommitment(target, []);
            addCoachMessage(`${target} sessions locked in. No excuses.`);
            setShowCommitmentPrompt(false);
            setDailyTarget("");
        }
    };

    const handleQuickAction = async (action: "motivate" | "break" | "music" | "accountability") => {
        const context = {
            sessionsToday,
            currentSession: sessionsToday + 1,
            isRunning,
            timeLeft,
            timeOfDay: new Date().toLocaleTimeString()
        };

        setIsTyping(true);

        try {
            let response = "";

            switch (action) {
                case "motivate":
                    response = await coachService.getMotivation(context);
                    break;
                case "break":
                    const breakDuration = 5;
                    response = await coachService.suggestBreak(breakDuration);
                    break;
                case "music":
                    const hour = new Date().getHours();
                    const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 21 ? "evening" : "night";
                    const energyLevel = sessionsToday < 2 ? "high" : sessionsToday < 5 ? "medium" : "low";

                    const musicContext = {
                        timeOfDay,
                        energyLevel,
                        sessionNumber: sessionsToday + 1,
                        sessionDuration: 25
                    };

                    const { track, reason } = await musicSelectionService.getRecommendationWithReason(musicContext);
                    response = `🎵 ${track.name}\n\n${reason}`;

                    if (onMusicSelect) {
                        setTimeout(() => {
                            onMusicSelect(track.url, track.name);
                        }, 1000);
                    }
                    break;
                case "accountability":
                    const accountability = accountabilityService.getTodayAccountability();
                    const streak = accountabilityService.getStreakInfo();

                    if (accountability.status === "no-commitment") {
                        response = "Set your target first.";
                        setShowCommitmentPrompt(true);
                    } else {
                        response = `${accountability.completed}/${accountability.committed} done\n\n${streak.current} day streak\nScore: ${accountability.score}%`;
                    }
                    break;
            }

            setTimeout(() => {
                addCoachMessage(response);
                setIsTyping(false);
            }, 600);
        } catch {
            addCoachMessage("Connection issues. Try again.");
            setIsTyping(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: "user",
            content: userMsg
        }]);
        setInput("");
        setIsTyping(true);

        const context = {
            sessionsToday,
            currentSession: sessionsToday + 1,
            isRunning,
            timeLeft,
            timeOfDay: new Date().toLocaleTimeString()
        };

        try {
            const response = await coachService.chat(userMsg, context);
            setTimeout(() => {
                addCoachMessage(response.message);
                setIsTyping(false);
            }, 800);
        } catch {
            addCoachMessage("I hear you. Let's work through this.");
            setIsTyping(false);
        }
    };

    const getStatusText = () => {
        const accountability = accountabilityService.getTodayAccountability();

        if (accountability.status === "ahead") return "Crushing it";
        if (accountability.status === "behind") return "Behind";
        if (accountability.status === "on-track") return "On track";

        if (sessionsToday === 0) return "Let's go";
        if (sessionsToday >= 8) return "Beast mode";
        if (sessionsToday >= 4) return "Locked in";
        return "Building";
    };

    const accountability = accountabilityService.getTodayAccountability();

    return (
        <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="fixed right-6 top-6 bottom-6 w-80 flex flex-col"
            style={{ zIndex: 100 }}
        >
            <div
                className="flex-1 rounded-3xl overflow-hidden flex flex-col"
                style={{
                    background: "rgba(6, 6, 8, 0.85)",
                    backdropFilter: "blur(80px)",
                    border: "1px solid rgba(255, 255, 255, 0.03)",
                    boxShadow: `0 40px 100px rgba(0, 0, 0, 0.7)`
                }}
            >
                {/* Ultra Clean Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-white/[0.02]">
                    <div className="flex items-center gap-2">
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className="w-7 h-7 rounded-xl flex items-center justify-center"
                            style={{
                                background: `${accent}15`,
                                border: `1px solid ${accent}20`
                            }}
                        >
                            <Brain size={14} style={{ color: accent }} strokeWidth={2.5} />
                        </motion.div>
                        <div>
                            <h3 className="text-xs font-black text-white tracking-tight">Coach</h3>
                            <p className="text-[8px] font-medium text-white/30 tracking-wider">{getStatusText()}</p>
                        </div>
                    </div>
                    {onClose && (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="p-1 rounded-lg hover:bg-white/5"
                        >
                            <X size={12} className="text-white/30" />
                        </motion.button>
                    )}
                </div>

                {/* Compact Session Display */}
                <div className="px-6 py-3">
                    <motion.div
                        className="relative px-4 py-3 rounded-xl"
                        style={{
                            background: `${accent}08`,
                            border: `1px solid ${accent}12`
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black" style={{ color: accent }}>{sessionsToday}</span>
                                {accountability.status !== "no-commitment" && (
                                    <span className="text-[10px] text-white/30">/ {accountability.committed}</span>
                                )}
                            </div>
                            {accountability.status !== "no-commitment" && (
                                <span className="text-[10px] font-bold" style={{ color: accountability.score >= 70 ? "#10b981" : "#ef4444" }}>
                                    {accountability.score}%
                                </span>
                            )}
                        </div>

                        {accountability.status !== "no-commitment" && (
                            <div className="mt-2 h-0.5 rounded-full bg-white/5 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(sessionsToday / accountability.committed) * 100}%` }}
                                    className="h-full"
                                    style={{ background: accent }}
                                />
                            </div>
                        )}
                    </motion.div>

                    {/* Commitment Input - Compact */}
                    <AnimatePresence>
                        {showCommitmentPrompt && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-2"
                            >
                                <div className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
                                    <p className="text-[10px] text-white/40 mb-1.5">Daily target?</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={dailyTarget}
                                            onChange={(e) => setDailyTarget(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleSetCommitment()}
                                            placeholder="6"
                                            className="flex-1 px-2 py-1.5 rounded-md bg-white/5 border border-white/10 text-white text-xs outline-none"
                                        />
                                        <button
                                            onClick={handleSetCommitment}
                                            className="px-3 py-1.5 rounded-md text-[10px] font-bold"
                                            style={{ background: accent, color: "#000" }}
                                        >
                                            Set
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Messages - Streamlined */}
                <div className="flex-1 overflow-y-auto px-6 py-2 space-y-1.5 custom-scrollbar">
                    <AnimatePresence>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className="max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap"
                                    style={
                                        msg.role === "user"
                                            ? {
                                                background: accent,
                                                color: "#000",
                                                fontWeight: 600
                                            }
                                            : {
                                                background: "rgba(255, 255, 255, 0.03)",
                                                color: "rgba(255, 255, 255, 0.85)",
                                                border: "1px solid rgba(255, 255, 255, 0.03)"
                                            }
                                    }
                                >
                                    {msg.content}
                                </div>
                            </motion.div>
                        ))}
                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start"
                            >
                                <div className="px-3 py-2 rounded-xl bg-white/[0.02]">
                                    <div className="flex gap-0.5">
                                        {[0, 1, 2].map(i => (
                                            <motion.div
                                                key={i}
                                                animate={{ opacity: [0.3, 1, 0.3] }}
                                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                                className="w-1 h-1 rounded-full bg-white/30"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>

                {/* Compact Actions */}
                <div className="px-6 py-3 grid grid-cols-2 gap-1.5">
                    {[
                        { id: "motivate" as const, icon: Zap, label: "Push", color: accent },
                        { id: "music" as const, icon: Music, label: "Music", color: "#8b5cf6" },
                        { id: "break" as const, icon: Coffee, label: "Break", color: "#10b981" },
                        { id: "accountability" as const, icon: TrendingUp, label: "Stats", color: "#f59e0b" }
                    ].map((action) => (
                        <motion.button
                            key={action.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleQuickAction(action.id)}
                            className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[10px] font-bold"
                            style={{
                                background: `${action.color}10`,
                                border: `1px solid ${action.color}15`,
                                color: action.color
                            }}
                        >
                            <action.icon size={11} strokeWidth={2.5} />
                            {action.label}
                        </motion.button>
                    ))}
                </div>

                {/* Minimal Input */}
                <div className="px-6 pb-5 pt-1">
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Ask..."
                            className="w-full px-3 py-2 pr-9 rounded-lg text-xs text-white placeholder-white/20 outline-none"
                            style={{
                                background: "rgba(255, 255, 255, 0.02)",
                                border: "1px solid rgba(255, 255, 255, 0.05)"
                            }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md disabled:opacity-20"
                            style={{
                                background: input.trim() ? accent : "transparent",
                                color: input.trim() ? "#000" : accent
                            }}
                        >
                            <Send size={11} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
