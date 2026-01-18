/**
 * AboutView - Premium About Page
 * Generous spacing, premium typography, theme-aware
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Heart, Globe, ChevronDown, Check, Bug, Zap, Star, Rocket,
    Timer, Brain, Music, BarChart3, BookOpen, Waves
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const CHANGELOG = [
    {
        version: '1.8.4',
        date: 'January 19, 2026',
        tag: 'current',
        changes: [
            { type: 'fix', text: 'Timer auto-transition from Focus to Break now works correctly' },
            { type: 'fix', text: 'Spotify and Sound Library mutual exclusion' },
            { type: 'new', text: 'Premium About page with changelog' },
            { type: 'new', text: 'Native macOS menu bar with branding' }
        ]
    },
    {
        version: '1.8.3',
        date: 'January 18, 2026',
        changes: [
            { type: 'fix', text: 'Timer transition fix' },
            { type: 'fix', text: 'Floating Player sync' }
        ]
    },
    {
        version: '1.8.0',
        date: 'January 17, 2026',
        changes: [
            { type: 'new', text: 'Zeni AI Coach' },
            { type: 'new', text: 'Memory System' }
        ]
    },
    {
        version: '1.7.0',
        date: 'January 15, 2026',
        changes: [
            { type: 'new', text: 'Sound Library & Frequencies' },
            { type: 'new', text: 'Floating Player' }
        ]
    },
    {
        version: '1.0.0',
        date: 'January 7, 2026',
        tag: 'first',
        changes: [
            { type: 'new', text: 'First stable release' }
        ]
    }
];

const FEATURES = [
    { icon: Timer, title: 'Smart Timer', desc: 'Pomodoro with presets' },
    { icon: Brain, title: 'AI Coach', desc: 'Personalized guidance' },
    { icon: Music, title: 'Focus Sounds', desc: 'Library + Spotify' },
    { icon: Waves, title: 'Frequencies', desc: 'Binaural beats' },
    { icon: BarChart3, title: 'Analytics', desc: 'Track patterns' },
    { icon: BookOpen, title: 'Journal', desc: 'Reflections' }
];

const CHANGE_ICONS = {
    new: { icon: Star, color: '#22c55e' },
    fix: { icon: Bug, color: '#f59e0b' },
    improve: { icon: Zap, color: '#3b82f6' }
};

export function AboutView() {
    const { currentTheme } = useTheme();
    const [expandedVersion, setExpandedVersion] = useState<string | null>('1.8.4');

    const primary = currentTheme.colors.primary;
    const textPrimary = currentTheme.colors.text.primary;
    const textSecondary = currentTheme.colors.text.secondary;
    const textMuted = currentTheme.colors.text.muted;
    const cardBg = currentTheme.effects.glass.background;
    const cardBorder = currentTheme.effects.glass.border;

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                overflowY: 'auto',
                overflowX: 'hidden'
            }}
            className="custom-scrollbar"
        >
            <div style={{
                maxWidth: 850,
                margin: '0 auto',
                padding: '100px 60px 80px'
            }}>

                {/* ═══════════════════════════════════════════════════════════
                    HERO SECTION 
                ═══════════════════════════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', marginBottom: 100 }}
                >
                    {/* Logo */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        style={{
                            width: 140,
                            height: 140,
                            margin: '0 auto 50px',
                            borderRadius: 28,
                            overflow: 'hidden',
                            boxShadow: `0 25px 80px ${primary}40`
                        }}
                    >
                        <img
                            src="/zenner-logo.png"
                            alt="Zenner"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    </motion.div>

                    {/* App Name */}
                    <h1 style={{
                        fontSize: 64,
                        fontWeight: 800,
                        color: textPrimary,
                        margin: 0,
                        marginBottom: 24,
                        letterSpacing: '-0.02em'
                    }}>
                        Zenner
                    </h1>

                    {/* Version Badge */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '12px 28px',
                        borderRadius: 50,
                        background: `${primary}12`,
                        border: `1px solid ${primary}25`,
                        marginBottom: 40
                    }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: primary }}>v1.8.4</span>
                        <span style={{ color: textMuted }}>•</span>
                        <span style={{ fontSize: 14, color: textSecondary }}>Production</span>
                    </div>

                    {/* Tagline */}
                    <p style={{
                        fontSize: 26,
                        fontWeight: 300,
                        color: textSecondary,
                        margin: 0,
                        marginBottom: 16
                    }}>
                        Your Intelligent Focus Companion
                    </p>

                    <p style={{
                        fontSize: 11,
                        letterSpacing: '0.25em',
                        textTransform: 'uppercase',
                        color: textMuted,
                        margin: 0
                    }}>
                        Focus · Amplify · Thrive
                    </p>
                </motion.div>


                {/* ═══════════════════════════════════════════════════════════
                    FEATURES SECTION 
                ═══════════════════════════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ marginBottom: 100 }}
                >
                    <h2 style={{
                        fontSize: 22,
                        fontWeight: 600,
                        color: textPrimary,
                        textAlign: 'center',
                        margin: 0,
                        marginBottom: 40
                    }}>
                        What's Inside
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 20
                    }}>
                        {FEATURES.map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 + i * 0.05 }}
                                style={{
                                    padding: 32,
                                    borderRadius: 20,
                                    textAlign: 'center',
                                    background: cardBg,
                                    border: `1px solid ${cardBorder}`
                                }}
                            >
                                <f.icon size={32} style={{ color: primary, marginBottom: 18 }} />
                                <h3 style={{
                                    fontSize: 16,
                                    fontWeight: 600,
                                    color: textPrimary,
                                    margin: 0,
                                    marginBottom: 8
                                }}>
                                    {f.title}
                                </h3>
                                <p style={{ fontSize: 13, color: textMuted, margin: 0 }}>
                                    {f.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>


                {/* ═══════════════════════════════════════════════════════════
                    CREATOR SECTION 
                ═══════════════════════════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        marginBottom: 100,
                        padding: '60px 50px',
                        borderRadius: 28,
                        textAlign: 'center',
                        background: `linear-gradient(135deg, ${primary}06, transparent)`,
                        border: `1px solid ${primary}10`
                    }}
                >
                    <p style={{
                        fontSize: 11,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: textMuted,
                        margin: 0,
                        marginBottom: 28
                    }}>
                        Crafted with obsession by
                    </p>

                    <h2 style={{
                        fontSize: 42,
                        fontWeight: 700,
                        color: textPrimary,
                        margin: 0,
                        marginBottom: 24
                    }}>
                        Anwesh Rath
                    </h2>

                    <p style={{
                        fontSize: 16,
                        lineHeight: 1.7,
                        color: textSecondary,
                        margin: '0 auto',
                        marginBottom: 36,
                        maxWidth: 400
                    }}>
                        Building tools that make deep work effortless.
                        <br />
                        Believer in systems over willpower.
                    </p>

                    <a
                        href="https://anwe.sh"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '14px 28px',
                            borderRadius: 14,
                            background: `${primary}15`,
                            border: `1px solid ${primary}25`,
                            color: primary,
                            textDecoration: 'none',
                            fontWeight: 500,
                            fontSize: 15,
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <Globe size={18} />
                        anwe.sh
                    </a>
                </motion.div>


                {/* ═══════════════════════════════════════════════════════════
                    CHANGELOG SECTION 
                ═══════════════════════════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ marginBottom: 80 }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        marginBottom: 36
                    }}>
                        <Rocket size={28} style={{ color: primary }} />
                        <h2 style={{ fontSize: 26, fontWeight: 700, color: textPrimary, margin: 0 }}>
                            Changelog
                        </h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {CHANGELOG.map((release, i) => (
                            <motion.div
                                key={release.version}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.35 + i * 0.04 }}
                                style={{
                                    borderRadius: 18,
                                    background: expandedVersion === release.version ? cardBg : 'rgba(255,255,255,0.015)',
                                    border: `1px solid ${expandedVersion === release.version ? primary + '22' : cardBorder}`,
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Header */}
                                <button
                                    onClick={() => setExpandedVersion(expandedVersion === release.version ? null : release.version)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '22px 28px',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <span style={{ fontSize: 20, fontWeight: 700, color: textPrimary }}>
                                            v{release.version}
                                        </span>
                                        {release.tag === 'current' && (
                                            <span style={{
                                                fontSize: 10,
                                                padding: '5px 12px',
                                                borderRadius: 20,
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                background: primary,
                                                color: '#000'
                                            }}>
                                                Current
                                            </span>
                                        )}
                                        {release.tag === 'first' && (
                                            <span style={{
                                                fontSize: 10,
                                                padding: '5px 12px',
                                                borderRadius: 20,
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                background: '#eab308',
                                                color: '#000'
                                            }}>
                                                🎉 First
                                            </span>
                                        )}
                                        <span style={{ fontSize: 14, color: textMuted }}>{release.date}</span>
                                    </div>
                                    <ChevronDown
                                        size={20}
                                        style={{
                                            color: textMuted,
                                            transition: 'transform 0.25s',
                                            transform: expandedVersion === release.version ? 'rotate(180deg)' : 'rotate(0)'
                                        }}
                                    />
                                </button>

                                {/* Content */}
                                <AnimatePresence>
                                    {expandedVersion === release.version && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <div style={{
                                                padding: '24px 32px 28px',
                                                borderTop: `1px solid ${cardBorder}`,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 16
                                            }}>
                                                {release.changes.map((c, j) => {
                                                    const ct = CHANGE_ICONS[c.type as keyof typeof CHANGE_ICONS];
                                                    const Icon = ct?.icon || Check;
                                                    return (
                                                        <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                            <div style={{
                                                                width: 32,
                                                                height: 32,
                                                                borderRadius: 10,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                flexShrink: 0,
                                                                background: `${ct?.color}15`,
                                                                color: ct?.color
                                                            }}>
                                                                <Icon size={16} />
                                                            </div>
                                                            <span style={{ fontSize: 14, color: textSecondary }}>
                                                                {c.text}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>


                {/* ═══════════════════════════════════════════════════════════
                    FOOTER 
                ═══════════════════════════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        paddingTop: 50,
                        borderTop: `1px solid ${cardBorder}`,
                        textAlign: 'center'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        marginBottom: 12,
                        color: textMuted
                    }}>
                        <Sparkles size={14} />
                        <span style={{ fontSize: 13 }}>Built with Tauri, React & TypeScript</span>
                    </div>
                    <p style={{ fontSize: 12, color: textMuted, margin: 0, marginBottom: 16 }}>
                        © 2026 Anwesh Rath
                    </p>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                    }}>
                        <Heart size={12} fill={primary} style={{ color: primary }} />
                        <span style={{ fontSize: 11, color: textMuted }}>Made in India</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default AboutView;
