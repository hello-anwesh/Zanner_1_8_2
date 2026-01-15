import { databaseService } from '../db/DatabaseService';
import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

export interface ChatSession {
    id: string;
    title: string;
    created_at: number;
    updated_at: number;
    messages: ChatMessage[];
    context_type: 'productivity' | 'learning' | 'reflection' | 'general';
}

class ChatSessionService {
    private readonly TABLE_NAME = 'chat_sessions';
    private activeSessionId: string | null = null;

    async init() {
        await databaseService.init();
        const db = await databaseService.getDb();

        await db.execute(`
            CREATE TABLE IF NOT EXISTS ${this.TABLE_NAME} (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                messages TEXT NOT NULL,
                context_type TEXT DEFAULT 'general'
            )
        `);
    }

    async createSession(contextType: ChatSession['context_type'] = 'general', initialTitle: string = 'New Chat'): Promise<ChatSession> {
        const session: ChatSession = {
            id: uuidv4(),
            title: initialTitle,
            created_at: Date.now(),
            updated_at: Date.now(),
            messages: [],
            context_type: contextType
        };

        const db = await databaseService.getDb();
        await db.execute(
            `INSERT INTO ${this.TABLE_NAME} (id, title, created_at, updated_at, messages, context_type) VALUES ($1, $2, $3, $4, $5, $6)`,
            [session.id, session.title, session.created_at, session.updated_at, JSON.stringify(session.messages), session.context_type]
        );

        this.activeSessionId = session.id;
        return session;
    }

    async getSession(id: string): Promise<ChatSession | null> {
        const db = await databaseService.getDb();
        const results: any[] = await db.select(
            `SELECT * FROM ${this.TABLE_NAME} WHERE id = $1`,
            [id]
        );

        if (results.length === 0) return null;

        const row = results[0];
        return {
            ...row,
            messages: JSON.parse(row.messages)
        };
    }

    async getRecentSessions(limit: number = 10): Promise<ChatSession[]> {
        const db = await databaseService.getDb();
        const results: any[] = await db.select(
            `SELECT * FROM ${this.TABLE_NAME} ORDER BY updated_at DESC LIMIT $1`,
            [limit]
        );

        return results.map(row => ({
            ...row,
            messages: JSON.parse(row.messages)
        }));
    }

    async addMessage(sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
        const newMessage: ChatMessage = {
            id: uuidv4(),
            timestamp: Date.now(),
            ...message
        };

        const session = await this.getSession(sessionId);
        if (!session) throw new Error('Session not found');

        session.messages.push(newMessage);
        session.updated_at = Date.now();

        const db = await databaseService.getDb();
        await db.execute(
            `UPDATE ${this.TABLE_NAME} SET messages = $1, updated_at = $2 WHERE id = $3`,
            [JSON.stringify(session.messages), session.updated_at, sessionId]
        );

        return newMessage;
    }

    async updateSessionTitle(sessionId: string, title: string): Promise<void> {
        const db = await databaseService.getDb();
        await db.execute(
            `UPDATE ${this.TABLE_NAME} SET title = $1, updated_at = $2 WHERE id = $3`,
            [title, Date.now(), sessionId]
        );
    }

    async deleteSession(sessionId: string): Promise<void> {
        const db = await databaseService.getDb();
        await db.execute(
            `DELETE FROM ${this.TABLE_NAME} WHERE id = $1`,
            [sessionId]
        );

        if (this.activeSessionId === sessionId) {
            this.activeSessionId = null;
        }
    }

    getActiveSessionId(): string | null {
        return this.activeSessionId;
    }
}

export const chatSessionService = new ChatSessionService();
