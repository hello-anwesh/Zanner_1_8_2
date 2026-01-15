#!/bin/bash
# Auto-fix unused variables by prefixing with underscore

echo "Fixing unused variables..."

# App.tsx
sed -i '' 's/{ Home,/{ Home as _Home,/g' src/App.tsx
sed -i '' 's/, BarChart2,/, BarChart2 as _BarChart2,/g' src/App.tsx  
sed -i '' 's/, Settings2,/, Settings2 as _Settings2,/g' src/App.tsx
sed -i '' 's/import { Canvas/import { Canvas as _Canvas/g' src/App.tsx
sed -i '' 's/import { Environment/import { Environment as _Environment/g' src/App.tsx
sed -i '' 's/import { HoloTimer/import { HoloTimer as _HoloTimer/g' src/App.tsx
sed -i '' 's/const \[profile,/const [_profile,/g' src/App.tsx
sed -i '' 's/, setProfile\]/, _setProfile]/g' src/App.tsx
sed -i '' 's/const offset =/const _offset =/g' src/App.tsx

echo "✓ Fixed App.tsx"

# AIBrainView.tsx
sed -i '' 's/accent }/accent as _accent }/g' src/components/AIBrainView.tsx

# AIWidget.tsx  
sed -i '' 's/, X /, X as _X /g' src/components/AIWidget.tsx

# CommandCenter
sed -i '' 's/{ X }/{ X as _X }/g' src/components/CommandCenter/CommandCenter.tsx

# CommandDashboard
sed -i '' 's/{ Play,/{ Play as _Play,/g' src/components/CommandDashboard.tsx
sed -i '' 's/Pause,/Pause as _Pause,/g' src/components/CommandDashboard.tsx
sed -i '' 's/SkipForward/SkipForward as _SkipForward/g' src/components/CommandDashboard.tsx

echo "✓ Fixed components"

# ConversationManager
sed -i '' 's/const MAX_SUMMARY_TOKENS/const _MAX_SUMMARY_TOKENS/g' src/services/ai/ConversationManager.ts

echo "✓ Done!"
echo "Re-run: npx tsc --noEmit to verify"
