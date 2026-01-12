/**
 * Sync Service
 * Handles cloud synchronization with offline support
 * Works with any backend (Supabase, Firebase, custom)
 */

import {
    SyncConfig,
    SyncState,
    SyncResult,
    SyncConflict,
    OfflineQueueItem,
    DEFAULT_SYNC_CONFIG
} from "./types";

const CONFIG_KEY = "zenner_sync_config";
const QUEUE_KEY = "zenner_offline_queue";
const STATE_KEY = "zenner_sync_state";

class SyncService {
    private config: SyncConfig;
    private state: SyncState;
    private offlineQueue: OfflineQueueItem[] = [];
    private syncTimer: ReturnType<typeof setInterval> | null = null;
    private listeners: Set<(state: SyncState) => void> = new Set();

    // Backend adapter - to be implemented when connecting to actual backend
    private backend: SyncBackendAdapter | null = null;

    constructor() {
        this.config = this.loadConfig();
        this.state = this.loadState();
        this.offlineQueue = this.loadQueue();

        // Generate device ID if needed
        if (!this.config.deviceId) {
            this.config.deviceId = this.generateDeviceId();
            this.saveConfig();
        }

        // Monitor online status
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => this.handleOnlineStatus(true));
            window.addEventListener('offline', () => this.handleOnlineStatus(false));
            this.state.isOnline = navigator.onLine;
        }
    }

    /**
     * Load configuration from storage
     */
    private loadConfig(): SyncConfig {
        try {
            const stored = localStorage.getItem(CONFIG_KEY);
            return stored ? { ...DEFAULT_SYNC_CONFIG, ...JSON.parse(stored) } : DEFAULT_SYNC_CONFIG;
        } catch {
            return DEFAULT_SYNC_CONFIG;
        }
    }

    /**
     * Save configuration to storage
     */
    private saveConfig(): void {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(this.config));
    }

    /**
     * Load state from storage
     */
    private loadState(): SyncState {
        try {
            const stored = localStorage.getItem(STATE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch { }

        return {
            status: "idle",
            lastSync: null,
            pendingChanges: 0,
            conflicts: [],
            isOnline: true
        };
    }

    /**
     * Save state to storage
     */
    private saveState(): void {
        localStorage.setItem(STATE_KEY, JSON.stringify(this.state));
        this.notifyListeners();
    }

    /**
     * Load offline queue from storage
     */
    private loadQueue(): OfflineQueueItem[] {
        try {
            const stored = localStorage.getItem(QUEUE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    /**
     * Save offline queue to storage
     */
    private saveQueue(): void {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(this.offlineQueue));
        this.state.pendingChanges = this.offlineQueue.length;
        this.saveState();
    }

    /**
     * Generate unique device ID
     */
    private generateDeviceId(): string {
        return `device_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }

    /**
     * Handle online/offline status change
     */
    private handleOnlineStatus(isOnline: boolean): void {
        this.state.isOnline = isOnline;
        this.state.status = isOnline ? "idle" : "offline";
        this.saveState();

        // If back online, try to sync queued changes
        if (isOnline && this.offlineQueue.length > 0) {
            this.processOfflineQueue();
        }
    }

    /**
     * Enable sync with backend
     */
    async enable(backend: SyncBackendAdapter): Promise<boolean> {
        try {
            this.backend = backend;
            this.config.enabled = true;
            this.saveConfig();

            // Start auto-sync if configured
            if (this.config.autoSync) {
                this.startAutoSync();
            }

            // Initial sync
            await this.sync();

            return true;
        } catch (e) {
            console.error("[SyncService] Failed to enable sync:", e);
            return false;
        }
    }

    /**
     * Disable sync
     */
    disable(): void {
        this.config.enabled = false;
        this.backend = null;
        this.stopAutoSync();
        this.saveConfig();

        this.state.status = "idle";
        this.saveState();
    }

    /**
     * Start auto-sync timer
     */
    private startAutoSync(): void {
        if (this.syncTimer) return;

        this.syncTimer = setInterval(() => {
            if (this.state.isOnline && this.config.enabled) {
                this.sync();
            }
        }, this.config.syncInterval);
    }

    /**
     * Stop auto-sync timer
     */
    private stopAutoSync(): void {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }
    }

    /**
     * Queue a change for sync (called when data changes locally)
     */
    queueChange(operation: "create" | "update" | "delete", table: string, data: any): void {
        const item: OfflineQueueItem = {
            id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            operation,
            table,
            data,
            timestamp: Date.now(),
            retryCount: 0
        };

        this.offlineQueue.push(item);
        this.saveQueue();

        // Trigger sync if online and enabled
        if (this.state.isOnline && this.config.enabled && this.backend) {
            this.debouncedSync();
        }
    }

    /**
     * Debounced sync to avoid too many requests
     */
    private syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;
    private debouncedSync(): void {
        if (this.syncDebounceTimer) {
            clearTimeout(this.syncDebounceTimer);
        }
        this.syncDebounceTimer = setTimeout(() => {
            this.sync();
        }, 2000); // 2 second debounce
    }

    /**
     * Main sync function
     */
    async sync(): Promise<SyncResult> {
        if (!this.config.enabled || !this.backend) {
            return {
                success: false,
                itemsSynced: 0,
                conflicts: [],
                errors: ["Sync not enabled"],
                timestamp: Date.now()
            };
        }

        if (!this.state.isOnline) {
            return {
                success: false,
                itemsSynced: 0,
                conflicts: [],
                errors: ["Device is offline"],
                timestamp: Date.now()
            };
        }

        this.state.status = "syncing";
        this.saveState();

        const result: SyncResult = {
            success: true,
            itemsSynced: 0,
            conflicts: [],
            errors: [],
            timestamp: Date.now()
        };

        try {
            // 1. Process offline queue (push local changes)
            const queueResult = await this.processOfflineQueue();
            result.itemsSynced += queueResult.synced;
            result.errors.push(...queueResult.errors);

            // 2. Pull remote changes
            const pullResult = await this.pullRemoteChanges();
            result.itemsSynced += pullResult.synced;
            result.conflicts.push(...pullResult.conflicts);
            result.errors.push(...pullResult.errors);

            // 3. Update sync state
            this.config.lastSyncTime = Date.now();
            this.saveConfig();

            this.state.status = "success";
            this.state.lastSync = Date.now();
            this.state.conflicts = result.conflicts;

        } catch (e) {
            result.success = false;
            result.errors.push(e instanceof Error ? e.message : "Unknown error");
            this.state.status = "error";
        }

        this.saveState();
        return result;
    }

    /**
     * Process offline queue
     */
    private async processOfflineQueue(): Promise<{ synced: number; errors: string[] }> {
        const synced: OfflineQueueItem[] = [];
        const errors: string[] = [];

        for (const item of this.offlineQueue) {
            try {
                if (!this.backend) break;

                switch (item.operation) {
                    case "create":
                        await this.backend.create(item.table, item.data);
                        break;
                    case "update":
                        await this.backend.update(item.table, item.data.id, item.data);
                        break;
                    case "delete":
                        await this.backend.delete(item.table, item.data.id);
                        break;
                }

                synced.push(item);
            } catch (e) {
                item.retryCount++;
                if (item.retryCount >= 3) {
                    errors.push(`Failed to sync ${item.operation} on ${item.table}: ${e}`);
                    synced.push(item); // Remove from queue after 3 failures
                }
            }
        }

        // Remove synced items from queue
        this.offlineQueue = this.offlineQueue.filter(item => !synced.includes(item));
        this.saveQueue();

        return { synced: synced.length, errors };
    }

    /**
     * Pull remote changes
     */
    private async pullRemoteChanges(): Promise<{ synced: number; conflicts: SyncConflict[]; errors: string[] }> {
        if (!this.backend) {
            return { synced: 0, conflicts: [], errors: [] };
        }

        const tables = ["conversations", "messages", "memory_items", "experiences", "rules"];
        let synced = 0;
        const conflicts: SyncConflict[] = [];
        const errors: string[] = [];

        for (const table of tables) {
            try {
                const lastSync = this.config.lastSyncTime || 0;
                const remoteChanges = await this.backend.getChangesSince(table, lastSync);

                for (const remote of remoteChanges) {
                    // Check for conflicts
                    const local = await this.backend.getLocal(table, remote.id);

                    if (local && local.updated_at > lastSync) {
                        // Conflict detected
                        const conflict = await this.resolveConflict(table, local, remote);
                        if (conflict) conflicts.push(conflict);
                    } else {
                        // No conflict, apply remote change
                        await this.backend.applyLocal(table, remote);
                        synced++;
                    }
                }
            } catch (e) {
                errors.push(`Failed to pull ${table}: ${e}`);
            }
        }

        return { synced, conflicts, errors };
    }

    /**
     * Resolve sync conflict
     */
    private async resolveConflict(table: string, local: any, remote: any): Promise<SyncConflict | null> {
        const conflict: SyncConflict = {
            id: local.id,
            localData: local,
            remoteData: remote,
            conflictType: remote.deleted_at ? "delete" : "update"
        };

        switch (this.config.conflictResolution) {
            case "local_wins":
                // Keep local, push to remote
                if (this.backend) {
                    await this.backend.update(table, local.id, local);
                }
                conflict.resolvedAt = Date.now();
                return null; // No unresolved conflict

            case "remote_wins":
                // Apply remote
                if (this.backend) {
                    await this.backend.applyLocal(table, remote);
                }
                conflict.resolvedAt = Date.now();
                return null;

            case "manual":
                // Return conflict for user resolution
                return conflict;
        }
    }

    /**
     * Manually resolve a conflict
     */
    async resolveConflictManually(conflictId: string, useLocal: boolean): Promise<void> {
        const conflict = this.state.conflicts.find(c => c.id === conflictId);
        if (!conflict || !this.backend) return;

        if (useLocal) {
            await this.backend.update("conflicts", conflict.id, conflict.localData);
        } else {
            await this.backend.applyLocal("conflicts", conflict.remoteData);
        }

        this.state.conflicts = this.state.conflicts.filter(c => c.id !== conflictId);
        this.saveState();
    }

    /**
     * Get current sync state
     */
    getState(): SyncState {
        return { ...this.state };
    }

    /**
     * Get sync configuration
     */
    getConfig(): SyncConfig {
        return { ...this.config };
    }

    /**
     * Update sync configuration
     */
    updateConfig(updates: Partial<SyncConfig>): void {
        this.config = { ...this.config, ...updates };
        this.saveConfig();

        // Update auto-sync based on config
        if (updates.autoSync !== undefined) {
            if (updates.autoSync && this.config.enabled) {
                this.startAutoSync();
            } else {
                this.stopAutoSync();
            }
        }
    }

    /**
     * Subscribe to state changes
     */
    subscribe(listener: (state: SyncState) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /**
     * Notify listeners of state changes
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.state));
    }

    /**
     * Force sync now
     */
    async forceSync(): Promise<SyncResult> {
        return this.sync();
    }

    /**
     * Get pending changes count
     */
    getPendingCount(): number {
        return this.offlineQueue.length;
    }
}

/**
 * Backend Adapter Interface
 * Implement this for your specific backend (Supabase, Firebase, etc.)
 */
export interface SyncBackendAdapter {
    // Remote operations
    create(table: string, data: any): Promise<any>;
    update(table: string, id: string, data: any): Promise<any>;
    delete(table: string, id: string): Promise<void>;
    getChangesSince(table: string, timestamp: number): Promise<any[]>;

    // Local operations
    getLocal(table: string, id: string): Promise<any | null>;
    applyLocal(table: string, data: any): Promise<void>;
}

export const syncService = new SyncService();
