import { aiService } from "./AIService";
import { FOCUS_PLAYLISTS, BREAK_PLAYLISTS } from "../spotify/SpotifyService";
import { trainingService } from "../training/TrainingService";

export interface WorkContext {
    currentMode: "focus" | "shortBreak" | "longBreak";
    timeLeft: string;
    isRunning: boolean;
    sessionsToday: number;
    currentTime: string;
    streak?: number;
}

export interface SprintSuggestion {
    duration: number;
    reason: string;
}

export interface MusicSuggestion {
    playlistName: string;
    playlistUri: string;
    reason: string;
}

export interface BreakActivity {
    title: string;
    duration: number;
    type: "stretch" | "walk" | "breathe" | "hydrate" | "eyes" | "mindfulness";
    steps: string[];
    benefits: string;
}

export interface ProductivityInsight {
    summary: string;
    tips: string[];
    encouragement: string;
}

// Break activities library
export const BREAK_ACTIVITIES: BreakActivity[] = [
    {
        title: "Desk Stretches",
        duration: 3,
        type: "stretch",
        steps: [
            "🙆 Raise both arms overhead and stretch tall",
            "🔄 Roll your shoulders backward 5 times",
            "↔️ Tilt head left and right, hold 10 seconds each",
            "🤲 Stretch wrists by extending arms forward",
        ],
        benefits: "Relieves muscle tension from sitting",
    },
    {
        title: "Eye Rest (20-20-20)",
        duration: 1,
        type: "eyes",
        steps: [
            "👀 Look away from your screen",
            "🎯 Focus on something 20 feet away",
            "⏱️ Hold your gaze for 20 seconds",
            "😌 Blink rapidly 20 times",
        ],
        benefits: "Reduces eye strain and fatigue",
    },
    {
        title: "Box Breathing",
        duration: 2,
        type: "breathe",
        steps: [
            "📦 Breathe IN for 4 counts",
            "⏸️ HOLD for 4 counts",
            "💨 Breathe OUT for 4 counts",
            "⏸️ HOLD for 4 counts",
            "🔄 Repeat 4 times",
        ],
        benefits: "Calms the nervous system, improves focus",
    },
    {
        title: "Hydration Break",
        duration: 1,
        type: "hydrate",
        steps: [
            "🚶 Walk to get water",
            "💧 Drink a full glass slowly",
            "🧴 Optionally apply hand lotion",
            "🪟 Look out a window briefly",
        ],
        benefits: "Improves cognitive function and energy",
    },
    {
        title: "Quick Walk",
        duration: 5,
        type: "walk",
        steps: [
            "🚶 Stand up and stretch",
            "🚪 Walk around your space or outside",
            "🌱 Notice 3 things you see",
            "🔙 Return feeling refreshed",
        ],
        benefits: "Boosts circulation and creativity",
    },
    {
        title: "Mindful Minute",
        duration: 1,
        type: "mindfulness",
        steps: [
            "🧘 Close your eyes",
            "👃 Take 3 deep breaths",
            "🎯 Focus on present sensations",
            "😌 Release any tension",
        ],
        benefits: "Reduces stress, improves mental clarity",
    },
];

// Motivational messages
const MOTIVATIONAL_MESSAGES = [
    "You're doing amazing! Every focused minute counts. 🌟",
    "Small progress is still progress. Keep going! 💪",
    "Your future self will thank you for this focused session. ⏰",
    "Deep work builds exceptional skills. You're investing in yourself. 📈",
    "Distractions can wait. Your goals can't. 🎯",
    "You've already started - that's the hardest part! 🚀",
    "Focus is a muscle. You're making it stronger right now. 💪",
    "This moment of concentration is creating your future success. ✨",
    "Breathe. Focus. Execute. You've got this! 🧘",
    "Every completed session is a victory. Celebrate it! 🎉",
];

class ProductivityAIClass {
    private getSystemPrompt(type: "coach" | "music" | "break" | "motivation"): string {
        const userContext = trainingService.getFullSystemContext();
        const basePrompt = `You are Chronos, an advanced AI productivity coach.
${userContext}

Your goal is to optimize the user's flow state based on their profile above.`;
        const prompts = {
            coach: `${basePrompt}
specializing in the Pomodoro technique and deep work.
Your role is to help users optimize their focus sessions.
Be encouraging but concise. Use emojis sparingly.
Consider: time of day, session count, energy levels.
Keep responses under 100 words.`,

            music: `You are a focus music curator.
Suggest appropriate music based on the user's task and energy level.
You have access to these Spotify playlists:
${FOCUS_PLAYLISTS.map(p => `- ${p.name}: ${p.description}`).join("\n")}
${BREAK_PLAYLISTS.map(p => `- ${p.name}: ${p.description}`).join("\n")}
Keep responses concise and actionable.`,

            break: `You are a wellness coach specializing in work breaks.
Suggest appropriate break activities based on duration and user's state.
Activities should be doable at a desk or nearby.
Include specific steps and duration.
Be encouraging and health-focused.`,

            motivation: `You are an encouraging productivity partner.
Provide short, powerful motivational messages.
Be genuine, not cheesy. Use occasional emojis.
Reference the user's progress when relevant.
Keep messages under 50 words.`,
        };
        return prompts[type];
    }

    async getMotivationalMessage(context: WorkContext): Promise<string> {
        // Fast path: return a random pre-written message
        if (Math.random() > 0.5) {
            return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
        }

        // AI-generated message for variety
        try {
            const prompt = `Give a short motivational message for someone who:
- Has completed ${context.sessionsToday} focus sessions today
- Is currently ${context.isRunning ? "in a focus session" : "on a break"}
- Time: ${context.currentTime}
Keep it under 30 words, be genuine and encouraging.`;

            const response = await aiService.chat(prompt, {
                systemPrompt: this.getSystemPrompt("motivation"),
                skipHistory: true
            });
            return response || MOTIVATIONAL_MESSAGES[0];
        } catch {
            return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
        }
    }

    async suggestBreakActivity(durationMinutes: number): Promise<BreakActivity> {
        // Filter activities by duration
        const suitable = BREAK_ACTIVITIES.filter(a => a.duration <= durationMinutes);

        if (suitable.length === 0) {
            return BREAK_ACTIVITIES[0]; // Default to stretches
        }

        // Return a random suitable activity
        return suitable[Math.floor(Math.random() * suitable.length)];
    }

    async suggestMusic(context: WorkContext): Promise<MusicSuggestion> {
        const hour = new Date().getHours();
        const isEvening = hour >= 18 || hour < 6;
        const isMorning = hour >= 6 && hour < 12;

        if (context.currentMode === "focus") {
            // Suggest focus music
            let playlistIndex = 0;

            if (isEvening) {
                playlistIndex = 1; // Lo-Fi Beats for evening
            } else if (isMorning) {
                playlistIndex = 3; // Brain Food for morning
            } else if (context.sessionsToday > 3) {
                playlistIndex = 2; // Peaceful Piano when tired
            }

            const playlist = FOCUS_PLAYLISTS[playlistIndex];
            return {
                playlistName: playlist.name,
                playlistUri: playlist.uri,
                reason: `${playlist.mood} ${playlist.description} - perfect for ${isEvening ? "evening" : isMorning ? "morning" : "afternoon"} focus.`,
            };
        } else {
            // Suggest break music
            const playlist = BREAK_PLAYLISTS[Math.floor(Math.random() * BREAK_PLAYLISTS.length)];
            return {
                playlistName: playlist.name,
                playlistUri: playlist.uri,
                reason: `${playlist.mood} ${playlist.description} - great for recharging.`,
            };
        }
    }

    async getSprintAdvice(context: WorkContext): Promise<string> {
        const hour = new Date().getHours();

        // Simple heuristics for quick responses
        if (context.sessionsToday >= 8) {
            return "🎉 Amazing work today! You've completed 8+ sessions. Consider wrapping up and recharging for tomorrow.";
        }

        if (hour >= 21) {
            return "🌙 It's getting late. If you need to continue, shorter 15-min sprints might work better now.";
        }

        if (context.sessionsToday === 0) {
            return "🚀 Ready for your first session! Start with 25 minutes. You've got this!";
        }

        if (context.sessionsToday >= 4 && context.sessionsToday < 8) {
            return "💪 Great progress! You're in the zone. Consider a longer break soon to maintain quality.";
        }

        return `📊 ${context.sessionsToday} sessions complete. Keep the momentum going with another focused sprint!`;
    }

    async analyzeProductivity(sessionsToday: number, streak: number): Promise<ProductivityInsight> {
        let summary: string;
        let encouragement: string;
        const tips: string[] = [];

        if (sessionsToday === 0) {
            summary = "Ready to start your productivity journey today!";
            encouragement = "Every expert was once a beginner. Let's get that first session done! 🎯";
            tips.push("Start with a clear, specific task in mind");
            tips.push("Remove phone and distractions before starting");
        } else if (sessionsToday < 4) {
            summary = `Good start with ${sessionsToday} session${sessionsToday > 1 ? "s" : ""} today.`;
            encouragement = "You're building momentum. Keep it up! 📈";
            tips.push("Try to reach 4 sessions for a solid day");
            tips.push("Take real breaks - step away from screen");
        } else if (sessionsToday < 8) {
            summary = `Strong day! ${sessionsToday} focused sessions completed.`;
            encouragement = "You're in the productivity sweet spot! 🌟";
            tips.push("Maintain energy with a short walk or stretch");
            tips.push("Stay hydrated for optimal brain function");
        } else {
            summary = `Exceptional! ${sessionsToday} sessions is outstanding work.`;
            encouragement = "You've earned rest. Tomorrow starts fresh! 🏆";
            tips.push("Consider stopping soon to avoid burnout");
            tips.push("Celebrate this win - you deserve it");
        }

        if (streak > 1) {
            encouragement += ` ${streak}-day streak! 🔥`;
        }

        return { summary, tips, encouragement };
    }

    // Quick AI chat for custom queries
    async chat(message: string, context: WorkContext): Promise<string> {
        const contextString = `User context: ${context.sessionsToday} sessions today, currently ${context.isRunning ? "focusing" : "on break"}, time: ${context.currentTime}`;

        try {
            const response = await aiService.chat(
                `${contextString}\n\nUser: ${message}`,
                {
                    systemPrompt: this.getSystemPrompt("coach"),
                    skipHistory: true
                }
            );
            return response || "I'm here to help! What would you like to know about productivity?";
        } catch {
            return "I'm having trouble connecting. Try checking your AI provider settings.";
        }
    }
}

export const productivityAI = new ProductivityAIClass();
