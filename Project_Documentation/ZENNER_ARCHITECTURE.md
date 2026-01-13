# 🏗️ ZENNER - Complete System Architecture

> **Last Updated:** 2026-01-13  
> **Version:** 1.0  
> **Quick Reference:** Use this document to understand the entire Zenner codebase at a glance.

---

## 📊 VISUAL SYSTEM OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    ZENNER APP                                            │
│                              (Tauri Desktop Application)                                │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                              PRESENTATION LAYER                                    │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │  │
│  │  │  Timer  │ │ Journal │ │  Zeni   │ │Analytics│ │Settings │ │ Music   │        │  │
│  │  │  View   │ │  View   │ │  Coach  │ │Dashboard│ │  Modal  │ │ Player  │        │  │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘        │  │
│  │       │           │           │           │           │           │              │  │
│  │       └───────────┴───────────┴─────┬─────┴───────────┴───────────┘              │  │
│  │                                     │                                             │  │
│  │                              ┌──────▼──────┐                                      │  │
│  │                              │   App.tsx   │ ← Main Application Component        │  │
│  │                              │  (Router)   │                                      │  │
│  │                              └──────┬──────┘                                      │  │
│  └─────────────────────────────────────┼────────────────────────────────────────────┘  │
│                                        │                                               │
│  ┌─────────────────────────────────────┼────────────────────────────────────────────┐  │
│  │                               HOOKS LAYER                                         │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │  │
│  │  │useTimer  │ │useAI     │ │useVoice  │ │useSpotify│ │useSettings│ │useAnalytics│ │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │  │
│  │       │            │            │            │            │            │          │  │
│  └───────┼────────────┼────────────┼────────────┼────────────┼────────────┼──────────┘  │
│          │            │            │            │            │            │             │
│  ┌───────▼────────────▼────────────▼────────────▼────────────▼────────────▼──────────┐  │
│  │                              SERVICES LAYER                                        │  │
│  │                                                                                    │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                          AI / COGNITION                                      │  │  │
│  │  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐               │  │  │
│  │  │  │CoachService│ │AIService   │ │RAGService  │ │MemoryOrch. │               │  │  │
│  │  │  │(Zeni Brain)│ │(LLM Router)│ │(Knowledge) │ │(Context)   │               │  │  │
│  │  │  └──────┬─────┘ └──────┬─────┘ └──────┬─────┘ └──────┬─────┘               │  │  │
│  │  │         │              │              │              │                      │  │  │
│  │  │         │    ┌─────────┴──────────────┴──────────────┘                      │  │  │
│  │  │         │    │                                                              │  │  │
│  │  │         │    ▼  AI Providers:                                               │  │  │
│  │  │         │    ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                   │  │  │
│  │  │         │    │OpenAI  │ │Gemini  │ │Claude  │ │Ollama  │                   │  │  │
│  │  │         │    └────────┘ └────────┘ └────────┘ └────────┘                   │  │  │
│  │  └─────────┼────────────────────────────────────────────────────────────────────┘  │  │
│  │            │                                                                        │  │
│  │  ┌─────────▼───────────────────────────────────────────────────────────────────┐  │  │
│  │  │                          TRAINING / MEMORY                                   │  │  │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │  │  │
│  │  │  │Training     │ │Conversation │ │Cache       │ │MemoryAnalytics│          │  │  │
│  │  │  │Service      │ │Manager      │ │Service     │ │Service      │           │  │  │
│  │  │  │(User Memory)│ │(Chat Hist)  │ │(Perf)      │ │(Stats)      │           │  │  │
│  │  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │  │  │
│  │  └──────────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                                     │  │
│  │  ┌──────────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                          PRODUCTIVITY / TIMER                                 │  │  │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │  │  │
│  │  │  │Preset       │ │Config       │ │Metronome   │ │Accountability│            │  │  │
│  │  │  │Manager      │ │Service      │ │Service     │ │Service      │            │  │  │
│  │  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘            │  │  │
│  │  └──────────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                                     │  │
│  │  ┌──────────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                          MEDIA / INTEGRATIONS                                 │  │  │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │  │  │
│  │  │  │Voice        │ │Spotify      │ │YouTube      │ │Music        │            │  │  │
│  │  │  │Service      │ │Service      │ │Service      │ │Controller   │            │  │  │
│  │  │  │(TTS)        │ │             │ │             │ │             │            │  │  │
│  │  │  └──────┬──────┘ └─────────────┘ └─────────────┘ └─────────────┘            │  │  │
│  │  │         │                                                                     │  │  │
│  │  │         ▼  Voice Providers:                                                   │  │  │
│  │  │    ┌──────────┐ ┌──────────┐ ┌──────────┐                                    │  │  │
│  │  │    │System TTS│ │ElevenLabs│ │Deepgram  │                                    │  │  │
│  │  │    └──────────┘ └──────────┘ └──────────┘                                    │  │  │
│  │  └──────────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                                     │  │
│  │  ┌──────────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                          JOURNAL / PROFILE                                    │  │  │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │  │  │
│  │  │  │Journal      │ │JournalAI    │ │JournalPrompt│ │Profile      │            │  │  │
│  │  │  │Service      │ │Service      │ │Service      │ │Service      │            │  │  │
│  │  │  │(CRUD)       │ │(Reflections)│ │(Prompts)    │ │(User Data)  │            │  │  │
│  │  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘            │  │  │
│  │  └──────────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                                     │  │
│  │  ┌──────────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                          SYNC / EVENTS                                        │  │  │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                             │  │  │
│  │  │  │Sync         │ │Supabase     │ │EventBus     │                             │  │  │
│  │  │  │Service      │ │Adapter      │ │(PubSub)     │                             │  │  │
│  │  │  │(Cloud Sync) │ │             │ │             │                             │  │  │
│  │  │  └─────────────┘ └─────────────┘ └─────────────┘                             │  │  │
│  │  └──────────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────────────────────┘  │
│                                        │                                                  │
│  ┌─────────────────────────────────────▼──────────────────────────────────────────────┐  │
│  │                              DATA LAYER                                             │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────────┐   │  │
│  │  │                          DatabaseService                                     │   │  │
│  │  │                    (SQLite via tauri-plugin-sql)                             │   │  │
│  │  │                                                                               │   │  │
│  │  │    Tables: sessions, users, conversations, messages, memory_items,           │   │  │
│  │  │            experiences, rules, memory_stats, rag_documents,                  │   │  │
│  │  │            training_profile, journal_entries                                 │   │  │
│  │  └─────────────────────────────────────────────────────────────────────────────┘   │  │
│  │                                     +                                               │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────────┐   │  │
│  │  │                          localStorage (WebKit)                               │   │  │
│  │  │    Keys: chronos_ai_training_profile, zenner_sessions, theme,               │   │  │
│  │  │          chronos-settings, floatingPlayerPosition, spotify_*, youtube_*     │   │  │
│  │  └─────────────────────────────────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                          │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│                              TAURI RUST BACKEND                                          │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  src-tauri/                                                                        │  │
│  │  ├── Cargo.toml        (Dependencies: tauri, tauri-plugin-sql, tauri-plugin-opener)│  │
│  │  ├── tauri.conf.json   (App config: window, identifier, capabilities)             │  │
│  │  └── src/                                                                          │  │
│  │      ├── main.rs       (Entry point)                                               │  │
│  │      └── lib.rs        (Tauri app builder, plugins)                                │  │
│  └────────────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 FILE-BY-FILE BREAKDOWN

### **Entry Points**

| File | Purpose | Connects To |
|------|---------|-------------|
| `src/main.tsx` | React entry, renders App | App.tsx |
| `src/App.tsx` | Main router, state management, themes | All views, contexts, services |
| `src-tauri/src/main.rs` | Tauri entry point | lib.rs |
| `src-tauri/src/lib.rs` | Plugin registration, app builder | DatabaseService |

---

### **📱 COMPONENTS (Views)**

| File | Purpose | Uses Services |
|------|---------|---------------|
| **Timer** |||
| `CircularTimer.tsx` | Main circular timer UI | useTimer, MetronomeService |
| `CompactTimer.tsx` | Compact floating timer | useTimer |
| `TimerPreview.tsx` | Timer preset preview | PresetManager |
| **Journal** |||
| `JournalView.tsx` | Journal main view, entries | JournalService, JournalAIService |
| `JournalAnalytics.tsx` | Journal insights/stats | JournalService |
| `PostSessionJournal.tsx` | Post-session journaling | JournalService |
| `journal/JournalContentRenderer.tsx` | Markdown rendering | - |
| `editor/RichTextEditor.tsx` | WYSIWYG editor | - |
| **AI/Zeni** |||
| `ZennerCoach.tsx` | Zeni chat interface | CoachService, TrainingService |
| `AIBrainView.tsx` | AI training dashboard | TrainingService |
| `AICognitionView.tsx` | AI cognition settings | AIService |
| `AIIdentityView.tsx` | User identity config | TrainingService |
| `AIRhythmsView.tsx` | Work rhythm config | TrainingService |
| `AISettingsView.tsx` | AI provider settings | AIService |
| `AIWidget.tsx` | Floating AI widget | CoachService |
| **Training** |||
| `training/AITrainingView.tsx` | Training dashboard | TrainingService |
| `MemoryAnalyticsDashboard.tsx` | Memory stats | MemoryAnalyticsService |
| **Analytics** |||
| `AnalyticsDashboard.tsx` | Focus analytics | DatabaseService (sessions) |
| `SessionHistory.tsx` | Session history list | DatabaseService |
| **Settings** |||
| `SettingsModal.tsx` | Settings modal wrapper | - |
| `settings/SettingsModal.tsx` | Settings sections | ConfigService |
| `SettingsHub.tsx` | Settings hub | - |
| `TimerSettingsView.tsx` | Timer settings | ConfigService |
| `VoiceSettingsView.tsx` | Voice settings | VoiceService |
| `SpotifySettingsView.tsx` | Spotify config | SpotifyService |
| `YouTubeSettingsView.tsx` | YouTube config | YouTubeService |
| **Media** |||
| `FloatingPlayer.tsx` | Sound library player | MusicController |
| `SpotifyPlayer.tsx` | Spotify embed | SpotifyService |
| `MusicPlayer.tsx` | Generic player | - |
| **Frequency** |||
| `frequency/FrequencyGenerator.tsx` | Binaural/isochronic tones | FrequencyEngine |
| `frequency/FrequencyEngine.ts` | Web Audio API engine | - |
| `frequency/frequencies.ts` | Frequency definitions | - |
| **Other** |||
| `PremiumSidebar.tsx` | Main navigation | - |
| `TitleBar.tsx` | Custom window titlebar | - |
| `Onboarding.tsx` | First-run onboarding | TrainingService |
| `PhilosophyView.tsx` | Philosophy content | - |
| `CommandPalette.tsx` | Cmd+K command palette | - |
| `CommandDashboard.tsx` | Command center | CommanderService |
| `profile/ProfileView.tsx` | User profile | ProfileService |
| `SyncSettingsPanel.tsx` | Cloud sync settings | SyncService |
| `IntegrationsHub.tsx` | Third-party integrations | - |
| `ProviderPriorityManager.tsx` | AI provider priority | AIService |

---

### **🎣 HOOKS**

| File | Purpose | Uses |
|------|---------|------|
| `useTimer.ts` | Timer state management | ConfigService, MetronomeService |
| `useAI.ts` | AI interaction hook | AIService, CoachService |
| `useVoice.ts` | Voice/TTS hook | VoiceService |
| `useSpotify.ts` | Spotify state | SpotifyService |
| `useSettings.ts` | App settings (localStorage) | - |
| `useSessionLogger.ts` | Session logging | DatabaseService |
| `useAnalytics.ts` | Analytics data | DatabaseService |

---

### **⚙️ SERVICES**

#### **AI & Cognition**

| File | Purpose | Storage | Status |
|------|---------|---------|--------|
| `ai/AIService.ts` | LLM router, provider management | localStorage | ✅ Active |
| `ai/CoachService.ts` | Zeni personality, prompts | - | ✅ Active |
| `ai/RAGService.ts` | Knowledge retrieval | localStorage (index) | ⚠️ Basic |
| `ai/MemoryOrchestrator.ts` | Context building | - | ✅ Active |
| `ai/ConversationManager.ts` | Chat history | SQLite (conversations) | ⚠️ Not Used |
| `ai/CacheService.ts` | Response caching | Memory | ✅ Active |
| `ai/MemoryAnalyticsService.ts` | Memory stats | - | ✅ Active |
| `ai/MemoryExportService.ts` | Export functionality | - | ⚠️ Partial |
| `ai/ProductivityAI.ts` | Productivity features | - | ⚠️ Partial |

#### **AI Providers**

| File | Purpose | Status |
|------|---------|--------|
| `ai/providers/OpenAIProvider.ts` | OpenAI API | ✅ Active |
| `ai/providers/GeminiProvider.ts` | Google Gemini | ✅ Active |
| `ai/providers/ClaudeProvider.ts` | Anthropic Claude | ✅ Active |
| `ai/providers/OllamaProvider.ts` | Local Ollama | ✅ Active |

#### **Training & Memory**

| File | Purpose | Storage | Status |
|------|---------|---------|--------|
| `training/TrainingService.ts` | User memory/profile | SQLite + localStorage | ✅ Active |
| `training/types.ts` | Type definitions | - | ✅ Active |

#### **Voice**

| File | Purpose | Status |
|------|---------|--------|
| `voice/VoiceService.ts` | TTS orchestrator | ✅ Active |
| `voice/providers/SystemVoiceProvider.ts` | Native TTS | ✅ Active |
| `voice/providers/ElevenLabsProvider.ts` | ElevenLabs API | ✅ Active |
| `voice/providers/DeepgramTTSProvider.ts` | Deepgram TTS | ✅ Active |

#### **Media & Music**

| File | Purpose | Storage | Status |
|------|---------|---------|--------|
| `music/MusicController.ts` | Audio playback control | - | ✅ Active |
| `music/MusicSelectionService.ts` | Music selection | - | ⚠️ Basic |
| `spotify/SpotifyService.ts` | Spotify integration | localStorage | ✅ Active |
| `youtube/YouTubeService.ts` | YouTube integration | localStorage | ✅ Active |

#### **Journal**

| File | Purpose | Storage | Status |
|------|---------|---------|--------|
| `journal/JournalService.ts` | Journal CRUD | SQLite | ✅ Active |
| `journal/JournalAIService.ts` | AI reflections | - | ✅ Active |
| `journal/JournalPromptService.ts` | Writing prompts | - | ✅ Active |

#### **Config & Timer**

| File | Purpose | Storage | Status |
|------|---------|---------|--------|
| `config/ConfigService.ts` | App configuration | localStorage | ✅ Active |
| `config/PresetManager.ts` | Timer presets | localStorage | ✅ Active |
| `MetronomeService.ts` | Audio metronome | - | ✅ Active |
| `accountability/AccountabilityService.ts` | Session accountability | - | ⚠️ Partial |

#### **Database & Storage**

| File | Purpose | Status |
|------|---------|--------|
| `db/DatabaseService.ts` | SQLite operations | ✅ Active |
| `db/MigrationService.ts` | Schema migrations | ⚠️ Not Implemented |
| `db/types.ts` | DB type definitions | ✅ Active |

#### **Sync & Events**

| File | Purpose | Status |
|------|---------|--------|
| `sync/SyncService.ts` | Cloud sync | 🔴 Not Implemented |
| `sync/SupabaseAdapter.ts` | Supabase integration | 🔴 Not Implemented |
| `events/EventBus.ts` | App-wide events | ⚠️ Basic |

#### **STT (Speech-to-Text)**

| File | Purpose | Status |
|------|---------|--------|
| `stt/providers/DeepgramSTTProvider.ts` | Deepgram STT | ⚠️ Partial |
| `stt/providers/WhisperProvider.ts` | Whisper STT | ⚠️ Partial |

---

## 🚨 GAPS & ISSUES

### **Critical**
| Issue | Location | Impact |
|-------|----------|--------|
| ⚠️ localStorage volatility | WebKit storage | Data loss on WebKit path changes |
| ⚠️ No database backups | DatabaseService | Single point of failure |
| ⚠️ Session data not logging | useSessionLogger | Analytics inaccurate |

### **Major**
| Issue | Location | Impact |
|-------|----------|--------|
| 🔴 SyncService not implemented | sync/ | No cloud backup |
| 🔴 MigrationService empty | db/MigrationService.ts | No schema versioning |
| ⚠️ ConversationManager not used | ZennerCoach | Chat not persisted to SQLite |
| ⚠️ RAG uses localStorage | RAGService | Large data in localStorage |

### **Minor**
| Issue | Location | Impact |
|-------|----------|--------|
| ⚠️ Duplicate table creation | JournalService + DatabaseService | Redundant code |
| ⚠️ AccountabilityService incomplete | accountability/ | Partial features |
| ⚠️ STT providers incomplete | stt/providers/ | Voice input limited |

---

## 🚀 ENHANCEMENT OPPORTUNITIES

### **High Priority**

1. **Migrate ALL data to SQLite**
   - Move: `zenner_sessions`, `zenner_chat_history` from localStorage
   - Connect: ZennerCoach → ConversationManager → SQLite

2. **Implement proper MigrationService**
   - Add: Version tracking table
   - Add: Migration scripts for schema changes
   - Add: Rollback capability

3. **Add database backup system**
   - Auto-backup: Daily exports
   - Manual: Export/import functionality
   - Location: User-accessible folder

### **Medium Priority**

4. **Complete SyncService**
   - Add: Supabase integration
   - Add: Conflict resolution
   - Add: Offline queue

5. **Enhance RAGService**
   - Add: Vector embeddings (local)
   - Add: Semantic search
   - Move: Index to SQLite

6. **Session logging fixes**
   - Fix: Real session tracking
   - Add: Interruption logging
   - Add: Context tracking

### **Low Priority**

7. **STT completion**
   - Complete: Deepgram integration
   - Add: Voice commands

8. **AccountabilityService**
   - Add: Session contracts
   - Add: Break enforcement

---

## 📊 DATA FLOW DIAGRAMS

### **Timer Session Flow**
```
User starts session
       │
       ▼
   useTimer.ts
       │
       ├──► MetronomeService (audio)
       │
       ├──► MusicController (background music)
       │
       └──► useSessionLogger ──► DatabaseService
                                      │
                                      ▼
                              sessions table (SQLite)
```

### **AI Chat Flow**
```
User sends message
       │
       ▼
  ZennerCoach.tsx
       │
       ├──► CoachService (personality)
       │         │
       │         ▼
       │    AIService (provider selection)
       │         │
       │         ├──► OpenAIProvider
       │         ├──► GeminiProvider
       │         ├──► ClaudeProvider
       │         └──► OllamaProvider
       │
       ├──► MemoryOrchestrator (context)
       │         │
       │         ├──► TrainingService (user memory)
       │         ├──► RAGService (knowledge)
       │         └──► CacheService (responses)
       │
       └──► localStorage (zenner_sessions) ⚠️ Should be SQLite
```

### **Journal Flow**
```
User writes entry
       │
       ▼
  JournalView.tsx
       │
       ├──► JournalService ──► journal_entries (SQLite) ✅
       │
       ├──► JournalAIService ──► AIService ──► Reflection
       │
       └──► JournalPromptService (prompts)
```

---

## 🔗 SERVICE DEPENDENCY GRAPH

```
                    ┌────────────────────────────────────────────┐
                    │                  App.tsx                    │
                    └─────────────────────┬──────────────────────┘
                                          │
        ┌─────────────────────────────────┼─────────────────────────────────┐
        │                                 │                                  │
        ▼                                 ▼                                  ▼
   ┌──────────┐                    ┌──────────────┐                   ┌──────────┐
   │ useTimer │                    │ ZennerCoach  │                   │useSettings│
   └────┬─────┘                    └──────┬───────┘                   └────┬─────┘
        │                                 │                                 │
        ▼                                 ▼                                 ▼
   ┌──────────────┐              ┌────────────────┐                  ┌──────────┐
   │ConfigService │              │  CoachService  │                  │localStorage│
   └──────┬───────┘              └───────┬────────┘                  └──────────┘
          │                              │
          ▼                              ├─────────────────────┐
   ┌──────────────┐                      │                     │
   │PresetManager │                      ▼                     ▼
   └──────────────┘              ┌──────────────┐      ┌───────────────┐
                                 │  AIService   │      │TrainingService│
                                 └───────┬──────┘      └───────┬───────┘
                                         │                     │
                        ┌────────────────┼────────────────┐    │
                        │                │                │    │
                        ▼                ▼                ▼    ▼
                   ┌────────┐      ┌────────┐       ┌───────────────┐
                   │OpenAI  │      │Gemini  │       │ SQLite +      │
                   │Provider│      │Provider│       │ localStorage  │
                   └────────┘      └────────┘       └───────────────┘
```

---

## ✅ HEALTH STATUS LEGEND

| Status | Meaning |
|--------|---------|
| ✅ Active | Fully implemented and working |
| ⚠️ Basic/Partial | Works but needs enhancement |
| 🔴 Not Implemented | Planned but not built |

---

*This document should be updated whenever significant architectural changes are made.*
