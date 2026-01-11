// Premium Sidebar - Complete Redesign
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings2, Brain, Palette, Music, Clock, Mic,
    ChevronRight, Home, BarChart2, Waves, Book
} from 'lucide-react';

interface PremiumSidebarProps {
    collapsed: boolean;
    onCollapsedChange: (collapsed: boolean) => void;
    view: string;
    onViewChange: (view: string) => void;
    accent: string;
    onFrequencyClick: () => void;
    onCoachOpen: () => void;
}

const PremiumSidebar = ({ collapsed, onCollapsedChange, view, onViewChange, accent, onFrequencyClick, onCoachOpen }: PremiumSidebarProps) => {
    const [expandedSections, setExpandedSections] = React.useState({
        settings: false
    });

    const toggleSection = (section: 'settings') => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const mainItems = [
        { id: 'home', icon: Home, label: 'Timer', gradient: 'from-violet-500 to-purple-600' },
        { id: 'zeni', icon: Brain, label: 'Zeni', gradient: 'from-fuchsia-500 to-pink-600' },
        { id: 'stats', icon: BarChart2, label: 'Analytics', gradient: 'from-cyan-500 to-blue-600' },
        { id: 'philosophy', icon: Book, label: 'Philosophy', gradient: 'from-emerald-500 to-teal-600' },
        { id: 'journal', icon: Book, label: 'Journal', gradient: 'from-amber-500 to-yellow-600' }
    ];

    const settingsItems = [
        { id: 'settings-brain', icon: Brain, label: 'Memory', effect: 'pulse' },
        { id: 'settings-ai', icon: Settings2, label: 'AI Engine', effect: 'rotate' },
        { id: 'settings-theme', icon: Palette, label: 'Theme', effect: 'rotate' },
        { id: 'settings-spotify', icon: Music, label: 'Spotify', effect: 'bounce' },
        { id: 'settings-youtube', icon: Music, label: 'YouTube', effect: 'bounce' },
        { id: 'settings-timer', icon: Clock, label: 'Timer', effect: 'rotate' },
        { id: 'settings-voice', icon: Mic, label: 'Voice', effect: 'pulse' }
    ];


    return (
        <motion.aside
            animate={{ width: collapsed ? 80 : 200 }}
            className="relative flex flex-col h-full shrink-0 rounded-3xl overflow-hidden"
            style={{
                background: 'linear-gradient(180deg, rgba(18,18,28,0.8) 0%, rgba(12,12,20,0.9) 100%)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}
        >
            {/* Premium Header with Logo */}
            <div className="flex items-center justify-between px-4 pt-7 mb-28 mx-2">
                <div className="flex items-center gap-3">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden group"
                        style={{
                            boxShadow: `0 6px 20px ${accent}40`
                        }}
                    >
                        <img
                            src="/zenner-logo.png"
                            alt="Zenner Logo"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {!collapsed && (
                        <div>
                            <h1 className="text-base font-black tracking-tight text-white" style={{ fontFamily: 'Space Mono' }}>Zenner</h1>
                        </div>
                    )}
                </div>

                {/* Collapse/Expand Toggle */}
                <button
                    onClick={() => onCollapsedChange(!collapsed)}
                    className="p-2 rounded-lg transition-all duration-300 hover:bg-white/10 hover:scale-110"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                        <path
                            d={collapsed ? "M8 14l4-4-4-4" : "M12 14L8 10l4-4"}
                            stroke="#fff"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>
            </div>

            {/* Main Items */}
            <nav className="flex-1 px-4 flex flex-col justify-center gap-2 overflow-y-auto overflow-x-hidden custom-scrollbar pb-5">
                {mainItems.map(item => (
                    <NavButton
                        key={item.id}
                        {...item}
                        view={view}
                        onClick={() => item.id === 'zeni' ? onCoachOpen() : onViewChange(item.id)}
                        collapsed={collapsed}
                        accent={accent}
                    />
                ))}

                {/* Settings Expandable */}
                <ExpandableSection
                    title="Settings"
                    count={6}
                    icon={Settings2}
                    expanded={expandedSections.settings}
                    onToggle={() => toggleSection('settings')}
                    collapsed={collapsed}
                    accent={accent}
                >
                    {settingsItems.map(item => (
                        <SubItem key={item.id} {...item} view={view} onClick={() => onViewChange(item.id)} accent={accent} />
                    ))}
                </ExpandableSection>

                <div className="flex flex-col gap-2 mt-2">
                    {/* Single Buttons */}
                    <NavButton id="frequencies" icon={Waves} label="Frequencies" gradient="from-pink-500 to-rose-600" view={view} onClick={onFrequencyClick} collapsed={collapsed} accent={accent} />
                </div>
            </nav>


            {/* Creator Credit - Prominent & Witty */}
            {!collapsed && (
                <div className="px-6 py-6 border-t border-white/5">
                    <a
                        href="https://anwe.sh"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                    >
                        <div className="text-center mb-2">
                            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1 group-hover:text-white/60 transition-colors">
                                Built by
                            </p>
                            <p className="text-lg font-black text-white group-hover:scale-105 transition-transform inline-block" style={{ fontFamily: "'Space Mono', monospace" }}>
                                Anwesh Rath
                            </p>
                        </div>
                        <p className="text-[10px] text-center text-white/30 italic group-hover:text-white/50 transition-colors">
                            "Code, Coffee, Chaos" ☕✨
                        </p>
                    </a>
                </div>
            )}
        </motion.aside>
    );
};

// NavButton Component
const NavButton = ({ id, icon: Icon, label, view, onClick, collapsed, accent, badge }: any) => {
    const isActive = view === id;

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            className="group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl overflow-hidden transition-all duration-300"
            style={{
                background: isActive
                    ? `linear-gradient(135deg, ${accent} 0%, ${accent}DD 100%)`
                    : 'rgba(255,255,255,0.08)',
                border: `2px solid ${isActive ? accent : 'rgba(255,255,255,0.12)'}`,
                boxShadow: isActive
                    ? `0 8px 32px ${accent}80, 0 0 0 1px rgba(255,255,255,0.2) inset`
                    : '0 4px 16px rgba(0,0,0,0.4)'
            }}
        >
            {isActive && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
            )}

            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative z-10"
                style={{
                    background: isActive
                        ? 'rgba(0,0,0,0.25)'
                        : `linear-gradient(135deg, ${accent}40 0%, ${accent}30 100%)`,
                    boxShadow: isActive
                        ? `0 4px 16px rgba(0,0,0,0.5)`
                        : `0 4px 16px ${accent}50`
                }}
            >
                <Icon size={20} strokeWidth={2.5} className="text-white transition-transform group-hover:scale-110 group-hover:rotate-6" />
                {badge && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: '0 0 12px #4ade80' }} />}
            </div>

            {!collapsed && (
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-bold tracking-wide relative z-10"
                    style={{ color: '#fff' }}
                >
                    {label}
                </motion.span>
            )}
        </motion.button>
    );
};

// ExpandableSection Component  
const ExpandableSection = ({ title, count, icon: Icon, expanded, onToggle, collapsed, accent, children }: any) => {
    return (
        <div>
            <motion.button
                onClick={onToggle}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl overflow-hidden transition-all duration-300"
                style={{
                    background: expanded ? `${accent}40` : 'rgba(255,255,255,0.06)',
                    border: `2px solid ${expanded ? accent : 'rgba(255,255,255,0.12)'}`,
                    boxShadow: expanded ? `0 8px 32px ${accent}50, 0 0 0 1px rgba(255,255,255,0.15) inset` : '0 4px 16px rgba(0,0,0,0.3)'
                }}
            >
                <div className="flex items-center gap-3 relative z-10">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                            background: expanded ? 'rgba(255,255,255,0.25)' : `${accent}50`,
                            boxShadow: `0 4px 16px ${accent}60`
                        }}
                    >
                        <Icon size={20} strokeWidth={2.5} className="text-white transition-transform group-hover:rotate-12" />
                    </div>

                    {!collapsed && (
                        <div className="flex flex-col items-start">
                            <span className="text-sm font-extrabold tracking-wide text-white">{title}</span>
                            <span className="text-[10px] font-bold tracking-widest uppercase text-white/60">{count} OPTIONS</span>
                        </div>
                    )}
                </div>

                {!collapsed && (
                    <motion.div
                        animate={{ rotate: expanded ? 90 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ChevronRight size={20} strokeWidth={3} className="text-white/80" />
                    </motion.div>
                )}
            </motion.button>

            <AnimatePresence>
                {expanded && !collapsed && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 ml-8 pl-6 space-y-3 border-l-2"
                        style={{ borderColor: `${accent}60` }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// SubItem Component
const SubItem = ({ id, icon: Icon, label, effect, view, onClick, accent }: any) => {
    const isActive = view === id;

    const getHoverAnimation = () => {
        switch (effect) {
            case 'rotate': return { rotate: 12, scale: 1.15 };
            case 'bounce': return { y: -4, scale: 1.1 };
            case 'pulse': return { scale: [1, 1.2, 1] };
            default: return { scale: 1.15 };
        }
    };

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02, x: 3 }}
            whileTap={{ scale: 0.98 }}
            className="group relative w-full flex items-center gap-3 pl-6 pr-3 py-2.5 rounded-lg overflow-hidden transition-all duration-200"
            style={{
                background: isActive
                    ? `linear-gradient(135deg, ${accent}40 0%, ${accent}25 100%)`
                    : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isActive ? `${accent}60` : 'rgba(255,255,255,0.08)'}`,
                boxShadow: isActive ? `0 4px 16px ${accent}40, 0 0 0 1px rgba(255,255,255,0.15) inset` : '0 1px 4px rgba(0,0,0,0.1)',
                marginLeft: '8px'
            }}
        >
            {isActive && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/15 via-white/5 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
            )}

            <motion.div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 relative z-10"
                whileHover={getHoverAnimation()}
                style={{
                    background: isActive ? 'rgba(255,255,255,0.25)' : `${accent}25`,
                    boxShadow: isActive ? `0 3px 10px ${accent}60` : `0 2px 6px ${accent}30`
                }}
            >
                <Icon size={15} strokeWidth={2.5} className="text-white" />
            </motion.div>

            <span className="text-[11px] font-semibold tracking-wide relative z-10" style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.75)' }}>
                {label}
            </span>

            {isActive && (
                <motion.div
                    className="ml-auto w-2 h-2 rounded-full relative z-10"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ background: '#fff', boxShadow: `0 0 16px #fff, 0 0 8px ${accent}` }}
                />
            )}
        </motion.button>
    );
};

export default PremiumSidebar;
