# SIDEBAR EXPANDABLE SECTIONS - IMPLEMENTATION PLAN

## PROBLEM
- Click Settings → Blank screen (because I removed the view but button tries to show it)
- User wants expandable sidebar with sub-items, NOT modals with tabs
- Current sidebar has too many buttons, no nesting

## SOLUTION

### Architecture:
```
Sidebar:
├─ 🏠 Home (view: "home")
├─ 📊 Stats (view: "stats")  
├─ ⚙️ Settings ▼ (expandable)
│   ├─ 🎨 Theme (view: "settings-theme")
│   ├─ 🎵 Spotify (view: "settings-spotify")
│   ├─ ⏱️ Timer (view: "settings-timer")
│   └─ 🎤 Voice (view: "settings-voice")
├─ 🧠 AI Training ▼ (expandable)
│   ├─ 👤 Identity (view: "ai-identity")
│   ├─ 🧩 Cognition (view: "ai-cognition")
│   └─ ⚡ Rhythms (view: "ai-rhythms")
├─ 🎵 Frequencies (modal: showFrequencyGen)
└─ 💬 Command (modal: showCommandCenter)
```

### Views Needed:
```tsx
type View = "home" | "stats" |
  "settings-theme" | "settings-spotify" | "settings-timer" | "settings-voice" |
  "ai-identity" | "ai-cognition" | "ai-rhythms";
```

### State:
```tsx
const [expandedSections, setExpandedSections] = useState({
  settings: false,
  ai: false,
});
```

### Sidebar Component Structure:
```tsx
// Stats button (simple)
<button onClick={() => setView("stats")}>Stats</button>

// Settings (expandable)
<button onClick={() => toggleSection("settings")}>
  Settings {expandedSections.settings ? "▼" : "▶"}
</button>
{expandedSections.settings && (
  <div className="ml-8 space-y-2">
    <button onClick={() => setView("settings-theme")}>Theme</button>
    <button onClick={() => setView("settings-spotify")}>Spotify</button>
    <button onClick={() => setView("settings-timer")}>Timer</button>
    <button onClick={() => setView("settings-voice")}>Voice</button>
  </div>
)}

// AI Training (expandable)
<button onClick={() => toggleSection("ai")}>
  AI Training {expandedSections.ai ? "▼" : "▶"}
</button>
{expandedSections.ai && (
  <div className="ml-8 space-y-2">
    <button onClick={() => setView("ai-identity")}>Identity</button>
    <button onClick={() => setView("ai-cognition")}>Cognition</button>
    <button onClick={() => setView("ai-rhythms")}>Rhythms</button>
  </div>
)}
```

### Content Views Needed:
Each view needs:
1. `settings-theme` - Theme selector (currently in SettingsModal)
2. `settings-spotify` - Spotify controls (was in old settings view)
3. `settings-timer` - Timer duration  settings
4. `settings-voice` - Voice/TTS settings
5. `ai-identity` - From AITrainingView tab 1
6. `ai-cognition` - From AITrainingView tab 2
7. `ai-rhythms` - From AITrainingView tab 3

## QUICK FIX (Immediate)
1. Remove Settings/AI Training modals completely
2. Create view content for each sub-item
3. Update sidebar with expandable sections
4. Remove modal trigger buttons

## FILES TO EDIT
1. App.tsx - Add views for each sub-item
2. App.tsx - Rebuild sidebar with expandable sections  
3. Remove/refactor AITrainingView (no longer modal, content goes in views)
