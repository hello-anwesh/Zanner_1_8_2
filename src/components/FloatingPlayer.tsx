import { useState, useRef, useEffect, useCallback } from "react";
import {
    Pause, Play, X, Heart, SkipForward, SkipBack,
    Volume2, VolumeX, Music, Music2, AlertCircle
} from "lucide-react";
import {
    SoundTrack,
    loadSoundLibrary, toggleFavorite,
    addToRecentlyPlayed, getFavorites, getRecentlyPlayed, getSoundsByCategory
} from "../config/soundLibrary";
import { eventBus } from "../services";
import { musicController } from "../services/music/MusicController";
import { PRESET_MIXES, loadCustomMixes } from "./frequency/frequencies";
import { getFrequencyEngine } from "./frequency/FrequencyEngine";
import { spotifyService, SpotifyState } from "../services/spotify/SpotifyService";

interface FloatingPlayerProps {
    colors: {
        accent: string;
        text: string;
        textMuted: string;
    };
}

export function FloatingPlayer({ colors }: FloatingPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<SoundTrack | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [showLibrary, setShowLibrary] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string>("nature");
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isShuffleOn, setIsShuffleOn] = useState(false);
    const [isLoopOn, setIsLoopOn] = useState(true);
    const [playlist, setPlaylist] = useState<SoundTrack[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Spotify state
    const [spotifyState, setSpotifyState] = useState<SpotifyState | null>(null);

    const audioRef = useRef<HTMLAudioElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Check if URL is direct audio (mp3, etc) vs YouTube embed
    const isDirectAudio = (url: string) =>
        url.match(/\.(mp3|wav|ogg|m4a|flac|aac)(\?.*)?$/i) ||
        url.includes("archive.org/download") ||
        url.includes("somafm.com") ||
        url.includes("-mp3") ||
        url.includes("-aac");

    const getEmbedUrl = (url: string) => {
        if (url.includes("youtube.com/watch?v=")) return url.replace("watch?v=", "embed/");
        if (url.includes("youtu.be/")) return url.replace("youtu.be/", "www.youtube.com/embed/");
        return url;
    };

    useEffect(() => {
        setFavorites(loadSoundLibrary().favorites);
    }, []);

    // Subscribe to Spotify state
    useEffect(() => {
        const unsub = spotifyService.subscribe((state) => {
            setSpotifyState(state);
        });
        return () => unsub();
    }, []);

    // MusicController integration for timer pause/resume
    const pausePlayback = useCallback(() => {
        // Handle frequency mixes
        if (currentTrack?.url.startsWith('frequency-mix://')) {
            const engine = getFrequencyEngine();
            engine.pause();
        }

        if (audioRef.current) {
            audioRef.current.pause();
        }
        // For YouTube/SoundCloud iframes, we need to reload to stop playback
        if (iframeRef.current && currentTrack && !isDirectAudio(currentTrack.url)) {
            // Store current track to resume later
            iframeRef.current.src = "";
        }
        setIsPlaying(false);
    }, [currentTrack]);

    const resumePlayback = useCallback(() => {
        // Handle frequency mixes
        if (currentTrack?.url.startsWith('frequency-mix://')) {
            const engine = getFrequencyEngine();
            engine.resumePlayback(volume);
        }

        if (audioRef.current) {
            audioRef.current.play().catch(() => { });
        }
        // For YouTube/SoundCloud iframes, reload the embed
        if (iframeRef.current && currentTrack && !isDirectAudio(currentTrack.url)) {
            iframeRef.current.src = `${getEmbedUrl(currentTrack.url)}?autoplay=1&controls=0&loop=1&modestbranding=1&rel=0&enablejsapi=1${currentTrack.isPlaylist ? '&shuffle=1' : ''}`;
        }
        setIsPlaying(true);
    }, [currentTrack, volume]);

    useEffect(() => {
        musicController.registerSoundLibrary(
            pausePlayback,
            resumePlayback,
            () => isPlaying && !!currentTrack
        );
    }, [pausePlayback, resumePlayback, isPlaying, currentTrack]);

    useEffect(() => {
        if (audioRef.current && currentTrack && isDirectAudio(currentTrack.url)) {
            audioRef.current.volume = volume;
            audioRef.current.muted = isMuted;
        }
    }, [volume, isMuted, currentTrack]);
    const getSounds = useCallback((): SoundTrack[] => {
        if (activeCategory === "favorites") return getFavorites();
        if (activeCategory === "recent") return getRecentlyPlayed();
        if (activeCategory === "custom") return loadSoundLibrary().customSounds;

        // For frequency category, add frequency mixes as special tracks
        if (activeCategory === "frequency") {
            const regularFreqTracks = getSoundsByCategory("frequency");
            const customFreqMixes = loadCustomMixes();
            const allMixes = [...PRESET_MIXES, ...customFreqMixes];

            // Convert frequency mixes to SoundTrack format
            const freqMixTracks: SoundTrack[] = allMixes.map(mix => ({
                id: `freq-mix-${mix.id}`,
                name: mix.name,
                icon: mix.id.startsWith('custom-') ? "⭐" : "🔮",
                url: `frequency-mix://${mix.id}`, // Special URL scheme
                category: "frequency" as const,
                duration: "Generated",
                isCustom: mix.id.startsWith('custom-'),
                description: mix.description,
                experience: mix.experience,
                usage: mix.usage
            }));

            return [...regularFreqTracks, ...freqMixTracks];
        }

        return getSoundsByCategory(activeCategory as any);
    }, [activeCategory]);

    // Play a track
    const play = useCallback(async (track: SoundTrack) => {
        setError(null);
        setIsLoading(true);

        // ALWAYS stop previous playback first to prevent overlap
        const engine = getFrequencyEngine();
        engine.stopAll(); // Stop any playing frequencies

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        if (iframeRef.current) {
            iframeRef.current.src = "";
        }

        // Check if this is a frequency mix
        if (track.url.startsWith('frequency-mix://')) {
            const mixId = track.url.replace('frequency-mix://', '');
            const allMixes = [...PRESET_MIXES, ...loadCustomMixes()];
            const mix = allMixes.find(m => m.id === mixId);

            if (mix) {
                // Get frequency engine and play the mix - AWAIT all frequencies
                await Promise.all(mix.frequencies.map(f => engine.startFrequency(f.hz, f.volume)));
                setCurrentTrack(track);
                setIsPlaying(true);
                setIsLoading(false);
                addToRecentlyPlayed(track.id);
                setPlaylist(getSounds());
                return;
            }
        }

        // Regular audio/video playback
        setCurrentTrack(track);
        setIsPlaying(true);
        addToRecentlyPlayed(track.id);
        setPlaylist(getSounds());
    }, [getSounds]);

    // Listen for external play requests (e.g. from Coach)
    useEffect(() => {
        const handlePlayTrack = (event: any) => {
            if (event.type === "PLAY_TRACK") {
                const track: SoundTrack = {
                    id: `external-${Date.now()}`,
                    name: event.name,
                    url: event.url,
                    icon: "🎵",
                    category: "custom", // Treat as custom/external
                    isCustom: true
                };
                play(track);
            }
        };
        const unsub = eventBus.on("PLAY_TRACK", handlePlayTrack);
        return () => unsub();
    }, [play]);

    // Audio loaded successfully
    const handleCanPlay = () => {
        setIsLoading(false);
        setError(null);
    };

    // Audio failed to load - DON'T auto-skip, show error instead
    const handleError = () => {
        setIsLoading(false);
        setIsPlaying(false);
        setError("Failed to load. Try another track or check your connection.");
    };

    // Navigation
    const next = useCallback(() => {
        if (!currentTrack || !playlist.length) return;
        const i = playlist.findIndex(t => t.id === currentTrack.id);
        const nextI = isShuffleOn ? Math.floor(Math.random() * playlist.length) : (i + 1) % playlist.length;
        play(playlist[nextI]);
    }, [currentTrack, playlist, isShuffleOn, play]);

    const prev = useCallback(() => {
        if (!currentTrack || !playlist.length) return;
        const i = playlist.findIndex(t => t.id === currentTrack.id);
        const iPrev = i === 0 ? playlist.length - 1 : i - 1;
        play(playlist[iPrev]);
    }, [currentTrack, playlist, play]);

    // Toggle play/pause
    const toggle = useCallback(() => {
        if (!currentTrack) return;

        // Handle frequency mixes (separate system, doesn't use MusicController)
        if (currentTrack.url.startsWith('frequency-mix://')) {
            const engine = getFrequencyEngine();
            if (isPlaying) {
                engine.pause();
                setIsPlaying(false);
            } else {
                engine.resumePlayback(volume);
                setIsPlaying(true);
            }
            return;
        }

        // Notify music controller that user is manually controlling playback
        // This prevents timer from interfering with manual control
        musicController.notifyManualControl();

        // Handle direct audio (Archive.org MP3s)
        if (isDirectAudio(currentTrack.url) && audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play().catch(handleError);
                setIsPlaying(true);
            }
            return;
        }

        // Handle YouTube/SoundCloud iframes - stop/restart only
        if (iframeRef.current) {
            if (isPlaying) {
                // Pause by clearing iframe
                iframeRef.current.src = "";
                setIsPlaying(false);
            } else {
                // Resume by reloading iframe
                iframeRef.current.src = `${getEmbedUrl(currentTrack.url)}?autoplay=1&controls=0&loop=1&modestbranding=1&rel=0&enablejsapi=1${currentTrack.isPlaylist ? '&shuffle=1' : ''}`;
                setIsPlaying(true);
            }
        }
    }, [currentTrack, isPlaying, volume]);

    // Stop playback
    const stop = useCallback(() => {
        // Stop frequency engine if playing frequency mix
        if (currentTrack?.url.startsWith('frequency-mix://')) {
            const engine = getFrequencyEngine();
            engine.stopAll();
        }
        setCurrentTrack(null);
        setIsPlaying(false);
        setError(null);
    }, [currentTrack]);

    const sounds = getSounds();

    // Category tabs - MAIN categories only
    const tabs = [
        { id: "spotify", label: "🎧", name: "Spotify" },
        { id: "favorites", label: "♥", name: "Likes" },
        { id: "nature", label: "🌿", name: "Nature" },
        { id: "ambient", label: "🌌", name: "Ambient" },
        { id: "frequency", label: "🔮", name: "Hz" },
        { id: "asmr", label: "💆", name: "ASMR" },
        { id: "neurodivergent", label: "🌈", name: "ND" },
        { id: "archive", label: "📀", name: "Archive" },
        { id: "visuals", label: "🌀", name: "Visuals" },
    ];

    return (
        <>
            {/* === AUDIO PLAYER (Direct MP3s) === */}
            {currentTrack && isDirectAudio(currentTrack.url) && (
                <audio
                    ref={audioRef}
                    src={currentTrack.url}
                    autoPlay
                    loop={isLoopOn}
                    muted={isMuted}
                    onLoadedMetadata={(e) => {
                        const audio = e.currentTarget;
                        audio.volume = volume;
                        audio.muted = isMuted;
                        setDuration(audio.duration || 0);
                        setCurrentTime(0);
                    }}
                    onTimeUpdate={(e) => {
                        setCurrentTime(e.currentTarget.currentTime);
                    }}
                    onCanPlay={(e) => {
                        const audio = e.currentTarget;
                        // Ensure volume is set when playback starts
                        audio.volume = volume;
                        audio.muted = isMuted;
                        handleCanPlay();
                    }}
                    onError={handleError}
                    onEnded={() => !isLoopOn && next()}
                    style={{ display: "none" }}
                />
            )}

            {/* === YOUTUBE EMBED (Hidden - audio only) === */}
            {currentTrack && !isDirectAudio(currentTrack.url) && !currentTrack.url.startsWith('frequency-mix://') && (
                <iframe
                    ref={iframeRef}
                    src={`${getEmbedUrl(currentTrack.url)}?autoplay=1&controls=0&loop=1&modestbranding=1&rel=0&enablejsapi=1&origin=${window.location.origin}${currentTrack.isPlaylist ? '&shuffle=1' : ''}`}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    onLoad={() => { setIsLoading(false); setError(null); }}
                    style={{
                        width: 1,
                        height: 1,
                        position: "fixed",
                        bottom: -100,
                        left: -100,
                        opacity: 0,
                        pointerEvents: "none",
                    }}
                />
            )}

            {/* Main Container */}
            <div className="fixed bottom-8 right-8 z-50">

                {/* === TRIGGER BUTTON - CLEAN FLAT === */}
                {!showLibrary && !currentTrack && (
                    <button
                        onClick={() => setShowLibrary(true)}
                        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105"
                        style={{
                            background: colors.accent,
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        <Music2 size={22} color="#000" strokeWidth={2.5} />
                    </button>
                )}

                {/* === MINI PLAYER - CLEAN FLAT === */}
                {!showLibrary && currentTrack && (
                    <div
                        onClick={() => setShowLibrary(true)}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer shadow-lg transition-all hover:border-white/20"
                        style={{
                            background: "#1E1E1E",
                            border: error ? "1px solid #F43F5E" : "1px solid rgba(255,255,255,0.1)",
                        }}
                    >
                        <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${isLoading ? "animate-pulse" : ""}`}
                            style={{ background: error ? "#F43F5E20" : `${colors.accent}20`, border: `1px solid ${error ? '#F43F5E40' : colors.accent + '40'}` }}
                        >
                            {error ? <AlertCircle size={18} color="#F43F5E" /> : currentTrack.icon}
                        </div>
                        <span className="text-sm font-medium text-white max-w-32 truncate">
                            {error ? "Error" : currentTrack.name}
                        </span>
                        <div className="flex gap-2 ml-auto">
                            <button
                                onClick={e => { e.stopPropagation(); toggle(); }}
                                className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 font-bold text-xl"
                                style={{
                                    background: colors.accent,
                                    boxShadow: `0 4px 12px ${colors.accent}60, 0 2px 4px rgba(0,0,0,0.3)`,
                                    color: '#000'
                                }}
                                title={isPlaying ? "Pause" : "Play"}
                            >
                                {isPlaying ? "⏸" : "▶"}
                            </button>
                            <button
                                onClick={e => { e.stopPropagation(); stop(); }}
                                className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors text-white/70 hover:text-white font-bold text-lg"
                                title="Stop"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                {/* === LIBRARY PANEL - CLEAN FLAT === */}
                {showLibrary && (
                    <div
                        className="w-[440px] rounded-2xl overflow-hidden shadow-xl"
                        style={{
                            background: "#1E1E1E",
                            border: "1px solid rgba(255,255,255,0.1)",
                            maxHeight: "75vh",
                        }}
                    >
                        {/* Header */}
                        <div className="p-6 flex items-center justify-between border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                            <div className="flex items-center gap-4">
                                <div
                                    className="p-3 rounded-lg"
                                    style={{
                                        background: `${colors.accent}20`,
                                        border: `1px solid ${colors.accent}40`
                                    }}
                                >
                                    <Music size={20} style={{ color: colors.accent }} strokeWidth={2.5} />
                                </div>
                                <h2 className="text-xl font-bold text-white">Sound Library</h2>
                            </div>
                            <button
                                onClick={() => setShowLibrary(false)}
                                className="p-2.5 rounded-lg transition-colors hover:bg-white/10"
                                style={{ background: "rgba(255,255,255,0.05)" }}
                            >
                                <X size={18} style={{ color: "rgba(255,255,255,0.5)" }} />
                            </button>
                        </div>

                        {/* Error Banner */}
                        {error && (
                            <div className="mx-6 mt-6 p-4 rounded-2xl flex items-center gap-3 relative overflow-hidden"
                                style={{
                                    background: "linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(244, 63, 94, 0.08) 100%)",
                                    border: "1px solid rgba(244, 63, 94, 0.25)",
                                    backdropFilter: "blur(20px)"
                                }}
                            >
                                <AlertCircle size={18} className="text-red-400 shrink-0" strokeWidth={2.5} />
                                <p className="text-sm text-red-300 font-medium">{error}</p>
                            </div>
                        )}

                        {/* Category Tabs */}
                        <div className="px-6 py-6">
                            <div className="flex gap-3 overflow-x-auto scrollbar-none">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveCategory(tab.id)}
                                        className="relative px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-500 hover:scale-105"
                                        style={
                                            activeCategory === tab.id
                                                ? {
                                                    background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}E6 100%)`,
                                                    color: "#000",
                                                    boxShadow: `0 6px 24px ${colors.accent}50, 0 3px 12px ${colors.accent}35, inset 0 1px 0 rgba(255,255,255,0.4)`,
                                                    transform: "scale(1.05)"
                                                }
                                                : {
                                                    background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
                                                    color: "rgba(255,255,255,0.5)",
                                                    border: "1px solid rgba(255,255,255,0.06)"
                                                }
                                        }
                                    >
                                        {activeCategory === tab.id && <div className="absolute inset-0 bg-white/10 blur-sm rounded-2xl" />}
                                        <span className="relative z-10">{tab.label} {tab.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Track List */}
                        <div className="relative px-6 pb-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {/* Spotify Tab Content */}
                            {activeCategory === "spotify" ? (
                                <div className="space-y-4 py-2">
                                    {spotifyState?.is_running ? (
                                        <>
                                            {/* Now Playing Card */}
                                            {spotifyState.track ? (
                                                <div
                                                    className="p-5 rounded-2xl"
                                                    style={{
                                                        background: "linear-gradient(135deg, rgba(29, 185, 84, 0.15) 0%, rgba(29, 185, 84, 0.05) 100%)",
                                                        border: "1px solid rgba(29, 185, 84, 0.3)"
                                                    }}
                                                >
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-green-400/60 mb-3">NOW PLAYING</p>
                                                    <div className="flex items-center gap-4">
                                                        <div
                                                            className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0"
                                                            style={{ background: "rgba(29, 185, 84, 0.2)" }}
                                                        >
                                                            🎧
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-white text-lg truncate">{spotifyState.track.name}</p>
                                                            <p className="text-sm text-white/60 truncate">{spotifyState.track.artist}</p>
                                                            <p className="text-xs text-white/40 truncate">{spotifyState.track.album}</p>
                                                        </div>
                                                    </div>

                                                    {/* Controls */}
                                                    <div className="flex items-center justify-center gap-4 mt-5">
                                                        <button
                                                            onClick={() => spotifyService.previous()}
                                                            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all"
                                                        >
                                                            <SkipBack size={18} color="#fff" />
                                                        </button>
                                                        <button
                                                            onClick={() => spotifyService.toggle()}
                                                            className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105"
                                                            style={{ background: "#1DB954" }}
                                                        >
                                                            {spotifyState.is_playing ? <Pause size={24} color="#000" /> : <Play size={24} color="#000" />}
                                                        </button>
                                                        <button
                                                            onClick={() => spotifyService.next()}
                                                            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all"
                                                        >
                                                            <SkipForward size={18} color="#fff" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <p className="text-white/50">Spotify is running but nothing is playing</p>
                                                    <button
                                                        onClick={() => spotifyService.play()}
                                                        className="mt-4 px-6 py-3 rounded-xl font-bold"
                                                        style={{ background: "#1DB954", color: "#000" }}
                                                    >
                                                        ▶ Play
                                                    </button>
                                                </div>
                                            )}

                                            {/* Volume Slider */}
                                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                <div className="flex items-center gap-3">
                                                    <Volume2 size={16} color="#1DB954" />
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        value={spotifyState.volume}
                                                        onChange={(e) => spotifyService.setVolume(parseInt(e.target.value))}
                                                        className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                                                        style={{
                                                            background: `linear-gradient(to right, #1DB954 0%, #1DB954 ${spotifyState.volume}%, rgba(255,255,255,0.1) ${spotifyState.volume}%, rgba(255,255,255,0.1) 100%)`
                                                        }}
                                                    />
                                                    <span className="text-xs text-white/40 w-8 text-right">{spotifyState.volume}%</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-12">
                                            <div
                                                className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                                                style={{ background: "rgba(29, 185, 84, 0.1)" }}
                                            >
                                                <svg width="40" height="40" viewBox="0 0 24 24" fill="#1DB954">
                                                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                                </svg>
                                            </div>
                                            <p className="text-white/40 text-sm mb-4">Spotify is not running</p>
                                            <button
                                                onClick={() => spotifyService.open()}
                                                className="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105"
                                                style={{ background: "#1DB954", color: "#000" }}
                                            >
                                                Open Spotify
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : sounds.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: `${colors.accent}15` }}>
                                        <Music size={32} style={{ color: colors.accent }} opacity={0.5} />
                                    </div>
                                    <p className="text-white/30 text-sm font-medium">No tracks in this category</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {sounds.map(track => (
                                        <div
                                            key={track.id}
                                            onClick={() => play(track)}
                                            title={track.description || track.experience || track.name}
                                            className={`group relative flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden ${currentTrack?.id === track.id
                                                ? "scale-[1.02]"
                                                : "hover:scale-[1.01]"
                                                }`}
                                            style={
                                                currentTrack?.id === track.id
                                                    ? {
                                                        background: `linear-gradient(135deg, ${colors.accent}20 0%, ${colors.accent}10 100%)`,
                                                        border: `1px solid ${colors.accent}40`,
                                                        boxShadow: `0 4px 20px ${colors.accent}25, inset 0 1px 0 ${colors.accent}20`
                                                    }
                                                    : {
                                                        background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                                                        border: "1px solid rgba(255,255,255,0.04)"
                                                    }
                                            }
                                        >
                                            {/* Hover Glow */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                            {/* Icon */}
                                            <div
                                                className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-all duration-500 ${currentTrack?.id === track.id && isLoading ? "animate-pulse" : ""
                                                    } group-hover:scale-110`}
                                                style={{
                                                    background: currentTrack?.id === track.id
                                                        ? `linear-gradient(135deg, ${colors.accent}30 0%, ${colors.accent}20 100%)`
                                                        : "rgba(255,255,255,0.05)",
                                                    boxShadow: currentTrack?.id === track.id
                                                        ? `0 4px 16px ${colors.accent}30, inset 0 1px 0 rgba(255,255,255,0.1)`
                                                        : "inset 0 1px 0 rgba(255,255,255,0.05)"
                                                }}
                                            >
                                                {track.icon}
                                            </div>

                                            {/* Info */}
                                            <div className="relative z-10 flex-1 min-w-0">
                                                <p className={`text-sm font-bold truncate transition-colors ${currentTrack?.id === track.id ? "text-white" : "text-white/80 group-hover:text-white"
                                                    }`}>
                                                    {track.name}
                                                </p>
                                                {track.description && (
                                                    <p className="text-[10px] text-white/40 truncate mb-1">
                                                        {track.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    {track.duration && (
                                                        <span
                                                            className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                                                            style={{
                                                                background: currentTrack?.id === track.id
                                                                    ? `${colors.accent}25`
                                                                    : "rgba(255,255,255,0.06)",
                                                                color: currentTrack?.id === track.id
                                                                    ? colors.accent
                                                                    : "rgba(255,255,255,0.4)"
                                                            }}
                                                        >
                                                            {track.duration}
                                                        </span>
                                                    )}
                                                    {track.isPlaylist && (
                                                        <span
                                                            className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                                                            style={{
                                                                background: `${colors.accent}20`,
                                                                color: colors.accent
                                                            }}
                                                        >
                                                            SHUFFLE
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Playing Indicator */}
                                            {currentTrack?.id === track.id && isPlaying && (
                                                <div className="relative z-10 flex gap-1 items-end h-5" style={{ width: "20px" }}>
                                                    {[1, 2, 3].map(i => (
                                                        <div
                                                            key={i}
                                                            className="w-1 rounded-full animate-sound-wave"
                                                            style={{
                                                                background: colors.accent,
                                                                animationDelay: `${i * 0.15}s`,
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            {/* Favorite Button */}
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    toggleFavorite(track.id);
                                                    setFavorites(loadSoundLibrary().favorites);
                                                }}
                                                className="relative z-10 opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-white/10 transition-all"
                                            >
                                                <Heart
                                                    size={16}
                                                    fill={favorites.includes(track.id) ? "#F43F5E" : "none"}
                                                    color={favorites.includes(track.id) ? "#F43F5E" : "#666"}
                                                />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Now Playing Bar */}
                        {currentTrack && (
                            <div
                                className="p-5 border-t border-white/5"
                                style={{ background: "rgba(0,0,0,0.4)" }}
                            >
                                {/* Progress Bar */}
                                {!currentTrack.url.startsWith('frequency-mix://') && isDirectAudio(currentTrack.url) && duration > 0 && (
                                    <div className="mb-3">
                                        <div className="flex items-center gap-2 text-[10px] text-white/40 mb-1.5">
                                            <span>{Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}</span>
                                            <div className="flex-1">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max={duration || 0}
                                                    step="0.1"
                                                    value={currentTime}
                                                    onChange={(e) => {
                                                        const newTime = parseFloat(e.target.value);
                                                        if (audioRef.current) {
                                                            audioRef.current.currentTime = newTime;
                                                            setCurrentTime(newTime);
                                                        }
                                                    }}
                                                    className="w-full h-1 rounded-full appearance-none cursor-pointer"
                                                    style={{
                                                        background: `linear-gradient(to right, ${colors.accent} 0%, ${colors.accent} ${(currentTime / duration) * 100}%, rgba(255,255,255,0.1) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.1) 100%)`
                                                    }}
                                                />
                                            </div>
                                            <span>{Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    {/* Track Info */}
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div
                                            className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0"
                                            style={{ background: error ? "#F43F5E20" : `${colors.accent}20` }}
                                        >
                                            {error ? <AlertCircle size={18} color="#F43F5E" /> : currentTrack.icon}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{currentTrack.name}</p>
                                            <p className="text-[10px] text-white/40">
                                                {error ? "Playback failed" : isLoading ? "Loading..." : "Now playing"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center gap-4 justify-center">
                                        <button
                                            onClick={() => setIsShuffleOn(!isShuffleOn)}
                                            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors font-bold text-xl"
                                            style={{ color: isShuffleOn ? colors.accent : "#666" }}
                                            title="Shuffle"
                                        >
                                            🔀
                                        </button>

                                        <button
                                            onClick={prev}
                                            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-white/70 hover:text-white font-bold text-xl"
                                            title="Previous"
                                        >
                                            ⏮
                                        </button>

                                        <button
                                            onClick={toggle}
                                            className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-2xl transition-transform hover:scale-110 active:scale-95"
                                            style={{
                                                background: colors.accent,
                                                color: "#000",
                                                boxShadow: `0 8px 24px ${colors.accent}60, 0 4px 8px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.25)`
                                            }}
                                            title={isPlaying ? "Pause" : "Play"}
                                        >
                                            {isPlaying ? "⏸" : "▶"}
                                        </button>

                                        <button
                                            onClick={next}
                                            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-white/70 hover:text-white font-bold text-xl"
                                            title="Next"
                                        >
                                            ⏭
                                        </button>

                                        <button
                                            onClick={() => setIsLoopOn(!isLoopOn)}
                                            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors font-bold text-xl"
                                            style={{ color: isLoopOn ? colors.accent : "#666" }}
                                            title="Repeat"
                                        >
                                            🔁
                                        </button>

                                        {/* Volume Controls */}
                                        <div className="flex items-center gap-2 relative">
                                            <button
                                                onClick={() => {
                                                    setIsMuted(!isMuted);
                                                    // Handle frequency mix volume
                                                    if (currentTrack?.url.startsWith('frequency-mix://')) {
                                                        const engine = getFrequencyEngine();
                                                        engine.setMasterVolume(!isMuted ? 0 : volume);
                                                    } else if (audioRef.current) {
                                                        audioRef.current.muted = !isMuted;
                                                    }
                                                }}
                                                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 shrink-0"
                                                title={!isDirectAudio(currentTrack.url) && !currentTrack.url.startsWith('frequency-mix://') ? "Use system volume for YouTube tracks" : ""}
                                            >
                                                {isMuted ? <VolumeX size={14} color="#555" /> : <Volume2 size={14} color={colors.accent} />}
                                            </button>

                                            {/* Volume Slider */}
                                            <div className="relative">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.01"
                                                    value={isMuted ? 0 : volume}
                                                    onChange={(e) => {
                                                        const newVolume = parseFloat(e.target.value);
                                                        setVolume(newVolume);
                                                        if (newVolume === 0) {
                                                            setIsMuted(true);
                                                        } else {
                                                            setIsMuted(false);
                                                        }

                                                        // Handle frequency mix volume
                                                        if (currentTrack?.url.startsWith('frequency-mix://')) {
                                                            const engine = getFrequencyEngine();
                                                            engine.setMasterVolume(newVolume);
                                                        } else if (audioRef.current) {
                                                            audioRef.current.volume = newVolume;
                                                        }
                                                    }}
                                                    className="w-16 h-1 rounded-full appearance-none bg-white/10 cursor-pointer"
                                                    style={{
                                                        background: `linear-gradient(to right, ${colors.accent} 0%, ${colors.accent} ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) 100%)`,
                                                        opacity: !isDirectAudio(currentTrack.url) && !currentTrack.url.startsWith('frequency-mix://') ? 0.4 : 1
                                                    }}
                                                    title={!isDirectAudio(currentTrack.url) && !currentTrack.url.startsWith('frequency-mix://') ? "Volume control unavailable for YouTube. Use system volume." : ""}
                                                />
                                                {!isDirectAudio(currentTrack.url) && !currentTrack.url.startsWith('frequency-mix://') && (
                                                    <div className="absolute -bottom-6 left-0 text-[8px] text-white/30 whitespace-nowrap">
                                                        Use system volume
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div >
                )
                }
            </div >
        </>
    );
}
