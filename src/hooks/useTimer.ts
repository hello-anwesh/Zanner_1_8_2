import { useState, useEffect, useCallback, useRef } from 'react';
import { dockService } from '../services/DockService';

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
    const lastBadgeMinute = useRef<number>(-1);

    const switchMode = useCallback((newMode: TimerMode) => {
        setMode(newMode);
        setTimeLeft(TIMER_CONFIG[newMode]);
        setIsActive(false);
        dockService.onSessionStop();
    }, []);

    const toggleTimer = useCallback(() => {
        setIsActive((prev) => {
            const newActive = !prev;
            if (newActive) {
                // Starting timer
                const minutes = Math.ceil(timeLeft / 60);
                dockService.onSessionStart(minutes);
                lastBadgeMinute.current = minutes;
            } else {
                // Pausing timer
                dockService.onSessionStop();
            }
            return newActive;
        });
    }, [timeLeft]);

    const resetTimer = useCallback(() => {
        setTimeLeft(TIMER_CONFIG[mode]);
        setIsActive(false);
        dockService.onSessionStop();
        lastBadgeMinute.current = -1;
    }, [mode]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    const newTime = prev - 1;

                    // Update dock badge every minute (to avoid too many calls)
                    const minutesRemaining = Math.ceil(newTime / 60);
                    if (minutesRemaining !== lastBadgeMinute.current) {
                        lastBadgeMinute.current = minutesRemaining;
                        dockService.onTimerTick(newTime);
                    }

                    return newTime;
                });
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            // Timer completed - bounce dock icon!
            if (mode === 'work') {
                dockService.onSessionComplete();
            } else {
                // Break ended
                dockService.onSessionComplete();
            }
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode]);

    // Clean up dock badge when component unmounts
    useEffect(() => {
        return () => {
            dockService.onSessionStop();
        };
    }, []);

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
