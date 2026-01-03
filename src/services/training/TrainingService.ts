import { TrainingProfile, DEFAULT_PROFILE, AIKnowledge } from "./types";

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
        const { identity, rhythms } = this.profile;
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

CORE KNOWLEDGE:
${this.profile.knowledgeBase.map(k => `- ${k.content}`).join("\n")}
`;
    }
}

export const trainingService = new TrainingService();
