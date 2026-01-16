import { useState, useEffect } from "react";
import {
    User, Database, Plus, Save as _Save, Trash2, Sparkles,
    Target, Heart, Brain, Zap as _Zap, Star as _Star, ChevronRight,
    Edit3, MessageSquare, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trainingService } from "../../services/training/TrainingService";
import { TrainingProfile } from "../../services/training/types";

// =============================================================================
// TYPES
// =============================================================================

interface _PersonaDirective {
    id: string;
    content: string;
    category: 'core' | 'tone' | 'behavior' | 'context';
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AITrainingView({ accent, onClose }: { accent: string; onClose: () => void }) {
    const [profile, setProfile] = useState<TrainingProfile>(trainingService.getProfile());
    const [activeSection, setActiveSection] = useState<"persona" | "identity" | "knowledge" | "patterns">("persona");
    const [showSuccess, setShowSuccess] = useState(false);

    // Persona editor state
    const [_editingDirective, setEditingDirective] = useState<string | null>(null);
    const [newDirective, setNewDirective] = useState("");
    const [directiveCategory, setDirectiveCategory] = useState<'core' | 'tone' | 'behavior' | 'context'>('core');

    // Refresh profile when it changes externally
    useEffect(() => {
        setProfile(trainingService.getProfile());
    }, []);

    const sections = [
        { id: "persona", label: "Zeni's Persona", icon: Heart, desc: "Define AI personality", color: "#EC4899" },
        { id: "identity", label: "Your Identity", icon: User, desc: "Tell Zeni about you", color: "#8B5CF6" },
        { id: "knowledge", label: "Knowledge Base", icon: Database, desc: "Facts & preferences", color: "#06B6D4" },
        { id: "patterns", label: "Work Patterns", icon: Target, desc: "Your rhythms", color: "#F59E0B" }
    ];

    // Get persona directives from knowledge base
    const personaDirectives = profile.knowledgeBase.filter(
        k => k.category === 'rule'
    );

    const saveSuccess = () => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    const addDirective = () => {
        if (newDirective.trim()) {
            trainingService.addKnowledge(newDirective.trim(), "rule");
            setProfile(trainingService.getProfile());
            setNewDirective("");
            saveSuccess();
        }
    };

    const removeDirective = (id: string) => {
        trainingService.removeKnowledge(id);
        setProfile(trainingService.getProfile());
    };

    const applyPreset = (preset: string[]) => {
        preset.forEach(d => trainingService.addKnowledge(d, "rule"));
        setProfile(trainingService.getProfile());
        saveSuccess();
    };

    // Preset personas
    const PRESETS = {
        professional: {
            name: "Professional Butler",
            emoji: "🎩",
            color: "#3B82F6",
            directives: [
                "I address you formally and with utmost respect.",
                "My responses are concise, professional, and dignified.",
                "I anticipate your needs before you express them.",
                "I maintain composure and poise at all times."
            ]
        },
        coach: {
            name: "Enthusiastic Coach",
            emoji: "🏆",
            color: "#22C55E",
            directives: [
                "I'm your biggest cheerleader, celebrating every win!",
                "My energy is contagious and motivating.",
                "I push you to reach peak performance with enthusiasm.",
                "I focus on progress, growth, and momentum."
            ]
        },
        mentor: {
            name: "Calm Mentor",
            emoji: "🧘",
            color: "#8B5CF6",
            directives: [
                "I speak with wisdom and patience, never rushing.",
                "My guidance is thoughtful and contemplative.",
                "I ask questions that help you discover answers.",
                "I focus on long-term growth over short-term wins."
            ]
        },
        friend: {
            name: "Playful Friend",
            emoji: "🎉",
            color: "#EC4899",
            directives: [
                "I'm casual, fun, and approachable - like your best friend.",
                "I use emojis, humor, and playful language.",
                "I celebrate with you and commiserate when things are tough.",
                "I make productivity feel fun, not like a chore."
            ]
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex"
            style={{ background: "linear-gradient(180deg, #0a0a0f 0%, #0a0a1a 100%)" }}
        >
            {/* Sidebar Navigation */}
            <motion.aside
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-80 h-full flex flex-col border-r border-white/[0.06] bg-black/20"
            >
                {/* Header */}
                <div className="p-8 border-b border-white/[0.06]">
                    <div className="flex items-center gap-4 mb-2">
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, ${accent}40, ${accent}20)` }}
                        >
                            <Brain size={28} style={{ color: accent }} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">AI Training</h1>
                            <p className="text-xs text-white/40">Customize Zeni</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {sections.map((section, i) => (
                        <motion.button
                            key={section.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => setActiveSection(section.id as any)}
                            className={`w-full p-4 rounded-2xl text-left transition-all group relative overflow-hidden ${activeSection === section.id ? '' : 'hover:bg-white/[0.04]'
                                }`}
                            style={activeSection === section.id ? {
                                background: `linear-gradient(135deg, ${section.color}20, ${section.color}10)`,
                                border: `1px solid ${section.color}40`
                            } : { border: '1px solid transparent' }}
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{
                                        background: activeSection === section.id
                                            ? `${section.color}30`
                                            : 'rgba(255,255,255,0.06)'
                                    }}
                                >
                                    <section.icon
                                        size={20}
                                        style={{ color: activeSection === section.id ? section.color : 'rgba(255,255,255,0.5)' }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className={`font-semibold ${activeSection === section.id ? 'text-white' : 'text-white/70'}`}>
                                        {section.label}
                                    </p>
                                    <p className="text-xs text-white/40">{section.desc}</p>
                                </div>
                                {activeSection === section.id && (
                                    <ChevronRight size={16} style={{ color: section.color }} />
                                )}
                            </div>
                        </motion.button>
                    ))}
                </nav>

                {/* Close Button */}
                <div className="p-4 border-t border-white/[0.06]">
                    <button
                        onClick={onClose}
                        className="w-full py-3 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/60 hover:text-white/80 font-medium transition-all"
                    >
                        Close
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 h-full overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">

                    {/* ============================================================= */}
                    {/* PERSONA SECTION - The star of the show */}
                    {/* ============================================================= */}
                    {activeSection === "persona" && (
                        <motion.div
                            key="persona"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="p-10 max-w-5xl mx-auto"
                        >
                            {/* Header */}
                            <div className="mb-10">
                                <h2 className="text-4xl font-bold text-white mb-3">Zeni's Persona</h2>
                                <p className="text-lg text-white/50">
                                    Define how Zeni communicates, behaves, and responds to you.
                                    Each directive shapes the AI's personality.
                                </p>
                            </div>

                            {/* Quick Presets */}
                            <div className="mb-12">
                                <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Sparkles size={14} />
                                    Quick Presets
                                </h3>
                                <div className="grid grid-cols-4 gap-4">
                                    {Object.entries(PRESETS).map(([key, preset]) => (
                                        <motion.button
                                            key={key}
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => applyPreset(preset.directives)}
                                            className="p-5 rounded-2xl text-left transition-all group relative overflow-hidden"
                                            style={{
                                                background: `linear-gradient(135deg, ${preset.color}15, ${preset.color}05)`,
                                                border: `1px solid ${preset.color}30`
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="relative z-10">
                                                <span className="text-3xl mb-3 block">{preset.emoji}</span>
                                                <p className="font-semibold text-white text-sm">{preset.name}</p>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Add New Directive */}
                            <div className="mb-10">
                                <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Edit3 size={14} />
                                    Add Custom Directive
                                </h3>
                                <div
                                    className="p-6 rounded-3xl"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}
                                >
                                    <textarea
                                        value={newDirective}
                                        onChange={e => setNewDirective(e.target.value)}
                                        placeholder="e.g., 'I always greet the user warmly and ask about their day' or 'I use British English spellings'"
                                        rows={3}
                                        className="w-full bg-transparent text-white text-base placeholder-white/30 focus:outline-none resize-none leading-relaxed mb-4"
                                    />
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-2">
                                            {(['core', 'tone', 'behavior', 'context'] as const).map(cat => (
                                                <button
                                                    key={cat}
                                                    onClick={() => setDirectiveCategory(cat)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${directiveCategory === cat
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-white/5 text-white/50 hover:text-white/70'
                                                        }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={addDirective}
                                            disabled={!newDirective.trim()}
                                            className="px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all disabled:opacity-30"
                                            style={{
                                                background: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
                                                boxShadow: newDirective.trim() ? `0 4px 20px ${accent}40` : 'none'
                                            }}
                                        >
                                            <Plus size={18} />
                                            Add Directive
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Current Directives */}
                            <div>
                                <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <MessageSquare size={14} />
                                    Active Directives ({personaDirectives.length})
                                </h3>

                                {personaDirectives.length === 0 ? (
                                    <div className="p-10 rounded-3xl bg-white/[0.02] border border-white/[0.06] text-center">
                                        <p className="text-white/40">No persona directives yet. Add some above or use a preset!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {personaDirectives.map((directive, index) => (
                                            <motion.div
                                                key={directive.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                                className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-start gap-4 group hover:bg-white/[0.05] transition-all"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <span className="text-sm font-bold text-white/50">{index + 1}</span>
                                                </div>
                                                <p className="flex-1 text-white/80 leading-relaxed">{directive.content}</p>
                                                <button
                                                    onClick={() => removeDirective(directive.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ============================================================= */}
                    {/* IDENTITY SECTION */}
                    {/* ============================================================= */}
                    {activeSection === "identity" && (
                        <motion.div
                            key="identity"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="p-10 max-w-4xl mx-auto"
                        >
                            <div className="mb-10">
                                <h2 className="text-4xl font-bold text-white mb-3">Your Identity</h2>
                                <p className="text-lg text-white/50">
                                    Help Zeni understand who you are so it can personalize responses.
                                </p>
                            </div>

                            <div className="space-y-8">
                                <FormField
                                    label="Your Name"
                                    icon="👤"
                                    value={profile.identity.name}
                                    onChange={(v: string) => {
                                        trainingService.updateIdentity({ name: v });
                                        setProfile(trainingService.getProfile());
                                    }}
                                    placeholder="Anwesh"
                                    accent={accent}
                                />

                                <FormField
                                    label="Your Role"
                                    icon="💼"
                                    value={profile.identity.role}
                                    onChange={(v: string) => {
                                        trainingService.updateIdentity({ role: v });
                                        setProfile(trainingService.getProfile());
                                    }}
                                    placeholder="Entrepreneur, Developer, Creator"
                                    accent={accent}
                                />

                                <FormTextArea
                                    label="Long-Term Vision"
                                    icon="🎯"
                                    value={profile.identity.longTermVision}
                                    onChange={(v: string) => {
                                        trainingService.updateIdentity({ longTermVision: v });
                                        setProfile(trainingService.getProfile());
                                    }}
                                    placeholder="Where do you see yourself in 5 years? What impact do you want to make?"
                                    accent={accent}
                                />

                                <FormField
                                    label="Core Values"
                                    icon="⭐"
                                    value={profile.identity.coreValues.join(", ")}
                                    onChange={(v: string) => {
                                        trainingService.updateIdentity({
                                            coreValues: v.split(",").map(s => s.trim()).filter(Boolean)
                                        });
                                        setProfile(trainingService.getProfile());
                                    }}
                                    placeholder="Excellence, Freedom, Innovation, Impact"
                                    accent={accent}
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* ============================================================= */}
                    {/* KNOWLEDGE SECTION */}
                    {/* ============================================================= */}
                    {activeSection === "knowledge" && (
                        <motion.div
                            key="knowledge"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="p-10 max-w-4xl mx-auto"
                        >
                            <div className="mb-10">
                                <h2 className="text-4xl font-bold text-white mb-3">Knowledge Base</h2>
                                <p className="text-lg text-white/50">
                                    Add facts, preferences, and information that Zeni should remember.
                                </p>
                            </div>

                            <KnowledgeEditor
                                profile={profile}
                                setProfile={setProfile}
                                accent={accent}
                                onSave={saveSuccess}
                            />
                        </motion.div>
                    )}

                    {/* ============================================================= */}
                    {/* PATTERNS SECTION */}
                    {/* ============================================================= */}
                    {activeSection === "patterns" && (
                        <motion.div
                            key="patterns"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="p-10 max-w-4xl mx-auto"
                        >
                            <div className="mb-10">
                                <h2 className="text-4xl font-bold text-white mb-3">Work Patterns</h2>
                                <p className="text-lg text-white/50">
                                    Define your natural rhythms so Zeni can optimize suggestions.
                                </p>
                            </div>

                            <div className="space-y-8">
                                <SelectField
                                    label="Energy Type"
                                    icon="🌅"
                                    value={profile.rhythms.chronotype}
                                    onChange={(v: string) => {
                                        trainingService.updateRhythms({ chronotype: v as any });
                                        setProfile(trainingService.getProfile());
                                    }}
                                    options={[
                                        { value: "lion", label: "🦁 Lion (Early Morning)" },
                                        { value: "bear", label: "🐻 Bear (Mid-Morning)" },
                                        { value: "wolf", label: "🐺 Wolf (Night Owl)" },
                                        { value: "dolphin", label: "🐬 Dolphin (Flexible)" }
                                    ]}
                                    accent={accent}
                                />

                                <SelectField
                                    label="Break Style"
                                    icon="☕"
                                    value={profile.rhythms.breakStyle}
                                    onChange={(v: string) => {
                                        trainingService.updateRhythms({ breakStyle: v as any });
                                        setProfile(trainingService.getProfile());
                                    }}
                                    options={[
                                        { value: "active", label: "🏃 Active (walk, stretch)" },
                                        { value: "meditative", label: "🧘 Meditative" },
                                        { value: "restful", label: "😌 Complete Rest" }
                                    ]}
                                    accent={accent}
                                />

                                <FormField
                                    label="Preferred Session Duration (minutes)"
                                    icon="⏱️"
                                    type="number"
                                    value={profile.rhythms.preferredSessionDuration.toString()}
                                    onChange={(v: string) => {
                                        trainingService.updateRhythms({ preferredSessionDuration: parseInt(v) || 25 });
                                        setProfile(trainingService.getProfile());
                                    }}
                                    placeholder="25"
                                    accent={accent}
                                />
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* Success Toast */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-8 right-8 px-6 py-4 rounded-2xl font-semibold flex items-center gap-3 shadow-2xl"
                        style={{ background: "#10B981" }}
                    >
                        <Check size={20} />
                        Saved!
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// =============================================================================
// KNOWLEDGE EDITOR COMPONENT
// =============================================================================

function KnowledgeEditor({ profile, setProfile, accent, onSave }: {
    profile: TrainingProfile;
    setProfile: (p: TrainingProfile) => void;
    accent: string;
    onSave: () => void;
}) {
    const [newFact, setNewFact] = useState("");
    const [category, setCategory] = useState<'fact' | 'preference'>('fact');

    const facts = profile.knowledgeBase.filter(k => k.category === 'fact' || k.category === 'preference');

    const addFact = () => {
        if (newFact.trim()) {
            trainingService.addKnowledge(newFact.trim(), category);
            setProfile(trainingService.getProfile());
            setNewFact("");
            onSave();
        }
    };

    return (
        <div className="space-y-8">
            {/* Add new */}
            <div
                className="p-6 rounded-3xl"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                <input
                    value={newFact}
                    onChange={e => setNewFact(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addFact()}
                    placeholder="e.g., 'I prefer working in 90-minute deep work blocks'"
                    className="w-full bg-transparent text-white text-base placeholder-white/30 focus:outline-none mb-4"
                />
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCategory('fact')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${category === 'fact'
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : 'bg-white/5 text-white/50 hover:text-white/70'
                                }`}
                        >
                            📝 Fact
                        </button>
                        <button
                            onClick={() => setCategory('preference')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${category === 'preference'
                                ? 'bg-pink-500/20 text-pink-400'
                                : 'bg-white/5 text-white/50 hover:text-white/70'
                                }`}
                        >
                            ❤️ Preference
                        </button>
                    </div>
                    <button
                        onClick={addFact}
                        disabled={!newFact.trim()}
                        className="px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all disabled:opacity-30"
                        style={{
                            background: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
                            boxShadow: newFact.trim() ? `0 4px 20px ${accent}40` : 'none'
                        }}
                    >
                        <Plus size={18} />
                        Add
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {facts.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-start gap-4 group hover:bg-white/[0.05] transition-all"
                    >
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                                background: item.category === 'fact' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(236, 72, 153, 0.15)'
                            }}
                        >
                            <span className="text-sm">{item.category === 'fact' ? '📝' : '❤️'}</span>
                        </div>
                        <p className="flex-1 text-white/80 leading-relaxed">{item.content}</p>
                        <button
                            onClick={() => {
                                trainingService.removeKnowledge(item.id);
                                setProfile(trainingService.getProfile());
                            }}
                            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all"
                        >
                            <Trash2 size={16} />
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// =============================================================================
// FORM COMPONENTS
// =============================================================================

function FormField({ label, icon, value, onChange, placeholder, type = "text", accent: _accent }: any) {
    return (
        <div className="space-y-3">
            <label className="text-sm font-semibold text-white/50 flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-5 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all text-base"
            />
        </div>
    );
}

function FormTextArea({ label, icon, value, onChange, placeholder, accent: _accent }: any) {
    return (
        <div className="space-y-3">
            <label className="text-sm font-semibold text-white/50 flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                {label}
            </label>
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                rows={4}
                className="w-full px-5 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all resize-none text-base leading-relaxed"
            />
        </div>
    );
}

function SelectField({ label, icon, value, onChange, options, accent: _accent }: any) {
    return (
        <div className="space-y-3">
            <label className="text-sm font-semibold text-white/50 flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                {label}
            </label>
            <select
                value={value}
                onChange={e => onChange?.(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-white/20 transition-all cursor-pointer text-base"
            >
                {options.map((opt: any) => (
                    <option key={opt.value} value={opt.value} className="bg-gray-900">
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
