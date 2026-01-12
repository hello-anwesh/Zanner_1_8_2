-- Memory System Database Schema
-- Version: 1.0.0
-- Date: 2026-01-12

-- Users table (for multi-user support and subscription management)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    subscription_tier TEXT DEFAULT 'free' CHECK(subscription_tier IN ('free', 'premium', 'pro')),
    created_at INTEGER NOT NULL,
    last_login INTEGER,
    settings TEXT,  -- JSON blob for user preferences
    is_active BOOLEAN DEFAULT 1
);

-- Conversations (chat sessions)
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default_user',
    title TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    mode TEXT DEFAULT 'productivity' CHECK(mode IN ('productivity', 'venting', 'strategy')),
    is_synced BOOLEAN DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Messages (conversation history)
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens_used INTEGER,
    timestamp INTEGER NOT NULL,
    is_synced BOOLEAN DEFAULT 0,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Memory Items (semantic memory - facts, preferences, goals, constraints)
CREATE TABLE IF NOT EXISTS memory_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default_user',
    category TEXT NOT NULL CHECK(category IN ('fact', 'preference', 'goal', 'constraint')),
    content TEXT NOT NULL,
    embedding BLOB,  -- Stored as binary for vector search
    source_conversation_id TEXT,
    created_at INTEGER NOT NULL,
    last_accessed INTEGER,
    access_count INTEGER DEFAULT 0,
    is_synced BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (source_conversation_id) REFERENCES conversations(id) ON DELETE SET NULL
);

-- Experiences (episodic memory)
CREATE TABLE IF NOT EXISTS experiences (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default_user',
    summary TEXT NOT NULL,
    sentiment TEXT CHECK(sentiment IN ('positive', 'neutral', 'negative')),
    key_learnings TEXT,  -- JSON array
    timestamp INTEGER NOT NULL,
    is_synced BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Rules (procedural memory - behavioral guidelines)
CREATE TABLE IF NOT EXISTS rules (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default_user',
    rule TEXT NOT NULL,
    trigger_context TEXT DEFAULT 'general',
    is_active BOOLEAN DEFAULT 1,
    created_at INTEGER NOT NULL,
    is_synced BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Memory Analytics (usage tracking)
CREATE TABLE IF NOT EXISTS memory_stats (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default_user',
    date TEXT NOT NULL,  -- YYYY-MM-DD
    total_messages INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    memory_items_added INTEGER DEFAULT 0,
    retrieval_count INTEGER DEFAULT 0,
    avg_response_time REAL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, date)
);

-- RAG Index (for frequency presets and other knowledge)
CREATE TABLE IF NOT EXISTS rag_documents (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    embedding BLOB,
    metadata TEXT,  -- JSON blob
    doc_type TEXT DEFAULT 'preset',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_messages_role ON messages(role);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_mode ON conversations(mode);

CREATE INDEX IF NOT EXISTS idx_memory_user ON memory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_category ON memory_items(category);
CREATE INDEX IF NOT EXISTS idx_memory_accessed ON memory_items(last_accessed DESC);

CREATE INDEX IF NOT EXISTS idx_experiences_user ON experiences(user_id);
CREATE INDEX IF NOT EXISTS idx_experiences_timestamp ON experiences(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_rules_user_active ON rules(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_stats_user_date ON memory_stats(user_id, date DESC);

-- Insert default user for single-user mode
INSERT OR IGNORE INTO users (id, email, subscription_tier, created_at, last_login, is_active)
VALUES ('default_user', NULL, 'free', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000, 1);
