export type SessionStatus = 'COMPLETED' | 'ABANDONED' | 'IN_PROGRESS';
export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface LoggedSession {
    id?: number;
    start_time: string; // ISO string
    end_time?: string; // ISO string
    mode: TimerMode;
    duration_minutes: number;
    actual_duration_seconds?: number;
    status: SessionStatus;
    notes?: string;
}
