import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Check, AlertCircle, Loader2, RefreshCw, Cpu, Sparkles, Zap, ArrowLeft } from 'lucide-react';
import { aiService } from '../services/ai/AIService';
import type { AIProviderType, ProviderStatus, ModelInfo } from '../services/ai/types';
import { ProviderPriorityManager } from './ProviderPriorityManager';
import { APIKeyManager } from './APIKeyManager';
import { WalletWidget } from './WalletWidget';

interface AISettingsViewProps {
    accent: string;
    onBack?: () => void;
}

export function AISettingsView({ accent, onBack }: AISettingsViewProps) {
    const [config, setConfig] = useState(aiService.getConfig());
    const [providerStatuses, setProviderStatuses] = useState<Map<AIProviderType, ProviderStatus>>(new Map());
    const [availableModels, setAvailableModels] = useState<Map<AIProviderType, ModelInfo[]>>(new Map());
    const [_validatingProvider, setValidatingProvider] = useState<AIProviderType | null>(null);
    const [fetchingModels, setFetchingModels] = useState<AIProviderType | null>(null);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        checkAllProviders();
    }, []);

    const checkAllProviders = async () => {
        const statuses = await aiService.checkAllProviders();
        setProviderStatuses(statuses);
        for (const [type, status] of statuses.entries()) {
            if (status.available && status.models) {
                setAvailableModels(prev => new Map(prev).set(type, status.models!));
            }
        }
    };

    const validateAndFetchModels = async (type: AIProviderType) => {
        setValidatingProvider(type);
        aiService.updateConfig(config); // Pre-save for validation context

        const status = await aiService.checkProvider(type);
        setProviderStatuses(prev => new Map(prev).set(type, status));

        if (status.available) {
            setFetchingModels(type);
            try {
                const models = await aiService.fetchModels(type);
                setAvailableModels(prev => new Map(prev).set(type, models));
                if (!config.providers[type].model && models.length > 0) {
                    updateProviderConfig(type, 'model', models[0].id);
                }
            } catch (error) {
                console.error('Failed to fetch models:', error);
            }
            setFetchingModels(null);
        }
        setValidatingProvider(null);
    };

    const updateProviderConfig = (provider: AIProviderType, field: string, value: string) => {
        // Ensure provider object exists to prevent crashes
        const currentProviderConfig = config.providers[provider] || { apiKey: '', model: '' };

        const newConfig = {
            ...config,
            providers: {
                ...config.providers,
                [provider]: {
                    ...currentProviderConfig,
                    [field]: value
                }
            }
        };
        setConfig(newConfig);
    };

    const setActiveProvider = (provider: AIProviderType) => {
        // When setting active provider, also update fallbackPriority to put it first
        // This ensures architectural consistency between activeProvider and fallbackPriority
        const currentPriority = config.fallbackPriority || ['gemini', 'openai', 'claude', 'ollama'];
        const newFallbackPriority = [
            provider,
            ...currentPriority.filter(p => p !== provider)
        ];

        setConfig({
            ...config,
            activeProvider: provider,
            fallbackPriority: newFallbackPriority
        });
    };

    const saveConfig = () => {
        aiService.updateConfig(config);
        setSaveMessage('✓ Saved');
        setTimeout(() => setSaveMessage(''), 3000);
    };

    const providers = [
        { type: 'ollama', name: 'Ollama', icon: Cpu, description: 'Local • Private • Free', color: '#f59e0b' },
        { type: 'openai', name: 'OpenAI', icon: Sparkles, description: 'GPT-4 • Reliable • Cloud', color: '#10a37f' },
        { type: 'gemini', name: 'Gemini', icon: Zap, description: 'Fast • Multimodal • 1M Context', color: '#3b82f6' },
        { type: 'claude', name: 'Claude', icon: Brain, description: 'Sonnet • Thoughtful • Premium', color: '#d97757' }
    ] as const;

    return (
        <div className="p-10 max-w-6xl mx-auto space-y-12 animate-fade-in font-sans">
            {/* Back Button */}
            {onBack && (
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 group"
                >
                    <ArrowLeft size={16} style={{ color: accent }} />
                    <span className="text-sm font-medium text-white/60 group-hover:text-white/90">Back to Settings</span>
                </motion.button>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-white/60 mb-4 inline-block">
                        Neural Engine
                    </span>
                    <h2 className="text-4xl font-black text-white tracking-tight mb-2">AI Configuration</h2>
                    <p className="text-lg text-white/40">Select and configure the brain powering Zeni.</p>
                </div>
                {/* Global Save Button (always visible) */}
                <button
                    onClick={saveConfig}
                    className="group relative px-8 py-3 rounded-xl font-bold text-white overflow-hidden transition-all hover:scale-105 active:scale-95"
                    style={{ background: accent }}
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative flex items-center gap-2">
                        {saveMessage || 'Save Changes'}
                        {!saveMessage && <Check size={18} className="opacity-50" />}
                    </span>
                </button>
            </div>

            {/* Provider Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {providers.map(p => {
                    const isActive = config.activeProvider === p.type;
                    const status = providerStatuses.get(p.type as AIProviderType);
                    const providerConfig = config.providers[p.type as AIProviderType];
                    const isConfigured = providerConfig && (p.type === 'ollama' ? true : !!providerConfig.apiKey);

                    return (
                        <motion.button
                            key={p.type}
                            onClick={() => setActiveProvider(p.type as AIProviderType)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`relative text-left p-6 rounded-3xl border transition-all duration-300 ${isActive
                                ? 'bg-white/10 border-white/20 shadow-2xl'
                                : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${isActive ? 'bg-white/20' : 'bg-white/5'
                                }`}>
                                <p.icon size={24} color={isActive ? '#fff' : p.color} />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-1">{p.name}</h3>
                            <p className="text-xs font-medium text-white/40 mb-4">{p.description}</p>

                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                {status?.available ? (
                                    <span className="text-emerald-400 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_currentColor]" />
                                        Ready
                                    </span>
                                ) : (
                                    <span className="text-white/20 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                        {isConfigured ? 'Error' : 'Setup'}
                                    </span>
                                )}
                            </div>

                            {isActive && (
                                <motion.div
                                    layoutId="active-ring"
                                    className="absolute inset-0 rounded-3xl border-2 pointer-events-none"
                                    style={{ borderColor: accent }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Configuration Panel */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={config.activeProvider}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-3xl border border-white/10 overflow-hidden relative"
                    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)' }}
                >
                    {/* Glass Shine */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    <div className="p-8 md:p-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-xl bg-white/5">
                                <Sparkles size={20} className="text-white/60" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">
                                    Configure {providers.find(p => p.type === config.activeProvider)?.name}
                                </h3>
                                <p className="text-white/40 text-sm">Update your connection details and select a model.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            {/* API Key Manager */}
                            {config.activeProvider !== 'ollama' && (
                                <APIKeyManager
                                    provider={config.activeProvider}
                                    providerName={providers.find(p => p.type === config.activeProvider)?.name || ''}
                                    providerColor={providers.find(p => p.type === config.activeProvider)?.color || accent}
                                    accent={accent}
                                    onModelsLoaded={(models: ModelInfo[]) => {
                                        setAvailableModels(prev => new Map(prev).set(config.activeProvider, models));
                                        if (!config.providers[config.activeProvider]?.model && models.length > 0) {
                                            updateProviderConfig(config.activeProvider, 'model', models[0].id);
                                        }
                                    }}
                                />
                            )}

                            {/* Ollama Base URL */}
                            {config.activeProvider === 'ollama' && (
                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest pl-1">
                                        Base URL
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={config.providers.ollama?.baseUrl || ''}
                                            onChange={(e) => updateProviderConfig('ollama', 'baseUrl', e.target.value)}
                                            onBlur={() => validateAndFetchModels('ollama')}
                                            placeholder="http://localhost:11434"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-4 text-white text-sm font-mono focus:outline-none focus:border-white/30 focus:bg-black/30 transition-all placeholder:text-white/20"
                                        />
                                    </div>
                                    <p className="text-xs text-white/30 pl-1">Default: http://localhost:11434</p>
                                </div>
                            )}

                            {/* Model Selection */}
                            <div className="space-y-4">
                                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest pl-1 flex items-center justify-between">
                                    <span>Selected Model</span>
                                    {fetchingModels === config.activeProvider && (
                                        <span className="flex items-center gap-2 text-white/60 normal-case tracking-normal">
                                            <Loader2 size={12} className="animate-spin" /> Fetching...
                                        </span>
                                    )}
                                </label>
                                <div className="relative">
                                    <select
                                        value={config.providers[config.activeProvider]?.model || ''}
                                        onChange={(e) => updateProviderConfig(config.activeProvider, 'model', e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-white/30 appearance-none cursor-pointer hover:bg-black/30 transition-all"
                                    >
                                        <option value="" disabled>Select a model...</option>
                                        {(availableModels.get(config.activeProvider) || []).map(m => (
                                            <option key={m.id} value={m.id} className="bg-[#1a1a1a]">
                                                {m.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                        <RefreshCw size={14} />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => validateAndFetchModels(config.activeProvider)}
                                        className="text-xs font-bold text-white/40 hover:text-white transition-colors flex items-center gap-2 uppercase tracking-wide"
                                    >
                                        <RefreshCw size={10} /> Refresh Models
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Error State Display */}
                        {providerStatuses.get(config.activeProvider) && !providerStatuses.get(config.activeProvider)?.available && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
                            >
                                <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                                <div className="text-sm text-red-300">
                                    <p className="font-bold mb-1">Connection Failed</p>
                                    <p className="opacity-80">{providerStatuses.get(config.activeProvider)?.error || 'Make sure the API key is correct and the service is reachable.'}</p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Provider Priority Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-8 rounded-3xl bg-white/[0.03] border border-white/5"
            >
                <ProviderPriorityManager
                    accent={accent}
                    onSave={() => {
                        // Refresh config from service after priority changes
                        setConfig(aiService.getConfig());
                        setSaveMessage('✓ Priority Updated');
                        setTimeout(() => setSaveMessage(''), 3000);
                    }}
                />
            </motion.div>

            {/* Token Wallet Section - Only show when using backend mode */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-white mb-2">Token Wallet</h3>
                        <p className="text-sm text-white/40">
                            Your AI usage balance when using Zenner Cloud.
                        </p>
                    </div>
                    <WalletWidget
                        apiUrl={localStorage.getItem('zenner_api_url') || ''}
                        apiKey={localStorage.getItem('zenner_api_key') || ''}
                        accent={accent}
                        onLowBalance={(balance) => {
                            console.log('Low balance warning:', balance);
                        }}
                    />
                </div>

                <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-white mb-2">Usage Mode</h3>
                        <p className="text-sm text-white/40">
                            Choose how AI requests are processed.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <button
                            onClick={() => {
                                localStorage.setItem('zenner_routing_mode', 'backend');
                                setSaveMessage('✓ Using Zenner Cloud');
                                setTimeout(() => setSaveMessage(''), 3000);
                            }}
                            className={`w-full p-4 rounded-xl border text-left transition-all ${localStorage.getItem('zenner_routing_mode') === 'backend'
                                    ? 'bg-white/10 border-white/20'
                                    : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${localStorage.getItem('zenner_routing_mode') === 'backend'
                                        ? 'bg-emerald-400'
                                        : 'bg-white/20'
                                    }`} />
                                <div>
                                    <div className="font-bold text-white">Zenner Cloud</div>
                                    <div className="text-xs text-white/40">Uses your wallet balance • Features RAG memory</div>
                                </div>
                            </div>
                        </button>
                        <button
                            onClick={() => {
                                localStorage.setItem('zenner_routing_mode', 'byok');
                                setSaveMessage('✓ Using Your Own Keys');
                                setTimeout(() => setSaveMessage(''), 3000);
                            }}
                            className={`w-full p-4 rounded-xl border text-left transition-all ${localStorage.getItem('zenner_routing_mode') === 'byok'
                                    ? 'bg-white/10 border-white/20'
                                    : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${localStorage.getItem('zenner_routing_mode') === 'byok'
                                        ? 'bg-emerald-400'
                                        : 'bg-white/20'
                                    }`} />
                                <div>
                                    <div className="font-bold text-white">Your Own Keys (BYOK)</div>
                                    <div className="text-xs text-white/40">Direct API calls • No wallet needed</div>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
