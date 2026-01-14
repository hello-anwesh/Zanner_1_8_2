import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
import {
  Play, Pause, Sparkles,
  Target,
  Home, BarChart2, Settings2, ChevronLeft,
  Send, X, TrendingUp, Flame, Lightbulb, Heart, Dumbbell,
  Music, Edit2, Palette
} from "lucide-react";
import { useTheme } from "./contexts/ThemeContext";
import PremiumSidebar from "./components/PremiumSidebar";
import { SettingsModal } from "./components/settings";
import { FloatingPlayer } from "./components/FloatingPlayer";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { HoloTimer } from "./components/Cyberpunk/HoloTimer";

import { ParticleSystem, ParallaxBackground, ThreeDTiltContainer } from "./components/PremiumEffects";
import { AITrainingView } from "./components/training/AITrainingView";
import { AIRhythmsView } from "./components/AIRhythmsView";
import { AIIdentityView } from "./components/AIIdentityView";
import { AICognitionView } from "./components/AICognitionView";
import { VoiceSettingsView } from "./components/VoiceSettingsView";
import { SpotifySettingsView } from "./components/SpotifySettingsView";
import { YouTubeSettingsView } from "./components/YouTubeSettingsView";
import { TimerSettingsView } from "./components/TimerSettingsView";
import { eventBus } from "./services";
import { musicController } from "./services/music/MusicController";
import { useAI } from "./hooks/useAI";
import { useVoice } from "./hooks/useVoice";
import { useSpotify } from "./hooks/useSpotify";
import { productivityAI } from "./services/ai/ProductivityAI";
import { TimerPreset } from "./config/presets";
import { presetManager } from "./services/config/PresetManager";
import { PresetEditor } from "./components/settings/PresetEditor";
import { CommandCenter } from "./components/CommandCenter/CommandCenter";
import { FrequencyGenerator } from "./components/frequency";
import { ZennerCoach } from "./components/ZennerCoach";
import { CompactTimer } from "./components/CompactTimer";
import { TitleBar } from "./components/TitleBar";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { SessionHistory } from "./components/SessionHistory";
import { useAnalytics } from "./hooks/useAnalytics";
import { metronomeService } from "./services/MetronomeService";
import { PhilosophyView } from "./components/PhilosophyView";
import { JournalView } from "./components/JournalView";
import { AISettingsView } from "./components/AISettingsView";
import { AIBrainView } from "./components/AIBrainView";
import { PostSessionJournal } from "./components/PostSessionJournal";
import { CommandDashboard } from "./components/CommandDashboard";
import { ProfileView } from "./components/profile/ProfileView";
import { SettingsHub } from "./components/SettingsHub";
import { databaseService } from "./services/db/DatabaseService";
import { migrationService } from "./services/db/MigrationService";
import { accountabilityService } from "./services/accountability/AccountabilityService";
import { useSessionLogger } from "./hooks/useSessionLogger";
import { BackupSettingsView } from "./components/settings/BackupSettingsView";



// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

type View = "home" | "dashboard" | "stats" | "integrations" | "frequencies" | "philosophy" | "journal" | "profile" | "settings" |
  "settings-ai" | "settings-theme" | "settings-spotify" | "settings-youtube" | "settings-timer" | "settings-voice" | "settings-brain" | "settings-backup" |
  "ai-identity" | "ai-cognition" | "ai-rhythms" | "ai-training" |
  "voice-speech" | "voice-tts";
type TimerMode = "focus" | "shortBreak" | "longBreak";
type TimerStyle = "minimal" | "circular" | "analog" | "bar" | "3d";

// Theme system moved to ThemeContext

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")} `;
}

// ============================================================================
// MAIN APP
// ============================================================================

function App() {
  // Theme Context
  const { currentTheme, themeName, setTheme, themes } = useTheme();
  const accent = currentTheme.colors.accent;

  // UI State
  const [view, setView] = useState<View>("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [showCoach, setShowCoach] = useState(false); // Coach starts collapsed

  // Profile state
  const [profile, setProfile] = useState({
    identity: {
      name: "Focus Master",
      role: "Productivity Expert"
    }
  });

  // Post-Session Journal state
  const [showPostSessionJournal, setShowPostSessionJournal] = useState(false);
  const [completedSessionData, setCompletedSessionData] = useState<{
    sessionNumber: number;
    duration: number;
    startTime: Date;
    endTime: Date;
    type: 'focus' | 'break';
  } | null>(null);
  const sessionStartTimeRef = useRef<Date>(new Date());

  // Timer State
  const [showCommandCenter, setShowCommandCenter] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  // Click outside sidebar to collapse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!sidebarCollapsed && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarCollapsed(true);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarCollapsed]);


  // AI Chat State
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const [allPresets, setAllPresets] = useState<TimerPreset[]>(() => {
    const stored = localStorage.getItem("timerPresets");
    const presets = stored ? JSON.parse(stored) : presetManager.getPresets();
    // Check if smart sprint exists, if not add it
    if (!presets.find((p: any) => p.id === "smart-sprint")) {
      const sprint = presetManager.createSprintPreset(5);
      presetManager.savePreset(sprint);
      presets.push(sprint);
    }
    return presets;
  });
  const [activePreset, setActivePreset] = useState<TimerPreset>(allPresets[0]);
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const [showPresetEditor, setShowPresetEditor] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [timerStyle, setTimerStyle] = useState<TimerStyle>('3d');

  const durations = { focus: activePreset.focus, shortBreak: activePreset.shortBreak, longBreak: activePreset.longBreak };
  const [mode, setMode] = useState<TimerMode>("focus");

  const [timeLeft, setTimeLeft] = useState(activePreset.sequence ? activePreset.sequence[0].duration * 60 : durations.focus * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0); // Synced from database via useAnalytics
  const prevSecondsRef = useRef(timeLeft);

  // Sync presets with manager
  useEffect(() => {
    const handleUpdate = () => {
      const updated = presetManager.getPresets();
      setAllPresets(updated);
      // Update active preset if modified
      const current = updated.find(p => p.id === activePreset.id);
      if (current) setActivePreset(current);
    };
    window.addEventListener("presets-updated", handleUpdate);
    return () => window.removeEventListener("presets-updated", handleUpdate);
  }, [activePreset.id]);

  // Handle Window Resizing for Compact Mode
  useEffect(() => {
    const updateWindowSize = async () => {
      try {
        const appWindow = getCurrentWindow();
        if (isCompactMode) {
          // Exact size: 468px content + 12px buffer = 480 width
          // Height: 88px content + 12px buffer = 100
          await appWindow.setSize(new LogicalSize(480, 100));
        } else {
          await appWindow.setSize(new LogicalSize(1200, 800));
          await appWindow.center(); // Optional: Center window when restoring
        }
      } catch (err) {
        console.error("Failed to resize window:", err);
      }
    };
    updateWindowSize();
  }, [isCompactMode]);

  const {
    sessions: historySessions,
    stats,
    historical,
    loading: _analyticsLoading
  } = useAnalytics();

  // Sync sessions count from database on mount
  useEffect(() => {
    if (historySessions && historySessions.length > 0) {
      // Count today's completed focus sessions
      const today = new Date().toISOString().split('T')[0];
      const todayCompleted = historySessions.filter(
        (s: any) => s.start_time?.startsWith(today) && s.status === 'COMPLETED' && s.mode === 'focus'
      ).length;
      if (todayCompleted > 0) {
        setSessions(todayCompleted);
        console.log(`[App] Synced ${todayCompleted} sessions from database`);
      }
    }
  }, [historySessions]);

  // Load metronome config on mount
  useEffect(() => {
    metronomeService.loadConfig();
  }, []);

  // Initialize database and run migration on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize database (creates tables if not exist)
        await databaseService.init();
        console.log('[App] Database initialized');

        // Run migration if not already done
        if (!migrationService.hasMigrated()) {
          console.log('[App] Running data migration...');
          const result = await migrationService.migrate();
          console.log('[App] Migration result:', result);
        } else {
          console.log('[App] Migration already complete');
        }
      } catch (error) {
        console.error('[App] Initialization error:', error);
      }
    };

    initializeApp();
  }, []);

  const [isAILoading, setIsAILoading] = useState(false);

  // Hooks
  useAI();
  useVoice();
  useSessionLogger(); // Logs sessions to SQLite for analytics
  const spotify = useSpotify();

  const currentDuration = durations[mode] * 60;
  const progress = ((currentDuration - timeLeft) / currentDuration) * 100;

  // Work context for AI
  const workContext = {
    currentMode: mode,
    timeLeft: formatTime(timeLeft),
    isRunning,
    sessionsToday: sessions,
    currentTime: new Date().toLocaleTimeString(),
    streak: 7,
  };



  // Custom Preset Keydown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        setShowCommandCenter(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown as any);
    return () => window.removeEventListener("keydown", handleKeyDown as any);
  }, []);

  // Timer Logic
  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    // If specific mode selected, respect sequence if it matches? No, manual switch breaks sequence usually.
    // Or we find the first step in sequence with this mode?
    if (activePreset.sequence) {
      // Find closest step or reset
      const stepIndex = activePreset.sequence.findIndex(s => s.type === newMode);
      if (stepIndex >= 0) {
        setSequenceIndex(stepIndex);
        setTimeLeft(activePreset.sequence[stepIndex].duration * 60);
      } else {
        setTimeLeft(durations[newMode] * 60); // Fallback
      }
    } else {
      setTimeLeft(durations[newMode] * 60);
    }
    setIsRunning(false);
  };



  const toggleTimer = () => {
    const wasRunning = isRunning;
    setIsRunning(!isRunning);
    if (!wasRunning) {
      eventBus.emit({ type: "SESSION_START", mode });
    } else {
      eventBus.emit({ type: "SESSION_PAUSE", mode });
      // Track paused sessions for accountability (only during focus)
      if (mode === "focus") {
        accountabilityService.recordSessionPaused();
      }
    }
  };

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        const newTime = t - 1;
        if (newTime === 60 && prevSecondsRef.current > 60) {
          eventBus.emit({ type: "BREAK_WARNING", minutesLeft: 1 });
        }
        prevSecondsRef.current = newTime;
        return newTime;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Control metronome based on timer state
  useEffect(() => {
    if (isRunning) {
      metronomeService.start();
    } else {
      metronomeService.stop();
    }
  }, [isRunning]);

  // Control music based on timer state (only resume during focus sessions)
  useEffect(() => {
    if (isRunning && mode === "focus") {
      musicController.resume();
    } else if (!isRunning) {
      musicController.pause();
    }
  }, [isRunning, mode]);


  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      eventBus.emit({ type: "SESSION_END", mode });

      // Track session completion and show post-session journal for focus sessions
      if (mode === "focus") {
        setSessions((s: number) => s + 1); // UI counter, DB is logged by useSessionLogger

        // Track in accountability system for discipline scoring
        accountabilityService.recordSessionComplete();

        // Show post-session journal modal
        setCompletedSessionData({
          sessionNumber: sessions + 1,
          duration: durations.focus,
          startTime: sessionStartTimeRef.current,
          endTime: new Date(),
          type: 'focus'
        });
        setShowPostSessionJournal(true);
      }

      // Auto-transition to next mode after 2 seconds

      setTimeout(() => {
        let nextMode: TimerMode = "focus";

        if (activePreset.sequence) {
          // Sequence Logic
          const nextIndex = (sequenceIndex + 1) % activePreset.sequence.length;
          setSequenceIndex(nextIndex);
          const step = activePreset.sequence[nextIndex];
          nextMode = step.type;

          setMode(nextMode);
          setTimeLeft(step.duration * 60);
        } else {
          // Standard Logic
          nextMode = mode === "focus"
            ? (sessions > 0 && (sessions + 1) % 4 === 0 ? "longBreak" : "shortBreak")
            : "focus";

          setMode(nextMode);
          setTimeLeft(durations[nextMode] * 60);
        }

        setIsRunning(true); // Auto-start the next session
        sessionStartTimeRef.current = new Date(); // Track session start
        eventBus.emit({ type: "SESSION_START", mode: nextMode });
      }, 2000);
    }
  }, [timeLeft, isRunning, mode, sessions, durations, activePreset, sequenceIndex]);

  // Quick Actions
  const handleQuickAction = async (action: string) => {
    setIsAILoading(true);
    let response = "";
    try {
      switch (action) {
        case "focus_music": {
          const suggestion = await productivityAI.suggestMusic({ ...workContext, currentMode: "focus" });
          await spotify.playFocusMusic();
          response = `🎵 Playing "${suggestion.playlistName}"\n\n${suggestion.reason} `;
          break;
        }
        case "motivation":
          response = await productivityAI.getMotivationalMessage(workContext);
          break;
        case "break_activity": {
          const activity = await productivityAI.suggestBreakActivity(mode === "longBreak" ? 15 : 5);
          response = `${activity.title} (${activity.duration} min) \n\n${activity.steps.map(s => `• ${s}`).join("\n")} \n\n💡 ${activity.benefits} `;
          break;
        }
        case "sprint_tips":
          response = await productivityAI.getSprintAdvice(workContext);
          break;
      }
      setChatMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setIsAILoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAILoading) return;
    const message = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: message }]);
    setIsAILoading(true);
    try {
      const response = await productivityAI.chat(message, workContext);
      setChatMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Connection error. Check AI settings." }]);
    } finally {
      setIsAILoading(false);
    }
  };

  // Timer circle
  const size = 340;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (progress / 100) * circ;

  const textMuted = "rgba(255,255,255,0.5)";



  const quickActions = [
    { id: "focus_music", icon: Music, label: "Focus Music", color: "#1DB954" },
    { id: "motivation", icon: Heart, label: "Motivate Me", color: "#F43F5E" },
    { id: "break_activity", icon: Dumbbell, label: "Break Activity", color: "#8B5CF6" },
    { id: "sprint_tips", icon: Lightbulb, label: "Sprint Tips", color: "#F59E0B" },
  ];

  const modeLabels = {
    focus: "Deep Focus",
    shortBreak: "Short Break",
    longBreak: "Long Break"
  };

  const colors = { bg: "#050507", text: "#fafafa", textMuted, accent, card: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)" };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: isCompactMode ? "#0a0a0c" : "#050507", color: "#fafafa" }}>
      {!isCompactMode && (
        <>
          <TitleBar />
          {/* Premium Immersive Background */}
          <ParallaxBackground />
          <ParticleSystem accentColor={accent} particleCount={60} mouseInfluence={180} />

          <ThreeDTiltContainer className="flex w-full h-full relative z-10 pointer-events-none *:pointer-events-auto gap-6 p-6 pt-12">

            {/* ========== PREMIUM SIDEBAR ========== */}
            <PremiumSidebar
              collapsed={sidebarCollapsed}
              onCollapsedChange={setSidebarCollapsed}
              view={view}
              onViewChange={(v) => setView(v as any)}
              accent={accent}
              onFrequencyClick={() => setView("frequencies")}
              onCoachOpen={() => setShowCoach(true)}
            />

            {/* ========== MAIN ========== */}
            <main className="flex-1 flex flex-col overflow-hidden relative rounded-3xl border border-white/5 shadow-2xl" style={{ background: "rgba(10,10,12,0.6)" }}>

              {/* Top Bar */}
              <div className="absolute top-6 right-6 z-50 flex gap-3">
                <button
                  onClick={() => setShowThemePicker(!showThemePicker)}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-105 group relative"
                  title="Change Theme"
                >
                  <Palette size={20} className="text-white/60 group-hover:text-white transition-colors" />
                  {showThemePicker && (
                    <div className="absolute right-0 top-full mt-2 p-4 bg-[#1E1E1E] border border-white/10 rounded-xl shadow-2xl z-50 w-64"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Select Theme</p>
                      <div className="grid grid-cols-3 gap-3">
                        {Object.entries(themes).map(([key, t]) => (
                          <button
                            key={key}
                            onClick={() => {
                              setTheme(key as any);
                              setShowThemePicker(false);
                            }}
                            className="flex flex-col items-center gap-2 p-2 rounded-lg transition-all hover:bg-white/5"
                          >
                            <div
                              className="w-full aspect-square rounded-lg border-2 transition-all hover:scale-110"
                              style={{
                                background: t.colors.accent,
                                borderColor: themeName === key ? '#FFF' : 'rgba(255,255,255,0.2)',
                                boxShadow: themeName === key ? `0 0 20px ${t.colors.accent}60` : 'none'
                              }}
                            />
                            <span className="text-[10px] text-white/60 font-medium text-center">{t.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                  {/* HOME - Classic Timer */}
                  {view === "home" && (
                    <div className="min-h-full flex flex-col items-center justify-center p-8 animate-fade-in">
                      {/* Preset & Mode Selection */}
                      <div className="flex flex-col items-center gap-6 mb-16">
                        {/* Preset Picker Button */}
                        <div className="relative flex items-center gap-2">
                          <button
                            onClick={() => setShowPresetPicker(!showPresetPicker)}
                            className="flex-1 flex items-center gap-4 px-6 py-3 rounded-2xl glass transition-all duration-300 hover:scale-[1.02]"
                            style={{ borderColor: activePreset.color + "40" }}
                          >
                            <span className="text-2xl">{activePreset.icon}</span>
                            <div className="text-left">
                              <p className="text-sm font-semibold">{activePreset.name}</p>
                              <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                {activePreset.sequence ? (
                                  activePreset.sequence.map((step, idx) => (
                                    <span
                                      key={idx}
                                      className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide"
                                      style={{
                                        background: step.type === 'focus' ? `${activePreset.color}20` : 'rgba(255,255,255,0.05)',
                                        color: step.type === 'focus' ? activePreset.color : '#999',
                                        border: `1px solid ${step.type === 'focus' ? activePreset.color + '30' : 'rgba(255,255,255,0.1)'}`
                                      }}
                                    >
                                      {step.label || `${step.type === 'focus' ? 'F' : 'B'}${step.duration}m`}
                                    </span>
                                  ))
                                ) : (
                                  <>
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: `${activePreset.color}20`, color: activePreset.color }}>
                                      F{activePreset.focus}m
                                    </span>
                                    <span className="text-[9px] text-white/30">→</span>
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/5 text-white/50">
                                      B{activePreset.shortBreak}m
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <ChevronLeft
                              size={16}
                              className="opacity-50 transition-transform duration-300 ml-auto"
                              style={{ transform: showPresetPicker ? "rotate(90deg)" : "rotate(-90deg)" }}
                            />
                          </button>

                          <button
                            onClick={() => setShowPresetEditor(true)}
                            className="p-3.5 rounded-2xl glass transition-all duration-300 hover:scale-105 hover:bg-white/10"
                            style={{ borderColor: activePreset.color + "40" }}
                            title="Edit Preset"
                          >
                            <Edit2 size={18} className="opacity-70" />
                          </button>

                          {/* Preset Dropdown */}
                          {showPresetPicker && (
                            <div
                              className="absolute top-full left-1/2 -translate-x-1/2 mt-4 p-4 rounded-3xl z-50 animate-fade-in"
                              style={{
                                width: 480,
                                background: "rgba(10,10,15,0.98)",
                                backdropFilter: "blur(40px)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
                              }}
                            >
                              <div className="flex items-center justify-between mb-4 px-2">
                                <h3 className="font-bold">Choose Preset</h3>
                                <button onClick={() => setShowPresetPicker(false)} className="p-2 rounded-lg hover:bg-white/10">
                                  <X size={14} className="opacity-50" />
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                                {allPresets.map(preset => (
                                  <button
                                    key={preset.id}
                                    onClick={() => {
                                      setActivePreset(preset);
                                      // Reset to start of sequence or focus
                                      if (preset.sequence) {
                                        setSequenceIndex(0);
                                        setMode(preset.sequence[0].type);
                                        setTimeLeft(preset.sequence[0].duration * 60);
                                      } else {
                                        setMode("focus");
                                        setTimeLeft(preset.focus * 60);
                                      }
                                      setShowPresetPicker(false);
                                    }}
                                    className={`text - left p - 4 rounded - 2xl transition - all duration - 200 hover: scale - [1.02] ${activePreset.id === preset.id ? "ring-2" : ""} `}
                                    style={{
                                      background: activePreset.id === preset.id ? preset.color + "15" : "rgba(255,255,255,0.03)",
                                      border: `1px solid ${activePreset.id === preset.id ? preset.color + "40" : "rgba(255,255,255,0.06)"} `,
                                      outline: activePreset.id === preset.id ? `2px solid ${preset.color} ` : "none",
                                      outlineOffset: "2px",
                                    }}
                                  >
                                    <div className="flex items-center gap-3 mb-2">
                                      <span className="text-xl">{preset.icon}</span>
                                      <span className="font-semibold text-sm">{preset.name}</span>
                                    </div>
                                    <p className="text-xs opacity-50 mb-2 line-clamp-2">{preset.description}</p>
                                    <div className="flex gap-2">
                                      <span className="text-[10px] px-2 py-1 rounded-full bg-white/5">{preset.focus}m focus</span>
                                      <span className="text-[10px] px-2 py-1 rounded-full bg-white/5">{preset.shortBreak}m break</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                              {/* Active preset tip */}
                              <div className="mt-4 p-4 rounded-xl" style={{ background: activePreset.color + "10", border: `1px solid ${activePreset.color} 20` }}>
                                <p className="text-xs font-medium mb-1" style={{ color: activePreset.color }}>💡 Tip</p>
                                <p className="text-xs opacity-70 leading-relaxed">{activePreset.tip}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Mode Selector - 3 Elegant Theme-Aware Badges */}
                        <div className="flex items-center gap-2 justify-center">
                          {([
                            { id: "focus", label: "Focus", time: durations.focus },
                            { id: "shortBreak", label: "Short", time: durations.shortBreak },
                            { id: "longBreak", label: "Long", time: durations.longBreak },
                          ] as const).map(({ id, label, time }) => (
                            <button
                              key={id}
                              onClick={() => switchMode(id)}
                              className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all"
                              style={{
                                background: mode === id ? `${activePreset.color}20` : 'rgba(255,255,255,0.03)',
                                color: mode === id ? activePreset.color : '#888',
                                border: `1px solid ${mode === id ? activePreset.color + '40' : 'rgba(255,255,255,0.08)'}`,
                                boxShadow: mode === id ? `0 4px 12px ${activePreset.color}30` : 'none'
                              }}
                            >
                              {label} {time}m
                            </button>
                          ))}
                        </div>

                        {/* Timer Display - REDESIGNED CLEAN & MODERN */}
                        {(() => {
                          const size = 360;
                          const stroke = 6;
                          const radius = size / 2 - stroke / 2 - 20;
                          const circ = 2 * Math.PI * radius;
                          const totalSeconds = durations[mode] * 60;
                          const progress = 1 - timeLeft / totalSeconds;
                          const offset = circ * (1 - progress);

                          return (
                            <div className="relative mb-20 w-full flex justify-center">
                              {/* 1. CLEAN RING (formerly 3D) */}
                              {timerStyle === '3d' && (
                                <div className="flex flex-col items-center justify-center py-12 relative">
                                  <svg width={size} height={size} className="-rotate-90">
                                    {/* Background ring */}
                                    <circle
                                      cx={size / 2}
                                      cy={size / 2}
                                      r={radius}
                                      fill="none"
                                      stroke="rgba(255,255,255,0.08)"
                                      strokeWidth={stroke}
                                    />
                                    {/* Progress ring */}
                                    <circle
                                      cx={size / 2}
                                      cy={size / 2}
                                      r={radius}
                                      fill="none"
                                      stroke={accent}
                                      strokeWidth={stroke}
                                      strokeLinecap="round"
                                      strokeDasharray={circ}
                                      strokeDashoffset={offset}
                                      style={{ transition: "stroke-dashoffset 0.5s ease" }}
                                    />
                                    {/* Inner decorative circle */}
                                    <circle
                                      cx={size / 2}
                                      cy={size / 2}
                                      r={radius - 40}
                                      fill="none"
                                      stroke="rgba(255,255,255,0.04)"
                                      strokeWidth={1}
                                    />
                                  </svg>

                                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-8xl font-light tracking-tight text-white tabular-nums">
                                      {formatTime(timeLeft)}
                                    </span>
                                    <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                                      <div className={`w-2 h-2 rounded-full transition-colors ${isRunning ? 'bg-green-400' : 'bg-white/30'}`} />
                                      <span className="text-xs font-medium uppercase tracking-wider text-white/50">
                                        {isRunning ? "Active" : "Paused"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* 2. MINIMAL - Keep clean as is */}
                              {timerStyle === 'minimal' && (
                                <div className="flex flex-col items-center justify-center py-20">
                                  <div className="text-[10rem] font-light tracking-tight tabular-nums text-white">
                                    {formatTime(timeLeft)}
                                  </div>
                                  <div className="mt-8">
                                    <span className={`text-sm font-medium uppercase tracking-wider px-5 py-2.5 rounded-lg ${isRunning ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                                      {isRunning ? "Focus Mode" : "Ready"}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* 3. CIRCULAR - Clean flat version */}
                              {timerStyle === 'circular' && (
                                <div className="relative py-12">
                                  <svg width={size} height={size} className="-rotate-90">
                                    <circle
                                      cx={size / 2}
                                      cy={size / 2}
                                      r={radius}
                                      fill="none"
                                      stroke="rgba(255,255,255,0.08)"
                                      strokeWidth={stroke}
                                    />
                                    <circle
                                      cx={size / 2}
                                      cy={size / 2}
                                      r={radius}
                                      fill="none"
                                      stroke={accent}
                                      strokeWidth={stroke}
                                      strokeLinecap="round"
                                      strokeDasharray={circ}
                                      strokeDashoffset={offset}
                                      style={{ transition: "stroke-dashoffset 0.5s ease" }}
                                    />
                                  </svg>

                                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-8xl font-light tracking-tight text-white tabular-nums">
                                      {formatTime(timeLeft)}
                                    </span>
                                    <div className="mt-4">
                                      <span className="text-sm font-medium uppercase tracking-wider" style={{ color: `${accent}` }}>
                                        {Math.round(progress * 100)}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}


                              {/* 4. ANALOG - Clean modern clock */}
                              {timerStyle === 'analog' && (
                                <div className="relative py-12">
                                  <svg width={size} height={size}>
                                    {/* Clock face */}
                                    <circle
                                      cx={size / 2}
                                      cy={size / 2}
                                      r={radius}
                                      fill="rgba(255,255,255,0.02)"
                                      stroke="rgba(255,255,255,0.08)"
                                      strokeWidth={2}
                                    />

                                    {/* Hour markers - simplified */}
                                    {Array.from({ length: 12 }).map((_, i) => {
                                      const angle = (i * 30 - 90) * (Math.PI / 180);
                                      const x1 = size / 2 + (radius - 12) * Math.cos(angle);
                                      const y1 = size / 2 + (radius - 12) * Math.sin(angle);
                                      const x2 = size / 2 + (radius - 4) * Math.cos(angle);
                                      const y2 = size / 2 + (radius - 4) * Math.sin(angle);
                                      return (
                                        <line
                                          key={i}
                                          x1={x1} y1={y1} x2={x2} y2={y2}
                                          stroke="rgba(255,255,255,0.2)"
                                          strokeWidth={i % 3 === 0 ? 2 : 1}
                                        />
                                      );
                                    })}

                                    {/* Progress arc */}
                                    <circle
                                      cx={size / 2}
                                      cy={size / 2}
                                      r={radius - 10}
                                      fill="none"
                                      stroke={accent}
                                      strokeWidth={3}
                                      strokeLinecap="round"
                                      strokeDasharray={circ}
                                      strokeDashoffset={offset}
                                      className="-rotate-90 origin-center"
                                      style={{ transition: "stroke-dashoffset 0.5s ease", transformOrigin: '50% 50%' }}
                                    />

                                    {/* Clock hand */}
                                    <line
                                      x1={size / 2}
                                      y1={size / 2}
                                      x2={size / 2 + (radius - 50) * Math.cos((progress * 360 - 90) * (Math.PI / 180))}
                                      y2={size / 2 + (radius - 50) * Math.sin((progress * 360 - 90) * (Math.PI / 180))}
                                      stroke={accent}
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      style={{ transition: "all 0.5s ease" }}
                                    />

                                    {/* Center dot */}
                                    <circle cx={size / 2} cy={size / 2} r={4} fill={accent} />
                                  </svg>

                                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-7xl font-light tracking-tight text-white tabular-nums">
                                      {formatTime(timeLeft)}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* 5. BAR - Clean progress bar */}
                              {timerStyle === 'bar' && (
                                <div className="flex flex-col items-center gap-12 py-16">
                                  {/* Time display */}
                                  <div className="text-9xl font-light tracking-tight text-white tabular-nums">
                                    {formatTime(timeLeft)}
                                  </div>

                                  {/* Progress bar */}
                                  <div className="w-full max-w-2xl">
                                    <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                                      <div
                                        className="h-full rounded-full transition-all duration-500 ease-out"
                                        style={{
                                          width: `${progress * 100}%`,
                                          background: accent,
                                        }}
                                      />
                                    </div>

                                    {/* Percentage */}
                                    <div className="mt-4 text-center">
                                      <span className="text-xl font-medium tracking-wide" style={{ color: accent }}>
                                        {Math.round(progress * 100)}%
                                      </span>
                                    </div>
                                  </div>

                                  {/* Status badge */}
                                  <div className={`px-6 py-2.5 rounded-lg text-sm font-medium uppercase tracking-wider ${isRunning ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                                    {isRunning ? "In Progress" : "Paused"}
                                  </div>
                                </div>
                              )}

                            </div>
                          );
                        })()}

                        {/* Controls */}
                        <div className="flex items-center gap-6 mb-28">
                          <button
                            onClick={toggleTimer}
                            className="relative p-12 rounded-[36px] transition-all duration-300 hover:scale-105 active:scale-95"
                            style={{
                              background: `linear-gradient(135deg, ${accent}0%, ${accent}cc 100%)`,
                              boxShadow: `0 12px 40px ${accent}50, inset 0 2px 0 rgba(255, 255, 255, 0.25)`,
                            }}
                          >
                            {isRunning ? <Pause size={36} fill="#000" color="#000" /> : <Play size={36} fill="#000" color="#000" className="ml-1" />}
                          </button>

                          <button
                            onClick={() => {
                              const newState = !metronomeService.getState().enabled;
                              metronomeService.setEnabled(newState);
                              // Force re-render
                              setTimeLeft(prev => prev);
                            }}
                            className={`p-4 rounded-xl transition-all duration-300 hover:scale-105 ${metronomeService.getState().enabled
                              ? 'bg-white/10'
                              : 'hover:bg-white/5'
                              }`}
                            title={metronomeService.getState().enabled ? "Metronome: ON" : "Metronome: OFF"}
                            style={{
                              border: `1px solid ${metronomeService.getState().enabled ? accent : accent + '30'}`,
                              boxShadow: metronomeService.getState().enabled ? `0 0 20px ${accent}40` : 'none'
                            }}
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={metronomeService.getState().enabled ? accent : accent + '80'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 6l-4 14M8 6l4 14M6 12h12" />
                            </svg>
                          </button>

                          <button
                            onClick={() => setIsCompactMode(true)}
                            className="p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:bg-white/5"
                            title="Compact Mode"
                            style={{ border: `1px solid ${accent}30` }}
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <path d="M9 3v18" />
                              <path d="m14 9 3 3-3 3" />
                            </svg>
                          </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12 w-full max-w-5xl px-4">
                          {[
                            { label: "Today", value: sessions, icon: Target, suffix: "sessions" },
                            { label: "Streak", value: 7, icon: Flame, suffix: "days" },
                            { label: "Focus", value: sessions * 25, icon: TrendingUp, suffix: "min" },
                          ].map(({ label, value, icon: Icon, suffix }, i) => (
                            <div
                              key={label}
                              className="card-premium animate-fade-in"
                              style={{ animationDelay: `${i * 0.1} s` }}
                            >
                              <div className="flex items-center gap-5 mb-6">
                                <div className="p-4 rounded-2xl" style={{ background: `${accent}15` }}>
                                  <Icon size={20} style={{ color: accent }} />
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wider opacity-50">{label}</span>
                              </div>
                              <div className="flex items-baseline gap-3">
                                <span className="text-5xl font-bold gradient-text">{value}</span>
                                <span className="text-sm opacity-50">{suffix}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STATS */}
                  {view === "stats" && (
                    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6 space-y-6 animate-fade-in">
                      <div className="max-w-6xl mx-auto space-y-8 pb-12">
                        {/* Header */}
                        <div>
                          <h2 className="text-3xl font-bold tracking-tight mb-2">Analytics</h2>
                          <p className="text-white/60">Analyze your focus patterns and productivity trends</p>
                        </div>

                        <AnalyticsDashboard
                          stats={stats}
                          historical={historical}
                          accent={accent}
                        />

                        <SessionHistory
                          accent={accent}
                          sessions={historySessions as any}
                        />
                      </div>
                    </div>
                  )}



                  {/* PHILOSOPHY / ABOUT */}
                  {view === "philosophy" && (
                    <PhilosophyView accent={accent} />
                  )}

                  {/* DASHBOARD */}
                  {view === "dashboard" && (
                    <CommandDashboard
                      timeLeft={timeLeft}
                      totalSeconds={durations[mode] * 60}
                      isRunning={isRunning}
                      mode={mode}
                      sessions={sessions}
                      onToggleTimer={() => setIsRunning(!isRunning)}
                      onSkip={() => {
                        let nextMode: typeof mode = mode === "focus"
                          ? (sessions > 0 && (sessions + 1) % 4 === 0 ? "longBreak" : "shortBreak")
                          : "focus";
                        setMode(nextMode);
                        setTimeLeft(durations[nextMode] * 60);
                      }}
                      onModeChange={(newMode) => {
                        setMode(newMode);
                        setTimeLeft(durations[newMode] * 60);
                        setIsRunning(false);
                      }}
                      accent={accent}
                      activePreset={activePreset}
                      allPresets={allPresets}
                      onPresetChange={(preset) => {
                        setActivePreset(preset);
                        if ((preset as any).sequence) {
                          setSequenceIndex(0);
                          setMode((preset as any).sequence[0].type);
                          setTimeLeft((preset as any).sequence[0].duration * 60);
                        } else {
                          setMode("focus");
                          setTimeLeft(preset.focus * 60);
                        }
                      }}
                      onNavigate={(v) => setView(v as View)}
                      streakDays={7}
                      aiReady={true}
                      musicPlaying={false}
                    />
                  )}

                  {/* JOURNAL */}
                  {view === "journal" && (
                    <JournalView />
                  )}

                  {/* PROFILE */}
                  {view === "profile" && (
                    <ProfileView accent={accent} />
                  )}

                  {/* SETTINGS HUB */}
                  {view === "settings" && (
                    <SettingsHub
                      accent={accent}
                      onNavigate={(v) => setView(v as View)}
                      currentView={view}
                    />
                  )}

                  {/* SETTINGS - AI */}
                  {view === "settings-ai" && (
                    <AISettingsView accent={accent} onBack={() => setView("settings")} />
                  )}

                  {/* SETTINGS - BRAIN */}
                  {view === "settings-brain" && (
                    <AIBrainView accent={accent} onBack={() => setView("settings")} />
                  )}

                  {/* SETTINGS - THEME */}
                  {view === "settings-theme" && (
                    <div className="page-container animate-fade-in">
                      {/* Back Button */}
                      <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => setView("settings")}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 mb-6 group"
                      >
                        <ChevronLeft size={16} style={{ color: accent }} />
                        <span className="text-sm font-medium text-white/60 group-hover:text-white/90">Back to Settings</span>
                      </motion.button>

                      <div className="card-premium p-5">
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                          <Palette className="text-white/70" size={24} />
                          Choose Your Theme
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {Object.entries(themes).map(([key, themeData]) => (
                            <button
                              key={key}
                              onClick={() => setTheme(key as any)}
                              className={`group p-6 rounded-2xl transition-all duration-300 ${themeName === key ? "ring-2 scale-105" : "hover:scale-102 hover:bg-white/5"
                                }`}
                              style={{
                                background: themeName === key ? `${themeData.colors.accent}20` : "rgba(255,255,255,0.03)",
                                border: themeName === key ? `1px solid ${themeData.colors.accent}50` : "1px solid transparent"
                              }}
                            >
                              <div
                                className="w-16 h-16 rounded-full mx-auto mb-4 transition-transform duration-300 group-hover:scale-110"
                                style={{
                                  background: `linear-gradient(135deg, ${themeData.colors.accent} 0%, ${themeData.colors.accent}cc 100%)`,
                                  boxShadow: themeName === key ? `0 8px 24px ${themeData.colors.accent}50` : `0 4px 12px ${themeData.colors.accent}25`
                                }}
                              />
                              <p className="text-sm font-bold capitalize mb-1">{themeData.name}</p>
                              <p className="text-xs text-white/40">{key}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SETTINGS - SPOTIFY */}
                  {view === "settings-spotify" && <SpotifySettingsView accent={accent} onBack={() => setView("settings")} />}

                  {/* SETTINGS - YOUTUBE */}
                  {view === "settings-youtube" && <YouTubeSettingsView accent={accent} onBack={() => setView("settings")} />}

                  {/* SETTINGS - TIMER */}
                  {view === "settings-timer" && (
                    <TimerSettingsView
                      accent={accent}
                      activePreset={activePreset}
                      timerStyle={timerStyle}
                      onTimerStyleChange={(s) => setTimerStyle(s as any)}
                      onBack={() => setView("settings")}
                    />
                  )}

                  {/* SETTINGS - VOICE */}
                  {view === "settings-voice" && <VoiceSettingsView accent={accent} onBack={() => setView("settings")} />}

                  {/* SETTINGS - BACKUP */}
                  {view === "settings-backup" && <BackupSettingsView accent={accent} />}

                  {/* FREQUENCIES */}
                  {view === "frequencies" && <FrequencyGenerator isOpen={true} accent={accent} />}

                  {/* AI TRAINING */}
                  {view === "ai-training" && <AITrainingView accent={accent} onClose={() => setView('home')} />}

                  {/* AI - IDENTITY */}
                  {view === "ai-identity" && <AIIdentityView accent={accent} />}

                  {/* AI - COGNITION */}
                  {view === "ai-cognition" && <AICognitionView accent={accent} />}

                  {/* AI - RHYTHMS */}
                  {view === "ai-rhythms" && <AIRhythmsView accent={accent} />}


                </div>

                {/* AI CHAT PANEL - PREMIUM REDESIGN */}
                {
                  showAIChat && (
                    <div
                      className="w-[420px] flex flex-col shrink-0 animate-slide-in-right relative overflow-hidden"
                      style={{
                        background: "linear-gradient(160deg, rgba(12,12,18,0.95) 0%, rgba(8,8,12,0.98) 100%)",
                        backdropFilter: "blur(60px) saturate(150%)",
                        borderLeft: `1px solid rgba(255, 255, 255, 0.08)`,
                        boxShadow: `- 8px 0 40px rgba(0, 0, 0, 0.5), inset 0 0 60px rgba(${parseInt(accent.slice(1, 3), 16)}, ${parseInt(accent.slice(3, 5), 16)}, ${parseInt(accent.slice(5, 7), 16)}, 0.03)`
                      }}
                    >
                      {/* Ambient Background Effect */}
                      <div className="absolute inset-0 opacity-30 pointer-events-none">
                        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px]" style={{ background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)` }} />
                        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-[100px]" style={{ background: `radial-gradient(circle, ${accent}10 0%, transparent 70%)` }} />
                      </div>

                      {/* Header */}
                      <div className="relative p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className="p-4 rounded-2xl relative overflow-hidden group"
                              style={{
                                background: `linear-gradient(135deg, ${accent}0%, ${accent}CC 100%)`,
                                boxShadow: `0 8px 32px ${accent}40, inset 0 1px 0 rgba(255, 255, 255, 0.3)`
                              }}
                            >
                              <div className="absolute inset-0 bg-white/20 blur-xl group-hover:blur-2xl transition-all" />
                              <Sparkles size={22} color="#000" strokeWidth={2.5} className="relative z-10" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg tracking-tight">AI Coach</h3>
                              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Productivity Assistant</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowAIChat(false)}
                            className="p-2.5 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                          >
                            <X size={18} style={{ color: "rgba(255,255,255,0.5)" }} />
                          </button>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="relative p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>Quick Actions</p>

                        {/* Mode Switcher - Premium Pills */}
                        <div
                          className="flex p-1.5 rounded-2xl mb-5 relative overflow-hidden"
                          style={{
                            background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                            backdropFilter: "blur(20px)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.3)"
                          }}
                        >
                          {(["focus", "shortBreak", "longBreak"] as const).map(m => (
                            <button
                              key={m}
                              onClick={() => switchMode(m)}
                              className={`relative flex - 1 px - 5 py - 3 rounded - xl text - [13px] font - semibold transition - all duration - 500 tracking - tight ${mode === m ? "text-black shadow-2xl" : "text-white/40 hover:text-white/70"
                                } `}
                              style={mode === m ? {
                                background: `linear-gradient(135deg, ${accent}0%, ${accent}E6 100%)`,
                                boxShadow: `0 4px 24px ${accent}50, 0 2px 8px ${accent}40, inset 0 1px 0 rgba(255, 255, 255, 0.4)`,
                                transform: "scale(1.02)"
                              } : {}}
                            >
                              <span className="relative z-10">{modeLabels[m]}</span>
                              {mode === m && (
                                <>
                                  <div className="absolute inset-0 bg-white/10 blur-sm rounded-xl" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-xl" />
                                </>
                              )}
                            </button>
                          ))}
                        </div>

                        {/* Action Buttons Grid - Glassmorphic Cards */}
                        <div className="grid grid-cols-2 gap-2.5">
                          {quickActions.map(({ id, icon: Icon, label, color }) => (
                            <button
                              key={id}
                              onClick={() => handleQuickAction(id)}
                              disabled={isAILoading}
                              className="group relative flex items-center gap-3 p-4 rounded-2xl text-sm font-medium transition-all duration-500 hover:scale-[1.03] active:scale-98 disabled:opacity-40 disabled:hover:scale-100 overflow-hidden"
                              style={{
                                background: `linear-gradient(135deg, ${color}12 0%, ${color}08 100%)`,
                                border: `1px solid ${color} 20`,
                                boxShadow: `0 2px 12px ${color}08, inset 0 1px 0 ${color} 15`
                              }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              <div
                                className="p-2 rounded-lg relative z-10 transition-transform duration-500 group-hover:rotate-12"
                                style={{ background: `${color} 20` }}
                              >
                                <Icon size={16} style={{ color }} strokeWidth={2.5} />
                              </div>
                              <span className="relative z-10 text-[13px] font-semibold tracking-tight">{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar relative">
                        {chatMessages.length === 0 && (
                          <div className="text-center py-16 animate-fade-in">
                            <div
                              className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center relative overflow-hidden group"
                              style={{
                                background: `linear-gradient(135deg, ${accent}20 0%, ${accent}10 100%)`,
                                boxShadow: `0 8px 32px ${accent}20, inset 0 1px 0 ${accent}30`
                              }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                              <Sparkles size={36} style={{ color: accent }} strokeWidth={2} className="relative z-10 group-hover:rotate-12 transition-transform duration-700" />
                            </div>
                            <p className="font-bold text-lg mb-2 tracking-tight">I'm your AI productivity coach!</p>
                            <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
                              Use the quick actions above or ask me anything to boost your productivity.
                            </p>
                          </div>
                        )}
                        {chatMessages.map((msg, i) => (
                          <div
                            key={i}
                            className={`p - 5 rounded - 3xl text - [13px] leading - relaxed whitespace - pre - wrap animate - fade -in relative overflow - hidden ${msg.role === "user" ? "ml-12" : "mr-12"
                              } `}
                            style={
                              msg.role === "user"
                                ? {
                                  background: `linear-gradient(135deg, ${accent}0%, ${accent}F2 100%)`,
                                  color: "#000",
                                  boxShadow: `0 8px 32px ${accent}35, 0 4px 16px ${accent}25, inset 0 1px 0 rgba(255, 255, 255, 0.5)`,
                                  fontWeight: 500
                                }
                                : {
                                  background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)",
                                  color: "#fff",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  backdropFilter: "blur(20px)",
                                  boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)"
                                }
                            }
                          >
                            {msg.role === "user" && <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />}
                            <span className="relative z-10">{msg.content}</span>
                          </div>
                        ))}
                        {isAILoading && (
                          <div
                            className="p-5 rounded-3xl border mr-12 animate-fade-in relative overflow-hidden"
                            style={{
                              background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                              borderColor: "rgba(255,255,255,0.1)",
                              backdropFilter: "blur(20px)",
                              boxShadow: "0 4px 16px rgba(0,0,0,0.2)"
                            }}
                          >
                            <div className="flex items-center gap-3 relative z-10">
                              <div className="flex gap-2">
                                {[1, 2, 3].map(i => (
                                  <div
                                    key={i}
                                    className="w-2 h-2 rounded-full animate-bounce-subtle"
                                    style={{ background: accent, animationDelay: `${i * 0.15} s`, boxShadow: `0 0 8px ${accent} ` }}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>Thinking...</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Input - Premium Glassmorphic */}
                      <form onSubmit={handleChatSubmit} className="relative p-6 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        <div
                          className="flex items-center gap-3 p-2 rounded-2xl relative overflow-hidden"
                          style={{
                            background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                            backdropFilter: "blur(20px)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)"
                          }}
                        >
                          <input
                            type="text"
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            placeholder="Ask your AI coach..."
                            className="flex-1 bg-transparent text-[13px] outline-none px-4 py-3.5 font-medium placeholder:text-white/30"
                            disabled={isAILoading}
                            style={{ color: "#fff" }}
                          />
                          <button
                            type="submit"
                            disabled={isAILoading || !chatInput.trim()}
                            className="p-4 rounded-xl transition-all duration-500 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 relative overflow-hidden group"
                            style={chatInput.trim() ? {
                              background: `linear-gradient(135deg, ${accent}0%, ${accent}F2 100%)`,
                              boxShadow: `0 6px 24px ${accent}50, 0 3px 12px ${accent}35, inset 0 1px 0 rgba(255, 255, 255, 0.4)`
                            } : {
                              background: "rgba(255,255,255,0.04)"
                            }}
                          >
                            {chatInput.trim() && <div className="absolute inset-0 bg-white/20 blur-lg group-hover:blur-xl transition-all" />}
                            <Send size={16} style={{ color: chatInput.trim() ? "#000" : "rgba(255,255,255,0.3)" }} strokeWidth={2.5} className="relative z-10" />
                          </button>
                        </div>
                      </form>
                    </div>
                  )
                }
              </div >
            </main >

          </ThreeDTiltContainer >
          <SettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            accent={accent}
            theme={themeName}
            themes={themes}
            onThemeChange={(t) => setTheme(t as any)}
          />
          {showTraining && <AITrainingView onClose={() => setShowTraining(false)} accent={accent} />}
          {
            showPresetEditor && (
              <PresetEditor
                preset={activePreset}
                onClose={() => setShowPresetEditor(false)}
                onSave={(updated) => {
                  setActivePreset(updated);
                  // logic to reset timer if current preset edited?
                  // For now just update params, keeping current timer running if possible, or reset.
                  // Resetting is safer.
                  if (updated.sequence) {
                    setSequenceIndex(0);
                    setMode(updated.sequence[0].type);
                    setTimeLeft(updated.sequence[0].duration * 60);
                  } else {
                    setTimeLeft(updated.focus * 60); // Assuming in focus, or recalculate based on current mode
                    setMode("focus");
                  }
                  setIsRunning(false);
                }}
                colors={colors}
              />
            )
          }
          <CommandCenter
            isOpen={showCommandCenter}
            onClose={() => setShowCommandCenter(false)}
            accent={accent}
          />

          {/* Zenner Coach */}
          {
            showCoach && (
              <ZennerCoach
                accent={accent}
                sessionsToday={sessions}
                isRunning={isRunning}
                timeLeft={formatTime(timeLeft)}
                onClose={() => setShowCoach(false)}
                onMusicSelect={(trackUrl, trackName) => {
                  // trigger playback via EventBus
                  eventBus.emit({ type: "PLAY_TRACK", url: trackUrl, name: trackName });
                }}
              />
            )
          }
        </>
      )
      }

      {/* Compact Timer */}
      {
        isCompactMode && (
          <CompactTimer
            timeLeft={timeLeft}
            isRunning={isRunning}
            mode={mode}
            accent={colors.accent}
            sessions={sessions}
            onToggleTimer={() => setIsRunning(!isRunning)}
            onExpand={() => {
              setIsCompactMode(false);
              setView('home');
            }}
            onClose={() => setIsCompactMode(false)}
          />
        )
      }

      {/* Post-Session Journal Modal */}
      {
        completedSessionData && (
          <PostSessionJournal
            isOpen={showPostSessionJournal}
            onClose={() => {
              setShowPostSessionJournal(false);
              setCompletedSessionData(null);
            }}
            sessionData={completedSessionData}
          />
        )
      }

      {/* FloatingPlayer - Always mounted to preserve audio state */}
      <div style={{ display: isCompactMode ? 'none' : 'block' }}>
        <FloatingPlayer colors={colors} />
      </div>
    </div >
  );
}

export default App;
