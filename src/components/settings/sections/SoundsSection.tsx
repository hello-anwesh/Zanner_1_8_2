import { useState, useEffect, useRef } from "react";
import {
    Music2, Plus, Trash2, ExternalLink, Search,
    Play, Pause, Square, Disc3
} from "lucide-react";
import {
    SoundTrack, CATEGORIES, DEFAULT_SOUNDS, SoundCategory,
    loadSoundLibrary, addCustomSound, removeCustomSound
} from "../../../config/soundLibrary";

interface SoundsSectionProps {
    accent: string;
}

export function SoundsSection({ accent }: SoundsSectionProps) {
    const [allTracks, setAllTracks] = useState<SoundTrack[]>([]);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTrack, setNewTrack] = useState({
        name: "", url: "", icon: "🎵", category: "lofi" as SoundCategory, duration: ""
    });
    const [playingTrack, setPlayingTrack] = useState<string | null>(null);
    const [playingUrl, setPlayingUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    useEffect(() => {
        const state = loadSoundLibrary();
        setAllTracks([
            ...DEFAULT_SOUNDS,
            ...state.customSounds.map(t => ({ ...t, isCustom: true }))
        ]);
    }, []);

    useEffect(() => {
        return () => {
            audioRef.current?.pause();
        };
    }, []);

    const isDirectAudio = (url: string) =>
        url.match(/\.(mp3|wav|ogg|m4a|flac|aac)(\?.*)?$/i) || url.includes("archive.org/download");

    const isYouTube = (url: string) =>
        url.includes("youtube.com") || url.includes("youtu.be");

    const getYouTubeEmbedUrl = (url: string) => {
        // Handle various YouTube URL formats
        let videoId = "";
        if (url.includes("embed/")) {
            return url + (url.includes("?") ? "&" : "?") + "autoplay=1";
        }
        if (url.includes("youtu.be/")) {
            videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
        } else if (url.includes("v=")) {
            videoId = url.split("v=")[1]?.split("&")[0] || "";
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
    };

    const togglePlay = (track: SoundTrack) => {
        // If same track, stop it
        if (playingTrack === track.id) {
            audioRef.current?.pause();
            setPlayingTrack(null);
            setPlayingUrl(null);
            return;
        }

        // Stop any current playback
        audioRef.current?.pause();
        audioRef.current = null;

        setPlayingTrack(track.id);

        if (isDirectAudio(track.url)) {
            // Direct audio file
            setPlayingUrl(null);
            const audio = new Audio(track.url);
            audio.crossOrigin = "anonymous";
            audio.volume = 0.7;
            audio.onerror = () => {
                console.error("Audio error for:", track.url);
                setPlayingTrack(null);
            };
            audio.onended = () => setPlayingTrack(null);
            audio.play().catch((err) => {
                console.error("Play error:", err);
                setPlayingTrack(null);
            });
            audioRef.current = audio;
        } else if (isYouTube(track.url)) {
            // YouTube - use iframe
            setPlayingUrl(getYouTubeEmbedUrl(track.url));
        } else {
            // Unknown format - try as audio anyway
            setPlayingUrl(null);
            const audio = new Audio(track.url);
            audio.play().catch(() => setPlayingTrack(null));
            audioRef.current = audio;
        }
    };

    const stopAll = () => {
        audioRef.current?.pause();
        audioRef.current = null;
        setPlayingTrack(null);
        setPlayingUrl(null);
    };

    const filteredTracks = allTracks.filter(track => {
        const matchesSearch = track.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === "all" || track.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const handleAddTrack = () => {
        if (!newTrack.name || !newTrack.url) return;
        const track = addCustomSound(newTrack.name, newTrack.url, newTrack.icon);
        setAllTracks(prev => [...prev, { ...track, isCustom: true, category: newTrack.category, duration: newTrack.duration || "∞" }]);
        setNewTrack({ name: "", url: "", icon: "🎵", category: "lofi", duration: "" });
        setShowAddModal(false);
    };

    const handleDelete = (id: string) => {
        removeCustomSound(id);
        setAllTracks(prev => prev.filter(t => t.id !== id));
        if (playingTrack === id) stopAll();
    };

    const getCategoryCount = (catId: string) =>
        catId === "all" ? allTracks.length : allTracks.filter(t => t.category === catId).length;

    const categories = [
        { id: "all", name: "All", icon: "📚", color: accent },
        ...CATEGORIES.slice(0, 8),
    ];

    return (
        <div className="space-y-6">
            {/* Stats Header */}
            <div
                className="flex items-center justify-between p-5 rounded-2xl"
                style={{
                    background: `linear-gradient(135deg, ${accent}12 0%, transparent 50%)`,
                    border: `1px solid ${accent}20`,
                }}
            >
                <div className="flex items-center gap-4">
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: `${accent}20` }}
                    >
                        <Music2 size={22} style={{ color: accent }} />
                    </div>
                    <div>
                        <h4 className="text-base font-semibold text-white">{allTracks.length} Tracks</h4>
                        <p className="text-xs text-white/40">
                            {allTracks.filter(t => t.isCustom).length} custom • {CATEGORIES.length} categories
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {playingTrack && (
                        <button
                            onClick={stopAll}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25"
                        >
                            <Square size={14} />
                            Stop
                        </button>
                    )}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
                        style={{ background: accent, color: "#000" }}
                    >
                        <Plus size={16} />
                        Add Track
                    </button>
                </div>
            </div>

            {/* YouTube Player (hidden but functional) */}
            {playingUrl && (
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                        background: "rgba(0,0,0,0.5)",
                        border: `1px solid ${accent}30`,
                    }}
                >
                    <div className="flex items-center justify-between px-4 py-2 bg-black/30">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-1 bg-green-400 rounded-full animate-pulse"
                                        style={{
                                            height: `${8 + Math.random() * 8}px`,
                                            animationDelay: `${i * 0.1}s`,
                                        }}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-white/60">Now Playing</span>
                        </div>
                        <button
                            onClick={stopAll}
                            className="text-xs px-3 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        >
                            Stop
                        </button>
                    </div>
                    <iframe
                        ref={iframeRef}
                        src={playingUrl}
                        className="w-full h-16"
                        allow="autoplay; encrypted-media"
                        style={{ border: "none" }}
                    />
                </div>
            )}

            {/* Search */}
            <div
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
                <Search size={16} className="text-white/30" />
                <input
                    type="text"
                    placeholder="Search tracks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                />
                {search && (
                    <span className="text-xs px-2 py-1 rounded-lg bg-white/10 text-white/50">
                        {filteredTracks.length} found
                    </span>
                )}
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                        style={{
                            background: activeCategory === cat.id ? `${cat.color || accent}15` : "rgba(255,255,255,0.02)",
                            border: activeCategory === cat.id ? `1px solid ${cat.color || accent}30` : "1px solid rgba(255,255,255,0.04)",
                            color: activeCategory === cat.id ? cat.color || accent : "rgba(255,255,255,0.4)",
                        }}
                    >
                        <span>{cat.icon}</span>
                        {cat.name}
                        <span className="text-[10px] opacity-60">{getCategoryCount(cat.id)}</span>
                    </button>
                ))}
            </div>

            {/* Track List */}
            <div
                className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)" }}
            >
                {filteredTracks.length === 0 ? (
                    <div className="py-16 text-center">
                        <Disc3 size={40} className="mx-auto mb-4 text-white/10" />
                        <p className="text-sm text-white/30">No tracks found</p>
                    </div>
                ) : (
                    <div className="max-h-[320px] overflow-y-auto">
                        {filteredTracks.slice(0, 50).map(track => (
                            <div
                                key={track.id}
                                className={`group flex items-center gap-3 px-4 py-3 border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors ${playingTrack === track.id ? "bg-white/[0.03]" : ""
                                    }`}
                            >
                                {/* Play Button */}
                                <button
                                    onClick={() => togglePlay(track)}
                                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all shrink-0"
                                    style={{
                                        background: playingTrack === track.id ? `${accent}25` : "rgba(255,255,255,0.04)",
                                    }}
                                >
                                    {playingTrack === track.id ? (
                                        <Pause size={14} style={{ color: accent }} />
                                    ) : (
                                        <Play size={14} className="text-white/50 group-hover:text-white ml-0.5" />
                                    )}
                                </button>

                                {/* Icon & Name */}
                                <span className="text-lg shrink-0">{track.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${playingTrack === track.id ? "text-white" : "text-white/70"}`}>
                                        {track.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] text-white/25">{track.category}</span>
                                        {track.duration && <span className="text-[10px] text-white/20">• {track.duration}</span>}
                                        {track.isCustom && <span className="text-[10px] text-purple-400">• Custom</span>}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a
                                        href={track.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg hover:bg-white/10 text-white/30"
                                    >
                                        <ExternalLink size={13} />
                                    </a>
                                    {track.isCustom && (
                                        <button
                                            onClick={() => handleDelete(track.id)}
                                            className="p-2 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {filteredTracks.length > 50 && (
                            <div className="py-3 text-center text-xs text-white/20">
                                Showing 50 of {filteredTracks.length} tracks
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div
                        className="relative w-full max-w-md rounded-2xl p-6"
                        style={{ background: "linear-gradient(180deg, #1a1a1f 0%, #111114 100%)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                        <h3 className="text-lg font-semibold text-white mb-6">Add Custom Track</h3>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={newTrack.icon}
                                    onChange={(e) => setNewTrack({ ...newTrack, icon: e.target.value })}
                                    className="w-14 h-12 rounded-xl text-center text-xl bg-white/5 border border-white/10 outline-none"
                                    placeholder="🎵"
                                />
                                <input
                                    type="text"
                                    placeholder="Track name"
                                    value={newTrack.name}
                                    onChange={(e) => setNewTrack({ ...newTrack, name: e.target.value })}
                                    className="flex-1 h-12 px-4 rounded-xl text-sm text-white bg-white/5 border border-white/10 outline-none"
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="YouTube or MP3 URL"
                                value={newTrack.url}
                                onChange={(e) => setNewTrack({ ...newTrack, url: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl text-sm text-white bg-white/5 border border-white/10 outline-none"
                            />
                            <div className="flex gap-3">
                                <select
                                    value={newTrack.category}
                                    onChange={(e) => setNewTrack({ ...newTrack, category: e.target.value as SoundCategory })}
                                    className="flex-1 h-12 px-4 rounded-xl text-sm text-white bg-white/5 border border-white/10 outline-none cursor-pointer"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Duration"
                                    value={newTrack.duration}
                                    onChange={(e) => setNewTrack({ ...newTrack, duration: e.target.value })}
                                    className="w-24 h-12 px-4 rounded-xl text-sm text-white bg-white/5 border border-white/10 outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 py-3 rounded-xl text-sm text-white/50 bg-white/5 hover:bg-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddTrack}
                                disabled={!newTrack.name || !newTrack.url}
                                className="flex-1 py-3 rounded-xl text-sm font-medium disabled:opacity-40"
                                style={{ background: accent, color: "#000" }}
                            >
                                Add Track
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
