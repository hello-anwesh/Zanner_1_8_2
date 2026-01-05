/**
 * Timer Presets Configuration
 * 
 * 10 curated productivity presets for different work styles and tasks.
 * Each preset includes focus duration, break durations, and usage tips.
 */

export interface TimerPreset {
    id: string;
    name: string;
    icon: string;
    description: string;
    focus: number;      // minutes
    shortBreak: number; // minutes
    longBreak: number;  // minutes
    sessionsBeforeLongBreak: number;
    bestFor: string[];
    tip: string;
    color: string;      // accent color for this preset
    sequence?: { type: "focus" | "shortBreak" | "longBreak"; duration: number; label?: string }[];
    baseUnit?: number; // Optional 'X' value for dynamic calculation
}

export const TIMER_PRESETS: TimerPreset[] = [
    {
        id: "classic",
        name: "Classic Pomodoro",
        icon: "🍅",
        description: "The original technique - 25min focus, 5min break",
        focus: 25,
        shortBreak: 5,
        longBreak: 15,
        sessionsBeforeLongBreak: 4,
        bestFor: ["General tasks", "Studying", "Email processing"],
        tip: "Perfect for beginners. The 25-minute window is short enough to maintain focus but long enough to make progress.",
        color: "#F43F5E",
    },
    {
        id: "deep-work",
        name: "Deep Work",
        icon: "🧠",
        description: "Extended focus for complex tasks - 50min focus",
        focus: 50,
        shortBreak: 10,
        longBreak: 30,
        sessionsBeforeLongBreak: 3,
        bestFor: ["Programming", "Writing", "Research", "Design"],
        tip: "Use this when you need to enter flow state. Best for tasks requiring deep concentration. Avoid multitasking.",
        color: "#8B5CF6",
    },
    {
        id: "ultrafast",
        name: "Ultra Sprint",
        icon: "⚡",
        description: "Quick bursts for scattered tasks - 15min focus",
        focus: 15,
        shortBreak: 3,
        longBreak: 10,
        sessionsBeforeLongBreak: 4,
        bestFor: ["Quick tasks", "Emails", "Admin work", "Chores"],
        tip: "Great for days when focus is hard. Short sprints build momentum and make starting easier.",
        color: "#F59E0B",
    },
    {
        id: "marathon",
        name: "Marathon Mode",
        icon: "🏃",
        description: "Long sessions for flow state - 90min focus",
        focus: 90,
        shortBreak: 20,
        longBreak: 45,
        sessionsBeforeLongBreak: 2,
        bestFor: ["Long projects", "Creative work", "Book writing", "Thesis"],
        tip: "Matches the natural ultradian rhythm. Use only when well-rested. Stay hydrated!",
        color: "#06B6D4",
    },
    {
        id: "student",
        name: "Student Mode",
        icon: "📚",
        description: "Optimized for learning - 30min focus with review breaks",
        focus: 30,
        shortBreak: 7,
        longBreak: 20,
        sessionsBeforeLongBreak: 4,
        bestFor: ["Studying", "Memorization", "Exam prep", "Online courses"],
        tip: "Use breaks to quickly review what you learned. Spaced repetition during breaks boosts retention.",
        color: "#10B981",
    },
    {
        id: "creative",
        name: "Creative Flow",
        icon: "🎨",
        description: "Flexible timing for creative work - 45min focus",
        focus: 45,
        shortBreak: 10,
        longBreak: 25,
        sessionsBeforeLongBreak: 3,
        bestFor: ["Art", "Music", "Design", "Brainstorming", "Content creation"],
        tip: "Creativity needs room to breathe. Don't force it - if you're in flow, extend the session.",
        color: "#EC4899",
    },
    {
        id: "meeting-recovery",
        name: "Meeting Recovery",
        icon: "💼",
        description: "Post-meeting productivity boost - 20min sprints",
        focus: 20,
        shortBreak: 5,
        longBreak: 15,
        sessionsBeforeLongBreak: 4,
        bestFor: ["After meetings", "Task switching", "Catching up", "Quick wins"],
        tip: "Perfect for fragmented days. Use between meetings to maintain momentum and process action items.",
        color: "#6366F1",
    },
    {
        id: "morning-power",
        name: "Morning Power Hour",
        icon: "🌅",
        description: "High-energy morning sessions - 35min focus",
        focus: 35,
        shortBreak: 5,
        longBreak: 15,
        sessionsBeforeLongBreak: 3,
        bestFor: ["Most important tasks", "Morning routine", "Planning"],
        tip: "Tackle your hardest task first. Mornings offer peak cognitive performance for most people.",
        color: "#F97316",
    },
    {
        id: "evening-wind",
        name: "Evening Wind Down",
        icon: "🌙",
        description: "Gentle evening sessions - 20min focus, longer breaks",
        focus: 20,
        shortBreak: 8,
        longBreak: 20,
        sessionsBeforeLongBreak: 3,
        bestFor: ["Light tasks", "Reading", "Planning tomorrow", "Personal projects"],
        tip: "Avoid intense work. Use for low-stakes tasks. Stop at least 1 hour before bed.",
        color: "#A855F7",
    },
    {
        id: "custom-formula",
        name: "Custom Formula",
        icon: "🎯",
        description: "Progressive intensity pattern",
        focus: 25,
        shortBreak: 5,
        longBreak: 15,
        sessionsBeforeLongBreak: 4,
        bestFor: ["Custom progression", "Energy management"],
        tip: "Progressive focus with dynamic breaks - builds momentum while managing energy.",
        color: "#14B8A6",
        baseUnit: 25,
        sequence: [
            { type: "focus", duration: 25, label: "F·x" },
            { type: "shortBreak", duration: 2.5, label: "B·x/10" },
            { type: "focus", duration: 27.5, label: "F·x+x/10" },
            { type: "shortBreak", duration: 2.5, label: "B·x/10" },
            { type: "focus", duration: 30, label: "F·x+x/5" },
            { type: "shortBreak", duration: 5, label: "B·x/5" }
        ]
    },
    {
        id: "custom",
        name: "Custom",
        icon: "⚙️",
        description: "Your own configuration",
        focus: 25,
        shortBreak: 5,
        longBreak: 15,
        sessionsBeforeLongBreak: 4,
        bestFor: ["Whatever works for you"],
        tip: "Experiment and find what works best for your unique work style and energy patterns.",
        color: "#64748B",
    },
    // PSYCHEDELIC PRESETS
    {
        id: "dmt-trip",
        name: "DMT Breakthrough",
        icon: "👁️",
        description: "Intense 15m spiritual dive - Gamma/963Hz",
        focus: 15,
        shortBreak: 15, // Long integration
        longBreak: 60,
        sessionsBeforeLongBreak: 1,
        bestFor: ["Deep Meditation", "Ego Dissolution", "Spiritual Insight"],
        tip: "Usage: Eye mask required. Do not operate machinery. surrender to the experience.",
        color: "#D946EF", // Fuchshia
    },
    {
        id: "ayahuasca-journey",
        name: "Ayahuasca Spirit",
        icon: "🌿",
        description: "Deep 45m earth connection - Theta/432Hz",
        focus: 45,
        shortBreak: 20,
        longBreak: 60,
        sessionsBeforeLongBreak: 1,
        bestFor: ["Healing", "Emotional Release", "Nature Connection"],
        tip: "Purging (emotional) may occur. Breathe deeply. Trust the medicine (frequency).",
        color: "#166534", // Green
    },
    {
        id: "lsd-micro",
        name: "LSD Microdose",
        icon: "💠",
        description: "Sharp 50m creative focus - Alpha/Gamma",
        focus: 50,
        shortBreak: 10,
        longBreak: 30,
        sessionsBeforeLongBreak: 2,
        bestFor: ["Programming", "Complex Problem Solving", "Creative Flow"],
        tip: "Enhanced pattern recognition. Use for tasks requiring lateral thinking.",
        color: "#0EA5E9", // Sky Blue
    },
    {
        id: "mushroom-trip",
        name: "Mushroom Trip",
        icon: "🍄",
        description: "Playful 30m creative exploration - Theta/Alpha",
        focus: 30,
        shortBreak: 10,
        longBreak: 30,
        sessionsBeforeLongBreak: 2,
        bestFor: ["Brainstorming", "Art", "Idea Generation"],
        tip: "Dissolves boundaries. Let your mind wander. Good for visual thinking.",
        color: "#F43F5E", // Rose
    },
    {
        id: "astral-gate",
        name: "Astral Gate",
        icon: "🌌",
        description: "20m Out-of-body prep - Theta/Delta",
        focus: 20,
        shortBreak: 0,
        longBreak: 60,
        sessionsBeforeLongBreak: 1,
        bestFor: ["Lucid Dreaming", "OBE Practice", "Deep Rest"],
        tip: "Lie down. Do not move. Focus on the hypnagogic imagery.",
        color: "#4F46E5", // Indigo
    },
];

// Get preset by ID
export function getPreset(id: string): TimerPreset {
    return TIMER_PRESETS.find(p => p.id === id) || TIMER_PRESETS[0];
}

// Get preset recommendations based on time of day
export function getRecommendedPreset(): TimerPreset {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 10) {
        return getPreset("morning-power");
    } else if (hour >= 10 && hour < 14) {
        return getPreset("deep-work");
    } else if (hour >= 14 && hour < 17) {
        return getPreset("classic");
    } else if (hour >= 17 && hour < 20) {
        return getPreset("meeting-recovery");
    } else {
        return getPreset("evening-wind");
    }
}
