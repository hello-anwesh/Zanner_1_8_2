import { TrainingProfile, getDefaultProfile, AIKnowledge, AIExperience, AIRule } from "./types";
import { databaseService } from "../db/DatabaseService";

const LEGACY_STORAGE_KEY = "chronos_ai_training_profile";
const PROFILE_TABLE = "training_profile";

class TrainingService {
    private profile: TrainingProfile;
    private initialized = false;
    private initPromise: Promise<void> | null = null;

    constructor() {
        // Start with pre-seeded profile (includes all Zeni knowledge)
        this.profile = getDefaultProfile();

        // Load from localStorage if user has existing data
        this.loadFromLocalStorage();

        // Then async migrate/sync with SQLite in background
        this.init().catch(console.error);
    }

    private loadFromLocalStorage(): void {
        try {
            const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Merge with default profile, but prefer stored data if it exists
                // Keep pre-seeded knowledge if user hasn't added their own
                const defaultProfile = getDefaultProfile();

                this.profile = {
                    ...defaultProfile,
                    ...parsed,
                    // Merge knowledge: keep pre-seeded + user's custom knowledge
                    knowledgeBase: this.mergeKnowledge(
                        defaultProfile.knowledgeBase,
                        parsed.knowledgeBase || []
                    ),
                    // Merge rules: keep pre-seeded + user's custom rules
                    rules: this.mergeRules(
                        defaultProfile.rules,
                        parsed.rules || []
                    ),
                    // User experiences replace default (they're user-specific)
                    experiences: parsed.experiences || defaultProfile.experiences
                };
            }
        } catch (e) {
            console.warn("[TrainingService] Failed to load from localStorage:", e);
        }
    }

    /**
     * Merge pre-seeded knowledge with user's custom knowledge
     * Pre-seeded items have IDs starting with 'zeni_'
     */
    private mergeKnowledge(preSeeded: AIKnowledge[], userKnowledge: AIKnowledge[]): AIKnowledge[] {
        // Keep all pre-seeded knowledge
        const merged = [...preSeeded];

        // Add user's custom knowledge (items without 'zeni_' prefix)
        for (const item of userKnowledge) {
            if (!item.id.startsWith('zeni_')) {
                merged.push(item);
            }
        }

        return merged;
    }

    /**
     * Merge pre-seeded rules with user's custom rules
     */
    private mergeRules(preSeeded: AIRule[], userRules: AIRule[]): AIRule[] {
        // Keep all pre-seeded rules
        const merged = [...preSeeded];

        // Add user's custom rules (items without 'zeni_' prefix)
        for (const item of userRules) {
            if (!item.id.startsWith('zeni_')) {
                merged.push(item);
            }
        }

        return merged;
    }

    /**
     * Initialize SQLite storage and migrate if needed
     */
    async init(): Promise<void> {
        if (this.initialized) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = this._doInit();
        await this.initPromise;
    }

    private async _doInit(): Promise<void> {
        try {
            const db = await databaseService.getDb();

            // Create training profile table if not exists
            await db.execute(`
                CREATE TABLE IF NOT EXISTS ${PROFILE_TABLE} (
                    id TEXT PRIMARY KEY DEFAULT 'default',
                    profile_json TEXT NOT NULL,
                    updated_at INTEGER NOT NULL
                )
            `);

            // Check if we have data in SQLite
            const existing = await db.select<{ profile_json: string }[]>(
                `SELECT profile_json FROM ${PROFILE_TABLE} WHERE id = 'default'`
            );

            if (existing && existing.length > 0) {
                // SQLite has data - merge with default profile
                const defaultProfile = getDefaultProfile();
                const parsed = JSON.parse(existing[0].profile_json);
                const sqliteProfile = {
                    ...defaultProfile,
                    ...parsed,
                    // Merge knowledge: pre-seeded + stored
                    knowledgeBase: this.mergeKnowledge(
                        defaultProfile.knowledgeBase,
                        parsed.knowledgeBase || []
                    ),
                    // Merge rules: pre-seeded + stored
                    rules: this.mergeRules(
                        defaultProfile.rules,
                        parsed.rules || []
                    ),
                    experiences: parsed.experiences || defaultProfile.experiences
                };

                // Compare with localStorage - use whichever has more data
                const sqliteKnowledge = sqliteProfile.knowledgeBase?.length || 0;
                const localKnowledge = this.profile.knowledgeBase?.length || 0;
                const sqliteExperiences = sqliteProfile.experiences?.length || 0;
                const localExperiences = this.profile.experiences?.length || 0;

                if (sqliteKnowledge + sqliteExperiences >= localKnowledge + localExperiences) {
                    this.profile = sqliteProfile;
                    console.log("[TrainingService] Loaded from SQLite");
                } else {
                    // localStorage has more data - save to SQLite
                    await this.saveToSQLite();
                    console.log("[TrainingService] Migrated localStorage to SQLite (localStorage had more data)");
                }
            } else {
                // No SQLite data - migrate from localStorage
                await this.saveToSQLite();
                console.log("[TrainingService] Initial migration to SQLite complete");
            }

            // Also sync back to localStorage as backup
            this.saveToLocalStorage();

            this.initialized = true;
        } catch (error) {
            console.error("[TrainingService] SQLite init failed, using localStorage only:", error);
            this.initialized = true; // Mark as initialized even on failure
        }
    }

    private saveToLocalStorage(): void {
        try {
            localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(this.profile));
        } catch (e) {
            console.error("[TrainingService] localStorage save failed:", e);
        }
    }

    private async saveToSQLite(): Promise<void> {
        try {
            const db = await databaseService.getDb();
            const json = JSON.stringify(this.profile);
            const now = Date.now();

            await db.execute(
                `INSERT OR REPLACE INTO ${PROFILE_TABLE} (id, profile_json, updated_at) VALUES ('default', ?, ?)`,
                [json, now]
            );
        } catch (error) {
            console.error("[TrainingService] SQLite save failed:", error);
        }
    }

    private saveProfile(): void {
        // Save to localStorage immediately (sync)
        this.saveToLocalStorage();
        // Also save to SQLite (async, fire and forget)
        this.saveToSQLite().catch(console.error);
    }

    // --- PUBLIC API (all synchronous for backwards compatibility) ---

    getProfile(): TrainingProfile {
        return this.profile;
    }

    updateIdentity(identity: Partial<TrainingProfile["identity"]>): void {
        this.profile.identity = { ...this.profile.identity, ...identity };
        this.saveProfile();
    }

    updateRhythms(rhythms: Partial<TrainingProfile["rhythms"]>): void {
        this.profile.rhythms = { ...this.profile.rhythms, ...rhythms };
        this.saveProfile();
    }

    addKnowledge(content: string, category: AIKnowledge["category"] = "fact"): AIKnowledge {
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

    removeKnowledge(id: string): void {
        this.profile.knowledgeBase = this.profile.knowledgeBase.filter(k => k.id !== id);
        this.saveProfile();
    }

    // --- Experience Memory (Episodic) ---
    recordExperience(summary: string, sentiment: AIExperience["sentiment"] = "neutral", keyLearnings: string[] = []): AIExperience {
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
    addRule(rule: string, triggerContext: string = "general"): AIRule {
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

    removeRule(id: string): void {
        if (!this.profile.rules) return;
        this.profile.rules = this.profile.rules.filter(r => r.id !== id);
        this.saveProfile();
    }

    // Simple RAG simulation: Retrieve relevant context based on keywords
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

    // Force reload from storage
    async reload(): Promise<void> {
        this.initialized = false;
        this.initPromise = null;
        this.loadFromLocalStorage();
        await this.init();
    }
}

export const trainingService = new TrainingService();
