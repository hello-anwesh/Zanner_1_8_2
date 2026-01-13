import { invoke } from '@tauri-apps/api/core';

/**
 * DockService - Control macOS dock icon badge & bounce
 * 
 * Features:
 * - Set badge label (e.g., "25" for minutes remaining)
 * - Bounce dock icon for attention
 * - Clear badge when timer stops
 */
class DockService {
    private activeBounceId: number | null = null;

    /**
     * Set dock badge label (appears as red circle with text)
     * @param label - Text to show (e.g., "25", "5m", "!")
     */
    async setBadge(label: string): Promise<void> {
        try {
            await invoke('set_dock_badge', { label });
        } catch (error) {
            console.warn('[DockService] Failed to set badge:', error);
        }
    }

    /**
     * Set badge with minutes remaining
     * @param minutes - Minutes to display
     */
    async setMinutesBadge(minutes: number): Promise<void> {
        if (minutes <= 0) {
            await this.clearBadge();
        } else if (minutes < 60) {
            await this.setBadge(`${minutes}`);
        } else {
            const hours = Math.floor(minutes / 60);
            await this.setBadge(`${hours}h`);
        }
    }

    /**
     * Clear dock badge
     */
    async clearBadge(): Promise<void> {
        try {
            await invoke('clear_dock_badge');
        } catch (error) {
            console.warn('[DockService] Failed to clear badge:', error);
        }
    }

    /**
     * Bounce dock icon to get user attention
     * @param critical - If true, bounces continuously until clicked. If false, bounces once.
     */
    async bounce(critical: boolean = false): Promise<void> {
        try {
            // Cancel any existing bounce first
            if (this.activeBounceId !== null) {
                await this.cancelBounce();
            }

            const requestId = await invoke<number>('bounce_dock', { critical });

            if (critical) {
                this.activeBounceId = requestId;
            }
        } catch (error) {
            console.warn('[DockService] Failed to bounce:', error);
        }
    }

    /**
     * Cancel an active critical bounce
     */
    async cancelBounce(): Promise<void> {
        if (this.activeBounceId === null) return;

        try {
            await invoke('cancel_dock_bounce', { requestId: this.activeBounceId });
            this.activeBounceId = null;
        } catch (error) {
            console.warn('[DockService] Failed to cancel bounce:', error);
        }
    }

    /**
     * Timer session started - show remaining minutes
     */
    async onSessionStart(totalMinutes: number): Promise<void> {
        await this.setMinutesBadge(totalMinutes);
    }

    /**
     * Timer tick - update minutes remaining
     */
    async onTimerTick(secondsRemaining: number): Promise<void> {
        const minutesRemaining = Math.ceil(secondsRemaining / 60);
        await this.setMinutesBadge(minutesRemaining);
    }

    /**
     * Timer completed - bounce and show check mark
     */
    async onSessionComplete(): Promise<void> {
        await this.setBadge('✓');
        await this.bounce(true); // Critical bounce until user clicks

        // Clear badge after 5 seconds
        setTimeout(() => {
            this.clearBadge();
        }, 5000);
    }

    /**
     * Break started - show break indicator
     */
    async onBreakStart(): Promise<void> {
        await this.setBadge('☕');
    }

    /**
     * Timer stopped/paused - clear badge
     */
    async onSessionStop(): Promise<void> {
        await this.clearBadge();
        await this.cancelBounce();
    }
}

export const dockService = new DockService();
