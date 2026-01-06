# Master Plan: Advanced Features
**Date:** January 7, 2026 at 12:03 AM IST

## Current Data Storage

### Where Data Lives
**Browser LocalStorage:**
- AI Config: `zenner-ai-config`
- Training Profile: `zenner-training-profile`
- RAG Documents: `zenner-rag-index`
- Presets: `zenner-timer-presets`
- App Config: `zenner-config`
- Accountability: `zenner-accountability`
- Metronome: `metronome-config`

**Database (SQLite via Tauri):**
- Session history
- Analytics data
- Performance metrics

**Issues with Current Approach:**
- No multi-profile support
- Data tied to single user
- No backup/restore
- No cloud sync
- localStorage limits (~5-10MB)

---

## FEATURE 1: Spotify Playlist Search & Add

### Current State
- Manual URL input only
- No search capability
- No playlist browsing
- Limited discoverability

### Plan
**Step 1: Spotify Search API Integration**
- Add search endpoint to SpotifyService
- Query types: playlists, albums, tracks
- Return formatted results with images

**Step 2: Search UI Component**
```
SpotifySearchModal:
- Search input with debounce
- Filter tabs (Playlists | Albums | Tracks)
- Result cards with:
  • Cover art
  • Name
  • Creator/Artist
  • Track count
  • "Add" button
- Pagination (load more)
```

**Step 3: Integration Points**
- FloatingPlayer: "Browse Spotify" button
- Music Settings: Playlist manager
- Quick add from search results

**Technical:**
```typescript
// New SpotifyService methods
async searchPlaylists(query: string, limit = 20)
async searchAlbums(query: string, limit = 20)
async getPlaylistTracks(playlistId: string)
async getUserPlaylists()
```

---

## FEATURE 2: Zeni Intelligence Evolution

### Current Capabilities
✅ Context from training data
✅ Basic RAG retrieval
✅ Analytics awareness
✅ Time-based responses

### Missing Intelligence
❌ Image/screenshot analysis
❌ Advanced pattern recognition
❌ Proactive interventions
❌ Long-term memory
❌ Multi-modal understanding

### Enhancement Plan

#### 2A. Vision Capabilities
**Use Case:** "Zeni, look at my screen - am I focused?"

**Implementation:**
```typescript
VisionService:
- Capture screenshots (with permission)
- Send to Claude/GPT-4V
- Analyze: productivity apps vs distractions
- Provide feedback

Integration:
- "Analyze my screen" button in Zeni chat
- Periodic screen checks during sessions (opt-in)
- Distraction detection
```

**Privacy:**
- Explicit permission required
- Local-only processing option
- Delete screenshots after analysis
- User control over frequency

#### 2B. Advanced RAG
**Current:** Simple text retrieval
**Upgrade to:**

```
Enhanced RAG Pipeline:
1. Document Chunking: Smart splitting by context
2. Embeddings: Use OpenAI/Voyage embeddings
3. Vector Store: IndexedDB for larger storage
4. Hybrid Search: Combine semantic + keyword
5. Re-ranking: Relevance scoring
6. Context Window: Send top 3-5 most relevant chunks
```

**New Features:**
- Upload PDFs, docs for context
- Web page scraping
- Meeting notes integration
- Code context awareness

#### 2C. Long-Term Memory
**Problem:** Conversation history cleared per session

**Solution:**
```typescript
MemoryService:
- Episodic Memory: Remember specific conversations
- Semantic Memory: Extract key facts over time
- Working Memory: Current session context
- Consolidation: Periodic summary of learnings

Storage:
- SQLite for persistent memory
- Indexed by date, topic, importance
- Search through past interactions
```

#### 2D. Proactive Intelligence
**Crash & Burn Detection:**
- Monitor session patterns in real-time
- Intervene BEFORE burnout ("You need a break NOW")
- Predictive analytics (likely to abandon next session?)

**Pattern Learning:**
- Auto-detect productive hours
- Learn environmental preferences
- Suggest optimal session lengths
- Identify blockers and distractions

**Daily Briefings:**
- Morning: "Based on your calendar, here's the plan"
- Evening: "You said X was critical. Let's review."
- Weekly: "Last week vs this week - insights"

---

## FEATURE 3: Multi-Profile System

### Use Cases
- Work vs Personal projects
- Different clients/projects
- Team members sharing device
- Testing/experimentation

### Architecture

#### Profile Structure
```typescript
interface Profile {
  id: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  lastActive: Date;
  
  // Isolated data per profile
  trainingData: TrainingProfile;
  analytics: AnalyticsData;
  presets: TimerPreset[];
  config: AppConfig;
  aiConfig: AIConfig;
  ragDocuments: Document[];
  conversationHistory: Message[];
  
  // Shared across profiles (optional)
  sharedMusicLibrary?: boolean;
  sharedSpotify?: boolean;
}
```

#### Storage Strategy
```
Old: localStorage['zenner-training-profile']
New: localStorage['zenner-profile-{id}']

Structure:
- zenner-active-profile: "profile-123"
- zenner-profile-work: { ...data }
- zenner-profile-personal: { ...data }
- zenner-profiles-list: [{ id, name, avatar }]
```

#### UI Components

**ProfileSwitcher:**
- Dropdown in sidebar
- Quick switch between profiles
- Shows current profile avatar/name

**ProfileManager (Settings):**
```
Profiles Tab:
- List all profiles
- Create new profile
- Edit profile (name, avatar)
- Delete profile (with confirmation)
- Duplicate profile (copy settings)
- Import/Export profile
```

**Profile Creation Modal:**
```
- Name input
- Avatar picker (emoji or upload)
- Template selection:
  • Blank
  • Copy from existing profile
  • Import from file
- Purpose (Work/Personal/Project)
```

#### Data Migration
```typescript
Migration Plan:
1. Detect old localStorage data
2. Prompt: "Create profile from existing data?"
3. Create "Default" profile
4. Move all data to profile-default
5. Set as active profile
```

---

## FEATURE 4: Backup & Restore

### Export
```
Profile Export:
- Format: JSON
- Includes all profile data
- Encrypted option (password)
- Download as .zenner file
```

### Import
```
Profile Import:
- Drag & drop .zenner file
- Create new profile from import
- Merge with existing profile option
```

### Cloud Sync (Future)
```
- Google Drive integration
- Dropbox sync
- Self-hosted option
- Conflict resolution
```

---

## Implementation Priority

### Phase 1: Foundation (Week 1)
1. ✅ Multi-Profile System
   - Profile switching
   - Profile manager UI
   - Data isolation
   - Migration from old storage

### Phase 2: Spotify Enhancement (Week 1-2)
2. ✅ Spotify Search
   - Search API integration
   - Search UI modal
   - Playlist browsing
   - Quick add functionality

### Phase 3: Zeni Intelligence (Week 2-3)
3. ✅ Enhanced RAG
   - Better embeddings
   - Vector storage
   - Document upload
   - Hybrid search

4. ✅ Long-Term Memory
   - MemoryService implementation
   - SQLite integration
   - Memory consolidation
   - Search interface

5. ✅ Proactive Features
   - Crash detection
   - Pattern recognition
   - Daily briefings
   - Smart interventions

### Phase 4: Advanced AI (Week 3-4)
6. Vision Capabilities
   - Screenshot analysis
   - Distraction detection
   - Screen time insights

7. Backup/Restore
   - Export profiles
   - Import profiles
   - Cloud sync (optional)

---

## Technical Considerations

### Storage Limits
- **localStorage:** ~5-10MB per domain
- **IndexedDB:** Much larger (100s of MB)
- **SQLite:** Unlimited (disk space)

**Migration Strategy:**
- Move large data (RAG, memory) to IndexedDB
- Keep active profile in localStorage
- Use SQLite for analytics/history

### Profile Size Estimates
```
Small Profile: ~1MB
  - Training data
  - Config
  - Small conversation history

Medium Profile: ~5MB
  - + RAG documents
  - + Longer history
  - + Custom presets

Large Profile: ~20MB
  - + Images
  - + Screenshots
  - + Extensive RAG library
```

### Performance
- Lazy load profile data
- Cache active profile
- Background sync for cloud
- Compress exports

---

## UI/UX Flow

### Profile Switching
```
Sidebar → Profile Avatar → Dropdown
  - Work Profile (active) ✓
  - Personal Profile
  - Project X
  ---
  + Create New Profile
  ⚙️ Manage Profiles
```

### First-Time Setup
```
1. Welcome → "Let's create your profile"
2. Name + Avatar
3. Import existing data? (if found)
4. Setup AI training (templates)
5. Ready!
```

---

## Starting with Multi-Profile System

**Rationale:** Foundation for everything else
- Clean data architecture
- Enable experimentation
- User flexibility
- Better organization

**deliverables:**
1. ProfileService (CRUD operations)
2. Profile storage structure
3. ProfileSwitcher component
4. ProfileManager settings page
5. Data migration utility

Ready to implement?
