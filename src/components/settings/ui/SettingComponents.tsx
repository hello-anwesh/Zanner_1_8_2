import { ReactNode } from "react";

// ============================================================================
// SETTING SECTION - Container with title
// ============================================================================
interface SettingSectionProps {
    title: string;
    icon?: ReactNode;
    accent?: string;
    children: ReactNode;
}

export function SettingSection({ title, icon, children }: SettingSectionProps) {
    return (
        <div className="mb-8 last:mb-0">
            <div className="flex items-center gap-2 mb-4">
                {icon}
                <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider">{title}</h4>
            </div>
            {children}
        </div>
    );
}

// ============================================================================
// SETTING ROW - Label + control layout
// ============================================================================
interface SettingRowProps {
    label: string;
    description?: string;
    children: ReactNode;
}

export function SettingRow({ label, description, children }: SettingRowProps) {
    return (
        <div
            className="flex items-center justify-between p-4 rounded-xl mb-2 last:mb-0"
            style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
            }}
        >
            <div className="flex-1 min-w-0 mr-4">
                <p className="text-sm font-medium text-white">{label}</p>
                {description && <p className="text-[11px] text-white/30 mt-0.5">{description}</p>}
            </div>
            {children}
        </div>
    );
}

// ============================================================================
// SETTING TOGGLE - On/Off switch
// ============================================================================
interface SettingToggleProps {
    value: boolean;
    onChange: (value: boolean) => void;
    accent?: string;
}

export function SettingToggle({ value, onChange, accent = "#3B82F6" }: SettingToggleProps) {
    return (
        <button
            onClick={() => onChange(!value)}
            className="relative w-12 h-7 rounded-full transition-all duration-300 shrink-0"
            style={{ background: value ? accent : "rgba(255,255,255,0.1)" }}
        >
            <div
                className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-all duration-300"
                style={{ left: value ? "calc(100% - 24px)" : "4px" }}
            />
        </button>
    );
}

// ============================================================================
// SETTING SLIDER - Range input
// ============================================================================
interface SettingSliderProps {
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
    accent?: string;
    unit?: string;
}

export function SettingSlider({ value, min, max, onChange, accent = "#3B82F6", unit = "" }: SettingSliderProps) {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className="flex items-center gap-3 min-w-[160px]">
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                    background: `linear-gradient(to right, ${accent} ${percentage}%, rgba(255,255,255,0.1) ${percentage}%)`,
                }}
            />
            <span className="text-sm font-medium text-white/60 w-12 text-right tabular-nums">
                {value}{unit}
            </span>
        </div>
    );
}

// ============================================================================
// SETTING SELECT - Dropdown
// ============================================================================
interface SettingSelectProps {
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
}

export function SettingSelect({ value, options, onChange }: SettingSelectProps) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm text-white bg-white/5 border border-white/10 outline-none cursor-pointer min-w-[140px]"
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
}

// ============================================================================
// SETTING INPUT - Text input
// ============================================================================
interface SettingInputProps {
    value: string;
    placeholder?: string;
    type?: "text" | "password" | "number";
    onChange: (value: string) => void;
}

export function SettingInput({ value, placeholder, type = "text", onChange }: SettingInputProps) {
    return (
        <input
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm text-white bg-white/5 border border-white/10 outline-none focus:border-white/20 min-w-[200px]"
        />
    );
}

// ============================================================================
// SETTING CARD - Selectable card
// ============================================================================
interface SettingCardProps {
    isActive: boolean;
    onClick: () => void;
    icon: ReactNode;
    label: string;
    description?: string;
    color?: string;
}

export function SettingCard({ isActive, onClick, icon, label, description, color = "#3B82F6" }: SettingCardProps) {
    return (
        <button
            onClick={onClick}
            className="group relative p-4 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02]"
            style={{
                background: isActive ? `linear-gradient(145deg, ${color}12 0%, transparent 60%)` : "rgba(255,255,255,0.02)",
                border: isActive ? `2px solid ${color}40` : "2px solid rgba(255,255,255,0.04)",
            }}
        >
            <div className="flex items-center gap-3">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: isActive ? `${color}20` : "rgba(255,255,255,0.04)" }}
                >
                    {icon}
                </div>
            </div>
            <p
                className="text-sm font-medium mt-3"
                style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.6)" }}
            >
                {label}
            </p>
            {description && <p className="text-[10px] text-white/30 mt-0.5">{description}</p>}
        </button>
    );
}
