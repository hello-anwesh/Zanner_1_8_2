# Theme Context Integration Plan

## Overview
Convert App.tsx from hardcoded theme values to use the comprehensive ThemeContext.

## Changes Required

### 1. Remove Old Theme System
- ❌ Remove `THEMES` constant (now in ThemeContext)
- ❌ Remove `ThemeKey` type (now in ThemeContext)
- ❌ Remove `theme` state (use context instead)
- ❌ Remove `setTheme` function (use context instead)

### 2. Add Theme Context Import
```tsx
import { useTheme } from './contexts/ThemeContext';
```

### 3. Use Theme Context
```tsx
const { currentTheme, themeName, setTheme, themes } = useTheme();
```

### 4. Replace All Hardcoded Values

#### Colors
- Replace: `accent` → `currentTheme.colors.accent`  
- Replace: Background gradients → `currentTheme.colors.background.main`
- Replace: Card backgrounds → `currentTheme.colors.background.card`
- Replace: Text colors → `currentTheme.colors.text.primary/secondary/muted`
- Replace: Border colors → `currentTheme.colors.border`
- Replace: Glow effects → `currentTheme.colors.glow`

#### Typography
- Add font-family from theme:
  - Headings: `fontFamily: currentTheme.fonts.heading`
  - Body text: `fontFamily: currentTheme.fonts.body`
  - Code/mono: `fontFamily: currentTheme.fonts.mono`

#### Sizing
- Replace hardcoded border-radius → `currentTheme.sizing.borderRadius.*`
- Replace hardcoded spacing → `currentTheme.sizing.spacing.*`

#### Animations
- Replace durations → `currentTheme.animations.duration.*`
- Replace easing → `currentTheme.animations.easing`
- Replace hover effects → `currentTheme.animations.hover.*`

#### Effects
- Replace blur values → `currentTheme.effects.blur`
- Replace shadows → `currentTheme.effects.shadow.*`
- Replace glass effects → `currentTheme.effects.glass.*`

### 5. Update Theme Picker
In the settings-theme view:
- Use `themes` from context (already Object.entries(THEMES))
- Use `themeName` for current selection
- Use `setTheme(key as ThemeName)` for selection

### 6. Apply Theme Fonts Dynamically
Add to root element or body:
```tsx
<div style={{ fontFamily: currentTheme.fonts.body }}>
  {/* app content */}
</div>
```

## Implementation Strategy
Due to the massive number of changes, we'll:
1. First, update the top-level structure (imports, context usage)
2. Create a wrapper component with theme-aware root styles
3. Systematically replace hardcoded values section by section
4. Test each theme to ensure it works correctly

## Expected Result
- ✅ 5 completely distinct visual experiences
- ✅ Each theme affects: colors, fonts, animations, spacing, effects
- ✅ No hardcoded colors anywhere
- ✅ Theme switching is instant and comprehensive
- ✅ localStorage persists theme selection
