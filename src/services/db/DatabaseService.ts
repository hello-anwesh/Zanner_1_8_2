import Database from '@tauri-apps/plugin-sql';
import { LoggedSession } from './types';

class DatabaseService {
    private db: Database | null = null;
    private readonly DB_NAME = 'sqlite:pomodoro.db';

    async init() {
        try {
            this.db = await Database.load(this.DB_NAME);
            await this.createTables();
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Failed to initialize database:', error);
            throw error;
        }
    }

    private async createTables() {
        if (!this.db) return;

        const query = `
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                start_time TEXT NOT NULL,
                end_time TEXT,
                mode TEXT NOT NULL,
                duration_minutes INTEGER NOT NULL,
                actual_duration_seconds INTEGER,
                status TEXT NOT NULL CHECK(status IN ('COMPLETED', 'ABANDONED', 'IN_PROGRESS')),
                notes TEXT
            );
        `;
        await this.db.execute(query);
    }

    async createSession(session: Omit<LoggedSession, 'id'>): Promise<number> {
        if (!this.db) throw new Error('Database not initialized');

        const query = `
            INSERT INTO sessions (start_time, mode, duration_minutes, status, notes)
            VALUES ($1, $2, $3, $4, $5)
        `;

        const result = await this.db.execute(query, [
            session.start_time,
            session.mode,
            session.duration_minutes,
            session.status,
            session.notes || null,
        ]);

        return result.lastInsertId || 0;
    }

    async updateSession(id: number, updates: Partial<LoggedSession>) {
        if (!this.db) throw new Error('Database not initialized');

        const sets: string[] = [];
        const values: any[] = [];
        let i = 1;

        if (updates.end_time) {
            sets.push(`end_time = $${i++}`);
            values.push(updates.end_time);
        }
        if (updates.actual_duration_seconds !== undefined) {
            sets.push(`actual_duration_seconds = $${i++}`);
            values.push(updates.actual_duration_seconds);
        }
        if (updates.status) {
            sets.push(`status = $${i++}`);
            values.push(updates.status);
        }
        if (updates.notes) {
            sets.push(`notes = $${i++}`);
            values.push(updates.notes);
        }

        if (sets.length === 0) return;

        values.push(id);
        const query = `UPDATE sessions SET ${sets.join(', ')} WHERE id = $${i}`;
        await this.db.execute(query, values);
    }

    async getSessions(): Promise<LoggedSession[]> {
        if (!this.db) {
            await this.init(); // Auto-init if needed
        }
        if (!this.db) throw new Error('Database not initialized');
        return await this.db.select('SELECT * FROM sessions ORDER BY start_time DESC');
    }

    async getRecentSessions(limit: number = 20): Promise<LoggedSession[]> {
        if (!this.db) {
            await this.init();
        }
        if (!this.db) throw new Error('Database not initialized');
        return await this.db.select(`SELECT * FROM sessions ORDER BY start_time DESC LIMIT ${limit}`);
    }

    async getAnalyticsSummary() {
        if (!this.db) {
            await this.init();
        }
        if (!this.db) throw new Error('Database not initialized');

        // Get today's stats
        const todayStr = new Date().toISOString().split('T')[0];
        const todaySessions: LoggedSession[] = await this.db.select(
            `SELECT * FROM sessions WHERE start_time LIKE '${todayStr}%'`
        );

        const totalFocusTime = todaySessions
            .filter(s => s.mode === 'focus' && s.status === 'COMPLETED')
            .reduce((acc, s) => acc + (s.actual_duration_seconds || 0), 0);

        const abandonedCount = todaySessions.filter(s => s.status === 'ABANDONED').length;
        const completedCount = todaySessions.filter(s => s.status === 'COMPLETED').length;

        // Get weekly summary (last 7 days)
        const weeklyStats: any[] = await this.db.select(`
            SELECT 
                substr(start_time, 1, 10) as date,
                COUNT(*) as total_sessions,
                SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN mode = 'focus' THEN actual_duration_seconds ELSE 0 END) as focus_seconds
            FROM sessions 
            WHERE start_time >= date('now', '-7 days')
            GROUP BY date
            ORDER BY date DESC
        `);

        return {
            today: {
                focusTimeMinutes: Math.round(totalFocusTime / 60),
                completed: completedCount,
                abandoned: abandonedCount,
                sessions: todaySessions.map(s => ({ mode: s.mode, duration: s.duration_minutes, status: s.status }))
            },
            weekly: weeklyStats,
            totalSessions: await this.db.select('SELECT COUNT(*) as count FROM sessions').then((r: any) => r[0].count)
        };
    }
}

export const databaseService = new DatabaseService();
