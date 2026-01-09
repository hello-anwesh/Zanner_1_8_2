import { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Music, Search, Plus, Trash2, Key, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { spotifyService, FOCUS_PLAYLISTS, BREAK_PLAYLISTS } from '../services/spotify/SpotifyService';
import type { SpotifyState, SpotifySearchResult } from '../services/spotify/SpotifyService';

interface SpotifySettingsViewProps {
    accent: string;
}

export function SpotifySettingsView({ accent: _accent }: SpotifySettingsViewProps) {
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

        // Check authentication
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
        if (!clientId || !clientSecret) {
            alert('Please enter both Client ID and Client Secret');
            return;
        }
        await spotifyService.authenticate(clientId, clientSecret);
        alert('Authorization window opened! After authorizing, copy the code from the URL and paste it below.');
    };

    const handleCodeSubmit = async () => {
        if (!authCode) return;
        try {
            await spotifyService.exchangeCode(authCode);
            setIsAuthenticated(true);
            setShowAuthSetup(false);
            setAuthCode('');
            alert('Successfully authenticated!');
        } catch (error) {
            alert('Failed to authenticate. Please try again.');
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const results = await spotifyService.search(searchQuery);
            setSearchResults(results);
        } catch (error) {
            alert('Search failed. Make sure you\'re authenticated.');
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

    const handleLogout = () => {
        spotifyService.logout();
        setIsAuthenticated(false);
        setSearchResults([]);
    };

    return (
        <div className="p-12 max-w-5xl mx-auto space-y-10" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <span className="px-5 py-2.5 rounded-2xl text-sm font-black uppercase tracking-wider bg-white/[0.08] text-white/60 border border-white/[0.15] inline-block">
                    Spotify Integration
                </span>
                {isAuthenticated && (
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-2 hover:bg-red-500/30 transition-colors"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                )}
            </div>

            {/* Authentication Setup */}
            {!isAuthenticated && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 rounded-[28px] space-y-6"
                    style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        backdropFilter: "blur(30px)"
                    }}
                >
                    <div className="flex items-center gap-4">
                        <Key size={24} className="text-green-400" />
                        <h3 className="font-black text-2xl text-white">Spotify Web API Setup</h3>
                    </div>

                    <p className="text-white/60">
                        To search Spotify and save favorites, you need to set up API credentials:
                    </p>

                    <ol className="text-white/60 space-y-2 list-decimal list-inside">
                        <li>Go to <a href="https://developer.spotify.com/dashboard" target="_blank" className="text-green-400 hover:underline">Spotify Developer Dashboard</a></li>
                        <li>Create a new app</li>
                        <li>Set Redirect URI to: <code className="px-2 py-1 bg-white/10 rounded">http://localhost:3000/callback</code></li>
                        <li>Copy your Client ID and Client Secret below</li>
                    </ol>

                    {showAuthSetup ? (
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Client ID"
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/40"
                            />
                            <input
                                type="password"
                                placeholder="Client Secret"
                                value={clientSecret}
                                onChange={(e) => setClientSecret(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/40"
                            />
                            <button
                                onClick={handleAuth}
                                className="w-full px-6 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors"
                            >
                                Authorize with Spotify
                            </button>

                            <div className="space-y-2">
                                <label className="text-white/60 text-sm">After authorizing, paste the code from the URL:</label>
                                <input
                                    type="text"
                                    placeholder="Authorization code"
                                    value={authCode}
                                    onChange={(e) => setAuthCode(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/40"
                                />
                                <button
                                    onClick={handleCodeSubmit}
                                    disabled={!authCode}
                                    className="w-full px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors disabled:opacity-50"
                                >
                                    Complete Setup
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowAuthSetup(true)}
                            className="w-full px-6 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors"
                        >
                            Set Up Spotify API
                        </button>
                    )}
                </motion.div>
            )}

            {/* Connection Status */}
            <motion.div
                whileHover={{ scale: 1.01 }}
                className="p-8 rounded-[28px]"
                style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    backdropFilter: "blur(30px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
                }}
            >
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-6">
                        <div
                            className="w-20 h-20 rounded-[22px] flex items-center justify-center"
                            style={{ background: spotifyState?.is_running ? '#1DB95425' : 'rgba(255,255,255,0.06)' }}
                        >
                            <svg width="40" height="40" viewBox="0 0 24 24" fill={spotifyState?.is_running ? '#1DB954' : '#666'}>
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-black text-2xl mb-2 text-white leading-none">
                                {spotifyState?.is_running ? 'Connected' : 'Not Connected'}
                            </h3>
                            <p className="text-base font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                                {spotifyState?.is_running
                                    ? (spotifyState.track?.name ? `Playing: ${spotifyState.track.name}` : 'Spotify is running')
                                    : 'Open Spotify to connect'}
                            </p>
                        </div>
                    </div>
                    <div
                        className="w-4 h-4 rounded-full"
                        style={{
                            background: spotifyState?.is_running ? '#1DB954' : '#666',
                            boxShadow: spotifyState?.is_running ? '0 0 16px #1DB954' : 'none'
                        }}
                    />
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => spotifyService.open()}
                    className="w-full px-8 py-5 rounded-[20px] font-black text-base transition-all"
                    style={{
                        background: spotifyState?.is_running ? 'rgba(29, 185, 84, 0.2)' : '#1DB954',
                        color: spotifyState?.is_running ? '#1DB954' : 'white',
                        border: spotifyState?.is_running ? '1.5px solid #1DB95460' : 'none',
                        boxShadow: spotifyState?.is_running ? 'none' : '0 8px 24px rgba(29, 185, 84, 0.4)'
                    }}
                >
                    {spotifyState?.is_running ? '✓ Spotify Connected' : 'Open Spotify'}
                </motion.button>
            </motion.div>

            {/* Search Section - Only show if authenticated */}
            {isAuthenticated && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <h3 className="font-black text-2xl text-white flex items-center gap-3">
                        <Search size={24} />
                        Search Spotify
                    </h3>

                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Search albums, playlists, or tracks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="flex-1 px-6 py-4 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/40 font-medium"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={isSearching || !searchQuery.trim()}
                            className="px-8 py-4 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSearching ? 'Searching...' : <><Search size={20} /> Search</>}
                        </button>
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="grid grid-cols-2 gap-4">
                            {searchResults.map((result) => (
                                <div
                                    key={result.id}
                                    className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors"
                                >
                                    {result.image && (
                                        <img src={result.image} alt={result.name} className="w-16 h-16 rounded-lg" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-white truncate">{result.name}</p>
                                        <p className="text-sm text-white/60 truncate">
                                            {result.type === 'track' ? result.artists : result.description || result.type}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => playPlaylist(result.uri)}
                                            className="p-2 rounded-lg bg-green-500 hover:bg-green-600 transition-colors"
                                        >
                                            <Play size={16} className="text-white" />
                                        </button>
                                        <button
                                            onClick={() => handleAddFavorite(result)}
                                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                        >
                                            <Plus size={16} className="text-white" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* My Favorites */}
            {favorites.length > 0 && (
                <div className="space-y-6">
                    <h3 className="font-black text-2xl text-white flex items-center gap-3">
                        ❤️ My Favorites
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {favorites.map((fav) => (
                            <div
                                key={fav.id}
                                className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors"
                            >
                                {fav.image && (
                                    <img src={fav.image} alt={fav.name} className="w-16 h-16 rounded-lg" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-white truncate">{fav.name}</p>
                                    <p className="text-sm text-white/60 truncate">
                                        {fav.type === 'track' ? fav.artists : fav.description || fav.type}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => playPlaylist(fav.uri)}
                                        className="p-2 rounded-lg bg-green-500 hover:bg-green-600 transition-colors"
                                    >
                                        <Play size={16} className="text-white" />
                                    </button>
                                    <button
                                        onClick={() => handleRemoveFavorite(fav.uri)}
                                        className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                                    >
                                        <Trash2 size={16} className="text-red-400" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Now Playing */}
            {spotifyState?.is_running && spotifyState.track && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 rounded-[28px]"
                    style={{
                        background: 'linear-gradient(135deg, rgba(29, 185, 84, 0.12) 0%, rgba(29, 185, 84, 0.05) 100%)',
                        border: '1.5px solid rgba(29, 185, 84, 0.3)',
                        boxShadow: '0 8px 32px rgba(29, 185, 84, 0.2)'
                    }}
                >
                    <p className="text-sm font-bold uppercase tracking-wider text-green-400/70 mb-6">NOW PLAYING</p>
                    <h4 className="font-black text-2xl text-white mb-3 leading-tight">{spotifyState.track.name}</h4>
                    <p className="text-lg font-medium mb-8" style={{ color: "rgba(255,255,255,0.6)" }}>{spotifyState.track.artist}</p>

                    <div className="flex items-center justify-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => spotifyService.previous()}
                            className="p-4 rounded-[18px] bg-white/10 hover:bg-white/20 transition-all"
                        >
                            <SkipBack size={20} className="text-white" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => spotifyService.toggle()}
                            className="p-5 rounded-[20px]"
                            style={{ background: '#1DB954', boxShadow: '0 8px 24px rgba(29, 185, 84, 0.4)' }}
                        >
                            {spotifyState.is_playing ? <Pause size={24} color="#000" /> : <Play size={24} color="#000" />}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => spotifyService.next()}
                            className="p-4 rounded-[18px] bg-white/10 hover:bg-white/20 transition-all"
                        >
                            <SkipForward size={20} className="text-white" />
                        </motion.button>
                    </div>
                </motion.div>
            )}

            {/* Default Playlists */}
            <div className="space-y-6">
                <h3 className="font-black text-2xl text-white leading-none flex items-center gap-3">
                    <span>🎯</span> Focus Playlists
                </h3>
                <div className="grid grid-cols-2 gap-5">
                    {FOCUS_PLAYLISTS.map((playlist, index) => (
                        <motion.button
                            key={index}
                            whileHover={{ scale: 1.03, y: -4 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => playPlaylist(playlist.uri)}
                            className="p-6 rounded-[24px] text-left group transition-all"
                            style={{
                                background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                                border: "1px solid rgba(255,255,255,0.12)",
                                boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
                            }}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-[18px] bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-2xl shadow-xl">
                                    <Music size={24} color="#fff" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-black text-lg text-white leading-none mb-2">{playlist.name}</p>
                                    <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>{playlist.description}</p>
                                </div>
                            </div>
                            <span className="text-2xl">{playlist.mood}</span>
                        </motion.button>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="font-black text-2xl text-white leading-none flex items-center gap-3">
                    <span>☕</span> Break Playlists
                </h3>
                <div className="grid grid-cols-2 gap-5">
                    {BREAK_PLAYLISTS.map((playlist, index) => (
                        <motion.button
                            key={index}
                            whileHover={{ scale: 1.03, y: -4 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => playPlaylist(playlist.uri)}
                            className="p-6 rounded-[24px] text-left group transition-all"
                            style={{
                                background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                                border: "1px solid rgba(255,255,255,0.12)",
                                boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
                            }}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-[18px] bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl shadow-xl">
                                    <Music size={24} color="#fff" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-black text-lg text-white leading-none mb-2">{playlist.name}</p>
                                    <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>{playlist.description}</p>
                                </div>
                            </div>
                            <span className="text-2xl">{playlist.mood}</span>
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
}
