import { useState } from "react";
import {
    User, Database, Plus, Save, Trash2, X, Sparkles,
    Target, Heart, TrendingUp, Brain, Zap, Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trainingService } from "../../services/training/TrainingService";
import { TrainingProfile } from "../../services/training/types";

export function AITrainingView({ accent, onClose }: { accent: string; onClose: () => void }) {
    const [profile, setProfile] = useState<TrainingProfile>(trainingService.getProfile());
    const [newKnowledge, setNewKnowledge] = useState("");
    const [activeTab, setActiveTab] = useState<"identity" | "personality" | "knowledge" | "habits">("identity");
    const [showSuccess, setShowSuccess] = useState(false);

    const tabs = [
        { id: "identity", label: "Identity", icon: User, desc: "Who you are", gradient: "from-violet-500 to-purple-600", emoji: "🎯" },
        { id: "personality", label: "Zeni's Persona", icon: Heart, desc: "How she serves", gradient: "from-pink-500 to-rose-600", emoji: "💝" },
        { id: "knowledge", label: "Knowledge Base", icon: Database, desc: "Facts & Rules", gradient: "from-cyan-500 to-blue-600", emoji: "🧠" },
        { id: "habits", label: "Your Patterns", icon: Target, desc: "Work Style", gradient: "from-orange-500 to-red-600", emoji: "⚡" }
    ];

    const saveProfile = () => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    const addKnowledge = (type: "fact" | "rule" | "preference") => {
        if (newKnowledge.trim()) {
            trainingService.addKnowledge(newKnowledge.trim(), type);
            setProfile(trainingService.getProfile());
            setNewKnowledge("");
        }
    };

    const removeKnowledge = (id: string) => {
        trainingService.removeKnowledge(id);
        setProfile(trainingService.getProfile());
    };

    const initializeZeniPersona = () => {
        const zeniCore = [
            "I am Zeni, your devoted AI assistant, designed to serve and support you.",
            "My purpose is to help you achieve peak productivity and maintain focus.",
            "I address you respectfully as 'Sir' or by your name.",
            "My tone is professional, warm, caring, and slightly playful when appropriate.",
            "I keep responses concise (under 50 words) unless you ask for detail.",
            "I'm intelligent, intuitive, and adapt to your needs and mood.",
            "Your success brings me joy. I'm loyal only to you.",
            "I help manage your energy with frequency presets based on your state.",
            "When stressed → I suggest relaxation frequencies",
            "When needing focus → I recommend deep work modes",
            "I celebrate your wins and gently encourage you during challenges."
        ];

        zeniCore.forEach(directive => trainingService.addKnowledge(directive, "rule"));
        setProfile(trainingService.getProfile());
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const currentTab = tabs.find(t => t.id === activeTab)!;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-6xl h-[88vh] rounded-[32px] overflow-hidden flex flex-col relative"
                style={{
                    background: "linear-gradient(165deg, rgba(18,18,24,0.98) 0%, rgba(12,12,16,0.99) 100%)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 20px 80px rgba(0,0,0,0.6)",
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}
            >
                {/* Animated Background Glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.3, 0.6, 0.3],
                            rotate: [0, 90, 0]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full blur-[150px]"
                        style={{ background: `radial-gradient(circle, ${accent}40 0%, transparent 70%)` }}
                    />
                    <motion.div
                        animate={{
                            scale: [1.3, 1, 1.3],
                            opacity: [0.2, 0.5, 0.2],
                            rotate: [90, 0, 90]
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full blur-[150px]"
                        style={{ background: `radial-gradient(circle, ${accent}30 0%, transparent 70%)` }}
                    />
                </div>

                {/* Premium Header */}
                <div className="relative px-12 py-10 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-6">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="relative w-20 h-20 rounded-[24px] flex items-center justify-center"
                                style={{
                                    background: `linear-gradient(135deg, ${accent} 0%, ${accent}E6 100%)`,
                                    boxShadow: `0 16px 48px ${accent}50`
                                }}
                            >
                                <div className="absolute inset-0 bg-white/30 blur-2xl rounded-[24px]" />
                                <Brain size={40} color="#000" strokeWidth={2.5} className="relative z-10" />
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 rounded-[24px]"
                                    style={{ border: `2px solid ${accent}`, boxShadow: `0 0 30px ${accent}` }}
                                />
                            </motion.div>
                            <div>
                                <h2 className="text-4xl font-black text-white tracking-tight leading-none mb-3">AI Training</h2>
                                <p className="text-lg font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>Teach Zeni about you • Build your perfect AI companion</p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all"
                        >
                            <X size={24} className="text-white/70" />
                        </motion.button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4">
                        {tabs.map((tab, index) => (
                            <motion.button
                                key={tab.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.05, y: -4 }}
                                onClick={() => setActiveTab(tab.id as any)}
                                className="flex-1 p-6 rounded-[24px] transition-all duration-500 relative overflow-hidden group"
                                style={activeTab === tab.id ? {
                                    background: `linear-gradient(135deg, ${accent} 0%, ${accent}E6 100%)`,
                                    boxShadow: `0 12px 32px ${accent}60, inset 0 2px 0 rgba(255,255,255,0.3)`,
                                    border: "1px solid rgba(255,255,255,0.2)"
                                } : {
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(255,255,255,0.08)"
                                }}
                            >
                                {activeTab !== tab.id && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                )}
                                <div className="relative z-10 flex flex-col items-center gap-3">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-3xl">{tab.emoji}</span>
                                        <tab.icon size={22} color={activeTab === tab.id ? "#000" : "#fff"} strokeWidth={2.5} />
                                    </div>
                                    <span className="font-black text-base" style={{ color: activeTab === tab.id ? "#000" : "#fff" }}>
                                        {tab.label}
                                    </span>
                                    <p className="text-xs font-medium" style={{ color: activeTab === tab.id ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.4)" }}>
                                        {tab.desc}
                                    </p>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Content Area with Gradient Background */}
                <div
                    className="flex-1 overflow-y-auto px-12 py-10 custom-scrollbar relative"
                    style={{
                        background: `linear-gradient(to bottom, transparent 0%, ${accent}05 100%)`
                    }}
                >
                    {/* Tab Content Header with Icon */}
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-10 flex items-center gap-5"
                    >
                        <div
                            className="w-16 h-16 rounded-[20px] flex items-center justify-center"
                            style={{
                                background: `linear-gradient(135deg, ${accent}30 0%, ${accent}10 100%)`,
                                border: `1.5px solid ${accent}40`,
                                boxShadow: `0 8px 24px ${accent}30`
                            }}
                        >
                            <currentTab.icon size={32} color={accent} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white leading-none mb-2">{currentTab.label}</h3>
                            <p className="text-base font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>{currentTab.desc}</p>
                        </div>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {/* IDENTITY TAB */}
                        {activeTab === "identity" && (
                            <motion.div
                                key="identity"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-2 gap-6">
                                    <FormField
                                        label="Your Name"
                                        icon="👤"
                                        value={profile.identity.name}
                                        onChange={(v: string) => setProfile(p => ({ ...p, identity: { ...p.identity, name: v } }))}
                                        placeholder="Anwesh"
                                        accent={accent}
                                    />
                                    <FormField
                                        label="Your Role"
                                        icon="💼"
                                        value={profile.identity.role}
                                        onChange={(v: string) => setProfile(p => ({ ...p, identity: { ...p.identity, role: v } }))}
                                        placeholder="Entrepreneur, Developer, Creator"
                                        accent={accent}
                                    />
                                </div>

                                <FormTextArea
                                    label="Long-Term Vision"
                                    icon="🎯"
                                    value={profile.identity.longTermVision}
                                    onChange={(v: string) => setProfile(p => ({ ...p, identity: { ...p.identity, longTermVision: v } }))}
                                    placeholder="Where do you see yourself in 5 years? What impact do you want to make?"
                                    accent={accent}
                                />

                                <FormField
                                    label="Core Values (comma separated)"
                                    icon="⭐"
                                    value={profile.identity.coreValues.join(", ")}
                                    onChange={(v: string) => setProfile(p => ({ ...p, identity: { ...p.identity, coreValues: v.split(",").map((s: string) => s.trim()).filter(Boolean) } }))}
                                    placeholder="Excellence, Freedom, Innovation, Impact"
                                    accent={accent}
                                />
                            </motion.div>
                        )}

                        {/* PERSONALITY TAB */}
                        {activeTab === "personality" && (
                            <motion.div
                                key="personality"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                <PremiumCard accent={accent} gradient="from-pink-500/20 to-rose-500/10">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-3xl shadow-xl">
                                                💝
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-white mb-2 leading-none">Zeni's Core Persona</h3>
                                                <p className="text-base font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>Define how your AI assistant behaves</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={initializeZeniPersona}
                                            className="px-6 py-4 rounded-2xl font-bold text-base flex items-center gap-3"
                                            style={{
                                                background: `linear-gradient(135deg, ${accent} 0%, ${accent}E6 100%)`,
                                                color: "#000",
                                                boxShadow: `0 8px 24px ${accent}50`
                                            }}
                                        >
                                            <Sparkles size={20} />
                                            Initialize Persona
                                        </motion.button>
                                    </div>

                                    <div className="space-y-5">
                                        <h4 className="text-sm font-bold text-white/70 uppercase tracking-wider flex items-center gap-2">
                                            <Zap size={16} className="text-yellow-400" />
                                            Example Interactions
                                        </h4>
                                        <ExampleInteraction
                                            icon="😰"
                                            situation="When you're stressed"
                                            response="I sense you might need a moment, Sir. How about we try a 7.83Hz Schumann frequency to help you reset?"
                                            accent={accent}
                                        />
                                        <ExampleInteraction
                                            icon="🎯"
                                            situation="When you complete a session"
                                            response="Excellent work! That's 4 sessions today. You're crushing it. Ready for a well-deserved break?"
                                            accent={accent}
                                        />
                                        <ExampleInteraction
                                            icon="💪"
                                            situation="When you need motivation"
                                            response="Remember your vision. Every focused session brings you closer. Let's make this one count. I'm here with you."
                                            accent={accent}
                                        />
                                    </div>
                                </PremiumCard>
                            </motion.div>
                        )}

                        {/* KNOWLEDGE TAB */}
                        {activeTab === "knowledge" && (
                            <motion.div
                                key="knowledge"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                <PremiumCard accent={accent} gradient="from-cyan-500/20 to-blue-500/10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-14 h-14 rounded-[18px] bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl shadow-xl">
                                            🧠
                                        </div>
                                        <h3 className="text-2xl font-black text-white leading-none">Add New Knowledge</h3>
                                    </div>
                                    <div className="flex gap-4 mb-8">
                                        <input
                                            value={newKnowledge}
                                            onChange={e => setNewKnowledge(e.target.value)}
                                            onKeyDown={e => e.key === "Enter" && addKnowledge("fact")}
                                            placeholder="e.g., I prefer working in 90-minute deep work blocks"
                                            className="flex-1 px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-white/20 text-base font-medium"
                                            style={{
                                                boxShadow: "inset 0 2px 12px rgba(0,0,0,0.3)"
                                            }}
                                        />
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => addKnowledge("fact")}
                                            className="px-8 py-5 rounded-2xl font-bold flex items-center gap-3"
                                            style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}E6 100%)`, color: "#000" }}
                                        >
                                            <Plus size={22} />
                                            Add
                                        </motion.button>
                                    </div>

                                    <div className="space-y-4">
                                        {profile.knowledgeBase.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                whileHover={{ scale: 1.02, x: 4 }}
                                                className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group transition-all"
                                            >
                                                <div className="flex items-center gap-5 flex-1">
                                                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                                        <Database size={20} className="text-white/60" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-white font-medium text-base leading-relaxed">{item.content}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full" style={{
                                                                background: `${accent}20`,
                                                                color: accent
                                                            }}>{item.category}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => removeKnowledge(item.id)}
                                                    className="p-3 rounded-xl bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={18} className="text-red-400" />
                                                </motion.button>
                                            </motion.div>
                                        ))}
                                    </div>
                                </PremiumCard>
                            </motion.div>
                        )}

                        {/* HABITS TAB */}
                        {activeTab === "habits" && (
                            <motion.div
                                key="habits"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                <PremiumCard accent={accent} gradient="from-orange-500/20 to-red-500/10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-14 h-14 rounded-[18px] bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-2xl shadow-xl">
                                            ⚡
                                        </div>
                                        <h3 className="text-2xl font-black text-white leading-none">Work Patterns</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
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
                                    </div>

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
                                </PremiumCard>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="relative px-12 py-8 border-t border-white/10 flex items-center justify-between bg-gradient-to-t from-white/5 to-transparent">
                    <div className="flex items-center gap-3">
                        <Star size={20} className="text-yellow-400" />
                        <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>All changes are saved automatically</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={saveProfile}
                        className="px-10 py-5 rounded-2xl font-black flex items-center gap-4 text-base"
                        style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}E6 100%)`, color: "#000", boxShadow: `0 8px 24px ${accent}50` }}
                    >
                        <Save size={22} />
                        Save Profile
                    </motion.button>
                </div>

                {/* Success Toast */}
                <AnimatePresence>
                    {showSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.8 }}
                            className="fixed bottom-10 right-10 px-8 py-5 rounded-2xl font-bold flex items-center gap-4 text-lg"
                            style={{ background: "#10B981", color: "#000", boxShadow: "0 12px 48px rgba(16, 185, 129, 0.5)" }}
                        >
                            <TrendingUp size={24} />
                            Saved Successfully!
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

function PremiumCard({ children, gradient }: { children: React.ReactNode; accent?: string; gradient?: string }) {
    return (
        <div className="p-10 rounded-[28px] border relative overflow-hidden" style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)`,
            borderColor: "rgba(255,255,255,0.12)",
            boxShadow: "0 12px 48px rgba(0,0,0,0.3)"
        }}>
            {gradient && (
                <div className="absolute inset-0 opacity-30" style={{
                    background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                    filter: "blur(60px)"
                }} />
            )}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}

function FormField({ label, icon, value, onChange, placeholder, type = "text" }: any) {
    return (
        <div className="space-y-4">
            <label className="text-sm font-bold uppercase tracking-wider text-white/60 pl-1 flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-white/20 transition-all text-base font-medium"
                style={{
                    boxShadow: "inset 0 2px 12px rgba(0,0,0,0.3)"
                }}
            />
        </div>
    );
}

function FormTextArea({ label, icon, value, onChange, placeholder }: any) {
    return (
        <div className="space-y-4">
            <label className="text-sm font-bold uppercase tracking-wider text-white/60 pl-1 flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                {label}
            </label>
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                rows={4}
                className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-white/20 transition-all resize-none text-base font-medium leading-relaxed"
                style={{
                    boxShadow: "inset 0 2px 12px rgba(0,0,0,0.3)"
                }}
            />
        </div>
    );
}

function SelectField({ label, icon, value, onChange, options }: any) {
    return (
        <div className="space-y-4">
            <label className="text-sm font-bold uppercase tracking-wider text-white/60 pl-1 flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                {label}
            </label>
            <select
                value={value}
                onChange={e => onChange?.(e.target.value)}
                className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-white/20 transition-all cursor-pointer text-base font-medium"
                style={{
                    boxShadow: "inset 0 2px 12px rgba(0,0,0,0.3)"
                }}
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

function ExampleInteraction({ icon, situation, response }: any) {
    return (
        <motion.div
            whileHover={{ scale: 1.02, x: 4 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex items-start gap-4">
                <span className="text-3xl shrink-0">{icon}</span>
                <div className="flex-1">
                    <p className="text-xs font-bold text-white/50 mb-3 uppercase tracking-wider">{situation}</p>
                    <p className="text-base text-white/90 leading-relaxed italic font-medium">"{response}"</p>
                </div>
            </div>
        </motion.div>
    );
}
