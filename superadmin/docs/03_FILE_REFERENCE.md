# ZENNER ECOSYSTEM - MASTER DOCUMENTATION (Part 4)
## File-by-File Reference & How Everything Connects

---

# 13. FILE-BY-FILE REFERENCE

## Zenner Client (Desktop App)

### Entry Points

| File | Purpose | Size | Imports | Exports |
|------|---------|------|---------|---------|
| `src/main.tsx` | React entry point | 40 lines | React, ReactDOM, App, ThemeProvider | - |
| `src/App.tsx` | Main application component | ~1500 lines | All components, hooks, services | App |
| `src-tauri/src/main.rs` | Tauri entry (generated) | 5 lines | lib | - |
| `src-tauri/src/lib.rs` | Tauri commands, plugins | ~350 lines | tauri, serde | run() |

### Components - Core Views

| File | Purpose | Lines | Key Props | Uses Services |
|------|---------|-------|-----------|---------------|
| `components/ZennerCoach.tsx` | AI chat interface with Zeni | ~900 | accent, isExpanded | CoachService, TrainingService, AIService |
| `components/JournalView.tsx` | Journal main view | ~1200 | accent, onClose | JournalService, JournalAIService |
| `components/JournalAnalytics.tsx` | Journal insights | ~400 | - | JournalService |
| `components/FloatingPlayer.tsx` | Sound library | ~1400 | accent | MusicController, FrequencyEngine |
| `components/AnalyticsDashboard.tsx` | Focus analytics | ~400 | sessions, stats | DatabaseService (via props) |
| `components/CommandDashboard.tsx` | Quick actions panel | ~800 | accent, isExpanded | Multiple services |
| `components/PhilosophyView.tsx` | Philosophy content | ~500 | accent | - |

### Components - Timer

| File | Purpose | Lines | Key Props |
|------|---------|-------|-----------|
| `components/CircularTimer.tsx` | Main circular timer | ~180 | timeLeft, mode, isRunning |
| `components/CompactTimer.tsx` | Compact floating timer | ~200 | timeLeft, mode, isRunning |
| `components/TimerPreview.tsx` | Preset preview card | ~250 | preset, accent |

### Components - Settings

| File | Purpose | Lines | Key Props |
|------|---------|-------|-----------|
| `components/SettingsHub.tsx` | Settings navigation | ~200 | accent, onNavigate |
| `components/SettingsModal.tsx` | Settings modal wrapper | ~600 | isOpen, onClose |
| `components/settings/BackupSettingsView.tsx` | Backup/restore UI | ~280 | accent |
| `components/AISettingsView.tsx` | AI provider config | ~500 | accent |
| `components/TimerSettingsView.tsx` | Timer settings | ~400 | accent, onBack |
| `components/VoiceSettingsView.tsx` | Voice/TTS settings | ~500 | accent, onBack |
| `components/SpotifySettingsView.tsx` | Spotify config | ~600 | accent |
| `components/YouTubeSettingsView.tsx` | YouTube config | ~500 | accent |

### Components - AI Training

| File | Purpose | Lines | Key Props |
|------|---------|-------|-----------|
| `components/training/AITrainingView.tsx` | Training dashboard | ~700 | accent, onClose |
| `components/AIBrainView.tsx` | AI memory view | ~500 | accent |
| `components/AIIdentityView.tsx` | User identity config | ~150 | accent |
| `components/AICognitionView.tsx` | Cognition settings | ~150 | accent |
| `components/AIRhythmsView.tsx` | Work rhythm config | ~350 | accent |
| `components/MemoryAnalyticsDashboard.tsx` | Memory stats | ~450 | - |

### Components - Other

| File | Purpose | Lines |
|------|---------|-------|
| `components/PremiumSidebar.tsx` | Main navigation sidebar | ~500 |
| `components/TitleBar.tsx` | Custom window titlebar | ~80 |
| `components/Onboarding.tsx` | First-run onboarding | ~350 |
| `components/CommandPalette.tsx` | Cmd+K palette | ~400 |
| `components/IntegrationsHub.tsx` | Third-party integrations | ~600 |
| `components/SyncSettingsPanel.tsx` | Cloud sync settings | ~300 |
| `components/PostSessionJournal.tsx` | Post-session journaling | ~400 |
| `components/SpotifyPlayer.tsx` | Spotify embed | ~400 |
| `components/ProviderPriorityManager.tsx` | AI provider priority | ~250 |

### Components - Frequency Generator

| File | Purpose | Lines |
|------|---------|-------|
| `components/frequency/FrequencyGenerator.tsx` | Main frequency UI | ~400 |
| `components/frequency/FrequencyEngine.ts` | Web Audio API | ~300 |
| `components/frequency/frequencies.ts` | Preset definitions | ~200 |
| `components/frequency/FrequencyMixer.tsx` | Mixing controls | ~150 |

---

## Services Layer

### AI Services

| File | Purpose | Storage | Key Methods |
|------|---------|---------|-------------|
| `services/ai/AIService.ts` | LLM router, provider management | localStorage | chat(), getProviders(), setConfig() |
| `services/ai/CoachService.ts` | Zeni personality, context | - | chat(), buildSystemPrompt() |
| `services/ai/RAGService.ts` | Knowledge retrieval | SQLite + localStorage | addDocument(), retrieve() |
| `services/ai/MemoryOrchestrator.ts` | Context building | - | retrieve(), buildContext() |
| `services/ai/ConversationManager.ts` | Chat history | SQLite | addMessage(), getHistory() |
| `services/ai/CacheService.ts` | Response caching | Memory | get(), set() |
| `services/ai/MemoryAnalyticsService.ts` | Memory stats | SQLite | getStats() |
| `services/ai/MemoryExportService.ts` | Export functionality | - | export() |

### AI Providers

| File | Purpose | Key Methods |
|------|---------|-------------|
| `services/ai/providers/OpenAIProvider.ts` | OpenAI API | chat(), stream() |
| `services/ai/providers/GeminiProvider.ts` | Google Gemini | chat(), stream() |
| `services/ai/providers/ClaudeProvider.ts` | Anthropic Claude | chat(), stream() |
| `services/ai/providers/OllamaProvider.ts` | Local Ollama | chat(), stream() |

### Database Services

| File | Purpose | Key Methods |
|------|---------|-------------|
| `services/db/DatabaseService.ts` | SQLite operations | init(), execute(), select() |
| `services/db/BackupService.ts` | Export/import | createBackup(), restoreBackup() |
| `services/db/MigrationService.ts` | Schema migrations | migrate(), hasMigrated() |
| `services/db/types.ts` | Type definitions | - |

### Training Services

| File | Purpose | Storage | Key Methods |
|------|---------|---------|-------------|
| `services/training/TrainingService.ts` | User memory/profile | SQLite + localStorage | getProfile(), updateIdentity() |
| `services/training/types.ts` | Type definitions | - | - |

### Journal Services

| File | Purpose | Storage | Key Methods |
|------|---------|---------|-------------|
| `services/journal/JournalService.ts` | Journal CRUD | SQLite | create(), update(), getAll() |
| `services/journal/JournalAIService.ts` | AI reflections | - | generateReflection() |
| `services/journal/JournalPromptService.ts` | Writing prompts | - | getPrompt() |

### Voice Services

| File | Purpose | Key Methods |
|------|---------|-------------|
| `services/voice/VoiceService.ts` | TTS orchestrator | speak(), stop() |
| `services/voice/providers/SystemVoiceProvider.ts` | Native TTS | speak() |
| `services/voice/providers/ElevenLabsProvider.ts` | ElevenLabs API | speak() |
| `services/voice/providers/DeepgramTTSProvider.ts` | Deepgram TTS | speak() |

### Media Services

| File | Purpose | Storage | Key Methods |
|------|---------|---------|-------------|
| `services/spotify/SpotifyService.ts` | Spotify integration | localStorage | play(), pause(), getState() |
| `services/youtube/YouTubeService.ts` | YouTube integration | localStorage | search(), play() |
| `services/music/MusicController.ts` | Audio playback | - | play(), pause() |
| `services/music/MusicSelectionService.ts` | Music selection | - | selectMusic() |

### Config Services

| File | Purpose | Storage | Key Methods |
|------|---------|---------|-------------|
| `services/config/ConfigService.ts` | App configuration | localStorage | get(), set() |
| `services/config/PresetManager.ts` | Timer presets | localStorage | getPresets(), savePreset() |

### Other Services

| File | Purpose | Key Methods |
|------|---------|-------------|
| `services/MetronomeService.ts` | Audio metronome | configure(), start(), stop() |
| `services/DockService.ts` | macOS dock | setBadge(), bounce() |
| `services/events/EventBus.ts` | App-wide events | emit(), on() |
| `services/accountability/AccountabilityService.ts` | Session tracking | recordSession() |

---

## Hooks

| File | Purpose | Returns | Uses |
|------|---------|---------|------|
| `hooks/useTimer.ts` | Timer state | {timeLeft, isRunning, start, pause} | ConfigService, MetronomeService |
| `hooks/useAnalytics.ts` | Analytics data | {sessions, stats, loading} | DatabaseService |
| `hooks/useSessionLogger.ts` | Session logging | - | DatabaseService, EventBus |
| `hooks/useVoice.ts` | Voice/TTS | {speak, stop} | VoiceService |
| `hooks/useSettings.ts` | App settings | {theme, accent, ...} | localStorage |

---

## Tauri Backend (Rust)

| File | Purpose | Commands |
|------|---------|----------|
| `src-tauri/src/lib.rs` | Main app + commands | greet, run_shell_cmd, set_dock_badge, bounce_dock, spotify_* |
| `src-tauri/Cargo.toml` | Dependencies | tauri, tauri-plugin-sql, serde |
| `src-tauri/tauri.conf.json` | App config | window, identifier, plugins |

### Tauri Commands (Cross-Platform)

| Command | macOS | Windows | Linux |
|---------|-------|---------|-------|
| `spotify_is_running` | AppleScript | Stub (Web API) | DBus MPRIS |
| `spotify_play` | AppleScript | Stub | DBus |
| `spotify_pause` | AppleScript | Stub | DBus |
| `spotify_toggle` | AppleScript | Stub | DBus |
| `spotify_next` | AppleScript | Stub | DBus |
| `spotify_previous` | AppleScript | Stub | DBus |
| `spotify_get_state` | AppleScript | Stub | DBus |
| `bounce_dock` | AppleScript | Stub | Stub |
| `set_dock_badge` | Log only | Log only | Log only |

---

# Connection Diagrams

## How Timer Works

```
User clicks "Start"
        │
        ▼
    App.tsx
        │
        ├──► setIsRunning(true)
        │
        ├──► useEffect triggers interval
        │         │
        │         └──► setTimeLeft(t => t - 1)
        │
        ├──► eventBus.emit({ type: "SESSION_START" })
        │         │
        │         └──► useSessionLogger.ts
        │                   │
        │                   └──► databaseService.createSession()
        │                              │
        │                              └──► INSERT INTO sessions
        │
        └──► CircularTimer.tsx (renders)
                  │
                  └──► Shows timeLeft, mode

When timeLeft === 0:
        │
        ├──► setIsRunning(false)
        │
        ├──► eventBus.emit({ type: "SESSION_END" })
        │         │
        │         └──► useSessionLogger.ts
        │                   │
        │                   └──► databaseService.updateSession()
        │
        ├──► setSessions(s => s + 1) (if focus mode)
        │
        ├──► dockService.onSessionComplete()
        │
        └──► Show PostSessionJournal (optional)
```

## How AI Chat Works

```
User sends message in ZennerCoach.tsx
        │
        ▼
    handleSend()
        │
        ├──► Add message to local state
        │
        ├──► coachService.chat(message, context)
        │         │
        │         ├──► trainingService.getFullSystemContext()
        │         │         │
        │         │         ├──► Get identity
        │         │         ├──► Get rhythms
        │         │         ├──► Get goals
        │         │         └──► Get rules
        │         │
        │         ├──► memoryOrchestrator.buildContext()
        │         │         │
        │         │         ├──► ragService.retrieve(query)
        │         │         └──► Get recent experiences
        │         │
        │         └──► aiService.chat(messages)
        │                   │
        │                   ├──► Select provider (priority order)
        │                   │
        │                   └──► OpenAI/Claude/Gemini/Ollama
        │                              │
        │                              └──► Stream response
        │
        ├──► Update UI with streamed response
        │
        └──► localStorage.setItem('zenner_sessions', ...)
             (⚠️ Should be SQLite via ConversationManager)
```

## How Journal Works

```
User opens JournalView.tsx
        │
        ▼
    useEffect on mount
        │
        └──► journalService.getEntriesByDateRange()
                  │
                  └──► SELECT FROM journal_entries

User writes/saves entry
        │
        ▼
    handleSave()
        │
        ├──► journalService.createOrUpdateEntry()
        │         │
        │         └──► INSERT OR REPLACE INTO journal_entries
        │
        └──► journalAIService.generateReflection() (optional)
                  │
                  └──► AI generates insight
```

## How Settings Persist

```
User changes setting in SettingsModal.tsx
        │
        ▼
    onChange handler
        │
        ├──► localStorage.setItem('chronos-settings', ...)
        │
        └──► State updates (via useState or context)

On app start
        │
        ▼
    App.tsx useEffect
        │
        └──► Read from localStorage
                  │
                  └──► Set initial state
```

## How Backup Works

```
User clicks "Export Backup" in BackupSettingsView.tsx
        │
        ▼
    backupService.createBackup()
        │
        ├──► Gather all data:
        │     ├─ databaseService.getAllSessions()
        │     ├─ journalService.getAllEntries()
        │     ├─ Get conversation_messages from DB
        │     ├─ Get rag_documents from DB
        │     ├─ trainingService.getProfile()
        │     ├─ accountabilityService.getData()
        │     └─ Essential localStorage keys
        │
        ├──► Create JSON blob
        │
        ├──► Create download link
        │
        └──► Trigger browser download

User clicks "Import Backup"
        │
        ▼
    backupService.restoreBackup()
        │
        ├──► Open file picker
        │
        ├──► Parse JSON
        │
        ├──► Validate structure
        │
        ├──► Restore to SQLite tables
        │
        ├──► Restore to localStorage
        │
        └──► Prompt app reload
```

---

# Service Dependencies

```
                                   ┌─────────────────┐
                                   │    App.tsx      │
                                   └────────┬────────┘
                                            │
              ┌─────────────────────────────┼─────────────────────────────┐
              │                             │                             │
              ▼                             ▼                             ▼
       ┌──────────┐                  ┌──────────────┐              ┌──────────┐
       │useTimer  │                  │ZennerCoach   │              │useSettings│
       └────┬─────┘                  └──────┬───────┘              └─────┬────┘
            │                               │                            │
            ▼                               ▼                            ▼
     ┌──────────────┐              ┌────────────────┐             ┌───────────┐
     │MetronomeServ │              │  CoachService  │             │localStorage│
     └──────────────┘              └───────┬────────┘             └───────────┘
                                           │
                         ┌─────────────────┼─────────────────┐
                         │                 │                 │
                         ▼                 ▼                 ▼
                  ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐
                  │TrainingServ  │ │MemoryOrch.   │ │   AIService     │
                  └──────┬───────┘ └──────┬───────┘ └───────┬─────────┘
                         │                │                 │
                         │                ▼                 │
                         │         ┌──────────────┐         │
                         │         │  RAGService  │         │
                         │         └──────┬───────┘         │
                         │                │                 │
                         ▼                ▼                 ▼
                  ┌─────────────────────────────────────────────────┐
                  │                 DatabaseService                  │
                  │                    (SQLite)                      │
                  └─────────────────────────────────────────────────┘
```

---

# localStorage Keys Reference

## Critical (Need Migration to SQLite)

| Key | Service | Size | Data |
|-----|---------|------|------|
| `zenner_sessions` | ZennerCoach | ~60KB | Chat sessions with messages |
| `zenner_rag_index_v1` | RAGService | Variable | Document embeddings |

## Backup (Dual Storage)

| Key | Service | Also In |
|-----|---------|---------|
| `chronos_ai_training_profile` | TrainingService | SQLite: training_profile |

## Settings (OK in localStorage)

| Key | Purpose |
|-----|---------|
| `theme` | UI theme name |
| `chronos-settings` | App settings (durations, notifications) |
| `floatingPlayerPosition` | Player window position |
| `metronome-config` | Metronome BPM, volume |
| `chronos_presets_v2` | Timer presets |
| `chronos_frequency_mixes` | Custom frequency combinations |
| `zenner-onboarding-completed` | Onboarding flag |

## API Keys

| Key | Purpose |
|-----|---------|
| `ai_config` | AI provider settings (keys, models, priority) |
| `spotify_access_token` | OAuth token |
| `spotify_refresh_token` | Refresh token |
| `spotify_client_id` | App credentials |
| `youtube_api_key` | YouTube Data API key |

---

*[Document continues in Part 5 - Development Workflow & Future Roadmap...]*
