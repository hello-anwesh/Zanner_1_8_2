/**
 * Audio Engine for Frequency Generator
 * Uses Web Audio API to generate pure tones
 */

export class FrequencyEngine {
    private audioContext: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private oscillators: Map<number, { osc: OscillatorNode; gain: GainNode }> = new Map();
    private analyser: AnalyserNode | null = null;

    constructor() {
        this.init();
    }

    private init() {
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = 0.5;

            // Analyser for visualization
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.masterGain.connect(this.analyser);
        } catch (e) {
            console.error("Web Audio API not supported:", e);
        }
    }

    resume() {
        if (this.audioContext?.state === "suspended") {
            this.audioContext.resume();
        }
    }

    setMasterVolume(volume: number) {
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(
                Math.max(0, Math.min(1, volume)),
                this.audioContext!.currentTime,
                0.01
            );
        }
    }

    async startFrequency(hz: number, volume: number = 0.5, waveform: OscillatorType = "sine") {
        if (!this.audioContext || !this.masterGain) {
            this.init(); // Try to init if missing
        }

        if (!this.audioContext) return;

        // Ensure context is running
        if (this.audioContext.state === "suspended") {
            try {
                await this.audioContext.resume();
            } catch (e) {
                console.error("Failed to resume AudioContext:", e);
            }
        }

        // Don't create duplicate
        if (this.oscillators.has(hz)) {
            this.setFrequencyVolume(hz, volume);
            return;
        }

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = waveform;
        osc.frequency.value = hz;
        gain.gain.value = 0;

        osc.connect(gain);
        gain.connect(this.masterGain!); // safe because of check above
        osc.start();

        // Fade in
        gain.gain.setTargetAtTime(volume, this.audioContext.currentTime, 0.1);

        this.oscillators.set(hz, { osc, gain });
    }

    stopFrequency(hz: number) {
        const entry = this.oscillators.get(hz);
        if (!entry || !this.audioContext) return;

        // Fade out then stop
        entry.gain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.05);
        setTimeout(() => {
            entry.osc.stop();
            entry.osc.disconnect();
            entry.gain.disconnect();
            this.oscillators.delete(hz);
        }, 100);
    }

    setFrequencyVolume(hz: number, volume: number) {
        const entry = this.oscillators.get(hz);
        if (!entry || !this.audioContext) return;

        entry.gain.gain.setTargetAtTime(
            Math.max(0, Math.min(1, volume)),
            this.audioContext.currentTime,
            0.02
        );
    }

    stopAll() {
        this.oscillators.forEach((_, hz) => this.stopFrequency(hz));
    }

    pause() {
        // Store current volume and mute
        if (this.masterGain && this.audioContext) {
            this.masterGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.01);
        }
    }

    resumePlayback(volume: number = 0.5) {
        // Restore volume
        if (this.masterGain && this.audioContext) {
            this.masterGain.gain.setTargetAtTime(volume, this.audioContext.currentTime, 0.01);
        }
        this.resume();
    }

    isPlaying(hz: number): boolean {
        return this.oscillators.has(hz);
    }

    getActiveFrequencies(): number[] {
        return Array.from(this.oscillators.keys());
    }

    getAnalyserData(): Uint8Array | null {
        if (!this.analyser) return null;
        const data = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(data);
        return data;
    }

    destroy() {
        this.stopAll();
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}

// Singleton
let engine: FrequencyEngine | null = null;

export function getFrequencyEngine(): FrequencyEngine {
    if (!engine) {
        engine = new FrequencyEngine();
    }
    return engine;
}
