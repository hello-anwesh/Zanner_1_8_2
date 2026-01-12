/**
 * Journal Prompt Service
 * Generates contextual writing prompts based on time of day, mood history, and session data
 */

import { journalService } from '../journal/JournalService';
import { databaseService } from '../db/DatabaseService';

export interface JournalPrompt {
    id: string;
    text: string;
    category: 'reflection' | 'gratitude' | 'planning' | 'emotion' | 'growth';
    icon: string;
}

// Time-based prompts
const MORNING_PROMPTS: JournalPrompt[] = [
    { id: 'm1', text: "What's your main intention for today?", category: 'planning', icon: '🎯' },
    { id: 'm2', text: "What are you grateful for this morning?", category: 'gratitude', icon: '🙏' },
    { id: 'm3', text: "How did you sleep and how are you feeling right now?", category: 'emotion', icon: '😴' },
    { id: 'm4', text: "What's one thing you want to accomplish before noon?", category: 'planning', icon: '⏰' },
    { id: 'm5', text: "What positive affirmation will guide you today?", category: 'growth', icon: '✨' },
];

const AFTERNOON_PROMPTS: JournalPrompt[] = [
    { id: 'a1', text: "What have you accomplished so far today?", category: 'reflection', icon: '📋' },
    { id: 'a2', text: "How is your energy level? Do you need a break?", category: 'emotion', icon: '⚡' },
    { id: 'a3', text: "What's been the highlight of your day so far?", category: 'reflection', icon: '🌟' },
    { id: 'a4', text: "Is anything blocking your progress?", category: 'planning', icon: '🚧' },
    { id: 'a5', text: "What's something kind you did for yourself today?", category: 'gratitude', icon: '💝' },
];

const EVENING_PROMPTS: JournalPrompt[] = [
    { id: 'e1', text: "What was your biggest win today?", category: 'reflection', icon: '🏆' },
    { id: 'e2', text: "What did you learn today?", category: 'growth', icon: '📚' },
    { id: 'e3', text: "What would you do differently tomorrow?", category: 'reflection', icon: '🔄' },
    { id: 'e4', text: "What are three things you're grateful for today?", category: 'gratitude', icon: '🙏' },
    { id: 'e5', text: "How are you feeling as the day ends?", category: 'emotion', icon: '🌙' },
];

const NIGHT_PROMPTS: JournalPrompt[] = [
    { id: 'n1', text: "What's on your mind as you wind down?", category: 'reflection', icon: '🌌' },
    { id: 'n2', text: "What was meaningful about today?", category: 'reflection', icon: '💫' },
    { id: 'n3', text: "Release any worry onto the page - what's bothering you?", category: 'emotion', icon: '☁️' },
    { id: 'n4', text: "What are you looking forward to tomorrow?", category: 'planning', icon: '🌅' },
    { id: 'n5', text: "Write a few words of self-compassion.", category: 'growth', icon: '💜' },
];

// Mood-specific prompts (when recent mood is tracked)
const STRUGGLING_PROMPTS: JournalPrompt[] = [
    { id: 's1', text: "What's weighing on you? Let it out here.", category: 'emotion', icon: '💭' },
    { id: 's2', text: "What's one small thing that could make today better?", category: 'planning', icon: '🌱' },
    { id: 's3', text: "What would you tell a friend going through this?", category: 'growth', icon: '💬' },
    { id: 's4', text: "What's ONE thing you can control right now?", category: 'planning', icon: '🎮' },
];

const GREAT_MOOD_PROMPTS: JournalPrompt[] = [
    { id: 'g1', text: "What's contributing to your great mood?", category: 'reflection', icon: '🔥' },
    { id: 'g2', text: "How can you share this positive energy?", category: 'growth', icon: '💫' },
    { id: 'g3', text: "What habits helped you feel this good?", category: 'reflection', icon: '📈' },
    { id: 'g4', text: "Capture this feeling - what would you tell future-you?", category: 'growth', icon: '✉️' },
];

// Session-aware prompts
const POST_SESSION_PROMPTS: JournalPrompt[] = [
    { id: 'ps1', text: "What did you accomplish in your focus sessions today?", category: 'reflection', icon: '🎯' },
    { id: 'ps2', text: "How did your focus feel? Any distractions?", category: 'reflection', icon: '🧠' },
    { id: 'ps3', text: "What's next on your priority list?", category: 'planning', icon: '📋' },
];

class JournalPromptService {

    /**
     * Get contextual prompts based on time, mood, and session data
     */
    async getPrompts(count: number = 3): Promise<JournalPrompt[]> {
        const allPrompts: JournalPrompt[] = [];

        // 1. Add time-based prompts
        const timePrompts = this.getTimeBasedPrompts();
        allPrompts.push(...timePrompts);

        // 2. Add mood-based prompts if recent mood data exists
        const moodPrompts = await this.getMoodBasedPrompts();
        allPrompts.push(...moodPrompts);

        // 3. Add session-based prompts if sessions done today
        const sessionPrompts = await this.getSessionBasedPrompts();
        allPrompts.push(...sessionPrompts);

        // Shuffle and return requested count
        const shuffled = this.shuffle(allPrompts);
        return shuffled.slice(0, count);
    }

    /**
     * Get prompts based on current time of day
     */
    private getTimeBasedPrompts(): JournalPrompt[] {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 12) {
            return MORNING_PROMPTS.slice(0, 2);
        } else if (hour >= 12 && hour < 17) {
            return AFTERNOON_PROMPTS.slice(0, 2);
        } else if (hour >= 17 && hour < 21) {
            return EVENING_PROMPTS.slice(0, 2);
        } else {
            return NIGHT_PROMPTS.slice(0, 2);
        }
    }

    /**
     * Get prompts based on recent mood patterns
     */
    private async getMoodBasedPrompts(): Promise<JournalPrompt[]> {
        try {
            const recentEntries = await journalService.getRecentEntries(3);

            if (recentEntries.length === 0) {
                return [];
            }

            // Count mood occurrences
            const moodCounts: Record<string, number> = {};
            recentEntries.forEach(entry => {
                if (entry.mood) {
                    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
                }
            });

            // If struggling or exhausted is prevalent
            const negativeCount = (moodCounts['struggling'] || 0) + (moodCounts['exhausted'] || 0);
            if (negativeCount >= 2) {
                return STRUGGLING_PROMPTS.slice(0, 1);
            }

            // If feeling great
            if ((moodCounts['amazing'] || 0) >= 2 || (moodCounts['good'] || 0) >= 2) {
                return GREAT_MOOD_PROMPTS.slice(0, 1);
            }

            return [];
        } catch (error) {
            console.error('[JournalPromptService] Failed to get mood prompts:', error);
            return [];
        }
    }

    /**
     * Get prompts based on session activity today
     */
    private async getSessionBasedPrompts(): Promise<JournalPrompt[]> {
        try {
            const db = await databaseService.getDb();
            const today = new Date().toISOString().split('T')[0];

            // Check if user completed any sessions today
            const sessions = await db.select<{ count: number }[]>(
                `SELECT COUNT(*) as count FROM sessions WHERE date(start_time/1000, 'unixepoch') = ?`,
                [today]
            );

            if (sessions && sessions.length > 0 && sessions[0].count > 0) {
                return POST_SESSION_PROMPTS.slice(0, 1);
            }

            return [];
        } catch (error) {
            // Sessions table might not exist yet
            console.warn('[JournalPromptService] Could not check sessions:', error);
            return [];
        }
    }

    /**
     * Get a specific category of prompts
     */
    getPromptsByCategory(category: JournalPrompt['category'], count: number = 3): JournalPrompt[] {
        const allPrompts = [
            ...MORNING_PROMPTS,
            ...AFTERNOON_PROMPTS,
            ...EVENING_PROMPTS,
            ...NIGHT_PROMPTS,
            ...STRUGGLING_PROMPTS,
            ...GREAT_MOOD_PROMPTS,
            ...POST_SESSION_PROMPTS,
        ];

        const filtered = allPrompts.filter(p => p.category === category);
        return this.shuffle(filtered).slice(0, count);
    }

    /**
     * Get a random prompt
     */
    getRandomPrompt(): JournalPrompt {
        const allPrompts = [
            ...MORNING_PROMPTS,
            ...AFTERNOON_PROMPTS,
            ...EVENING_PROMPTS,
            ...NIGHT_PROMPTS,
        ];

        return allPrompts[Math.floor(Math.random() * allPrompts.length)];
    }

    /**
     * Shuffle array
     */
    private shuffle<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

export const journalPromptService = new JournalPromptService();
