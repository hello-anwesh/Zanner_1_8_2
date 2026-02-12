# Zenner Changelog

All notable changes to Zenner are documented here.

---

## [1.8.4] - January 19, 2026

### Fixed
- **Critical:** Timer no longer pauses when transitioning between Focus and Break sessions
- **Audio Sync:** Spotify and Sound Library now properly pause each other (mutual exclusion)
- Fixed stale state issue causing timer to stop unexpectedly

### Improved
- Floating Player only syncs with Spotify when Spotify tab is open (reduces background polling)
- Cleaner audio handoff between different sources

---

## [1.8.3] - January 18, 2026

### Fixed
- Timer transition bug where break wouldn't auto-start after focus session
- Floating Player UI sync issues with external Spotify changes

### Changed
- Reduced Spotify polling frequency when not actively viewing controls

---

## [1.8.2] - January 18, 2026

### Added
- GitHub Actions workflow for automated Mac + Windows builds
- Production build pipeline with CI/CD

### Fixed
- Removed 150+ lines of unused TypeScript code
- Fixed all TypeScript strict mode warnings
- Cleaned up unused imports across 4 files

### Changed
- Version bump for production release
- Updated build documentation

---

## [1.8.1] - January 15, 2026

### Fixed
- Session count displaying "0 sessions" despite completed sessions in database
- Timer accuracy when app window is minimized or hidden
- Database migration edge cases for legacy localStorage data

### Improved
- Timer now uses absolute timestamps (immune to system throttling)
- Better session persistence across app restarts

---

## [1.8.0] - January 12, 2026

### Added
- **Zeni AI Coach** - Your personal productivity companion
  - Context-aware responses based on your session history
  - Motivational messages tailored to your work patterns
  - Break activity suggestions
- **Memory System** - Zeni remembers your preferences and habits
- **AI Training View** - Customize Zeni's personality and responses

### Changed
- Complete AI architecture overhaul
- New coach interface with chat-style interactions
- Improved prompt engineering for better responses

---

## [1.7.0] - January 5, 2026

### Added
- **Sound Library** - Curated focus sounds
  - Nature sounds (rain, forest, ocean)
  - Ambient music collections
  - ASMR for neurodivergent focus
  - Archive.org direct streaming
- **Frequency Generator** - Binaural beats and isochronic tones
  - Preset mixes (Deep Focus, Calm Mind, Energy Boost)
  - Custom frequency mixer
- **Floating Player** - Draggable mini music player

### Changed
- Redesigned bottom bar with quick music access
- Improved audio quality for direct streams

---

## [1.6.0] - December 28, 2025

### Added
- **Spotify Integration** - Control Spotify directly from Zenner
  - Play/pause/skip without leaving the app
  - Focus playlists curated for productivity
  - Volume control
  - Now Playing display
- **YouTube Music** - YouTube audio in background
- **MusicController** - Automatic pause/resume with timer

### Fixed
- Audio continuing during breaks when it shouldn't
- Multiple audio sources playing simultaneously

---

## [1.5.0] - December 20, 2025

### Added
- **Analytics Dashboard**
  - Daily/weekly/monthly focus time charts
  - Session completion rate tracking
  - Streak counter
  - Historical data visualization
- **Journal System** - Post-session reflections
  - Session notes
  - Mood tracking
  - What went well / What to improve

### Changed
- SQLite database for persistent storage (bye localStorage!)
- Data migration from legacy storage

---

## [1.4.0] - December 12, 2025

### Added
- **Custom Timer Presets**
  - Create your own focus/break sequences
  - Import/export presets
  - Preset library with community favorites
- **Pomodoro Strategies**
  - Classic Pomodoro (25/5)
  - Deep Work (50/10)
  - Ultradian (90/20)
  - Custom sequences

### Changed
- Timer settings moved to dedicated view
- Improved preset editor UI

---

## [1.3.0] - December 5, 2025

### Added
- **Voice Announcements**
  - Session start/end notifications
  - Break reminders
  - Customizable voice and speed
- **Metronome Mode** - Rhythmic focus aid
  - Adjustable BPM
  - Multiple sound options

### Fixed
- Notification sounds not playing on macOS
- Voice synthesis initialization delay

---

## [1.2.0] - November 28, 2025

### Added
- **Command Center** (⌘+J)
  - Quick actions palette
  - Keyboard-first navigation
  - AI quick prompts
- **Compact Mode** - Minimal timer view for focus
- **Window Controls** - Custom titlebar with traffic lights

### Changed
- Complete UI overhaul with premium design language
- New sidebar navigation
- Glassmorphism effects throughout

---

## [1.1.0] - November 20, 2025

### Added
- **Theme System**
  - Multiple accent colors
  - Dark mode (default)
  - Particle effects toggle
  - Parallax backgrounds
- **Settings Modal** - Centralized configuration

### Changed
- Improved timer circle animation
- Smoother mode transitions
- Better mobile responsiveness (future-proofing)

---

## [1.0.0] - November 15, 2025

### 🎉 First Stable Release

- **Core Timer**
  - Focus, Short Break, Long Break modes
  - Visual countdown with progress ring
  - Session counter
- **Basic Settings**
  - Adjustable durations
  - Auto-start options
- **Desktop App**
  - Built with Tauri
  - Native macOS experience
  - Lightweight (~10MB)

---

## [0.9.0] - November 10, 2025

### Added
- Tauri integration for desktop build
- Native window management
- System tray support (experimental)
- macOS code signing preparation

### Changed
- Migrated from Electron concept to Tauri
- Reduced bundle size by 90%

---

## [0.8.0] - November 5, 2025

### Added
- Timer persistence across page refreshes
- LocalStorage for settings
- Session history (basic)

### Fixed
- Timer drift after long periods
- Memory leaks in interval handlers

---

## [0.7.0] - October 28, 2025

### Added
- Break modes (short/long)
- Auto-transition between modes
- Session counting logic

### Changed
- Improved timer accuracy
- Better state management with React hooks

---

## [0.6.0] - October 20, 2025

### Added
- Visual timer ring with progress animation
- Play/Pause/Reset controls
- Basic keyboard shortcuts

### Changed
- Redesigned timer display
- Added Framer Motion animations

---

## [0.5.0] - October 12, 2025

### Added
- React + TypeScript foundation
- Vite build system
- TailwindCSS styling
- Basic timer countdown

---

## [0.4.0] - October 5, 2025

### Added
- Initial project setup
- Design mockups
- Architecture planning

---

## [0.3.0] - September 28, 2025

### Added
- Concept validation
- User research
- Feature prioritization

---

## [0.2.0] - September 20, 2025

### Added
- Project ideation
- Competitive analysis
- Name brainstorming (Zenner chosen!)

---

## [0.1.0] - September 15, 2025

### Added
- Initial commit
- README with vision
- MIT License

---

## [0.0.9] - September 10, 2025

### 🌱 Project Genesis
- The idea for Zenner was born
- Goal: Build the ultimate focus timer with AI coaching
- Stack decision: React + Tauri + SQLite

---

*"Focus is the new superpower."* — Zenner Team
