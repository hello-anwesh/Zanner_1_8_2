import { useState, useEffect, useRef, useCallback } from "react";
import {
    X, Play, Pause, Save, Volume2, VolumeX,
    Sparkles, RotateCcw, Loader
} from "lucide-react";
import {
    FREQUENCIES, FREQUENCY_CATEGORIES, PRESET_MIXES,
    FrequencyInfo, FrequencyMix, FrequencyCategory,
    loadCustomMixes, saveCustomMixes
} from "./frequencies";
import { getFrequencyEngine, FrequencyEngine } from "./FrequencyEngine";
import { GlassCard, PremiumInput, PremiumButton } from "../primitives";

interface FrequencyGeneratorProps {
    isOpen: boolean;
    onClose: () => void;
    accent: string;
}

interface ActiveFrequency {
    hz: number;
    volume: number;
}

export function FrequencyGenerator({ isOpen, accent }: Omit<FrequencyGeneratorProps, 'onClose'>) {
    const [engine, setEngine] = useState<FrequencyEngine | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [masterVolume, setMasterVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const [activeCategory, setActiveCategory] = useState<FrequencyCategory | "all">("all");
    const [activeFreqs, setActiveFreqs] = useState<ActiveFrequency[]>([]);
    const [customMixes, setCustomMixes] = useState<FrequencyMix[]>([]);
    const [mixName, setMixName] = useState("");
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [visualData, setVisualData] = useState<number[]>([]);
    const animationRef = useRef<number | undefined>(undefined);
    const [presetsCollapsed, setPresetsCollapsed] = useState(false);

    // Initialize engine
    useEffect(() => {
        if (isOpen) {
            const eng = getFrequencyEngine();
            setEngine(eng);
            setCustomMixes(loadCustomMixes());
        }
        return () => {
            engine?.stopAll();
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isOpen]);

    // Visualization loop
    useEffect(() => {
        if (!isPlaying || !engine) {
            setVisualData([]);
            return;
        }

        const animate = () => {
            const data = engine.getAnalyserData();
            if (data) {
                const bars = [];
                const step = Math.floor(data.length / 24);
                for (let i = 0; i < 24; i++) {
                    bars.push(data[i * step] / 255);
                }
                setVisualData(bars);
            }
            animationRef.current = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isPlaying, engine]);

    // Toggle frequency
    const toggleFrequency = useCallback((freq: FrequencyInfo) => {
        if (!engine) return;

        const exists = activeFreqs.find(f => f.hz === freq.hz);
        if (exists) {
            engine.stopFrequency(freq.hz);
            setActiveFreqs(prev => prev.filter(f => f.hz !== freq.hz));
        } else {
            engine.resume(); // Ensure audio context is active
            engine.startFrequency(freq.hz, 0.5);
            setActiveFreqs(prev => [...prev, { hz: freq.hz, volume: 0.5 }]);
        }

        if (!exists && activeFreqs.length === 0) {
            setIsPlaying(true);
        }
    }, [engine, activeFreqs]);

    // Set frequency volume
    const setFreqVolume = useCallback((hz: number, volume: number) => {
        engine?.setFrequencyVolume(hz, volume);
        setActiveFreqs(prev => prev.map(f => f.hz === hz ? { ...f, volume } : f));
    }, [engine]);

    // Toggle play/pause
    const togglePlay = useCallback(() => {
        if (isPlaying) {
            engine?.stopAll();
        } else {
            activeFreqs.forEach(f => engine?.startFrequency(f.hz, f.volume));
        }
        setIsPlaying(!isPlaying);
    }, [isPlaying, engine, activeFreqs]);

    // Load preset/custom mix
    const loadMix = useCallback((mix: FrequencyMix) => {
        engine?.stopAll();
        setActiveFreqs(mix.frequencies.map(f => ({ hz: f.hz, volume: f.volume })));
        mix.frequencies.forEach(f => engine?.startFrequency(f.hz, f.volume));
        setIsPlaying(true);
    }, [engine]);

    // Save custom mix
    const saveMix = useCallback(() => {
        if (!mixName.trim() || activeFreqs.length === 0) return;

        const mix: FrequencyMix = {
            id: `custom-${Date.now()}`,
            name: mixName.trim(),
            frequencies: activeFreqs,
            createdAt: Date.now(),
        };

        const updated = [...customMixes, mix];
        setCustomMixes(updated);
        saveCustomMixes(updated);
        setMixName("");
        setShowSaveModal(false);
    }, [mixName, activeFreqs, customMixes]);

    // Delete custom mix
    const deleteMix = useCallback((id: string) => {
        const updated = customMixes.filter(m => m.id !== id);
        setCustomMixes(updated);
        saveCustomMixes(updated);
    }, [customMixes]);

    // Clear all
    const clearAll = useCallback(() => {
        engine?.stopAll();
        setActiveFreqs([]);
        setIsPlaying(false);
    }, [engine]);

    // Toggle mute
    const toggleMute = useCallback(() => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        engine?.setMasterVolume(newMuted ? 0 : masterVolume);
    }, [isMuted, masterVolume, engine]);

    // Set master volume
    const handleMasterVolume = useCallback((vol: number) => {
        setMasterVolume(vol);
        if (!isMuted) engine?.setMasterVolume(vol);
    }, [isMuted, engine]);

    // Filter frequencies
    const filteredFreqs = activeCategory === "all"
        ? FREQUENCIES
        : FREQUENCIES.filter(f => f.category === activeCategory);

    if (!isOpen) return null;

    return (
        <div className="flex flex-col h-full animate-fade-in">
            {/* Header - Integrated */}
            <div className="p-8 sm:p-12 md:p-16 pb-0 flex items-center justify-between">
                <div>
                    <div>
                        <h2 className="text-4xl font-black mb-1 gradient-text tracking-tight uppercase">Frequency Harmony</h2>
                        <p className="text-xs font-bold tracking-[0.2em] text-white/40 uppercase">Binaural & Isochronic Generation Engine</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {activeFreqs.length > 0 && (
                            <>
                                <div className="flex items-center gap-3 bg-white/5 rounded-xl p-1 pr-4 border border-white/10">
                                    <button
                                        onClick={togglePlay}
                                        className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                                        style={{
                                            background: isPlaying
                                                ? `linear-gradient(135deg, ${accent} 0%, ${accent}90 100%)`
                                                : "rgba(255,255,255,0.1)",
                                            boxShadow: isPlaying ? `0 4px 12px ${accent}40` : "none",
                                        }}
                                    >
                                        {isPlaying ?
                                            <Pause size={18} color={isPlaying ? "#000" : "#fff"} fill={isPlaying ? "#000" : "none"} /> :
                                            <Play size={18} className="text-white" fill="white" />
                                        }
                                    </button>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold" style={{ color: accent }}>{isPlaying ? "PLAYING" : "PAUSED"}</span>
                                        <span className="text-[10px] opacity-50">{activeFreqs.length} Frequencies</span>
                                    </div>
                                </div>

                                <div className="h-8 w-px bg-white/10 mx-2" />

                                <button
                                    onClick={() => setShowSaveModal(true)}
                                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-105"
                                    title="Save Mix"
                                >
                                    <Save size={18} className="opacity-70" />
                                </button>
                                <button
                                    onClick={clearAll}
                                    className="p-3 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 transition-all hover:scale-105 group"
                                    title="Clear All"
                                >
                                    <RotateCcw size={18} className="opacity-70 group-hover:text-red-400" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col pt-6 relative px-8 sm:px-12 md:px-16 pb-8">


                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-8">
                    {/* Left: Frequency Grid */}
                    <div className="flex-1 flex flex-col relative min-h-0">
                        {/* Animated gradient overlay */}
                        <div
                            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
                            style={{ background: `radial-gradient(circle, ${accent}, transparent)` }}
                        />

                        {/* Vibrant Category Pills */}
                        <div className="p-4 flex gap-2 overflow-x-auto scrollbar-none border-b backdrop-blur-sm" style={{ borderColor: `${accent}15` }}>
                            <CategoryPill
                                label="All"
                                isActive={activeCategory === "all"}
                                color={accent}
                                onClick={() => setActiveCategory("all")}
                            />
                            {FREQUENCY_CATEGORIES.map(cat => (
                                <CategoryPill
                                    key={cat.id}
                                    label={`${cat.icon} ${cat.name}`}
                                    isActive={activeCategory === cat.id}
                                    color={cat.color}
                                    onClick={() => setActiveCategory(cat.id as FrequencyCategory)}
                                />
                            ))}
                        </div>

                        {/* Vibrant Frequency Grid/Dropdown - Responsive */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                            {/* Dropdown for small screens (<= 768px / 8-9 inches) */}
                            <div className="md:hidden">
                                <select
                                    className="w-full px-4 py-3 rounded-xl text-sm font-bold transition-all"
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${accent}30`,
                                        color: '#fff'
                                    }}
                                    onChange={(e) => {
                                        const hz = parseInt(e.target.value);
                                        if (hz) {
                                            const freq = filteredFreqs.find(f => f.hz === hz);
                                            if (freq) {
                                                toggleFrequency(freq);
                                                // Reset dropdown after selection
                                                e.target.value = "";
                                            }
                                        }
                                    }}
                                    value=""
                                >
                                    <option value="" disabled>Select a frequency to toggle...</option>
                                    {filteredFreqs.map(freq => {
                                        const isActive = activeFreqs.some(f => f.hz === freq.hz);
                                        return (
                                            <option
                                                key={freq.hz}
                                                value={freq.hz}
                                                style={{ background: '#1a1a1f' }}
                                            >
                                                {isActive ? '✓ ' : '+ '}{freq.hz}Hz - {freq.name}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {/* Grid for larger screens (> 768px) */}
                            <div className="hidden md:grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredFreqs.map(freq => {
                                    const isActive = activeFreqs.some(f => f.hz === freq.hz);
                                    return (
                                        <FrequencyCard
                                            key={freq.hz}
                                            freq={freq}
                                            isActive={isActive}
                                            onClick={() => toggleFrequency(freq)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Active Panel - Premium Control Deck */}
                    <div
                        className="w-full lg:w-80 flex flex-col rounded-3xl overflow-hidden"
                        style={{
                            border: `1px solid ${accent}20`,
                            background: "linear-gradient(180deg, rgba(20,20,30,0.6) 0%, rgba(10,10,15,0.8) 100%)",
                            boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
                        }}
                    >
                        {/* Visualizer */}
                        <div className="h-24 p-5 flex items-end justify-center gap-1 relative overflow-hidden">
                            {/* Background Grid */}
                            <div className="absolute inset-0 opacity-20"
                                style={{
                                    backgroundImage: `linear-gradient(${accent}10 1px, transparent 1px), linear-gradient(90deg, ${accent}10 1px, transparent 1px)`,
                                    backgroundSize: '20px 20px'
                                }}
                            />

                            {isPlaying && visualData.length > 0 ? (
                                visualData.map((v, i) => (
                                    <div
                                        key={i}
                                        className="w-1.5 rounded-t-sm transition-all duration-75 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                                        style={{
                                            height: `${Math.max(v * 100, 8)}%`,
                                            background: `linear-gradient(to top, ${accent}, ${accent}40)`,
                                            boxShadow: `0 0 12px ${accent}40`
                                        }}
                                    />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center relative z-10">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ background: `${accent}10` }}>
                                        <Loader size={18} className="text-white/40 animate-spin" />
                                    </div>
                                    <p className="text-[10px] font-bold tracking-widest text-white/30 uppercase">System Standby</p>
                                </div>
                            )}
                        </div>

                        {/* Master Volume */}
                        <div className="px-5 py-4 border-b border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <button
                                    onClick={toggleMute}
                                    className="w-7 h-7 rounded-lg fle items-center justify-center bg-white/5 hover:bg-white/10"
                                >
                                    {isMuted ? <VolumeX size={12} className="text-white/40" /> : <Volume2 size={12} className="text-white/60" />}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={masterVolume}
                                    onChange={(e) => handleMasterVolume(parseFloat(e.target.value))}
                                    className="flex-1 h-1 rounded-full bg-white/10"
                                    style={{
                                        accentColor: accent,
                                    }}
                                />
                                <span className="text-[10px] text-white/40 w-8 text-right">{Math.round(masterVolume * 100)}%</span>
                            </div>
                        </div>

                        {/* Active Frequencies */}
                        <div className="overflow-y-auto p-3 max-h-64">
                            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">Active ({activeFreqs.length})</h3>
                            {activeFreqs.length > 0 ? (
                                <div className="space-y-2">
                                    {activeFreqs.map(af => {
                                        const freq = FREQUENCIES.find(f => f.hz === af.hz);
                                        if (!freq) return null;
                                        return (
                                            <ActiveFrequencyItem
                                                key={af.hz}
                                                freq={freq}
                                                volume={af.volume}
                                                onVolumeChange={(v) => setFreqVolume(af.hz, v)}
                                                onRemove={() => toggleFrequency(freq)}
                                            />
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 opacity-40">
                                    <Sparkles size={20} className="text-white/20 mb-2" />
                                    <p className="text-xs text-white/40 text-center">Select frequencies to begin</p>
                                </div>
                            )}
                        </div>

                        {/* Presets - Collapsible Glassmorphic Premium Cards */}
                        <div className="border-t backdrop-blur-xl" style={{ borderColor: `${accent}20` }}>
                            {/* Collapsible Header */}
                            <button
                                onClick={() => setPresetsCollapsed(!presetsCollapsed)}
                                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all group"
                            >
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <div
                                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
                                        style={{ background: `${accent}20` }}
                                    >
                                        <Sparkles size={14} style={{ color: accent }} strokeWidth={2.5} />
                                    </div>
                                    Mix Presets
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${accent}15`, color: accent }}>
                                        {PRESET_MIXES.length} built-in{customMixes.length > 0 ? ` + ${customMixes.length} custom` : ''}
                                    </span>
                                </h3>
                                <div
                                    className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                                    style={{
                                        background: `${accent}10`,
                                        transform: presetsCollapsed ? "rotate(0deg)" : "rotate(180deg)",
                                    }}
                                >
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M2 4L6 8L10 4" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </button>

                            {/* Collapsible Content */}
                            <div
                                className="overflow-hidden transition-all duration-300 ease-in-out"
                                style={{
                                    maxHeight: presetsCollapsed ? "0px" : "320px",
                                    opacity: presetsCollapsed ? 0 : 1,
                                }}
                            >
                                <div className="px-5 pb-5">
                                    <div className="flex flex-wrap gap-2.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                                        {[...PRESET_MIXES, ...customMixes].map(mix => (
                                            <button
                                                key={mix.id}
                                                onClick={() => loadMix(mix)}
                                                className="group relative px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 border flex items-center gap-3 shrink-0"
                                                style={{
                                                    background: `linear-gradient(135deg, ${accent}15 0%, ${accent}05 100%)`,
                                                    borderColor: `${accent}20`,
                                                    boxShadow: `0 4px 12px rgba(0,0,0,0.2)`
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = `${accent}50`;
                                                    e.currentTarget.style.background = `linear-gradient(135deg, ${accent}25 0%, ${accent}10 100%)`;
                                                    e.currentTarget.style.boxShadow = `0 4px 16px ${accent}20`;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = `${accent}20`;
                                                    e.currentTarget.style.background = `linear-gradient(135deg, ${accent}15 0%, ${accent}05 100%)`;
                                                    e.currentTarget.style.boxShadow = `0 4px 12px rgba(0,0,0,0.2)`;
                                                }}
                                            >
                                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 whitespace-nowrap">
                                                    {mix.name}
                                                </span>
                                                <span
                                                    className="w-5 h-5 flex items-center justify-center rounded-full text-[9px] font-black shrink-0"
                                                    style={{ background: `${accent}20`, color: accent }}
                                                >
                                                    {mix.frequencies.length}
                                                </span>

                                                {/* Delete Button for Custom Mixes */}
                                                {mix.id.startsWith('custom-') && (
                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteMix(mix.id);
                                                        }}
                                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:scale-110 transition-all z-20 backdrop-blur-md"
                                                    >
                                                        <X size={10} className="text-white" />
                                                    </div>
                                                )}

                                                {/* Hover Tooltip - Composition */}
                                                <div
                                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 min-w-[160px] p-3 rounded-xl border border-white/10 backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 translate-y-2 group-hover:translate-y-0"
                                                    style={{
                                                        background: "rgba(10,10,14,0.95)",
                                                        boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
                                                    }}
                                                >
                                                    <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-2 border-b border-white/5 pb-1 flex justify-between">
                                                        <span>Composition</span>
                                                        <span style={{ color: accent }}>{mix.frequencies.length} tones</span>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        {mix.frequencies.map((f, i) => (
                                                            <div key={i} className="flex justify-between items-center gap-3 text-[10px]">
                                                                <span className="font-bold tabular-nums min-w-[36px]" style={{ color: accent }}>
                                                                    {f.hz} <span className="text-[8px] opacity-60">Hz</span>
                                                                </span>
                                                                <div className="flex-1 h-0.5 bg-white/10 rounded-full mx-1 overflow-hidden">
                                                                    <div
                                                                        className="h-full rounded-full"
                                                                        style={{ width: `${f.volume * 100}%`, background: accent }}
                                                                    />
                                                                </div>
                                                                <span className="text-white/40 tabular-nums w-6 text-right">{Math.round(f.volume * 100)}%</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {/* Triangle Arrow */}
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent" style={{ borderTopColor: "rgba(10,10,14,0.95)" }} />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Save Modal */}
            {showSaveModal && (
                <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
                    <div
                        className="absolute inset-0 backdrop-blur-sm"
                        style={{ background: 'rgba(0,0,0,0.7)' }}
                        onClick={() => setShowSaveModal(false)}
                    />
                    <GlassCard
                        className="relative w-full max-w-md z-10"
                        accent={accent}
                        padding="xl"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{
                                    background: `linear-gradient(135deg, ${accent}30 0%, ${accent}15 100%)`,
                                    boxShadow: `0 4px 16px ${accent}30`
                                }}
                            >
                                <Save size={20} style={{ color: accent }} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Save Custom Mix</h3>
                                <p className="text-xs text-white/50">Create a reusable frequency blend</p>
                            </div>
                        </div>

                        <PremiumInput
                            type="text"
                            value={mixName}
                            onChange={(e) => setMixName(e.target.value)}
                            placeholder="Enter mix name..."
                            accent={accent}
                            label="Mix Name"
                            helperText={`${activeFreqs.length} frequencies will be saved`}
                            autoFocus
                        />

                        <div className="flex gap-3 mt-6">
                            <PremiumButton
                                variant="secondary"
                                size="lg"
                                fullWidth
                                onClick={() => setShowSaveModal(false)}
                            >
                                Cancel
                            </PremiumButton>
                            <PremiumButton
                                variant="primary"
                                size="lg"
                                fullWidth
                                accent={accent}
                                onClick={saveMix}
                                disabled={!mixName.trim()}
                            >
                                Save Mix
                            </PremiumButton>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div >
    );
}

// Vibrant Category Pill with Glow
function CategoryPill({ label, isActive, color, onClick }: { label: string; isActive: boolean; color: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all hover:scale-105"
            style={{
                background: isActive
                    ? `linear-gradient(135deg, ${color}30 0%, ${color}15 100%)`
                    : "rgba(255,255,255,0.05)",
                color: isActive ? color : "rgba(255,255,255,0.5)",
                border: `2px solid ${isActive ? `${color}60` : "transparent"}`,
                boxShadow: isActive ? `0 4px 20px ${color}30, inset 0 1px 0 rgba(255,255,255,0.1)` : "none",
            }}
        >
            {label}
        </button>
    );
}

// Vibrant Frequency Card with Glassmorphism
function FrequencyCard({ freq, isActive, onClick }: { freq: FrequencyInfo; isActive: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="relative p-5 rounded-3xl text-left transition-all duration-300 hover:scale-[1.03] group overflow-hidden backdrop-blur-md"
            style={{
                background: isActive
                    ? `linear-gradient(135deg, ${freq.color}25 0%, ${freq.color}10 100%)`
                    : "rgba(255,255,255,0.03)",
                border: `1px solid ${isActive ? `${freq.color}` : "rgba(255,255,255,0.05)"}`,
                boxShadow: isActive
                    ? `0 0 30px ${freq.color}20, inset 0 0 20px ${freq.color}10`
                    : "0 4px 10px rgba(0,0,0,0.2)",
            }}
            onMouseEnter={(e) => {
                if (!isActive) {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.04) 100%)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                }
            }}
            onMouseLeave={(e) => {
                if (!isActive) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                }
            }}
        >
            <div className="flex items-start justify-between mb-3 relative z-10">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
                    style={{
                        background: isActive ? freq.color : "rgba(255,255,255,0.05)",
                        color: isActive ? "#000" : freq.color,
                        boxShadow: isActive ? `0 4px 16px ${freq.color}50` : "inset 0 1px 0 rgba(255,255,255,0.1)"
                    }}
                >
                    <span className="text-lg">{freq.icon}</span>
                </div>
                {isActive && (
                    <div className="absolute top-0 right-0">
                        <span className="flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: freq.color }}></span>
                            <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: freq.color }}></span>
                        </span>
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <div className="flex items-baseline gap-1.5 mb-1">
                    <h3 className="text-lg font-bold text-white tracking-tight">{freq.hz} <span className="text-xs font-semibold text-white/40">Hz</span></h3>
                </div>
                <p className="text-[11px] font-medium leading-relaxed opacity-60" style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.5)" }}>
                    {freq.name}
                </p>
                <div className="mt-2 text-[10px] font-bold tracking-wider uppercase opacity-40" style={{ color: freq.color }}>
                    {freq.category}
                </div>
            </div>

            {/* Background Glow */}
            {isActive && (
                <div
                    className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-40 pointer-events-none transition-all duration-500"
                    style={{ background: freq.color }}
                />
            )}
        </button>
    );
}

// Active Frequency Item with Volume Control
function ActiveFrequencyItem({ freq, volume, onVolumeChange, onRemove }: {
    freq: FrequencyInfo;
    volume: number;
    onVolumeChange: (v: number) => void;
    onRemove: () => void;
}) {
    return (
        <div
            className="p-2 rounded-lg group"
            style={{ background: `${freq.color}08`, border: `1px solid ${freq.color}20` }}
        >
            <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm">{freq.icon}</span>
                    <span className="text-[11px] font-bold" style={{ color: freq.color }}>
                        {freq.hz < 10 ? freq.hz.toFixed(1) : freq.hz} Hz
                    </span>
                </div>
                <button
                    onClick={onRemove}
                    className="w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                >
                    <X size={10} className="text-white/40" />
                </button>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    className="flex-1 h-0.5 rounded-full bg-white/10"
                    style={{ accentColor: freq.color }}
                />
                <span className="text-[9px] text-white/40 w-8 text-right">{Math.round(volume * 100)}%</span>
            </div>
        </div>
    );
}
