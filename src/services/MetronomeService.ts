/**
 * Metronome Service
 * Provides background tick sound that plays continuously during timer
 * Works alongside music without interruption
 */

class MetronomeService {
    private audioContext: AudioContext | null = null;
    private isRunning: boolean = false;
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private bpm: number = 60;
    private volume: number = 0.3;
    private enabled: boolean = false;

    constructor() {
        // Initialize on first use
    }

    private initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }

    /**
     * Play a single tick sound
     */
    private playTick() {
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;

        // Create oscillator for tick sound
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Tick sound: short, high-pitched beep
        oscillator.frequency.value = 1000; // 1kHz
        oscillator.type = 'sine';

        // Quick attack and decay for sharp tick
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(this.volume, now + 0.001);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        oscillator.start(now);
        oscillator.stop(now + 0.05);
    }

    /**
     * Start the metronome
     */
    start() {
        if (this.isRunning || !this.enabled) return;

        this.initAudioContext();
        this.isRunning = true;

        const interval = (60 / this.bpm) * 1000; // Convert BPM to milliseconds

        this.intervalId = setInterval(() => {
            if (this.enabled) {
                this.playTick();
            }
        }, interval);

        // Play first tick immediately
        this.playTick();
    }

    /**
     * Stop the metronome
     */
    stop() {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Set BPM (beats per minute)
     */
    setBPM(bpm: number) {
        if (bpm < 30 || bpm > 240) {
            console.warn('BPM must be between 30 and 240');
            return;
        }

        this.bpm = bpm;

        // Restart if running to apply new BPM
        if (this.isRunning) {
            this.stop();
            this.start();
        }

        this.saveConfig();
    }

    /**
     * Set volume (0.0 to 1.0)
     */
    setVolume(volume: number) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.saveConfig();
    }

    /**
     * Enable/disable metronome
     */
    setEnabled(enabled: boolean) {
        this.enabled = enabled;

        if (!enabled && this.isRunning) {
            this.stop();
        }

        this.saveConfig();
    }

    /**
     * Get current state
     */
    getState() {
        return {
            enabled: this.enabled,
            isRunning: this.isRunning,
            bpm: this.bpm,
            volume: this.volume,
        };
    }

    /**
     * Load config from localStorage
     */
    loadConfig() {
        try {
            const saved = localStorage.getItem('metronome-config');
            if (saved) {
                const config = JSON.parse(saved);
                this.enabled = config.enabled ?? false;
                this.bpm = config.bpm ?? 60;
                this.volume = config.volume ?? 0.3;
            }
        } catch (error) {
            console.error('Failed to load metronome config:', error);
        }
    }

    /**
     * Save config to localStorage
     */
    private saveConfig() {
        try {
            const config = {
                enabled: this.enabled,
                bpm: this.bpm,
                volume: this.volume,
            };
            localStorage.setItem('metronome-config', JSON.stringify(config));
        } catch (error) {
            console.error('Failed to save metronome config:', error);
        }
    }
}

// Export singleton instance
export const metronomeService = new MetronomeService();
