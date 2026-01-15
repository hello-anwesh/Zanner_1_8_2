/**
 * Journal AI Service
 * AI-powered journal analysis, reflection, and insights
 */

import { aiService } from '../ai/AIService';
import { JournalEntry } from '../journal/JournalService';

export interface JournalReflection {
    summary: string;
    patterns: string[];
    emotions: {
        primary: string;
        secondary?: string;
        intensity: 'low' | 'medium' | 'high';
    };
    insights: string[];
    affirmation: string;
    suggestions: string[];
}

export interface WeeklyInsight {
    weekStart: string;
    weekEnd: string;
    entriesCount: number;
    moodTrend: 'improving' | 'stable' | 'declining' | 'varied';
    themes: string[];
    summary: string;
    highlights: string[];
    challenges: string[];
    encouragement: string;
}

class JournalAIService {

    /**
     * Get AI reflection on a single journal entry
     */
    async getReflection(entry: JournalEntry): Promise<JournalReflection> {
        const prompt = `Analyze this journal entry and provide supportive reflection.

JOURNAL ENTRY:
Date: ${entry.date}
Mood: ${entry.mood || 'not specified'}
Content: ${entry.content}

Respond in this exact JSON format:
{
    "summary": "A 1-2 sentence summary of what the user wrote about",
    "patterns": ["Pattern or theme 1", "Pattern or theme 2"],
    "emotions": {
        "primary": "Main emotion detected (e.g., hopeful, anxious, content)",
        "secondary": "Secondary emotion if present",
        "intensity": "low, medium, or high"
    },
    "insights": ["Insight 1 about their thoughts/situation", "Insight 2"],
    "affirmation": "A supportive, personalized affirmation based on what they shared",
    "suggestions": ["Gentle suggestion 1", "Gentle suggestion 2"]
}

Be warm, supportive, and non-judgmental. Focus on what's positive while acknowledging challenges.
Only return valid JSON, no other text.`;

        try {
            const response = await aiService.chat(prompt, {
                systemPrompt: 'You are a supportive journal reflection assistant. Analyze entries with empathy and provide helpful insights. Always respond in valid JSON format only.',
                skipHistory: true  // One-shot call, don't mix with Zeni conversation
            });

            // Parse the JSON response
            const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
            const reflection = JSON.parse(cleaned) as JournalReflection;

            return reflection;
        } catch (error) {
            console.error('[JournalAIService] Reflection failed:', error);
            // Return a gentle fallback
            return {
                summary: "Thank you for sharing your thoughts today.",
                patterns: [],
                emotions: {
                    primary: entry.mood || 'reflective',
                    intensity: 'medium'
                },
                insights: ["Taking time to journal is a valuable practice for self-awareness."],
                affirmation: "You're doing great by taking time to reflect.",
                suggestions: ["Consider revisiting this entry tomorrow to see how you feel."]
            };
        }
    }

    /**
     * Analyze patterns across multiple entries
     */
    async analyzePatterns(entries: JournalEntry[]): Promise<{
        themes: string[];
        moodPattern: string;
        growthAreas: string[];
        strengths: string[];
    }> {
        if (entries.length === 0) {
            return {
                themes: [],
                moodPattern: 'No entries to analyze',
                growthAreas: [],
                strengths: []
            };
        }

        const entriesSummary = entries.slice(0, 10).map(e =>
            `[${e.date}] Mood: ${e.mood || 'N/A'}\n${e.content.substring(0, 200)}...`
        ).join('\n\n---\n\n');

        const prompt = `Analyze these journal entries for patterns and insights.

JOURNAL ENTRIES (most recent first):
${entriesSummary}

Respond in this exact JSON format:
{
    "themes": ["Theme 1 that appears across entries", "Theme 2"],
    "moodPattern": "Description of mood trends (e.g., 'Generally positive with occasional stress', 'Gradual improvement')",
    "growthAreas": ["Area where growth is happening", "Another growth area"],
    "strengths": ["Strength you notice", "Another strength"]
}

Only return valid JSON, no other text.`;

        try {
            const response = await aiService.chat(prompt, {
                systemPrompt: 'You are a supportive journal analyst. Identify positive patterns and growth. Always respond in valid JSON format only.',
                skipHistory: true  // One-shot call, don't mix with Zeni conversation
            });

            const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
            return JSON.parse(cleaned);
        } catch (error) {
            console.error('[JournalAIService] Pattern analysis failed:', error);
            return {
                themes: ['Personal reflection', 'Daily experiences'],
                moodPattern: 'Varied - showing a range of emotions',
                growthAreas: ['Self-awareness through journaling'],
                strengths: ['Commitment to reflection']
            };
        }
    }

    /**
     * Generate weekly insights summary
     */
    async getWeeklyInsight(weekEntries: JournalEntry[]): Promise<WeeklyInsight> {
        if (weekEntries.length === 0) {
            const now = new Date();
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());

            return {
                weekStart: weekStart.toISOString().split('T')[0],
                weekEnd: now.toISOString().split('T')[0],
                entriesCount: 0,
                moodTrend: 'stable',
                themes: [],
                summary: 'No entries this week yet. Start journaling to see your weekly insights!',
                highlights: [],
                challenges: [],
                encouragement: 'Every journey begins with a single step. Your first entry is waiting!'
            };
        }

        const dates = weekEntries.map(e => e.date).sort();
        const weekStart = dates[0];
        const weekEnd = dates[dates.length - 1];

        const entriesSummary = weekEntries.map(e =>
            `[${e.date}] Mood: ${e.mood || 'N/A'}\n${e.content.substring(0, 300)}`
        ).join('\n\n---\n\n');

        // Calculate mood trend
        const moodScores: Record<string, number> = {
            'amazing': 5, 'good': 4, 'okay': 3, 'struggling': 2, 'exhausted': 1
        };

        const moods = weekEntries.filter(e => e.mood).map(e => moodScores[e.mood!] || 3);
        let moodTrend: WeeklyInsight['moodTrend'] = 'stable';

        if (moods.length >= 3) {
            const firstHalf = moods.slice(0, Math.floor(moods.length / 2));
            const secondHalf = moods.slice(Math.floor(moods.length / 2));
            const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

            if (secondAvg - firstAvg > 0.5) moodTrend = 'improving';
            else if (firstAvg - secondAvg > 0.5) moodTrend = 'declining';
            else if (Math.max(...moods) - Math.min(...moods) >= 3) moodTrend = 'varied';
        }

        const prompt = `Analyze this week's journal entries and provide a supportive weekly summary.

WEEK'S JOURNAL ENTRIES:
${entriesSummary}

Mood Trend: ${moodTrend}

Respond in this exact JSON format:
{
    "themes": ["Main theme 1", "Main theme 2"],
    "summary": "A warm 2-3 sentence summary of the week",
    "highlights": ["A positive moment or achievement", "Another highlight"],
    "challenges": ["A challenge faced (if any)"],
    "encouragement": "An encouraging message for the coming week"
}

Be supportive and focus on progress and self-compassion. Only return valid JSON, no other text.`;

        try {
            const response = await aiService.chat(prompt, {
                systemPrompt: 'You are a supportive weekly journal reviewer. Celebrate wins, acknowledge challenges with compassion, and encourage growth. Always respond in valid JSON format only.',
                skipHistory: true  // One-shot call, don't mix with Zeni conversation
            });

            const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
            const parsed = JSON.parse(cleaned);

            return {
                weekStart,
                weekEnd,
                entriesCount: weekEntries.length,
                moodTrend,
                themes: parsed.themes || [],
                summary: parsed.summary || 'A week of reflection and growth.',
                highlights: parsed.highlights || [],
                challenges: parsed.challenges || [],
                encouragement: parsed.encouragement || 'Keep going - you\'re doing great!'
            };
        } catch (error) {
            console.error('[JournalAIService] Weekly insight failed:', error);
            return {
                weekStart,
                weekEnd,
                entriesCount: weekEntries.length,
                moodTrend,
                themes: ['Personal growth', 'Daily reflection'],
                summary: `You journaled ${weekEntries.length} time${weekEntries.length !== 1 ? 's' : ''} this week. That's a wonderful habit!`,
                highlights: ['Maintained a journaling practice'],
                challenges: [],
                encouragement: 'Every entry is a step toward self-understanding. Keep it up!'
            };
        }
    }

    /**
     * Get quick suggestions based on current mood
     */
    getSuggestionForMood(mood: string): string[] {
        const suggestions: Record<string, string[]> = {
            'amazing': [
                'Capture what made this day special',
                'Consider how you can recreate this feeling',
                'Share your positive energy with someone'
            ],
            'good': [
                'Note the small wins that added up',
                'What are you looking forward to?',
                'Express gratitude for something today'
            ],
            'okay': [
                'It\'s okay to have neutral days',
                'What would make tomorrow slightly better?',
                'Acknowledge one thing you handled well'
            ],
            'struggling': [
                'Be gentle with yourself today',
                'What\'s one small thing that might help?',
                'Remember: this feeling is temporary',
                'Consider reaching out to someone you trust'
            ],
            'exhausted': [
                'Rest is productive too',
                'What boundaries might you need to set?',
                'Consider what\'s draining your energy',
                'It\'s okay to ask for help'
            ]
        };

        return suggestions[mood] || suggestions['okay'];
    }
}

export const journalAIService = new JournalAIService();
