import { useState, useEffect, useCallback } from "react";
import { spotifyService, SpotifyState, SpotifyTrack, FOCUS_PLAYLISTS, BREAK_PLAYLISTS } from "../services/spotify/SpotifyService";

export interface UseSpotifyReturn {
    // State
    isRunning: boolean;
    isPlaying: boolean;
    volume: number;
    track: SpotifyTrack | null;

    // Controls
    play: () => Promise<void>;
    pause: () => Promise<void>;
    toggle: () => Promise<void>;
    next: () => Promise<void>;
    previous: () => Promise<void>;
    setVolume: (level: number) => Promise<void>;

    // Playlist controls
    playUri: (uri: string) => Promise<void>;
    playFocusMusic: (playlistIndex?: number) => Promise<void>;
    playBreakMusic: (playlistIndex?: number) => Promise<void>;

    // Utilities
    openSpotify: () => Promise<void>;
    refresh: () => Promise<void>;

    // Playlist data
    focusPlaylists: typeof FOCUS_PLAYLISTS;
    breakPlaylists: typeof BREAK_PLAYLISTS;
}

export function useSpotify(): UseSpotifyReturn {
    const [state, setState] = useState<SpotifyState>({
        is_running: false,
        is_playing: false,
        volume: 50,
        track: null,
    });

    useEffect(() => {
        // Initial fetch
        spotifyService.getState().then(setState);

        // Subscribe to state changes
        const unsubscribe = spotifyService.subscribe(setState);
        return () => unsubscribe();
    }, []);

    const play = useCallback(async () => {
        await spotifyService.play();
        // Optimistic update
        setState(prev => ({ ...prev, is_playing: true }));
    }, []);

    const pause = useCallback(async () => {
        await spotifyService.pause();
        setState(prev => ({ ...prev, is_playing: false }));
    }, []);

    const toggle = useCallback(async () => {
        await spotifyService.toggle();
        setState(prev => ({ ...prev, is_playing: !prev.is_playing }));
    }, []);

    const next = useCallback(async () => {
        await spotifyService.next();
    }, []);

    const previous = useCallback(async () => {
        await spotifyService.previous();
    }, []);

    const setVolume = useCallback(async (level: number) => {
        await spotifyService.setVolume(level);
        setState(prev => ({ ...prev, volume: level }));
    }, []);

    const playUri = useCallback(async (uri: string) => {
        await spotifyService.playUri(uri);
        setState(prev => ({ ...prev, is_playing: true, is_running: true }));
    }, []);

    const playFocusMusic = useCallback(async (playlistIndex = 0) => {
        await spotifyService.playFocusMusic(playlistIndex);
        setState(prev => ({ ...prev, is_playing: true, is_running: true }));
    }, []);

    const playBreakMusic = useCallback(async (playlistIndex = 0) => {
        await spotifyService.playBreakMusic(playlistIndex);
        setState(prev => ({ ...prev, is_playing: true, is_running: true }));
    }, []);

    const openSpotify = useCallback(async () => {
        await spotifyService.open();
    }, []);

    const refresh = useCallback(async () => {
        const newState = await spotifyService.getState();
        setState(newState);
    }, []);

    return {
        isRunning: state.is_running,
        isPlaying: state.is_playing,
        volume: state.volume,
        track: state.track,

        play,
        pause,
        toggle,
        next,
        previous,
        setVolume,

        playUri,
        playFocusMusic,
        playBreakMusic,

        openSpotify,
        refresh,

        focusPlaylists: FOCUS_PLAYLISTS,
        breakPlaylists: BREAK_PLAYLISTS,
    };
}
