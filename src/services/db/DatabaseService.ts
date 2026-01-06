import Database from '@tauri-apps/plugin-sql';
import { LoggedSession } from './types';

class DatabaseService {
    private db: Database | null = null;
    private readonly DB_NAME = 'sqlite:pomodoro.db';

    async init() {
        try {
            if (this.db) return; // Already initialized

            console.log('Initializing database connection...');
            this.db = await Database.load(this.DB_NAME);

            console.log('Database loaded, checking tables...');
            await this.createTables();

            // Verify table existence
            const tables = await this.db.select("SELECT name FROM sqlite_master WHERE type='table' AND name='sessions'");
            if (Array.isArray(tables) && tables.length === 0) {
                console.error('CRITICAL: Table "sessions" was not created! Retrying creation...');
                await this.createTables();
            } else {
                console.log('Database verified: "sessions" table exists.');
            }
        } catch (error) {
            console.error('Failed to initialize database:', error);
            // Reset db instance to allow retry
            this.db = null;
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

    async seedMockData() {
        if (!this.db) await this.init();
        if (!this.db) throw new Error('Database not initialized');

        // Check if data exists
        const count: any[] = await this.db.select('SELECT COUNT(*) as c FROM sessions');
        if (count[0].c > 0) {
            console.log('Database already has data, skipping seed.');
            return;
        }

        console.log('Seeding mock data...');
        const now = new Date();
        const statuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'ABANDONED'];

        for (let i = 0; i < 20; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - Math.floor(Math.random() * 7)); // Last 7 days
            date.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0); // Work hours

            const duration = 25;
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const actual = status === 'COMPLETED' ? duration * 60 : Math.floor(Math.random() * duration * 60);

            await this.createSession({
                start_time: date.toISOString(),
                mode: 'focus',
                duration_minutes: duration,
                actual_duration_seconds: actual,
                status: status as any,
                notes: 'Mock session data',
                end_time: new Date(date.getTime() + actual * 1000).toISOString()
            });
        }
        console.log('Mock data seeded successfully!');
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
