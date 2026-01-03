/**
 * MusicController - Ties music playback to timer state
 */

import { eventBus, TimerEvent } from "../events/EventBus";
import { spotifyService } from "../spotify/SpotifyService";

interface MusicState {
    wasPlaying: boolean;
    source: "spotify" | "soundlib" | null;
}

class MusicControllerClass {
    private state: MusicState = { wasPlaying: false, source: null };
    private enabled = true;
    private unsubscribers: (() => void)[] = [];
    private soundLibPause: (() => void) | null = null;
    private soundLibResume: (() => void) | null = null;
    private soundLibIsPlaying: (() => boolean) | null = null;

    init(): void {
        this.unsubscribers.push(
            eventBus.on("SESSION_START", (event: TimerEvent) => {
                if (event.type === "SESSION_START" && event.mode === "focus") this.onFocusStart();
            })
        );
        this.unsubscribers.push(
            eventBus.on("SESSION_END", (event: TimerEvent) => {
                if (event.type === "SESSION_END" && event.mode === "focus") this.onFocusEnd();
            })
        );
    }

    registerSoundLibrary(pause: () => void, resume: () => void, isPlaying: () => boolean): void {
        this.soundLibPause = pause;
        this.soundLibResume = resume;
        this.soundLibIsPlaying = isPlaying;
    }

    setEnabled(enabled: boolean): void { this.enabled = enabled; }
    isEnabled(): boolean { return this.enabled; }

    private async onFocusStart(): Promise<void> {
        if (!this.enabled || !this.state.wasPlaying) return;
        if (this.state.source === "spotify") await spotifyService.play();
        else if (this.state.source === "soundlib") this.soundLibResume?.();
        this.state = { wasPlaying: false, source: null };
    }

    private async onFocusEnd(): Promise<void> {
        if (!this.enabled) return;
        const spotifyState = spotifyService.getCurrentState();
        const soundLibPlaying = this.soundLibIsPlaying?.() ?? false;

        if (spotifyState?.is_playing) {
            this.state = { wasPlaying: true, source: "spotify" };
            await spotifyService.pause();
        } else if (soundLibPlaying) {
            this.state = { wasPlaying: true, source: "soundlib" };
            this.soundLibPause?.();
        }
    }

    destroy(): void {
        this.unsubscribers.forEach(unsub => unsub());
        this.unsubscribers = [];
    }
}

export const musicController = new MusicControllerClass();
