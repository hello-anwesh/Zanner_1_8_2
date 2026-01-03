import { Brain, Volume2, Mic, Check, Key, ExternalLink, Cpu, Cloud } from "lucide-react";

interface AISectionProps {
    aiProvider: string;
    ttsProvider: string;
    sttProvider: string;
    apiKeys: Record<string, string>;
    onProviderChange: (category: "ai" | "tts" | "stt", provider: string) => void;
    onApiKeyChange: (provider: string, key: string) => void;
    accent: string;
}

export function AISection({
    aiProvider, ttsProvider, sttProvider, apiKeys,
    onProviderChange, onApiKeyChange, accent
}: AISectionProps) {
    const aiProviders = [
        { id: "ollama", name: "Ollama", desc: "Local AI, runs on your machine", icon: Cpu, color: "#10B981", local: true, apiKey: false },
        { id: "openai", name: "OpenAI", desc: "GPT-4o, most capable", icon: Cloud, color: "#10B981", local: false, apiKey: true },
        { id: "claude", name: "Claude", desc: "Anthropic, creative & safe", icon: Cloud, color: "#F97316", local: false, apiKey: true },
        { id: "gemini", name: "Gemini", desc: "Google AI, fast & smart", icon: Cloud, color: "#3B82F6", local: false, apiKey: true },
    ];

    const voiceProviders = [
        { id: "system", name: "System TTS", desc: "Built-in voice synthesis", icon: Volume2, color: "#64748B", local: true, apiKey: false },
        { id: "elevenlabs", name: "ElevenLabs", desc: "Ultra-realistic voices", icon: Volume2, color: "#8B5CF6", local: false, apiKey: true },
        { id: "openai", name: "OpenAI TTS", desc: "Natural sounding speech", icon: Volume2, color: "#10B981", local: false, apiKey: true },
    ];

    const sttProviders = [
        { id: "system", name: "System STT", desc: "Built-in recognition", icon: Mic, color: "#64748B", local: true, apiKey: false },
        { id: "deepgram", name: "Deepgram", desc: "Fast & accurate", icon: Mic, color: "#06B6D4", local: false, apiKey: true },
        { id: "whisper", name: "Whisper", desc: "OpenAI transcription", icon: Mic, color: "#10B981", local: false, apiKey: true },
    ];

    const ProviderCard = ({
        provider,
        isActive,
        onClick
    }: {
        provider: typeof aiProviders[0];
        isActive: boolean;
        onClick: () => void
    }) => (
        <button
            onClick={onClick}
            className="group relative p-4 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02]"
            style={{
                background: isActive
                    ? `linear-gradient(145deg, ${provider.color}12 0%, transparent 60%)`
                    : "rgba(255,255,255,0.02)",
                border: isActive
                    ? `2px solid ${provider.color}40`
                    : "2px solid rgba(255,255,255,0.04)",
            }}
        >
            <div className="flex items-center gap-3 mb-2">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: isActive ? `${provider.color}20` : "rgba(255,255,255,0.04)" }}
                >
                    <provider.icon
                        size={18}
                        style={{ color: isActive ? provider.color : "rgba(255,255,255,0.4)" }}
                    />
                </div>
                {isActive && (
                    <div
                        className="w-5 h-5 rounded-full flex items-center justify-center ml-auto"
                        style={{ background: provider.color }}
                    >
                        <Check size={12} className="text-white" />
                    </div>
                )}
            </div>
            <p
                className="text-sm font-medium"
                style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.6)" }}
            >
                {provider.name}
            </p>
            <p className="text-[10px] text-white/30 mt-0.5">{provider.desc}</p>
            {provider.local && (
                <span className="inline-block mt-2 text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                    Local • Free
                </span>
            )}
        </button>
    );

    return (
        <div className="space-y-8">
            {/* AI Provider */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <Brain size={18} style={{ color: accent }} />
                    <div>
                        <h4 className="text-sm font-semibold text-white">AI Provider</h4>
                        <p className="text-[11px] text-white/30">Powers your focus companion</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {aiProviders.map(provider => (
                        <ProviderCard
                            key={provider.id}
                            provider={provider}
                            isActive={aiProvider === provider.id}
                            onClick={() => onProviderChange("ai", provider.id)}
                        />
                    ))}
                </div>

                {/* API Key Input for selected provider */}
                {aiProviders.find(p => p.id === aiProvider)?.apiKey && (
                    <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
                        <div className="flex items-center gap-2 mb-3">
                            <Key size={14} className="text-white/40" />
                            <span className="text-xs text-white/40">
                                {aiProviders.find(p => p.id === aiProvider)?.name} API Key
                            </span>
                        </div>
                        <input
                            type="password"
                            placeholder="sk-..."
                            value={apiKeys[aiProvider] || ""}
                            onChange={(e) => onApiKeyChange(aiProvider, e.target.value)}
                            className="w-full px-4 py-3 rounded-xl text-sm text-white bg-black/30 border border-white/10 outline-none focus:border-white/20 font-mono"
                        />
                    </div>
                )}
            </div>

            {/* Text-to-Speech */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <Volume2 size={18} style={{ color: accent }} />
                    <div>
                        <h4 className="text-sm font-semibold text-white">Text-to-Speech</h4>
                        <p className="text-[11px] text-white/30">Voice for AI companion</p>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {voiceProviders.map(provider => (
                        <ProviderCard
                            key={provider.id}
                            provider={provider}
                            isActive={ttsProvider === provider.id}
                            onClick={() => onProviderChange("tts", provider.id)}
                        />
                    ))}
                </div>

                {voiceProviders.find(p => p.id === ttsProvider)?.apiKey && (
                    <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
                        <div className="flex items-center gap-2 mb-3">
                            <Key size={14} className="text-white/40" />
                            <span className="text-xs text-white/40">
                                {voiceProviders.find(p => p.id === ttsProvider)?.name} API Key
                            </span>
                        </div>
                        <input
                            type="password"
                            placeholder="Enter API key..."
                            value={apiKeys[ttsProvider] || ""}
                            onChange={(e) => onApiKeyChange(ttsProvider, e.target.value)}
                            className="w-full px-4 py-3 rounded-xl text-sm text-white bg-black/30 border border-white/10 outline-none focus:border-white/20 font-mono"
                        />
                    </div>
                )}
            </div>

            {/* Speech-to-Text */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <Mic size={18} style={{ color: accent }} />
                    <div>
                        <h4 className="text-sm font-semibold text-white">Speech-to-Text</h4>
                        <p className="text-[11px] text-white/30">Voice commands input</p>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {sttProviders.map(provider => (
                        <ProviderCard
                            key={provider.id}
                            provider={provider}
                            isActive={sttProvider === provider.id}
                            onClick={() => onProviderChange("stt", provider.id)}
                        />
                    ))}
                </div>

                {sttProviders.find(p => p.id === sttProvider)?.apiKey && (
                    <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
                        <div className="flex items-center gap-2 mb-3">
                            <Key size={14} className="text-white/40" />
                            <span className="text-xs text-white/40">
                                {sttProviders.find(p => p.id === sttProvider)?.name} API Key
                            </span>
                        </div>
                        <input
                            type="password"
                            placeholder="Enter API key..."
                            value={apiKeys[sttProvider] || ""}
                            onChange={(e) => onApiKeyChange(sttProvider, e.target.value)}
                            className="w-full px-4 py-3 rounded-xl text-sm text-white bg-black/30 border border-white/10 outline-none focus:border-white/20 font-mono"
                        />
                    </div>
                )}
            </div>

            {/* Info */}
            <div
                className="p-4 rounded-xl flex items-start gap-3"
                style={{ background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.2)" }}
            >
                <ExternalLink size={16} className="text-blue-400 mt-0.5 shrink-0" />
                <div>
                    <p className="text-xs text-blue-300">API keys are stored locally on your device and never sent to our servers.</p>
                    <p className="text-[10px] text-blue-400/50 mt-1">For Ollama: Run `ollama serve` locally on port 11434</p>
                </div>
            </div>
        </div>
    );
}
