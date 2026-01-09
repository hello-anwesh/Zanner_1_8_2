# Zenner Architecture Documentation

Complete technical overview of Zenner's architecture, database structure, and build process.

## Table of Contents
1. [System Overview](#system-overview)
2. [Database Architecture](#database-architecture)
3. [File Structure](#file-structure)
4. [Data Flow](#data-flow)
5. [Build & Deployment](#build--deployment)
6. [User Data Storage](#user-data-storage)

---

## System Overview

**Tech Stack:**
- **Frontend:** React + TypeScript + Vite
- **Desktop:** Tauri (Rust)
- **Database:** SQLite (via Tauri SQL plugin)
- **Storage:** Local filesystem + localStorage

**Architecture Pattern:** Electron-style desktop app

```
┌─────────────────────────────────────────────┐
│           ZENNER APPLICATION                │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │      REACT FRONTEND (TypeScript)    │   │
│  │  - UI Components                    │   │
│  │  - State Management                 │   │
│  │  - Service Layer                    │   │
│  └──────────────┬──────────────────────┘   │
│                 │                           │
│                 │ IPC Calls                 │
│                 ▼                           │
│  ┌─────────────────────────────────────┐   │
│  │      TAURI BACKEND (Rust)           │   │
│  │  - SQLite Database                  │   │
│  │  - File System Access               │   │
│  │  - AppleScript (Spotify control)    │   │
│  │  - System Integration               │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
         │                      │
         ▼                      ▼
    User's Filesystem    System Resources
    ~/Library/Application Support/Zenner/
```

---

## Database Architecture

### Database Location

**Development:**
```
~/Library/Application Support/com.zenner.dev/
└── zenner.db
```

**Production:**
```
~/Library/Application Support/com.zenner/
└── zenner.db
```

### Database Schema

#### 1. **sessions** Table
Tracks all Pomodoro sessions

```sql
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,              -- 'focus' | 'shortBreak' | 'longBreak'
    duration INTEGER NOT NULL,       -- seconds
    completed BOOLEAN NOT NULL,      -- 1 = completed, 0 = skipped
    timestamp INTEGER NOT NULL,      -- Unix timestamp (ms)
    notes TEXT,                      -- Optional user notes
    tags TEXT                        -- JSON array of tags
);
```

**Indexes:**
- `idx_sessions_timestamp` on `timestamp` (for fast date queries)
- `idx_sessions_type` on `type` (for analytics)

**Example Row:**
```
id: 1
type: 'focus'
duration: 1500
completed: 1
timestamp: 1704800000000
notes: 'Worked on login feature'
tags: '["work","frontend"]'
```

#### 2. **journal_entries** Table
Daily journal entries

```sql
CREATE TABLE journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,       -- 'YYYY-MM-DD'
    content TEXT NOT NULL,           -- JSON or plain text
    mood TEXT,                       -- 'amazing'|'good'|'okay'|'struggling'|'exhausted'
    tags TEXT,                       -- JSON array: '["reflection","work"]'
    created_at INTEGER NOT NULL,     -- Unix timestamp (ms)
    updated_at INTEGER NOT NULL      -- Unix timestamp (ms)
);
```

**Indexes:**
- `idx_journal_date` on `date` (for fast lookups)

**Example Row:**
```
id: 1
date: '2026-01-09'
content: '{"template":0,"responses":{"0":"Completed 3 tasks","1":"Distractions"}}'
mood: 'good'
tags: '["productive","focus"]'
created_at: 1704800000000
updated_at: 1704800000000
```

#### 3. **presets** Table
Custom timer presets

```sql
CREATE TABLE presets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    focus_duration INTEGER NOT NULL,     -- minutes
    short_break_duration INTEGER NOT NULL,
    long_break_duration INTEGER NOT NULL,
    sessions_until_long_break INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);
```

**Example Row:**
```
id: 1
name: 'Deep Work'
focus_duration: 50
short_break_duration: 10
long_break_duration: 30
sessions_until_long_break: 3
created_at: 1704800000000
updated_at: 1704800000000
```

---

## File Structure

### Service Layer Architecture

```
src/services/
├── db/
│   └── DatabaseService.ts          [Core SQL connection]
│       - getDb(): Promise<Database>
│       - Singleton pattern
│       - Auto-initializes on first call
│
├── session/
│   └── SessionService.ts           [Session CRUD]
│       - Uses DatabaseService
│       - createSession()
│       - getSessionsByDateRange()
│       - getStats()
│       - Tags: analytics, stats
│
├── journal/
│   └── JournalService.ts           [Journal CRUD]
│       - Uses DatabaseService
│       - createOrUpdateEntry()
│       - getEntry(date)
│       - searchEntries()
│       - Tags: journal, reflection
│
├── preset/
│   └── PresetService.ts            [Preset CRUD]
│       - Uses DatabaseService
│       - createPreset()
│       - getPresets()
│       - Tags: timer, presets
│
├── spotify/
│   └── SpotifyService.ts           [Spotify integration]
│       - AppleScript commands
│       - State polling
│       - Tags: music, integration
│
├── youtube/
│   └── YouTubeService.ts           [YouTube API]
│       - Search & favorites
│       - localStorage only
│       - Tags: music, integration
│
├── music/
│   └── MusicController.ts          [Music sync]
│       - Controls Spotify/YouTube
│       - Timer integration
│       - Tags: music, timer
│
├── events/
│   └── EventBus.ts                 [Pub/Sub system]
│       - SESSION_START
│       - SESSION_END
│       - PLAY_TRACK
│       - Tags: events, coordination
│
└── ai/
    └── ProductivityAI.ts           [AI coach]
        - Uses journal + sessions
        - Gemini API integration
        - Tags: ai, coaching
```

### Data Flow Diagram

```
┌──────────────┐
│ User Action  │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  React Component │
│  (JournalView)   │
└──────┬───────────┘
       │
       │ journalService.createOrUpdateEntry()
       ▼
┌──────────────────┐
│ JournalService   │
│  (Service Layer) │
└──────┬───────────┘
       │
       │ await this.db.execute(SQL)
       ▼
┌──────────────────┐
│ DatabaseService  │
│  (Singleton)     │
└──────┬───────────┘
       │
       │ Tauri SQL Plugin
       ▼
┌──────────────────┐
│  Tauri Backend   │
│  (Rust)          │
└──────┬───────────┘
       │
       │ SQLite Driver
       ▼
┌──────────────────┐
│  SQLite Database │
│  (zenner.db)     │
└──────────────────┘
```

---

## Data Flow

### 1. Starting a Pomodoro Session

```
User clicks Start
    ↓
App.tsx setState({ isRunning: true })
    ↓
EventBus.emit({ type: 'SESSION_START' })
    ↓
MusicController.resume() [if enabled]
    ↓
Timer runs... (countdown)
    ↓
Timer reaches 0
    ↓
EventBus.emit({ type: 'SESSION_END' })
    ↓
SessionService.createSession({
    type: 'focus',
    duration: 1500,
    completed: true,
    timestamp: Date.now()
})
    ↓
DatabaseService.execute(INSERT INTO sessions...)
    ↓
Analytics updated (re-query getStats())
```

### 2. Saving a Journal Entry

```
User types in JournalView
    ↓
User clicks Save
    ↓
JournalView.handleSave()
    ↓
journalService.createOrUpdateEntry(date, content, mood, tags)
    ↓
DatabaseService.execute(
    entry exists? UPDATE : INSERT
)
    ↓
Database updated
    ↓
Reload recent entries (for sidebar)
    ↓
Calculate streak (query last N days)
```

### 3. Analytics Calculation

```
User opens Stats view
    ↓
AnalyticsDashboard loads
    ↓
sessionService.getSessionsByDateRange(startDate, endDate)
    ↓
DatabaseService.select(
    "SELECT * FROM sessions WHERE timestamp BETWEEN ? AND ?"
)
    ↓
Process results:
    - Total sessions
    - Total focus time
    - Completion rate
    - Daily breakdown
    ↓
Render charts
```

---

## Build & Deployment

### Development Mode

**Command:** `npm run tauri dev`

**What happens:**
1. Vite starts dev server (http://localhost:1420)
2. Tauri compiles Rust backend
3. Opens desktop window pointing to Vite
4. Hot reload enabled
5. Database: `~/Library/Application Support/com.zenner.dev/zenner.db`

### Production Build

**Command:** `npm run tauri build`

**Build Process:**

```
1. Frontend Build (Vite)
   ├── Compile TypeScript → JavaScript
   ├── Bundle React app
   ├── Minify & optimize
   └── Output: src-tauri/target/release/bundle/

2. Backend Build (Tauri/Rust)
   ├── Compile Rust to native binary
   ├── Include dependencies
   ├── Sign app (if configured)
   └── Output: .app bundle

3. Package
   ├── Create .app bundle
   ├── Include frontend build
   ├── Include Rust binary
   ├── Include assets (icons, etc)
   └── Create .dmg installer

4. Final Output
   └── src-tauri/target/release/bundle/dmg/
       └── Zenner_1.0.0_aarch64.dmg  (or x64)
```

### What Ships to Customers

**Single .dmg file containing:**

```
Zenner.app/
├── Contents/
│   ├── MacOS/
│   │   └── Zenner                    [Rust binary]
│   ├── Resources/
│   │   ├── assets/
│   │   │   ├── index.html           [Main HTML]
│   │   │   ├── index.js             [Bundled React app]
│   │   │   ├── index.css            [Styles]
│   │   │   └── *.png/svg            [Assets]
│   │   ├── zenner-logo.png
│   │   └── [other resources]
│   └── Info.plist                    [App metadata]
```

**NOT included:**
- Source code (TypeScript, React components)
- node_modules
- Development tools
- Database (created on first run)

### First Run on Customer's Machine

```
1. User drags Zenner.app to Applications
2. User opens Zenner
3. Tauri initializes:
   ├── Creates app data directory
   │   ~/Library/Application Support/com.zenner/
   ├── Initializes database
   │   DatabaseService.init() runs
   │   Creates tables (sessions, journal_entries, presets)
   └── Loads React UI
4. User sees onboarding (if first time)
5. App is ready to use
```

---

## User Data Storage

### What Data is Stored Where

#### SQLite Database
**Location:** `~/Library/Application Support/com.zenner/zenner.db`

**Contains:**
- All Pomodoro sessions
- Journal entries
- Custom presets
- Timestamps, durations, tags

**Persistence:** Permanent (until app uninstalled)

#### localStorage (Browser storage)
**Location:** Embedded in app's WebView

**Contains:**
- Spotify API credentials (access token, refresh token)
- YouTube API key
- Spotify/YouTube favorites
- UI preferences (theme, last view)
- AI settings (Gemini API key)

**Persistence:** Permanent (cleared if app cache cleared)

#### EventBus (In-Memory)
**Location:** RAM

**Contains:**
- Real-time event listeners
- Session state changes
- Music control events

**Persistence:** Lost on app close

### Data Backup & Export

**Current:** No automatic backup (single SQLite file)

**Future:** Export feature could:
```typescript
// Export all data to JSON
const exportData = {
    sessions: await sessionService.getAllSessions(),
    journal: await journalService.getAllEntries(),
    presets: await presetService.getAllPresets(),
    exported_at: Date.now()
};

// Save as JSON file
await save(JSON.stringify(exportData, null, 2), 'zenner-backup.json');
```

---

## Analytics Showing 0 - Debugging

### Why Analytics Might Show 0

**Scenario 1: Fresh Install**
- Database just created
- No sessions recorded yet
- **Fix:** Complete a full Pomodoro session

**Scenario 2: Dev vs Prod Database**
- Dev uses: `com.zenner.dev`
- Prod uses: `com.zenner`
- **Fix:** Check correct database location

**Scenario 3: Session Not Saved**
- Session ends but doesn't save
- Check `SessionService.createSession()` calls
- **Fix:** Add logging to verify saves

### Verify Database

**Mac Terminal:**
```bash
# Find database
ls ~/Library/Application\ Support/com.zenner.dev/

# Open database
sqlite3 ~/Library/Application\ Support/com.zenner.dev/zenner.db

# Check sessions
SELECT COUNT(*) FROM sessions;
SELECT * FROM sessions ORDER BY timestamp DESC LIMIT 5;

# Check structure
.schema sessions
```

**Expected Output (after 1 session):**
```sql
SELECT * FROM sessions;
-- Should show at least 1 row
```

### Force Create Test Data

Add this to `SessionService.ts` for testing:

```typescript
async createTestData() {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    // Create 10 test sessions
    for (let i = 0; i < 10; i++) {
        await this.createSession({
            type: i % 3 === 0 ? 'focus' : 'shortBreak',
            duration: 1500,
            completed: true,
            timestamp: now - (i * oneDay)
        });
    }
}
```

---

## File Dependencies Map

```
App.tsx (Root)
├── Uses: eventBus, musicController, sessionService, journalService
├── Renders:
│   ├── JournalView
│   │   └── Uses: journalService → DatabaseService → SQLite
│   ├── AnalyticsDashboard
│   │   └── Uses: sessionService → DatabaseService → SQLite
│   ├── SpotifySettingsView
│   │   └── Uses: spotifyService → Tauri AppleScript → Spotify.app
│   ├── YouTubeSettingsView
│   │   └── Uses: youtubeService → localStorage
│   ├── FloatingPlayer
│   │   └── Uses: musicController, eventBus
│   └── ZennerCoach (AI)
│       └── Uses: ProductivityAI → Gemini API + journalService + sessionService

EventBus (Singleton)
└── Subscribed by: App, MusicController, FloatingPlayer

DatabaseService (Singleton)
└── Used by: SessionService, JournalService, PresetService

MusicController (Singleton)
├── Uses: spotifyService, soundLibrary
└── Subscribed to: EventBus
```

---

## Summary

**Database:**
- Single SQLite file
- 3 main tables (sessions, journal, presets)
- Created on first app launch
- Located in Application Support

**Services:**
- Singleton pattern
- All use DatabaseService
- SQL queries via Tauri plugin

**Build:**
- Compiles to native .app
- No source code shipped
- Database created on customer's machine

**Data:**
- Persistent: SQLite + localStorage
- In-memory: EventBus
- Export: Manual (future feature)

**Next Steps:**
1. Add session creation logging
2. Verify database path
3. Create test data helper
4. Add export feature
