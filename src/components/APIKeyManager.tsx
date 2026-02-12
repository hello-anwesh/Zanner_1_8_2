import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Key, Plus, Trash2, Check, X, Loader2, AlertCircle,
    Eye, EyeOff, RefreshCw, Zap, Tag, MoreVertical
} from 'lucide-react';
import type { AIProviderType, ModelInfo, ProviderStatus } from '../services/ai/types';
import { aiService } from '../services/ai/AIService';

interface ApiKeyEntry {
    id: string;
    label: string;
    key: string;
    isValid: boolean | null; // null = not validated, true = valid, false = invalid
    validationError?: string;
    isDefault: boolean;
    models?: ModelInfo[];
}

interface APIKeyManagerProps {
    provider: AIProviderType;
    providerName: string;
    providerColor: string;
    accent: string;
    onKeysChange?: (keys: ApiKeyEntry[]) => void;
    onModelsLoaded?: (models: ModelInfo[]) => void;
}

const STORAGE_KEY_PREFIX = 'zenner-api-keys-';

export function APIKeyManager({
    provider,
    providerName,
    providerColor,
    accent,
    onKeysChange,
    onModelsLoaded
}: APIKeyManagerProps) {
    const [keys, setKeys] = useState<ApiKeyEntry[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newKeyLabel, setNewKeyLabel] = useState('');
    const [newKeyValue, setNewKeyValue] = useState('');
    const [validatingKeyId, setValidatingKeyId] = useState<string | null>(null);
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

    // Load keys from storage
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY_PREFIX + provider);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setKeys(parsed);
            } catch {
                // Invalid storage, start fresh
            }
        } else {
            // Migrate existing single key if present
            const config = aiService.getConfig();
            const existingKey = config.providers[provider]?.apiKey;
            if (existingKey) {
                const migrated: ApiKeyEntry = {
                    id: crypto.randomUUID(),
                    label: 'Default',
                    key: existingKey,
                    isValid: null,
                    isDefault: true,
                };
                setKeys([migrated]);
                saveKeys([migrated]);
            }
        }
    }, [provider]);

    const saveKeys = useCallback((updatedKeys: ApiKeyEntry[]) => {
        localStorage.setItem(STORAGE_KEY_PREFIX + provider, JSON.stringify(updatedKeys));
        onKeysChange?.(updatedKeys);

        // Update AIService with the default key
        const defaultKey = updatedKeys.find(k => k.isDefault);
        if (defaultKey && defaultKey.isValid) {
            const currentConfig = aiService.getConfig();
            aiService.updateConfig({
                ...currentConfig,
                providers: {
                    ...currentConfig.providers,
                    [provider]: {
                        ...currentConfig.providers[provider],
                        apiKey: defaultKey.key
                    }
                }
            });
        }
    }, [provider, onKeysChange]);

    const validateKey = async (keyEntry: ApiKeyEntry) => {
        setValidatingKeyId(keyEntry.id);

        // Temporarily configure the provider with this key
        const tempConfig = aiService.getConfig();
        aiService.updateConfig({
            ...tempConfig,
            providers: {
                ...tempConfig.providers,
                [provider]: {
                    ...tempConfig.providers[provider],
                    apiKey: keyEntry.key
                }
            }
        });

        try {
            const status: ProviderStatus = await aiService.checkProvider(provider);

            const updatedKeys = keys.map(k =>
                k.id === keyEntry.id
                    ? {
                        ...k,
                        isValid: status.available,
                        validationError: status.error,
                        models: status.models
                    }
                    : k
            );

            setKeys(updatedKeys);
            saveKeys(updatedKeys);

            // If valid, fetch all models
            if (status.available) {
                const models = await aiService.fetchModels(provider);
                const finalKeys = updatedKeys.map(k =>
                    k.id === keyEntry.id ? { ...k, models } : k
                );
                setKeys(finalKeys);
                saveKeys(finalKeys);
                onModelsLoaded?.(models);
            }
        } catch (error) {
            const updatedKeys = keys.map(k =>
                k.id === keyEntry.id
                    ? { ...k, isValid: false, validationError: String(error) }
                    : k
            );
            setKeys(updatedKeys);
            saveKeys(updatedKeys);
        } finally {
            setValidatingKeyId(null);
        }
    };

    const addKey = () => {
        if (!newKeyValue.trim()) return;

        const newEntry: ApiKeyEntry = {
            id: crypto.randomUUID(),
            label: newKeyLabel.trim() || `Key ${keys.length + 1}`,
            key: newKeyValue.trim(),
            isValid: null,
            isDefault: keys.length === 0, // First key is default
        };

        const updatedKeys = [...keys, newEntry];
        setKeys(updatedKeys);
        saveKeys(updatedKeys);

        // Reset form
        setNewKeyLabel('');
        setNewKeyValue('');
        setShowAddForm(false);

        // Auto-validate
        validateKey(newEntry);
    };

    const removeKey = (id: string) => {
        const updatedKeys = keys.filter(k => k.id !== id);

        // If we removed the default, make the first remaining key default
        if (updatedKeys.length > 0 && !updatedKeys.some(k => k.isDefault)) {
            updatedKeys[0].isDefault = true;
        }

        setKeys(updatedKeys);
        saveKeys(updatedKeys);
    };

    const setDefaultKey = (id: string) => {
        const updatedKeys = keys.map(k => ({
            ...k,
            isDefault: k.id === id
        }));
        setKeys(updatedKeys);
        saveKeys(updatedKeys);
    };

    const toggleKeyVisibility = (id: string) => {
        setVisibleKeys(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const maskKey = (key: string) => {
        if (key.length <= 8) return '••••••••';
        return key.slice(0, 4) + '••••••••' + key.slice(-4);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${providerColor}20` }}
                    >
                        <Key size={18} style={{ color: providerColor }} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">{providerName} API Keys</h3>
                        <p className="text-xs text-white/40">
                            {keys.length} key{keys.length !== 1 ? 's' : ''} configured
                        </p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                    style={{ background: accent, color: '#fff' }}
                >
                    <Plus size={14} />
                    Add Key
                </motion.button>
            </div>

            {/* Key List */}
            <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                    {keys.map(entry => (
                        <motion.div
                            key={entry.id}
                            layout
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={`p-4 rounded-2xl border transition-colors ${entry.isDefault
                                    ? 'bg-white/[0.08] border-white/20'
                                    : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05]'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {/* Validation Status */}
                                    <div className="shrink-0">
                                        {validatingKeyId === entry.id ? (
                                            <Loader2 size={18} className="animate-spin text-yellow-400" />
                                        ) : entry.isValid === true ? (
                                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                <Check size={12} className="text-emerald-400" />
                                            </div>
                                        ) : entry.isValid === false ? (
                                            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                                                <X size={12} className="text-red-400" />
                                            </div>
                                        ) : (
                                            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                                                <AlertCircle size={12} className="text-white/30" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Key Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-white text-sm truncate">
                                                {entry.label}
                                            </span>
                                            {entry.isDefault && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/10 text-white/60">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <code className="text-xs text-white/40 font-mono">
                                                {visibleKeys.has(entry.id) ? entry.key : maskKey(entry.key)}
                                            </code>
                                            <button
                                                onClick={() => toggleKeyVisibility(entry.id)}
                                                className="text-white/30 hover:text-white/60 transition-colors"
                                            >
                                                {visibleKeys.has(entry.id) ? <EyeOff size={12} /> : <Eye size={12} />}
                                            </button>
                                        </div>
                                        {entry.isValid === false && entry.validationError && (
                                            <p className="text-xs text-red-400 mt-1">
                                                {entry.validationError}
                                            </p>
                                        )}
                                        {entry.isValid && entry.models && (
                                            <p className="text-xs text-emerald-400/70 mt-1">
                                                {entry.models.length} models available
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => validateKey(entry)}
                                        disabled={validatingKeyId === entry.id}
                                        className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors disabled:opacity-50"
                                        title="Validate & Refresh Models"
                                    >
                                        <RefreshCw size={14} />
                                    </button>
                                    {!entry.isDefault && (
                                        <button
                                            onClick={() => setDefaultKey(entry.id)}
                                            className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-emerald-400 transition-colors"
                                            title="Set as Active"
                                        >
                                            <Zap size={14} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => removeKey(entry.id)}
                                        className="p-2 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                                        title="Remove"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {keys.length === 0 && !showAddForm && (
                    <div className="text-center py-12 text-white/30">
                        <Key size={32} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No API keys configured</p>
                        <p className="text-xs mt-1">Add your first key to get started</p>
                    </div>
                )}
            </div>

            {/* Add Key Form */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-5 rounded-2xl bg-white/[0.05] border border-white/10 space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Tag size={16} className="text-white/40" />
                                <span className="text-sm font-semibold text-white">Add New API Key</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <input
                                    type="text"
                                    placeholder="Label (e.g., Work, Personal)"
                                    value={newKeyLabel}
                                    onChange={e => setNewKeyLabel(e.target.value)}
                                    className="px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/30"
                                />
                                <input
                                    type="password"
                                    placeholder="API Key (sk-...)"
                                    value={newKeyValue}
                                    onChange={e => setNewKeyValue(e.target.value)}
                                    className="md:col-span-2 px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white text-sm font-mono placeholder-white/30 focus:outline-none focus:border-white/30"
                                />
                                <div className="flex gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={addKey}
                                        disabled={!newKeyValue.trim()}
                                        className="flex-1 px-4 py-3 rounded-xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ background: accent }}
                                    >
                                        Save
                                    </motion.button>
                                    <button
                                        onClick={() => {
                                            setShowAddForm(false);
                                            setNewKeyLabel('');
                                            setNewKeyValue('');
                                        }}
                                        className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
