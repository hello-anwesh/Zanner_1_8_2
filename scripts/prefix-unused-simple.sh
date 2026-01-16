#!/bin/bash
# Quick TypeScript cleanup - prefix remaining unused vars/params

echo "Prefixing unused variables to suppress TypeScript strict warnings..."

# SettingsModal - X icon
sed -i '' 's/import { X,/import { X as _X,/g' src/components/settings/SettingsModal.tsx

# ZennerCoach - X icon and onMusicSelect param
sed -i '' 's/import { Brain, Sparkles, MessageSquare, Zap, Target, TrendingUp, Users, X,/import { Brain, Sparkles, MessageSquare, Zap, Target, TrendingUp, Users, X as _X,/g' src/components/ZennerCoach.tsx
sed -i '' 's/onMusicSelect: (url: string, name: string) => void;/_onMusicSelect: (url: string, name: string) => void;/g' src/components/ZennerCoach.tsx
sed -i '' 's/}: ZennerCoachProps) {/}: ZennerCoachProps) {/g' src/components/ZennerCoach.tsx

# JournalView - promptsVisible
sed -i '' 's/const \[promptsVisible,/const [_promptsVisible,/g' src/components/JournalView.tsx

# SpotifySettingsView - spotifyState
sed -i '' 's/const \[spotifyState,/const [_spotifyState,/g' src/components/SpotifySettingsView.tsx

# App.tsx - currentDuration and radius (may be for future calcs)
sed -i '' 's/const currentDuration =/const _currentDuration =/g' src/App.tsx
sed -i '' 's/const radius =/const _radius =/g' src/App.tsx

echo "✓ Simple prefixes done"
echo "Run: npx tsc --noEmit to verify"
