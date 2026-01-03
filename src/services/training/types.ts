export interface UserIdentity {
    name: string;
    role: string;
    coreValues: string[];
    longTermVision: string;
    motivationTriggers: string[];
}

export interface WorkRhythm {
    chronotype: "lion" | "bear" | "wolf" | "dolphin";
    peakEnergyHours: number[]; // 0-23
    preferredSessionDuration: number; // minutes
    breakStyle: "active" | "restful" | "meditative";
}

export interface GoalMetric {
    id: string;
    label: string;
    target: number;
    unit: string;
    current: number;
}

export interface AIKnowledge {
    id: string;
    category: "preference" | "fact" | "rule";
    content: string;
    embedding?: number[]; // Placeholder for future vector search
    lastUpdated: number;
}

export interface TrainingProfile {
    identity: UserIdentity;
    rhythms: WorkRhythm;
    goals: GoalMetric[];
    knowledgeBase: AIKnowledge[];
}

export const DEFAULT_PROFILE: TrainingProfile = {
    identity: {
        name: "User",
        role: "Visionary",
        coreValues: ["Growth", "Focus", "Flow"],
        longTermVision: "",
        motivationTriggers: ["Progress", "Mastery"]
    },
    rhythms: {
        chronotype: "bear",
        peakEnergyHours: [9, 10, 11, 14, 15, 16],
        preferredSessionDuration: 25,
        breakStyle: "active"
    },
    goals: [
        { id: "g1", label: "Focus Hours", target: 40, unit: "h/week", current: 12 },
        { id: "g2", label: "Deep Work Streak", target: 7, unit: "days", current: 3 }
    ],
    knowledgeBase: []
};
