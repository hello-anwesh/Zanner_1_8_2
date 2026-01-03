import { motion } from "framer-motion";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useTimer, TimerMode } from "../hooks/useTimer";
import { cn } from "../lib/utils";

// Helper to format time as MM:SS
const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export function CircularTimer() {
    const { timeLeft, isActive, mode, progress, toggleTimer, resetTimer, switchMode } = useTimer();

    // Circle properties
    const radius = 120;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-8">
            {/* Mode Selectors */}
            <div className="flex space-x-4 p-2 bg-black/20 backdrop-blur-md rounded-full shadow-inner">
                {(["work", "shortBreak", "longBreak"] as TimerMode[]).map((m) => (
                    <button
                        key={m}
                        onClick={() => switchMode(m)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300",
                            mode === m
                                ? "bg-white/10 text-white shadow-lg shadow-white/5"
                                : "text-white/40 hover:text-white/70"
                        )}
                    >
                        {m === "work" ? "Focus" : m === "shortBreak" ? "Short" : "Long"}
                    </button>
                ))}
            </div>

            {/* Timer Circle */}
            <div className="relative group cursor-pointer" onClick={toggleTimer}>
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-blue-500/10 blur-[60px] rounded-full group-hover:bg-blue-500/20 transition-all duration-700" />

                <div className="relative w-[300px] h-[300px] flex items-center justify-center">
                    <svg
                        height={radius * 2}
                        width={radius * 2}
                        className="rotate-[-90deg] overflow-visible"
                    >
                        {/* Background Circle */}
                        <circle
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth={stroke}
                            fill="transparent"
                            r={normalizedRadius}
                            cx={radius}
                            cy={radius}
                        />
                        {/* Progress Circle */}
                        <motion.circle
                            stroke="url(#gradient)"
                            strokeWidth={stroke}
                            strokeDasharray={circumference + " " + circumference}
                            style={{ strokeDashoffset }}
                            strokeLinecap="round"
                            fill="transparent"
                            r={normalizedRadius}
                            cx={radius}
                            cy={radius}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#60A5FA" />
                                <stop offset="100%" stopColor="#A78BFA" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Time Display */}
                    <div className="absolute flex flex-col items-center justify-center">
                        <motion.span
                            key={timeLeft}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-6xl font-light tracking-wider text-white drop-shadow-2xl font-[output,sans-serif]"
                        >
                            {formatTime(timeLeft)}
                        </motion.span>
                        <span className="text-white/30 text-sm mt-2 tracking-[0.2em] uppercase">
                            {isActive ? "Running" : "Paused"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-6">
                <button
                    onClick={resetTimer}
                    className="p-3 rounded-full text-white/50 hover:bg-white/5 hover:text-white transition-all"
                >
                    <RotateCcw size={20} />
                </button>
                <button
                    onClick={toggleTimer}
                    className="p-4 rounded-full bg-white text-black hover:scale-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                    {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-0.5" />}
                </button>
            </div>
        </div>
    );
}
