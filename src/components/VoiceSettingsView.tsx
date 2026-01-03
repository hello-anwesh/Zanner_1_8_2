import React, { useState } from 'react';
import { Volume2, Play, Pause } from 'lucide-react';

interface VoiceSettings {
    enabled: boolean;
    voice: string;
    speed: number;
    pitch: number;
    volume: number;
    announcements: {
        sessionStart: boolean;
        sessionEnd: boolean;
        breakStart: boolean;
        breakEnd: boolean;
        milestone: boolean;
    };
}

interface VoiceSettingsViewProps {
    accent: string;
}

export const VoiceSettingsView: React.FC<VoiceSettingsViewProps> = ({ accent }) => {
    const [settings, setSettings] = useState<VoiceSettings>({
        enabled: true,
        voice: 'Samantha',
        speed: 1.0,
        pitch: 1.0,
        volume: 0.8,
        announcements: {
            sessionStart: true,
            sessionEnd: true,
            breakStart: true,
            breakEnd: false,
            milestone: true
        }
    });

    const [testingVoice, setTestingVoice] = useState(false);

    const voices = [
        { id: 'Samantha', name: 'Samantha', gender: 'Female', language: 'en-US' },
        { id: 'Alex', name: 'Alex', gender: 'Male', language: 'en-US' },
        { id: 'Victoria', name: 'Victoria', gender: 'Female', language: 'en-GB' },
        { id: 'Daniel', name: 'Daniel', gender: 'Male', language: 'en-GB' }
    ];

    const testVoice = () => {
        setTestingVoice(true);
        setTimeout(() => setTestingVoice(false), 2000);
    };

    const updateSetting = <K extends keyof VoiceSettings>(key: K, value: VoiceSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const toggleAnnouncement = (key: keyof VoiceSettings['announcements']) => {
        setSettings(prev => ({
            ...prev,
            announcements: {
                ...prev.announcements,
                [key]: !prev.announcements[key]
            }
        }));
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Small Badge Header */}
            <span className="px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/[0.03] text-white/40 border border-white/[0.08] inline-block">
                Voice & TTS
            </span>

            {/* Main Toggle */}
            <div className="card-premium p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-sm mb-0.5">Voice Notifications</h3>
                        <p className="text-xs text-white/40">Audio announcements during sessions</p>
                    </div>
                    <button
                        onClick={() => updateSetting('enabled', !settings.enabled)}
                        className="relative w-14 h-7 rounded-full transition-all"
                        style={{
                            background: settings.enabled ? accent : 'rgba(255,255,255,0.1)'
                        }}
                    >
                        <div
                            className="absolute w-5 h-5 rounded-full bg-white top-1 transition-all"
                            style={{
                                left: settings.enabled ? '32px' : '4px'
                            }}
                        />
                    </button>
                </div>
            </div>

            {settings.enabled && (
                <>
                    {/* Voice Selection - Clean Grid */}
                    <div className="card-premium p-5">
                        <h3 className="font-bold text-sm mb-4">Voice</h3>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {voices.map((voice) => (
                                <button
                                    key={voice.id}
                                    onClick={() => updateSetting('voice', voice.id)}
                                    className="p-3 rounded-lg text-left transition-all"
                                    style={{
                                        background: settings.voice === voice.id ? `${accent}15` : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${settings.voice === voice.id ? accent + '40' : 'rgba(255,255,255,0.05)'}`
                                    }}
                                >
                                    <p className="font-bold text-xs">{voice.name}</p>
                                    <p className="text-[10px] text-white/40">{voice.gender} • {voice.language}</p>
                                </button>
                            ))}
                        </div>

                        {/* Test Button */}
                        <button
                            onClick={testVoice}
                            disabled={testingVoice}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs transition-all"
                            style={{
                                background: `${accent}15`,
                                border: `1px solid ${accent}30`,
                                color: accent
                            }}
                        >
                            {testingVoice ? <Pause size={14} /> : <Play size={14} />}
                            {testingVoice ? 'Playing...' : 'Test Voice'}
                        </button>
                    </div>

                    {/* Voice Controls - Compact Sliders */}
                    <div className="card-premium p-5 space-y-4">
                        <h3 className="font-bold text-sm mb-4">Controls</h3>

                        {/* Speed */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-medium text-white/60">Speed</label>
                                <span className="text-xs font-bold" style={{ color: accent }}>{settings.speed.toFixed(1)}x</span>
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="2.0"
                                step="0.1"
                                value={settings.speed}
                                onChange={(e) => updateSetting('speed', parseFloat(e.target.value))}
                                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, ${accent} 0%, ${accent} ${(settings.speed - 0.5) / 1.5 * 100}%, rgba(255,255,255,0.1) ${(settings.speed - 0.5) / 1.5 * 100}%, rgba(255,255,255,0.1) 100%)`
                                }}
                            />
                        </div>

                        {/* Pitch */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-medium text-white/60">Pitch</label>
                                <span className="text-xs font-bold" style={{ color: accent }}>{settings.pitch.toFixed(1)}</span>
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="2.0"
                                step="0.1"
                                value={settings.pitch}
                                onChange={(e) => updateSetting('pitch', parseFloat(e.target.value))}
                                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, ${accent} 0%, ${accent} ${(settings.pitch - 0.5) / 1.5 * 100}%, rgba(255,255,255,0.1) ${(settings.pitch - 0.5) / 1.5 * 100}%, rgba(255,255,255,0.1) 100%)`
                                }}
                            />
                        </div>

                        {/* Volume */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-medium text-white/60">Volume</label>
                                <span className="text-xs font-bold" style={{ color: accent }}>{Math.round(settings.volume * 100)}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Volume2 size={14} className="text-white/40" />
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={settings.volume}
                                    onChange={(e) => updateSetting('volume', parseFloat(e.target.value))}
                                    className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, ${accent} 0%, ${accent} ${settings.volume * 100}%, rgba(255,255,255,0.1) ${settings.volume * 100}%, rgba(255,255,255,0.1) 100%)`
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Announcements - Compact List */}
                    <div className="card-premium p-5">
                        <h3 className="font-bold text-sm mb-3">Announcements</h3>
                        <div className="space-y-2">
                            {Object.entries({
                                sessionStart: 'Session Start',
                                sessionEnd: 'Session Complete',
                                breakStart: 'Break Start',
                                breakEnd: 'Break Complete',
                                milestone: 'Milestone Reached'
                            }).map(([key, label]) => (
                                <div
                                    key={key}
                                    className="flex items-center justify-between p-2.5 rounded-lg"
                                    style={{ background: 'rgba(255,255,255,0.02)' }}
                                >
                                    <span className="text-xs font-medium text-white/70">{label}</span>
                                    <button
                                        onClick={() => toggleAnnouncement(key as keyof VoiceSettings['announcements'])}
                                        className="relative w-10 h-5 rounded-full transition-all"
                                        style={{
                                            background: settings.announcements[key as keyof VoiceSettings['announcements']]
                                                ? accent
                                                : 'rgba(255,255,255,0.1)'
                                        }}
                                    >
                                        <div
                                            className="absolute w-3.5 h-3.5 rounded-full bg-white top-0.5 transition-all"
                                            style={{
                                                left: settings.announcements[key as keyof VoiceSettings['announcements']] ? '22px' : '2px'
                                            }}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
