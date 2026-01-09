import { TrainingProfile, DEFAULT_PROFILE, AIKnowledge, AIExperience, AIRule } from "./types";

const STORAGE_KEY = "chronos_ai_training_profile";

class TrainingService {
    private profile: TrainingProfile;

    constructor() {
        this.profile = this.loadProfile();
    }

    private loadProfile(): TrainingProfile {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? { ...DEFAULT_PROFILE, ...JSON.parse(stored) } : DEFAULT_PROFILE;
    }

    private saveProfile() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
    }

    getProfile(): TrainingProfile {
        return this.profile;
    }

    updateIdentity(identity: Partial<TrainingProfile["identity"]>) {
        this.profile.identity = { ...this.profile.identity, ...identity };
        this.saveProfile();
    }

    updateRhythms(rhythms: Partial<TrainingProfile["rhythms"]>) {
        this.profile.rhythms = { ...this.profile.rhythms, ...rhythms };
        this.saveProfile();
    }

    addKnowledge(content: string, category: AIKnowledge["category"] = "fact") {
        const entry: AIKnowledge = {
            id: Date.now().toString(),
            category,
            content,
            lastUpdated: Date.now()
        };
        this.profile.knowledgeBase.push(entry);
        this.saveProfile();
        return entry;
    }

    removeKnowledge(id: string) {
        this.profile.knowledgeBase = this.profile.knowledgeBase.filter(k => k.id !== id);
        this.saveProfile();
    }

    // --- Experience Memory (Episodic) ---
    recordExperience(summary: string, sentiment: AIExperience["sentiment"] = "neutral", keyLearnings: string[] = []) {
        // Ensure array exists (migration safety)
        if (!this.profile.experiences) this.profile.experiences = [];

        const xp: AIExperience = {
            id: Date.now().toString(),
            summary,
            sentiment,
            keyLearnings,
            timestamp: Date.now()
        };
        this.profile.experiences.unshift(xp); // Newest first

        // Keep only last 50 experiences to save space
        if (this.profile.experiences.length > 50) {
            this.profile.experiences = this.profile.experiences.slice(0, 50);
        }

        this.saveProfile();
        console.log("[Memory] Recorded experience:", summary);
        return xp;
    }

    // --- Procedural Memory (Rules) ---
    addRule(rule: string, triggerContext: string = "general") {
        if (!this.profile.rules) this.profile.rules = [];

        const newRule: AIRule = {
            id: Date.now().toString(),
            rule,
            triggerContext,
            isActive: true
        };
        this.profile.rules.push(newRule);
        this.saveProfile();
        console.log("[Memory] Added rule:", rule);
        return newRule;
    }

    removeRule(id: string) {
        if (!this.profile.rules) return;
        this.profile.rules = this.profile.rules.filter(r => r.id !== id);
        this.saveProfile();
    }

    // Simple RAG simulation: Retrieve relevant context based on keywords
    // In a real implementation, this would use vector similarity
    getContext(query: string): string {
        if (!this.profile.knowledgeBase.length) return "";

        const keywords = query.toLowerCase().split(" ").filter(w => w.length > 3);
        const relevant = this.profile.knowledgeBase.filter(k =>
            keywords.some(w => k.content.toLowerCase().includes(w))
        );

        if (!relevant.length) return "";

        return `\n\nRELEVANT CONTEXT from User Memory:\n${relevant.map(k => `- ${k.content}`).join("\n")}`;
    }

    getFullSystemContext(): string {
        const { identity, rhythms, knowledgeBase, rules, experiences } = this.profile;

        // Safety checks for undefined arrays during migration
        const safeRules = rules || [];
        const safeExperiences = experiences || [];
        const safeKnowledge = knowledgeBase || [];

        const activeRules = safeRules.filter(r => r.isActive).map(r => `[${r.triggerContext.toUpperCase()}] ${r.rule}`).join("\n");
        const recentHistory = safeExperiences.slice(0, 3).map(e => `- ${new Date(e.timestamp).toLocaleDateString()}: ${e.summary}`).join("\n");

        return `
USER PROFILE:
Name: ${identity.name}
Role: ${identity.role}
Values: ${identity.coreValues.join(", ")}
Vision: ${identity.longTermVision}

WORK RHYTHMS:
Chronotype: ${rhythms.chronotype}
Preferred Duration: ${rhythms.preferredSessionDuration}m
Break Style: ${rhythms.breakStyle}

CORE KNOWLEDGE (FACTS):
${safeKnowledge.map(k => `- ${k.content}`).join("\n")}

BEHAVIORAL RULES (MUST FOLLOW):
${activeRules}

RECENT HISTORY (CONTEXT):
${recentHistory}
`;
    }
}

export const trainingService = new TrainingService();
