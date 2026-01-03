import { useState } from "react";
import { X, Save } from "lucide-react";
import { presetManager } from "../../services/config/PresetManager";
import { TimerPreset } from "../../config/presets";

interface PresetEditorProps {
    preset: TimerPreset;
    onClose: () => void;
    onSave: (updated: TimerPreset) => void;
    colors: any;
}

export function PresetEditor({ preset, onClose, onSave, colors }: PresetEditorProps) {
    const [edited, setEdited] = useState<TimerPreset>({ ...preset });

    const handleSave = () => {
        // If baseUnit changed, recalculate sequence for 'smart-sprint'
        if (edited.baseUnit && edited.id === "smart-sprint") {
            const x = edited.baseUnit;
            edited.focus = 10 * x;
            edited.shortBreak = x;
            edited.longBreak = 2 * x;
            edited.description = `Dynamic flow: Focus (${10 * x}m) → Break (${x}m) → Focus (${8 * x}m) → Rest (${2 * x}m)`;
            edited.sequence = [
                { type: "focus", duration: 10 * x, label: "Hard Focus" },
                { type: "shortBreak", duration: x, label: "Short Rest" },
                { type: "focus", duration: 8 * x, label: "Flow State" },
                { type: "longBreak", duration: 2 * x, label: "Deep Restore" }
            ];
        }

        presetManager.savePreset(edited);
        onSave(edited);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X size={20} className="text-white/50" />
                </button>

                <h2 className="text-xl font-bold mb-1 flex items-center gap-3">
                    <span className="text-2xl">{edited.icon}</span>
                    Edit {edited.name}
                </h2>
                <p className="text-white/50 text-xs mb-6 uppercase tracking-wider">Customize Flow</p>

                <div className="space-y-6">
                    {edited.baseUnit ? (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Base Unit (X) - Minutes</label>
                            <input
                                type="number"
                                value={edited.baseUnit}
                                onChange={(e) => setEdited({ ...edited, baseUnit: parseInt(e.target.value) || 5 })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50"
                            />
                            <p className="text-xs text-white/40">
                                Sets the rhythm: Focus (10X), Short Break (X), etc.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup
                                    label="Focus Duration"
                                    value={edited.focus}
                                    onChange={(v) => setEdited({ ...edited, focus: parseInt(v) || 25 })}
                                    unit="min"
                                />
                                <InputGroup
                                    label="Short Break"
                                    value={edited.shortBreak}
                                    onChange={(v) => setEdited({ ...edited, shortBreak: parseInt(v) || 5 })}
                                    unit="min"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup
                                    label="Long Break"
                                    value={edited.longBreak}
                                    onChange={(v) => setEdited({ ...edited, longBreak: parseInt(v) || 15 })}
                                    unit="min"
                                />
                                <InputGroup
                                    label="Sessions until Long Break"
                                    value={edited.sessionsBeforeLongBreak}
                                    onChange={(v) => setEdited({ ...edited, sessionsBeforeLongBreak: parseInt(v) || 4 })}
                                    unit="sessions"
                                />
                            </div>
                        </>
                    )}

                    <div className="pt-4 flex gap-3">
                        <button
                            onClick={handleSave}
                            className="flex-1 py-3 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                            style={{ background: colors.accent, color: "#000" }}
                        >
                            <Save size={18} />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InputGroup({ label, value, onChange, unit }: { label: string, value: number, onChange: (v: string) => void, unit: string }) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-medium text-white/60">{label}</label>
            <div className="relative">
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/30">{unit}</span>
            </div>
        </div>
    );
}
