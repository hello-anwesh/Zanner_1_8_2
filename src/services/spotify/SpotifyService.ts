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

export interface SpotifySearchResult {
    id: string;
    name: string;
    uri: string;
    type: 'album' | 'playlist' | 'track';
    artists?: string;
    image?: string;
    description?: string;
}

export interface SpotifyAuthConfig {
    clientId: string;
    clientSecret: string;
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
    private accessToken: string | null = null;
    private refreshToken: string | null = null;
    private tokenExpiry: number = 0;

    constructor() {
        // Load tokens from localStorage
        this.accessToken = localStorage.getItem('spotify_access_token');
        this.refreshToken = localStorage.getItem('spotify_refresh_token');
        const expiry = localStorage.getItem('spotify_token_expiry');
        this.tokenExpiry = expiry ? parseInt(expiry) : 0;
    }

    // ===== EXISTING APPLESCRIPT METHODS =====

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

    // ===== NEW WEB API METHODS =====

    /**
     * Check if user is authenticated with Spotify Web API
     */
    isAuthenticated(): boolean {
        return !!this.accessToken && Date.now() < this.tokenExpiry;
    }

    /**
     * Initiate OAuth flow
     * User needs to provide their Client ID
     */
    async authenticate(clientId: string, clientSecret: string): Promise<void> {
        // Store credentials
        localStorage.setItem('spotify_client_id', clientId);
        localStorage.setItem('spotify_client_secret', clientSecret);

        // Generate authorization URL
        const redirectUri = 'http://localhost:3000/callback';
        const scope = 'user-read-private user-read-email playlist-read-private user-library-read';
        const state = Math.random().toString(36).substring(7);

        const authUrl = `https://accounts.spotify.com/authorize?` +
            `client_id=${clientId}&` +
            `response_type=code&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `scope=${encodeURIComponent(scope)}&` +
            `state=${state}`;

        // Open auth URL in browser
        window.open(authUrl, '_blank');

        // Note: User needs to manually copy the callback URL and paste it
        // A better implementation would use a local server to catch the callback
    }

    /**
     * Exchange authorization code for access token
     */
    async exchangeCode(code: string): Promise<void> {
        const clientId = localStorage.getItem('spotify_client_id');
        const clientSecret = localStorage.getItem('spotify_client_secret');

        if (!clientId || !clientSecret) {
            throw new Error('Spotify credentials not configured');
        }

        const redirectUri = 'http://localhost:3000/callback';

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri
            })
        });

        if (!response.ok) {
            throw new Error('Failed to exchange code for token');
        }

        const data = await response.json();
        this.setTokens(data.access_token, data.refresh_token, data.expires_in);
    }

    private setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenExpiry = Date.now() + (expiresIn * 1000);

        localStorage.setItem('spotify_access_token', accessToken);
        localStorage.setItem('spotify_refresh_token', refreshToken);
        localStorage.setItem('spotify_token_expiry', this.tokenExpiry.toString());
    }

    /**
     * Search Spotify catalog
     */
    async search(query: string, types: ('album' | 'playlist' | 'track')[] = ['album', 'playlist', 'track']): Promise<SpotifySearchResult[]> {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated with Spotify');
        }

        const typeString = types.join(',');
        const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${typeString}&limit=10`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Search failed');
        }

        const data = await response.json();
        const results: SpotifySearchResult[] = [];

        // Parse albums
        if (data.albums?.items) {
            data.albums.items.forEach((album: any) => {
                results.push({
                    id: album.id,
                    name: album.name,
                    uri: album.uri,
                    type: 'album',
                    artists: album.artists.map((a: any) => a.name).join(', '),
                    image: album.images[0]?.url
                });
            });
        }

        // Parse playlists
        if (data.playlists?.items) {
            data.playlists.items.forEach((playlist: any) => {
                results.push({
                    id: playlist.id,
                    name: playlist.name,
                    uri: playlist.uri,
                    type: 'playlist',
                    description: playlist.description,
                    image: playlist.images[0]?.url
                });
            });
        }

        // Parse tracks
        if (data.tracks?.items) {
            data.tracks.items.forEach((track: any) => {
                results.push({
                    id: track.id,
                    name: track.name,
                    uri: track.uri,
                    type: 'track',
                    artists: track.artists.map((a: any) => a.name).join(', '),
                    image: track.album.images[0]?.url
                });
            });
        }

        return results;
    }

    /**
     * Save item to user's favorites
     */
    saveFavorite(item: SpotifySearchResult): void {
        const favorites = this.getFavorites();

        // Check if already saved
        if (favorites.some(f => f.uri === item.uri)) {
            return;
        }

        favorites.push(item);
        localStorage.setItem('spotify_favorites', JSON.stringify(favorites));
    }

    /**
     * Remove item from favorites
     */
    removeFavorite(uri: string): void {
        const favorites = this.getFavorites();
        const updated = favorites.filter(f => f.uri !== uri);
        localStorage.setItem('spotify_favorites', JSON.stringify(updated));
    }

    /**
     * Get all favorites
     */
    getFavorites(): SpotifySearchResult[] {
        const stored = localStorage.getItem('spotify_favorites');
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Clear authentication
     */
    logout(): void {
        this.accessToken = null;
        this.refreshToken = null;
        this.tokenExpiry = 0;

        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_token_expiry');
    }
}

export const spotifyService = new SpotifyServiceClass();
