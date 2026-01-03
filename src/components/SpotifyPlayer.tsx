import { useState } from "react";
import {
    Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
    Music, ExternalLink, Loader2
} from "lucide-react";
import { useSpotify } from "../hooks/useSpotify";

interface SpotifyPlayerProps {
    colors: {
        accent: string;
        text: string;
        textMuted: string;
    };
    compact?: boolean;
}

// Neon glass style
const neonGlass = (accent: string, isActive = false) => ({
    background: isActive
        ? `linear-gradient(135deg, ${accent}20 0%, rgba(0,0,0,0.4) 100%)`
        : "rgba(255,255,255,0.03)",
    backdropFilter: "blur(24px)",
    border: `1px solid ${isActive ? accent + "50" : "rgba(255,255,255,0.08)"}`,
    boxShadow: isActive
        ? `0 0 40px ${accent}25, inset 0 1px 0 rgba(255,255,255,0.15)`
        : "0 8px 32px rgba(0,0,0,0.2)",
});

export function SpotifyPlayer({ colors, compact = false }: SpotifyPlayerProps) {
    const {
        isRunning,
        isPlaying,
        volume,
        track,
        toggle,
        next,
        previous,
        setVolume,
        openSpotify,
        focusPlaylists,
        playUri,
    } = useSpotify();

    const [showVolume, setShowVolume] = useState(false);
    const [showPlaylists, setShowPlaylists] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handlePlayPlaylist = async (uri: string) => {
        setIsLoading(true);
        try {
            await playUri(uri);
        } finally {
            setIsLoading(false);
            setShowPlaylists(false);
        }
    };

    if (!isRunning && !showPlaylists) {
        if (compact) {
            return (
                <button
                    onClick={openSpotify}
                    className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-white/5 group border border-dashed border-white/10 hover:border-[#1DB954]/50"
                >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 group-hover:bg-[#1DB954] transition-colors">
                        <Music size={20} className="text-white/40 group-hover:text-black transition-colors" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-medium text-white/60 group-hover:text-white transition-colors">Connect Spotify</p>
                        <p className="text-[10px] text-white/30 group-hover:text-white/50">Click to launch</p>
                    </div>
                </button>
            );
        }

        return (
            <div
                className="p-4 rounded-2xl text-center"
                style={neonGlass(colors.accent)}
            >
                <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: "#1DB954" }}
                >
                    <Music size={28} color="#000" />
                </div>
                <p className="font-semibold mb-2" style={{ color: colors.text }}>Spotify Not Running</p>
                <p className="text-xs mb-4" style={{ color: colors.textMuted }}>Open Spotify to control music</p>
                <div className="flex gap-2 justify-center">
                    <button
                        onClick={openSpotify}
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105"
                        style={{ background: "#1DB954", color: "#000" }}
                    >
                        Open Spotify
                    </button>
                    <button
                        onClick={() => setShowPlaylists(true)}
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105"
                        style={{ background: "rgba(255,255,255,0.1)", color: colors.text }}
                    >
                        Pick Playlist
                    </button>
                </div>
            </div>
        );
    }

    if (showPlaylists) {
        return (
            <div
                className="p-4 rounded-2xl"
                style={neonGlass(colors.accent)}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm" style={{ color: colors.text }}>Focus Playlists</h3>
                    <button
                        onClick={() => setShowPlaylists(false)}
                        className="text-xs px-2 py-1 rounded-lg hover:bg-white/10"
                        style={{ color: colors.textMuted }}
                    >
                        Back
                    </button>
                </div>
                <div className="space-y-2">
                    {focusPlaylists.map((playlist) => (
                        <button
                            key={playlist.uri}
                            onClick={() => handlePlayPlaylist(playlist.uri)}
                            disabled={isLoading}
                            className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-white/5 group"
                        >
                            <span className="text-2xl">{playlist.mood}</span>
                            <div className="flex-1 text-left">
                                <p className="font-medium text-sm" style={{ color: colors.text }}>{playlist.name}</p>
                                <p className="text-xs" style={{ color: colors.textMuted }}>{playlist.description}</p>
                            </div>
                            <div
                                className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                style={{ background: "#1DB954" }}
                            >
                                {isLoading ? <Loader2 size={14} className="animate-spin" color="#000" /> : <Play size={14} color="#000" />}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (compact) {
        return (
            <div
                className="flex items-center gap-3 p-3 rounded-xl"
                style={neonGlass(colors.accent, isPlaying)}
            >
                {/* Album Art / Icon */}
                <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden shrink-0"
                    style={{ background: "#1DB954" }}
                >
                    {track?.artwork_url ? (
                        <img src={track.artwork_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <Music size={20} color="#000" />
                    )}
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: colors.text }}>
                        {track?.name || "No track playing"}
                    </p>
                    <p className="text-xs truncate" style={{ color: colors.textMuted }}>
                        {track?.artist || "Open Spotify to play music"}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={previous}
                        className="p-2 rounded-lg hover:bg-white/10 transition-all"
                    >
                        <SkipBack size={16} style={{ color: colors.textMuted }} />
                    </button>
                    <button
                        onClick={toggle}
                        className="p-2.5 rounded-xl transition-all hover:scale-110"
                        style={{ background: "#1DB954" }}
                    >
                        {isPlaying ? <Pause size={16} color="#000" /> : <Play size={16} color="#000" />}
                    </button>
                    <button
                        onClick={next}
                        className="p-2 rounded-lg hover:bg-white/10 transition-all"
                    >
                        <SkipForward size={16} style={{ color: colors.textMuted }} />
                    </button>
                </div>
            </div>
        );
    }

    // Full player
    return (
        <div
            className="p-5 rounded-2xl"
            style={neonGlass(colors.accent, isPlaying)}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div
                        className="w-6 h-6 rounded-md flex items-center justify-center"
                        style={{ background: "#1DB954" }}
                    >
                        <Music size={12} color="#000" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#1DB954" }}>
                        Spotify
                    </span>
                    {isPlaying && (
                        <div className="flex gap-0.5 ml-2">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="w-0.5 bg-green-400 rounded-full animate-pulse"
                                    style={{
                                        height: `${6 + i * 2}px`,
                                        animationDelay: `${i * 0.15}s`,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <button
                    onClick={() => window.open(`spotify:`, "_blank")}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-all"
                    title="Open in Spotify"
                >
                    <ExternalLink size={14} style={{ color: colors.textMuted }} />
                </button>
            </div>

            {/* Album Art & Track Info */}
            <div className="flex gap-4 mb-4">
                <div
                    className="w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden shrink-0"
                    style={{
                        background: track?.artwork_url ? "transparent" : "linear-gradient(135deg, #1DB954 0%, #169c46 100%)",
                        boxShadow: isPlaying ? "0 8px 30px rgba(29, 185, 84, 0.4)" : "0 4px 20px rgba(0,0,0,0.3)",
                    }}
                >
                    {track?.artwork_url ? (
                        <img src={track.artwork_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <Music size={32} color="#000" />
                    )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="font-bold text-lg truncate" style={{ color: colors.text }}>
                        {track?.name || "No track playing"}
                    </p>
                    <p className="text-sm truncate" style={{ color: colors.textMuted }}>
                        {track?.artist || "—"}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: colors.textMuted }}>
                        {track?.album || ""}
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-4">
                <button
                    onClick={previous}
                    className="p-3 rounded-xl hover:bg-white/10 transition-all hover:scale-110 active:scale-95"
                >
                    <SkipBack size={22} style={{ color: colors.text }} />
                </button>
                <button
                    onClick={toggle}
                    className="p-4 rounded-2xl transition-all hover:scale-110 active:scale-95"
                    style={{
                        background: "linear-gradient(135deg, #1DB954 0%, #169c46 100%)",
                        boxShadow: "0 8px 30px rgba(29, 185, 84, 0.4)",
                    }}
                >
                    {isPlaying ? <Pause size={28} color="#000" /> : <Play size={28} color="#000" className="ml-0.5" />}
                </button>
                <button
                    onClick={next}
                    className="p-3 rounded-xl hover:bg-white/10 transition-all hover:scale-110 active:scale-95"
                >
                    <SkipForward size={22} style={{ color: colors.text }} />
                </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setShowVolume(!showVolume)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-all"
                >
                    {volume === 0 ? (
                        <VolumeX size={16} style={{ color: colors.textMuted }} />
                    ) : (
                        <Volume2 size={16} style={{ color: colors.textMuted }} />
                    )}
                </button>
                {showVolume && (
                    <div className="flex-1 relative h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                        <div
                            className="absolute h-full rounded-full transition-all duration-150"
                            style={{
                                width: `${volume}%`,
                                background: "linear-gradient(90deg, #1DB954 0%, #169c46 100%)",
                            }}
                        />
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={volume}
                            onChange={(e) => setVolume(parseInt(e.target.value))}
                            className="absolute inset-0 w-full opacity-0 cursor-pointer"
                        />
                    </div>
                )}
                <button
                    onClick={() => setShowPlaylists(true)}
                    className="ml-auto text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-white/10"
                    style={{ color: colors.textMuted }}
                >
                    Playlists
                </button>
            </div>
        </div>
    );
}
