import { useState, useEffect } from 'react';
import { Play, Search, Plus, Trash2, ExternalLink, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { youtubeService } from '../services/youtube/YouTubeService';
import type { YouTubeVideo } from '../services/youtube/YouTubeService';
import { eventBus } from '../services/events/EventBus';

const YOUTUBE_RED = '#FF0000';

interface YouTubeSettingsViewProps {
    accent: string;
    onBack?: () => void;
}

export function YouTubeSettingsView({ accent: _accent, onBack }: YouTubeSettingsViewProps) {
    const [isConfigured, setIsConfigured] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([]);
    const [favorites, setFavorites] = useState<YouTubeVideo[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showApiSetup, setShowApiSetup] = useState(false);

    useEffect(() => {
        setIsConfigured(youtubeService.isConfigured());
        setFavorites(youtubeService.getFavorites());
    }, []);

    const handleSaveApiKey = () => {
        if (!apiKey.trim()) return;
        youtubeService.setApiKey(apiKey.trim());
        setIsConfigured(true);
        setShowApiSetup(false);
        setApiKey('');
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const results = await youtubeService.search(searchQuery);
            setSearchResults(results);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddFavorite = (video: YouTubeVideo) => {
        youtubeService.saveFavorite(video);
        setFavorites(youtubeService.getFavorites());
    };

    const handleRemoveFavorite = (videoId: string) => {
        youtubeService.removeFavorite(videoId);
        setFavorites(youtubeService.getFavorites());
    };

    const handlePlayVideo = (video: YouTubeVideo) => {
        eventBus.emit({
            type: "PLAY_TRACK",
            url: video.url,
            name: video.title
        });
    };

    const handleClearApiKey = () => {
        youtubeService.clearApiKey();
        setIsConfigured(false);
        setSearchResults([]);
    };

    return (
        <div className="min-h-screen p-16" style={{ background: 'linear-gradient(to bottom, #0a0a0a, #1a0000)' }}>
            <div className="max-w-6xl mx-auto space-y-16">

                {/* Back Button */}
                {onBack && (
                    <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={onBack}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 group"
                    >
                        <ArrowLeft size={16} style={{ color: YOUTUBE_RED }} />
                        <span className="text-sm font-medium text-white/60 group-hover:text-white/90">Back to Settings</span>
                    </motion.button>
                )}

                {/* Hero Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-6"
                >
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6"
                        style={{ background: `${YOUTUBE_RED}15` }}
                    >
                        <svg width="56" height="40" viewBox="0 0 159 110" fill={YOUTUBE_RED}>
                            <path d="M154 17.5c-1.82-6.73-7.07-12-13.8-13.8C128.6 0 79.5 0 79.5 0S30.4 0 18.8 3.7C12.07 5.5 6.82 10.77 5 17.5 1.45 29.1 1.45 55 1.45 55s0 25.9 3.55 37.5c1.82 6.73 7.07 12 13.8 13.8C30.4 110 79.5 110 79.5 110s49.1 0 60.7-3.7c6.73-1.8 11.98-7.07 13.8-13.8 3.55-11.6 3.55-37.5 3.55-37.5s0-25.9-3.55-37.5zM64 79V31l40.28 24L64 79z" />
                        </svg>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tight">YouTube</h1>
                    <p className="text-xl text-white/40 max-w-2xl mx-auto leading-relaxed">
                        Search billions of videos, save your favorites, and play them ad-free
                    </p>
                    {isConfigured && (
                        <button
                            onClick={handleClearApiKey}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 text-white/60 hover:bg-white/10 transition-all"
                        >
                            <Trash2 size={16} />
                            Clear API Key
                        </button>
                    )}
                </motion.div>

                {/* API Setup */}
                {!isConfigured && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="p-12 rounded-[32px] space-y-10"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.05), rgba(255, 0, 0, 0.02))',
                                border: `1px solid ${YOUTUBE_RED}20`
                            }}
                        >
                            <div className="space-y-4">
                                <h2 className="text-3xl font-black text-white">Get Started</h2>
                                <p className="text-lg text-white/50">
                                    Free API key • 10,000 requests/day •{' '}
                                    <a href="file:///Users/anweshrath/Documents/My Apps/pomodoro/API_SETUP_GUIDE.md"
                                        target="_blank"
                                        className="text-red-400 hover:text-red-300 inline-flex items-center gap-1">
                                        Full guide <ExternalLink size={14} />
                                    </a>
                                </p>
                            </div>

                            {!showApiSetup ? (
                                <button
                                    onClick={() => setShowApiSetup(true)}
                                    className="w-full py-6 rounded-2xl font-bold text-lg text-white transition-all hover:scale-[1.02]"
                                    style={{
                                        background: YOUTUBE_RED,
                                        boxShadow: `0 8px 32px ${YOUTUBE_RED}40`
                                    }}
                                >
                                    Connect YouTube
                                </button>
                            ) : (
                                <div className="space-y-6">
                                    <input
                                        type="password"
                                        placeholder="Paste your YouTube API key..."
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white text-lg placeholder-white/30 font-mono focus:outline-none focus:border-red-500/50"
                                    />
                                    <button
                                        onClick={handleSaveApiKey}
                                        disabled={!apiKey.trim()}
                                        className="w-full py-5 rounded-2xl font-bold text-lg text-white disabled:opacity-50 transition-all hover:scale-[1.02]"
                                        style={{ background: YOUTUBE_RED }}
                                    >
                                        Save API Key
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Search */}
                {isConfigured && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-8"
                    >
                        <div className="max-w-3xl mx-auto">
                            <div className="relative">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" size={24} />
                                <input
                                    type="text"
                                    placeholder="Search for focus music, study videos, ambient sounds..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-16 pr-40 py-6 rounded-3xl bg-white/5 border border-white/10 text-white text-lg placeholder-white/30 focus:outline-none focus:border-red-500/50 transition-all"
                                />
                                <button
                                    onClick={handleSearch}
                                    disabled={isSearching || !searchQuery.trim()}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 px-8 py-3 rounded-2xl font-bold text-white disabled:opacity-50 transition-all hover:scale-105"
                                    style={{ background: YOUTUBE_RED }}
                                >
                                    {isSearching ? 'Searching...' : 'Search'}
                                </button>
                            </div>
                        </div>

                        {/* Search Results */}
                        <AnimatePresence>
                            {searchResults.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="grid grid-cols-1 gap-6"
                                >
                                    {searchResults.map((video, i) => (
                                        <motion.div
                                            key={video.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="group p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] hover:border-red-500/30 transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center gap-8">
                                                <div className="relative flex-shrink-0 overflow-hidden rounded-2xl group-hover:scale-105 transition-transform">
                                                    <img src={video.thumbnail} alt="" className="w-64 h-36 object-cover" />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Play size={48} fill="#fff" color="#fff" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-3">
                                                    <h4 className="font-bold text-white text-xl leading-snug group-hover:text-red-400 transition-colors line-clamp-2">{video.title}</h4>
                                                    <p className="text-white/40">{video.channelTitle}</p>
                                                    <p className="text-white/20 text-sm">{video.duration}</p>
                                                </div>
                                                <div className="flex gap-4 flex-shrink-0">
                                                    <button
                                                        onClick={() => handlePlayVideo(video)}
                                                        className="w-14 h-14 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                                                        style={{ background: YOUTUBE_RED }}
                                                    >
                                                        <Play size={24} fill="#fff" color="#fff" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAddFavorite(video)}
                                                        className="w-14 h-14 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                                                    >
                                                        <Plus size={24} color="#fff" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Favorites */}
                {favorites.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <h2 className="text-3xl font-black text-white">Your Library</h2>
                        <div className="grid grid-cols-1 gap-6">
                            {favorites.map((video) => (
                                <div key={video.id} className="group p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] hover:border-red-500/30 transition-all">
                                    <div className="flex items-center gap-8">
                                        <div className="relative flex-shrink-0 overflow-hidden rounded-2xl">
                                            <img src={video.thumbnail} alt="" className="w-64 h-36 object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-3">
                                            <h4 className="font-bold text-white text-xl leading-snug line-clamp-2">{video.title}</h4>
                                            <p className="text-white/40">{video.channelTitle}</p>
                                            <p className="text-white/20 text-sm">{video.duration}</p>
                                        </div>
                                        <div className="flex gap-4 flex-shrink-0">
                                            <button
                                                onClick={() => handlePlayVideo(video)}
                                                className="w-14 h-14 rounded-xl flex items-center justify-center hover:scale-110 transition-transform"
                                                style={{ background: YOUTUBE_RED }}
                                            >
                                                <Play size={24} fill="#fff" color="#fff" />
                                            </button>
                                            <button
                                                onClick={() => handleRemoveFavorite(video.id)}
                                                className="w-14 h-14 rounded-xl bg-white/10 hover:bg-red-500/20 flex items-center justify-center hover:scale-110 transition-all"
                                            >
                                                <Trash2 size={24} color="#ff5555" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
