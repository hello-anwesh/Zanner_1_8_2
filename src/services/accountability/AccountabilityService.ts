/**
 * Accountability & Discipline Tracking Service
 * The spiritual accountability partner that keeps you honest
 */

export interface DailyCommitment {
    date: string; // YYYY-MM-DD
    targetSessions: number;
    completedSessions: number;
    skippedSessions: number;
    pausedMidSession: number;
    intentions: string[];
    reflections?: string;
    disciplineScore: number; // 0-100
}

export interface WeeklyReview {
    weekStart: string;
    weekEnd: string;
    totalCommitted: number;
    totalCompleted: number;
    consistencyScore: number; // 0-100
    insights: string[];
    breakthroughs: string[];
    obstacles: string[];
}

const STORAGE_KEY = "chronos_accountability";

interface AccountabilityStore {
    dailyCommitments: Record<string, DailyCommitment>;
    weeklyReviews: WeeklyReview[];
    currentStreak: number;
    longestStreak: number;
    totalSessions: number;
}

class AccountabilityService {
    private store: AccountabilityStore;

    constructor() {
        this.store = this.loadStore();
    }

    private loadStore(): AccountabilityStore {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) return JSON.parse(data);
        } catch (e) {
            console.error("Failed to load accountability store:", e);
        }

        return {
            dailyCommitments: {},
            weeklyReviews: [],
            currentStreak: 0,
            longestStreak: 0,
            totalSessions: 0
        };
    }

    private saveStore(): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store));
        } catch (e) {
            console.error("Failed to save accountability store:", e);
        }
    }

    private getTodayKey(): string {
        return new Date().toISOString().split("T")[0];
    }

    /**
     * Set daily commitment (morning intention)
     */
    setDailyCommitment(targetSessions: number, intentions: string[]): DailyCommitment {
        const key = this.getTodayKey();

        const commitment: DailyCommitment = {
            date: key,
            targetSessions,
            completedSessions: this.store.dailyCommitments[key]?.completedSessions || 0,
            skippedSessions: 0,
            pausedMidSession: 0,
            intentions,
            disciplineScore: 100
        };

        this.store.dailyCommitments[key] = commitment;
        this.saveStore();
        return commitment;
    }

    /**
     * Record completed session
     */
    recordSessionComplete(): void {
        const key = this.getTodayKey();
        const commitment = this.store.dailyCommitments[key];

        if (commitment) {
            commitment.completedSessions++;
            this.recalculateDisciplineScore(commitment);
        } else {
            // No commitment set, create minimal one
            this.store.dailyCommitments[key] = {
                date: key,
                targetSessions: 0,
                completedSessions: 1,
                skippedSessions: 0,
                pausedMidSession: 0,
                intentions: [],
                disciplineScore: 50
            };
        }

        this.store.totalSessions++;
        this.updateStreak();
        this.saveStore();
    }

    /**
     * Record skip/pause
     */
    recordSessionPaused(): void {
        const key = this.getTodayKey();
        const commitment = this.store.dailyCommitments[key];

        if (commitment) {
            commitment.pausedMidSession++;
            this.recalculateDisciplineScore(commitment);
            this.saveStore();
        }
    }

    /**
     * Recalculate discipline score (0-100)
     */
    private recalculateDisciplineScore(commitment: DailyCommitment): void {
        let score = 100;

        // Compare committed vs actual
        if (commitment.targetSessions > 0) {
            const completionRate = commitment.completedSessions / commitment.targetSessions;
            score = Math.round(completionRate * 100);
        }

        // Penalize pauses
        score -= commitment.pausedMidSession * 5;

        // Penalize skips
        score -= commitment.skippedSessions * 10;

        commitment.disciplineScore = Math.max(0, Math.min(100, score));
    }

    /**
     * Update streak tracking
     */
    private updateStreak(): void {
        const today = this.getTodayKey();
        const todayCommitment = this.store.dailyCommitments[today];

        if (todayCommitment && todayCommitment.completedSessions > 0) {
            this.store.currentStreak++;

            if (this.store.currentStreak > this.store.longestStreak) {
                this.store.longestStreak = this.store.currentStreak;
            }
        }
    }

    /**
     * Get today's commitment vs reality
     */
    getTodayAccountability(): {
        committed: number;
        completed: number;
        remaining: number;
        score: number;
        status: "on-track" | "behind" | "ahead" | "no-commitment";
    } {
        const today = this.store.dailyCommitments[this.getTodayKey()];

        if (!today || today.targetSessions === 0) {
            return {
                committed: 0,
                completed: today?.completedSessions || 0,
                remaining: 0,
                score: 0,
                status: "no-commitment"
            };
        }

        const remaining = Math.max(0, today.targetSessions - today.completedSessions);
        let status: "on-track" | "behind" | "ahead" = "on-track";

        if (today.completedSessions >= today.targetSessions) {
            status = "ahead";
        } else if (today.completedSessions < today.targetSessions / 2) {
            const hour = new Date().getHours();
            if (hour > 18) status = "behind";
        }

        return {
            committed: today.targetSessions,
            completed: today.completedSessions,
            remaining,
            score: today.disciplineScore,
            status
        };
    }

    /**
     * Get accountability message (coach uses this)
     */
    getAccountabilityMessage(): string {
        const { committed, completed, remaining, status } = this.getTodayAccountability();

        if (status === "no-commitment") {
            return "No commitment made today. What's your target?";
        }

        if (status === "ahead") {
            return `You committed to ${committed}. You've done ${completed}. That's execution. 🔥`;
        }

        if (status === "behind") {
            return `You said ${committed} sessions. You've done ${completed}. ${remaining} left. What got in the way?`;
        }

        return `${completed}/${committed} complete. ${remaining} to go. Stay locked in.`;
    }

    /**
     * Daily reflection (end of day)
     */
    addDailyReflection(reflection: string): void {
        const key = this.getTodayKey();
        const commitment = this.store.dailyCommitments[key];

        if (commitment) {
            commitment.reflections = reflection;
            this.saveStore();
        }
    }

    /**
     * Get streak info
     */
    getStreakInfo(): {
        current: number;
        longest: number;
        total: number;
    } {
        return {
            current: this.store.currentStreak,
            longest: this.store.longestStreak,
            total: this.store.totalSessions
        };
    }

    /**
     * Generate weekly review data
     */
    generateWeeklyReview(): WeeklyReview {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 6);

        const weekCommitments = Object.values(this.store.dailyCommitments).filter(c => {
            const date = new Date(c.date);
            return date >= weekStart && date <= now;
        });

        const totalCommitted = weekCommitments.reduce((sum, c) => sum + c.targetSessions, 0);
        const totalCompleted = weekCommitments.reduce((sum, c) => sum + c.completedSessions, 0);
        const avgDiscipline = weekCommitments.reduce((sum, c) => sum + c.disciplineScore, 0) / weekCommitments.length;

        return {
            weekStart: weekStart.toISOString().split("T")[0],
            weekEnd: now.toISOString().split("T")[0],
            totalCommitted,
            totalCompleted,
            consistencyScore: Math.round(avgDiscipline),
            insights: [],
            breakthroughs: [],
            obstacles: []
        };
    }
}

export const accountabilityService = new AccountabilityService();
