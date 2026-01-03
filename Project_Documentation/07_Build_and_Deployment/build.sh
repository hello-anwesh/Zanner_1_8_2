#!/bin/bash
# build.sh: Script to build the production application

echo "Building NeuroFocus (Tauri App)..."

# 1. Type Check
echo "Running type checks..."
npm run tsc

# 2. Build Frontend
echo "Building frontend..."
npm run build

# 3. Build Tauri Bundle
echo "Bundling Tauri application..."
npm run tauri build

echo "Build complete! Artifacts located in src-tauri/target/release/bundle"
