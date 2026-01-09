/**
 * MusicController - Clean timer/music sync system
 * Handles automatic pause/resume based on timer state
 */

import { spotifyService } from "../spotify/SpotifyService";

class MusicControllerClass {
    private enabled = true;
    private soundLibPause: (() => void) | null = null;
    private soundLibResume: (() => void) | null = null;
    private soundLibIsPlaying: (() => boolean) | null = null;

    // Track what the TIMER paused (not what user paused manually)
    private pausedByTimer: 'spotify' | 'soundlib' | null = null;

    registerSoundLibrary(pause: () => void, resume: () => void, isPlaying: () => boolean): void {
        this.soundLibPause = pause;
        this.soundLibResume = resume;
        this.soundLibIsPlaying = isPlaying;
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * Called by timer when pausing (focus → break, or user pauses timer)
     * Tracks what was paused so we can resume it later
     */
    async pause(): Promise<void> {
        if (!this.enabled) return;

        const spotifyState = spotifyService.getCurrentState();
        const soundLibPlaying = this.soundLibIsPlaying?.() ?? false;

        // Only track if we're actually pausing something
        if (spotifyState?.is_playing) {
            this.pausedByTimer = 'spotify';
            await spotifyService.pause();
        } else if (soundLibPlaying) {
            this.pausedByTimer = 'soundlib';
            this.soundLibPause?.();
        }
        // Keep pausedByTimer state for later resume
    }

    /**
     * Called by timer when resuming (break → focus, or user resumes timer)
     * Only resumes if timer paused it (not if user manually stopped it)
     */
    async resume(): Promise<void> {
        if (!this.enabled || !this.pausedByTimer) return;

        // Resume what we paused
        if (this.pausedByTimer === 'spotify') {
            await spotifyService.play();
        } else if (this.pausedByTimer === 'soundlib') {
            this.soundLibResume?.();
        }

        this.pausedByTimer = null;
    }

    /**
     * Called when user manually controls music (clicks play/pause in player)
     * Clears timer's pause state so it doesn't interfere
     */
    notifyManualControl(): void {
        this.pausedByTimer = null;
    }
}

export const musicController = new MusicControllerClass();
