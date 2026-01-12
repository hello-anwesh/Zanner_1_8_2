/**
 * Sync Types
 * Types and interfaces for cloud synchronization
 */

export type SyncStatus = "idle" | "syncing" | "error" | "offline" | "success";

export interface SyncableItem {
    id: string;
    user_id: string;
    is_synced: boolean;
    updated_at: number;
    deleted_at?: number; // For soft deletes
}

export interface SyncConflict {
    id: string;
    localData: any;
    remoteData: any;
    conflictType: "update" | "delete";
    resolvedAt?: number;
}

export interface SyncResult {
    success: boolean;
    itemsSynced: number;
    conflicts: SyncConflict[];
    errors: string[];
    timestamp: number;
}

export interface SyncConfig {
    enabled: boolean;
    autoSync: boolean;
    syncInterval: number; // ms
    conflictResolution: "local_wins" | "remote_wins" | "manual";
    lastSyncTime: number | null;
    deviceId: string;
}

export interface OfflineQueueItem {
    id: string;
    operation: "create" | "update" | "delete";
    table: string;
    data: any;
    timestamp: number;
    retryCount: number;
}

export interface SyncState {
    status: SyncStatus;
    lastSync: number | null;
    pendingChanges: number;
    conflicts: SyncConflict[];
    isOnline: boolean;
}

// Default sync configuration
export const DEFAULT_SYNC_CONFIG: SyncConfig = {
    enabled: false,
    autoSync: true,
    syncInterval: 5 * 60 * 1000, // 5 minutes
    conflictResolution: "local_wins",
    lastSyncTime: null,
    deviceId: ""
};
