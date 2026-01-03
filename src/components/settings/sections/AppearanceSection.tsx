import { Palette, Check, Sparkles } from "lucide-react";

interface AppearanceSectionProps {
    theme: string;
    themes: Record<string, { accent: string; name: string }>;
    onThemeChange: (theme: string) => void;
    accent: string;
}

export function AppearanceSection({ theme, themes, onThemeChange, accent }: AppearanceSectionProps) {
    const themeList = Object.entries(themes);

    return (
        <div className="space-y-8">
            {/* Current Theme Preview */}
            <div
                className="relative p-6 rounded-2xl overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${accent}20 0%, transparent 50%)`,
                    border: `1px solid ${accent}30`,
                }}
            >
                <div className="relative z-10 flex items-center gap-5">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{
                            background: `linear-gradient(135deg, ${accent} 0%, ${accent}80 100%)`,
                            boxShadow: `0 8px 32px ${accent}40`,
                        }}
                    >
                        <Sparkles size={28} className="text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Current Theme</p>
                        <h3 className="text-2xl font-bold text-white">{themes[theme]?.name || theme}</h3>
                        <p className="text-sm text-white/40 mt-1">
                            Accent: <code className="text-xs px-1.5 py-0.5 rounded bg-white/10">{accent}</code>
                        </p>
                    </div>
                </div>

                {/* Decorative circles */}
                <div
                    className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20"
                    style={{ background: accent }}
                />
                <div
                    className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-10"
                    style={{ background: accent }}
                />
            </div>

            {/* Theme Grid */}
            <div>
                <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
                    Choose Your Theme
                </h4>
                <div className="grid grid-cols-3 gap-3">
                    {themeList.map(([key, { accent: themeAccent, name }]) => {
                        const isActive = theme === key;
                        return (
                            <button
                                key={key}
                                onClick={() => onThemeChange(key)}
                                className="group relative p-4 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02]"
                                style={{
                                    background: isActive
                                        ? `linear-gradient(145deg, ${themeAccent}15 0%, transparent 60%)`
                                        : "rgba(255,255,255,0.02)",
                                    border: isActive
                                        ? `2px solid ${themeAccent}50`
                                        : "2px solid rgba(255,255,255,0.04)",
                                    boxShadow: isActive ? `0 4px 20px ${themeAccent}20` : "none",
                                }}
                            >
                                {/* Color Preview */}
                                <div className="flex items-center gap-3 mb-3">
                                    <div
                                        className="w-10 h-10 rounded-xl transition-transform group-hover:scale-110"
                                        style={{
                                            background: `linear-gradient(135deg, ${themeAccent} 0%, ${themeAccent}90 100%)`,
                                            boxShadow: `0 4px 12px ${themeAccent}30`,
                                        }}
                                    />
                                    {isActive && (
                                        <div
                                            className="w-6 h-6 rounded-full flex items-center justify-center"
                                            style={{ background: themeAccent }}
                                        >
                                            <Check size={14} className="text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Name */}
                                <p
                                    className="text-sm font-medium transition-colors"
                                    style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.6)" }}
                                >
                                    {name}
                                </p>
                                <p className="text-[10px] text-white/25 mt-0.5 font-mono">{themeAccent}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Color Reference */}
            <div
                className="p-5 rounded-2xl"
                style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                }}
            >
                <div className="flex items-center gap-3 mb-4">
                    <Palette size={18} className="text-white/40" />
                    <h4 className="text-sm font-medium text-white/60">Color Palette</h4>
                </div>
                <div className="flex gap-2">
                    {themeList.slice(0, 8).map(([key, { accent: themeAccent }]) => (
                        <button
                            key={key}
                            onClick={() => onThemeChange(key)}
                            className="w-8 h-8 rounded-lg transition-all hover:scale-125 hover:rotate-12"
                            style={{
                                background: themeAccent,
                                boxShadow: theme === key ? `0 0 0 2px #fff, 0 4px 12px ${themeAccent}50` : "none",
                            }}
                            title={themes[key].name}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
