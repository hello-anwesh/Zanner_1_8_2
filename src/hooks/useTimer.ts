import { useState, useEffect, useCallback } from 'react';

export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const TIMER_CONFIG = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
};

export function useTimer() {
    const [mode, setMode] = useState<TimerMode>('work');
    const [timeLeft, setTimeLeft] = useState(TIMER_CONFIG.work);
    const [isActive, setIsActive] = useState(false);

    const switchMode = useCallback((newMode: TimerMode) => {
        setMode(newMode);
        setTimeLeft(TIMER_CONFIG[newMode]);
        setIsActive(false);
    }, []);

    const toggleTimer = useCallback(() => {
        setIsActive((prev) => !prev);
    }, []);

    const resetTimer = useCallback(() => {
        setTimeLeft(TIMER_CONFIG[mode]);
        setIsActive(false);
    }, [mode]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // specific logic for timer end can go here (sound, etc)
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const progress = ((TIMER_CONFIG[mode] - timeLeft) / TIMER_CONFIG[mode]) * 100;

    return {
        timeLeft,
        isActive,
        mode,
        progress,
        toggleTimer,
        resetTimer,
        switchMode,
    };
}
