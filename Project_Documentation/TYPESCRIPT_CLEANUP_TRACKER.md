# TypeScript Strict Mode Cleanup - Remaining Tasks

## Status: 13/53 fixed, 40 remaining

### ✅ Fixed (13):
1. App.tsx - Home, BarChart2, Settings2 icons removed
2. App.tsx - Canvas, Environment, Holo Timer removed  
3. App.tsx - profile/setProfile removed
4. App.tsx - offset removed
5. App.tsx - progress removed (new)
6. App.tsx - circ removed (new)
7. ConversationManager.ts - MAX_SUMMARY_TOKENS removed
8. AIBrainView.tsx - accent param removed
9. AIWidget.tsx - X icon removed

### ⏳ Remaining (40):

**Simple Removals (imports only):**
- CommandCenter/CommandCenter.tsx - X icon (1)
- CommandDashboard.tsx - Play, Pause, SkipForward icons (3)
- RichTextEditor.tsx - useCallback (1)
- IntegrationsHub.tsx - X icon (1)
- Onboarding.tsx - X icon (1)  
- ProfileView.tsx - X icon (1)
- SettingsModal.tsx - X icon (1)
- ZennerCoach.tsx - X icon (1)

**Incomplete Features (keep, prefix with _):**
- SyncSettingsPanel.tsx - All auth state (10) - feature not implemented yet
- AITrainingView.tsx - Save, Zap, Star icons + directive editing (8) - incomplete
- PremiumSidebar.tsx - expandedSections, toggleSection, etc (6) - incomplete
- JournalView.tsx - promptsVisible (1) - incomplete

**Needs Investigation:**
- SpotifySettingsView.tsx - spotifyState (1) - check if should be used
- IntegrationsHub.tsx - accent, Icon (2) - check actual usage  
- AITrainingView.tsx - accent params (3) - check actual usage

## Next Actions:
1. Fix simple import removals (11 files)
2. Investigate "needs investigation" (3 cases)
3. Decide on incomplete features (prefix _ or implement)
