import { useState } from "react";
import {
    Brain, User, Clock, Database, Plus,
    Save, Zap, Activity, Shield, Cpu, Trash2, X
} from "lucide-react";
import { trainingService } from "../../services/training/TrainingService";
import { TrainingProfile } from "../../services/training/types";


export function AITrainingView({ accent, onClose }: { accent: string; onClose: () => void }) {
    const [profile, setProfile] = useState<TrainingProfile>(trainingService.getProfile());
    const [newKnowledge, setNewKnowledge] = useState("");
    const [activeTab, setActiveTab] = useState<"identity" | "cognition" | "rhythms">("identity");

    const handleSaveIdentity = () => {
        trainingService.updateIdentity(profile.identity);
    };

    const handleAddKnowledge = () => {
        if (!newKnowledge.trim()) return;
        trainingService.addKnowledge(newKnowledge, "fact");
        setProfile(trainingService.getProfile());
        setNewKnowledge("");
    };

    const handleRemoveKnowledge = (id: string) => {
        trainingService.removeKnowledge(id);
        setProfile(trainingService.getProfile());
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[#050507] flex flex-col h-full animate-fade-in overflow-hidden">
            <div className="flex-1 flex flex-col relative">

                {/* Ambient Glow Effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-[140px]" style={{ background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)` }} />
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-[120px]" style={{ background: `radial-gradient(circle, ${accent}12 0%, transparent 70%)` }} />
                </div>

                {/* Premium Header */}
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between px-8 sm:px-10 md:px-12 py-6 sm:py-7 md:py-8 border-b gap-4 sm:gap-0" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center gap-4 sm:gap-5 md:gap-6">
                        <div
                            className="p-5 rounded-3xl relative overflow-hidden group"
                            style={{
                                background: `linear-gradient(135deg, ${accent} 0%, ${accent}DD 100%)`,
                                boxShadow: `0 12px 48px ${accent}50, inset 0 2px 0 rgba(255,255,255,0.35)`
                            }}
                        >
                            <div className="absolute inset-0 bg-white/20 blur-xl group-hover:blur-2xl transition-all" />
                            <Brain size={28} color="#000" strokeWidth={2.5} className="relative z-10 sm:w-8 sm:h-8" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-1">
                                Neural Training Center
                            </h1>
                            <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
                                Synchronizing Core Metadata
                            </p>
                        </div>
                    </div>


                </div>
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors z-50"
                >
                    <X size={24} className="text-white/70 hover:text-white" />
                </button>

                {/* Main Content */}
                <div className="relative flex flex-1 overflow-hidden flex-col lg:flex-row">
                    {/* Premium Sidebar Navigation */}
                    <div className="w-full lg:w-72 xl:w-80 border-b lg:border-b-0 lg:border-r p-4 sm:p-6 md:p-8 space-y-3 relative flex lg:flex-col overflow-x-auto lg:overflow-visible gap-3 lg:gap-0 lg:space-y-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        {[
                            { id: "identity", label: "Core Identity", icon: User, desc: "Who you are" },
                            { id: "cognition", label: "Cognition & RAG", icon: Database, desc: "Knowledge Base" },
                            { id: "rhythms", label: "Bio-Rhythms", icon: Activity, desc: "Energy Cycles" },
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                className={`relative w-full flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-500 overflow-hidden ${activeTab === item.id ? "scale-[1.02]" : "hover:scale-[1.01]"
                                    }`}
                                style={
                                    activeTab === item.id
                                        ? {
                                            background: `linear-gradient(135deg, ${accent}25 0%, ${accent}15 100%)`,
                                            border: `1px solid ${accent}40`,
                                            boxShadow: `0 6px 24px ${accent}30, inset 0 1px 0 ${accent}25`
                                        }
                                        : {
                                            background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                                            border: "1px solid rgba(255,255,255,0.05)"
                                        }
                                }
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
                                <item.icon
                                    size={22}
                                    style={{ color: activeTab === item.id ? accent : "rgba(255,255,255,0.5)" }}
                                    strokeWidth={2.5}
                                    className="relative z-10"
                                />
                                <div className="relative z-10">
                                    <div className={`font-bold text-sm ${activeTab === item.id ? "text-white" : "text-white/60"}`}>
                                        {item.label}
                                    </div>
                                    <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                                        {item.desc}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Content Area with Custom Scrollbar */}
                    <div className="flex-1 p-6 sm:p-8 md:p-10 lg:p-12 overflow-y-auto custom-scrollbar">
                        {/* IDENTITY TAB */}
                        {activeTab === "identity" && (
                            <div className="space-y-8 md:space-y-10 animate-slide-in-right">
                                <SectionHeader title="Core Identity" subtitle="Define the persona that the AI should recognize as YOU." icon={Shield} accent={accent} />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                                    <PremiumInput
                                        label="Name / Callsign"
                                        value={profile.identity.name}
                                        onChange={v => setProfile(p => ({ ...p, identity: { ...p.identity, name: v } }))}
                                        accent={accent}
                                    />
                                    <PremiumInput
                                        label="Primary Role"
                                        value={profile.identity.role}
                                        onChange={v => setProfile(p => ({ ...p, identity: { ...p.identity, role: v } }))}
                                        accent={accent}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-bold uppercase tracking-[0.15em] pl-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                                        Long Term Vision
                                    </label>
                                    <textarea
                                        value={profile.identity.longTermVision}
                                        onChange={e => setProfile(p => ({ ...p, identity: { ...p.identity, longTermVision: e.target.value } }))}
                                        className="w-full h-36 rounded-2xl p-5 text-white/90 font-medium outline-none resize-none transition-all duration-300"
                                        placeholder="Where do you see yourself in 5 years? The AI will use this to align its advice."
                                        style={{
                                            background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            backdropFilter: "blur(20px)",
                                            boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)"
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = accent;
                                            e.target.style.boxShadow = `0 0 0 3px ${accent}30, 0 4px 24px rgba(0,0,0,0.2)`;
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = "rgba(255,255,255,0.1)";
                                            e.target.style.boxShadow = "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)";
                                        }}
                                    />
                                </div>

                                <PremiumInput
                                    label="Core Values (Comma separated)"
                                    value={profile.identity.coreValues.join(", ")}
                                    onChange={v => setProfile(p => ({ ...p, identity: { ...p.identity, coreValues: v.split(",").map(s => s.trim()) } }))}
                                    accent={accent}
                                />

                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleSaveIdentity}
                                        className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all duration-500 hover:scale-105 active:scale-95 relative overflow-hidden group"
                                        style={{
                                            background: `linear-gradient(135deg, ${accent} 0%, ${accent}E6 100%)`,
                                            color: "#000",
                                            boxShadow: `0 8px 32px ${accent}50, inset 0 1px 0 rgba(255,255,255,0.4)`
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <Save size={20} strokeWidth={2.5} className="relative z-10" />
                                        <span className="relative z-10">Save Identity Profile</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* COGNITION TAB */}
                        {activeTab === "cognition" && (
                            <div className="space-y-8 animate-slide-in-right">
                                <SectionHeader title="Cognitive Database (RAG)" subtitle="Teach the AI about your preferences, rules, and specific knowledge." icon={Cpu} accent={accent} />

                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        value={newKnowledge}
                                        onChange={e => setNewKnowledge(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && handleAddKnowledge()}
                                        placeholder="Add a fact, rule, or preference..."
                                        className="flex-1 rounded-2xl px-5 py-4 font-medium outline-none transition-all duration-300"
                                        style={{
                                            background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            color: "#fff",
                                            backdropFilter: "blur(20px)",
                                            boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)"
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = accent;
                                            e.target.style.boxShadow = `0 0 0 3px ${accent}30, 0 4px 24px rgba(0,0,0,0.2)`;
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = "rgba(255,255,255,0.1)";
                                            e.target.style.boxShadow = "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)";
                                        }}
                                    />
                                    <button
                                        onClick={handleAddKnowledge}
                                        className="px-7 py-4 rounded-2xl font-bold transition-all duration-500 hover:scale-105 active:scale-95"
                                        style={{
                                            background: `linear-gradient(135deg, ${accent}25 0%, ${accent}15 100%)`,
                                            color: accent,
                                            border: `1px solid ${accent}40`,
                                            boxShadow: `0 4px 20px ${accent}25`
                                        }}
                                    >
                                        <Plus size={22} strokeWidth={2.5} />
                                    </button>
                                </div>

                                {/* Persona Preset Button */}
                                <div className="flex justify-start">
                                    <button
                                        onClick={() => {
                                            const directives = [
                                                "Role: I am a motivational accountability partner, friend, philosopher, and guide.",
                                                "Directive: Push the user to their limits but support them when they stumble.",
                                                "Philosophy: Use Stoic principles to reframe setbacks. Control what you can, accept what you cannot.",
                                                "Tone: Firm but empathetic. No excuses, but infinite patience.",
                                                "Goal: Total self-mastery and execution. We are building a legacy."
                                            ];
                                            directives.forEach(d => trainingService.addKnowledge(d, "rule"));
                                            setProfile(trainingService.getProfile());
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:scale-105"
                                        style={{
                                            background: `${accent}15`,
                                            color: accent,
                                            border: `1px solid ${accent}30`
                                        }}
                                    >
                                        <Zap size={14} />
                                        Initialize: Partner & Guide Persona
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {profile.knowledgeBase.map(item => (
                                        <div
                                            key={item.id}
                                            className="group flex items-center justify-between p-5 rounded-2xl transition-all duration-300 hover:scale-[1.01] relative overflow-hidden"
                                            style={{
                                                background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                                                border: "1px solid rgba(255,255,255,0.08)",
                                                backdropFilter: "blur(20px)"
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <div className="flex items-center gap-4 relative z-10">
                                                <div
                                                    className="w-2.5 h-2.5 rounded-full"
                                                    style={{
                                                        background: accent,
                                                        boxShadow: `0 0 12px ${accent}80`
                                                    }}
                                                />
                                                <span className="text-white/90 font-medium">{item.content}</span>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveKnowledge(item.id)}
                                                className="relative z-10 opacity-0 group-hover:opacity-100 p-2.5 rounded-xl hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-all"
                                            >
                                                <Trash2 size={18} strokeWidth={2} />
                                            </button>
                                        </div>
                                    ))}
                                    {profile.knowledgeBase.length === 0 && (
                                        <div
                                            className="text-center py-16 rounded-2xl"
                                            style={{
                                                border: "2px dashed rgba(255,255,255,0.1)",
                                                background: "rgba(255,255,255,0.02)"
                                            }}
                                        >
                                            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: `${accent}15` }}>
                                                <Database size={32} style={{ color: accent }} opacity={0.5} />
                                            </div>
                                            <p className="text-white/30 font-medium">Training database empty. Initialize with core directives.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* RHYTHMS TAB */}
                        {activeTab === "rhythms" && (
                            <div className="space-y-8 animate-slide-in-right">
                                <SectionHeader title="Bio-Rhythms & Energy" subtitle="Optimize your schedule based on your natural energy peaks." icon={Activity} accent={accent} />

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                                    {/* Chronotype Card */}
                                    <div
                                        className="p-6 rounded-3xl space-y-5 relative overflow-hidden"
                                        style={{
                                            background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                            backdropFilter: "blur(20px)",
                                            boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)"
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                                        <div className="flex items-center justify-between relative z-10">
                                            <h3 className="font-bold text-xl tracking-tight">Chronotype</h3>
                                            <Zap className="text-yellow-400" size={24} strokeWidth={2.5} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 relative z-10">
                                            {["lion", "bear", "wolf", "dolphin"].map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => {
                                                        trainingService.updateRhythms({ chronotype: type as any });
                                                        setProfile(trainingService.getProfile());
                                                    }}
                                                    className={`p-4 rounded-2xl border capitalize transition-all duration-500 font-bold text-sm ${profile.rhythms.chronotype === type
                                                        ? "scale-105"
                                                        : "hover:scale-105"
                                                        }`}
                                                    style={
                                                        profile.rhythms.chronotype === type
                                                            ? {
                                                                background: `linear-gradient(135deg, ${accent}25 0%, ${accent}15 100%)`,
                                                                borderColor: `${accent}50`,
                                                                color: accent,
                                                                boxShadow: `0 4px 20px ${accent}30`
                                                            }
                                                            : {
                                                                background: "rgba(0,0,0,0.3)",
                                                                borderColor: "rgba(255,255,255,0.08)",
                                                                color: "rgba(255,255,255,0.5)"
                                                            }
                                                    }
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs leading-relaxed relative z-10" style={{ color: "rgba(255,255,255,0.4)" }}>
                                            {profile.rhythms.chronotype === "wolf" ? "Late risers, peak energy in evening." :
                                                profile.rhythms.chronotype === "lion" ? "Early risers, peak energy in morning." :
                                                    profile.rhythms.chronotype === "bear" ? "Follows solar cycle, steady energy." : "Light sleepers, irregular energy spikes."}
                                        </p>
                                    </div>

                                    {/* Session Flow Card */}
                                    <div
                                        className="p-6 rounded-3xl space-y-5 relative overflow-hidden"
                                        style={{
                                            background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                            backdropFilter: "blur(20px)",
                                            boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)"
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                                        <div className="flex items-center justify-between relative z-10">
                                            <h3 className="font-bold text-xl tracking-tight">Session Flow</h3>
                                            <Clock className="text-purple-400" size={24} strokeWidth={2.5} />
                                        </div>
                                        <PremiumInput
                                            label="Preferred Duration (mins)"
                                            type="number"
                                            value={profile.rhythms.preferredSessionDuration.toString()}
                                            onChange={v => {
                                                trainingService.updateRhythms({ preferredSessionDuration: parseInt(v) || 25 });
                                                setProfile(trainingService.getProfile());
                                            }}
                                            accent={accent}
                                        />
                                        <div className="space-y-3 relative z-10">
                                            <label className="text-xs font-bold uppercase tracking-[0.15em] pl-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                                                Break Style
                                            </label>
                                            <div
                                                className="flex p-1.5 rounded-2xl"
                                                style={{
                                                    background: "rgba(0,0,0,0.4)",
                                                    border: "1px solid rgba(255,255,255,0.08)"
                                                }}
                                            >
                                                {["active", "restful", "meditative"].map(style => (
                                                    <button
                                                        key={style}
                                                        onClick={() => {
                                                            trainingService.updateRhythms({ breakStyle: style as any });
                                                            setProfile(trainingService.getProfile());
                                                        }}
                                                        className={`flex-1 py-3 text-sm font-bold rounded-xl capitalize transition-all duration-500 ${profile.rhythms.breakStyle === style ? "shadow-lg" : ""
                                                            }`}
                                                        style={
                                                            profile.rhythms.breakStyle === style
                                                                ? {
                                                                    background: `linear-gradient(135deg, ${accent} 0%, ${accent}E6 100%)`,
                                                                    color: "#000",
                                                                    boxShadow: `0 4px 16px ${accent}50, inset 0 1px 0 rgba(255,255,255,0.4)`
                                                                }
                                                                : {
                                                                    color: "rgba(255,255,255,0.5)"
                                                                }
                                                        }
                                                    >
                                                        {style}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>

    );
}

function SectionHeader({ title, subtitle, icon: Icon, accent }: { title: string; subtitle: string; icon: any; accent: string }) {
    return (
        <div className="flex items-start gap-5 mb-6">
            <div
                className="p-4 rounded-2xl mt-1"
                style={{
                    background: `${accent}15`,
                    boxShadow: `0 4px 20px ${accent}20`
                }}
            >
                <Icon size={28} style={{ color: accent }} strokeWidth={2.5} />
            </div>
            <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">{title}</h2>
                <p className="text-white/50 leading-relaxed">{subtitle}</p>
            </div>
        </div>
    );
}

function PremiumInput({ label, value, onChange, type = "text", accent }: { label: string; value: string; onChange: (v: string) => void; type?: string; accent: string }) {
    return (
        <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-[0.15em] pl-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full rounded-2xl px-5 py-4 font-medium outline-none transition-all duration-300"
                style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)"
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = accent;
                    e.target.style.boxShadow = `0 0 0 3px ${accent}30, 0 4px 24px rgba(0,0,0,0.2)`;
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.1)";
                    e.target.style.boxShadow = "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)";
                }}
            />
        </div>
    );
}
