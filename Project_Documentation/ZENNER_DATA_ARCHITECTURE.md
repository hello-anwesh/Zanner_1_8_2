# 💾 ZENNER - Data Storage Architecture

> **Last Updated:** 2026-01-13  
> **Version:** 1.0  
> **Purpose:** Complete reference for all data storage, databases, memory systems, and RAG

---

## 📊 STORAGE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              ZENNER DATA STORAGE                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │                           SQLite Database                                        │    │
│  │                    ~/Library/Application Support/                                │    │
│  │                    com.anweshrath.zenner/pomodoro.db                            │    │
│  │                                                                                  │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │    │
│  │  │  sessions   │ │   users     │ │conversations│ │  messages   │               │    │
│  │  │  (timer)    │ │  (profile)  │ │ (chat meta) │ │ (chat logs) │               │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘               │    │
│  │                                                                                  │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │    │
│  │  │memory_items │ │ experiences │ │   rules     │ │memory_stats │               │    │
│  │  │  (facts)    │ │ (episodic)  │ │(procedural) │ │  (metrics)  │               │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘               │    │
│  │                                                                                  │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                               │    │
│  │  │rag_documents│ │training_    │ │journal_     │                               │    │
│  │  │ (knowledge) │ │profile      │ │entries      │                               │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘                               │    │
│  │                                                                                  │    │
│  │  Status: ✅ PRIMARY STORAGE (Reliable, Persistent)                              │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │                           WebKit localStorage                                    │    │
│  │                    ~/Library/WebKit/[app-id]/...                                │    │
│  │                    localstorage.sqlite3                                         │    │
│  │                                                                                  │    │
│  │  ┌───────────────────────────────┐ ┌───────────────────────────────┐           │    │
│  │  │ chronos_ai_training_profile   │ │ zenner_sessions               │           │    │
│  │  │ (⚠️ BACKUP - also in SQLite) │ │ (⚠️ SHOULD MOVE TO SQLite)   │           │    │
│  │  └───────────────────────────────┘ └───────────────────────────────┘           │    │
│  │                                                                                  │    │
│  │  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐             │    │
│  │  │ theme             │ │ chronos-settings  │ │floatingPlayerPos  │             │    │
│  │  │ (ui preference)   │ │ (app settings)    │ │ (ui state)        │             │    │
│  │  └───────────────────┘ └───────────────────┘ └───────────────────┘             │    │
│  │                                                                                  │    │
│  │  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐             │    │
│  │  │ spotify_*         │ │ youtube_*         │ │ ai_config         │             │    │
│  │  │ (api keys/tokens) │ │ (api keys)        │ │ (provider config) │             │    │
│  │  └───────────────────┘ └───────────────────┘ └───────────────────┘             │    │
│  │                                                                                  │    │
│  │  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐             │    │
│  │  │zenner_rag_index_v1│ │chronos_presets_v2 │ │chronos_frequency_ │             │    │
│  │  │ (⚠️ RAG index)   │ │ (timer presets)   │ │mixes (custom)     │             │    │
│  │  └───────────────────┘ └───────────────────┘ └───────────────────┘             │    │
│  │                                                                                  │    │
│  │  Status: ⚠️ SECONDARY STORAGE (Volatile - can be lost on WebKit path change)   │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │                           Memory (Runtime Only)                                  │    │
│  │                                                                                  │    │
│  │  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐             │    │
│  │  │ CacheService      │ │ FrequencyEngine   │ │ Audio Buffers     │             │    │
│  │  │ (AI responses)    │ │ (oscillators)     │ │ (music playback)  │             │    │
│  │  └───────────────────┘ └───────────────────┘ └───────────────────┘             │    │
│  │                                                                                  │    │
│  │  Status: 🔴 VOLATILE (Lost on app restart)                                      │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ SQLite Database Schema

### **Database Location**
```
Production: ~/Library/Application Support/com.anweshrath.zenner/pomodoro.db
Dev:        ~/Library/Application Support/com.anweshrath.zenner/pomodoro.db
```

### **Complete Schema**

```sql
-- ═══════════════════════════════════════════════════════════════════
-- CORE TABLES
-- ═══════════════════════════════════════════════════════════════════

-- Timer Sessions
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_time TEXT NOT NULL,           -- ISO timestamp
    end_time TEXT,                      -- ISO timestamp (null if in progress)
    mode TEXT NOT NULL,                 -- 'focus', 'short_break', 'long_break'
    duration_minutes INTEGER NOT NULL,  -- Planned duration
    actual_duration_seconds INTEGER,    -- Actual time spent
    status TEXT NOT NULL,               -- 'COMPLETED', 'ABANDONED', 'IN_PROGRESS'
    notes TEXT                          -- Optional session notes
);

-- Journal Entries
CREATE TABLE journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,          -- YYYY-MM-DD
    content TEXT NOT NULL,              -- HTML/Markdown content
    mood TEXT,                          -- Emoji or mood label
    tags TEXT,                          -- JSON array of tags
    created_at INTEGER NOT NULL,        -- Epoch ms
    updated_at INTEGER NOT NULL         -- Epoch ms
);

-- Training Profile (AI Memory)
CREATE TABLE training_profile (
    id TEXT PRIMARY KEY DEFAULT 'default',
    profile_json TEXT NOT NULL,         -- Full TrainingProfile JSON
    updated_at INTEGER NOT NULL         -- Epoch ms
);

-- ═══════════════════════════════════════════════════════════════════
-- USER & AUTHENTICATION (Future Cloud Sync)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    subscription_tier TEXT DEFAULT 'free',  -- 'free', 'premium', 'pro'
    created_at INTEGER NOT NULL,
    last_login INTEGER,
    settings TEXT,                          -- JSON settings
    is_active BOOLEAN DEFAULT 1
);

-- ═══════════════════════════════════════════════════════════════════
-- CONVERSATION SYSTEM (Zeni Chat)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default_user',
    title TEXT,                             -- Auto-generated summary
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    mode TEXT DEFAULT 'productivity',       -- 'productivity', 'venting', 'strategy'
    is_synced BOOLEAN DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL,                     -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    tokens_used INTEGER,
    timestamp INTEGER NOT NULL,
    is_synced BOOLEAN DEFAULT 0,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- ═══════════════════════════════════════════════════════════════════
-- MEMORY SYSTEM (Training Service Data - Alternative Storage)
-- ═══════════════════════════════════════════════════════════════════

-- Semantic Memory (Facts about user)
CREATE TABLE memory_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default_user',
    category TEXT NOT NULL,                 -- 'fact', 'preference', 'goal', 'constraint'
    content TEXT NOT NULL,
    embedding BLOB,                         -- Future: vector embeddings
    source_conversation_id TEXT,
    created_at INTEGER NOT NULL,
    last_accessed INTEGER,
    access_count INTEGER DEFAULT 0,
    is_synced BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Episodic Memory (Session summaries)
CREATE TABLE experiences (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default_user',
    summary TEXT NOT NULL,
    sentiment TEXT,                         -- 'positive', 'neutral', 'negative'
    key_learnings TEXT,                     -- JSON array
    timestamp INTEGER NOT NULL,
    is_synced BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Procedural Memory (Behavioral rules)
CREATE TABLE rules (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default_user',
    rule TEXT NOT NULL,
    trigger_context TEXT DEFAULT 'general', -- When to apply
    is_active BOOLEAN DEFAULT 1,
    created_at INTEGER NOT NULL,
    is_synced BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Memory Analytics
CREATE TABLE memory_stats (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default_user',
    date TEXT NOT NULL,
    total_messages INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    memory_items_added INTEGER DEFAULT 0,
    retrieval_count INTEGER DEFAULT 0,
    avg_response_time REAL,
    UNIQUE(user_id, date)
);

-- ═══════════════════════════════════════════════════════════════════
-- RAG SYSTEM (Knowledge Base)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE rag_documents (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    embedding BLOB,                         -- Future: vector embeddings
    metadata TEXT,                          -- JSON metadata
    doc_type TEXT DEFAULT 'preset',         -- 'preset', 'user', 'system'
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- ═══════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX idx_memory_user ON memory_items(user_id);
CREATE INDEX idx_memory_category ON memory_items(category);
CREATE INDEX idx_experiences_user ON experiences(user_id);
CREATE INDEX idx_rules_user_active ON rules(user_id, is_active);
CREATE INDEX idx_stats_user_date ON memory_stats(user_id, date DESC);
```

---

## 📦 localStorage Keys

### **Critical Data (⚠️ Should Move to SQLite)**

| Key | Purpose | Service | Size | Status |
|-----|---------|---------|------|--------|
| `zenner_sessions` | Zeni chat sessions | ZennerCoach | ~60KB | ⚠️ Move to DB |
| `zenner_chat_history` | Legacy chat history | ZennerCoach | ~2KB | ⚠️ Move to DB |
| `zenner_rag_index_v1` | RAG search index | RAGService | Variable | ⚠️ Move to DB |

### **Backup/Dual Storage**

| Key | Purpose | Service | SQLite Table |
|-----|---------|---------|--------------|
| `chronos_ai_training_profile` | User memory/training | TrainingService | training_profile |

### **Settings (OK in localStorage)**

| Key | Purpose | Service |
|-----|---------|---------|
| `theme` | UI theme name | ThemeContext |
| `chronos-settings` | App settings | useSettings |
| `floatingPlayerPosition` | Player position | FloatingPlayer |
| `metronome-config` | Metronome settings | MetronomeService |
| `chronos_presets_v2` | Timer presets | PresetManager |
| `chronos_frequency_mixes` | Custom freq mixes | frequencies.ts |
| `chronos_sound_library` | Sound preferences | soundLibrary.ts |
| `zenner-onboarding-completed` | Onboarding flag | Onboarding |

### **API Keys (OK in localStorage)**

| Key | Purpose | Service |
|-----|---------|---------|
| `ai_config` | AI provider settings | AIService |
| `spotify_access_token` | Spotify auth | SpotifyService |
| `spotify_refresh_token` | Spotify refresh | SpotifyService |
| `spotify_token_expiry` | Token expiry time | SpotifyService |
| `spotify_client_id` | Spotify client ID | SpotifyService |
| `spotify_client_secret` | Spotify secret | SpotifyService |
| `spotify_favorites` | Liked tracks | SpotifyService |
| `youtube_api_key` | YouTube API key | YouTubeService |
| `youtube_favorites` | Liked videos | YouTubeService |

---

## 🧠 Memory System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           ZENNER MEMORY SYSTEM                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │                        MemoryOrchestrator                                   │ │
│  │                    (Central Memory Coordinator)                             │ │
│  │                                                                              │ │
│  │    retrieve(query) ──► Combines all memory sources with token budgeting    │ │
│  │    buildContext()  ──► Creates AI context from all memory                  │ │
│  │                                                                              │ │
│  └─────────────────────────────────┬────────────────────────────────────────────┘ │
│                                    │                                              │
│         ┌─────────────────────────┬┴────────────────────────┬────────────────┐   │
│         │                         │                          │                │   │
│         ▼                         ▼                          ▼                │   │
│  ┌──────────────┐         ┌──────────────┐          ┌──────────────┐          │   │
│  │   Semantic   │         │   Episodic   │          │  Procedural  │          │   │
│  │   Memory     │         │   Memory     │          │   Memory     │          │   │
│  └──────┬───────┘         └──────┬───────┘          └──────┬───────┘          │   │
│         │                        │                         │                  │   │
│         ▼                        ▼                         ▼                  │   │
│  ┌──────────────┐         ┌──────────────┐          ┌──────────────┐          │   │
│  │ RAGService   │         │TrainingService│         │TrainingService│         │   │
│  │ + knowledge  │         │ .experiences │          │ .rules       │          │   │
│  │ base         │         │              │          │              │          │   │
│  └──────┬───────┘         └──────┬───────┘          └──────┬───────┘          │   │
│         │                        │                         │                  │   │
│         ▼                        └─────────┬───────────────┘                  │   │
│  ┌──────────────┐                         │                                   │   │
│  │ localStorage │                         ▼                                   │   │
│  │(rag_index_v1)│               ┌─────────────────┐                          │   │
│  └──────────────┘               │ TrainingProfile │                          │   │
│                                 │   (JSON blob)   │                          │   │
│                                 └────────┬────────┘                          │   │
│                                          │                                    │   │
│                          ┌───────────────┴───────────────┐                   │   │
│                          │                               │                   │   │
│                          ▼                               ▼                   │   │
│                   ┌──────────────┐               ┌──────────────┐            │   │
│                   │ localStorage │               │   SQLite     │            │   │
│                   │   (backup)   │               │training_     │            │   │
│                   └──────────────┘               │profile table │            │   │
│                                                  └──────────────┘            │   │
│                                                                               │   │
└───────────────────────────────────────────────────────────────────────────────┘   │
                                                                                     │
```

### **TrainingProfile Structure**

```typescript
interface TrainingProfile {
    identity: {
        name: string;
        role: string;
        coreValues: string[];
        longTermVision: string;
        motivationTriggers: string[];
    };
    rhythms: {
        chronotype: "lion" | "bear" | "wolf" | "dolphin";
        peakEnergyHours: number[];
        preferredSessionDuration: number;
        breakStyle: "active" | "restful" | "meditative";
    };
    goals: GoalMetric[];
    knowledgeBase: AIKnowledge[];     // Semantic Memory
    experiences: AIExperience[];       // Episodic Memory
    rules: AIRule[];                   // Procedural Memory
}
```

---

## 📍 WebKit Storage Locations

```
PRODUCTION APP:
~/Library/WebKit/zenner/WebsiteData/Default/.../LocalStorage/localstorage.sqlite3

DEV APP:
~/Library/WebKit/com.anweshrath.zenner/WebsiteData/Default/.../LocalStorage/localstorage.sqlite3

LEGACY (OLD DEV):
~/Library/WebKit/tauri-app/WebsiteData/Default/.../LocalStorage/localstorage.sqlite3
```

⚠️ **CRITICAL:** When binary name changes, WebKit creates a new storage location!

---

## 🔴 ISSUES & MIGRATION PLAN

### **Current Issues**

| Issue | Risk Level | Impact |
|-------|------------|--------|
| Chat sessions in localStorage | 🔴 High | Data loss on WebKit path change |
| RAG index in localStorage | 🟡 Medium | Index rebuild needed if lost |
| No automatic backups | 🔴 High | Single point of failure |
| ConversationManager unused | 🟡 Medium | SQLite chat tables empty |

### **Migration Plan**

#### Phase 1: Chat Sessions (HIGH PRIORITY)

```typescript
// Current: ZennerCoach.tsx
const savedSessions = localStorage.getItem('zenner_sessions');

// Target: Use ConversationManager + SQLite
const sessions = await conversationManager.getAllConversations();
```

**Steps:**
1. [ ] Modify ZennerCoach to use ConversationManager
2. [ ] Create migration script to move localStorage → SQLite
3. [ ] Add fallback to check localStorage for legacy data
4. [ ] Verify data integrity after migration

#### Phase 2: RAG Index (MEDIUM PRIORITY)

```typescript
// Current: RAGService.ts
localStorage.setItem('zenner_rag_index_v1', JSON.stringify(index));

// Target: Use rag_documents table in SQLite
await db.execute('INSERT INTO rag_documents...');
```

**Steps:**
1. [ ] Add vector embedding support to rag_documents
2. [ ] Migrate index building to SQLite
3. [ ] Implement semantic search (future)

#### Phase 3: Backup System (HIGH PRIORITY)

**Implementation:**
```typescript
// Add to DatabaseService
async exportDatabase(): Promise<string> {
    // Export all tables as JSON
}

async importDatabase(data: string): Promise<void> {
    // Import from JSON backup
}

async createDailyBackup(): Promise<void> {
    // Auto-backup to ~/Documents/Zenner Backups/
}
```

---

## 📊 Data Flow by Feature

### **Timer Session**

```
START SESSION
     │
     ▼
useTimer.start()
     │
     ▼
useSessionLogger.logSession()
     │
     ▼
DatabaseService.logSession()
     │
     ▼
INSERT INTO sessions (...)
     │
     ▼
SQLite: sessions table ✅
```

### **Zeni Chat**

```
USER MESSAGE
     │
     ▼
ZennerCoach.handleSend()
     │
     ├──► CoachService.chat()
     │         │
     │         ├──► MemoryOrchestrator.buildContext()
     │         │         │
     │         │         ├──► TrainingService.getProfile()
     │         │         ├──► RAGService.retrieve()
     │         │         └──► CacheService.get()
     │         │
     │         └──► AIService.chat()
     │                   │
     │                   └──► OpenAI/Gemini/Claude/Ollama
     │
     └──► localStorage.setItem('zenner_sessions') ⚠️
                    │
                    ▼
             WebKit localStorage ⚠️ SHOULD BE SQLite
```

### **Journal Entry**

```
SAVE ENTRY
     │
     ▼
JournalView.saveEntry()
     │
     ▼
JournalService.createOrUpdateEntry()
     │
     ▼
SQL: INSERT OR REPLACE INTO journal_entries
     │
     ▼
SQLite: journal_entries table ✅
```

### **AI Training**

```
UPDATE PROFILE
     │
     ▼
TrainingService.updateIdentity()
     │
     ├──► localStorage.setItem() (immediate backup)
     │
     └──► SQLite: INSERT INTO training_profile ✅
```

---

## ✅ RECOMMENDATIONS

### **Immediate (Do Now)**

1. **Move chat sessions to SQLite**
   - Connect ZennerCoach → ConversationManager
   - Migrate existing localStorage data

2. **Add export/import for backups**
   - Manual backup button in settings
   - Export all user data as JSON

### **Short Term (This Week)**

3. **Implement daily auto-backup**
   - Background job on app start
   - Keep last 7 days of backups

4. **Move RAG index to SQLite**
   - Store in rag_documents table
   - Add rebuild capability

### **Long Term (This Month)**

5. **Add vector embeddings**
   - Local embedding model
   - Semantic search for memory

6. **Implement SyncService**
   - Supabase integration
   - Conflict resolution
   - Offline queue

---

## 📁 File Reference

| File | Purpose |
|------|---------|
| `services/db/DatabaseService.ts` | SQLite operations, table creation |
| `services/training/TrainingService.ts` | User memory, dual storage |
| `services/ai/RAGService.ts` | Knowledge retrieval |
| `services/ai/MemoryOrchestrator.ts` | Memory coordination |
| `services/ai/ConversationManager.ts` | Chat history (unused) |
| `components/ZennerCoach.tsx` | Chat UI, localStorage usage |

---

*Update this document when storage architecture changes.*
