import { invoke } from "@tauri-apps/api/core";

export interface SpotifyTrack {
    name: string;
    artist: string;
    album: string;
    artwork_url: string;
    duration: number;
    position: number;
}

export interface SpotifyState {
    is_running: boolean;
    is_playing: boolean;
    volume: number;
    track: SpotifyTrack | null;
}

// Focus playlists with Spotify URIs
export const FOCUS_PLAYLISTS = [
    { name: "Deep Focus", uri: "spotify:playlist:37i9dQZF1DX8NTLI2TtZa6", mood: "🎯", description: "Electronic beats for deep work" },
    { name: "Lo-Fi Beats", uri: "spotify:playlist:37i9dQZF1DWZeKCadgRdKQ", mood: "🌙", description: "Chill hop for late nights" },
    { name: "Peaceful Piano", uri: "spotify:playlist:37i9dQZF1DX4sWSpwq3LiO", mood: "🎹", description: "Classical calm" },
    { name: "Brain Food", uri: "spotify:playlist:37i9dQZF1DWXLeA8Omikj7", mood: "🧠", description: "Music for concentration" },
    { name: "Intense Studying", uri: "spotify:playlist:37i9dQZF1DX8NTLI2TtZa6", mood: "📚", description: "Maximum focus" },
];

// Break playlists
export const BREAK_PLAYLISTS = [
    { name: "Chill Vibes", uri: "spotify:playlist:37i9dQZF1DX1s9knjP51Oa", mood: "☁️", description: "Relaxing break music" },
    { name: "Feel Good", uri: "spotify:playlist:37i9dQZF1DX3rxVfibe1L0", mood: "😊", description: "Happy uplifting tunes" },
    { name: "Nature Sounds", uri: "spotify:playlist:37i9dQZF1DX4PP3DA4J0N8", mood: "🌿", description: "Ambient nature" },
];

class SpotifyServiceClass {
    private listeners: Set<(state: SpotifyState) => void> = new Set();
    private pollInterval: ReturnType<typeof setInterval> | null = null;
    private currentState: SpotifyState | null = null;

    async isRunning(): Promise<boolean> {
        try {
            return await invoke<boolean>("spotify_is_running");
        } catch (error) {
            console.error("Spotify isRunning error:", error);
            return false;
        }
    }

    async open(): Promise<void> {
        try {
            await invoke("spotify_open");
        } catch (error) {
            console.error("Spotify open error:", error);
        }
    }

    async play(): Promise<void> {
        try {
            await invoke("spotify_play");
        } catch (error) {
            console.error("Spotify play error:", error);
        }
    }

    async pause(): Promise<void> {
        try {
            await invoke("spotify_pause");
        } catch (error) {
            console.error("Spotify pause error:", error);
        }
    }

    async toggle(): Promise<void> {
        try {
            await invoke("spotify_toggle");
        } catch (error) {
            console.error("Spotify toggle error:", error);
        }
    }

    async next(): Promise<void> {
        try {
            await invoke("spotify_next");
        } catch (error) {
            console.error("Spotify next error:", error);
        }
    }

    async previous(): Promise<void> {
        try {
            await invoke("spotify_previous");
        } catch (error) {
            console.error("Spotify previous error:", error);
        }
    }

    async setVolume(level: number): Promise<void> {
        try {
            await invoke("spotify_set_volume", { level: Math.min(100, Math.max(0, level)) });
        } catch (error) {
            console.error("Spotify setVolume error:", error);
        }
    }

    async getVolume(): Promise<number> {
        try {
            return await invoke<number>("spotify_get_volume");
        } catch (error) {
            console.error("Spotify getVolume error:", error);
            return 50;
        }
    }

    async playUri(uri: string): Promise<void> {
        try {
            // Open Spotify first if not running
            const isRunning = await this.isRunning();
            if (!isRunning) {
                await this.open();
                // Wait a bit for Spotify to open
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            await invoke("spotify_play_uri", { uri });
        } catch (error) {
            console.error("Spotify playUri error:", error);
        }
    }

    async getState(): Promise<SpotifyState> {
        try {
            return await invoke<SpotifyState>("spotify_get_state");
        } catch (error) {
            console.error("Spotify getState error:", error);
            return {
                is_running: false,
                is_playing: false,
                volume: 0,
                track: null,
            };
        }
    }

    // Play a focus playlist
    async playFocusMusic(playlistIndex = 0): Promise<void> {
        const playlist = FOCUS_PLAYLISTS[playlistIndex] || FOCUS_PLAYLISTS[0];
        await this.playUri(playlist.uri);
    }

    // Play a break playlist
    async playBreakMusic(playlistIndex = 0): Promise<void> {
        const playlist = BREAK_PLAYLISTS[playlistIndex] || BREAK_PLAYLISTS[0];
        await this.playUri(playlist.uri);
    }

    // Subscribe to state changes
    subscribe(callback: (state: SpotifyState) => void): () => void {
        this.listeners.add(callback);

        // Start polling if not already
        if (!this.pollInterval) {
            this.startPolling();
        }

        // Return unsubscribe function
        return () => {
            this.listeners.delete(callback);
            if (this.listeners.size === 0 && this.pollInterval) {
                clearInterval(this.pollInterval);
                this.pollInterval = null;
            }
        };
    }

    private startPolling() {
        this.pollInterval = setInterval(async () => {
            const state = await this.getState();

            // Only notify if state changed
            if (JSON.stringify(state) !== JSON.stringify(this.currentState)) {
                this.currentState = state;
                this.listeners.forEach(cb => cb(state));
            }
        }, 3000); // Poll every 3 seconds
    }

    getCurrentState(): SpotifyState | null {
        return this.currentState;
    }
}

export const spotifyService = new SpotifyServiceClass();
