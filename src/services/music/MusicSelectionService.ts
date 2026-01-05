import { getAllSounds, SoundTrack } from "../../config/soundLibrary";
import { coachService } from "../ai/CoachService";

/**
 * Intelligent Music Selection Service
 * AI chooses the perfect track from the library based on context
 */

interface MusicContext {
    timeOfDay: "morning" | "afternoon" | "evening" | "night";
    energyLevel: "high" | "medium" | "low";
    sessionNumber: number;
    sessionDuration: number; // minutes
    userMood?: "focused" | "stressed" | "tired" | "motivated";
    previousGenre?: string;
}

class MusicSelectionService {

    /**
     * Selects the perfect track based on context
     */
    selectTrack(context: MusicContext): SoundTrack {
        const allTracks = getAllSounds();
        const scored = allTracks.map(track => ({
            track,
            score: this.scoreTrack(track, context)
        }));

        // Sort by score and return top match
        scored.sort((a, b) => b.score - a.score);
        return scored[0].track;
    }

    /**
     * Get track recommendation with reasoning
     */
    async getRecommendationWithReason(context: MusicContext): Promise<{
        track: SoundTrack;
        reason: string;
    }> {
        const track = this.selectTrack(context);
        const reason = this.generateReason(track, context);

        return { track, reason };
    }

    /**
     * Score a track based on context (0-100)
     */
    private scoreTrack(track: SoundTrack, context: MusicContext): number {
        let score = 50; // Base score

        // Time of day preferences
        if (context.timeOfDay === "morning") {
            if (track.category === "lofi" || track.category === "focus") score += 20;
            if (track.category === "classical") score += 15;
        } else if (context.timeOfDay === "afternoon") {
            if (track.category === "ambient" || track.category === "electronic") score += 15;
        } else if (context.timeOfDay === "evening") {
            if (track.category === "lofi" || track.category === "ambient") score += 20;
        } else if (context.timeOfDay === "night") {
            if (track.category === "ambient" || track.category === "binaural") score += 25;
            if (track.category === "frequency") score += 20;
        }

        // Energy level matching
        if (context.energyLevel === "high") {
            if (track.category === "electronic" || track.category === "focus") score += 20;
            if (track.category === "frequency") score -= 10;
        } else if (context.energyLevel === "medium") {
            if (track.category === "lofi" || track.category === "ambient") score += 15;
        } else if (context.energyLevel === "low") {
            if (track.category === "binaural" || track.category === "frequency") score += 25;
            if (track.category === "nature") score += 20;
            if (track.category === "electronic") score -= 15;
        }

        // Session number (fatigue factor)
        if (context.sessionNumber > 6) {
            // Late in the day, prefer calming
            if (track.category === "nature" || track.category === "ambient") score += 15;
            if (track.category === "focus") score -= 10;
        }

        // User mood
        if (context.userMood === "stressed") {
            if (track.category === "nature" || track.category === "binaural") score += 25;
            if (track.category === "frequency") score += 20;
        } else if (context.userMood === "tired") {
            if (track.category === "frequency" || track.category === "archive") score += 20;
            if (["wf-adhd", "wf-brain"].includes(track.id)) score += 30; // Brain boost frequencies
        } else if (context.userMood === "motivated") {
            if (track.category === "focus" || track.category === "electronic") score += 20;
        }

        // ADHD/ND preferences (always good for focus)
        if (track.category === "neurodivergent") {
            score += 10; // Brown/pink noise always helps
        }

        // Avoid repetition
        if (context.previousGenre && track.category === context.previousGenre) {
            score -= 15;
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Generate human-readable reason for selection
     */
    private generateReason(track: SoundTrack, context: MusicContext): string {
        const reasons = [];

        if (context.timeOfDay === "night" && (track.category === "binaural" || track.category === "frequency")) {
            reasons.push("Perfect for late-night deep focus");
        } else if (context.energyLevel === "low" && track.category === "frequency") {
            reasons.push("Brain boost to restore your energy");
        } else if (context.sessionNumber > 6 && track.category === "nature") {
            reasons.push("Calming sounds to combat session fatigue");
        } else if (track.category === "lofi") {
            reasons.push("Smooth beats for sustained concentration");
        } else if (track.category === "neurodivergent") {
            reasons.push("Optimized for ADHD/focus needs");
        }

        if (context.userMood === "stressed") {
            reasons.push("Reduces stress and anxiety");
        }

        if (reasons.length === 0) {
            reasons.push("Matches your current flow state");
        }

        return reasons.join(". ");
    }

    /**
     * Get playlist for entire work session (multiple tracks)
     */
    async buildSessionPlaylist(context: MusicContext, sessionCount: number): Promise<SoundTrack[]> {
        const playlist: SoundTrack[] = [];

        for (let i = 0; i < sessionCount; i++) {
            const adjustedContext = {
                ...context,
                sessionNumber: i + 1,
                previousGenre: playlist[playlist.length - 1]?.category
            };
            playlist.push(this.selectTrack(adjustedContext));
        }

        return playlist;
    }

    /**
     * AI-powered music selection (uses LLM for extra intelligence)
     */
    async selectWithAI(context: MusicContext): Promise<{
        track: SoundTrack;
        reason: string;
    }> {
        // Get top 10 candidates
        const allTracks = getAllSounds();
        const scored = allTracks.map(track => ({
            track,
            score: this.scoreTrack(track, context)
        }));
        scored.sort((a, b) => b.score - a.score);
        const candidates = scored.slice(0, 10).map(s => s.track);

        // Ask the coach AI to pick the best one
        try {
            const prompt = `Pick the BEST track for right now:

Context:
- Time: ${context.timeOfDay}
- Energy: ${context.energyLevel}
- Session #${context.sessionNumber}
- Mood: ${context.userMood || "neutral"}

Top candidates:
${candidates.map((t, i) => `${i + 1}. ${t.name} (${t.category}) ${t.icon}`).join("\n")}

Respond with ONLY the number (1-10) and a brief reason (max 10 words).
Example: "3 - Perfect binaural beats for late-night focus"`;

            const response = await coachService.chat(prompt, {
                sessionsToday: context.sessionNumber,
                currentSession: context.sessionNumber,
                isRunning: true,
                timeLeft: `${context.sessionDuration}:00`,
                timeOfDay: new Date().toLocaleTimeString()
            });

            // Parse response
            const textResponse = typeof response === 'string' ? response : (response as any).text || (response as any).content || JSON.stringify(response);
            const match = textResponse.match(/^(\d+)/);
            if (match) {
                const index = parseInt(match[1]) - 1;
                if (index >= 0 && index < candidates.length) {
                    const selectedTrack = candidates[index];
                    const reason = textResponse.split("-")[1]?.trim() || "AI-selected for optimal focus";
                    return { track: selectedTrack, reason };
                }
            }
        } catch (error) {
            console.error("AI selection failed, falling back to algorithm", error);
        }

        // Fallback to algorithm
        const basicSelection = this.getRecommendationWithReason(context);
        return basicSelection;
    }
}

export const musicSelectionService = new MusicSelectionService();
