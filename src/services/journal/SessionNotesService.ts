/**
 * Session Notes Service
 * Manages session-specific journal notes as first-class entities
 * Separate from daily journal entries for clean data separation
 */

import { databaseService } from "../db/DatabaseService";
import { getLocalDateString, getLocalTimestamp } from "../../utils/dateUtils";

export interface SessionNote {
    id: string;
    date: string;              // YYYY-MM-DD (local)
    session_number: number;
    duration: number;          // in minutes
    type: 'focus' | 'break';
    started_at: string;        // ISO timestamp
    ended_at: string;          // ISO timestamp
    quick_reflections: string[]; // ["Focused", "Made progress"]
    notes: string;             // User's written notes
    ai_reflection: string | null; // AI generated reflection
    created_at: string;
}

export interface SessionNoteInput {
    sessionNumber: number;
    duration: number;
    type: 'focus' | 'break';
    startTime: Date;
    endTime: Date;
    quickReflections: string[];
    notes: string;
    aiReflection: string | null;
}

class SessionNotesService {
    private db: any = null;
    private initialized = false;

    async init(): Promise<void> {
        if (this.initialized) return;

        try {
            this.db = await databaseService.getDb();

            // Create session_notes table
            await this.db.execute(`
                CREATE TABLE IF NOT EXISTS session_notes (
                    id TEXT PRIMARY KEY,
                    date TEXT NOT NULL,
                    session_number INTEGER NOT NULL,
                    duration INTEGER NOT NULL,
                    type TEXT NOT NULL,
                    started_at TEXT NOT NULL,
                    ended_at TEXT NOT NULL,
                    quick_reflections TEXT,
                    notes TEXT,
                    ai_reflection TEXT,
                    created_at TEXT NOT NULL
                )
            `);

            // Create index for date lookups
            await this.db.execute(`
                CREATE INDEX IF NOT EXISTS idx_session_notes_date 
                ON session_notes(date)
            `);

            this.initialized = true;
            console.log("✅ Session notes database initialized");
        } catch (error) {
            console.error("[SessionNotesService] Failed to init:", error);
            throw error;
        }
    }

    /**
     * Create a new session note
     */
    async createNote(input: SessionNoteInput): Promise<SessionNote> {
        await this.init();

        const now = new Date();
        const id = `session_${now.getTime()}_${Math.random().toString(36).slice(2, 7)}`;
        const date = getLocalDateString(now);

        const note: SessionNote = {
            id,
            date,
            session_number: input.sessionNumber,
            duration: input.duration,
            type: input.type,
            started_at: getLocalTimestamp(input.startTime),
            ended_at: getLocalTimestamp(input.endTime),
            quick_reflections: input.quickReflections,
            notes: input.notes,
            ai_reflection: input.aiReflection,
            created_at: getLocalTimestamp(now)
        };

        try {
            await this.db.execute(
                `INSERT INTO session_notes 
                 (id, date, session_number, duration, type, started_at, ended_at, quick_reflections, notes, ai_reflection, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    note.id,
                    note.date,
                    note.session_number,
                    note.duration,
                    note.type,
                    note.started_at,
                    note.ended_at,
                    JSON.stringify(note.quick_reflections),
                    note.notes,
                    note.ai_reflection,
                    note.created_at
                ]
            );

            console.log(`[SessionNotesService] Created note ${id} for date ${date}`);
            return note;
        } catch (error) {
            console.error("[SessionNotesService] Failed to create note:", error);
            throw error;
        }
    }

    /**
     * Get all session notes for a specific date
     */
    async getNotesForDate(date: string): Promise<SessionNote[]> {
        await this.init();

        try {
            const rows: any[] = await this.db.select(
                `SELECT * FROM session_notes WHERE date = ? ORDER BY session_number ASC`,
                [date]
            );

            return rows.map(this.parseRow);
        } catch (error) {
            console.error("[SessionNotesService] Failed to get notes:", error);
            return [];
        }
    }

    /**
     * Get a specific session note by ID
     */
    async getNoteById(id: string): Promise<SessionNote | null> {
        await this.init();

        try {
            const rows: any[] = await this.db.select(
                `SELECT * FROM session_notes WHERE id = ?`,
                [id]
            );

            return rows.length > 0 ? this.parseRow(rows[0]) : null;
        } catch (error) {
            console.error("[SessionNotesService] Failed to get note:", error);
            return null;
        }
    }

    /**
     * Get recent session notes across all dates
     */
    async getRecentNotes(limit: number = 20): Promise<SessionNote[]> {
        await this.init();

        try {
            const rows: any[] = await this.db.select(
                `SELECT * FROM session_notes ORDER BY created_at DESC LIMIT ?`,
                [limit]
            );

            return rows.map(this.parseRow);
        } catch (error) {
            console.error("[SessionNotesService] Failed to get recent notes:", error);
            return [];
        }
    }

    /**
     * Update an existing session note
     */
    async updateNote(id: string, updates: Partial<Pick<SessionNote, 'notes' | 'ai_reflection' | 'quick_reflections'>>): Promise<void> {
        await this.init();

        const setClauses: string[] = [];
        const values: any[] = [];

        if (updates.notes !== undefined) {
            setClauses.push('notes = ?');
            values.push(updates.notes);
        }
        if (updates.ai_reflection !== undefined) {
            setClauses.push('ai_reflection = ?');
            values.push(updates.ai_reflection);
        }
        if (updates.quick_reflections !== undefined) {
            setClauses.push('quick_reflections = ?');
            values.push(JSON.stringify(updates.quick_reflections));
        }

        if (setClauses.length === 0) return;

        values.push(id);

        try {
            await this.db.execute(
                `UPDATE session_notes SET ${setClauses.join(', ')} WHERE id = ?`,
                values
            );
        } catch (error) {
            console.error("[SessionNotesService] Failed to update note:", error);
            throw error;
        }
    }

    /**
     * Delete a session note
     */
    async deleteNote(id: string): Promise<void> {
        await this.init();

        try {
            await this.db.execute(
                `DELETE FROM session_notes WHERE id = ?`,
                [id]
            );
        } catch (error) {
            console.error("[SessionNotesService] Failed to delete note:", error);
            throw error;
        }
    }

    /**
     * Get session count for a specific date
     */
    async getSessionCountForDate(date: string): Promise<number> {
        await this.init();

        try {
            const rows: any[] = await this.db.select(
                `SELECT COUNT(*) as count FROM session_notes WHERE date = ?`,
                [date]
            );

            return rows[0]?.count || 0;
        } catch (error) {
            console.error("[SessionNotesService] Failed to get count:", error);
            return 0;
        }
    }

    /**
     * Parse a database row into a SessionNote object
     */
    private parseRow(row: any): SessionNote {
        return {
            ...row,
            quick_reflections: row.quick_reflections
                ? JSON.parse(row.quick_reflections)
                : []
        };
    }
}

export const sessionNotesService = new SessionNotesService();
