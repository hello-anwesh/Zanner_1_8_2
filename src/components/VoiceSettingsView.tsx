import React, { useState } from 'react';
import { Volume2, Play, Pause, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

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
    onBack?: () => void;
}

export const VoiceSettingsView: React.FC<VoiceSettingsViewProps> = ({ accent, onBack }) => {
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
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

    // Load available voices from system
    React.useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            setAvailableVoices(voices);
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    const voices = [
        // Premium curated voices
        { id: 'Samantha', name: 'Samantha', gender: 'Female', language: 'en-US', description: 'Warm & clear' },
        { id: 'Alex', name: 'Alex', gender: 'Male', language: 'en-US', description: 'Natural & professional' },
        { id: 'Victoria', name: 'Victoria', gender: 'Female', language: 'en-GB', description: 'British accent' },
        { id: 'Daniel', name: 'Daniel', gender: 'Male', language: 'en-GB', description: 'Deep & authoritative' },
        { id: 'Karen', name: 'Karen', gender: 'Female', language: 'en-AU', description: 'Australian' },
        { id: 'Moira', name: 'Moira', gender: 'Female', language: 'en-IE', description: 'Irish accent' },
        { id: 'Rishi', name: 'Rishi', gender: 'Male', language: 'en-IN', description: 'Indian accent' },
        { id: 'Fiona', name: 'Fiona', gender: 'Female', language: 'en-SCT', description: 'Scottish accent' }
    ];

    const testVoice = () => {
        if ('speechSynthesis' in window) {
            setTestingVoice(true);

            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(
                "Great work! You're crushing your productivity goals. Let's keep the momentum going."
            );

            // Find the selected voice in available voices
            const selectedVoice = availableVoices.find(v =>
                v.name.includes(settings.voice) || v.voiceURI.includes(settings.voice)
            );

            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }

            utterance.rate = settings.speed;
            utterance.pitch = settings.pitch;
            utterance.volume = settings.volume;

            utterance.onend = () => setTestingVoice(false);
            utterance.onerror = () => setTestingVoice(false);

            window.speechSynthesis.speak(utterance);
        } else {
            alert('Text-to-speech not supported in your browser');
        }
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
        <div className="p-12 max-w-5xl mx-auto space-y-10" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
            {/* Back Button */}
            {onBack && (
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 group"
                >
                    <ArrowLeft size={16} style={{ color: accent }} />
                    <span className="text-sm font-medium text-white/60 group-hover:text-white/90">Back to Settings</span>
                </motion.button>
            )}

            {/* Header Badge */}
            <span className="px-5 py-2.5 rounded-2xl text-sm font-black uppercase tracking-wider bg-white/[0.08] text-white/60 border border-white/[0.15] inline-block">
                Voice & TTS
            </span>

            {/* Main Toggle */}
            <motion.div
                whileHover={{ scale: 1.01 }}
                className="p-8 rounded-[28px]"
                style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    backdropFilter: "blur(30px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
                }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-black text-2xl mb-3 text-white leading-none">Voice Notifications</h3>
                        <p className="text-base font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>Audio announcements during sessions</p>
                    </div>
                    <button
                        onClick={() => updateSetting('enabled', !settings.enabled)}
                        className="relative w-16 h-9 rounded-full transition-all"
                        style={{
                            background: settings.enabled ? `linear-gradient(135deg, ${accent} 0%, ${accent}DD 100%)` : 'rgba(255,255,255,0.12)',
                            boxShadow: settings.enabled ? `0 6px 20px ${accent}60` : 'inset 0 2px 6px rgba(0,0,0,0.4)'
                        }}
                    >
                        <div
                            className="absolute w-7 h-7 rounded-full bg-white top-1 transition-all shadow-xl"
                            style={{
                                left: settings.enabled ? '32px' : '4px'
                            }}
                        />
                    </button>
                </div>
            </motion.div>

            {settings.enabled && (
                <>
                    {/* Voice Selection */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-8 rounded-[28px]"
                        style={{
                            background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            backdropFilter: "blur(30px)",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
                        }}
                    >
                        <h3 className="font-black text-2xl mb-8 text-white leading-none">Voice</h3>
                        <div className="grid grid-cols-3 gap-5 mb-8">
                            {voices.map((voice) => (
                                <motion.button
                                    key={voice.id}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    onClick={() => updateSetting('voice', voice.id)}
                                    className="p-6 rounded-[20px] text-left transition-all"
                                    style={{
                                        background: settings.voice === voice.id
                                            ? `linear-gradient(135deg, ${accent}20 0%, ${accent}10 100%)`
                                            : 'rgba(255,255,255,0.04)',
                                        border: `1.5px solid ${settings.voice === voice.id ? accent + '60' : 'rgba(255,255,255,0.08)'}`,
                                        boxShadow: settings.voice === voice.id ? `0 8px 24px ${accent}30` : 'none'
                                    }}
                                >
                                    <p className="font-bold text-lg mb-1 text-white">{voice.name}</p>
                                    <p className="text-xs font-medium mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>{voice.gender} • {voice.language}</p>
                                    <p className="text-xs font-medium" style={{ color: accent }}>{voice.description}</p>
                                </motion.button>
                            ))}
                        </div>

                        {/* Test Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={testVoice}
                            disabled={testingVoice}
                            className="w-full flex items-center justify-center gap-3 px-6 py-5 rounded-[20px] font-bold text-base transition-all"
                            style={{
                                background: `linear-gradient(135deg, ${accent}25 0%, ${accent}15 100%)`,
                                border: `1.5px solid ${accent}40`,
                                color: accent
                            }}
                        >
                            {testingVoice ? <Pause size={18} /> : <Play size={18} />}
                            {testingVoice ? 'Playing...' : 'Test Voice'}
                        </motion.button>
                    </motion.div>

                    {/* Voice Controls */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-8 rounded-[28px] space-y-8"
                        style={{
                            background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            backdropFilter: "blur(30px)",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
                        }}
                    >
                        <h3 className="font-black text-2xl text-white leading-none">Controls</h3>

                        {/* Speed */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-base font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>Speed</label>
                                <span className="text-base font-black" style={{ color: accent }}>{settings.speed.toFixed(1)}x</span>
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="2.0"
                                step="0.1"
                                value={settings.speed}
                                onChange={(e) => updateSetting('speed', parseFloat(e.target.value))}
                                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, ${accent} 0%, ${accent} ${(settings.speed - 0.5) / 1.5 * 100}%, rgba(255,255,255,0.12) ${(settings.speed - 0.5) / 1.5 * 100}%, rgba(255,255,255,0.12) 100%)`
                                }}
                            />
                        </div>

                        {/* Pitch */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-base font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>Pitch</label>
                                <span className="text-base font-black" style={{ color: accent }}>{settings.pitch.toFixed(1)}</span>
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="2.0"
                                step="0.1"
                                value={settings.pitch}
                                onChange={(e) => updateSetting('pitch', parseFloat(e.target.value))}
                                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, ${accent} 0%, ${accent} ${(settings.pitch - 0.5) / 1.5 * 100}%, rgba(255,255,255,0.12) ${(settings.pitch - 0.5) / 1.5 * 100}%, rgba(255,255,255,0.12) 100%)`
                                }}
                            />
                        </div>

                        {/* Volume */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-base font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>Volume</label>
                                <span className="text-base font-black" style={{ color: accent }}>{Math.round(settings.volume * 100)}%</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Volume2 size={20} className="text-white/50" />
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={settings.volume}
                                    onChange={(e) => updateSetting('volume', parseFloat(e.target.value))}
                                    className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, ${accent} 0%, ${accent} ${settings.volume * 100}%, rgba(255,255,255,0.12) ${settings.volume * 100}%, rgba(255,255,255,0.12) 100%)`
                                    }}
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Announcements */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-8 rounded-[28px]"
                        style={{
                            background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            backdropFilter: "blur(30px)",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
                        }}
                    >
                        <h3 className="font-black text-2xl mb-8 text-white leading-none">Announcements</h3>
                        <div className="space-y-4">
                            {Object.entries({
                                sessionStart: 'Session Start',
                                sessionEnd: 'Session Complete',
                                breakStart: 'Break Start',
                                breakEnd: 'Break Complete',
                                milestone: 'Milestone Reached'
                            }).map(([key, label]) => (
                                <motion.div
                                    key={key}
                                    whileHover={{ scale: 1.01, x: 4 }}
                                    className="flex items-center justify-between p-5 rounded-[20px]"
                                    style={{
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)'
                                    }}
                                >
                                    <span className="text-base font-bold" style={{ color: "rgba(255,255,255,0.8)" }}>{label}</span>
                                    <button
                                        onClick={() => toggleAnnouncement(key as keyof VoiceSettings['announcements'])}
                                        className="relative w-14 h-8 rounded-full transition-all"
                                        style={{
                                            background: settings.announcements[key as keyof VoiceSettings['announcements']]
                                                ? `linear-gradient(135deg, ${accent} 0%, ${accent}DD 100%)`
                                                : 'rgba(255,255,255,0.12)',
                                            boxShadow: settings.announcements[key as keyof VoiceSettings['announcements']]
                                                ? `0 4px 16px ${accent}50`
                                                : 'inset 0 2px 6px rgba(0,0,0,0.4)'
                                        }}
                                    >
                                        <div
                                            className="absolute w-6 h-6 rounded-full bg-white top-1 transition-all shadow-lg"
                                            style={{
                                                left: settings.announcements[key as keyof VoiceSettings['announcements']] ? '28px' : '4px'
                                            }}
                                        />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
};
