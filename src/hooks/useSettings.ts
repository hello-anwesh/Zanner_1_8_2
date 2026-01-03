import { useState, useEffect } from 'react';

export interface Settings {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    autoStartBreaks: boolean;
    autoStartWork: boolean;
    aiProvider: 'local' | 'openai';
}

const DEFAULT_SETTINGS: Settings = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    autoStartBreaks: false,
    autoStartWork: false,
    aiProvider: 'local',
};

export function useSettings() {
    const [settings, setSettings] = useState<Settings>(() => {
        const stored = localStorage.getItem('chronos-settings');
        return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    });

    useEffect(() => {
        localStorage.setItem('chronos-settings', JSON.stringify(settings));
    }, [settings]);

    const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    return { settings, updateSetting };
}
