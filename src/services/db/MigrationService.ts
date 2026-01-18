import Database from '@tauri-apps/plugin-sql';
import { databaseService } from './DatabaseService';

interface LocalStorageData {
    conversations: any[];
    trainingProfile: any;
    ragIndex: any[];
    aiConfig: any;
}

/**
 * Migration Service
 * Handles migration from localStorage to SQLite
 */
class MigrationService {
    private readonly MIGRATION_KEY = 'zenner_migration_status';
    private readonly DEFAULT_USER_ID = 'default_user';

    /**
     * Check if migration has been completed
     */
    hasMigrated(): boolean {
        const status = localStorage.getItem(this.MIGRATION_KEY);
        return status === 'completed';
    }

    /**
     * Mark migration as completed
     */
    private markMigrationComplete() {
        localStorage.setItem(this.MIGRATION_KEY, 'completed');
        localStorage.setItem('zenner_migration_date', new Date().toISOString());
    }

    /**
     * Backup localStorage data before migration
     */
    private backupLocalStorage(): LocalStorageData {
        const backup: LocalStorageData = {
            conversations: [],
            trainingProfile: null,
            ragIndex: [],
            aiConfig: null
        };

        try {
            // Backup conversations
            const sessionsData = localStorage.getItem('zenner_sessions');
            if (sessionsData) {
                backup.conversations = JSON.parse(sessionsData);
            }

            // Backup training profile
            const trainingData = localStorage.getItem('chronos_ai_training_profile');
            if (trainingData) {
                backup.trainingProfile = JSON.parse(trainingData);
            }

            // Backup RAG index
            const ragData = localStorage.getItem('zenner_rag_index_v1');
            if (ragData) {
                backup.ragIndex = JSON.parse(ragData);
            }

            // Backup AI config
            const aiConfigData = localStorage.getItem('ai_config');
            if (aiConfigData) {
                backup.aiConfig = JSON.parse(aiConfigData);
            }

            // Save backup to localStorage with timestamp
            localStorage.setItem(
                'zenner_migration_backup',
                JSON.stringify({
                    timestamp: Date.now(),
                    data: backup
                })
            );

            console.log('[Migration] Backup created successfully');
            return backup;
        } catch (error) {
            console.error('[Migration] Backup failed:', error);
            throw new Error('Failed to create backup. Migration aborted.');
        }
    }

    /**
     * Migrate conversations from localStorage to SQLite
     */
    private async migrateConversations(db: Database, conversations: any[]): Promise<number> {
        let migrated = 0;

        for (const session of conversations) {
            try {
                const conversationId = session.id || `conv_${Date.now()}_${Math.random()}`;
                const createdAt = session.createdAt || Date.now();
                const updatedAt = createdAt;
                const mode = session.mode || 'productivity';
                const title = session.title || 'Untitled Chat';

                // Insert conversation (use OR IGNORE to skip if already exists)
                await db.execute(
                    `INSERT OR IGNORE INTO conversations (id, user_id, title, created_at, updated_at, mode, message_count, total_tokens)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [conversationId, this.DEFAULT_USER_ID, title, createdAt, updatedAt, mode, session.messages?.length || 0, 0]
                );

                // Insert messages
                if (session.messages && Array.isArray(session.messages)) {
                    for (const msg of session.messages) {
                        const messageId = msg.id || `msg_${Date.now()}_${Math.random()}`;
                        const timestamp = msg.timestamp || Date.now();
                        const role = msg.role || 'user';
                        const content = msg.content || '';

                        await db.execute(
                            `INSERT OR IGNORE INTO messages (id, conversation_id, role, content, timestamp, tokens_used)
                             VALUES (?, ?, ?, ?, ?, ?)`,
                            [messageId, conversationId, role, content, timestamp, null]
                        );
                    }
                }

                migrated++;
            } catch (error) {
                console.error('[Migration] Failed to migrate conversation:', session.id, error);
            }
        }

        console.log(`[Migration] Migrated ${migrated} conversations`);
        return migrated;
    }

    /**
     * Migrate training profile (memory items, experiences, rules) to SQLite
     */
    private async migrateTrainingProfile(db: Database, profile: any): Promise<void> {
        if (!profile) return;

        try {
            // Migrate knowledge base (memory items)
            if (profile.knowledgeBase && Array.isArray(profile.knowledgeBase)) {
                for (const item of profile.knowledgeBase) {
                    const id = item.id || `mem_${Date.now()}_${Math.random()}`;
                    const category = item.category || 'fact';
                    const content = item.content || '';
                    const createdAt = item.lastUpdated || Date.now();

                    await db.execute(
                        `INSERT OR IGNORE INTO memory_items (id, user_id, category, content, created_at, last_accessed, access_count)
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [id, this.DEFAULT_USER_ID, category, content, createdAt, null, 0]
                    );
                }
                console.log(`[Migration] Migrated ${profile.knowledgeBase.length} memory items`);
            }

            // Migrate experiences
            if (profile.experiences && Array.isArray(profile.experiences)) {
                for (const exp of profile.experiences) {
                    const id = exp.id || `exp_${Date.now()}_${Math.random()}`;
                    const summary = exp.summary || '';
                    const sentiment = exp.sentiment || 'neutral';
                    const keyLearnings = JSON.stringify(exp.keyLearnings || []);
                    const timestamp = exp.timestamp || Date.now();

                    await db.execute(
                        `INSERT OR IGNORE INTO experiences (id, user_id, summary, sentiment, key_learnings, timestamp)
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [id, this.DEFAULT_USER_ID, summary, sentiment, keyLearnings, timestamp]
                    );
                }
                console.log(`[Migration] Migrated ${profile.experiences.length} experiences`);
            }

            // Migrate rules
            if (profile.rules && Array.isArray(profile.rules)) {
                for (const rule of profile.rules) {
                    const id = rule.id || `rule_${Date.now()}_${Math.random()}`;
                    const ruleText = rule.rule || '';
                    const triggerContext = rule.triggerContext || 'general';
                    const isActive = rule.isActive !== undefined ? rule.isActive : true;
                    const createdAt = Date.now();

                    await db.execute(
                        `INSERT OR IGNORE INTO rules (id, user_id, rule, trigger_context, is_active, created_at)
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [id, this.DEFAULT_USER_ID, ruleText, triggerContext, isActive ? 1 : 0, createdAt]
                    );
                }
                console.log(`[Migration] Migrated ${profile.rules.length} rules`);
            }
        } catch (error) {
            console.error('[Migration] Failed to migrate training profile:', error);
            throw error;
        }
    }

    /**
     * Migrate RAG index to SQLite
     */
    private async migrateRAGIndex(db: Database, ragDocs: any[]): Promise<void> {
        if (!ragDocs || !Array.isArray(ragDocs)) return;

        try {
            for (const doc of ragDocs) {
                const id = doc.id || `rag_${Date.now()}_${Math.random()}`;
                const content = doc.content || '';
                const embedding = doc.embedding ? JSON.stringify(doc.embedding) : null;
                const metadata = JSON.stringify(doc.metadata || {});
                const docType = doc.metadata?.type || 'preset';
                const now = Date.now();

                await db.execute(
                    `INSERT OR IGNORE INTO rag_documents (id, content, embedding, metadata, doc_type, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [id, content, embedding, metadata, docType, now, now]
                );
            }
            console.log(`[Migration] Migrated ${ragDocs.length} RAG documents`);
        } catch (error) {
            console.error('[Migration] Failed to migrate RAG index:', error);
            throw error;
        }
    }

    /**
     * Main migration function
     */
    async migrate(): Promise<{ success: boolean, message: string, stats: any }> {
        // Check if already migrated
        if (this.hasMigrated()) {
            return {
                success: true,
                message: 'Migration already completed',
                stats: null
            };
        }

        console.log('[Migration] Starting migration from localStorage to SQLite...');

        try {
            // Step 1: Backup
            console.log('[Migration] Step 1: Creating backup...');
            const backup = this.backupLocalStorage();

            // Step 2: Get database
            console.log('[Migration] Step 2: Connecting to database...');
            const db = await databaseService.getDb();

            // Step 3: Migrate conversations
            console.log('[Migration] Step 3: Migrating conversations...');
            const conversationCount = await this.migrateConversations(db, backup.conversations);

            // Step 4: Migrate training profile
            console.log('[Migration] Step 4: Migrating training profile...');
            await this.migrateTrainingProfile(db, backup.trainingProfile);

            // Step 5: Migrate RAG index
            console.log('[Migration] Step 5: Migrating RAG index...');
            await this.migrateRAGIndex(db, backup.ragIndex);

            // Step 6: Mark as complete
            console.log('[Migration] Step 6: Finalizing...');
            this.markMigrationComplete();

            const stats = {
                conversations: conversationCount,
                memoryItems: backup.trainingProfile?.knowledgeBase?.length || 0,
                experiences: backup.trainingProfile?.experiences?.length || 0,
                rules: backup.trainingProfile?.rules?.length || 0,
                ragDocuments: backup.ragIndex?.length || 0
            };

            console.log('[Migration] Migration completed successfully!', stats);

            return {
                success: true,
                message: 'Migration completed successfully',
                stats
            };
        } catch (error) {
            console.error('[Migration] Migration failed:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
                stats: null
            };
        }
    }

    /**
     * Rollback migration (restore from backup)
     */
    async rollback(): Promise<boolean> {
        try {
            const backupData = localStorage.getItem('zenner_migration_backup');
            if (!backupData) {
                console.error('[Migration] No backup found');
                return false;
            }

            const { data } = JSON.parse(backupData);

            // Restore localStorage
            if (data.conversations) {
                localStorage.setItem('zenner_sessions', JSON.stringify(data.conversations));
            }
            if (data.trainingProfile) {
                localStorage.setItem('chronos_ai_training_profile', JSON.stringify(data.trainingProfile));
            }
            if (data.ragIndex) {
                localStorage.setItem('zenner_rag_index_v1', JSON.stringify(data.ragIndex));
            }
            if (data.aiConfig) {
                localStorage.setItem('ai_config', JSON.stringify(data.aiConfig));
            }

            // Clear migration status
            localStorage.removeItem(this.MIGRATION_KEY);
            localStorage.removeItem('zenner_migration_date');

            console.log('[Migration] Rollback completed successfully');
            return true;
        } catch (error) {
            console.error('[Migration] Rollback failed:', error);
            return false;
        }
    }
}

export const migrationService = new MigrationService();
