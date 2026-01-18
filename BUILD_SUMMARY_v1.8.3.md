# Zenner v1.8.3 - Release Summary

**Build Date:** January 19, 2026  
**Version:** 1.8.3

---

## 🚀 Critical Fixes & Improvements

### 1. ✅ Timer Logic Fixed (Stale Closure Bug)
- **Issue:** Timer would randomly pause or stop when transitioning from Focus to Break.
- **Fix:** Implemented dependency injection in `startTimer` function to bypass stale React state closures.
- **Result:** Timer transitions smoothly between all modes without stopping.

### 2. ✅ Spotify Sync Behavior Improved
- **Issue:** Floating Player was syncing/polling Spotify state even when not being used, causing UI confusion or conflicts.
- **Fix:** Modified `FloatingPlayer.tsx` to ONLY subscribe to Spotify updates when the **Spotify Tab** is actively open.
- **Result:** Minimized player (`FloatingPlayer` bubble) no longer auto-syncs or polls Spotify, keeping it clean for other tasks.

### 3. ✅ Code Optimization
- Removed unused imports and variables across the codebase.
- Improved TypeSafety in build process.

---

## 📦 Build Artifacts

### macOS (Ready Immediately)
- **File:** `Zenner_1.8.3_x64.dmg`
- **Size:** 9.1 MB
- **Location:** `src-tauri/target/release/bundle/dmg/`

### Windows (Ready via GitHub Actions)
- **File:** `Zenner_1.8.3_x64_en-US.msi`
- **How to get:** Push code to GitHub, wait ~10 mins for automated build.

---

## 🛠️ Deploy Instructions

1. **Tag & Push:**
   ```bash
   git tag v1.8.3
   git push origin main --tags
   ```

2. **Wait for Build:**
   - GitHub Actions will build both Mac and Windows versions.
   - Check "Actions" tab on GitHub.

3. **Download:**
   - Go to "Releases" tab on GitHub to download installers.

---

**Release recommended for all users.**
