import { useState, useEffect } from "react";
import { databaseService, LoggedSession } from "../services";

export interface DashboardStats {
    totalSessions: number;
    totalMinutes: number;
    completionRate: number;
    streak: number;
}

export interface HistoricalData {
    last7Days: string[];
    sessionsPerDay: number[];
    focusTimePerDay: number[];
    bestTimes: { time: string; sessions: number; color: string }[];
    weeklyTotal: number;
    weeklyAverage: number;
    weeklyChange: number;
}

export function useAnalytics() {
    const [sessions, setSessions] = useState<LoggedSession[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        totalSessions: 0,
        totalMinutes: 0,
        completionRate: 0,
        streak: 0
    });
    const [historical, setHistorical] = useState<HistoricalData>({
        last7Days: [],
        sessionsPerDay: [],
        focusTimePerDay: [],
        bestTimes: [],
        weeklyTotal: 0,
        weeklyAverage: 0,
        weeklyChange: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const allSessions = await databaseService.getSessions();
            setSessions(allSessions);

            // Calculate stats
            const total = allSessions.length;
            const completed = allSessions.filter(s => s.status === 'COMPLETED');
            const minutes = completed.reduce((acc, curr) => acc + (curr.actual_duration_seconds ? curr.actual_duration_seconds / 60 : 0), 0);

            setStats({
                totalSessions: total,
                totalMinutes: Math.round(minutes),
                completionRate: total > 0 ? Math.round((completed.length / total) * 100) : 0,
                streak: calculateStreak(completed)
            });

            // Calculate historical data
            setHistorical(calculateHistoricalData(completed));
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStreak = (sessions: LoggedSession[]) => {
        if (sessions.length === 0) return 0;

        // Sort by date desc
        const sorted = [...sessions].sort((a, b) =>
            new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        );

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (const session of sorted) {
            const sessionDate = new Date(session.start_time);
            sessionDate.setHours(0, 0, 0, 0);

            const diffDays = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === streak) {
                streak++;
                currentDate = new Date(sessionDate);
            } else if (diffDays > streak) {
                break;
            }
        }

        return streak;
    };

    const calculateHistoricalData = (sessions: LoggedSession[]): HistoricalData => {
        const now = new Date();
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const last7Days: string[] = [];
        const sessionsPerDay: number[] = [];
        const focusTimePerDay: number[] = [];

        // Get last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const dayName = dayNames[date.getDay()];
            last7Days.push(dayName);

            // Count sessions and focus time for this day
            const daySessions = sessions.filter(s => {
                const sessionDate = new Date(s.start_time);
                sessionDate.setHours(0, 0, 0, 0);
                return sessionDate.getTime() === date.getTime();
            });

            sessionsPerDay.push(daySessions.length);
            const dayMinutes = daySessions.reduce((acc, s) =>
                acc + (s.actual_duration_seconds ? s.actual_duration_seconds / 60 : 0), 0
            );
            focusTimePerDay.push(Math.round(dayMinutes));
        }

        // Calculate best times (group by hour)
        const hourCounts: { [hour: number]: number } = {};
        sessions.forEach(s => {
            const hour = new Date(s.start_time).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        const bestTimes = Object.entries(hourCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([hour, count], i) => {
                const h = parseInt(hour);
                const timeStr = `${h === 0 ? 12 : h > 12 ? h - 12 : h}:00 - ${h + 2 === 0 ? 12 : h + 2 > 12 ? h - 10 : h + 2}:00 ${h >= 12 ? 'PM' : 'AM'}`;
                const colors = ['#10B981', '#3B82F6', '#8B5CF6'];
                return {
                    time: timeStr,
                    sessions: count,
                    color: colors[i]
                };
            });

        // Weekly summary
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - 7);
        const thisWeek = sessions.filter(s => new Date(s.start_time) >= weekStart);
        const weeklyTotal = thisWeek.reduce((acc, s) =>
            acc + (s.actual_duration_seconds ? s.actual_duration_seconds / 60 : 0), 0
        );
        const weeklyAverage = weeklyTotal / 7;

        // Previous week for comparison
        const prevWeekStart = new Date(weekStart);
        prevWeekStart.setDate(prevWeekStart.getDate() - 7);
        const prevWeek = sessions.filter(s => {
            const d = new Date(s.start_time);
            return d >= prevWeekStart && d < weekStart;
        });
        const prevWeekTotal = prevWeek.reduce((acc, s) =>
            acc + (s.actual_duration_seconds ? s.actual_duration_seconds / 60 : 0), 0
        );
        const weeklyChange = prevWeekTotal > 0
            ? Math.round(((weeklyTotal - prevWeekTotal) / prevWeekTotal) * 100)
            : 0;

        return {
            last7Days,
            sessionsPerDay,
            focusTimePerDay,
            bestTimes,
            weeklyTotal: Math.round(weeklyTotal / 60 * 10) / 10, // hours with 1 decimal
            weeklyAverage: Math.round(weeklyAverage / 60 * 10) / 10,
            weeklyChange
        };
    };

    useEffect(() => {
        fetchStats();
        // Refresh on window focus could be added here
    }, []);

    return { sessions, stats, historical, loading, refresh: fetchStats };
}
