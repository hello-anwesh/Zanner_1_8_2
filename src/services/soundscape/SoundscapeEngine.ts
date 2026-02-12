
/**
 * Soundscape Engine (Procedural Audio)
 * Generates Rain, Stream, Fire, White/Pink/Brown Noise natively via Web Audio API.
 * No external assets required.
 */

export type SoundType = 'rain' | 'stream' | 'fire' | 'brown' | 'pink' | 'white';

export class SoundscapeEngine {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private activeSounds: Map<SoundType, { source: AudioBufferSourceNode; gain: GainNode; filters: AudioNode[] }> = new Map();
    private buffers: Map<SoundType, AudioBuffer> = new Map();

    constructor() {
        // Lazy init on first play
    }

    private init() {
        if (this.ctx) return;

        try {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);

            // Generate base noise buffers
            this.generateBuffers();
        } catch (e) {
            console.error("Web Audio API error:", e);
        }
    }

    private generateBuffers() {
        if (!this.ctx) return;

        // 1. White Noise
        const bufferSize = this.ctx.sampleRate * 2; // 2s loop
        const whiteBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const whiteData = whiteBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            whiteData[i] = Math.random() * 2 - 1;
        }
        this.buffers.set('white', whiteBuffer);

        // 2. Pink Noise (Paul Kellet's refined method)
        const pinkBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const pinkData = pinkBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            pinkData[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            pinkData[i] *= 0.11; // Normalize
            b6 = white * 0.115926;
        }
        this.buffers.set('rain', pinkBuffer); // Rain base is pink
        this.buffers.set('pink', pinkBuffer);

        // 3. Brown Noise (Integrate white noise)
        const brownBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const brownData = brownBuffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            brownData[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = brownData[i];
            brownData[i] *= 3.5; // Compensate gain
        }
        this.buffers.set('brown', brownBuffer);
        this.buffers.set('stream', brownBuffer); // Stream base is brown
        this.buffers.set('fire', brownBuffer);   // Fire base is brown/crackly
    }

    async play(type: SoundType, volume: number = 0.5) {
        if (!this.ctx) this.init();
        if (!this.ctx || this.activeSounds.has(type)) return;

        if (this.ctx.state === 'suspended') await this.ctx.resume();

        const buffer = this.buffers.get(type);
        if (!buffer) return;

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const gain = this.ctx.createGain();
        gain.gain.value = 0; // Start silent for fade in

        // Signal Chain
        let node: AudioNode = source;

        // Apply specific filters for soundscapes
        const filters: AudioNode[] = [];

        if (type === 'rain') {
            // Rain: LowPass to muffle high hiss
            const lpf = this.ctx.createBiquadFilter();
            lpf.type = 'lowpass';
            lpf.frequency.value = 800; // Muffled rain
            node.connect(lpf);
            node = lpf;
            filters.push(lpf);
        } else if (type === 'stream') {
            // Stream: Bandpass around 400Hz
            const bpf = this.ctx.createBiquadFilter();
            bpf.type = 'bandpass';
            bpf.frequency.value = 400;
            bpf.Q.value = 0.5;
            node.connect(bpf);
            node = bpf;
            filters.push(bpf);
        } else if (type === 'fire') {
            // Fire: Need crackle (random bursts). 
            // Logic for crackle is complex in graph. 
            // For now just consistent rumble.
            const hpf = this.ctx.createBiquadFilter();
            hpf.type = 'highpass';
            hpf.frequency.value = 100;
            node.connect(hpf);
            node = hpf;
            filters.push(hpf);
        }

        node.connect(gain);
        gain.connect(this.masterGain!);

        source.start();

        // Fade in
        gain.gain.setTargetAtTime(volume, this.ctx.currentTime, 2);

        this.activeSounds.set(type, { source, gain, filters });
    }

    stop(type: SoundType) {
        const sound = this.activeSounds.get(type);
        if (!sound || !this.ctx) return;

        // Fade out
        sound.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);

        setTimeout(() => {
            try {
                sound.source.stop();
                sound.source.disconnect();
                sound.gain.disconnect();
                sound.filters.forEach(f => f.disconnect());
            } catch (e) { /* ignore */ }
            this.activeSounds.delete(type);
        }, 600);
    }

    setVolume(type: SoundType, volume: number) {
        const sound = this.activeSounds.get(type);
        if (sound && this.ctx) {
            sound.gain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.1);
        }
    }

    stopAll() {
        this.activeSounds.forEach((_, key) => this.stop(key));
    }
}

// Singleton
export const soundscape = new SoundscapeEngine();
