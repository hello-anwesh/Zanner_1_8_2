
import { useState, useEffect, useRef } from "react";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Command, ArrowRight, Loader2 } from "lucide-react";
import { productivityAI } from "../services/ai/ProductivityAI";

// Types
import { TimerMode } from "../App";

export function SpotlightView() {
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [height, setHeight] = useState(60);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
        // Reset state on mount (every time window shows?)
        // React component might stay mounted if window acts like a keep-alive.
        // Usually safe to reset.
    }, []);

    const updateHeight = async (newHeight: number) => {
        setHeight(newHeight);
        await getCurrentWindow().setSize(new LogicalSize(800, newHeight));
    };

    const handleKeyDown = async (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            if (result) {
                // Clear result first
                setResult(null);
                setQuery("");
                updateHeight(60);
            } else {
                // Hide window
                await invoke("hide_spotlight");
            }
        } else if (e.key === "Enter" && query.trim()) {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        // Expand window for result
        await updateHeight(400);

        const lowerQuery = query.toLowerCase().trim();

        try {
            // Local Commands Integration
            if (lowerQuery.startsWith("play ")) {
                const sound = lowerQuery.replace("play ", "") as any;
                const { soundscape } = await import("../services/soundscape/SoundscapeEngine");

                if (['rain', 'stream', 'fire', 'brown', 'pink', 'white'].includes(sound)) {
                    await soundscape.play(sound);
                    setResult(`Playing ${sound} 🌧️`);
                    setIsLoading(false);
                    return;
                }
            } else if (lowerQuery === "stop" || lowerQuery === "silence") {
                const { soundscape } = await import("../services/soundscape/SoundscapeEngine");
                soundscape.stopAll();
                setResult("Stopped all audio 🔇");
                setIsLoading(false);
                return;
            }

            // Use existing AI service
            // Mock context for now or fetch from global store?
            const context = {
                currentMode: "focus" as TimerMode,
                timeLeft: "25:00",
                isRunning: false,
                sessionsToday: 0,
                currentTime: new Date().toLocaleTimeString(),
                streak: 7
            };

            const response = await productivityAI.chat(query, context);
            setResult(response);
        } catch (error) {
            setResult("Sorry, I encountered an error.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full w-full overflow-hidden bg-[#0a0a0c]/90 backdrop-blur-3xl border border-white/10 rounded-xl flex flex-col">
            {/* Input Area */}
            <div className="h-[60px] flex items-center px-4 gap-3 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shrink-0 animate-pulse-slow">
                    {isLoading ? <Loader2 size={18} className="text-white animate-spin" /> : <Sparkles size={18} className="text-white" />}
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Zenner..."
                    className="flex-1 bg-transparent border-none outline-none text-xl text-white placeholder-white/30 font-medium h-full"
                    autoFocus
                />

                <div className="flex items-center gap-2">
                    <div className="px-2 py-1 rounded bg-white/10 border border-white/5 text-[10px] text-white/50 font-medium">
                        Return ↵
                    </div>
                </div>
            </div>

            {/* Results Area */}
            <AnimatePresence>
                {(isLoading || result) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex-1 border-t border-white/10 p-6 overflow-y-auto"
                    >
                        {isLoading ? (
                            <div className="space-y-3">
                                <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse" />
                                <div className="h-4 bg-white/5 rounded w-1/2 animate-pulse" />
                            </div>
                        ) : (
                            <div className="prose prose-invert prose-sm max-w-none">
                                <p className="whitespace-pre-wrap text-white/90 leading-relaxed text-lg">
                                    {result}
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
