# Production Build & Data Handling Guide
**Date:** January 7, 2026 at 12:05 AM IST

## When You Compile & Distribute

### Build Process
```bash
# Development
npm run tauri dev

# Production Build
npm run tauri build
```

**Output:**
- **macOS:** `.dmg` installer and `.app` bundle in `src-tauri/target/release/bundle/`
- **Windows:** `.msi` installer and `.exe` in `src-tauri/target/release/bundle/`
- **Linux:** `.deb`, `.AppImage`, etc.

---

## Data Storage in Production

### Where User Data Lives

#### macOS
```
User Data Directory:
~/Library/Application Support/com.zenner.app/

Contains:
- zenner.db (SQLite database)
- logs/
- cache/
- user-preferences.json
```

**Browser Data (WebView):**
```
~/Library/Application Support/com.zenner.app/WebStorage/
- LocalStorage/
  • zenner-ai-config
  • zenner-training-profile
  • zenner-rag-index
  • zenner-timer-presets
  • etc.
```

#### Windows
```
%APPDATA%\com.zenner.app\
- zenner.db
- logs\
- cache\
```

#### Linux
```
~/.local/share/com.zenner.app/
- zenner.db
- logs/
- cache/
```

---

## Data Lifecycle

### First Launch (Brand New User)
```
1. App starts
2. Checks for existing data → NONE
3. Creates default profile:
   - Empty training data
   - Default presets
   - Fresh analytics database
4. Shows onboarding/welcome screen
5. User starts using app
6. Data accumulates in localStorage + SQLite
```

### Subsequent Launches
```
1. App starts
2. Loads data from:
   - localStorage (training, config, presets)
   - SQLite (session history, analytics)
3. Initializes services with user's data
4. Everything works with their personalized settings
```

### User Uninstalls
```
IMPORTANT: Data is NOT automatically deleted!

macOS: Data remains in ~/Library/Application Support/com.zenner.app/
Windows: Data remains in %APPDATA%\com.zenner.app\
Linux: Data remains in ~/.local/share/com.zenner.app/

This is BY DESIGN:
- User can reinstall and keep their data
- Prevents accidental data loss
- Standard behavior for desktop apps
```

---

## Multi-User Scenarios

### Same Computer, Different OS Users
```
macOS User A:
~/Library/Application Support/com.zenner.app/ → User A's data

macOS User B:
~/Library/Application Support/com.zenner.app/ → User B's data

Result: ISOLATED ✅
Each OS user has their own data directory automatically.
```

### Same OS User, Multiple Profiles (Future)
```
With Multi-Profile System:

~/Library/Application Support/com.zenner.app/
- profiles/
  • work-profile-123/
    - training.json
    - analytics.db
  • personal-profile-456/
    - training.json
    - analytics.db
- active-profile.json → points to current profile
```

---

## Data Migration & Portability

### Export User Data
```typescript
// Future: Export Profile feature
exportProfile() {
  const data = {
    training: trainingService.getProfile(),
    config: configService.getConfig(),
    presets: presetManager.getPresets(),
    analytics: databaseService.exportAnalytics(),
    rag: ragService.exportDocuments()
  };
  
  // Download as zenner-backup-2026-01-07.json
  downloadJSON(data, `zenner-backup-${date}.json`);
}
```

### Import on New Machine
```typescript
importProfile(file) {
  const data = JSON.parse(file);
  
  trainingService.importProfile(data.training);
  configService.importConfig(data.config);
  presetManager.importPresets(data.presets);
  databaseService.importAnalytics(data.analytics);
  ragService.importDocuments(data.rag);
  
  // Restart app with new data loaded
}
```

---

## Build Distribution

### Installer Types

#### macOS .dmg
```
User downloads: Zenner-1.0.0.dmg
User drags to Applications folder
First launch: Creates new data directory
Everything is isolated per user
```

#### Windows .msi
```
User downloads: Zenner-1.0.0.msi
Installs to Program Files
Data goes to %APPDATA%\com.zenner.app\
Each Windows user has own data
```

#### Auto-Update (Future)
```
Tauri supports auto-updates:
- Check for updates on launch
- Download in background
- Prompt user to install
- Data persists across updates ✅
```

---

## Privacy & Security

### What Gets Stored Locally
```
✅ STORED:
- Session history
- Analytics
- Training data
- AI configurations
- Custom presets
- Conversation history
- RAG documents

❌ NEVER STORED:
- API keys (if using cloud AI)
- Passwords
- Spotify tokens (stored in Spotify SDK)
```

### API Keys & Secrets
```
Current: Hardcoded in code (DEV ONLY)

Production Best Practice:
1. User provides their own API key
2. Store encrypted in system keychain:
   - macOS: Keychain API
   - Windows: Credential Manager
   - Linux: Secret Service API

Implementation:
- Settings → AI → "Enter OpenAI API Key"
- Stored securely via Tauri encrypt plugin
- Never sent anywhere except OpenAI
```

---

## App Updates

### Update Scenarios

#### Minor Update (1.0.0 → 1.0.1)
```
User installs new version
Data directory remains unchanged
App reads existing data
Everything works ✅
```

#### Major Update with Data Migration (1.0.0 → 2.0.0)
```
App detects old data format
Runs migration:
  - Convert old localStorage structure
  - Update database schema
  - Transform presets to new format
Creates backup of old data
Loads migrated data
Everything works ✅
```

#### Breaking Changes
```
If data structure changes drastically:
1. Detect old version
2. Show migration wizard
3. "We're upgrading your data..."
4. Migrate in background
5. Keep backup: zenner-backup-pre-v2.json
6. Test new data works
7. Continue
```

---

## Data Size & Performance

### Typical User Data Sizes
```
Light User (1 month):
- 100 sessions
- Basic training
- Few presets
≈ 5-10 MB total

Heavy User (1 year):
- 1000+ sessions
- Extensive training
- Multiple profiles
- Large RAG library
- Conversation history
≈ 50-100 MB total

Power User (multi-year):
- 10,000+ sessions
- Multiple profiles
- Screenshots
- Large documents
≈ 200-500 MB total
```

### Performance Considerations
```
SQLite:
- Indexed queries
- Vacuum regularly
- Archive old data

localStorage:
- 5-10MB limit
- Compress large items
- Move to IndexedDB if needed

IndexedDB:
- For large RAG documents
- For screenshots
- For long conversation history
```

---

## Debugging User Issues

### Access User Data
```bash
# macOS
cd ~/Library/Application Support/com.zenner.app/
ls -la

# View database
sqlite3 zenner.db
.tables
SELECT * FROM sessions LIMIT 5;

# View localStorage (in app DevTools)
# Right-click → Inspect → Application → Local Storage
```

### Common Issues

**"My data is gone!"**
```
Check:
1. Did they change OS user?
2. Did they reinstall on different drive?
3. Is data actually in correct directory?
4. Was localStorage cleared by browser?

Solution: Import from backup
```

**"App is slow!"**
```
Check data size:
du -sh ~/Library/Application Support/com.zenner.app/

If large:
- Archive old sessions
- Clear conversation history
- Optimize database (VACUUM)
```

---

## Best Practices for Distribution

### Pre-Release Checklist
```
✅ Test fresh install (no existing data)
✅ Test update from previous version
✅ Test data migration
✅ Test on clean OS user account
✅ Test export/import
✅ Verify no hardcoded secrets
✅ Check data directory creation
✅ Test uninstall (data should persist)
✅ Code signing (macOS)
✅ Notarization (macOS)
```

### Documentation for Users
```
Include in README/Help:
1. Where data is stored
2. How to backup
3. How to transfer to new computer
4. Privacy policy
5. What data is collected (if any)
```

---

## Future: Cloud Sync

### Architecture (If Implemented)
```
Local Data (Primary):
~/Library/Application Support/com.zenner.app/

Cloud Sync (Optional):
- Google Drive
- Dropbox
- Self-hosted server

Sync Process:
1. User enables sync in settings
2. Authenticate with cloud provider
3. Upload encrypted backup
4. Periodic sync (every hour)
5. Conflict resolution (last-write-wins)
6. Can disable and go local-only anytime
```

---

## Summary for Users

**When you download Zenner:**
1. Install like any app
2. First launch creates fresh data
3. Your data stays on YOUR computer
4. No cloud required (unless you want it)
5. Uninstall doesn't delete data (safety)
6. Updates preserve your data
7. You can export/import anytime

**Your data is:**
- ✅ Private (local only)
- ✅ Persistent (survives updates)
- ✅ Portable (export/import)
- ✅ Secure (encrypted storage planned)
- ✅ Yours (no cloud lock-in)

This is a **desktop app** - your data is **yours**.
