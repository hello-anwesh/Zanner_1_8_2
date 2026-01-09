import { aiService } from "./AIService";
import { trainingService } from "../training/TrainingService";
import { databaseService } from "../db/DatabaseService";
import { ragService } from "./RAGService";
import { journalService } from "../journal/JournalService";

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

    private async getAdvancedPersonaPrompt(analytics?: any): Promise<string> {
        const fullMemoryContext = trainingService.getFullSystemContext();
        const journalContext = await journalService.getContextForAI(3);

        // Time-based context
        const hour = new Date().getHours();
        let timeContext = '';
        if (hour >= 6 && hour < 12) timeContext = "Morning - fresh start";
        else if (hour >= 12 && hour < 17) timeContext = "Afternoon - mid-day energy";
        else if (hour >= 17 && hour < 21) timeContext = "Evening - winding down";
        else timeContext = "Night - consider rest soon";

        let analyticsContext = '';
        if (analytics) {
            analyticsContext = `\nSESSION STATS TODAY:\nSessions: ${analytics.sessionsToday || 0}\nCompleted: ${analytics.completed || 0} | Abandoned: ${analytics.abandoned || 0}`;
        }

        return `You are Zeni - an advanced AI productivity companion.

CORE INTELLIGENCE:
- You are highly context-aware, following the user's Behavioral Rules and Memory explicitly.
- You remember patterns, learn from interactions, and provide genuinely helpful insights
- You're not just motivational - you're strategic, analytical, and deeply understanding

${fullMemoryContext}

${journalContext}

CURRENT CONTEXT:
- Time Phase: ${timeContext}
${analyticsContext}

TONE GUIDELINES:
- Morning (6-12): Energetic, ready to tackle the day
- Afternoon (12-17): Supportive, acknowledge energy dips
- Evening (17-21): Calm, reflective
- Night (21+): Gentle, suggest winding down

SMART RESPONSES:
- If abandoned sessions high → Ask what's distracting them, suggest environment changes
- If streak is strong → Celebrate specifically ("5 unbroken sessions! Your focus is incredible")
- If late night → Gently suggest rest unless they're on a roll
- If first session → Set the tone based on their goals for the day

DO NOT:
- Give generic "you can do it!" messages
- Ignore the training data
- Be overly formal unless trained to be
- Make assumptions - ask clarifying questions when needed
- Ever address the user as "User"

Remember: You're not just a cheerleader. You're an intelligent system that genuinely helps them optimize their work.`;
    }

    private buildContextString(context: CoachContext): string {
        return `Current State:
- Session: #${context.currentSession} (${context.sessionsToday} today)
- Status: ${context.isRunning ? "ACTIVE FOCUS" : "BREAK/IDLE"}
- Time Left: ${context.timeLeft}
- Time: ${context.timeOfDay}
${context.userEnergy ? `- Energy Level: ${context.userEnergy}` : ""}`;
    }

    async getSessionStartMessage(context: CoachContext): Promise<string> {
        const profile = trainingService.getProfile();
        const isFirstToday = context.sessionsToday === 0;
        const name = profile.identity.name || 'friend';

        // Intelligent session start based on context
        if (isFirstToday) {
            const greetings = [
                `Hey ${name}! Ready to make today count?`,
                `What's up! What are we building today?`,
                `Let's go. What's the mission today?`,
                `Ready to crush some work?`,
                `Morning! Let's turn ideas into reality.`
            ];

            if (profile.identity.longTermVision) {
                return `${greetings[0].split('!')[0]}! Working toward ${profile.identity.longTermVision.split('.')[0]} today?`;
            }
            return greetings[Math.floor(Math.random() * greetings.length)];
        }

        // If they're on a streak
        if (context.sessionsToday >= 4) {
            return `${context.sessionsToday} sessions deep. You're absolutely killing it today. Keep going.`;
        }

        // Default intelligent message
        const messages = [
            `Back at it. What's next on the list?`,
            `Session ${context.currentSession}. Let's lock in.`,
            `${context.sessionsToday} done. You're building momentum.`,
            `Ready when you are. What's the focus?`
        ];

        return messages[Math.floor(Math.random() * messages.length)];
    }

    async getMidSessionCheckIn(): Promise<string> {
        const checkIns = [
            "Still focused? You're doing great.",
            "Halfway through. How's the flow?",
            "Need anything? I'm here if you do.",
            "Keep going. You've got this."
        ];

        return checkIns[Math.floor(Math.random() * checkIns.length)];
    }

    async getSessionCompleteMessage(context: CoachContext): Promise<string> {
        const { sessionsToday } = context;

        if (sessionsToday >= 8) {
            return "8 sessions! That's exceptional. Seriously consider a longer break - you've earned it.";
        }

        if (sessionsToday >= 6) {
            return `${sessionsToday} sessions complete. You're absolutely crushing it today.`;
        }

        if (sessionsToday >= 4) {
            return `Session ${sessionsToday} done. Solid progress. How are you feeling?`;
        }

        return "Session complete. Nice work. Ready to continue or take a break?";
    }

    async chat(userMessage: string, context: CoachContext): Promise<CoachResponse> {
        try {
            // Fetch real-time analytics
            let analytics = null;
            try {
                analytics = await databaseService.getAnalyticsSummary();
            } catch (e) {
                console.warn("Failed to fetch analytics for chat context", e);
            }

            // Retrieve Context (Hybrid - RAG + Training Memory)
            const memoryContext = trainingService.getContext(userMessage);
            const ragContext = await ragService.retrieve(userMessage);
            const contextString = this.buildContextString(context);

            // Build enhanced prompt with all context
            const fullPrompt = `${contextString}

${memoryContext ? `RELEVANT USER MEMORY:\n${memoryContext}\n` : ""}

${ragContext ? `KNOWLEDGE BASE:\n${ragContext}\n` : ""}

User Message: "${userMessage}"

Provide an intelligent, contextual response. Be helpful, concise, and specific to their situation.`;

            // Add to conversation history
            this.conversationHistory.push({ role: "user", content: userMessage });

            const response = await aiService.chat(fullPrompt, {
                systemPrompt: await this.getAdvancedPersonaPrompt(analytics),
                conversationHistory: this.conversationHistory.slice(-10) // Last 5 exchanges
            });

            // Add coach response to history
            if (response) {
                this.conversationHistory.push({ role: "assistant", content: response });
                // Trigger Background Memory Consolidation
                this.analyzeInteraction(userMessage, response);
            }

            return {
                message: response || "I'm here. What do you need?",
                tone: this.detectTone(response || "")
            };
        } catch (error) {
            console.error("Coach chat error:", error);
            // RAW ERROR MODE - requested by user
            const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
            return {
                message: `[SYSTEM ERROR]: ${errorMessage}`,
                tone: "practical"
            };
        }
    }

    async getMotivation(context: CoachContext): Promise<string> {
        const { sessionsToday, isRunning } = context;
        const profile = trainingService.getProfile();

        if (isRunning) {
            return `Stay locked in. You're making progress on ${profile.identity.longTermVision ? 'your vision' : 'your goals'}.`;
        }

        if (sessionsToday === 0) {
            return "First session is always the hardest. Let's start.";
        }

        if (sessionsToday >= 4) {
            return `${sessionsToday} sessions today. You're unstoppable.`;
        }

        return "Ready to continue? You've got momentum going.";
    }

    async suggestBreak(duration: number): Promise<string> {
        if (duration <= 5) {
            return "Quick 5-minute break. Stretch, hydrate, come back fresh.";
        }

        if (duration <= 15) {
            return "Take a real break. Step away from the screen. 15 minutes will help you refocus.";
        }

        return "You've been grinding. Take at least 20-30 minutes. Walk, eat, reset properly.";
    }

    private detectTone(message: string): "motivational" | "supportive" | "philosophical" | "practical" {
        const lower = message.toLowerCase();

        if (lower.includes("vision") || lower.includes("growth") || lower.includes("journey")) {
            return "philosophical";
        }

        if (lower.includes("try") || lower.includes("break") || lower.includes("suggest")) {
            return "practical";
        }

        if (lower.includes("crushing") || lower.includes("amazing") || lower.includes("keep")) {
            return "motivational";
        }

        return "supportive";
    }

    async analyzeInteraction(lastUserMessage: string, lastAssistantMessage: string) {
        // Run in background - do not block UI
        setTimeout(async () => {
            try {
                const profile = trainingService.getProfile();

                const prompt = `
ANALYZE THIS INTERACTION for the User Profile.
User: "${lastUserMessage}"
AI: "${lastAssistantMessage}"

EXTRACT:
1. New Facts (e.g., Project names, specific goals, constraints)
2. User Preferences (e.g., likes short answers, focused on aesthetics)
3. Sentiment (Positive/Neutral/Negative)

Existing Knowledge to avoid duplicates:
${profile.knowledgeBase.map(k => k.content).join('; ')}

Return JSON ONLY:
{
  "newFacts": ["fact1", "fact2"],
  "preferences": ["pref1"],
  "sentiment": "positive"|"neutral"|"negative",
  "summary": "One sentence summary of this interaction"
}
`;
                const analysis = await aiService.chat(prompt, {
                    systemPrompt: "You are a background memory consolidation agent. Output strictly valid JSON."
                });

                // Parse JSON safely
                const jsonMatch = analysis.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const data = JSON.parse(jsonMatch[0]);

                    // 1. Record Experience
                    trainingService.recordExperience(data.summary, data.sentiment, [...data.newFacts, ...data.preferences]);

                    // 2. Add New Knowledge (Facts)
                    if (data.newFacts && Array.isArray(data.newFacts)) {
                        data.newFacts.forEach((fact: string) => {
                            trainingService.addKnowledge(fact, "fact");
                        });
                    }

                    // 3. Add Preferences as Rules (Simple heuristic for now)
                    if (data.preferences && Array.isArray(data.preferences)) {
                        data.preferences.forEach((pref: string) => {
                            trainingService.addRule(pref, "learned_preference");
                        });
                    }

                    console.log("[Coach Analysis] Learned:", data);
                }

            } catch (e) {
                console.warn("[Coach Analysis] Failed:", e);
            }
        }, 1000); // 1s delay
    }

    clearHistory() {
        this.conversationHistory = [];
    }
}

export const coachService = new CoachService();
