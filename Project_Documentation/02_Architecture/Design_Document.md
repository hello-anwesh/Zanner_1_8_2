# Design Document: NeuroFocus

## 1. System Overview
NeuroFocus is a cross-platform desktop application designed to enhance productivity through a combination of the Pomodoro technique, AI-driven coaching, and immersive audio-visual elements. It is built using a hybrid architecture leveraging web technologies for the UI and Rust for system-level integration.

## 2. Architectural Components

### 2.1. Frontend Layer
- **Framework**: React 18 with TypeScript.
- **Build Tool**: Vite for rapid development and optimized builds.
- **Styling**: Tailwind CSS with a custom Cyberpunk design system (Neon gradients, glassmorphism).
- **State Management**: React Context API (`ThemeContext`, `TimerContext`) and local state for component-level logic.

### 2.2. Application Shell (Tauri)
- **Core**: Tauri (Rust) provides the lightweight container, system tray integration, and OS-level notifications.
- **Inter-Process Communication (IPC)**: Minimal usage, primarily for window management and system events. Most logic resides in the frontend to ensure portability.

### 2.3. Core Services
- **Timer Service**: Implements the Pomodoro logic (Work/Short Break/Long Break cycles). Handles state transitions and timer ticks.
- **AI Service Hub**: A unified interface for interacting with multiple LLM providers (OpenAI, Claude, Gemini, Ollama).
    - *Input*: User text/voice commands, task context.
    - *Output*: Coaching advice, task breakdown, motivational quotes.
- **Audio Engine**:
    - `FrequencyGenerator`: Uses the Web Audio API to generate real-time binaural beats and isochronic tones. Supports mixing multiple oscillators.
    - `MusicController`: Manages external music sources (Spotify Web Playback SDK) and local audio files (background ambience).

### 2.4. Data Storage
- **Persistence**: `localStorage` is used for user preferences, settings, and task history.
- **Data Models**:
    - `Settings`: User configuration (theme, timer lengths, AI keys).
    - `Task`: Todo items with status.
    - `SessionStats`: Historical record of completed Pomodoros.

## 3. Data Flow
1. **User Interaction**: User clicks "Start".
2. **Frontend Logic**: `useTimer` hook updates state to `RUNNING`.
3. **Audio Trigger**: `FrequencyGenerator` starts playing selected focus frequency (e.g., 432Hz).
4. **Completion**: Timer reaches 0.
5. **Notification**: Tauri API triggers native OS notification.
6. **AI (Optional)**: AI Coach prompts user for a status update or break suggestion.

## 4. External Dependencies
- **Spotify Web API**: For music playback.
- **LLM APIs**: OpenAI/Anthropic/Google/Ollama for AI features.
- **Lucide React**: Iconography.

## 5. Security Considerations
- **API Keys**: Stored in `localStorage`. Recommendation: Move to OS Keychain via Tauri plugin for production.
- **Network Requests**: All AI requests are made directly from the client to the provider APIs. HTTPS is enforced.

## 6. Performance
- **Rendering**: Optimized React rendering to maintain 60fps animations.
- **Audio**: Web Audio API runs in a separate thread context to prevent UI blocking.
