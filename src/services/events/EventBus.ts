// Event types for the application
export type TimerMode = "focus" | "shortBreak" | "longBreak";

export type TimerEvent =
    | { type: "SESSION_START"; mode: TimerMode }
    | { type: "SESSION_END"; mode: TimerMode }
    | { type: "SESSION_PAUSE"; mode: TimerMode }
    | { type: "SESSION_RESUME"; mode: TimerMode }
    | { type: "BREAK_WARNING"; minutesLeft: number }
    | { type: "TIMER_TICK"; secondsLeft: number }
    | { type: "PLAY_TRACK"; url: string; name: string };

type EventHandler<T = TimerEvent> = (event: T) => void;

class EventBus {
    private handlers: Map<string, Set<EventHandler>> = new Map();

    on(eventType: TimerEvent["type"], handler: EventHandler): () => void {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, new Set());
        }
        this.handlers.get(eventType)!.add(handler);

        // Return unsubscribe function
        return () => {
            this.handlers.get(eventType)?.delete(handler);
        };
    }

    emit(event: TimerEvent): void {
        const handlers = this.handlers.get(event.type);
        if (handlers) {
            handlers.forEach((handler) => handler(event));
        }
    }

    off(eventType: TimerEvent["type"], handler: EventHandler): void {
        this.handlers.get(eventType)?.delete(handler);
    }

    clear(): void {
        this.handlers.clear();
    }
}

// Singleton instance
export const eventBus = new EventBus();
