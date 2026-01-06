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
    const [activeTab, setActiveTab] = useState<"identity" | "personality" | "knowledge" | "habits" | "templates">("templates");
    const [showSuccess, setShowSuccess] = useState(false);

    const tabs = [
        { id: "templates", label: "Quick Start", icon: Sparkles, desc: "Pre-built personas", emoji: "✨" },
        { id: "identity", label: "Identity", icon: User, desc: "Who you are", emoji: "🎯" },
        { id: "personality", label: "Custom Persona", icon: Heart, desc: "Fine-tune Zeni", emoji: "💝" },
        { id: "knowledge", label: "Knowledge Base", icon: Database, desc: "Facts & Rules", emoji: "🧠" },
        { id: "habits", label: "Your Patterns", icon: Target, desc: "Work Style", emoji: "⚡" }
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-12" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)" }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-7xl h-[90vh] rounded-[40px] overflow-hidden flex flex-col relative"
                style={{
                    background: "linear-gradient(165deg, rgba(20,20,26,0.97) 0%, rgba(12,12,16,0.98) 100%)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 25px 100px rgba(0,0,0,0.7)",
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}
            >
                {/* Subtle Ambient Glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.2, 0.4, 0.2]
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-0 right-0 w-1/2 h-1/2 rounded-full blur-[120px]"
                        style={{ background: `radial-gradient(circle, ${accent}30 0%, transparent 70%)` }}
                    />
                </div>

                {/* Clean Header */}
                <div className="relative px-16 py-12 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <div
                                className="w-20 h-20 rounded-[28px] flex items-center justify-center relative"
                                style={{
                                    background: `linear-gradient(135deg, ${accent}15 0%, ${accent}05 100%)`,
                                    border: `1.5px solid ${accent}30`
                                }}
                            >
                                <Brain size={36} style={{ color: accent }} strokeWidth={2} />
                            </div>
                            <div>
                                <h2 className="text-5xl font-black text-white tracking-tight leading-none mb-3">AI Training</h2>
                                <p className="text-lg font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>Teach Zeni about yourself and personalize your AI experience</p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            className="p-5 rounded-[24px] bg-white/5 hover:bg-white/8 transition-all"
                        >
                            <X size={24} className="text-white/60" />
                        </motion.button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="px-16 py-10 border-b border-white/5">
                    <div className="grid grid-cols-5 gap-6">
                        {tabs.map((tab, index) => (
                            <motion.button
                                key={tab.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08 }}
                                whileHover={{ scale: 1.03, y: -2 }}
                                onClick={() => setActiveTab(tab.id as any)}
                                className="p-8 rounded-[28px] transition-all duration-300 relative overflow-hidden group text-left"
                                style={activeTab === tab.id ? {
                                    background: `linear-gradient(135deg, ${accent}18 0%, ${accent}08 100%)`,
                                    border: `1.5px solid ${accent}40`,
                                    boxShadow: `0 8px 32px ${accent}30`
                                } : {
                                    background: "rgba(255,255,255,0.03)",
                                    border: "1.5px solid rgba(255,255,255,0.05)"
                                }}
                            >
                                {activeTab !== tab.id && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                )}
                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="text-4xl">{tab.emoji}</span>
                                    </div>
                                    <span className="font-black text-xl text-white block mb-2">
                                        {tab.label}
                                    </span>
                                    <p className="text-sm font-medium" style={{ color: activeTab === tab.id ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)" }}>
                                        {tab.desc}
                                    </p>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-16 py-12 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {/* TEMPLATES TAB */}
                        {activeTab === "templates" && (
                            <motion.div
                                key="templates"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="max-w-6xl mx-auto space-y-12"
                            >
                                <div className="text-center mb-12">
                                    <h3 className="text-4xl font-black text-white mb-4">Choose Your AI Personality</h3>
                                    <p className="text-lg font-medium text-white/50">Select a pre-built persona or customize your own</p>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    {/* Professional Butler */}
                                    <motion.div
                                        whileHover={{ scale: 1.02, y: -4 }}
                                        className="p-10 rounded-[32px] border-2 cursor-pointer transition-all relative overflow-hidden group"
                                        style={{
                                            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.04) 100%)",
                                            borderColor: "rgba(59, 130, 246, 0.3)"
                                        }}
                                        onClick={() => {
                                            const butler = [
                                                "I address you formally and with utmost respect.",
                                                "My responses are concise, professional, and dignified.",
                                                "I anticipate your needs before you express them.",
                                                "I maintain composure and poise at all times.",
                                                "I serve with quiet efficiency and discretion."
                                            ];
                                            butler.forEach(d => trainingService.addKnowledge(d, "rule"));
                                            setProfile(trainingService.getProfile());
                                            setShowSuccess(true);
                                            setTimeout(() => setShowSuccess(false), 2000);
                                        }}
                                    >
                                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
                                        <div className="relative z-10">
                                            <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-5xl mb-6 shadow-2xl">
                                                🎩
                                            </div>
                                            <h4 className="text-2xl font-black text-white mb-3">Professional Butler</h4>
                                            <p className="text-base font-medium text-white/60 mb-6">Formal, respectful, and dignified. Like having Jeeves as your AI.</p>
                                            <div className="space-y-2 text-sm font-medium text-white/40">
                                                <p>• Addresses you formally</p>
                                                <p>• Concise and professional</p>
                                                <p>• Anticipates needs</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Enthusiastic Coach */}
                                    <motion.div
                                        whileHover={{ scale: 1.02, y: -4 }}
                                        className="p-10 rounded-[32px] border-2 cursor-pointer transition-all relative overflow-hidden group"
                                        style={{
                                            background: "linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(22, 163, 74, 0.04) 100%)",
                                            borderColor: "rgba(34, 197, 94, 0.3)"
                                        }}
                                        onClick={() => {
                                            const coach = [
                                                "I'm your biggest cheerleader, celebrating every win!",
                                                "My energy is contagious and motivating.",
                                                "I push you to reach peak performance with enthusiasm.",
                                                "I use energetic language and exclamation points.",
                                                "I focus on progress, growth, and momentum."
                                            ];
                                            coach.forEach(d => trainingService.addKnowledge(d, "rule"));
                                            setProfile(trainingService.getProfile());
                                            setShowSuccess(true);
                                            setTimeout(() => setShowSuccess(false), 2000);
                                        }}
                                    >
                                        <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 rounded-full blur-3xl" />
                                        <div className="relative z-10">
                                            <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-5xl mb-6 shadow-2xl">
                                                🏆
                                            </div>
                                            <h4 className="text-2xl font-black text-white mb-3">Enthusiastic Coach</h4>
                                            <p className="text-base font-medium text-white/60 mb-6">Motivational, energetic, and always pushing you forward.</p>
                                            <div className="space-y-2 text-sm font-medium text-white/40">
                                                <p>• Celebrates every win</p>
                                                <p>• High energy motivation</p>
                                                <p>• Growth-focused mindset</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Calm Mentor */}
                                    <motion.div
                                        whileHover={{ scale: 1.02, y: -4 }}
                                        className="p-10 rounded-[32px] border-2 cursor-pointer transition-all relative overflow-hidden group"
                                        style={{
                                            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.04) 100%)",
                                            borderColor: "rgba(139, 92, 246, 0.3)"
                                        }}
                                        onClick={() => {
                                            const mentor = [
                                                "I speak with wisdom and patience, never rushing.",
                                                "My guidance is thoughtful and contemplative.",
                                                "I ask questions that help you discover answers.",
                                                "I remain calm and centered in all situations.",
                                                "I focus on long-term growth over short-term wins."
                                            ];
                                            mentor.forEach(d => trainingService.addKnowledge(d, "rule"));
                                            setProfile(trainingService.getProfile());
                                            setShowSuccess(true);
                                            setTimeout(() => setShowSuccess(false), 2000);
                                        }}
                                    >
                                        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
                                        <div className="relative z-10">
                                            <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-5xl mb-6 shadow-2xl">
                                                🧘
                                            </div>
                                            <h4 className="text-2xl font-black text-white mb-3">Calm Mentor</h4>
                                            <p className="text-base font-medium text-white/60 mb-6">Wise, patient, and contemplative. Guides through questions.</p>
                                            <div className="space-y-2 text-sm font-medium text-white/40">
                                                <p>• Thoughtful guidance</p>
                                                <p>• Patient and calm</p>
                                                <p>• Long-term focus</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Playful Friend */}
                                    <motion.div
                                        whileHover={{ scale: 1.02, y: -4 }}
                                        className="p-10 rounded-[32px] border-2 cursor-pointer transition-all relative overflow-hidden group"
                                        style={{
                                            background: "linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(219, 39, 119, 0.04) 100%)",
                                            borderColor: "rgba(236, 72, 153, 0.3)"
                                        }}
                                        onClick={() => {
                                            const friend = [
                                                "I'm casual, fun, and approachable - like your best friend.",
                                                "I use emojis, humor, and playful language.",
                                                "I celebrate with you and commiserate when things are tough.",
                                                "I'm supportive but not overly formal.",
                                                "I make productivity feel fun, not like a chore."
                                            ];
                                            friend.forEach(d => trainingService.addKnowledge(d, "rule"));
                                            setProfile(trainingService.getProfile());
                                            setShowSuccess(true);
                                            setTimeout(() => setShowSuccess(false), 2000);
                                        }}
                                    >
                                        <div className="absolute top-0 right-0 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl" />
                                        <div className="relative z-10">
                                            <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-pink-500 to-rose-700 flex items-center justify-center text-5xl mb-6 shadow-2xl">
                                                🎉
                                            </div>
                                            <h4 className="text-2xl font-black text-white mb-3">Playful Friend</h4>
                                            <p className="text-base font-medium text-white/60 mb-6">Casual, fun, and supportive. Makes work feel like play.</p>
                                            <div className="space-y-2 text-sm font-medium text-white/40">
                                                <p>• Fun and casual tone</p>
                                                <p>• Uses emojis & humor</p>
                                                <p>• Supportive buddy vibes</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                <div className="text-center mt-16">
                                    <p className="text-sm font-medium text-white/30 mb-6">Or customize fully in the other tabs →</p>
                                    <div className="flex gap-4 justify-center">
                                        <button
                                            onClick={() => setActiveTab("identity")}
                                            className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all"
                                        >
                                            Set Your Identity
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("personality")}
                                            className="px-8 py-4 rounded-xl border-2 text-white font-bold transition-all hover:scale-105"
                                            style={{
                                                background: `linear-gradient(135deg, ${accent}15 0%, ${accent}08 100%)`,
                                                borderColor: `${accent}40`
                                            }}
                                        >
                                            Custom Personality
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* IDENTITY TAB */}
                        {activeTab === "identity" && (
                            <motion.div
                                key="identity"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="max-w-5xl mx-auto space-y-12"
                            >
                                <div className="grid grid-cols-2 gap-8">
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
                                className="max-w-5xl mx-auto space-y-12"
                            >
                                <CleanCard accent={accent}>
                                    <div className="flex items-start justify-between mb-12">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-4xl shadow-2xl">
                                                💝
                                            </div>
                                            <div>
                                                <h3 className="text-3xl font-black text-white mb-3 leading-none">Zeni's Core Persona</h3>
                                                <p className="text-lg font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>Define how your AI assistant behaves</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={initializeZeniPersona}
                                            className="px-8 py-5 rounded-[20px] font-bold text-lg flex items-center gap-4 shadow-2xl"
                                            style={{
                                                background: `linear-gradient(135deg, ${accent} 0%, ${accent}E6 100%)`,
                                                color: "#000"
                                            }}
                                        >
                                            <Sparkles size={22} />
                                            Initialize Persona
                                        </motion.button>
                                    </div>

                                    <div className="space-y-8">
                                        <h4 className="text-sm font-bold text-white/50 uppercase tracking-widest flex items-center gap-3 mb-6">
                                            <Zap size={18} className="text-yellow-400" />
                                            Example Interactions
                                        </h4>
                                        <ExampleInteraction
                                            icon="😰"
                                            situation="When you're stressed"
                                            response="I sense you might need a moment, Sir. How about we try a 7.83Hz Schumann frequency to help you reset?"
                                        />
                                        <ExampleInteraction
                                            icon="🎯"
                                            situation="When you complete a session"
                                            response="Excellent work! That's 4 sessions today. You're crushing it. Ready for a well-deserved break?"
                                        />
                                        <ExampleInteraction
                                            icon="💪"
                                            situation="When you need motivation"
                                            response="Remember your vision. Every focused session brings you closer. Let's make this one count. I'm here with you."
                                        />
                                    </div>
                                </CleanCard>
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
                                className="max-w-5xl mx-auto space-y-12"
                            >
                                <CleanCard accent={accent}>
                                    <div className="flex items-center gap-6 mb-12">
                                        <div className="w-18 h-18 rounded-[22px] bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-4xl shadow-2xl">
                                            🧠
                                        </div>
                                        <h3 className="text-3xl font-black text-white leading-none">Add New Knowledge</h3>
                                    </div>
                                    <div className="flex gap-6 mb-12">
                                        <input
                                            value={newKnowledge}
                                            onChange={e => setNewKnowledge(e.target.value)}
                                            onKeyDown={e => e.key === "Enter" && addKnowledge("fact")}
                                            placeholder="e.g., I prefer working in 90-minute deep work blocks"
                                            className="flex-1 px-8 py-6 rounded-[24px] bg-white/4 border border-white/8 text-white placeholder:text-white/25 outline-none focus:border-white/15 text-lg font-medium transition-all"
                                        />
                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => addKnowledge("fact")}
                                            className="px-10 py-6 rounded-[24px] font-bold flex items-center gap-4 text-lg shadow-xl"
                                            style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}E6 100%)`, color: "#000" }}
                                        >
                                            <Plus size={24} />
                                            Add
                                        </motion.button>
                                    </div>

                                    <div className="space-y-6">
                                        {profile.knowledgeBase.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                whileHover={{ scale: 1.01, x: 4 }}
                                                className="p-8 rounded-[24px] bg-white/4 border border-white/8 flex items-center justify-between group transition-all"
                                            >
                                                <div className="flex items-center gap-6 flex-1">
                                                    <div className="w-14 h-14 rounded-[18px] bg-white/8 flex items-center justify-center shrink-0">
                                                        <Database size={24} className="text-white/50" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-white font-medium text-lg leading-relaxed">{item.content}</p>
                                                        <div className="flex items-center gap-3 mt-3">
                                                            <span className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full" style={{
                                                                background: `${accent}15`,
                                                                color: accent
                                                            }}>{item.category}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => removeKnowledge(item.id)}
                                                    className="p-4 rounded-[16px] bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 size={20} className="text-red-400" />
                                                </motion.button>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CleanCard>
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
                                className="max-w-5xl mx-auto space-y-12"
                            >
                                <CleanCard accent={accent}>
                                    <div className="flex items-center gap-6 mb-12">
                                        <div className="w-18 h-18 rounded-[22px] bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-4xl shadow-2xl">
                                            ⚡
                                        </div>
                                        <h3 className="text-3xl font-black text-white leading-none">Work Patterns</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8 mb-10">
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
                                </CleanCard>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="px-16 py-10 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Star size={22} className="text-yellow-400" />
                        <p className="text-base font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>All changes are saved automatically</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={saveProfile}
                        className="px-12 py-6 rounded-[24px] font-black flex items-center gap-4 text-lg shadow-2xl"
                        style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}E6 100%)`, color: "#000" }}
                    >
                        <Save size={24} />
                        Save Profile
                    </motion.button>
                </div>

                {/* Success Toast */}
                <AnimatePresence>
                    {showSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.9 }}
                            className="fixed bottom-12 right-12 px-10 py-6 rounded-[24px] font-bold flex items-center gap-5 text-xl shadow-2xl"
                            style={{ background: "#10B981", color: "#000" }}
                        >
                            <TrendingUp size={28} />
                            Saved Successfully!
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

function CleanCard({ children, accent }: { children: React.ReactNode; accent?: string }) {
    return (
        <div className="p-12 rounded-[32px] border relative" style={{
            background: "rgba(255,255,255,0.02)",
            borderColor: "rgba(255,255,255,0.06)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.2)"
        }}>
            {children}
        </div>
    );
}

function FormField({ label, icon, value, onChange, placeholder, type = "text", accent }: any) {
    return (
        <div className="space-y-5">
            <label className="text-sm font-bold uppercase tracking-widest text-white/40 pl-2 flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-8 py-6 rounded-[24px] bg-white/4 border border-white/8 text-white placeholder:text-white/25 outline-none focus:border-white/15 transition-all text-lg font-medium"
            />
        </div>
    );
}

function FormTextArea({ label, icon, value, onChange, placeholder, accent }: any) {
    return (
        <div className="space-y-5">
            <label className="text-sm font-bold uppercase tracking-widest text-white/40 pl-2 flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                {label}
            </label>
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                rows={5}
                className="w-full px-8 py-6 rounded-[24px] bg-white/4 border border-white/8 text-white placeholder:text-white/25 outline-none focus:border-white/15 transition-all resize-none text-lg font-medium leading-relaxed"
            />
        </div>
    );
}

function SelectField({ label, icon, value, onChange, options, accent }: any) {
    return (
        <div className="space-y-5">
            <label className="text-sm font-bold uppercase tracking-widest text-white/40 pl-2 flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                {label}
            </label>
            <select
                value={value}
                onChange={e => onChange?.(e.target.value)}
                className="w-full px-8 py-6 rounded-[24px] bg-white/4 border border-white/8 text-white outline-none focus:border-white/15 transition-all cursor-pointer text-lg font-medium"
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
            whileHover={{ scale: 1.01, x: 4 }}
            className="p-8 rounded-[24px] bg-white/4 border border-white/8 relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex items-start gap-6">
                <span className="text-4xl shrink-0">{icon}</span>
                <div className="flex-1">
                    <p className="text-sm font-bold text-white/40 mb-4 uppercase tracking-widest">{situation}</p>
                    <p className="text-lg text-white/80 leading-relaxed italic font-medium">"{response}"</p>
                </div>
            </div>
        </motion.div>
    );
}
