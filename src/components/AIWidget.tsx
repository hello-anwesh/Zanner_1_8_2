import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, X, Minimize2, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export function AIWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", role: "assistant", content: "Hi! I'm Chronos AI. Ready to focus? I can help with study tips or just keep you company." }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!query.trim()) return;

        const newMsg: Message = { id: Date.now().toString(), role: "user", content: query };
        setMessages(prev => [...prev, newMsg]);
        setQuery("");

        // Mock response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "I'm currently in offline mode (mock). Once connected to the local LLM, I'll be able to generate real responses based on your work context!"
            }]);
        }, 1000);
    };

    return (
        <>
            {/* Floating Toggle Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-8 right-8 p-4 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-full shadow-lg shadow-purple-500/30 text-white z-40 group"
                >
                    <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
                </motion.button>
            )}

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            height: isMinimized ? "auto" : "500px",
                            width: isMinimized ? "300px" : "380px"
                        }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className={cn(
                            "fixed bottom-8 right-8 bg-[#1A1A1A]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-40 overflow-hidden flex flex-col transition-all duration-300",
                            isMinimized ? "h-auto" : "h-[500px]"
                        )}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-purple-400" />
                                <span className="font-semibold text-white/90">Chronos AI</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-1.5 hover:bg-white/10 rounded-md text-white/60 hover:text-white transition-colors"
                                >
                                    {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-white/10 rounded-md text-white/60 hover:text-white transition-colors"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Chat Area */}
                        {!isMinimized && (
                            <>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex w-full",
                                                msg.role === "user" ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                                                    msg.role === "user"
                                                        ? "bg-blue-600 text-white rounded-br-sm"
                                                        : "bg-white/10 text-white/90 rounded-bl-sm"
                                                )}
                                            >
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-3 border-t border-white/5 bg-black/20">
                                    <div className="flex items-center gap-2 bg-white/5 rounded-xl px-2 py-1.5 border border-white/5 focus-within:border-white/10 transition-colors">
                                        <input
                                            type="text"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                            placeholder="Ask anything..."
                                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white placeholder-white/30 px-2 py-1"
                                        />
                                        <button
                                            onClick={handleSend}
                                            disabled={!query.trim()}
                                            className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-lg transition-colors"
                                        >
                                            <Send size={14} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
