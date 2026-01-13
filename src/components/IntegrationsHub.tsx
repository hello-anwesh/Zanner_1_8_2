import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Brain, Image, MonitorSmartphone, X,
    Zap, Cpu, Sparkles, Wand2,
    Tablet, Play, Link2, Loader2, CheckCircle2, AlertCircle, RefreshCw
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
    const [activeTab, setActiveTab] = useState<"text" | "image" | "automation">("text");
    const [selectedProvider, setSelectedProvider] = useState<IntegrationProvider | null>(null);
    const [apiKey, setApiKey] = useState("");
    const [baseUrl, setBaseUrl] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [validationStatus, setValidationStatus] = useState<"idle" | "validating" | "success" | "error">("idle");
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [selectedModel, setSelectedModel] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [textProviders, setTextProviders] = useState(TEXT_AI_PROVIDERS);

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
            const providerType = provider.id === "claude" ? "claude" :
                provider.id === "gemini" ? "gemini" :
                    provider.id === "ollama" ? "ollama" :
                        provider.id === "openai" ? "openai" : null;

            if (!providerType) {
                throw new Error("Provider not supported yet");
            }

            aiService.updateConfig({
                providers: {
                    [providerType]: {
                        apiKey: key,
                        ...(url && { baseUrl: url }),
                        model: ""
                    }
                } as any
            });

            const status = await aiService.checkProvider(providerType as any);

            if (!status.available) {
                throw new Error(status.error || "Connection failed");
            }

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

        if (value.length > 20 && selectedProvider) {
            validateAndFetchModels(selectedProvider, value, baseUrl || undefined);
        }
    };

    const handleSave = async () => {
        if (!selectedProvider || !selectedModel) {
            return;
        }

        const providerType = selectedProvider.id === "claude" ? "claude" :
            selectedProvider.id === "gemini" ? "gemini" :
                selectedProvider.id === "ollama" ? "ollama" :
                    selectedProvider.id === "openai" ? "openai" : null;

        if (providerType) {
            aiService.updateConfig({
                activeProvider: providerType as any,
                providers: {
                    [providerType]: {
                        apiKey,
                        ...(baseUrl && { baseUrl }),
                        model: selectedModel
                    }
                } as any
            });
        }

        setSelectedProvider(null);
        setApiKey("");
        setBaseUrl("");
        setAvailableModels([]);
    };

    const currentProviders = activeTab === "text" ? textProviders :
        activeTab === "image" ? IMAGE_AI_PROVIDERS :
            AUTOMATION_PROVIDERS;

    const configuredCount = currentProviders.filter(p => p.status === "connected").length;
    const totalCount = currentProviders.length;

    return (
        <div className="min-h-full bg-[#2B2B35] p-8 animate-fade-in">
            <div className="max-w-5xl mx-auto">
                {/* Header - PROPER SPACING */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-2xl font-semibold text-white">AI Providers</h1>
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/8 transition-colors text-sm font-medium">
                            <RefreshCw size={14} />
                            Refresh
                        </button>
                    </div>
                    <p className="text-sm text-[#B8B8C4]">{configuredCount} configured • Securely stored in macOS Keychain</p>
                </div>

                {/* Tabs - PROPER SIZING */}
                <div className="flex gap-2 mb-6 p-1 bg-[#333340] rounded-lg border border-white/8 inline-flex">
                    <button
                        onClick={() => setActiveTab("text")}
                        className="px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2"
                        style={{
                            background: activeTab === "text" ? "#00A8E8" : "transparent",
                            color: activeTab === "text" ? "#000" : "#B8B8C4",
                            minWidth: "100px"
                        }}
                    >
                        <Brain size={14} />
                        LLM {configuredCount}/{totalCount}
                    </button>
                    <button
                        onClick={() => setActiveTab("image")}
                        className="px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2"
                        style={{
                            background: activeTab === "image" ? "#00A8E8" : "transparent",
                            color: activeTab === "image" ? "#000" : "#B8B8C4",
                            minWidth: "100px"
                        }}
                    >
                        <Image size={14} />
                        Image
                    </button>
                    <button
                        onClick={() => setActiveTab("automation")}
                        className="px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2"
                        style={{
                            background: activeTab === "automation" ? "#00A8E8" : "transparent",
                            color: activeTab === "automation" ? "#000" : "#B8B8C4",
                            minWidth: "120px"
                        }}
                    >
                        <MonitorSmartphone size={14} />
                        Screen Control
                    </button>
                </div>

                {/* Section Title - PROPER TYPOGRAPHY */}
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-white mb-1">
                        {activeTab === "text" ? "LLMs Providers" : activeTab === "image" ? "Image AI Providers" : "Automation Tools"}
                    </h2>
                    <p className="text-sm text-[#808090]">
                        {activeTab === "text" ? "Main LLM providers for chat and reasoning" :
                            activeTab === "image" ? "AI image generation services" :
                                "Browser and system automation"}
                    </p>
                </div>

                {/* Provider Cards - MASSIVE SPACING */}
                <div className="space-y-6">
                    {currentProviders.map(provider => {
                        const Icon = provider.icon;
                        const isConnected = provider.status === "connected";

                        return (
                            <div
                                key={provider.id}
                                className="bg-[#333340] border border-white/8 rounded-xl p-8 hover:border-white/12 transition-all"
                            >
                                <div className="flex items-center justify-between gap-8">
                                    {/* Left side - GENEROUS SPACING */}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-white mb-2">{provider.name}</h3>
                                        <p className="text-sm text-[#B8B8C4]">
                                            {isConnected ?
                                                (provider.description.includes("models") ? provider.description : "API Key configured") :
                                                "API Key not configured"
                                            }
                                        </p>
                                    </div>

                                    {/* Right side - PROPER BUTTON SIZE */}
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        {isConnected && (
                                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-medium">
                                                <CheckCircle2 size={14} />
                                                Configured
                                            </span>
                                        )}
                                        <button
                                            onClick={() => {
                                                setSelectedProvider(provider);
                                                setApiKey("");
                                                setBaseUrl("");
                                                setValidationStatus("idle");
                                                setAvailableModels([]);
                                            }}
                                            className="px-6 py-3 rounded-lg bg-[#00A8E8] hover:bg-[#0095D0] text-black font-medium text-sm transition-colors flex items-center gap-2"
                                            style={{ height: "40px" }}
                                        >
                                            <Link2 size={16} />
                                            Configure
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal - PROPER DIMENSIONS */}
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
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md p-6 rounded-2xl bg-[#333340] border border-white/10"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-white">{selectedProvider.name}</h3>
                                <button
                                    onClick={() => setSelectedProvider(null)}
                                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-sm text-[#B8B8C4] mb-6">{selectedProvider.description}</p>

                            {selectedProvider.requiresApiKey && (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-xs font-medium text-[#808090] mb-2 uppercase tracking-wide">
                                            API Key
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                value={apiKey}
                                                onChange={(e) => handleApiKeyChange(e.target.value)}
                                                placeholder="Enter your API key..."
                                                className="w-full px-4 py-3 pr-10 rounded-lg bg-[#2A2A35] border border-white/12 text-white text-sm outline-none focus:border-[#00A8E8] transition-colors"
                                                style={{ height: "44px" }}
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
                                            <label className="block text-xs font-medium text-[#808090] mb-2 uppercase tracking-wide">
                                                Base URL (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={baseUrl}
                                                onChange={(e) => setBaseUrl(e.target.value)}
                                                placeholder="http://localhost:11434"
                                                className="w-full px-4 py-3 rounded-lg bg-[#2A2A35] border border-white/12 text-white text-sm outline-none focus:border-[#00A8E8] transition-colors"
                                                style={{ height: "44px" }}
                                            />
                                        </div>
                                    )}

                                    {availableModels.length > 0 && (
                                        <div className="mb-4">
                                            <label className="block text-xs font-medium text-[#808090] mb-2 uppercase tracking-wide">
                                                Select Model
                                            </label>
                                            <select
                                                value={selectedModel}
                                                onChange={(e) => setSelectedModel(e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg bg-[#2A2A35] border border-white/12 text-white text-sm outline-none focus:border-[#00A8E8] transition-colors"
                                                style={{ height: "44px" }}
                                            >
                                                {availableModels.map(model => (
                                                    <option key={model} value={model} style={{ background: "#2A2A35" }}>
                                                        {model}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Buttons - PROPER HEIGHT */}
                            <div className="space-y-3 mt-6">
                                {selectedProvider.requiresApiKey && (
                                    <button
                                        onClick={() => selectedProvider && validateAndFetchModels(selectedProvider, apiKey, baseUrl || undefined)}
                                        disabled={!apiKey || isValidating}
                                        className="w-full px-6 py-3 rounded-lg text-sm font-medium transition-all disabled:opacity-30 bg-white/5 border border-white/12 text-white hover:bg-white/8"
                                        style={{ height: "44px" }}
                                    >
                                        {isValidating ? (
                                            <><Loader2 size={16} className="inline mr-2 animate-spin" /> Testing Connection...</>
                                        ) : (
                                            "Test Connection & Fetch Models"
                                        )}
                                    </button>
                                )}

                                {availableModels.length > 0 && (
                                    <button
                                        onClick={() => {
                                            handleSave();
                                            setSelectedProvider(null);
                                        }}
                                        className="w-full px-6 py-3 rounded-lg text-sm font-semibold transition-all bg-[#00A8E8] hover:bg-[#0095D0] text-black"
                                        style={{ height: "44px" }}
                                    >
                                        Save Configuration
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
