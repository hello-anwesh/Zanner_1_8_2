import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, Play, Pause, Settings, BarChart2, Calendar, Brain, Zap, Home } from 'lucide-react';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    accent: string;
    onCommand: (command: string, ...args: any[]) => void;
}

interface CommandItem {
    id: string;
    label: string;
    description: string;
    icon: any;
    action: () => void;
    shortcut?: string;
    category: string;
}

export function CommandPalette({ isOpen, onClose, accent, onCommand }: CommandPaletteProps) {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(0);

    const commands: CommandItem[] = [
        // Navigation
        {
            id: 'nav-home',
            label: 'Go to Home',
            description: 'Return to timer view',
            icon: Home,
            action: () => onCommand('navigate', 'home'),
            shortcut: 'H',
            category: 'Navigation'
        },
        {
            id: 'nav-stats',
            label: 'View Analytics',
            description: 'See your productivity stats',
            icon: BarChart2,
            action: () => onCommand('navigate', 'stats'),
            shortcut: 'A',
            category: 'Navigation'
        },
        {
            id: 'nav-history',
            label: 'Session History',
            description: 'View past sessions',
            icon: Calendar,
            action: () => onCommand('navigate', 'history'),
            shortcut: 'S',
            category: 'Navigation'
        },
        {
            id: 'nav-settings',
            label: 'Open Settings',
            description: 'Configure your app',
            icon: Settings,
            action: () => onCommand('navigate', 'settings-theme'),
            shortcut: ',',
            category: 'Navigation'
        },
        {
            id: 'nav-ai',
            label: 'AI Training',
            description: 'Train your AI coach',
            icon: Brain,
            action: () => onCommand('navigate', 'ai-training'),
            shortcut: 'T',
            category: 'Navigation'
        },

        // Timer Actions
        {
            id: 'timer-start',
            label: 'Start Timer',
            description: 'Begin a focus session',
            icon: Play,
            action: () => onCommand('timer', 'start'),
            shortcut: 'Space',
            category: 'Timer'
        },
        {
            id: 'timer-pause',
            label: 'Pause Timer',
            description: 'Pause current session',
            icon: Pause,
            action: () => onCommand('timer', 'pause'),
            shortcut: 'Space',
            category: 'Timer'
        },
        {
            id: 'timer-reset',
            label: 'Reset Timer',
            description: 'Reset to default time',
            icon: Zap,
            action: () => onCommand('timer', 'reset'),
            shortcut: 'R',
            category: 'Timer'
        },

        // Presets
        {
            id: 'preset-pomodoro',
            label: 'Quick Start: Pomodoro',
            description: '25 min focus, 5 min break',
            icon: Zap,
            action: () => onCommand('preset', 'classic-pomodoro'),
            shortcut: '1',
            category: 'Presets'
        },
        {
            id: 'preset-deep',
            label: 'Quick Start: Deep Work',
            description: '50 min focus, 10 min break',
            icon: Zap,
            action: () => onCommand('preset', 'deep-work'),
            shortcut: '2',
            category: 'Presets'
        },
        {
            id: 'preset-flow',
            label: 'Quick Start: Flow State',
            description: '90 min uninterrupted focus',
            icon: Zap,
            action: () => onCommand('preset', 'flow-state'),
            shortcut: '3',
            category: 'Presets'
        }
    ];

    const filteredCommands = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(search.toLowerCase()) ||
        cmd.description.toLowerCase().includes(search.toLowerCase()) ||
        cmd.category.toLowerCase().includes(search.toLowerCase())
    );

    const groupedCommands = filteredCommands.reduce((acc, cmd) => {
        if (!acc[cmd.category]) acc[cmd.category] = [];
        acc[cmd.category].push(cmd);
        return acc;
    }, {} as Record<string, CommandItem[]>);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelected(prev => (prev + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelected(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            filteredCommands[selected]?.action();
            onClose();
        } else if (e.key === 'Escape') {
            onClose();
        }
    }, [isOpen, selected, filteredCommands, onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        setSelected(0);
    }, [search]);

    if (!isOpen) return null;

    let currentIndex = 0;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-[101]"
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                        background: 'rgba(16, 16, 24, 0.98)',
                        backdropFilter: 'blur(40px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 24px 80px rgba(0,0,0,0.7)'
                    }}
                >
                    {/* Search Input */}
                    <div className="p-4 border-b border-white/10">
                        <div className="relative">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Type a command or search..."
                                className="w-full pl-12 pr-4 py-3 bg-transparent text-white placeholder:text-white/30 outline-none text-base"
                                autoFocus
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <kbd className="px-2 py-1 rounded bg-white/10 text-xs font-mono text-white/50">ESC</kbd>
                            </div>
                        </div>
                    </div>

                    {/* Commands List */}
                    <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
                        {Object.entries(groupedCommands).map(([category, items]) => (
                            <div key={category} className="mb-4">
                                <p className="px-3 py-2 text-xs font-bold text-white/40 uppercase tracking-wider">
                                    {category}
                                </p>
                                <div className="space-y-1">
                                    {items.map((cmd) => {
                                        const index = currentIndex++;
                                        const Icon = cmd.icon;
                                        return (
                                            <motion.button
                                                key={cmd.id}
                                                whileHover={{ x: 4 }}
                                                onClick={() => {
                                                    cmd.action();
                                                    onClose();
                                                }}
                                                className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 text-left transition-all ${selected === index
                                                        ? 'bg-white/10'
                                                        : 'hover:bg-white/5'
                                                    }`}
                                                style={selected === index ? {
                                                    background: `linear-gradient(90deg, ${accent}20 0%, transparent 100%)`
                                                } : {}}
                                            >
                                                <div
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${selected === index ? 'bg-white/10' : 'bg-white/5'
                                                        }`}
                                                >
                                                    <Icon size={16} style={{ color: selected === index ? accent : 'rgba(255,255,255,0.5)' }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-white text-sm">{cmd.label}</p>
                                                    <p className="text-xs text-white/50 truncate">{cmd.description}</p>
                                                </div>
                                                {cmd.shortcut && (
                                                    <kbd className="px-2 py-1 rounded bg-white/5 text-xs font-mono text-white/50 shrink-0">
                                                        {cmd.shortcut}
                                                    </kbd>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <Command size={12} />
                                <kbd className="px-1.5 py-0.5 rounded bg-white/5">K</kbd>
                                <span className="ml-1">to open</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-white/5">↑↓</kbd>
                                <span className="ml-1">navigate</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-white/5">↵</kbd>
                                <span className="ml-1">select</span>
                            </div>
                        </div>
                        <p>{filteredCommands.length} commands</p>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

// Hook to enable CMD+K globally
export function useCommandPalette(onOpen: () => void) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                onOpen();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onOpen]);
}
