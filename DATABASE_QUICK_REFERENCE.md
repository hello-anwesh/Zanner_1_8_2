# Zenner Database Quick Reference

Quick lookup guide for database operations, debugging, and data management.

---

## Quick Commands

### Check Database Status

```bash
# Find database location
ls -lh ~/Library/Application\ Support/com.zenner.dev/

# Open database
sqlite3 ~/Library/Application\ Support/com.zenner.dev/zenner.db

# Quick check
sqlite3 ~/Library/Application\ Support/com.zenner.dev/zenner.db "SELECT COUNT(*) as sessions FROM sessions;"
```

### Inspect Data

```sql
-- All tables
.tables

-- Table structure
.schema sessions
.schema journal_entries
.schema presets

-- Count records
SELECT COUNT(*) FROM sessions;
SELECT COUNT(*) FROM journal_entries;
SELECT COUNT(*) FROM presets;

-- Recent sessions
SELECT * FROM sessions ORDER BY timestamp DESC LIMIT 10;

-- Recent journal entries
SELECT date, mood, substr(content, 1, 50) as preview 
FROM journal_entries 
ORDER BY date DESC 
LIMIT 10;

-- Stats
SELECT 
    type,
    COUNT(*) as count,
    SUM(duration) as total_seconds,
    AVG(duration) as avg_seconds
FROM sessions 
GROUP BY type;
```

### Add Test Data

```sql
-- Add test session (focus)
INSERT INTO sessions (type, duration, completed, timestamp)
VALUES ('focus', 1500, 1, strftime('%s','now') * 1000);

-- Add test session (break)
INSERT INTO sessions (type, duration, completed, timestamp)
VALUES ('shortBreak', 300, 1, strftime('%s','now') * 1000);

-- Add test journal entry
INSERT INTO journal_entries (date, content, mood, created_at, updated_at)
VALUES (
    date('now'), 
    'Test entry', 
    'good', 
    strftime('%s','now') * 1000,
    strftime('%s','now') * 1000
);
```

### Clear Data

```sql
-- Delete all sessions
DELETE FROM sessions;

-- Delete all journal entries
DELETE FROM journal_entries;

-- Delete all presets
DELETE FROM presets;

-- Reset auto-increment
DELETE FROM sqlite_sequence WHERE name='sessions';
DELETE FROM sqlite_sequence WHERE name='journal_entries';
DELETE FROM sqlite_sequence WHERE name='presets';
```

---

## Common Issues & Fixes

### Issue: Analytics shows 0

**Check:**
```bash
sqlite3 ~/Library/Application\ Support/com.zenner.dev/zenner.db "SELECT COUNT(*) FROM sessions;"
```

**If returns 0:**
- No sessions saved yet
- Complete a full Pomodoro session
- Check console for save errors

**If database doesn't exist:**
- App hasn't initialized
- Check `DatabaseService.init()` is called
- Look for errors in console

### Issue: Database locked

**Cause:** Multiple processes accessing DB

**Fix:**
```bash
# Close all instances of the app
# Then:
sqlite3 ~/Library/Application\ Support/com.zenner.dev/zenner.db "PRAGMA journal_mode=WAL;"
```

### Issue: Corrupted database

**Recovery:**
```bash
# Backup current
cp ~/Library/Application\ Support/com.zenner.dev/zenner.db ~/Desktop/zenner_backup.db

# Check integrity
sqlite3 ~/Library/Application\ Support/com.zenner.dev/zenner.db "PRAGMA integrity_check;"

# If corrupted, export and reimport
sqlite3 ~/Library/Application\ Support/com.zenner.dev/zenner.db .dump > dump.sql
mv ~/Library/Application\ Support/com.zenner.dev/zenner.db ~/Library/Application\ Support/com.zenner.dev/zenner_corrupted.db
sqlite3 ~/Library/Application\ Support/com.zenner.dev/zenner.db < dump.sql
```

---

## Service API Quick Reference

### SessionService

```typescript
import { sessionService } from './services/session/SessionService';

// Create session
await sessionService.createSession({
    type: 'focus' | 'shortBreak' | 'longBreak',
    duration: 1500,  // seconds
    completed: true,
    timestamp: Date.now(),
    notes: 'Optional notes',
    tags: ['work', 'frontend']
});

// Get sessions by date range
const sessions = await sessionService.getSessionsByDateRange(
    startDate,  // Date object
    endDate     // Date object
);

// Get stats
const stats = await sessionService.getStats(
    startDate,
    endDate
);
// Returns: { totalSessions, focusTime, breakTime, completionRate }

// Get today's sessions
const today = await sessionService.getTodaySessions();
```

### JournalService

```typescript
import { journalService } from './services/journal/JournalService';

// Create or update entry
await journalService.createOrUpdateEntry(
    '2026-01-09',           // date (YYYY-MM-DD)
    'Journal content...',   // content
    'good',                 // mood (optional)
    ['reflection', 'work']  // tags (optional)
);

// Get entry by date
const entry = await journalService.getEntry('2026-01-09');

// Get recent entries
const entries = await journalService.getRecentEntries(7); // last 7 days

// Search entries
const results = await journalService.searchEntries('productivity');

// Delete entry
await journalService.deleteEntry('2026-01-09');

// Get AI context
const context = await journalService.getContextForAI(3); // last 3 days
```

### PresetService

```typescript
import { presetService } from './services/preset/PresetService';

// Create preset
await presetService.createPreset({
    name: 'Deep Work',
    focusDuration: 50,
    shortBreakDuration: 10,
    longBreakDuration: 30,
    sessionsUntilLongBreak: 3
});

// Get all presets
const presets = await presetService.getPresets();

// Update preset
await presetService.updatePreset(id, {
    name: 'Updated name',
    focusDuration: 60
});

// Delete preset
await presetService.deletePreset(id);
```

---

## localStorage Data

### Check localStorage

Open Developer Tools (in app) and run:

```javascript
// Check all keys
Object.keys(localStorage);

// Spotify tokens
localStorage.getItem('spotify_access_token');
localStorage.getItem('spotify_refresh_token');

// YouTube
localStorage.getItem('youtube_api_key');

// Favorites
JSON.parse(localStorage.getItem('spotify_favorites'));
JSON.parse(localStorage.getItem('youtube_favorites'));

// Clear all
localStorage.clear();
```

---

## Export/Import Data

### Export All Data

```typescript
// Add this function to App or create ExportService
async function exportAllData() {
    const data = {
        sessions: await sessionService.getAllSessions(),
        journal: await journalService.getAllEntries(),
        presets: await presetService.getAllPresets(),
        spotify_favorites: JSON.parse(localStorage.getItem('spotify_favorites') || '[]'),
        youtube_favorites: JSON.parse(localStorage.getItem('youtube_favorites') || '[]'),
        exported_at: new Date().toISOString(),
        version: '1.0.0'
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zenner-backup-${Date.now()}.json`;
    a.click();
}
```

### Import Data

```typescript
async function importData(jsonString: string) {
    const data = JSON.parse(jsonString);
    
    // Import sessions
    for (const session of data.sessions) {
        await sessionService.createSession(session);
    }
    
    // Import journal entries
    for (const entry of data.journal) {
        await journalService.createOrUpdateEntry(
            entry.date,
            entry.content,
            entry.mood,
            entry.tags
        );
    }
    
    // Import favorites
    localStorage.setItem('spotify_favorites', JSON.stringify(data.spotify_favorites));
    localStorage.setItem('youtube_favorites', JSON.stringify(data.youtube_favorites));
}
```

---

## Database Maintenance

### Vacuum (Optimize)

```bash
sqlite3 ~/Library/Application\ Support/com.zenner.dev/zenner.db "VACUUM;"
```

### Analyze (Update Statistics)

```bash
sqlite3 ~/Library/Application\ Support/com.zenner.dev/zenner.db "ANALYZE;"
```

### Check Size

```bash
ls -lh ~/Library/Application\ Support/com.zenner.dev/zenner.db
```

### Backup

```bash
# Simple backup
cp ~/Library/Application\ Support/com.zenner.dev/zenner.db ~/Desktop/zenner_backup_$(date +%Y%m%d).db

# Or use SQLite backup command
sqlite3 ~/Library/Application\ Support/com.zenner.dev/zenner.db ".backup ~/Desktop/zenner_backup.db"
```

---

## Development vs Production

### Paths

**Development:**
```
~/Library/Application Support/com.zenner.dev/zenner.db
```

**Production:**
```
~/Library/Application Support/com.zenner/zenner.db
```

### Switch Between Environments

**Check current environment:**
```typescript
import { tauri } from '@tauri-apps/api';
const isDev = await tauri.invoke('is_dev');
```

**Force production build:**
```bash
npm run tauri build
```

**Test production DB in dev:**
```typescript
// Temporarily modify DatabaseService.ts
const dbPath = isDev 
    ? 'com.zenner.dev/zenner.db'
    : 'com.zenner/zenner.db';  // Remove this ternary, force prod path
```

---

## Performance Monitoring

### Check Query Performance

```sql
EXPLAIN QUERY PLAN 
SELECT * FROM sessions 
WHERE timestamp BETWEEN ? AND ?;

-- Should show "USING INDEX idx_sessions_timestamp"
```

### Add Indexes

```sql
-- If queries are slow, add indexes
CREATE INDEX idx_sessions_completed ON sessions(completed);
CREATE INDEX idx_journal_mood ON journal_entries(mood);
```

### Profile Database

```sql
-- Enable timing
.timer on

-- Run queries
SELECT COUNT(*) FROM sessions;
SELECT * FROM sessions ORDER BY timestamp DESC LIMIT 100;

-- Should be < 10ms for most queries
```

---

## Useful Queries

### Daily Statistics

```sql
SELECT 
    DATE(timestamp/1000, 'unixepoch') as date,
    COUNT(*) as sessions,
    SUM(CASE WHEN type = 'focus' THEN duration ELSE 0 END) as focus_time,
    AVG(CASE WHEN completed = 1 THEN 100.0 ELSE 0.0 END) as completion_rate
FROM sessions
WHERE timestamp > strftime('%s', 'now', '-30 days') * 1000
GROUP BY date
ORDER BY date DESC;
```

### Mood Trends

```sql
SELECT 
    mood,
    COUNT(*) as count,
    AVG(LENGTH(content)) as avg_length
FROM journal_entries
WHERE date > date('now', '-30 days')
GROUP BY mood
ORDER BY count DESC;
```

### Most Used Tags

```sql
-- This requires parsing JSON in app
-- SQLite doesn't have great JSON support without extensions
```

---

This quick reference covers:
- ✅ Command-line database access
- ✅ Common SQL queries
- ✅ Debugging steps
- ✅ Service API usage
- ✅ Export/import data
- ✅ Performance tips
- ✅ Maintenance tasks

Keep this handy for development and debugging!
