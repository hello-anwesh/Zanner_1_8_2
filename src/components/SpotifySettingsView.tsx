import { useState, useEffect } from 'react';
import { Play, Search, Plus, Trash2, LogOut, ExternalLink, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { spotifyService, FOCUS_PLAYLISTS, BREAK_PLAYLISTS } from '../services/spotify/SpotifyService';
import type { SpotifyState, SpotifySearchResult } from '../services/spotify/SpotifyService';

const SPOTIFY_GREEN = '#1DB954';

interface SpotifySettingsViewProps {
    accent: string;
    onBack?: () => void;
}

export function SpotifySettingsView({ accent: _accent, onBack }: SpotifySettingsViewProps) {
    const [spotifyState, setSpotifyState] = useState<SpotifyState | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [authCode, setAuthCode] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SpotifySearchResult[]>([]);
    const [favorites, setFavorites] = useState<SpotifySearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showAuthSetup, setShowAuthSetup] = useState(false);

    useEffect(() => {
        const updateState = async () => {
            const state = await spotifyService.getState();
            setSpotifyState(state);
        };

        setIsAuthenticated(spotifyService.isAuthenticated());
        setFavorites(spotifyService.getFavorites());

        updateState();
        const unsubscribe = spotifyService.subscribe(setSpotifyState);
        const interval = setInterval(updateState, 3000);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, []);

    const playPlaylist = async (uri: string) => {
        await spotifyService.playUri(uri);
    };

    const handleAuth = async () => {
        if (!clientId || !clientSecret) return;
        await spotifyService.authenticate(clientId, clientSecret);
    };

    const handleCodeSubmit = async () => {
        if (!authCode) return;
        try {
            await spotifyService.exchangeCode(authCode);
            setIsAuthenticated(true);
            setShowAuthSetup(false);
        } catch (error) {
            console.error('Auth failed:', error);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const results = await spotifyService.search(searchQuery);
            setSearchResults(results);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddFavorite = (item: SpotifySearchResult) => {
        spotifyService.saveFavorite(item);
        setFavorites(spotifyService.getFavorites());
    };

    const handleRemoveFavorite = (uri: string) => {
        spotifyService.removeFavorite(uri);
        setFavorites(spotifyService.getFavorites());
    };

    return (
        <div className="min-h-screen p-16" style={{ background: 'linear-gradient(to bottom, #0a0a0a, #121212)' }}>
            <div className="max-w-6xl mx-auto space-y-16">

                {/* Back Button */}
                {onBack && (
                    <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={onBack}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 group"
                    >
                        <ArrowLeft size={16} style={{ color: SPOTIFY_GREEN }} />
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
                        style={{ background: `${SPOTIFY_GREEN}15` }}
                    >
                        <svg width="48" height="48" viewBox="0 0 24 24" fill={SPOTIFY_GREEN}>
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                        </svg>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tight">Spotify</h1>
                    <p className="text-xl text-white/40 max-w-2xl mx-auto leading-relaxed">
                        Search millions of tracks, save your favorites, and play them instantly
                    </p>
                    {isAuthenticated && (
                        <button
                            onClick={() => { spotifyService.logout(); setIsAuthenticated(false); }}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 text-white/60 hover:bg-white/10 transition-all"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    )}
                </motion.div>

                {/* Auth Setup */}
                {!isAuthenticated && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="p-12 rounded-[32px] space-y-10"
                            style={{
                                background: 'linear-gradient(135deg, rgba(29, 185, 84, 0.05), rgba(29, 185, 84, 0.02))',
                                border: `1px solid ${SPOTIFY_GREEN}20`
                            }}
                        >
                            <div className="space-y-4">
                                <h2 className="text-3xl font-black text-white">Get Started</h2>
                                <p className="text-lg text-white/50">
                                    Free setup • Takes 3 minutes •{' '}
                                    <a href="file:///Users/anweshrath/Documents/My Apps/pomodoro/API_SETUP_GUIDE.md"
                                        target="_blank"
                                        className="text-green-400 hover:text-green-300 inline-flex items-center gap-1">
                                        Full guide <ExternalLink size={14} />
                                    </a>
                                </p>
                            </div>

                            {!showAuthSetup ? (
                                <button
                                    onClick={() => setShowAuthSetup(true)}
                                    className="w-full py-6 rounded-2xl font-bold text-lg text-black transition-all hover:scale-[1.02]"
                                    style={{
                                        background: SPOTIFY_GREEN,
                                        boxShadow: `0 8px 32px ${SPOTIFY_GREEN}40`
                                    }}
                                >
                                    Connect Spotify
                                </button>
                            ) : (
                                <div className="space-y-6">
                                    <input
                                        type="text"
                                        placeholder="Client ID"
                                        value={clientId}
                                        onChange={(e) => setClientId(e.target.value)}
                                        className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white text-lg placeholder-white/30 focus:outline-none focus:border-green-500/50"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Client Secret"
                                        value={clientSecret}
                                        onChange={(e) => setClientSecret(e.target.value)}
                                        className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white text-lg placeholder-white/30 focus:outline-none focus:border-green-500/50"
                                    />
                                    <button
                                        onClick={handleAuth}
                                        disabled={!clientId || !clientSecret}
                                        className="w-full py-5 rounded-2xl font-bold text-lg disabled:opacity-50"
                                        style={{ background: SPOTIFY_GREEN, color: '#000' }}
                                    >
                                        Authorize
                                    </button>

                                    <div className="pt-6 border-t border-white/10 space-y-4">
                                        <input
                                            type="text"
                                            placeholder="Paste authorization code here..."
                                            value={authCode}
                                            onChange={(e) => setAuthCode(e.target.value)}
                                            className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white text-lg placeholder-white/30 font-mono text-sm focus:outline-none focus:border-green-500/50"
                                        />
                                        <button
                                            onClick={handleCodeSubmit}
                                            disabled={!authCode}
                                            className="w-full py-5 rounded-2xl font-bold text-white bg-white/10 hover:bg-white/20 disabled:opacity-50 transition-all"
                                        >
                                            Complete Setup
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Search */}
                {isAuthenticated && (
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
                                    placeholder="Search albums, playlists, tracks..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-16 pr-40 py-6 rounded-3xl bg-white/5 border border-white/10 text-white text-lg placeholder-white/30 focus:outline-none focus:border-green-500/50 transition-all"
                                />
                                <button
                                    onClick={handleSearch}
                                    disabled={isSearching || !searchQuery.trim()}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 px-8 py-3 rounded-2xl font-bold disabled:opacity-50 transition-all hover:scale-105"
                                    style={{ background: SPOTIFY_GREEN, color: '#000' }}
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
                                    className="grid grid-cols-2 gap-6"
                                >
                                    {searchResults.map((result, i) => (
                                        <motion.div
                                            key={result.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="group p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] hover:border-green-500/30 transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center gap-6">
                                                {result.image && (
                                                    <img src={result.image} alt="" className="w-20 h-20 rounded-2xl object-cover" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-white text-lg mb-2 truncate group-hover:text-green-400 transition-colors">{result.name}</h4>
                                                    <p className="text-white/40 text-sm truncate">{result.artists || result.description}</p>
                                                    <p className="text-white/20 text-xs mt-1 uppercase">{result.type}</p>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => playPlaylist(result.uri)}
                                                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                                                        style={{ background: SPOTIFY_GREEN }}
                                                    >
                                                        <Play size={20} fill="#000" color="#000" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAddFavorite(result)}
                                                        className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                                                    >
                                                        <Plus size={20} color="#fff" />
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
                        <div className="grid grid-cols-2 gap-6">
                            {favorites.map((fav) => (
                                <div key={fav.id} className="group p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] hover:border-green-500/30 transition-all">
                                    <div className="flex items-center gap-6">
                                        {fav.image && (<img src={fav.image} alt="" className="w-20 h-20 rounded-2xl" />)}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-white text-lg mb-2 truncate">{fav.name}</h4>
                                            <p className="text-white/40 text-sm truncate">{fav.artists || fav.description}</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => playPlaylist(fav.uri)} className="w-12 h-12 rounded-xl flex items-center justify-center hover:scale-110 transition-transform" style={{ background: SPOTIFY_GREEN }}>
                                                <Play size={20} fill="#000" color="#000" />
                                            </button>
                                            <button onClick={() => handleRemoveFavorite(fav.uri)} className="w-12 h-12 rounded-xl bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center hover:scale-110 transition-all">
                                                <Trash2 size={20} color="#ff5555" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Curated Playlists */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    <div>
                        <h2 className="text-3xl font-black text-white mb-8">Focus Playlists</h2>
                        <div className="grid grid-cols-3 gap-6">
                            {FOCUS_PLAYLISTS.map((playlist, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => playPlaylist(playlist.uri)}
                                    className="p-8 rounded-3xl text-left transition-all group"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}
                                >
                                    <div className="text-5xl mb-6">{playlist.mood}</div>
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors">{playlist.name}</h3>
                                    <p className="text-white/40 text-sm leading-relaxed">{playlist.description}</p>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-3xl font-black text-white mb-8">Break Music</h2>
                        <div className="grid grid-cols-3 gap-6">
                            {BREAK_PLAYLISTS.map((playlist, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => playPlaylist(playlist.uri)}
                                    className="p-8 rounded-3xl text-left transition-all group"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}
                                >
                                    <div className="text-5xl mb-6">{playlist.mood}</div>
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors">{playlist.name}</h3>
                                    <p className="text-white/40 text-sm leading-relaxed">{playlist.description}</p>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
