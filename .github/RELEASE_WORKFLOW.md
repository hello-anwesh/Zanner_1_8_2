# GitHub Actions Release Workflow

This project uses GitHub Actions to automatically build Zenner for **macOS** and **Windows**.

## 🚀 How to Release

### Method 1: Create a Git Tag (Automatic Release)

```bash
# 1. Commit your changes
git add .
git commit -m "Ready for v1.8.2 release"

# 2. Create a version tag
git tag v1.8.2

# 3. Push to GitHub (including tags)
git push origin main --tags
```

**What happens:**
1. GitHub Actions triggers automatically
2. Builds on **macOS** and **Windows** runners
3. Creates installers:
   - `Zenner_1.8.2_x64.dmg` (macOS)
   - `Zenner_1.8.2_x64_en-US.msi` (Windows)
4. Creates a **GitHub Release** with both files attached
5. Done! 🎉

---

### Method 2: Manual Trigger (No Release)

1. Go to GitHub → **Actions** tab
2. Click **Release Build** workflow
3. Click **Run workflow** button
4. Builds will run and upload artifacts (no release created)

**Use this for:** Testing builds without creating a release

---

## 📦 What Gets Built

### macOS Artifacts
- `Zenner_1.8.2_x64.dmg` - Installer (users download this)
- `Zenner.app` - Raw app bundle

### Windows Artifacts
- `Zenner_1.8.2_x64_en-US.msi` - MSI installer (recommended)
- `Zenner_1.8.2_x64_en-US.exe` - NSIS installer (alternative)

---

## ⏱️ Build Time

- macOS: ~5-7 minutes
- Windows: ~6-8 minutes
- **Total: ~8-10 minutes** (runs in parallel)

---

## 🔧 First-Time GitHub Setup

### 1. Create GitHub Repository

```bash
# On GitHub.com:
# 1. Create new repository: "zenner" or "pomodoro"
# 2. Make it public or private (your choice)
# 3. Don't initialize with README (we have one)
```

### 2. Push Your Code

```bash
# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/zenner.git

# Push main branch
git push -u origin main

# Push all tags
git push --tags
```

### 3. Verify

- Go to GitHub → **Actions** tab
- You should see the workflow running!
- After ~10 minutes, check **Releases** for downloadable files

---

## 🐛 Troubleshooting

### "Workflow file not found"
- Make sure `.github/workflows/release.yml` exists
- Push it to GitHub: `git add .github && git commit -m "Add CI" && git push`

### Build fails on Windows
- Usually a dependency issue
- Check the logs in GitHub Actions
- Common fix: Update `package.json` dependencies

### No artifacts uploaded
- Check the build logs for errors
- TypeScript errors will fail the build
- Make sure all tests pass before pushing

---

## 📝 Version Bumping

Before each release, update version in **3 places**:

1. **package.json**
```json
{
  "version": "1.8.2"
}
```

2. **src-tauri/tauri.conf.json**
```json
{
  "version": "1.8.2"
}
```

3. **Git tag** (when releasing)
```bash
git tag v1.8.2
```

**Tip:** Keep these in sync!

---

## 🎯 Workflow Triggers

This workflow runs when:

1. ✅ You push a git tag starting with `v` (e.g., `v1.8.2`)
2. ✅ You manually trigger it from GitHub Actions tab
3. ❌ Does NOT run on every commit (to save build time)

---

## 🔐 Code Signing (Optional)

For production releases, you should code sign:

### macOS
- Get Apple Developer account ($99/year)
- Create signing certificate
- Add secrets to GitHub:
  - `APPLE_CERTIFICATE`
  - `APPLE_CERTIFICATE_PASSWORD`
  - Update workflow to sign

### Windows
- Get code signing certificate (~$100-400/year)
- Add to workflow
- Users won't see "Unknown Publisher" warning

**For now:** Builds work fine unsigned (users just see a warning)

---

## 📊 Where to Download Builds

### After Workflow Completes:

**Option 1: From Releases** (if tagged)
- Go to: `https://github.com/YOUR_USERNAME/zenner/releases`
- Download the latest release files

**Option 2: From Artifacts** (always available)
- Go to: GitHub → Actions → Select run
- Scroll to **Artifacts** section
- Download individual platform builds

---

## 🎉 Quick Release Checklist

```
☐ Update version in package.json
☐ Update version in src-tauri/tauri.conf.json  
☐ Commit changes: git commit -m "Bump to v1.8.2"
☐ Create tag: git tag v1.8.2
☐ Push: git push origin main --tags
☐ Wait 10 minutes
☐ Download from GitHub Releases
☐ Test on Mac
☐ Test on Windows
☐ Ship! 🚀
```

---

**Questions?** Check the GitHub Actions logs for detailed build output.
