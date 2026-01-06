import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Check, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { aiService } from '../services/ai/AIService';
import type { AIProviderType, ProviderStatus, ModelInfo } from '../services/ai/types';

interface AISettingsViewProps {
    accent: string;
}

export function AISettingsView({ accent }: AISettingsViewProps) {
    const [config, setConfig] = useState(aiService.getConfig());
    const [providerStatuses, setProviderStatuses] = useState<Map<AIProviderType, ProviderStatus>>(new Map());
    const [availableModels, setAvailableModels] = useState<Map<AIProviderType, ModelInfo[]>>(new Map());
    const [validatingProvider, setValidatingProvider] = useState<AIProviderType | null>(null);
    const [fetchingModels, setFetchingModels] = useState<AIProviderType | null>(null);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        // Check all providers on mount
        checkAllProviders();
    }, []);

    const checkAllProviders = async () => {
        const statuses = await aiService.checkAllProviders();
        setProviderStatuses(statuses);

        // For providers that are available, fetch models
        for (const [type, status] of statuses.entries()) {
            if (status.available && status.models) {
                setAvailableModels(prev => new Map(prev).set(type, status.models!));
            }
        }
    };

    const validateAndFetchModels = async (type: AIProviderType) => {
        setValidatingProvider(type);

        // First, update the config in aiService so validation uses the new credentials
        aiService.updateConfig(config);

        // Validate the provider
        const status = await aiService.checkProvider(type);
        setProviderStatuses(prev => new Map(prev).set(type, status));

        if (status.available) {
            // Fetch models dynamically
            setFetchingModels(type);
            try {
                const models = await aiService.fetchModels(type);
                setAvailableModels(prev => new Map(prev).set(type, models));

                // Auto-select first model if none selected
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
        const newConfig = {
            ...config,
            providers: {
                ...config.providers,
                [provider]: {
                    ...config.providers[provider],
                    [field]: value
                }
            }
        };
        setConfig(newConfig);
    };

    const setActiveProvider = (provider: AIProviderType) => {
        const newConfig = {
            ...config,
            activeProvider: provider
        };
        setConfig(newConfig);
    };

    const saveConfig = () => {
        aiService.updateConfig(config);
        setSaveMessage('✓ Configuration saved!');
        setTimeout(() => setSaveMessage(''), 3000);
    };

    const providers: { type: AIProviderType; name: string; icon: string; description: string }[] = [
        { type: 'ollama', name: 'Ollama', icon: '🦙', description: 'Local, Free, Private' },
        { type: 'openai', name: 'OpenAI', icon: '🤖', description: 'GPT-4, Cloud' },
        { type: 'gemini', name: 'Google Gemini', icon: '✨', description: 'Fast, Multimodal' },
        { type: 'claude', name: 'Claude', icon: '🧠', description: 'Anthropic, Thoughtful' }
    ];

    return (
        <div className="p-12 max-w-6xl mx-auto space-y-10" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
            {/* Header */}
            <div className="mb-12">
                <span className="px-5 py-2.5 rounded-2xl text-sm font-black uppercase tracking-wider bg-white/[0.08] text-white/60 border border-white/[0.15] inline-block mb-6">
                    AI Configuration
                </span>
                <h2 className="text-4xl font-black text-white mb-3">Configure Zeni's Brain</h2>
                <p className="text-lg text-white/50">Enter API key → Auto-validate → Fetch models dynamically</p>
            </div>

            {/* Active Provider Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {providers.map(provider => {
                    const status = providerStatuses.get(provider.type);
                    const isActive = config.activeProvider === provider.type;
                    const isValidating = validatingProvider === provider.type;

                    return (
                        <motion.button
                            key={provider.type}
                            whileHover={{ scale: 1.03, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveProvider(provider.type)}
                            className="p-6 rounded-2xl text-left relative overflow-hidden"
                            style={{
                                background: isActive
                                    ? `linear-gradient(135deg, ${accent}20 0%, ${accent}10 100%)`
                                    : 'rgba(255,255,255,0.03)',
                                border: isActive
                                    ? `2px solid ${accent}`
                                    : '1px solid rgba(255,255,255,0.08)'
                            }}
                        >
                            <div className="text-4xl mb-3">{provider.icon}</div>
                            <h3 className="text-xl font-bold text-white mb-2">{provider.name}</h3>
                            <p className="text-sm text-white/50 mb-4">{provider.description}</p>

                            {/* Status Indicator */}
                            <div className="flex items-center gap-2 text-xs font-bold">
                                {isValidating ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" style={{ color: accent }} />
                                        <span style={{ color: accent }}>Validating...</span>
                                    </>
                                ) : status?.available ? (
                                    <>
                                        <Check size={14} className="text-green-500" />
                                        <span className="text-green-500">Connected</span>
                                    </>
                                ) : status ? (
                                    <>
                                        <AlertCircle size={14} className="text-red-500" />
                                        <span className="text-red-500">Not Available</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-3 h-3 rounded-full bg-white/20" />
                                        <span className="text-white/40">Not Configured</span>
                                    </>
                                )}
                            </div>

                            {isActive && (
                                <div className="absolute top-3 right-3">
                                    <div className="w-3 h-3 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
                                </div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Provider Configuration */}
            <div className="space-y-6">
                {/* Ollama */}
                {config.activeProvider === 'ollama' && (
                    <ProviderConfigCard
                        title="Ollama Configuration"
                        description="Local AI running on your machine"
                        accent={accent}
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-white/70 mb-2">Base URL</label>
                                <input
                                    type="text"
                                    value={config.providers.ollama.baseUrl}
                                    onChange={(e) => updateProviderConfig('ollama', 'baseUrl', e.target.value)}
                                    onBlur={() => validateAndFetchModels('ollama')}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-white/30 transition-colors"
                                    placeholder="http://localhost:11434"
                                />
                                <p className="text-xs text-white/40 mt-2">Auto-validates when you finish typing</p>
                            </div>

                            {/* Dynamic Models */}
                            {availableModels.get('ollama') && availableModels.get('ollama')!.length > 0 && (
                                <div>
                                    <label className="block text-sm font-bold text-white/70 mb-2">
                                        Model {fetchingModels === 'ollama' && <Loader2 size={12} className="inline animate-spin ml-2" />}
                                    </label>
                                    <select
                                        value={config.providers.ollama.model || ''}
                                        onChange={(e) => updateProviderConfig('ollama', 'model', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-white/30"
                                    >
                                        <option value="">Select a model</option>
                                        {availableModels.get('ollama')!.map(model => (
                                            <option key={model.id} value={model.id}>
                                                {model.name} {model.description && `(${model.description})`}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-white/40 mt-2">
                                        {availableModels.get('ollama')!.length} model(s) found
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={() => validateAndFetchModels('ollama')}
                                disabled={validatingProvider === 'ollama'}
                                className="px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
                                style={{
                                    background: `${accent}20`,
                                    border: `1px solid ${accent}40`,
                                    color: accent
                                }}
                            >
                                <RefreshCw size={16} className={validatingProvider === 'ollama' ? 'animate-spin' : ''} />
                                {validatingProvider === 'ollama' ? 'Validating & Fetching...' : 'Validate & Fetch Models'}
                            </button>

                            {providerStatuses.get('ollama') && !providerStatuses.get('ollama')?.available && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <p className="text-sm text-red-400">
                                        <strong>Not connected.</strong> Make sure Ollama is running:<br />
                                        <code className="text-xs bg-black/30 px-2 py-1 rounded mt-2 inline-block">ollama serve</code>
                                    </p>
                                </div>
                            )}
                        </div>
                    </ProviderConfigCard>
                )}

                {/* OpenAI */}
                {config.activeProvider === 'openai' && (
                    <ProviderConfigCard
                        title="OpenAI Configuration"
                        description="GPT-4 and other OpenAI models"
                        accent={accent}
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-white/70 mb-2">API Key</label>
                                <input
                                    type="password"
                                    value={config.providers.openai.apiKey || ''}
                                    onChange={(e) => updateProviderConfig('openai', 'apiKey', e.target.value)}
                                    onBlur={() => config.providers.openai.apiKey && validateAndFetchModels('openai')}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-white/30 transition-colors"
                                    placeholder="sk-..."
                                />
                                <p className="text-xs text-white/40 mt-2">
                                    Get from platform.openai.com • Auto-validates on blur
                                </p>
                            </div>

                            {/* Dynamic Models */}
                            {availableModels.get('openai') && availableModels.get('openai')!.length > 0 && (
                                <div>
                                    <label className="block text-sm font-bold text-white/70 mb-2">
                                        Model {fetchingModels === 'openai' && <Loader2 size={12} className="inline animate-spin ml-2" />}
                                    </label>
                                    <select
                                        value={config.providers.openai.model || ''}
                                        onChange={(e) => updateProviderConfig('openai', 'model', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-white/30"
                                    >
                                        <option value="">Select a model</option>
                                        {availableModels.get('openai')!.map(model => (
                                            <option key={model.id} value={model.id}>
                                                {model.name} {model.description && `(${model.description})`}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-white/40 mt-2">
                                        {availableModels.get('openai')!.length} model(s) available
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={() => validateAndFetchModels('openai')}
                                disabled={validatingProvider === 'openai' || !config.providers.openai.apiKey}
                                className="px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                                style={{
                                    background: `${accent}20`,
                                    border: `1px solid ${accent}40`,
                                    color: accent
                                }}
                            >
                                <RefreshCw size={16} className={validatingProvider === 'openai' ? 'animate-spin' : ''} />
                                {validatingProvider === 'openai' ? 'Validating & Fetching...' : 'Validate & Fetch Models'}
                            </button>

                            {providerStatuses.get('openai') && !providerStatuses.get('openai')?.available && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <p className="text-sm text-red-400">
                                        <strong>Invalid API key.</strong> Check your OpenAI API key and try again.
                                    </p>
                                </div>
                            )}
                        </div>
                    </ProviderConfigCard>
                )}

                {/* Gemini */}
                {config.activeProvider === 'gemini' && (
                    <ProviderConfigCard
                        title="Google Gemini Configuration"
                        description="Fast, multimodal AI by Google"
                        accent={accent}
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-white/70 mb-2">API Key</label>
                                <input
                                    type="password"
                                    value={config.providers.gemini.apiKey || ''}
                                    onChange={(e) => updateProviderConfig('gemini', 'apiKey', e.target.value)}
                                    onBlur={() => config.providers.gemini.apiKey && validateAndFetchModels('gemini')}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-white/30 transition-colors"
                                    placeholder="AIza..."
                                />
                                <p className="text-xs text-white/40 mt-2">
                                    Get from makersuite.google.com/app/apikey • Auto-validates on blur
                                </p>
                            </div>

                            {/* Dynamic Models */}
                            {availableModels.get('gemini') && availableModels.get('gemini')!.length > 0 && (
                                <div>
                                    <label className="block text-sm font-bold text-white/70 mb-2">
                                        Model {fetchingModels === 'gemini' && <Loader2 size={12} className="inline animate-spin ml-2" />}
                                    </label>
                                    <select
                                        value={config.providers.gemini.model || ''}
                                        onChange={(e) => updateProviderConfig('gemini', 'model', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-white/30"
                                    >
                                        <option value="">Select a model</option>
                                        {availableModels.get('gemini')!.map(model => (
                                            <option key={model.id} value={model.id}>
                                                {model.name} {model.description && `(${model.description})`}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-white/40 mt-2">
                                        {availableModels.get('gemini')!.length} model(s) available
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={() => validateAndFetchModels('gemini')}
                                disabled={validatingProvider === 'gemini' || !config.providers.gemini.apiKey}
                                className="px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                                style={{
                                    background: `${accent}20`,
                                    border: `1px solid ${accent}40`,
                                    color: accent
                                }}
                            >
                                <RefreshCw size={16} className={validatingProvider === 'gemini' ? 'animate-spin' : ''} />
                                {validatingProvider === 'gemini' ? 'Validating & Fetching...' : 'Validate & Fetch Models'}
                            </button>

                            {providerStatuses.get('gemini') && !providerStatuses.get('gemini')?.available && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <p className="text-sm text-red-400">
                                        <strong>Invalid API key.</strong> Check your Gemini API key and try again.
                                    </p>
                                </div>
                            )}
                        </div>
                    </ProviderConfigCard>
                )}

                {/* Claude */}
                {config.activeProvider === 'claude' && (
                    <ProviderConfigCard
                        title="Claude Configuration"
                        description="Thoughtful AI by Anthropic"
                        accent={accent}
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-white/70 mb-2">API Key</label>
                                <input
                                    type="password"
                                    value={config.providers.claude.apiKey || ''}
                                    onChange={(e) => updateProviderConfig('claude', 'apiKey', e.target.value)}
                                    onBlur={() => config.providers.claude.apiKey && validateAndFetchModels('claude')}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-white/30 transition-colors"
                                    placeholder="sk-ant-..."
                                />
                                <p className="text-xs text-white/40 mt-2">
                                    Get from console.anthropic.com • Auto-validates on blur
                                </p>
                            </div>

                            {/* Dynamic Models */}
                            {availableModels.get('claude') && availableModels.get('claude')!.length > 0 && (
                                <div>
                                    <label className="block text-sm font-bold text-white/70 mb-2">
                                        Model {fetchingModels === 'claude' && <Loader2 size={12} className="inline animate-spin ml-2" />}
                                    </label>
                                    <select
                                        value={config.providers.claude.model || ''}
                                        onChange={(e) => updateProviderConfig('claude', 'model', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-white/30"
                                    >
                                        <option value="">Select a model</option>
                                        {availableModels.get('claude')!.map(model => (
                                            <option key={model.id} value={model.id}>
                                                {model.name} {model.description && `(${model.description})`}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-white/40 mt-2">
                                        {availableModels.get('claude')!.length} model(s) available
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={() => validateAndFetchModels('claude')}
                                disabled={validatingProvider === 'claude' || !config.providers.claude.apiKey}
                                className="px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                                style={{
                                    background: `${accent}20`,
                                    border: `1px solid ${accent}40`,
                                    color: accent
                                }}
                            >
                                <RefreshCw size={16} className={validatingProvider === 'claude' ? 'animate-spin' : ''} />
                                {validatingProvider === 'claude' ? 'Validating & Fetching...' : 'Validate & Fetch Models'}
                            </button>

                            {providerStatuses.get('claude') && !providerStatuses.get('claude')?.available && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <p className="text-sm text-red-400">
                                        <strong>Invalid API key.</strong> Check your Claude API key and try again.
                                    </p>
                                </div>
                            )}
                        </div>
                    </ProviderConfigCard>
                )}
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={saveConfig}
                    className="px-8 py-4 rounded-2xl font-bold text-lg transition-all"
                    style={{
                        background: `linear-gradient(135deg, ${accent} 0%, ${accent}DD 100%)`,
                        color: '#000',
                        boxShadow: `0 8px 24px ${accent}40`
                    }}
                >
                    Save Configuration
                </button>
                {saveMessage && (
                    <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-green-400 font-bold"
                    >
                        {saveMessage}
                    </motion.span>
                )}
            </div>
        </div>
    );
}

function ProviderConfigCard({ title, description, accent, children }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl"
            style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.1)'
            }}
        >
            <div className="flex items-start gap-4 mb-6">
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{
                        background: `${accent}15`,
                        border: `1px solid ${accent}30`
                    }}
                >
                    <Brain size={24} style={{ color: accent }} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
                    <p className="text-sm text-white/50">{description}</p>
                </div>
            </div>
            {children}
        </motion.div>
    );
}
