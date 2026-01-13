/**
 * Backup Settings View
 * Manage database backups, exports, and data safety
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    HardDrive, Download, Upload, RefreshCw, Shield,
    Database, FileJson, CheckCircle, AlertCircle, Clock
} from 'lucide-react';
import { backupService } from '../../services/db/BackupService';

interface BackupSettingsViewProps {
    accent: string;
}

interface BackupStats {
    lastBackup: string | null;
    dataStats: {
        sessions: number;
        journalEntries: number;
        conversationMessages: number;
        trainingKnowledge: number;
    };
}

export function BackupSettingsView({ accent }: BackupSettingsViewProps) {
    const [stats, setStats] = useState<BackupStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionStatus, setActionStatus] = useState<{
        type: 'success' | 'error' | null;
        message: string;
    }>({ type: null, message: '' });
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        try {
            const status = await backupService.getBackupStatus();
            setStats(status);
        } catch (error) {
            console.error('Failed to load backup stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        setActionStatus({ type: null, message: '' });

        try {
            const result = await backupService.createBackup();
            if (result.success) {
                setActionStatus({
                    type: 'success',
                    message: `✓ ${result.message} (${result.entryCounts?.sessions} sessions, ${result.entryCounts?.journalEntries} journal entries)`
                });
                loadStats(); // Refresh stats
            } else {
                setActionStatus({ type: 'error', message: result.message });
            }
        } catch (error) {
            setActionStatus({
                type: 'error',
                message: `Export failed: ${error instanceof Error ? error.message : String(error)}`
            });
        } finally {
            setIsExporting(false);
        }
    };

    const handleImport = async () => {
        setIsImporting(true);
        setActionStatus({ type: null, message: '' });

        try {
            const result = await backupService.restoreBackup();
            if (result.success) {
                setActionStatus({ type: 'success', message: `✓ ${result.message}` });
                loadStats(); // Refresh stats
            } else {
                setActionStatus({ type: 'error', message: result.message });
            }
        } catch (error) {
            setActionStatus({
                type: 'error',
                message: `Import failed: ${error instanceof Error ? error.message : String(error)}`
            });
        } finally {
            setIsImporting(false);
        }
    };

    const formatDate = (isoString: string | null) => {
        if (!isoString) return 'Never';
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Unknown';
        }
    };

    return (
        <div className="min-h-full p-8 pb-16">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <div className="flex items-center gap-4 mb-3">
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center"
                            style={{ background: `${accent}15` }}
                        >
                            <HardDrive size={28} style={{ color: accent }} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Backup & Data</h1>
                            <p className="text-white/50">Protect your data with exports and backups</p>
                        </div>
                    </div>
                </motion.div>

                {/* Status Message */}
                {actionStatus.type && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${actionStatus.type === 'success'
                            ? 'bg-emerald-500/10 border border-emerald-500/30'
                            : 'bg-red-500/10 border border-red-500/30'
                            }`}
                    >
                        {actionStatus.type === 'success'
                            ? <CheckCircle size={20} className="text-emerald-400" />
                            : <AlertCircle size={20} className="text-red-400" />
                        }
                        <span className={actionStatus.type === 'success' ? 'text-emerald-300' : 'text-red-300'}>
                            {actionStatus.message}
                        </span>
                    </motion.div>
                )}

                {/* Data Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 mb-6"
                >
                    <div className="flex items-center gap-3 mb-5">
                        <Database size={20} style={{ color: accent }} />
                        <h2 className="text-lg font-semibold text-white">Your Data</h2>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <RefreshCw className="animate-spin text-white/30" size={24} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/[0.03] rounded-xl p-4">
                                <div className="text-2xl font-bold text-white">
                                    {stats?.dataStats.sessions || 0}
                                </div>
                                <div className="text-sm text-white/40">Sessions</div>
                            </div>
                            <div className="bg-white/[0.03] rounded-xl p-4">
                                <div className="text-2xl font-bold text-white">
                                    {stats?.dataStats.journalEntries || 0}
                                </div>
                                <div className="text-sm text-white/40">Journal Entries</div>
                            </div>
                            <div className="bg-white/[0.03] rounded-xl p-4">
                                <div className="text-2xl font-bold text-white">
                                    {stats?.dataStats.conversationMessages || 0}
                                </div>
                                <div className="text-sm text-white/40">Messages</div>
                            </div>
                            <div className="bg-white/[0.03] rounded-xl p-4">
                                <div className="text-2xl font-bold text-white">
                                    {stats?.dataStats.trainingKnowledge || 0}
                                </div>
                                <div className="text-sm text-white/40">AI Knowledge</div>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-2 text-sm text-white/40">
                        <Clock size={14} />
                        <span>Last backup: {formatDate(stats?.lastBackup || null)}</span>
                    </div>
                </motion.div>

                {/* Export/Import Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
                >
                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.15] rounded-2xl p-6 text-left transition-all group disabled:opacity-50"
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{ background: `${accent}15` }}
                            >
                                {isExporting ? (
                                    <RefreshCw size={22} className="animate-spin" style={{ color: accent }} />
                                ) : (
                                    <Download size={22} style={{ color: accent }} />
                                )}
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-white mb-1">
                                    {isExporting ? 'Exporting...' : 'Export Backup'}
                                </h3>
                                <p className="text-sm text-white/40">
                                    Download all your data as a JSON file
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* Import Button */}
                    <button
                        onClick={handleImport}
                        disabled={isImporting}
                        className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.15] rounded-2xl p-6 text-left transition-all group disabled:opacity-50"
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-500/10"
                            >
                                {isImporting ? (
                                    <RefreshCw size={22} className="animate-spin text-orange-400" />
                                ) : (
                                    <Upload size={22} className="text-orange-400" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-white mb-1">
                                    {isImporting ? 'Importing...' : 'Import Backup'}
                                </h3>
                                <p className="text-sm text-white/40">
                                    Restore data from a backup file
                                </p>
                            </div>
                        </div>
                    </button>
                </motion.div>

                {/* Security Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Shield size={20} className="text-emerald-400" />
                        <h2 className="text-lg font-semibold text-white">Data Safety</h2>
                    </div>

                    <div className="space-y-3 text-sm text-white/50">
                        <div className="flex items-start gap-3">
                            <FileJson size={16} className="text-white/30 mt-0.5 shrink-0" />
                            <p>Backups are saved as JSON files on your device. They contain your sessions, journal entries, AI training data, and conversation history.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Database size={16} className="text-white/30 mt-0.5 shrink-0" />
                            <p>Your data is stored locally in SQLite - it never leaves your device unless you choose to export it.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Shield size={16} className="text-white/30 mt-0.5 shrink-0" />
                            <p>We recommend creating regular backups, especially before updates or when switching devices.</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
