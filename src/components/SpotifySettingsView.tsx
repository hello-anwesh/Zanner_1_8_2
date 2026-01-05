import { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Music } from 'lucide-react';
import { motion } from 'framer-motion';
import { spotifyService, FOCUS_PLAYLISTS, BREAK_PLAYLISTS } from '../services/spotify/SpotifyService';
import type { SpotifyState } from '../services/spotify/SpotifyService';

interface SpotifySettingsViewProps {
    accent: string;
}

export function SpotifySettingsView({ accent: _accent }: SpotifySettingsViewProps) {
    const [spotifyState, setSpotifyState] = useState<SpotifyState | null>(null);

    useEffect(() => {
        const updateState = async () => {
            const state = await spotifyService.getState();
            setSpotifyState(state);
        };

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

    return (
        <div className="p-12 max-w-5xl mx-auto space-y-10" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
            {/* Header */}
            <span className="px-5 py-2.5 rounded-2xl text-sm font-black uppercase tracking-wider bg-white/[0.08] text-white/60 border border-white/[0.15] inline-block">
                Spotify Integration
            </span>

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

                    {/* Playback Controls */}
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

            {/* Focus Playlists */}
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

            {/* Break Playlists */}
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

            {/* Info */}
            <div className="p-6 rounded-[24px] bg-white/[0.04] border border-white/[0.1]">
                <p className="text-sm font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                    💡 This app controls your Spotify desktop app via AppleScript.
                    Make sure Spotify is installed and running on your Mac.
                    No login required - just open Spotify and it auto-connects.
                </p>
            </div>
        </div>
    );
}
