import { TimerPreset, TIMER_PRESETS } from "../../config/presets";

const STORAGE_KEY = "chronos_presets_v2";

export interface TimerSequenceStep {
    type: "focus" | "shortBreak" | "longBreak";
    duration: number; // minutes
    label?: string;
}

class PresetManager {
    private presets: TimerPreset[];

    constructor() {
        this.presets = this.loadPresets();
    }

    private loadPresets(): TimerPreset[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Merge with defaults to ensure we have all standard presets + custom user changes
                // But if user modified a default, we want the modified version.
                // We also want to include any NEW default presets that might have been added in code.

                // Simple strategy: Use stored presets. If a default ID is missing, add it.
                const merged = [...parsed];
                TIMER_PRESETS.forEach(def => {
                    if (!merged.find(p => p.id === def.id)) {
                        merged.push(def);
                    }
                });
                return merged;
            }
        } catch (e) {
            console.error("Failed to load presets", e);
        }
        return [...TIMER_PRESETS];
    }

    getPresets(): TimerPreset[] {
        return this.presets;
    }

    getPreset(id: string): TimerPreset {
        return this.presets.find(p => p.id === id) || this.presets[0];
    }

    savePreset(preset: TimerPreset) {
        const index = this.presets.findIndex(p => p.id === preset.id);
        if (index >= 0) {
            this.presets[index] = preset;
        } else {
            this.presets.push(preset);
        }
        this.persist();
    }

    resetToDefaults() {
        this.presets = [...TIMER_PRESETS];
        this.persist();
    }

    private persist() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.presets));
        // Dispatch event for UI updates if needed
        window.dispatchEvent(new Event("presets-updated"));
    }

    // Create the "10X" Sprint Flow based on a base unit X (minutes)
    createSprintPreset(baseUnitX: number = 5): TimerPreset {
        return {
            id: "smart-sprint",
            name: "Smart Sprint (10X)",
            icon: "⚡",
            description: `Dynamic flow: Focus (${10 * baseUnitX}m) → Break (${baseUnitX}m) → Focus (${8 * baseUnitX}m) → Rest (${2 * baseUnitX}m)`,
            focus: 10 * baseUnitX,
            shortBreak: baseUnitX,
            longBreak: 2 * baseUnitX,
            sessionsBeforeLongBreak: 2,
            bestFor: ["High Intensity", "Flow Training"],
            tip: "Strict cycle: 10X Focus, 1X Break, 8X Focus, 2X Long Break. Calculated from base unit.",
            color: "#F59E0B",
            baseUnit: baseUnitX,
            sequence: [
                { type: "focus", duration: 10 * baseUnitX, label: "Hard Focus" },
                { type: "shortBreak", duration: baseUnitX, label: "Short Rest" },
                { type: "focus", duration: 8 * baseUnitX, label: "Flow State" },
                { type: "longBreak", duration: 2 * baseUnitX, label: "Deep Restore" }
            ]
        };
    }
}

export const presetManager = new PresetManager();
