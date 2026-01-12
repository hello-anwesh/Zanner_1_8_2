import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Trash2, Plus, Clock, Sparkles, Book, Gavel, RefreshCw, X, Database, MessageSquare, Zap, Crown } from "lucide-react";
import { trainingService } from "../services/training/TrainingService";
import { aiService } from "../services/ai/AIService";
import { TrainingProfile, AIExperience } from "../services/training/types";

interface AIBrainViewProps {
    accent: string;
}

export function AIBrainView({ accent }: AIBrainViewProps) {
    const [profile, setProfile] = useState<TrainingProfile>(trainingService.getProfile());
    const [activeTab, setActiveTab] = useState<"knowledge" | "rules" | "history">("knowledge");
    const [newValue, setNewValue] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [historyStats, setHistoryStats] = useState(aiService.getHistoryStats());

    useEffect(() => {
        // Refresh profile and stats on mount
        setProfile(trainingService.getProfile());
        setHistoryStats(aiService.getHistoryStats());
    }, []);

    const refresh = () => {
        setProfile({ ...trainingService.getProfile() }); // Force new ref
        setHistoryStats(aiService.getHistoryStats());
    };

    const handleClearHistory = () => {
        if (confirm("Clear all conversation history? Zeni will forget the current chat context.")) {
            aiService.clearHistory();
            setHistoryStats(aiService.getHistoryStats());
        }
    };

    const handleDelete = (id: string, type: "knowledge" | "rules" | "history") => {
        if (type === "knowledge") trainingService.removeKnowledge(id);
        if (type === "rules") trainingService.removeRule(id);
        // History deletion not yet exposed in service, but we can update state
        // For now, let's just handle knowledge and rules properly
        refresh();
    };

    const handleAdd = () => {
        if (!newValue.trim()) return;

        if (activeTab === "knowledge") {
            trainingService.addKnowledge(newValue, "fact");
        } else if (activeTab === "rules") {
            trainingService.addRule(newValue, "manual");
        }

        setNewValue("");
        setShowAdd(false);
        refresh();
    };

    const tabs = [
        { id: "knowledge", label: "Knowledge Base", icon: Book, count: profile.knowledgeBase?.length || 0 },
        { id: "rules", label: "Behavior Rules", icon: Gavel, count: profile.rules?.length || 0 },
        { id: "history", label: "Recent Memory", icon: Clock, count: profile.experiences?.length || 0 },
    ];

    // Calculate token usage percentage
    const tokenUsagePercent = Math.round((historyStats.estimatedTokens / historyStats.maxTokens) * 100);

    return (
        <div className="p-12 max-w-6xl mx-auto space-y-10 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <span className="px-5 py-2.5 rounded-2xl text-sm font-black uppercase tracking-wider bg-white/[0.08] text-white/60 border border-white/[0.15] inline-block mb-6">
                        Neural Memory
                    </span>
                    <h2 className="text-4xl font-black text-white mb-2">Zeni's Brain</h2>
                    <p className="text-lg text-white/50">Manage what the AI knows, remembers, and follows.</p>
                </div>

                <button
                    onClick={refresh}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {/* Chat Memory */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg" style={{ background: `${accent}20` }}>
                            <MessageSquare size={18} style={{ color: accent }} />
                        </div>
                        <span className="text-sm text-white/50 font-medium">Chat Memory</span>
                    </div>
                    <p className="text-2xl font-black text-white">{historyStats.messageCount}</p>
                    <p className="text-xs text-white/30 mt-1">messages in context</p>
                </div>

                {/* Token Usage */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg" style={{ background: `${accent}20` }}>
                            <Zap size={18} style={{ color: accent }} />
                        </div>
                        <span className="text-sm text-white/50 font-medium">Token Usage</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-black text-white">{historyStats.estimatedTokens.toLocaleString()}</p>
                        <p className="text-sm text-white/30">/ {historyStats.maxTokens.toLocaleString()}</p>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all"
                            style={{
                                width: `${Math.min(tokenUsagePercent, 100)}%`,
                                background: tokenUsagePercent > 80 ? '#ef4444' : accent
                            }}
                        />
                    </div>
                </div>

                {/* Long-term Memory */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg" style={{ background: `${accent}20` }}>
                            <Database size={18} style={{ color: accent }} />
                        </div>
                        <span className="text-sm text-white/50 font-medium">Long-term</span>
                    </div>
                    <p className="text-2xl font-black text-white">
                        {(profile.knowledgeBase?.length || 0) + (profile.rules?.length || 0)}
                    </p>
                    <p className="text-xs text-white/30 mt-1">facts & rules stored</p>
                </div>

                {/* Actions */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-white/10">
                            <Crown size={18} className="text-amber-400" />
                        </div>
                        <span className="text-sm text-white/50 font-medium">Free Tier</span>
                    </div>
                    <button
                        onClick={handleClearHistory}
                        className="w-full px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-bold transition-all flex items-center justify-center gap-2"
                    >
                        <Trash2 size={14} />
                        Clear Chat Memory
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`pb-4 px-4 flex items-center gap-3 text-sm font-bold transition-all relative ${activeTab === tab.id ? "text-white" : "text-white/40 hover:text-white/70"
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                        <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs">{tab.count}</span>

                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5"
                                style={{ background: accent }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {/* Knowledge & Rules allow adding */}
                {(activeTab === "knowledge" || activeTab === "rules") && (
                    <div className="mb-6 flex justify-end">
                        <button
                            onClick={() => setShowAdd(!showAdd)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-white transition-all"
                        >
                            {showAdd ? <X size={16} /> : <Plus size={16} />}
                            {showAdd ? "Cancel" : `Add ${activeTab === "knowledge" ? "Fact" : "Rule"}`}
                        </button>
                    </div>
                )}

                <AnimatePresence mode="popLayout">
                    {showAdd && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10 border-l-4"
                            style={{ borderLeftColor: accent }}
                        >
                            <h4 className="text-sm font-bold text-white mb-3">
                                {activeTab === "knowledge" ? "Add New Fact" : "Add Behavioral Rule"}
                            </h4>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    placeholder={activeTab === "knowledge" ? "e.g., Use British spelling." : "e.g., Always suggest breaks after 4 sessions."}
                                    className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-white/20"
                                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                                    autoFocus
                                />
                                <button
                                    onClick={handleAdd}
                                    className="px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all text-white"
                                    style={{ background: accent }}
                                >
                                    Add Memory
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeTab === "knowledge" && (profile.knowledgeBase || []).map((item) => (
                        <MemoryCard
                            key={item.id}
                            content={item.content}
                            meta="Fact"
                            onDelete={() => handleDelete(item.id, "knowledge")}
                            accent={accent}
                        />
                    ))}

                    {activeTab === "rules" && (profile.rules || []).map((item) => (
                        <MemoryCard
                            key={item.id}
                            content={item.rule}
                            meta={`Context: ${item.triggerContext}`}
                            onDelete={() => handleDelete(item.id, "rules")}
                            accent={accent}
                            icon={Gavel}
                        />
                    ))}

                    {activeTab === "history" && (profile.experiences || []).map((item) => (
                        <ExperienceCard
                            key={item.id}
                            experience={item}
                            accent={accent}
                        />
                    ))}

                    {/* Empty States */}
                    {activeTab === "knowledge" && (!profile.knowledgeBase || profile.knowledgeBase.length === 0) && (
                        <EmptyState message="No facts learned yet. Chat with Zeni to teach it!" />
                    )}
                    {activeTab === "rules" && (!profile.rules || profile.rules.length === 0) && (
                        <EmptyState message="No behavioral rules set." />
                    )}
                    {activeTab === "history" && (!profile.experiences || profile.experiences.length === 0) && (
                        <EmptyState message="No recent memories yet. Start a conversation!" />
                    )}
                </div>
            </div>
        </div>
    );
}

function MemoryCard({ content, meta, onDelete, accent, icon: Icon = Brain }: any) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="group relative p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all hover:bg-white/[0.07]"
        >
            <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-white/5 text-white/50" style={{ color: accent }}>
                    <Icon size={18} />
                </div>
                <div className="flex-1">
                    <p className="text-white font-medium leading-relaxed">{content}</p>
                    <p className="text-xs text-white/30 mt-2 uppercase tracking-wide font-bold">{meta}</p>
                </div>
                <button
                    onClick={onDelete}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 text-white/20 hover:text-red-400 transition-all"
                    title="Forget this memory"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </motion.div>
    );
}

function ExperienceCard({ experience, accent }: { experience: AIExperience, accent: string }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all col-span-1 md:col-span-2"
        >
            <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg bg-white/5 ${experience.sentiment === 'positive' ? 'text-green-400' :
                    experience.sentiment === 'negative' ? 'text-red-400' : 'text-blue-400'
                    }`}>
                    <Sparkles size={18} />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-bold">{experience.summary}</h4>
                        <span className="text-xs text-white/30 font-mono">
                            {new Date(experience.timestamp).toLocaleDateString()}
                        </span>
                    </div>

                    {experience.keyLearnings && experience.keyLearnings.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {experience.keyLearnings.map((learned, i) => (
                                <span key={i} className="px-2 py-1 rounded-md bg-white/5 text-xs text-white/60 border border-white/5">
                                    {learned}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="col-span-1 md:col-span-2 py-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
            <p className="text-white/30 italic">{message}</p>
        </div>
    );
}
