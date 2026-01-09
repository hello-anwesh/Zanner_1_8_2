# Documentation Index

Complete guide to Zenner's architecture, database, and development.

---

## 📚 Documentation Files

### 1. **ARCHITECTURE.md**
**Complete technical architecture documentation**

- System overview
- Database schema (sessions, journal_entries, presets)
- Service layer design
- File structure & dependencies
- Build & deployment process
- What ships to customers
- First-run initialization
- Debugging analytics

**Read this to understand:**
- How everything fits together
- Database structure
- Build process
- Customer deployment

---

### 2. **VISUAL_ARCHITECTURE.md**
**ASCII diagrams and flowcharts**

- System architecture diagram
- Database schema visual
- Complete session lifecycle
- Service dependency graph
- Build distribution flow
- First launch sequence
- Data flow with timestamps

**Read this to visualize:**
- System components
- Data flows
- Dependencies
- Build pipeline

---

### 3. **DATABASE_QUICK_REFERENCE.md**
**Quick reference for database operations**

- Common SQL commands
- Debugging queries
- Service API usage
- Export/import data
- Database maintenance
- Performance monitoring

**Use this for:**
- Quick lookups
- Debugging
- Database queries
- API reference

---

### 4. **API_SETUP_GUIDE.md**
**Setup instructions for external integrations**

- Spotify Web API setup (step-by-step)
- YouTube Data API v3 setup
- Troubleshooting
- Privacy & security
- Cost & limits

**Use this to:**
- Set up integrations
- Troubleshoot API issues
- Understand quotas

---

## 🚀 Quick Start

### New Developer Onboarding

**Read in this order:**

1. **ARCHITECTURE.md** (30 min)
   - Understand system design
   - Learn database structure
   - See how data flows

2. **VISUAL_ARCHITECTURE.md** (20 min)
   - See visual representations
   - Understand dependencies
   - Follow data flows

3. **DATABASE_QUICK_REFERENCE.md** (15 min)
   - Learn quick commands
   - Bookmark for debugging
   - Try sample queries

### Debugging Analytics Issue

**Analytics shows 0? Follow this:**

1. **DATABASE_QUICK_REFERENCE.md** → "Common Issues & Fixes"
2. **ARCHITECTURE.md** → "Analytics Showing 0 - Debugging"
3. **VISUAL_ARCHITECTURE.md** → "Debugging Analytics: Step-by-Step"

### Understanding Build Process

1. **ARCHITECTURE.md** → "Build & Deployment"
2. **VISUAL_ARCHITECTURE.md** → "Build & Distribution Flow"
3. See what customers receive

---

## 🎯 Common Tasks

### Check Database

```bash
# Quick check
sqlite3 ~/Library/Application\ Support/com.zenner.dev/zenner.db "SELECT COUNT(*) FROM sessions;"

# Open database
sqlite3 ~/Library/Application\ Support/com.zenner.dev/zenner.db
```

See: **DATABASE_QUICK_REFERENCE.md**

### Add Test Data

```sql
INSERT INTO sessions (type, duration, completed, timestamp)
VALUES ('focus', 1500, 1, strftime('%s','now') * 1000);
```

See: **DATABASE_QUICK_REFERENCE.md** → "Add Test Data"

### Build for Production

```bash
npm run tauri build
```

Output: `src-tauri/target/release/bundle/dmg/`

See: **ARCHITECTURE.md** → "Build & Deployment"

### Export User Data

Use export function from **DATABASE_QUICK_REFERENCE.md** → "Export/Import Data"

---

## 🗂️ System Overview At a Glance

### Tech Stack
- **Frontend:** React + TypeScript + Vite
- **Backend:** Tauri (Rust)
- **Database:** SQLite
- **Storage:** Local filesystem + localStorage

### Database Tables
1. **sessions** - Pomodoro session records
2. **journal_entries** - Daily journal entries
3. **presets** - Custom timer presets

### Services
- **SessionService** - CRUD for sessions
- **JournalService** - CRUD for journal
- **PresetService** - CRUD for presets
- **DatabaseService** - SQLite connection
- **SpotifyService** - Spotify integration
- **YouTubeService** - YouTube integration
- **MusicController** - Music sync
- **EventBus** - Pub/sub events

### Data Locations
- **Database:** `~/Library/Application Support/com.zenner/zenner.db`
- **localStorage:** API keys, favorites, preferences
- **In-memory:** Event listeners, runtime state

---

## 📊 Key Diagrams

All diagrams are in **VISUAL_ARCHITECTURE.md**:

1. **System Architecture** - How frontend/backend connect
2. **Database Schema** - Table structure
3. **Session Lifecycle** - Complete flow from start to save
4. **Service Dependencies** - How services interact
5. **Build Flow** - From code to .dmg
6. **First Launch** - What happens on customer machine

---

## 🐛 Debugging

### Analytics Shows 0

**Check database:**
```bash
sqlite3 ~/Library/Application\ Support/com.zenner.dev/zenner.db "SELECT * FROM sessions ORDER BY timestamp DESC LIMIT 5;"
```

**If empty:**
- Complete a full Pomodoro session
- Check console for errors
- Verify `SessionService.createSession()` is called

**If database doesn't exist:**
- App not initialized
- Check `DatabaseService.init()`
- Look for init errors

See: **ARCHITECTURE.md** → "Analytics Showing 0 - Debugging"

### Database Locked

```bash
sqlite3 ~/Library/Application\ Support/com.zenner.dev/zenner.db "PRAGMA journal_mode=WAL;"
```

### Check Logs

- Open DevTools in app (Cmd+Opt+I)
- Look for database errors
- Check IPC call failures

---

## 🔒 Data Privacy

**What's stored locally:**
- All Pomodoro sessions (SQLite)
- Journal entries (SQLite)
- API keys (localStorage)
- Favorites (localStorage)

**What's NOT sent anywhere:**
- No telemetry
- No cloud sync (yet)
- No external servers (except API calls)

**User data location:**
```
~/Library/Application Support/com.zenner/
├── zenner.db          (SQLite database)
└── WebView storage    (localStorage)
```

---

## 🚢 Shipping to Customers

**Build command:**
```bash
npm run tauri build
```

**Output:**
```
src-tauri/target/release/bundle/dmg/Zenner_1.0.0_aarch64.dmg
```

**What's included:**
- Compiled Rust binary
- Bundled React app (minified)
- Assets (images, icons)

**What's NOT included:**
- Source code
- node_modules
- Dev tools
- Database (created on first run)

**First run on customer machine:**
1. App creates directory: `~/Library/Application Support/com.zenner/`
2. Initializes database with tables
3. Shows onboarding
4. Ready to use

See: **ARCHITECTURE.md** → "What Ships to Customers"

---

## 📝 Contributing

When adding new features:

1. **Update database?** → Update ARCHITECTURE.md schema
2. **New service?** → Update service dependency diagram
3. **Data flow changes?** → Update VISUAL_ARCHITECTURE.md
4. **New queries?** → Add to DATABASE_QUICK_REFERENCE.md

---

## ❓ FAQ

**Q: Where is the database?**
A: `~/Library/Application Support/com.zenner.dev/zenner.db` (dev) or `.../com.zenner/zenner.db` (prod)

**Q: How do I reset everything?**
A: Delete the Application Support folder or use SQL DELETE commands

**Q: Can I export my data?**
A: Yes, see DATABASE_QUICK_REFERENCE.md → "Export/Import Data"

**Q: What happens if database is corrupted?**
A: See DATABASE_QUICK_REFERENCE.md → "Corrupted database"

**Q: How do I add test sessions?**
A: See DATABASE_QUICK_REFERENCE.md → "Add Test Data"

---

## 🎓 Learning Path

**Level 1: User**
- Read API_SETUP_GUIDE.md
- Set up Spotify/YouTube
- Use the app

**Level 2: Power User**
- Read DATABASE_QUICK_REFERENCE.md
- Export your data
- Run custom queries

**Level 3: Developer**
- Read ARCHITECTURE.md
- Read VISUAL_ARCHITECTURE.md
- Understand data flows
- Contribute to codebase

**Level 4: Maintainer**
- All above +
- Understand build process
- Debug production issues
- Optimize performance

---

## 📞 Support

**Issue:** Analytics not working
→ See: ARCHITECTURE.md → "Analytics Showing 0 - Debugging"

**Issue:** Database errors
→ See: DATABASE_QUICK_REFERENCE.md → "Common Issues & Fixes"

**Issue:** Build failing
→ See: ARCHITECTURE.md → "Build & Deployment"

**Issue:** API integrations
→ See: API_SETUP_GUIDE.md

---

**Last Updated:** January 2026
**Version:** 1.0.0
