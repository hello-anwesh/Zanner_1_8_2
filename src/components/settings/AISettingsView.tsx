/**
 * AI Settings View
 * Configure AI mode (BYOK vs Backend) and manage provider API keys
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Brain, Cloud, Key, CheckCircle, AlertCircle, RefreshCw,
    Zap, Settings, Shield, LogIn, LogOut, Eye, EyeOff, Trash2
} from 'lucide-react';
import { byokService, type AIProvider, type BYOKKey } from '../../services/ai/BYOKService';
import { zennerApiClient } from '../../services/api/ZennerApiClient';
import { unifiedAIService, type AIMode } from '../../services/ai/UnifiedAIService';

interface AISettingsViewProps {
    accent: string;
}

const PROVIDER_INFO: Record<AIProvider, {
    name: string;
    icon: string;
    placeholder: string;
    description: string;
}> = {
    openai: {
        name: 'OpenAI',
        icon: '🤖',
        placeholder: 'sk-...',
        description: 'GPT-4, GPT-4o, GPT-3.5-turbo',
    },
    anthropic: {
        name: 'Anthropic',
        icon: '🧠',
        placeholder: 'sk-ant-...',
        description: 'Claude 3.5, Claude 3 Opus/Sonnet/Haiku',
    },
    google: {
        name: 'Google',
        icon: '✨',
        placeholder: 'AIza...',
        description: 'Gemini 2.0, Gemini 1.5 Pro/Flash',
    },
    groq: {
        name: 'Groq',
        icon: '⚡',
        placeholder: 'gsk_...',
        description: 'Llama 3, Mixtral (ultra-fast)',
    },
    ollama: {
        name: 'Ollama',
        icon: '🦙',
        placeholder: 'No key needed',
        description: 'Local models (Llama, Mistral, etc.)',
    },
};

export function AISettingsView({ accent }: AISettingsViewProps) {
    // State
    const [mode, setMode] = useState<AIMode>('byok');
    const [keys, setKeys] = useState<BYOKKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [zennerAuth, setZennerAuth] = useState<{
        email: string;
        plan: string;
        balance: number;
    } | null>(null);

    // Key input state
    const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
    const [keyInput, setKeyInput] = useState('');
    const [showKeyInput, setShowKeyInput] = useState(false);
    const [validating, setValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<{
        provider: AIProvider;
        valid: boolean;
        error?: string;
    } | null>(null);

    // Zenner login state
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState<string | null>(null);
    const [loggingIn, setLoggingIn] = useState(false);

    // Load initial state
    useEffect(() => {
        loadState();
    }, []);

    const loadState = async () => {
        setLoading(true);
        try {
            await unifiedAIService.init();

            const currentMode = unifiedAIService.getMode();
            setMode(currentMode);

            const storedKeys = await byokService.listKeys();
            setKeys(storedKeys);

            // Check Zenner auth
            const user = await zennerApiClient.getUserInfo();
            if (user) {
                const balance = await zennerApiClient.getTokenBalance();
                setZennerAuth({
                    email: user.email,
                    plan: user.plan,
                    balance: balance?.balance || 0,
                });
            }
        } catch (error) {
            console.error('Failed to load AI settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleModeChange = async (newMode: AIMode) => {
        await unifiedAIService.setMode(newMode);
        setMode(newMode);
    };

    const handleSaveKey = async (provider: AIProvider) => {
        if (!keyInput.trim() && provider !== 'ollama') return;

        setValidating(true);
        setValidationResult(null);

        try {
            // Save the key first
            if (provider !== 'ollama') {
                await byokService.saveKey(provider, keyInput);
            }

            // Validate it
            const result = await byokService.validateKey(provider);
            setValidationResult({ provider, valid: result.valid, error: result.error });

            if (result.valid) {
                // Refresh keys list
                const updatedKeys = await byokService.listKeys();
                setKeys(updatedKeys);
                setEditingProvider(null);
                setKeyInput('');
            }
        } catch (error: any) {
            setValidationResult({ provider, valid: false, error: error.message });
        } finally {
            setValidating(false);
        }
    };

    const handleDeleteKey = async (provider: AIProvider) => {
        await byokService.deleteKey(provider);
        const updatedKeys = await byokService.listKeys();
        setKeys(updatedKeys);
    };

    const handleZennerLogin = async () => {
        setLoggingIn(true);
        setLoginError(null);

        try {
            const result = await zennerApiClient.login(loginEmail, loginPassword);

            if (result.success && result.user) {
                const balance = await zennerApiClient.getTokenBalance();
                setZennerAuth({
                    email: result.user.email,
                    plan: result.user.plan,
                    balance: balance?.balance || 0,
                });
                setShowLoginModal(false);
                setLoginEmail('');
                setLoginPassword('');
            } else {
                setLoginError(result.error || 'Login failed');
            }
        } catch (error: any) {
            setLoginError(error.message || 'Connection failed');
        } finally {
            setLoggingIn(false);
        }
    };

    const handleZennerLogout = async () => {
        await zennerApiClient.logout();
        setZennerAuth(null);
    };

    const getKeyForProvider = (provider: AIProvider): BYOKKey | undefined => {
        return keys.find(k => k.provider === provider);
    };

    return (
        <div className="min-h-full p-8 pb-16">
            <div className="max-w-3xl mx-auto">
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
                            <Brain size={28} style={{ color: accent }} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">AI Settings</h1>
                            <p className="text-white/50">Configure how you connect to AI models</p>
                        </div>
                    </div>
                </motion.div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw className="animate-spin text-white/30" size={32} />
                    </div>
                ) : (
                    <>
                        {/* Mode Selection */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 mb-6"
                        >
                            <div className="flex items-center gap-3 mb-5">
                                <Settings size={20} style={{ color: accent }} />
                                <h2 className="text-lg font-semibold text-white">AI Mode</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* BYOK Mode */}
                                <button
                                    onClick={() => handleModeChange('byok')}
                                    className={`p-5 rounded-xl text-left transition-all ${mode === 'byok'
                                            ? 'bg-white/[0.08] border-2 border-white/20'
                                            : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05]'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <Key size={20} className="text-amber-400" />
                                        <span className="font-semibold text-white">Bring Your Own Key</span>
                                        {mode === 'byok' && (
                                            <CheckCircle size={16} className="text-emerald-400 ml-auto" />
                                        )}
                                    </div>
                                    <p className="text-sm text-white/50">
                                        Use your own API keys. Unlimited usage, direct connection.
                                    </p>
                                </button>

                                {/* Backend Mode */}
                                <button
                                    onClick={() => handleModeChange('backend')}
                                    className={`p-5 rounded-xl text-left transition-all ${mode === 'backend'
                                            ? 'bg-white/[0.08] border-2 border-white/20'
                                            : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05]'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <Cloud size={20} className="text-blue-400" />
                                        <span className="font-semibold text-white">Zenner AI</span>
                                        {mode === 'backend' && (
                                            <CheckCircle size={16} className="text-emerald-400 ml-auto" />
                                        )}
                                    </div>
                                    <p className="text-sm text-white/50">
                                        Use Zenner's AI. No setup required, uses your token balance.
                                    </p>
                                </button>
                            </div>
                        </motion.div>

                        {/* Zenner Backend Status (when in backend mode) */}
                        {mode === 'backend' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 mb-6"
                            >
                                <div className="flex items-center gap-3 mb-5">
                                    <Cloud size={20} className="text-blue-400" />
                                    <h2 className="text-lg font-semibold text-white">Zenner Account</h2>
                                </div>

                                {zennerAuth ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl">
                                            <div>
                                                <div className="text-white font-medium">{zennerAuth.email}</div>
                                                <div className="text-sm text-white/50">Plan: {zennerAuth.plan}</div>
                                            </div>
                                            <button
                                                onClick={handleZennerLogout}
                                                className="px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
                                            >
                                                <LogOut size={16} />
                                                Logout
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 bg-emerald-500/10 rounded-xl">
                                            <Zap size={20} className="text-emerald-400" />
                                            <div>
                                                <div className="text-emerald-300 font-semibold">
                                                    {zennerAuth.balance.toLocaleString()} tokens
                                                </div>
                                                <div className="text-sm text-white/50">Remaining balance</div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-white/50 mb-4">
                                            Login to your Zenner account to use backend AI.
                                        </p>
                                        <button
                                            onClick={() => setShowLoginModal(true)}
                                            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto"
                                        >
                                            <LogIn size={18} />
                                            Login to Zenner
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* BYOK Provider Keys */}
                        {mode === 'byok' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 mb-6"
                            >
                                <div className="flex items-center gap-3 mb-5">
                                    <Key size={20} style={{ color: accent }} />
                                    <h2 className="text-lg font-semibold text-white">API Keys</h2>
                                </div>

                                <div className="space-y-3">
                                    {(Object.entries(PROVIDER_INFO) as [AIProvider, typeof PROVIDER_INFO[AIProvider]][]).map(
                                        ([provider, info]) => {
                                            const existingKey = getKeyForProvider(provider);
                                            const isEditing = editingProvider === provider;
                                            const validResult = validationResult?.provider === provider ? validationResult : null;

                                            return (
                                                <div
                                                    key={provider}
                                                    className="p-4 bg-white/[0.02] hover:bg-white/[0.04] rounded-xl transition-colors"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-2xl">{info.icon}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-white">
                                                                    {info.name}
                                                                </span>
                                                                {existingKey?.isValid && (
                                                                    <CheckCircle size={14} className="text-emerald-400" />
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-white/40">{info.description}</div>
                                                        </div>

                                                        {existingKey && !isEditing ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm text-white/50 font-mono">
                                                                    {existingKey.displayName}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleDeleteKey(provider)}
                                                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        ) : provider === 'ollama' ? (
                                                            <button
                                                                onClick={() => handleSaveKey('ollama')}
                                                                disabled={validating}
                                                                className="px-3 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                            >
                                                                {validating ? 'Testing...' : 'Test Connection'}
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    setEditingProvider(provider);
                                                                    setKeyInput('');
                                                                    setValidationResult(null);
                                                                }}
                                                                className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
                                                            >
                                                                Add Key
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Key Input */}
                                                    {isEditing && provider !== 'ollama' && (
                                                        <div className="mt-4 pt-4 border-t border-white/[0.06]">
                                                            <div className="flex gap-2">
                                                                <div className="flex-1 relative">
                                                                    <input
                                                                        type={showKeyInput ? 'text' : 'password'}
                                                                        value={keyInput}
                                                                        onChange={(e) => setKeyInput(e.target.value)}
                                                                        placeholder={info.placeholder}
                                                                        className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                                                                    />
                                                                    <button
                                                                        onClick={() => setShowKeyInput(!showKeyInput)}
                                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                                                                    >
                                                                        {showKeyInput ? <EyeOff size={18} /> : <Eye size={18} />}
                                                                    </button>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleSaveKey(provider)}
                                                                    disabled={validating || !keyInput.trim()}
                                                                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
                                                                >
                                                                    {validating ? (
                                                                        <RefreshCw size={16} className="animate-spin" />
                                                                    ) : (
                                                                        <CheckCircle size={16} />
                                                                    )}
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingProvider(null);
                                                                        setKeyInput('');
                                                                        setValidationResult(null);
                                                                    }}
                                                                    className="px-4 py-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>

                                                            {/* Validation Result */}
                                                            {validResult && (
                                                                <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${validResult.valid
                                                                        ? 'bg-emerald-500/10 text-emerald-300'
                                                                        : 'bg-red-500/10 text-red-300'
                                                                    }`}>
                                                                    {validResult.valid ? (
                                                                        <CheckCircle size={16} />
                                                                    ) : (
                                                                        <AlertCircle size={16} />
                                                                    )}
                                                                    <span className="text-sm">
                                                                        {validResult.valid ? 'Key is valid!' : validResult.error}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Security Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <Shield size={20} className="text-emerald-400" />
                                <h2 className="text-lg font-semibold text-white">Security</h2>
                            </div>

                            <div className="space-y-3 text-sm text-white/50">
                                <div className="flex items-start gap-3">
                                    <Key size={16} className="text-white/30 mt-0.5 shrink-0" />
                                    <p>
                                        <strong className="text-white/70">BYOK Mode:</strong> Your API keys are encrypted and stored locally on your device. They are never sent to Zenner servers.
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Cloud size={16} className="text-white/30 mt-0.5 shrink-0" />
                                    <p>
                                        <strong className="text-white/70">Backend Mode:</strong> Your requests go through Zenner's servers. We don't store your conversations, only token usage for billing.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </div>

            {/* Login Modal */}
            {showLoginModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md"
                    >
                        <h2 className="text-xl font-bold text-white mb-6">Login to Zenner</h2>

                        {loginError && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm flex items-center gap-2">
                                <AlertCircle size={16} />
                                {loginError}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-white/60 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/60 mb-2">Password</label>
                                <input
                                    type="password"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowLoginModal(false);
                                    setLoginError(null);
                                }}
                                className="flex-1 px-4 py-3 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleZennerLogin}
                                disabled={loggingIn || !loginEmail || !loginPassword}
                                className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                {loggingIn ? (
                                    <RefreshCw size={18} className="animate-spin" />
                                ) : (
                                    <LogIn size={18} />
                                )}
                                Login
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
