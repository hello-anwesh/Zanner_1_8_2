import { databaseService } from "../db/DatabaseService";

export interface JournalEntry {
    id: number;
    date: string; // YYYY-MM-DD
    content: string;
    mood?: 'great' | 'good' | 'okay' | 'struggling' | 'burnt-out';
    tags?: string[];
    created_at: number;
    updated_at: number;
}

class JournalService {
    private db: any = null;

    async init(): Promise<void> {
        if (this.db) return;

        try {
            this.db = await databaseService.getDb();

            // Create journal table
            await this.db.execute(`
                CREATE TABLE IF NOT EXISTS journal_entries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL UNIQUE,
                    content TEXT NOT NULL,
                    mood TEXT,
                    tags TEXT,
                    created_at INTEGER NOT NULL,
                    updated_at INTEGER NOT NULL
                )
            `);

            console.log("✅ Journal database initialized");
        } catch (error) {
            console.error("Failed to init journal database:", error);
            throw error;
        }
    }

    async createOrUpdateEntry(date: string, content: string, mood?: string, tags?: string[]): Promise<JournalEntry> {
        await this.init();

        const now = Date.now();
        const tagsJson = tags ? JSON.stringify(tags) : null;

        try {
            // Try to update existing entry for this date
            const existing = await this.getEntry(date);

            if (existing) {
                await this.db.execute(
                    `UPDATE journal_entries 
                     SET content = ?, mood = ?, tags = ?, updated_at = ?
                     WHERE date = ?`,
                    [content, mood || null, tagsJson, now, date]
                );
            } else {
                await this.db.execute(
                    `INSERT INTO journal_entries (date, content, mood, tags, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [date, content, mood || null, tagsJson, now, now]
                );
            }

            return this.getEntry(date) as Promise<JournalEntry>;
        } catch (error) {
            console.error("Failed to save journal entry:", error);
            throw error;
        }
    }

    async getEntry(date: string): Promise<JournalEntry | null> {
        await this.init();

        try {
            const result = await this.db.select<JournalEntry[]>(
                "SELECT * FROM journal_entries WHERE date = ?",
                [date]
            );

            if (result && result.length > 0) {
                const entry = result[0];
                if (entry.tags && typeof entry.tags === 'string') {
                    entry.tags = JSON.parse(entry.tags);
                }
                return entry;
            }
            return null;
        } catch (error) {
            console.error("Failed to get journal entry:", error);
            return null;
        }
    }

    async getRecentEntries(limit: number = 7): Promise<JournalEntry[]> {
        await this.init();

        try {
            const result = await this.db.select<JournalEntry[]>(
                "SELECT * FROM journal_entries ORDER BY date DESC LIMIT ?",
                [limit]
            );

            return result.map(entry => {
                if (entry.tags && typeof entry.tags === 'string') {
                    entry.tags = JSON.parse(entry.tags);
                }
                return entry;
            });
        } catch (error) {
            console.error("Failed to get recent entries:", error);
            return [];
        }
    }

    async getAllEntries(): Promise<JournalEntry[]> {
        await this.init();

        try {
            const result = await this.db.select<JournalEntry[]>(
                "SELECT * FROM journal_entries ORDER BY date DESC"
            );

            return result.map(entry => {
                if (entry.tags && typeof entry.tags === 'string') {
                    entry.tags = JSON.parse(entry.tags);
                }
                return entry;
            });
        } catch (error) {
            console.error("Failed to get all entries:", error);
            return [];
        }
    }

    async deleteEntry(date: string): Promise<void> {
        await this.init();

        try {
            await this.db.execute("DELETE FROM journal_entries WHERE date = ?", [date]);
        } catch (error) {
            console.error("Failed to delete entry:", error);
            throw error;
        }
    }

    async searchEntries(query: string): Promise<JournalEntry[]> {
        await this.init();

        try {
            const result = await this.db.select<JournalEntry[]>(
                "SELECT * FROM journal_entries WHERE content LIKE ? ORDER BY date DESC",
                [`%${query}%`]
            );

            return result.map(entry => {
                if (entry.tags && typeof entry.tags === 'string') {
                    entry.tags = JSON.parse(entry.tags);
                }
                return entry;
            });
        } catch (error) {
            console.error("Failed to search entries:", error);
            return [];
        }
    }

    // Get context summary for Zeni
    async getContextForAI(days: number = 3): Promise<string> {
        const entries = await this.getRecentEntries(days);

        if (entries.length === 0) {
            return "No recent journal entries.";
        }

        let context = `RECENT JOURNAL ENTRIES (Last ${days} days):\n\n`;

        entries.forEach(entry => {
            const date = new Date(entry.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            context += `[${date}]`;
            if (entry.mood) context += ` Mood: ${entry.mood}`;
            context += `\n${entry.content.substring(0, 300)}${entry.content.length > 300 ? '...' : ''}\n\n`;
        });

        return context;
    }
}

export const journalService = new JournalService();
