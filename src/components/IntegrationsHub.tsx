import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Brain, Image, MonitorSmartphone, X,
    Zap, Cpu, Sparkles, Wand2,
    Tablet, Play, Link2, Loader2, CheckCircle2, AlertCircle
} from "lucide-react";
import { aiService } from "../services/ai/AIService";
import type { AIProviderType } from "../services/ai/types";

interface IntegrationProvider {
    id: string;
    name: string;
    category: "text" | "image" | "automation";
    description: string;
    icon: any;
    color: string;
    requiresApiKey: boolean;
    isLocal?: boolean;
    status: "connected" | "disconnected" | "error";
}

interface IntegrationsHubProps {
    accent: string;
}

const TEXT_AI_PROVIDERS: IntegrationProvider[] = [
    {
        id: "openai",
        name: "OpenAI",
        category: "text",
        description: "GPT-4, GPT-3.5 Turbo",
        icon: Sparkles,
        color: "#10a37f",
        requiresApiKey: true,
        status: "disconnected"
    },
    {
        id: "claude",
        name: "Anthropic Claude",
        category: "text",
        description: "Claude 3.5 Sonnet, Opus",
        icon: Brain,
        color: "#d97757",
        requiresApiKey: true,
        status: "disconnected"
    },
    {
        id: "gemini",
        name: "Google Gemini",
        category: "text",
        description: "Gemini Pro, Ultra",
        icon: Sparkles,
        color: "#4285f4",
        requiresApiKey: true,
        status: "disconnected"
    },
    {
        id: "ollama",
        name: "Ollama",
        category: "text",
        description: "Local - Llama, Mistral, Phi",
        icon: Cpu,
        color: "#10b981",
        requiresApiKey: false,
        isLocal: true,
        status: "disconnected"
    },
    {
        id: "mistral",
        name: "Mistral AI",
        category: "text",
        description: "Mistral Large, Medium, Small",
        icon: Zap,
        color: "#f97316",
        requiresApiKey: true,
        status: "disconnected"
    }
];

const IMAGE_AI_PROVIDERS: IntegrationProvider[] = [
    {
        id: "dalle",
        name: "DALL-E 3",
        category: "image",
        description: "OpenAI Image Generation",
        icon: Image,
        color: "#10a37f",
        requiresApiKey: true,
        status: "disconnected"
    },
    {
        id: "stable-diffusion",
        name: "Stable Diffusion",
        category: "image",
        description: "Open-source image gen",
        icon: Wand2,
        color: "#8b5cf6",
        requiresApiKey: false,
        isLocal: true,
        status: "disconnected"
    },
    {
        id: "midjourney",
        name: "Midjourney",
        category: "image",
        description: "Premium AI art generation",
        icon: Sparkles,
        color: "#ec4899",
        requiresApiKey: true,
        status: "disconnected"
    }
];

const AUTOMATION_PROVIDERS: IntegrationProvider[] = [
    {
        id: "playwright",
        name: "Playwright",
        category: "automation",
        description: "Browser automation & testing",
        icon: Play,
        color: "#2dd4bf",
        requiresApiKey: false,
        isLocal: true,
        status: "disconnected"
    },
    {
        id: "applescript",
        name: "AppleScript",
        category: "automation",
        description: "macOS native automation",
        icon: Tablet,
        color: "#a855f7",
        requiresApiKey: false,
        isLocal: true,
        status: "disconnected"
    },
    {
        id: "shortcuts",
        name: "Shortcuts",
        category: "automation",
        description: "iOS/macOS system shortcuts",
        icon: Link2,
        color: "#f59e0b",
        requiresApiKey: false,
        isLocal: true,
        status: "disconnected"
    }
];

export function IntegrationsHub({ accent }: IntegrationsHubProps) {
    const [selectedProvider, setSelectedProvider] = useState<IntegrationProvider | null>(null);
    const [apiKey, setApiKey] = useState("");
    const [baseUrl, setBaseUrl] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [validationStatus, setValidationStatus] = useState<"idle" | "validating" | "success" | "error">("idle");
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [selectedModel, setSelectedModel] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Dynamic provider statuses
    const [textProviders, setTextProviders] = useState(TEXT_AI_PROVIDERS);

    // Load saved config and update provider statuses on mount
    useEffect(() => {
        const config = aiService.getConfig();
        const updated = TEXT_AI_PROVIDERS.map(p => ({
            ...p,
            status: (config.providers[p.id as AIProviderType]?.apiKey || p.id === 'ollama')
                ? "connected" as const
                : "disconnected" as const
        }));
        setTextProviders(updated);
    }, []);


    const validateAndFetchModels = async (provider: IntegrationProvider, key: string, url?: string) => {
        setIsValidating(true);
        setValidationStatus("validating");
        setErrorMessage("");
        setAvailableModels([]);

        try {
            // Map provider ID to AIService provider type
            const providerType = provider.id === "claude" ? "claude" :
                provider.id === "gemini" ? "gemini" :
                    provider.id === "ollama" ? "ollama" :
                        provider.id === "openai" ? "openai" : null;

            if (!providerType) {
                throw new Error("Provider not supported yet");
            }

            // Configure the provider with API key
            aiService.updateConfig({
                providers: {
                    [providerType]: {
                        apiKey: key,
                        ...(url && { baseUrl: url }),
                        model: "" // Will be set after model selection
                    }
                } as any
            });

            // Test connection
            const status = await aiService.checkProvider(providerType as any);

            if (!status.available) {
                throw new Error(status.error || "Connection failed");
            }

            // Fetch available models
            const models = await aiService.fetchModels(providerType as any);

            if (models.length === 0) {
                throw new Error("No models available");
            }

            setAvailableModels(models.map(m => m.id));
            setSelectedModel(models[0].id);
            setValidationStatus("success");

        } catch (error: any) {
            setValidationStatus("error");
            setErrorMessage(error.message || "Validation failed");
        } finally {
            setIsValidating(false);
        }
    };

    const handleApiKeyChange = (value: string) => {
        setApiKey(value);
        setValidationStatus("idle");
        setAvailableModels([]);

        // Auto-validate when key looks complete (basic heuristic)
        if (value.length > 20 && selectedProvider) {
            validateAndFetchModels(selectedProvider, value, baseUrl || undefined);
        }
    };

    const handleSave = async () => {
        console.log("=== SAVE CLICKED ===");
        console.log("selectedProvider:", selectedProvider);
        console.log("selectedModel:", selectedModel);
        console.log("apiKey:", apiKey);
        console.log("baseUrl:", baseUrl);

        if (!selectedProvider || !selectedModel) {
            console.error("Missing provider or model!");
            return;
        }

        const providerType = selectedProvider.id === "claude" ? "claude" :
            selectedProvider.id === "gemini" ? "gemini" :
                selectedProvider.id === "ollama" ? "ollama" :
                    selectedProvider.id === "openai" ? "openai" : null;

        if (providerType) {
            const configToSave = {
                activeProvider: providerType as any,
                providers: {
                    [providerType]: {
                        apiKey,
                        ...(baseUrl && { baseUrl }),
                        model: selectedModel
                    }
                } as any
            };

            console.log("Calling aiService.updateConfig with:", JSON.stringify(configToSave, null, 2));
            aiService.updateConfig(configToSave as any);

            // Verify what was saved
            const savedConfig = aiService.getConfig();
            console.log("Config after save:", JSON.stringify(savedConfig, null, 2));

            // Check localStorage
            const stored = localStorage.getItem('ai-service-config');
            console.log("localStorage content:", stored);
        }

        setSelectedProvider(null);
        setApiKey("");
        setBaseUrl("");
        setAvailableModels([]);
    };

    const ProviderCard = ({ provider }: { provider: IntegrationProvider }) => {
        const Icon = provider.icon;
        const isConnected = provider.status === "connected";

        return (
            <div
                className="p-6 rounded-2xl transition-all hover:scale-[1.01]"
                style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    border: `1px solid ${isConnected ? provider.color + "20" : "rgba(255, 255, 255, 0.06)"}`,
                }}
            >
                <div className="flex items-start justify-between mb-6">
                    {/* Left: Icon + Info */}
                    <div className="flex items-start gap-4 flex-1">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                                background: `${provider.color}10`,
                                border: `1px solid ${provider.color}20`
                            }}
                        >
                            <Icon size={22} style={{ color: provider.color }} strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-base font-bold text-white">{provider.name}</h3>
                                {provider.isLocal && (
                                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        Local
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-white/40">{provider.description}</p>
                        </div>
                    </div>

                    {/* Right: Status */}
                    {isConnected && (
                        <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg" style={{
                            background: `${provider.color}10`,
                            color: provider.color,
                            border: `1px solid ${provider.color}20`
                        }}>
                            <CheckCircle2 size={14} />
                            Active
                        </span>
                    )}
                </div>

                {/* Bottom: Configure Button */}
                <button
                    onClick={() => {
                        setSelectedProvider(provider);
                        setApiKey("");
                        setBaseUrl("");
                        setValidationStatus("idle");
                        setAvailableModels([]);
                    }}
                    className="w-full px-4 py-3 rounded-xl text-sm font-bold transition-all"
                    style={{
                        background: isConnected ? 'rgba(255,255,255,0.03)' : `${provider.color}15`,
                        color: isConnected ? '#888' : provider.color,
                        border: `1px solid ${isConnected ? 'rgba(255,255,255,0.08)' : provider.color + '25'}`
                    }}
                >
                    {isConnected ? '⚙️ Reconfigure' : '→ Configure'}
                </button>
            </div>
        );
    };

    const CategorySection = ({
        title,
        icon: Icon,
        providers
    }: {
        title: string;
        icon: any;
        providers: IntegrationProvider[]
    }) => (
        <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                        background: `${accent}15`,
                        border: `1px solid ${accent}25`
                    }}
                >
                    <Icon size={18} style={{ color: accent }} strokeWidth={2.5} />
                </div>
                <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-wider">{title}</h2>
                    <p className="text-[10px] text-white/40 font-medium">{providers.length} providers available</p>
                </div>
            </div>
            <div className="space-y-3">
                {providers.map(provider => (
                    <ProviderCard key={provider.id} provider={provider} />
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-full p-6 animate-fade-in">
            <div className="max-w-6xl mx-auto">
                {/* Small Badge */}
                <div className="mb-6">
                    <span className="px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/[0.03] text-white/40 border border-white/[0.08]">
                        Integrations
                    </span>
                </div>

                <CategorySection
                    title="Text AI"
                    icon={Brain}
                    providers={textProviders}
                />
                <CategorySection
                    title="Image AI"
                    icon={Image}
                    providers={IMAGE_AI_PROVIDERS}
                />
                <CategorySection
                    title="Screen Control"
                    icon={MonitorSmartphone}
                    providers={AUTOMATION_PROVIDERS}
                />
            </div>

            {/* Configuration Modal */}
            <AnimatePresence>
                {selectedProvider && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
                        onClick={() => setSelectedProvider(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md p-6 rounded-3xl"
                            style={{
                                background: "rgba(10, 10, 15, 0.95)",
                                border: "1px solid rgba(255, 255, 255, 0.1)"
                            }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black text-white">{selectedProvider.name}</h3>
                                <button
                                    onClick={() => setSelectedProvider(null)}
                                    className="p-2 rounded-xl hover:bg-white/5"
                                >
                                    <X size={18} className="text-white/60" />
                                </button>
                            </div>
                            <p className="text-sm text-white/60 mb-6">{selectedProvider.description}</p>

                            {selectedProvider.requiresApiKey && (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-xs font-bold text-white/60 mb-2 uppercase tracking-wider">
                                            API Key
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                value={apiKey}
                                                onChange={(e) => handleApiKeyChange(e.target.value)}
                                                placeholder="Enter your API key..."
                                                className="w-full px-4 py-3 pr-10 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none"
                                            />
                                            {validationStatus === "validating" && (
                                                <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 animate-spin" />
                                            )}
                                            {validationStatus === "success" && (
                                                <CheckCircle2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                                            )}
                                            {validationStatus === "error" && (
                                                <AlertCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400" />
                                            )}
                                        </div>
                                        {errorMessage && (
                                            <p className="text-xs text-red-400 mt-2">{errorMessage}</p>
                                        )}
                                    </div>

                                    {selectedProvider.isLocal && (
                                        <div className="mb-4">
                                            <label className="block text-xs font-bold text-white/60 mb-2 uppercase tracking-wider">
                                                Base URL (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={baseUrl}
                                                onChange={(e) => setBaseUrl(e.target.value)}
                                                placeholder="http://localhost:11434"
                                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none"
                                            />
                                        </div>
                                    )}

                                    {availableModels.length > 0 && (
                                        <div className="mb-4">
                                            <label className="block text-xs font-bold text-white/60 mb-2 uppercase tracking-wider">
                                                Select Model
                                            </label>
                                            <select
                                                value={selectedModel}
                                                onChange={(e) => setSelectedModel(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none"
                                            >
                                                {availableModels.map(model => (
                                                    <option key={model} value={model} style={{ background: "#1a1a1f" }}>
                                                        {model}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Buttons */}
                            <div className="space-y-3 mt-6">
                                {/* Test Connection Button */}
                                {selectedProvider.requiresApiKey && (
                                    <button
                                        onClick={() => selectedProvider && validateAndFetchModels(selectedProvider, apiKey, baseUrl || undefined)}
                                        disabled={!apiKey || isValidating}
                                        className="w-full px-4 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-30"
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#fff'
                                        }}
                                    >
                                        {isValidating ? (
                                            <><Loader2 size={16} className="inline mr-2 animate-spin" /> Testing Connection...</>
                                        ) : (
                                            "Test Connection & Fetch Models"
                                        )}
                                    </button>
                                )}

                                {/* BIG ASS SAVE BUTTON */}
                                {availableModels.length > 0 && (
                                    <button
                                        onClick={() => {
                                            handleSave();
                                            setSelectedProvider(null);
                                        }}
                                        className="w-full px-6 py-4 rounded-xl text-base font-black uppercase tracking-wide transition-all"
                                        style={{
                                            background: selectedProvider.color,
                                            color: "#000",
                                            boxShadow: `0 8px 24px ${selectedProvider.color}60`
                                        }}
                                    >
                                        ✓ Save Configuration
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
