// Premium Sidebar - Complete Redesign
import React from 'react';
import { motion } from 'framer-motion';
import {
    Settings2, Brain,
    Home, BarChart2, Waves, Book, User, LayoutGrid, Info
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

const PremiumSidebar = ({ collapsed, onCollapsedChange, view, onViewChange, accent, onFrequencyClick, onCoachOpen: _onCoachOpen }: PremiumSidebarProps) => {
    const [_expandedSections] = React.useState({
        settings: false
    });



    const mainItems = [
        { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard', gradient: 'from-indigo-500 to-violet-600' },
        { id: 'home', icon: Home, label: 'Timer', gradient: 'from-violet-500 to-purple-600' },
        { id: 'zeni', icon: Brain, label: 'Zeni', gradient: 'from-fuchsia-500 to-pink-600' },
        { id: 'stats', icon: BarChart2, label: 'Analytics', gradient: 'from-cyan-500 to-blue-600' },
        // { id: 'philosophy', icon: Book, label: 'Philosophy', gradient: 'from-emerald-500 to-teal-600' }, // Hidden
        { id: 'journal', icon: Book, label: 'Journal', gradient: 'from-amber-500 to-yellow-600' },
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
            {/* Collapse Toggle - Top Right */}
            <div className="absolute top-4 right-3 z-10">
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

            {/* Centered Brand Section */}
            {!collapsed && (
                <div className="flex flex-col items-center pt-8 pb-6 px-4">
                    {/* Logo */}
                    <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 overflow-hidden"
                        style={{
                            boxShadow: `0 8px 32px ${accent}30`
                        }}
                    >
                        <img
                            src="/zenner-logo.png?v=1768270000"
                            alt="Zenner"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {/* Tagline */}
                    <p
                        className="text-[9px] font-bold tracking-[0.12em] text-white/40 uppercase mb-6 whitespace-nowrap"
                        style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                        Focus · Amplify · Thrive
                    </p>

                    {/* Profile & Settings Quick Access */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onViewChange('profile')}
                            className={`p-3 rounded-xl transition-all duration-200 ${view === 'profile'
                                ? 'bg-white/10'
                                : 'bg-white/[0.03] hover:bg-white/[0.08]'
                                }`}
                            title="Profile"
                        >
                            <User
                                size={18}
                                className={view === 'profile' ? 'text-white' : 'text-white/50'}
                                style={view === 'profile' ? { color: accent } : {}}
                            />
                        </button>
                        <button
                            onClick={() => onViewChange('settings')}
                            className={`p-3 rounded-xl transition-all duration-200 ${view.startsWith('settings')
                                ? 'bg-white/10'
                                : 'bg-white/[0.03] hover:bg-white/[0.08]'
                                }`}
                            title="Settings"
                        >
                            <Settings2
                                size={18}
                                className={view.startsWith('settings') ? 'text-white' : 'text-white/50'}
                                style={view.startsWith('settings') ? { color: accent } : {}}
                            />
                        </button>
                    </div>
                </div>
            )}

            {/* Collapsed state - just logo */}
            {collapsed && (
                <div className="flex flex-col items-center pt-16 pb-4">
                    <div className="w-10 h-10 rounded-xl overflow-hidden">
                        <img src="/zenner-logo.png?v=1736720000" alt="Z" className="w-full h-full object-contain" />
                    </div>
                </div>
            )}

            {/* Main Items */}
            <nav className="flex-1 px-4 flex flex-col justify-center gap-2 overflow-y-auto overflow-x-hidden custom-scrollbar pb-5">
                {mainItems.map(item => (
                    <NavButton
                        key={item.id}
                        {...item}
                        view={view}
                        onClick={() => onViewChange(item.id)}
                        collapsed={collapsed}
                        accent={accent}
                    />
                ))}
                {/* Settings - Now a single button to Settings Hub */}
                <NavButton
                    id="settings"
                    icon={Settings2}
                    label="Settings"
                    gradient="from-gray-500 to-slate-600"
                    view={view}
                    onClick={() => onViewChange('settings')}
                    collapsed={collapsed}
                    accent={accent}
                />

                {/* Frequencies Button */}
                <NavButton id="frequencies" icon={Waves} label="Frequencies" gradient="from-pink-500 to-rose-600" view={view} onClick={onFrequencyClick} collapsed={collapsed} accent={accent} />

                {/* About & Help */}
                <NavButton id="about" icon={Info} label="About" gradient="from-slate-500 to-zinc-600" view={view} onClick={() => onViewChange('about')} collapsed={collapsed} accent={accent} />
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

// SubItem Component


export default PremiumSidebar;
