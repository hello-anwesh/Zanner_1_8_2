import { useEffect, useRef } from "react";
import { eventBus, databaseService, TimerMode } from "../services";

export function useSessionLogger() {
    const currentSessionId = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        // Initialize DB
        databaseService.init().catch(console.error);

        const handleStart = async (event: any) => {
            if (event.type !== "SESSION_START") return;

            try {
                // If there was a previous unclosed session, mark it abandoned
                if (currentSessionId.current) {
                    await databaseService.updateSession(currentSessionId.current, {
                        status: 'ABANDONED',
                        end_time: new Date().toISOString()
                    });
                }

                const mode = event.mode as TimerMode;
                // Default durations based on mode (can be refined if event passes actual duration)
                const durationMinutes = mode === 'focus' ? 25 : (mode === 'longBreak' ? 15 : 5);

                const id = await databaseService.createSession({
                    start_time: new Date().toISOString(),
                    mode: mode,
                    duration_minutes: durationMinutes,
                    status: 'IN_PROGRESS'
                });

                currentSessionId.current = id;
                startTimeRef.current = Date.now();
            } catch (error) {
                console.error("Failed to log session start:", error);
            }
        };

        const handleEnd = async (event: any) => {
            if (event.type !== "SESSION_END" || !currentSessionId.current) return;

            try {
                const now = Date.now();
                const actualDuration = startTimeRef.current
                    ? Math.floor((now - startTimeRef.current) / 1000)
                    : 0;

                await databaseService.updateSession(currentSessionId.current, {
                    status: 'COMPLETED',
                    end_time: new Date().toISOString(),
                    actual_duration_seconds: actualDuration
                });

                currentSessionId.current = null;
                startTimeRef.current = null;
            } catch (error) {
                console.error("Failed to log session end:", error);
            }
        };

        // We assume explicit "STOP" event might be needed later for ABANDONED
        // For now, if code calls SESSION_END it's completed. 
        // If app closes, next start will mark previous as abandoned (handled in handleStart).

        const unsubStart = eventBus.on("SESSION_START", handleStart);
        const unsubEnd = eventBus.on("SESSION_END", handleEnd);

        return () => {
            unsubStart();
            unsubEnd();
        };
    }, []);
}
