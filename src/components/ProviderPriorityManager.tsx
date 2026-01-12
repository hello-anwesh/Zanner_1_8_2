import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Zap,
    Cpu,
    Sparkles,
    Brain,
    Shield,
    AlertCircle,
    Check,
    ChevronDown
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
}> = {
    gemini: { name: 'Gemini', icon: Zap, color: '#3b82f6' },
    openai: { name: 'OpenAI', icon: Sparkles, color: '#10a37f' },
    claude: { name: 'Claude', icon: Brain, color: '#d97757' },
    ollama: { name: 'Ollama', icon: Cpu, color: '#f59e0b' }
};

const ALL_PROVIDERS: AIProviderType[] = ['gemini', 'openai', 'claude', 'ollama'];

export function ProviderPriorityManager({ accent, onSave }: ProviderPriorityManagerProps) {
    const [config, setConfig] = useState(aiService.getConfig());
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const unsubscribe = aiService.subscribe(() => {
            setConfig(aiService.getConfig());
        });
        return unsubscribe;
    }, []);

    // Get providers in priority order
    const getPriorityProvider = (index: number): AIProviderType | null => {
        return config.fallbackPriority[index] || null;
    };

    const isProviderConfigured = (provider: AIProviderType): boolean => {
        const pConfig = config.providers[provider];
        if (provider === 'ollama') return !!pConfig?.baseUrl;
        return !!pConfig?.apiKey;
    };

    const setPriorityProvider = (index: number, provider: AIProviderType) => {
        const newPriority = [...config.fallbackPriority];

        // Remove from old position
        const oldIndex = newPriority.indexOf(provider);
        if (oldIndex !== -1) {
            newPriority.splice(oldIndex, 1);
        }

        // Insert at new position
        newPriority.splice(index, 0, provider);

        // Make sure we have exactly 4 providers
        const missing = ALL_PROVIDERS.filter(p => !newPriority.includes(p));
        missing.forEach(p => newPriority.push(p));

        // Trim to 4
        const finalPriority = newPriority.slice(0, 4);

        // If setting position 0, also set as active provider
        const newActiveProvider = index === 0 ? provider : finalPriority[0];

        const newConfig = {
            ...config,
            activeProvider: newActiveProvider,
            fallbackPriority: finalPriority
        };

        setConfig(newConfig);
        setHasChanges(true);
    };

    const saveChanges = () => {
        console.log('[ProviderPriority] Saving:', {
            activeProvider: config.activeProvider,
            fallbackPriority: config.fallbackPriority
        });

        aiService.updateConfig({
            activeProvider: config.activeProvider,
            fallbackPriority: config.fallbackPriority
        });

        setHasChanges(false);
        onSave?.();
    };

    const renderProviderSelect = (index: number, label: string, labelColor: string) => {
        const currentProvider = getPriorityProvider(index);
        const info = currentProvider ? PROVIDER_INFO[currentProvider] : null;
        const Icon = info?.icon || AlertCircle;
        const isConfigured = currentProvider ? isProviderConfigured(currentProvider) : false;

        return (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                {/* Priority Label */}
                <div
                    className="w-24 text-sm font-bold"
                    style={{ color: labelColor }}
                >
                    {label}
                </div>

                {/* Provider Dropdown */}
                <div className="relative flex-1">
                    <select
                        value={currentProvider || ''}
                        onChange={(e) => setPriorityProvider(index, e.target.value as AIProviderType)}
                        className="w-full appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-10 text-white font-medium cursor-pointer hover:bg-white/10 transition-all"
                    >
                        {ALL_PROVIDERS.map(provider => {
                            const pInfo = PROVIDER_INFO[provider];
                            const configured = isProviderConfigured(provider);
                            return (
                                <option key={provider} value={provider}>
                                    {pInfo.name} {!configured ? '(No API Key)' : ''}
                                </option>
                            );
                        })}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" size={18} />
                </div>

                {/* Provider Icon */}
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: info ? `${info.color}20` : 'rgba(255,255,255,0.05)' }}
                >
                    <Icon size={20} style={{ color: info?.color || '#fff' }} />
                </div>

                {/* Status */}
                <div className="w-24">
                    {currentProvider && (
                        isConfigured ? (
                            <span className="flex items-center gap-1 text-green-400 text-xs font-medium">
                                <Check size={14} />
                                Ready
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-red-400 text-xs font-medium">
                                <AlertCircle size={14} />
                                No Key
                            </span>
                        )
                    )}
                </div>
            </div>
        );
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
                        Set which AI provider to use first, and fallbacks if it fails.
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
                        Save
                    </motion.button>
                )}
            </div>

            {/* Priority Selectors */}
            <div className="space-y-3">
                {renderProviderSelect(0, "Primary", "#22c55e")}
                {renderProviderSelect(1, "Secondary", "#3b82f6")}
                {renderProviderSelect(2, "Tertiary", "#a855f7")}
                {renderProviderSelect(3, "Last Resort", "#6b7280")}
            </div>

            {/* Info */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="text-sm font-bold text-white/70">How it Works</h4>
                <ul className="space-y-1 text-xs text-white/40">
                    <li>• <span className="text-green-400">Primary</span> is always tried first</li>
                    <li>• If it fails (rate limit, error, offline), <span className="text-blue-400">Secondary</span> is used</li>
                    <li>• The chain continues until one succeeds</li>
                    <li>• Providers without API keys are automatically skipped</li>
                </ul>
            </div>

            {/* Current Active Display */}
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm">
                <span className="text-green-400 font-medium">Active Provider: </span>
                <span className="text-white font-bold">{PROVIDER_INFO[config.activeProvider]?.name}</span>
            </div>
        </div>
    );
}
