# Zenner Visual Architecture Diagrams

ASCII-based visual representations of system architecture and data flow.

---

## System Architecture Overview

```
╔═══════════════════════════════════════════════════════════════════╗
║                        ZENNER APPLICATION                         ║
║                     (Tauri Desktop App - macOS)                   ║
╚═══════════════════════════════════════════════════════════════════╝
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
    ┌───────────────────────┐       ┌──────────────────────┐
    │   FRONTEND (React)    │       │  BACKEND (Rust/Tauri)│
    │                       │       │                      │
    │  • UI Components      │◄─────►│  • SQLite Database   │
    │  • State Management   │  IPC  │  • File System       │
    │  • Service Layer      │       │  • AppleScript       │
    │  • Event Bus          │       │  • System APIs       │
    └───────────┬───────────┘       └──────────┬───────────┘
                │                              │
                │                              │
                ▼                              ▼
    ┌───────────────────────┐       ┌──────────────────────┐
    │   localStorage        │       │   SQLite Database    │
    │                       │       │                      │
    │  • API Keys           │       │  • sessions          │
    │  • Favorites          │       │  • journal_entries   │
    │  • Preferences        │       │  • presets           │
    └───────────────────────┘       └──────────────────────┘
```

---

## Database Schema Visual

```
┌─────────────────────────────────────────────────────────────┐
│                    ZENNER.DB (SQLite)                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TABLE: sessions                                             │
├─────────────────────────────────────────────────────────────┤
│ id                  INTEGER PRIMARY KEY AUTOINCREMENT       │
│ type                TEXT NOT NULL                           │
│ duration            INTEGER NOT NULL (seconds)              │
│ completed           BOOLEAN NOT NULL                        │
│ timestamp           INTEGER NOT NULL (Unix ms)              │
│ notes               TEXT                                    │
│ tags                TEXT (JSON array)                       │
└─────────────────────────────────────────────────────────────┘
         │
         │ INDEXES:
         ├── idx_sessions_timestamp (timestamp)
         └── idx_sessions_type (type)

┌─────────────────────────────────────────────────────────────┐
│ TABLE: journal_entries                                      │
├─────────────────────────────────────────────────────────────┤
│ id                  INTEGER PRIMARY KEY AUTOINCREMENT       │
│ date                TEXT NOT NULL UNIQUE (YYYY-MM-DD)       │
│ content             TEXT NOT NULL (JSON or plain)           │
│ mood                TEXT                                    │
│ tags                TEXT (JSON array)                       │
│ created_at          INTEGER NOT NULL (Unix ms)              │
│ updated_at          INTEGER NOT NULL (Unix ms)              │
└─────────────────────────────────────────────────────────────┘
         │
         └── INDEX: idx_journal_date (date)

┌─────────────────────────────────────────────────────────────┐
│ TABLE: presets                                              │
├─────────────────────────────────────────────────────────────┤
│ id                        INTEGER PRIMARY KEY               │
│ name                      TEXT NOT NULL                     │
│ focus_duration            INTEGER NOT NULL (minutes)        │
│ short_break_duration      INTEGER NOT NULL                  │
│ long_break_duration       INTEGER NOT NULL                  │
│ sessions_until_long_break INTEGER NOT NULL                  │
│ created_at                INTEGER NOT NULL                  │
│ updated_at                INTEGER NOT NULL                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Complete Session Lifecycle Flow

```
┌──────────────┐
│ USER CLICKS  │
│   "START"    │
└──────┬───────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│                   App.tsx                              │
│                                                        │
│  1. setState({ isRunning: true, mode: 'focus' })      │
│  2. Start countdown timer                             │
└────────────────┬───────────────────────────────────────┘
                 │
                 ├─────────────────────────┐
                 │                         │
                 ▼                         ▼
    ┌─────────────────────┐    ┌──────────────────────┐
    │   EventBus.emit     │    │  MusicController    │
    │  SESSION_START      │───►│   .resume()         │
    └─────────────────────┘    └──────────┬───────────┘
                                           │
                                           ▼
                                ┌──────────────────────┐
                                │  SpotifyService.play│
                                │  (AppleScript)      │
                                └─────────────────────┘

         Timer Countdown...
         (useEffect interval)
                 │
                 │ When timer reaches 0
                 ▼
┌────────────────────────────────────────────────────────┐
│                   App.tsx                              │
│                                                        │
│  1. setState({ isRunning: false })                    │
│  2. Play completion sound                             │
│  3. Show notification                                 │
└────────────────┬───────────────────────────────────────┘
                 │
                 ├─────────────────────────┐
                 │                         │
                 ▼                         ▼
    ┌─────────────────────┐    ┌──────────────────────┐
    │   EventBus.emit     │    │  MusicController    │
    │  SESSION_END        │───►│   .pause()          │
    └──────┬──────────────┘    └─────────────────────┘
           │
           ▼
    ┌─────────────────────────────────────────┐
    │    SessionService.createSession()       │
    │                                         │
    │  Parameters:                            │
    │    - type: 'focus'                      │
    │    - duration: 1500 (25 min)            │
    │    - completed: true                    │
    │    - timestamp: Date.now()              │
    └──────┬──────────────────────────────────┘
           │
           ▼
    ┌─────────────────────────────────────────┐
    │    DatabaseService.execute()            │
    │                                         │
    │  SQL: INSERT INTO sessions (...)        │
    │       VALUES (?, ?, ?, ?)               │
    └──────┬──────────────────────────────────┘
           │
           ▼ Tauri IPC
    ┌─────────────────────────────────────────┐
    │         Tauri SQL Plugin                │
    │      (Rust Backend)                     │
    └──────┬──────────────────────────────────┘
           │
           ▼
    ┌─────────────────────────────────────────┐
    │         SQLite Database                 │
    │                                         │
    │  sessions table now has 1 new row       │
    └─────────────────────────────────────────┘
           │
           │ Analytics refreshes
           ▼
    ┌─────────────────────────────────────────┐
    │    Stats view queries getStats()        │
    │    Shows updated count                  │
    └─────────────────────────────────────────┘
```

---

## Service Layer Dependency Graph

```
                    ┌─────────────────┐
                    │    App.tsx      │
                    │  (Root Component)│
                    └────────┬─────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Session  │ │ Journal  │ │ Preset   │
        │ Service  │ │ Service  │ │ Service  │
        └────┬─────┘ └────┬─────┘ └────┬─────┘
             │            │            │
             └────────────┼────────────┘
                          │
                          ▼
                ┌──────────────────┐
                │  DatabaseService │
                │   (Singleton)    │
                └────────┬─────────┘
                         │
                         ▼ Tauri invoke()
                ┌──────────────────┐
                │   Tauri Backend  │
                │   SQLite Plugin  │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │   zenner.db      │
                │   (SQLite File)  │
                └──────────────────┘

          Parallel Services:
          
    ┌────────────────┐      ┌────────────────┐
    │    Spotify     │      │    YouTube     │
    │    Service     │      │    Service     │
    └────┬───────────┘      └────┬───────────┘
         │                       │
         ▼                       ▼
    AppleScript              localStorage
    (System)                 (WebView)


    ┌────────────────┐      ┌────────────────┐
    │     Music      │      │    Event       │
    │   Controller   │◄────►│      Bus       │
    └────────────────┘      └────────────────┘
         │                       │
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
            Coordinates between:
            - Timer state
            - Music playback
            - Session events
```

---

## Build & Distribution Flow

```
┌─────────────────────────────────────────────────────────────┐
│               npm run tauri build                           │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────────┐    ┌───────────────────┐
│  Vite Build       │    │  Rust Compile     │
│  (Frontend)       │    │  (Backend)        │
│                   │    │                   │
│  TypeScript → JS  │    │  Cargo build      │
│  React → Bundle   │    │  --release        │
│  Minify & Optimize│    │  Link deps        │
└────────┬──────────┘    └────────┬──────────┘
         │                        │
         ▼                        ▼
┌──────────────────────────────────────────────┐
│  dist/                  Binary               │
│  ├── index.html         Zenner (executable)  │
│  ├── index.js                                │
│  └── assets/                                 │
└────────┬─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              Create .app Bundle                         │
│                                                         │
│  Zenner.app/                                            │
│  ├── Contents/                                          │
│  │   ├── MacOS/                                         │
│  │   │   └── Zenner        ◄─── Rust binary            │
│  │   ├── Resources/                                     │
│  │   │   ├── assets/       ◄─── Vite build             │
│  │   │   └── icons/                                     │
│  │   └── Info.plist                                     │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              Create .dmg Installer                      │
│                                                         │
│  Zenner_1.0.0_aarch64.dmg                               │
│  ├── Zenner.app                                         │
│  ├── Applications (symlink)                             │
│  └── Background image                                   │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              Output Location                            │
│                                                         │
│  src-tauri/target/release/bundle/dmg/                   │
│  └── Zenner_1.0.0_aarch64.dmg                           │
│                                                         │
│  THIS IS WHAT YOU SHIP TO CUSTOMERS                     │
└─────────────────────────────────────────────────────────┘
```

---

## First Launch on Customer's Machine

```
┌─────────────────────────────────────────────────────────┐
│  Customer downloads Zenner_1.0.0_aarch64.dmg            │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  Opens .dmg, drags Zenner.app to Applications/          │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  Double-clicks Zenner.app                               │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              Tauri Initializes                          │
│                                                         │
│  1. Create app directory:                               │
│     ~/Library/Application Support/com.zenner/           │
│                                                         │
│  2. DatabaseService.init() called                       │
│     - Creates zenner.db                                 │
│     - Runs CREATE TABLE statements:                     │
│       * sessions                                        │
│       * journal_entries                                 │
│       * presets                                         │
│     - Creates indexes                                   │
│                                                         │
│  3. Load React app in WebView                           │
│     - Renders UI                                        │
│     - Shows onboarding (if first time)                  │
│                                                         │
│  4. Initialize services:                                │
│     - EventBus starts listening                         │
│     - MusicController ready                             │
│     - All services connected to DB                      │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│         App is Ready to Use!                            │
│                                                         │
│  • Database: EMPTY (0 sessions, 0 journal entries)      │
│  • localStorage: EMPTY (no API keys yet)                │
│  • UI: Shows timer with default preset                  │
│  • Stats: Shows 0 everywhere (no data yet)              │
│                                                         │
│  User can now:                                          │
│  - Start first Pomodoro session                         │
│  - Write first journal entry                            │
│  - Configure Spotify/YouTube                            │
└─────────────────────────────────────────────────────────┘
```

---

## Data Storage Locations Map

```
Customer's macOS System
│
├── ~/Library/Application Support/com.zenner/
│   │
│   └── zenner.db  ◄──────────────────┐
│       │                             │
│       ├── sessions table            │ PERSISTENT
│       ├── journal_entries table     │ (SQLite)
│       └── presets table             │
│                                     │
├── ~/Library/Application Support/com.zenner/
│   └── [WebView localStorage]  ◄────┐
│       │                             │
│       ├── spotify_access_token      │ PERSISTENT
│       ├── spotify_refresh_token     │ (Browser)
│       ├── youtube_api_key           │
│       ├── spotify_favorites         │
│       ├── youtube_favorites         │
│       └── theme_preference          │
│                                     │
└── /Applications/
    └── Zenner.app/
        ├── Contents/MacOS/Zenner (Binary)
        └── Contents/Resources/
            └── assets/ (HTML/JS/CSS/Images)
```

---

## Data Flow: Complete Session Example

```
TIME: 10:00 AM - User starts 25-minute focus session

┌─────────────────────────────────────────────────────────┐
│ 10:00:00  User clicks START button                      │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ 10:00:00  App.tsx                                        │
│           - isRunning = true                            │
│           - mode = 'focus'                              │
│           - timeLeft = 1500 (25 min)                    │
└────────┬────────────────────────────────────────────────┘
         │
         ├───► EventBus.emit(SESSION_START)
         │     └─► MusicController.resume()
         │         └─► SpotifyService.play()
         │             └─► AppleScript: tell Spotify to play
         │
         └───► useEffect starts interval
               Countdown: 1500 → 1499 → 1498 ...
               
┌─────────────────────────────────────────────────────────┐
│ 10:00:01  Frontend updates every second                 │
│           - UI shows "24:59" → "24:58" ...              │
│           - Progress ring animates                      │
└─────────────────────────────────────────────────────────┘

         ... 25 minutes pass ...
         
┌─────────────────────────────────────────────────────────┐
│ 10:25:00  Timer reaches 0                               │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ 10:25:00  App.tsx                                        │
│           - isRunning = false                           │
│           - Play completion sound 🔔                    │
│           - Show macOS notification                     │
└────────┬────────────────────────────────────────────────┘
         │
         ├───► EventBus.emit(SESSION_END)
         │     └─► MusicController.pause()
         │         └─► SpotifyService.pause()
         │
         └───► SessionService.createSession({
               │     type: 'focus',
               │     duration: 1500,
               │     completed: true,
               │     timestamp: 1704880800000
               │   })
               │
               ▼
           DatabaseService.execute(
               "INSERT INTO sessions ..."
           )
               │
               ▼ Tauri IPC
           [Rust Backend]
               │
               ▼
           SQLite writes to disk
           
┌─────────────────────────────────────────────────────────┐
│ 10:25:01  Database updated                              │
│           zenner.db now contains 1 session              │
│                                                         │
│ sessions table:                                         │
│ ┌────┬───────┬──────────┬───────────┬──────────────┐   │
│ │ id │ type  │ duration │ completed │ timestamp    │   │
│ ├────┼───────┼──────────┼───────────┼──────────────┤   │
│ │ 1  │focus  │ 1500     │ 1         │1704880800000 │   │
│ └────┴───────┴──────────┴───────────┴──────────────┘   │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ 10:25:01  Analytics view refreshes                      │
│           - sessionService.getStats() queries DB        │
│           - NOW SHOWS: 1 session, 25 minutes focused    │
│           - Completion rate: 100%                       │
└─────────────────────────────────────────────────────────┘
```

---

## Debugging Analytics: Step-by-Step

```
PROBLEM: Analytics shows 0 sessions

┌─────────────────────────────────────────────────────────┐
│ Step 1: Verify database exists                          │
└────────┬────────────────────────────────────────────────┘
         │
         Terminal:
         $ ls ~/Library/Application\ Support/com.zenner.dev/
         
         Expected: zenner.db (file exists)
         If missing: Database not initialized!

┌─────────────────────────────────────────────────────────┐
│ Step 2: Check database contents                         │
└────────┬────────────────────────────────────────────────┘
         │
         Terminal:
         $ sqlite3 ~/Library/Application\ Support/com.zenner.dev/zenner.db
         sqlite> .tables
         
         Expected: sessions  journal_entries  presets
         If missing: Tables not created!
         
         sqlite> SELECT COUNT(*) FROM sessions;
         
         Expected: Number > 0
         If 0: No sessions saved yet!

┌─────────────────────────────────────────────────────────┐
│ Step 3: Verify session is being saved                   │
└────────┬────────────────────────────────────────────────┘
         │
         Add to SessionService.ts:
         
         async createSession(data) {
             console.log("💾 Saving session:", data);  // ← ADD THIS
             await this.init();
             const result = await this.db.execute(...);
             console.log("✅ Session saved!");          // ← ADD THIS
             return result;
         }
         
         Run app, complete session, check console.
         
         If missing logs: createSession() not being called!
         If error: SQL syntax error or DB locked!

┌─────────────────────────────────────────────────────────┐
│ Step 4: Verify analytics query                          │
└────────┬────────────────────────────────────────────────┘
         │
         Add to AnalyticsDashboard.tsx:
         
         useEffect(() => {
             const loadStats = async () => {
                 const stats = await sessionService.getStats();
                 console.log("📊 Stats loaded:", stats); // ← ADD THIS
                 setStats(stats);
             };
             loadStats();
         }, []);
         
         Check console for stats object.
         
         If empty: Query is working but no data!
         If error: SQL error in getStats()!

┌─────────────────────────────────────────────────────────┐
│ Step 5: Manual test data                                │
└────────┬────────────────────────────────────────────────┘
         │
         Terminal:
         $ sqlite3 ~/Library/Application\ Support/com.zenner.dev/zenner.db
         
         sqlite> INSERT INTO sessions (type, duration, completed, timestamp)
                 VALUES ('focus', 1500, 1, 1704880800000);
         
         sqlite> SELECT * FROM sessions;
         
         Refresh analytics view.
         If NOW shows data: Save mechanism broken!
         If still 0: Query mechanism broken!
```

---

This documentation provides:
- Complete visual architecture
- Database schema diagrams
- Data flow visualizations
- Build process flowcharts
- First-run initialization sequence
- Debugging guide for analytics

Save this alongside ARCHITECTURE.md for complete system understanding!
