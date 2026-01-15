# Remaining TypeScript Strict Mode Fixes

## Status: 21/53 done, 32 remaining

### Next batch: X icon removals (6 files)

1. IntegrationsHub.tsx - line 4, col 38
2. Onboarding.tsx - line 3, col 40  
3. ProfileView.tsx - line 10, col 32
4. SettingsModal.tsx - line 2, col 10
5. ZennerCoach.tsx - line 2, col 56

### Then: Component-specific issues
- IntegrationsHub.tsx: accent (line 151), Icon (line 341)
- JournalView.tsx: promptsVisible
- SpotifySettingsView.tsx: spotifyState
- ZennerCoach.tsx: onMusicSelect

### Finally: Incomplete features (prefix with _)
- PremiumSidebar.tsx: 6 variables
- SyncSettingsPanel.tsx: 10 variables
- AITrainingView.tsx: 8 variables (icons + directives + accent params)

Strategy: Fix all X icons, then investigate component issues, then batch prefix incomplete features.
