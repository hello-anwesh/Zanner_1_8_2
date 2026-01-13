/**
 * SettingsHub - Settings landing page with all options as cards
 */

import { motion } from 'framer-motion';
import {
    Brain, Settings2, Palette, Music, Youtube, Clock, Mic,
    ChevronRight, Sparkles, HardDrive
} from 'lucide-react';

interface SettingsHubProps {
    accent: string;
    onNavigate: (view: string) => void;
    currentView: string;
}

const SETTINGS_CARDS = [
    {
        id: 'settings-brain',
        icon: Brain,
        label: 'Memory & Context',
        description: 'Manage AI memory, conversation history, and learned preferences',
        gradient: 'from-purple-500 to-violet-600',
        color: '#8B5CF6'
    },
    {
        id: 'settings-ai',
        icon: Sparkles,
        label: 'AI Engine',
        description: 'Configure AI providers, models, and response settings',
        gradient: 'from-fuchsia-500 to-pink-600',
        color: '#D946EF'
    },
    {
        id: 'settings-theme',
        icon: Palette,
        label: 'Theme & Appearance',
        description: 'Customize colors, fonts, and visual style',
        gradient: 'from-cyan-500 to-blue-600',
        color: '#06B6D4'
    },
    {
        id: 'settings-spotify',
        icon: Music,
        label: 'Spotify Integration',
        description: 'Connect Spotify for music during focus sessions',
        gradient: 'from-green-500 to-emerald-600',
        color: '#22C55E'
    },
    {
        id: 'settings-youtube',
        icon: Youtube,
        label: 'YouTube Music',
        description: 'Configure YouTube ambient sounds and playlists',
        gradient: 'from-red-500 to-rose-600',
        color: '#EF4444'
    },
    {
        id: 'settings-timer',
        icon: Clock,
        label: 'Timer Settings',
        description: 'Configure session durations, breaks, and notifications',
        gradient: 'from-orange-500 to-amber-600',
        color: '#F97316'
    },
    {
        id: 'settings-voice',
        icon: Mic,
        label: 'Voice & Audio',
        description: 'Speech recognition and text-to-speech settings',
        gradient: 'from-indigo-500 to-purple-600',
        color: '#6366F1'
    },
    {
        id: 'settings-backup',
        icon: HardDrive,
        label: 'Backup & Data',
        description: 'Export, import, and manage your data safely',
        gradient: 'from-teal-500 to-cyan-600',
        color: '#14B8A6'
    }
];

export function SettingsHub({ accent, onNavigate, currentView }: SettingsHubProps) {
    return (
        <div className="min-h-full p-8 pb-16">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <div className="flex items-center gap-4 mb-3">
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center"
                            style={{ background: `${accent}15` }}
                        >
                            <Settings2 size={28} style={{ color: accent }} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Settings</h1>
                            <p className="text-white/50">Configure your Zenner experience</p>
                        </div>
                    </div>
                </motion.div>

                {/* Settings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SETTINGS_CARDS.map((card, index) => {
                        const Icon = card.icon;
                        const isActive = currentView === card.id;

                        return (
                            <motion.button
                                key={card.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onNavigate(card.id)}
                                className={`relative p-6 rounded-2xl text-left transition-all duration-300 group overflow-hidden ${isActive
                                    ? 'bg-white/10 border-2'
                                    : 'bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.15]'
                                    }`}
                                style={isActive ? { borderColor: card.color } : {}}
                            >
                                {/* Gradient overlay on hover */}
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{
                                        background: `linear-gradient(135deg, ${card.color}08, transparent)`
                                    }}
                                />

                                <div className="relative flex items-start gap-4">
                                    {/* Icon */}
                                    <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${isActive ? '' : 'group-hover:scale-110'
                                            }`}
                                        style={{
                                            background: `${card.color}15`,
                                            boxShadow: isActive ? `0 4px 20px ${card.color}30` : 'none'
                                        }}
                                    >
                                        <Icon size={22} style={{ color: card.color }} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="text-base font-semibold text-white">
                                                {card.label}
                                            </h3>
                                            <ChevronRight
                                                size={16}
                                                className="text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all"
                                            />
                                        </div>
                                        <p className="text-sm text-white/40 leading-relaxed">
                                            {card.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Active indicator */}
                                {isActive && (
                                    <div
                                        className="absolute top-3 right-3 w-2 h-2 rounded-full"
                                        style={{ background: card.color }}
                                    />
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Footer hint */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center text-white/25 text-sm mt-10"
                >
                    Changes are saved automatically
                </motion.p>
            </div>
        </div>
    );
}
