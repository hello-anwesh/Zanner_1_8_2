# NeuroFocus User Guide

## 1. Installation

### Prerequisites
- Node.js (v18+)
- Rust (latest stable)
- Tauri CLI (`cargo install tauri-cli`)

### Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run tauri dev
   ```

## 2. Configuration
- **AI Keys**: Go to Settings > AI Integrations Hub. Enter your API keys for OpenAI, Claude, or Deepseek.
- **Timer Settings**: Click the "Settings" gear icon to adjust Work, Short Break, and Long Break durations.
- **Theme**: Toggle between "Cyberpunk", "Synthwave", and "Matrix" themes in the Appearance tab.

## 3. Usage Examples

### Starting a Focus Session
1. Set your task in the "Current Task" field.
2. Select a focus frequency (e.g., "432Hz Miracle Tone") from the Binaural Beats panel.
3. Click the large "Start" button.
4. The timer will begin, and your chosen frequency will play.

### Using the AI Coach
1. Click the "AI Coach" button in the HUD.
2. Type a command like "Help me break down this task" or "I'm feeling distracted".
3. The AI will respond with actionable advice or motivational support.

## 4. Troubleshooting
- **No Audio**: Ensure your system volume is up and the integrated volume slider in the Floating Player is not muted. Note that YouTube embeds require system volume control.
- **AI Error**: Check your API key in settings. Ensure you have internet connectivity.
