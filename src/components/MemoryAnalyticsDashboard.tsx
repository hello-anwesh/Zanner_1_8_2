import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    BarChart2,
    Download,
    Cloud,
    CloudOff,
    RefreshCw,
    TrendingUp,
    Zap,
    MessageSquare,
    Brain,
    Crown,
    Lock
} from "lucide-react";
import { memoryAnalyticsService } from "../services/ai/MemoryAnalyticsService";
import { memoryExportService } from "../services/ai/MemoryExportService";
import { syncService } from "../services/sync/SyncService";
import { cacheService } from "../services/ai/CacheService";

interface MemoryAnalyticsDashboardProps {
    accent: string;
    isPremium?: boolean;
}

export function MemoryAnalyticsDashboard({ accent, isPremium = false }: MemoryAnalyticsDashboardProps) {
    const [summary, setSummary] = useState(memoryAnalyticsService.getSummary());
    const [chartData, setChartData] = useState(memoryAnalyticsService.getChartData(7));
    const [breakdown, setBreakdown] = useState(memoryAnalyticsService.getMemoryBreakdown());
    const [syncState, setSyncState] = useState(syncService.getState());
    const [isExporting, setIsExporting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        // Subscribe to sync state changes
        const unsubscribe = syncService.subscribe(setSyncState);
        return unsubscribe;
    }, []);

    const refresh = () => {
        setSummary(memoryAnalyticsService.getSummary());
        setChartData(memoryAnalyticsService.getChartData(7));
        setBreakdown(memoryAnalyticsService.getMemoryBreakdown());
    };

    const handleExport = async (format: "json" | "csv" | "markdown") => {
        if (!isPremium) return;

        setIsExporting(true);
        try {
            await memoryExportService.downloadExport({ format });
        } catch (e) {
            console.error("Export failed:", e);
        } finally {
            setIsExporting(false);
        }
    };

    const handleSync = async () => {
        if (!isPremium) return;

        setIsSyncing(true);
        try {
            await syncService.forceSync();
        } catch (e) {
            console.error("Sync failed:", e);
        } finally {
            setIsSyncing(false);
        }
    };

    // Calculate max for chart scaling
    const maxMessages = Math.max(...chartData.messages, 1);
    const cacheStats = cacheService.getStats();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl" style={{ background: `${accent}20` }}>
                        <BarChart2 size={24} style={{ color: accent }} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Memory Analytics</h3>
                        <p className="text-sm text-white/50">Track your AI usage and costs</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Sync Status */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${syncState.isOnline ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                        {syncState.isOnline ? <Cloud size={14} /> : <CloudOff size={14} />}
                        {syncState.isOnline ? 'Online' : 'Offline'}
                    </div>

                    <button
                        onClick={refresh}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Today's Messages */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-white/5 border border-white/5"
                >
                    <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
                        <MessageSquare size={14} />
                        Today
                    </div>
                    <p className="text-3xl font-black text-white">{summary.today.messagesCount}</p>
                    <p className="text-xs text-white/30 mt-1">messages</p>
                </motion.div>

                {/* Week's Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-5 rounded-2xl bg-white/5 border border-white/5"
                >
                    <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
                        <TrendingUp size={14} />
                        This Week
                    </div>
                    <p className="text-3xl font-black text-white">{summary.thisWeek.messages}</p>
                    <p className="text-xs text-white/30 mt-1">messages</p>
                </motion.div>

                {/* Tokens Used */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-5 rounded-2xl bg-white/5 border border-white/5"
                >
                    <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
                        <Zap size={14} />
                        Tokens (Month)
                    </div>
                    <p className="text-3xl font-black text-white">
                        {(summary.thisMonth.tokens / 1000).toFixed(1)}k
                    </p>
                    <p className="text-xs text-white/30 mt-1">~${summary.costEstimate.estimatedCost}</p>
                </motion.div>

                {/* Memory Items */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-5 rounded-2xl bg-white/5 border border-white/5"
                >
                    <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
                        <Brain size={14} />
                        Memory
                    </div>
                    <p className="text-3xl font-black text-white">
                        {breakdown.facts + breakdown.rules + breakdown.experiences}
                    </p>
                    <p className="text-xs text-white/30 mt-1">items stored</p>
                </motion.div>
            </div>

            {/* Activity Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/5"
            >
                <h4 className="text-sm font-bold text-white/50 mb-4">7-Day Activity</h4>
                <div className="flex items-end justify-between gap-2 h-32">
                    {chartData.dates.map((day, i) => (
                        <div key={day} className="flex-1 flex flex-col items-center gap-2">
                            <div
                                className="w-full rounded-t-lg transition-all duration-500"
                                style={{
                                    height: `${(chartData.messages[i] / maxMessages) * 100}%`,
                                    minHeight: chartData.messages[i] > 0 ? '8px' : '2px',
                                    background: chartData.messages[i] > 0 ? accent : 'rgba(255,255,255,0.1)'
                                }}
                            />
                            <span className="text-xs text-white/30">{day}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Memory Breakdown */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/5"
            >
                <h4 className="text-sm font-bold text-white/50 mb-4">Memory Breakdown</h4>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {[
                        { label: "Facts", value: breakdown.facts, color: accent },
                        { label: "Rules", value: breakdown.rules, color: "#f59e0b" },
                        { label: "Experiences", value: breakdown.experiences, color: "#8b5cf6" },
                        { label: "Messages", value: breakdown.conversations, color: "#10b981" },
                        { label: "Summaries", value: breakdown.summaries, color: "#ec4899" },
                        { label: "Preferences", value: breakdown.preferences, color: "#06b6d4" }
                    ].map(item => (
                        <div key={item.label} className="text-center">
                            <div
                                className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center text-xl font-black mb-2"
                                style={{ background: `${item.color}20`, color: item.color }}
                            >
                                {item.value}
                            </div>
                            <p className="text-xs text-white/50">{item.label}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Cache Performance */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/5"
            >
                <h4 className="text-sm font-bold text-white/50 mb-4">Cache Performance</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-white/50 mb-1">Embedding Cache</p>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${cacheStats.embeddingHitRate * 100}%`,
                                        background: accent
                                    }}
                                />
                            </div>
                            <span className="text-sm font-bold text-white">
                                {Math.round(cacheStats.embeddingHitRate * 100)}%
                            </span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-white/50 mb-1">Retrieval Cache</p>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${cacheStats.retrievalHitRate * 100}%`,
                                        background: accent
                                    }}
                                />
                            </div>
                            <span className="text-sm font-bold text-white">
                                {Math.round(cacheStats.retrievalHitRate * 100)}%
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Export & Sync Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
            >
                <div className="flex items-center gap-3 mb-4">
                    <Crown className="text-amber-400" size={20} />
                    <h4 className="text-sm font-bold text-white">Premium Features</h4>
                    {!isPremium && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-bold">
                            UPGRADE
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Export JSON */}
                    <button
                        onClick={() => handleExport("json")}
                        disabled={!isPremium || isExporting}
                        className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${isPremium
                                ? 'bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer'
                                : 'bg-white/[0.02] border-white/5 cursor-not-allowed opacity-50'
                            }`}
                    >
                        {!isPremium && <Lock size={12} className="absolute top-2 right-2 text-white/30" />}
                        <Download size={20} className="text-white/70" />
                        <span className="text-xs text-white/70">Export JSON</span>
                    </button>

                    {/* Export CSV */}
                    <button
                        onClick={() => handleExport("csv")}
                        disabled={!isPremium || isExporting}
                        className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${isPremium
                                ? 'bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer'
                                : 'bg-white/[0.02] border-white/5 cursor-not-allowed opacity-50'
                            }`}
                    >
                        <Download size={20} className="text-white/70" />
                        <span className="text-xs text-white/70">Export CSV</span>
                    </button>

                    {/* Export Markdown */}
                    <button
                        onClick={() => handleExport("markdown")}
                        disabled={!isPremium || isExporting}
                        className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${isPremium
                                ? 'bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer'
                                : 'bg-white/[0.02] border-white/5 cursor-not-allowed opacity-50'
                            }`}
                    >
                        <Download size={20} className="text-white/70" />
                        <span className="text-xs text-white/70">Export MD</span>
                    </button>

                    {/* Cloud Sync */}
                    <button
                        onClick={handleSync}
                        disabled={!isPremium || isSyncing}
                        className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${isPremium
                                ? 'bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer'
                                : 'bg-white/[0.02] border-white/5 cursor-not-allowed opacity-50'
                            }`}
                    >
                        <Cloud size={20} className={`text-white/70 ${isSyncing ? 'animate-pulse' : ''}`} />
                        <span className="text-xs text-white/70">
                            {isSyncing ? 'Syncing...' : 'Sync Now'}
                        </span>
                    </button>
                </div>

                {/* Sync Status */}
                {isPremium && syncState.lastSync && (
                    <p className="text-xs text-white/30 mt-4 text-center">
                        Last synced: {new Date(syncState.lastSync).toLocaleString()}
                        {syncState.pendingChanges > 0 && (
                            <span className="ml-2 text-amber-400">
                                ({syncState.pendingChanges} pending)
                            </span>
                        )}
                    </p>
                )}

                {/* Upgrade CTA */}
                {!isPremium && (
                    <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                        <p className="text-sm text-white/70 text-center">
                            Unlock analytics export, cloud sync, and more with{" "}
                            <span className="text-amber-400 font-bold">Premium</span>
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
