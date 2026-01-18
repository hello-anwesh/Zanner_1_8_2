import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Cloud,
    CloudOff,
    RefreshCw,
    Settings,
    AlertCircle,
    CheckCircle,
    LogIn as _LogIn,
    LogOut as _LogOut,
    Crown,
    Lock as _Lock
} from "lucide-react";
import { syncService } from "../services/sync/SyncService";
import { SyncState, SyncConfig } from "../services/sync/types";

interface SyncSettingsPanelProps {
    accent: string;
    isPremium?: boolean;
}

export function SyncSettingsPanel({ accent, isPremium = false }: SyncSettingsPanelProps) {
    const [state, setState] = useState<SyncState>(syncService.getState());
    const [config, setConfig] = useState<SyncConfig>(syncService.getConfig());

    useEffect(() => {
        const unsubscribe = syncService.subscribe(setState);
        return unsubscribe;
    }, []);

    const handleToggleAutoSync = () => {
        syncService.updateConfig({ autoSync: !config.autoSync });
        setConfig(syncService.getConfig());
    };

    const handleForceSync = async () => {
        await syncService.forceSync();
        setState(syncService.getState());
    };

    const formatLastSync = (timestamp: number | null) => {
        if (!timestamp) return "Never";
        const diff = Date.now() - timestamp;
        if (diff < 60000) return "Just now";
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    const getStatusColor = () => {
        switch (state.status) {
            case "success": return "text-green-400";
            case "syncing": return "text-blue-400";
            case "error": return "text-red-400";
            case "offline": return "text-orange-400";
            default: return "text-white/50";
        }
    };

    const getStatusIcon = () => {
        switch (state.status) {
            case "success": return <CheckCircle size={16} />;
            case "syncing": return <RefreshCw size={16} className="animate-spin" />;
            case "error": return <AlertCircle size={16} />;
            case "offline": return <CloudOff size={16} />;
            default: return <Cloud size={16} />;
        }
    };

    if (!isPremium) {
        return (
            <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-amber-500/20">
                        <Crown className="text-amber-400" size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Cloud Sync</h3>
                        <p className="text-sm text-white/50">Premium Feature</p>
                    </div>
                </div>

                <p className="text-white/70 mb-6">
                    Keep your memory and settings synced across all your devices.
                    Access your AI assistant's knowledge anywhere.
                </p>

                <div className="space-y-3 mb-6">
                    {[
                        "Sync across unlimited devices",
                        "Automatic cloud backup",
                        "Offline mode with sync on reconnect",
                        "Conflict resolution"
                    ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 text-white/70">
                            <CheckCircle size={16} className="text-amber-400" />
                            {feature}
                        </div>
                    ))}
                </div>

                <button
                    className="w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2"
                    style={{ background: accent }}
                >
                    <Crown size={18} />
                    Upgrade to Premium
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Status Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/5"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-3">
                        <Cloud size={20} style={{ color: accent }} />
                        Cloud Sync
                    </h3>
                    <div className={`flex items-center gap-2 ${getStatusColor()}`}>
                        {getStatusIcon()}
                        <span className="text-sm font-medium capitalize">{state.status}</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-white/5">
                        <p className="text-xs text-white/50 mb-1">Last Sync</p>
                        <p className="text-sm font-bold text-white">{formatLastSync(state.lastSync)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5">
                        <p className="text-xs text-white/50 mb-1">Pending</p>
                        <p className="text-sm font-bold text-white">{state.pendingChanges}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5">
                        <p className="text-xs text-white/50 mb-1">Conflicts</p>
                        <p className="text-sm font-bold text-white">{state.conflicts.length}</p>
                    </div>
                </div>

                <button
                    onClick={handleForceSync}
                    disabled={state.status === "syncing" || !state.isOnline}
                    className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw size={16} className={state.status === "syncing" ? "animate-spin" : ""} />
                    {state.status === "syncing" ? "Syncing..." : "Sync Now"}
                </button>
            </motion.div>

            {/* Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/5"
            >
                <h4 className="text-sm font-bold text-white/50 mb-4 flex items-center gap-2">
                    <Settings size={16} />
                    Sync Settings
                </h4>

                {/* Auto-sync toggle */}
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                    <div>
                        <p className="text-white font-medium">Auto-sync</p>
                        <p className="text-xs text-white/40">Sync changes automatically</p>
                    </div>
                    <button
                        onClick={handleToggleAutoSync}
                        className={`w-12 h-6 rounded-full transition-all ${config.autoSync ? 'bg-green-500' : 'bg-white/20'
                            }`}
                    >
                        <div className={`w-5 h-5 rounded-full bg-white shadow transition-all ${config.autoSync ? 'ml-6' : 'ml-0.5'
                            }`} />
                    </button>
                </div>

                {/* Sync interval */}
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                    <div>
                        <p className="text-white font-medium">Sync Interval</p>
                        <p className="text-xs text-white/40">How often to sync</p>
                    </div>
                    <select
                        value={config.syncInterval}
                        onChange={(e) => {
                            syncService.updateConfig({ syncInterval: parseInt(e.target.value) });
                            setConfig(syncService.getConfig());
                        }}
                        className="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
                    >
                        <option value={60000}>1 minute</option>
                        <option value={300000}>5 minutes</option>
                        <option value={900000}>15 minutes</option>
                        <option value={1800000}>30 minutes</option>
                    </select>
                </div>

                {/* Conflict resolution */}
                <div className="flex items-center justify-between py-3">
                    <div>
                        <p className="text-white font-medium">Conflict Resolution</p>
                        <p className="text-xs text-white/40">When changes conflict</p>
                    </div>
                    <select
                        value={config.conflictResolution}
                        onChange={(e) => {
                            syncService.updateConfig({
                                conflictResolution: e.target.value as any
                            });
                            setConfig(syncService.getConfig());
                        }}
                        className="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
                    >
                        <option value="local_wins">Keep local changes</option>
                        <option value="remote_wins">Keep cloud changes</option>
                        <option value="manual">Ask me</option>
                    </select>
                </div>
            </motion.div>

            {/* Device Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
            >
                <p className="text-xs text-white/30">
                    Device ID: <code className="font-mono">{config.deviceId.substring(0, 20)}...</code>
                </p>
            </motion.div>
        </div>
    );
}
