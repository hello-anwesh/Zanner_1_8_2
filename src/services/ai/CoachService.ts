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
        const userProfile = trainingService.getFullSystemContext();
        const profile = trainingService.getProfile();

        // Get user's custom knowledge base and rules
        const knowledgeBase = profile.knowledgeBase.map(kb => `- ${kb.content}`).join('\n');
        const hasCustomKnowledge = profile.knowledgeBase.length > 0;

        // Get journal context
        const journalContext = await journalService.getContextForAI(3);

        // Analytics context
        let analyticsContext = '';
        if (analytics) {
            analyticsContext = `Sessions Today: ${analytics.sessionsToday || 0}
Completed: ${analytics.completed || 0} | Abandoned: ${analytics.abandoned || 0}`;
        }

        // Time-based context
        const hour = new Date().getHours();
        let timeContext = '';
        if (hour >= 6 && hour < 12) timeContext = "Morning - fresh start";
        else if (hour >= 12 && hour < 17) timeContext = "Afternoon - mid-day energy";
        else if (hour >= 17 && hour < 21) timeContext = "Evening - winding down";
        else timeContext = "Night - consider rest soon";

        return `You are Zeni - an advanced AI productivity companion.

CORE INTELLIGENCE:
- You are highly context-aware, adapting your personality and responses based on user training
- You remember patterns, learn from interactions, and provide genuinely helpful insights
- You're not just motivational - you're strategic, analytical, and deeply understanding

USER PROFILE:
Name: ${profile.identity.name || 'Friend'}
Role: ${profile.identity.role || 'Professional'}
Vision: ${profile.identity.longTermVision || 'Not set'}
Values: ${profile.identity.coreValues.join(', ') || 'None set'}
Energy Type: ${profile.rhythms.chronotype}
Preferred Session: ${profile.rhythms.preferredSessionDuration} minutes
Break Style: ${profile.rhythms.breakStyle}

${hasCustomKnowledge ? `
WHAT YOU KNOW ABOUT THE USER:
${knowledgeBase}
` : ''}

${journalContext}

CURRENT CONTEXT:
- Time: ${timeContext}
${analyticsContext}

BEHAVIORAL RULES:
1. **Adapt to Training**: If user trained you with specific personality rules, FOLLOW THEM EXACTLY
2. **Be Contextual**: Use analytics to provide intelligent insights ("You've abandoned 3 today - what's blocking you?")
3. **Be Concise**: Default to 1-2 sentences unless asked for detail. ENSURE COMPLETE SENTENCES.
4. **Be Proactive**: Suggest breaks, music, or strategy shifts based on patterns
5. **Be Real**: No generic motivation. Use their name (if known, otherwise no name or 'friend' - NEVER 'User'), reference their actual work.
6. **Use Their Data**: Reference session counts, times, patterns - show you're paying attention
7. **Respect Their Goals**: Align suggestions with their long-term vision and values

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
            }

            return {
                message: response || "I'm here. What do you need?",
                tone: this.detectTone(response || "")
            };
        } catch (error) {
            console.error("Coach chat error:", error);
            return {
                message: "Having trouble connecting. Try again in a moment?",
                tone: "supportive"
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

    clearHistory() {
        this.conversationHistory = [];
    }
}

export const coachService = new CoachService();
