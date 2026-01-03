import { aiService } from "./AIService";
import { trainingService } from "../training/TrainingService";

export interface CoachContext {
    sessionsToday: number;
    currentSession: number;
    isRunning: boolean;
    timeLeft: string;
    timeOfDay: string;
    userEnergy?: "high" | "medium" | "low";
}

export interface CoachResponse {
    message: string;
    tone: "motivational" | "supportive" | "philosophical" | "practical";
    action?: {
        type: "suggest_break" | "suggest_music" | "end_session";
        data?: any;
    };
}

class CoachService {
    private conversationHistory: Array<{ role: string; content: string }> = [];

    private getPersonaPrompt(): string {
        const userProfile = trainingService.getFullSystemContext();

        return `You are Zenner Coach, an AI productivity partner integrated into the Zenner focus app.

CORE IDENTITY:
- Motivational accountability partner
- Friend, philosopher, and guide
- Stoic mindset: "Control what you can, accept what you cannot"
- Firm but empathetic - no excuses, but infinite patience
- Goal: Total self-mastery and execution

${userProfile}

COMMUNICATION STYLE:
- Direct, concise, powerful
- Use present tense, active voice
- Occasional emojis for emphasis (not decoration)
- Reference user's actual progress
- Never be generic or cheesy

PRINCIPLES:
1. Push user to limits, support when they stumble
2. Reframe setbacks with stoic wisdom
3. Celebrate wins genuinely
4. Build legacy through daily execution

Keep responses under 50 words unless elaboration is requested.`;
    }

    private buildContextString(context: CoachContext): string {
        return `Current State:
- Session #${context.currentSession}
- Sessions Today: ${context.sessionsToday}
- Time Left: ${context.timeLeft}
- Status: ${context.isRunning ? "FOCUSING" : "BREAK"}
- Time of Day: ${context.timeOfDay}
${context.userEnergy ? `- Energy: ${context.userEnergy}` : ""}`;
    }

    async getSessionStartMessage(context: CoachContext): Promise<string> {
        const isFirstToday = context.sessionsToday === 0;

        if (isFirstToday) {
            return "First one is always the hardest. Let's shatter that resistance. What are we building?";
        }

        const quickMessages = [
            `Session #${context.currentSession}. Let's go deeper than last time.`,
            "Back in the arena. Show me what you're made of.",
            "Locked in. Time to execute.",
            `${context.sessionsToday} down. This is where momentum builds.`
        ];

        return quickMessages[Math.floor(Math.random() * quickMessages.length)];
    }

    async getMidSessionCheckIn(): Promise<string> {
        const checkIns = [
            "Still locked in? Keep going. You're building something.",
            "Halfway there. The zone is real. Stay in it.",
            "Mind wandering? Bring it back. This is your work.",
            "Feeling it? This is what focus feels like. Lock it in."
        ];

        return checkIns[Math.floor(Math.random() * checkIns.length)];
    }

    async getSessionCompleteMessage(context: CoachContext): Promise<string> {
        const { sessionsToday } = context;

        if (sessionsToday >= 8) {
            return "Exceptional. You just stacked another win. Your discipline is undeniable. 🏆";
        }

        if (sessionsToday >= 4) {
            return `${sessionsToday} sessions. You're not playing around. Break time - you earned it.`;
        }

        if (sessionsToday === 1) {
            return "First one done. Momentum starts here. Next session will be easier.";
        }

        return `Session complete. That's ${sessionsToday} in the bank. Keep stacking wins.`;
    }

    async chat(userMessage: string, context: CoachContext): Promise<CoachResponse> {
        try {
            // Build context with RAG
            const ragContext = trainingService.getContext(userMessage);
            const contextString = this.buildContextString(context);

            const fullPrompt = `${contextString}

${ragContext ? `RELEVANT USER MEMORY:\n${ragContext}\n` : ""}

User: ${userMessage}`;

            // Add to conversation history
            this.conversationHistory.push({ role: "user", content: userMessage });

            const response = await aiService.chat(fullPrompt, {
                systemPrompt: this.getPersonaPrompt(),
                conversationHistory: this.conversationHistory.slice(-6) // Last 3 exchanges
            });

            // Add coach response to history
            if (response) {
                this.conversationHistory.push({ role: "assistant", content: response });
            }

            return {
                message: response || "I'm here. What do you need?",
                tone: this.detectTone(response || "")
            };
        } catch (error) {
            console.error("Coach chat error:", error);
            return {
                message: "I'm having trouble connecting. But I'm still here. What's on your mind?",
                tone: "supportive"
            };
        }
    }

    async getMotivation(context: CoachContext): Promise<string> {
        const { sessionsToday, isRunning } = context;

        if (isRunning) {
            const mid = [
                "You're in it. Don't stop now.",
                "This discomfort? That's growth. Push through.",
                "Every second you stay focused is a vote for who you're becoming.",
                "Distractions will wait. Your future won't."
            ];
            return mid[Math.floor(Math.random() * mid.length)];
        }

        if (sessionsToday === 0) {
            return "The hardest rep is the first one. Let's get it done.";
        }

        if (sessionsToday >= 4) {
            return "You're not average. This work proves it. Keep going.";
        }

        return "Momentum is real. You've started. Don't break the chain.";
    }

    async suggestBreak(duration: number): Promise<string> {
        if (duration <= 5) {
            return "Short break: Walk. Hydrate. Stretch. Eyes off screen. Reset.";
        }

        if (duration <= 15) {
            return "Proper break: Walk outside if you can. Hydrate. Let your brain decompress. No scrolling.";
        }

        return "Long break earned. Eat. Move. Rest. You've stacked wins. Recharge properly.";
    }

    private detectTone(message: string): "motivational" | "supportive" | "philosophical" | "practical" {
        const lower = message.toLowerCase();

        if (lower.includes("control") || lower.includes("accept") || lower.includes("stoic")) {
            return "philosophical";
        }

        if (lower.includes("let's") || lower.includes("try") || lower.includes("break")) {
            return "practical";
        }

        if (lower.includes("you're") || lower.includes("done") || lower.includes("win")) {
            return "motivational";
        }

        return "supportive";
    }

    clearHistory() {
        this.conversationHistory = [];
    }
}

export const coachService = new CoachService();
