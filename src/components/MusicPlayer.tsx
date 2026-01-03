import { useState } from "react";
import { Music, Play, Pause, SkipForward, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function MusicPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            layout
            initial={{ width: 48, height: 48 }}
            animate={{
                width: isExpanded ? 300 : 48,
                height: isExpanded ? 120 : 48,
                borderRadius: 24
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-8 left-8 bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden z-30"
        >
            {/* Collapsed State Icon */}
            <motion.button
                layout
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute top-0 left-0 w-12 h-12 flex items-center justify-center text-white/60 hover:text-white transition-colors z-20"
            >
                <Music size={20} className={isPlaying ? "animate-pulse text-purple-400" : ""} />
            </motion.button>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="pl-14 pr-4 py-3 h-full flex flex-col justify-center space-y-2"
                    >
                        {/* Track Info */}
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-white">Lofi Beats to Study To</div>
                                <div className="text-xs text-white/40">Spotify (Mock)</div>
                            </div>
                            <Volume2 size={16} className="text-white/40" />
                        </div>

                        {/* Controls */}
                        <div className="flex items-center space-x-4 pt-1">
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="bg-white text-black p-2 rounded-full hover:scale-105 transition-transform"
                            >
                                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                            </button>
                            <button className="text-white/60 hover:text-white">
                                <SkipForward size={20} />
                            </button>

                            {/* Waveform Mock */}
                            <div className="flex-1 flex items-end space-x-0.5 h-6 opacity-50">
                                {[...Array(15)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-1 bg-purple-500 rounded-t-sm"
                                        style={{
                                            height: isPlaying ? `${Math.random() * 100}%` : '20%',
                                            transition: 'height 0.2s ease'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
