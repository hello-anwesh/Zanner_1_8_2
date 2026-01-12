import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GripVertical,
    ChevronUp,
    ChevronDown,
    Check,
    Zap,
    Cpu,
    Sparkles,
    Brain,
    Shield,
    AlertCircle
} from 'lucide-react';
import { aiService } from '../services/ai/AIService';
import type { AIProviderType } from '../services/ai/types';

interface ProviderPriorityManagerProps {
    accent: string;
    onSave?: () => void;
}

const PROVIDER_INFO: Record<AIProviderType, {
    name: string;
    icon: any;
    color: string;
    description: string;
}> = {
    gemini: { name: 'Gemini', icon: Zap, color: '#3b82f6', description: 'Fast & Multimodal' },
    openai: { name: 'OpenAI', icon: Sparkles, color: '#10a37f', description: 'GPT-4 Reliable' },
    claude: { name: 'Claude', icon: Brain, color: '#d97757', description: 'Thoughtful Sonnet' },
    ollama: { name: 'Ollama', icon: Cpu, color: '#f59e0b', description: 'Local & Private' }
};

export function ProviderPriorityManager({ accent, onSave }: ProviderPriorityManagerProps) {
    const [config, setConfig] = useState(aiService.getConfig());
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setConfig(aiService.getConfig());
    }, []);

    const moveProvider = (fromIndex: number, toIndex: number) => {
        if (toIndex < 0 || toIndex >= config.fallbackPriority.length) return;

        const newPriority = [...config.fallbackPriority];
        const [moved] = newPriority.splice(fromIndex, 1);
        newPriority.splice(toIndex, 0, moved);

        setConfig({ ...config, fallbackPriority: newPriority });
        setHasChanges(true);
    };

    const toggleProviderEnabled = (provider: AIProviderType) => {
        const newConfig = {
            ...config,
            providers: {
                ...config.providers,
                [provider]: {
                    ...config.providers[provider],
                    enabled: !config.providers[provider].enabled
                }
            }
        };
        setConfig(newConfig);
        setHasChanges(true);
    };

    const setAsPrimary = (provider: AIProviderType) => {
        const newPriority = [
            provider,
            ...config.fallbackPriority.filter(p => p !== provider)
        ];

        setConfig({
            ...config,
            activeProvider: provider,
            fallbackPriority: newPriority
        });
        setHasChanges(true);
    };

    const saveChanges = () => {
        aiService.updateConfig(config);
        setHasChanges(false);
        onSave?.();
    };

    const isProviderConfigured = (provider: AIProviderType): boolean => {
        const pConfig = config.providers[provider];
        if (provider === 'ollama') return !!pConfig.baseUrl;
        return !!pConfig.apiKey;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Shield size={20} style={{ color: accent }} />
                        Provider Priority
                    </h3>
                    <p className="text-sm text-white/50 mt-1">
                        Drag to reorder fallback priority. Top provider is tried first.
                    </p>
                </div>

                {hasChanges && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={saveChanges}
                        className="px-4 py-2 rounded-xl font-bold text-white flex items-center gap-2 transition-all hover:opacity-90"
                        style={{ background: accent }}
                    >
                        <Check size={16} />
                        Save Order
                    </motion.button>
                )}
            </div>

            {/* Priority Legend */}
            <div className="flex items-center gap-4 text-xs text-white/40">
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Primary
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Fallback
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-white/20"></span>
                    Disabled
                </span>
            </div>

            {/* Provider List */}
            <div className="space-y-2">
                <AnimatePresence>
                    {config.fallbackPriority.map((provider, index) => {
                        const info = PROVIDER_INFO[provider];
                        const Icon = info.icon;
                        const isActive = config.activeProvider === provider;
                        const isEnabled = config.providers[provider]?.enabled !== false;
                        const isConfigured = isProviderConfigured(provider);

                        return (
                            <motion.div
                                key={provider}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{
                                    opacity: isEnabled ? 1 : 0.5,
                                    y: 0,
                                    scale: draggedIndex === index ? 1.02 : 1
                                }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className={`
                                    relative p-4 rounded-xl border transition-all
                                    ${isActive
                                        ? 'bg-white/10 border-green-500/50'
                                        : isEnabled
                                            ? 'bg-white/5 border-white/10 hover:border-white/20'
                                            : 'bg-white/[0.02] border-white/5'
                                    }
                                `}
                                draggable
                                onDragStart={() => setDraggedIndex(index)}
                                onDragEnd={() => setDraggedIndex(null)}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    if (draggedIndex !== null && draggedIndex !== index) {
                                        moveProvider(draggedIndex, index);
                                        setDraggedIndex(index);
                                    }
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Drag Handle */}
                                    <div className="cursor-grab active:cursor-grabbing text-white/30 hover:text-white/50">
                                        <GripVertical size={20} />
                                    </div>

                                    {/* Position Number */}
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                                        style={{
                                            background: isActive ? `${accent}30` : 'rgba(255,255,255,0.05)',
                                            color: isActive ? accent : 'rgba(255,255,255,0.5)'
                                        }}
                                    >
                                        {index + 1}
                                    </div>

                                    {/* Provider Icon */}
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ background: `${info.color}20` }}
                                    >
                                        <Icon size={20} style={{ color: info.color }} />
                                    </div>

                                    {/* Provider Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white">{info.name}</span>
                                            {isActive && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400">
                                                    PRIMARY
                                                </span>
                                            )}
                                            {!isConfigured && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 flex items-center gap-1">
                                                    <AlertCircle size={10} />
                                                    NO API KEY
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-white/40">{info.description}</p>
                                    </div>

                                    {/* Move Buttons */}
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => moveProvider(index, index - 1)}
                                            disabled={index === 0}
                                            className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronUp size={16} />
                                        </button>
                                        <button
                                            onClick={() => moveProvider(index, index + 1)}
                                            disabled={index === config.fallbackPriority.length - 1}
                                            className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronDown size={16} />
                                        </button>
                                    </div>

                                    {/* Enable/Disable Toggle */}
                                    <button
                                        onClick={() => toggleProviderEnabled(provider)}
                                        className={`w-10 h-6 rounded-full transition-all ${isEnabled ? 'bg-green-500' : 'bg-white/10'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white shadow transition-all ${isEnabled ? 'ml-5' : 'ml-1'}`} />
                                    </button>

                                    {/* Set as Primary */}
                                    {!isActive && isConfigured && (
                                        <button
                                            onClick={() => setAsPrimary(provider)}
                                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/70 hover:text-white transition-all"
                                        >
                                            Set Primary
                                        </button>
                                    )}
                                </div>

                                {/* Fallback indicator line */}
                                {index > 0 && (
                                    <div className="absolute -top-1 left-10 w-0.5 h-3 bg-white/10" />
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <h4 className="text-sm font-bold text-white/70 mb-2">How Fallback Works</h4>
                <ul className="space-y-1 text-xs text-white/40">
                    <li>• The <span className="text-green-400">primary</span> provider is always tried first</li>
                    <li>• If it fails, the next <span className="text-blue-400">enabled</span> provider in the list is used</li>
                    <li>• Disabled providers are skipped entirely</li>
                    <li>• Providers without API keys are also skipped</li>
                </ul>
            </div>
        </div>
    );
}
