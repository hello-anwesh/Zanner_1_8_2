/**
 * Backup Service
 * Provides database backup and restore functionality
 * Uses browser APIs for file download/upload (works in Tauri webview)
 */

import { databaseService } from './DatabaseService';

export interface BackupData {
    version: string;
    createdAt: string;
    device: string;
    tables: {
        sessions: any[];
        journal_entries: any[];
        training_profile: any;
        conversation_messages: any[];
        conversation_summaries: any[];
        rag_documents: any[];
        accountability: any;
    };
    localStorage: {
        aiConfig: any;
        presets: any;
        themeSettings: any;
    };
}

export interface BackupResult {
    success: boolean;
    message: string;
    filePath?: string;
    entryCounts?: {
        sessions: number;
        journalEntries: number;
        conversationMessages: number;
    };
}

class BackupService {
    private readonly BACKUP_VERSION = '2.0.0';

    /**
     * Create a full backup of all app data - downloads as JSON file
     */
    async createBackup(): Promise<BackupResult> {
        try {
            const db = await databaseService.getDb();

            // Fetch all data from SQLite tables
            const sessions = await db.select<any[]>('SELECT * FROM sessions ORDER BY start_time DESC') || [];
            const journalEntries = await db.select<any[]>('SELECT * FROM journal_entries ORDER BY date DESC') || [];

            // These tables may not exist yet - handle gracefully
            let conversationMessages: any[] = [];
            let conversationSummaries: any[] = [];
            let ragDocuments: any[] = [];
            let trainingProfile: any = null;

            try {
                conversationMessages = await db.select<any[]>('SELECT * FROM conversation_messages ORDER BY timestamp DESC') || [];
            } catch { console.warn('[Backup] conversation_messages table not found'); }

            try {
                conversationSummaries = await db.select<any[]>('SELECT * FROM conversation_summaries ORDER BY created_at DESC') || [];
            } catch { console.warn('[Backup] conversation_summaries table not found'); }

            try {
                ragDocuments = await db.select<any[]>('SELECT * FROM rag_documents') || [];
            } catch { console.warn('[Backup] rag_documents table not found'); }

            try {
                const profileResult = await db.select<any[]>('SELECT * FROM training_profile WHERE id = "default"') || [];
                trainingProfile = profileResult.length > 0 ? JSON.parse(profileResult[0].profile_json) : null;
            } catch { console.warn('[Backup] training_profile table not found'); }

            // Collect localStorage data
            const aiConfig = localStorage.getItem('ai-service-config');
            const presets = localStorage.getItem('timerPresets');
            const themeSettings = localStorage.getItem('zenner-theme');
            const accountability = localStorage.getItem('chronos_accountability');

            const backup: BackupData = {
                version: this.BACKUP_VERSION,
                createdAt: new Date().toISOString(),
                device: navigator.userAgent,
                tables: {
                    sessions,
                    journal_entries: journalEntries,
                    training_profile: trainingProfile,
                    conversation_messages: conversationMessages,
                    conversation_summaries: conversationSummaries,
                    rag_documents: ragDocuments,
                    accountability: accountability ? JSON.parse(accountability) : null
                },
                localStorage: {
                    aiConfig: aiConfig ? JSON.parse(aiConfig) : null,
                    presets: presets ? JSON.parse(presets) : null,
                    themeSettings: themeSettings ? JSON.parse(themeSettings) : null
                }
            };

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
            const filename = `zenner_backup_${timestamp}.json`;

            // Create blob and download via browser
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Mark backup date
            localStorage.setItem('zenner_last_backup_date', new Date().toISOString());

            console.log('[BackupService] Backup created successfully');

            return {
                success: true,
                message: `Backup saved: ${filename}`,
                filePath: filename,
                entryCounts: {
                    sessions: sessions.length,
                    journalEntries: journalEntries.length,
                    conversationMessages: conversationMessages.length
                }
            };
        } catch (error) {
            console.error('[BackupService] Backup failed:', error);
            return {
                success: false,
                message: `Backup failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }

    /**
     * Restore data from a backup file - opens file picker
     */
    async restoreBackup(): Promise<BackupResult> {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';

            input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) {
                    resolve({ success: false, message: 'No file selected' });
                    return;
                }

                try {
                    const content = await file.text();
                    const backup: BackupData = JSON.parse(content);

                    // Validate backup format
                    if (!backup.version || !backup.tables) {
                        resolve({ success: false, message: 'Invalid backup file format' });
                        return;
                    }

                    const db = await databaseService.getDb();

                    // Restore sessions
                    if (backup.tables.sessions && backup.tables.sessions.length > 0) {
                        for (const session of backup.tables.sessions) {
                            try {
                                await db.execute(
                                    `INSERT OR REPLACE INTO sessions (id, start_time, end_time, mode, duration_minutes, actual_duration_seconds, status, notes)
                                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                                    [session.id, session.start_time, session.end_time, session.mode,
                                    session.duration_minutes, session.actual_duration_seconds, session.status, session.notes]
                                );
                            } catch (err) {
                                console.warn('Failed to restore session:', session.id, err);
                            }
                        }
                    }

                    // Restore journal entries
                    if (backup.tables.journal_entries && backup.tables.journal_entries.length > 0) {
                        for (const entry of backup.tables.journal_entries) {
                            try {
                                await db.execute(
                                    `INSERT OR REPLACE INTO journal_entries (id, date, content, mood, tags, created_at, updated_at)
                                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                                    [entry.id, entry.date, entry.content, entry.mood,
                                    typeof entry.tags === 'object' ? JSON.stringify(entry.tags) : entry.tags,
                                    entry.created_at, entry.updated_at]
                                );
                            } catch (err) {
                                console.warn('Failed to restore journal entry:', entry.date, err);
                            }
                        }
                    }

                    // Restore conversation messages
                    if (backup.tables.conversation_messages && backup.tables.conversation_messages.length > 0) {
                        for (const msg of backup.tables.conversation_messages) {
                            try {
                                await db.execute(
                                    `INSERT OR REPLACE INTO conversation_messages (id, role, content, timestamp)
                                     VALUES (?, ?, ?, ?)`,
                                    [msg.id, msg.role, msg.content, msg.timestamp]
                                );
                            } catch (err) {
                                console.warn('Failed to restore conversation message:', msg.id, err);
                            }
                        }
                    }

                    // Restore training profile
                    if (backup.tables.training_profile) {
                        try {
                            await db.execute(
                                `INSERT OR REPLACE INTO training_profile (id, profile_json, updated_at)
                                 VALUES ('default', ?, ?)`,
                                [JSON.stringify(backup.tables.training_profile), Date.now()]
                            );
                        } catch (err) {
                            console.warn('Failed to restore training profile:', err);
                        }
                    }

                    // Restore localStorage items
                    if (backup.localStorage.aiConfig) {
                        localStorage.setItem('ai-service-config', JSON.stringify(backup.localStorage.aiConfig));
                    }
                    if (backup.localStorage.presets) {
                        localStorage.setItem('timerPresets', JSON.stringify(backup.localStorage.presets));
                    }
                    if (backup.localStorage.themeSettings) {
                        localStorage.setItem('zenner-theme', JSON.stringify(backup.localStorage.themeSettings));
                    }
                    if (backup.tables.accountability) {
                        localStorage.setItem('chronos_accountability', JSON.stringify(backup.tables.accountability));
                    }

                    console.log('[BackupService] Restore completed successfully');

                    resolve({
                        success: true,
                        message: `Restored ${backup.tables.sessions?.length || 0} sessions, ${backup.tables.journal_entries?.length || 0} journal entries. Reload app to see changes.`,
                        entryCounts: {
                            sessions: backup.tables.sessions?.length || 0,
                            journalEntries: backup.tables.journal_entries?.length || 0,
                            conversationMessages: backup.tables.conversation_messages?.length || 0
                        }
                    });
                } catch (error) {
                    console.error('[BackupService] Restore failed:', error);
                    resolve({
                        success: false,
                        message: `Restore failed: ${error instanceof Error ? error.message : String(error)}`
                    });
                }
            };

            input.click();
        });
    }

    /**
     * Get backup info (when was last backup, etc.)
     */
    async getBackupStatus(): Promise<{
        lastBackup: string | null;
        dataStats: {
            sessions: number;
            journalEntries: number;
            conversationMessages: number;
            trainingKnowledge: number;
        }
    }> {
        try {
            const db = await databaseService.getDb();

            const sessionCount = await db.select<{ count: number }[]>('SELECT COUNT(*) as count FROM sessions');
            const journalCount = await db.select<{ count: number }[]>('SELECT COUNT(*) as count FROM journal_entries');

            let conversationCount = 0;
            let trainingCount = 0;

            try {
                const msgCount = await db.select<{ count: number }[]>('SELECT COUNT(*) as count FROM conversation_messages');
                conversationCount = msgCount?.[0]?.count || 0;
            } catch { /* table may not exist */ }

            try {
                const profileResult = await db.select<any[]>('SELECT profile_json FROM training_profile WHERE id = "default"');
                if (profileResult && profileResult.length > 0) {
                    const profile = JSON.parse(profileResult[0].profile_json);
                    trainingCount = profile.knowledgeBase?.length || 0;
                }
            } catch { /* table may not exist */ }

            const lastBackup = localStorage.getItem('zenner_last_backup_date');

            return {
                lastBackup,
                dataStats: {
                    sessions: sessionCount?.[0]?.count || 0,
                    journalEntries: journalCount?.[0]?.count || 0,
                    conversationMessages: conversationCount,
                    trainingKnowledge: trainingCount
                }
            };
        } catch (error) {
            return {
                lastBackup: null,
                dataStats: { sessions: 0, journalEntries: 0, conversationMessages: 0, trainingKnowledge: 0 }
            };
        }
    }

    /**
     * Export just to localStorage as quick backup (auto-backup)
     */
    async autoBackup(): Promise<void> {
        try {
            const db = await databaseService.getDb();

            // Simplified backup - just core data
            const sessions = await db.select<any[]>('SELECT * FROM sessions') || [];
            const journalEntries = await db.select<any[]>('SELECT * FROM journal_entries') || [];

            const backup = {
                version: this.BACKUP_VERSION,
                createdAt: new Date().toISOString(),
                sessions,
                journalEntries
            };

            // Store in localStorage (limited but works as emergency backup)
            localStorage.setItem('zenner_auto_backup', JSON.stringify(backup));
            localStorage.setItem('zenner_last_backup_date', new Date().toISOString());

            console.log('[BackupService] Auto-backup completed');
        } catch (error) {
            console.error('[BackupService] Auto-backup failed:', error);
        }
    }
}

export const backupService = new BackupService();
