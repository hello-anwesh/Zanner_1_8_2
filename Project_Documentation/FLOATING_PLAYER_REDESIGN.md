# FloatingPlayer Redesign Plan
**Date:** January 6, 2026 at 23:15 PM IST

## Current Issues
- Heavy glassmorphism effects
- Complex gradients and glows
- Busy styling with multiple overlapping effects
- Not consistent with new flat design

## Redesign Goals
Clean, modern, flat design matching:
- IntegrationsHub aesthetic  
- Timer redesigns
- Proper spacing and breathing room

## Changes to Make

### 1. Trigger Button
**Current:** Gradient background with glow  
**New:** Flat background, simple border

### 2. Mini Player
**Current:** Heavy blur, complex background  
**New:** Simple flat background, clean borders

### 3. Library Panel
**Current:**
- Complex gradient background
- Ambient glow effects
- Heavy blur and saturation
- Busy borders

**New:**
- Flat background (#1E1E1E or similar)
- Simple border
- No glow effects
- Clean spacing

### 4. Player Controls
**Current:** Various gradient buttons  
**New:** Flat buttons with hover states

### 5. Track List
**Current:** Complex hover effects  
**New:** Simple hover with color change

### 6. Categories
**Current:** Gradient pills  
**New:** Flat pills with border

## Implementation
- Remove all `backdrop-filter: blur()` 
- Remove gradient backgrounds
- Remove glow effects (`box-shadow` with colors)
- Simplify borders
- Use flat colors
- Proper padding (24px minimum for cards)

Starting redesign now...
