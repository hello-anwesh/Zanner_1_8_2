# Timer Redesign + Metronome Feature
**Date:** January 6, 2026 at 23:00 PM IST

## 🎯 Objectives

1. **Redesign all 5 timer styles** to match clean, modern aesthetic
2. **Add metronome feature** with toggle
3. **Add timer preview** in settings

---

## 📐 Timer Style Redesigns

### 1. 3D Timer → **Clean Ring**
**Current:** Heavy 3D HoloTimer with glow  
**New:** Simple flat circle with clean progress ring
- No 3D canvas
- Flat SVG circle
- Subtle border
- Clean typography
- Minimal glow (optional)

### 2. Minimal Timer ✅
**Keep as is** - Already clean
- Large numbers  
- Small status badge

### 3. Circular Timer → **Modern Circle**
**Current:** Has glow effects  
**New:** Clean flat design
- Remove pulse-glow animation
- Remove drop-shadow filter
- Simple progress ring
- Clean center text
- Subtle border

### 4. Analog Timer → **Modern Clock**
**Current:** Clock with markers  
**New:** Cleaner version
- Simplified hour markers
- Thinner lines
- Less visual noise
- Clean center

### 5. Bar Timer → **Sleek Progress**
**Current:** Animated shimmer  
**New:** Clean progress bar
- Remove shimmer animation
- Flat progress bar
- Clean percentage
- Simple status badge

---

## 🎵 Metronome Feature

### Requirements
- Background tick sound
- Plays continuously when timer running
- Works alongside music (doesn't stop music)
- Toggle on/off in timer settings
- BPM configurable (60-180)
- Volume control

### Implementation
```typescript
// New service: src/services/MetronomeService.ts
class MetronomeService {
  private audioContext: AudioContext;
  private isRunning: boolean = false;
  private bpm: number = 60;
  private volume: number = 0.5;
  
  start() { /* ... */ }
  stop() { /* ... */  }
  setBPM(bpm: number) { /* ... */ }
  setVolume(vol: number) { /* ... */ }
}
```

### UI Changes
**Timer Settings (SettingsModal):**
- Add "Metronome" section
- Toggle switch
- BPM slider (60-180)
- Volume slider (0-100%)

---

## 🖼️ Timer Preview

### Location
Settings → Timer section

### Implementation
- Small preview (200x200px) showing current timer style
- Updates when style changes
- Static preview (no animation)
- Shows 25:00 as example time

---

## 📋 Implementation Steps

### Phase 1: Redesign Timers (Now)
1. Update 3D timer to flat ring
2. Clean up circular timer
3. Simplify analog timer
4. Clean bar timer
5. Keep minimal as is

### Phase 2: Metronome Service
1. Create Metronome Service
2. Add config storage
3. Implement audio generation
4. Add controls to settings

### Phase 3: Preview
1. Create TimerPreview component
2. Add to settings
3. Link to timerStyle state

---

## ⏱️ Estimate
- Timer redesign: 30 mins
- Metronome: 45 mins
- Preview: 15 mins
**Total: ~90 mins**

Starting now with timer redesigns...
