/**
 * Frequency Harmony Generator
 * Popular healing frequencies with their purposes
 */

export interface FrequencyInfo {
    hz: number;
    name: string;
    category: FrequencyCategory;
    description: string;
    color: string;
    icon: string;
}

export type FrequencyCategory =
    | "solfeggio"
    | "brainwave"
    | "healing"
    | "earth"
    | "chakra";

export const FREQUENCY_CATEGORIES = [
    { id: "solfeggio", name: "Solfeggio", icon: "🎵", color: "#8B5CF6" },
    { id: "brainwave", name: "Brainwave", icon: "🧠", color: "#06B6D4" },
    { id: "healing", name: "Healing", icon: "💚", color: "#10B981" },
    { id: "earth", name: "Earth", icon: "🌍", color: "#F59E0B" },
    { id: "chakra", name: "Chakra", icon: "🧘", color: "#EC4899" },
];

export const FREQUENCIES: FrequencyInfo[] = [
    // SOLFEGGIO FREQUENCIES (Ancient healing tones)
    { hz: 174, name: "Pain Relief", category: "solfeggio", description: "Reduces pain, stress. Foundation frequency.", color: "#EF4444", icon: "🩹" },
    { hz: 285, name: "Tissue Healing", category: "solfeggio", description: "Heals tissues, restructures damaged organs.", color: "#F97316", icon: "🔄" },
    { hz: 396, name: "Liberation", category: "solfeggio", description: "Liberates fear and guilt. Root chakra.", color: "#EAB308", icon: "🔓" },
    { hz: 417, name: "Undo Situations", category: "solfeggio", description: "Clears negativity, facilitates change.", color: "#84CC16", icon: "↩️" },
    { hz: 432, name: "Universal Harmony", category: "solfeggio", description: "Nature's frequency. Deep calm, healing.", color: "#22C55E", icon: "🌿" },
    { hz: 528, name: "DNA Repair", category: "solfeggio", description: "Love frequency. Repairs DNA, miracles.", color: "#10B981", icon: "💚" },
    { hz: 639, name: "Connection", category: "solfeggio", description: "Harmonizes relationships, communication.", color: "#14B8A6", icon: "🤝" },
    { hz: 741, name: "Awakening", category: "solfeggio", description: "Awakens intuition, self-expression.", color: "#06B6D4", icon: "👁️" },
    { hz: 852, name: "Intuition", category: "solfeggio", description: "Returns to spiritual order, third eye.", color: "#3B82F6", icon: "🔮" },
    { hz: 963, name: "Divine Connection", category: "solfeggio", description: "Pineal gland activation. Oneness.", color: "#8B5CF6", icon: "✨" },

    // BRAINWAVE FREQUENCIES (Binaural beats base)
    { hz: 0.5, name: "Epsilon", category: "brainwave", description: "Extraordinary states, suspended animation.", color: "#1E293B", icon: "🌑" },
    { hz: 2, name: "Delta Deep", category: "brainwave", description: "Deep dreamless sleep, healing.", color: "#334155", icon: "💤" },
    { hz: 4, name: "Theta Low", category: "brainwave", description: "Deep meditation, REM sleep.", color: "#475569", icon: "🌙" },
    { hz: 6, name: "Theta Mid", category: "brainwave", description: "Creativity, insight, memory.", color: "#64748B", icon: "💡" },
    { hz: 8, name: "Alpha Low", category: "brainwave", description: "Relaxed awareness, pre-sleep.", color: "#94A3B8", icon: "😌" },
    { hz: 10, name: "Alpha Mid", category: "brainwave", description: "Calm focus, super learning.", color: "#06B6D4", icon: "🎯" },
    { hz: 14, name: "Beta Low", category: "brainwave", description: "Active thinking, focus.", color: "#0EA5E9", icon: "🧠" },
    { hz: 20, name: "Beta Mid", category: "brainwave", description: "Active concentration, cognition.", color: "#3B82F6", icon: "⚡" },
    { hz: 30, name: "Beta High", category: "brainwave", description: "Peak concentration, alertness.", color: "#6366F1", icon: "🚀" },
    { hz: 40, name: "Gamma", category: "brainwave", description: "Higher processing, insight, focus.", color: "#8B5CF6", icon: "💎" },

    // HEALING FREQUENCIES
    { hz: 111, name: "Cell Regeneration", category: "healing", description: "Promotes cell regeneration.", color: "#F43F5E", icon: "🧬" },
    { hz: 256, name: "Root Tone", category: "healing", description: "Physical grounding frequency.", color: "#EC4899", icon: "🌳" },
    { hz: 288, name: "Destruction of Disease", category: "healing", description: "Believed to help eliminate pathogens.", color: "#D946EF", icon: "🛡️" },
    { hz: 384, name: "Spiritual Cleansing", category: "healing", description: "Clears spiritual blocks.", color: "#A855F7", icon: "🧹" },
    { hz: 480, name: "Energy Boost", category: "healing", description: "Increases vitality and energy.", color: "#8B5CF6", icon: "⚡" },

    // EARTH FREQUENCIES
    { hz: 1.618, name: "Golden Ratio Phi", category: "earth", description: "Divine proportion. Universal harmony.", color: "#F59E0B", icon: "Φ" },
    { hz: 7.83, name: "Schumann Resonance", category: "earth", description: "Earth's heartbeat. Grounding, healing.", color: "#65A30D", icon: "🌍" },
    { hz: 136.1, name: "Om Frequency", category: "earth", description: "Cosmic Om. Universal sound.", color: "#EA580C", icon: "🕉️" },
    { hz: 161.8, name: "Golden Ratio 100x", category: "earth", description: "Phi amplified. Sacred geometry.", color: "#D97706", icon: "⚛️" },
    { hz: 194.18, name: "Earth Day", category: "earth", description: "26 hour Synodic day frequency.", color: "#16A34A", icon: "☀️" },

    // CHAKRA FREQUENCIES
    { hz: 256, name: "Root Chakra", category: "chakra", description: "Muladhara. Grounding, survival.", color: "#EF4444", icon: "🔴" },
    { hz: 288, name: "Sacral Chakra", category: "chakra", description: "Svadhisthana. Creativity, pleasure.", color: "#F97316", icon: "🟠" },
];

export interface FrequencyMix {
    id: string;
    name: string;
    frequencies: { hz: number; volume: number }[];
    createdAt: number;
}

// Preset mixes for quick access
export const PRESET_MIXES: FrequencyMix[] = [
    {
        id: "focus",
        name: "Deep Focus",
        frequencies: [
            { hz: 40, volume: 0.5 },
            { hz: 14, volume: 0.3 },
            { hz: 528, volume: 0.2 },
        ],
        createdAt: 0,
    },
    {
        id: "sleep",
        name: "Deep Sleep",
        frequencies: [
            { hz: 2, volume: 0.6 },
            { hz: 174, volume: 0.3 },
            { hz: 4, volume: 0.1 },
        ],
        createdAt: 0,
    },
    {
        id: "meditation",
        name: "Meditation",
        frequencies: [
            { hz: 7.83, volume: 0.4 },
            { hz: 432, volume: 0.4 },
            { hz: 852, volume: 0.2 },
        ],
        createdAt: 0,
    },
    {
        id: "healing",
        name: "Full Healing",
        frequencies: [
            { hz: 528, volume: 0.4 },
            { hz: 396, volume: 0.3 },
            { hz: 639, volume: 0.3 },
        ],
        createdAt: 0,
    },
    {
        id: "creativity",
        name: "Creative Flow",
        frequencies: [
            { hz: 6, volume: 0.5 },
            { hz: 417, volume: 0.3 },
            { hz: 741, volume: 0.2 },
        ],
        createdAt: 0,
    },
    {
        id: "golden-ratio",
        name: "Golden Ratio",
        frequencies: [
            { hz: 1.618, volume: 0.4 },
            { hz: 161.8, volume: 0.5 },
            { hz: 432, volume: 0.3 },
            { hz: 528, volume: 0.2 },
        ],
        createdAt: 0,
    },
    {
        id: "schumann",
        name: "Earth Resonance",
        frequencies: [
            { hz: 7.83, volume: 0.6 },
            { hz: 136.1, volume: 0.3 },
            { hz: 194.18, volume: 0.1 },
        ],
        createdAt: 0,
    },
    {
        id: "energy",
        name: "Energy Boost",
        frequencies: [
            { hz: 30, volume: 0.5 },
            { hz: 40, volume: 0.4 },
            { hz: 480, volume: 0.3 },
            { hz: 20, volume: 0.2 },
        ],
        createdAt: 0,
    },
    {
        id: "anxiety",
        name: "Anxiety Relief",
        frequencies: [
            { hz: 396, volume: 0.5 },
            { hz: 174, volume: 0.4 },
            { hz: 8, volume: 0.3 },
            { hz: 432, volume: 0.2 },
        ],
        createdAt: 0,
    },
    {
        id: "spiritual",
        name: "Spiritual Awakening",
        frequencies: [
            { hz: 963, volume: 0.4 },
            { hz: 852, volume: 0.4 },
            { hz: 741, volume: 0.3 },
            { hz: 136.1, volume: 0.2 },
        ],
        createdAt: 0,
    },
];

// Local storage
const STORAGE_KEY = "chronos_frequency_mixes";

export function loadCustomMixes(): FrequencyMix[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch { return []; }
}

export function saveCustomMixes(mixes: FrequencyMix[]): void {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(mixes)); }
    catch (e) { console.error("Failed to save mixes:", e); }
}

export function getFrequencyInfo(hz: number): FrequencyInfo | undefined {
    return FREQUENCIES.find(f => f.hz === hz);
}
