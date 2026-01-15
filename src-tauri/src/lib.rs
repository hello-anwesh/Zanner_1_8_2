use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Serialize, Deserialize)]
pub struct SpotifyTrack {
    pub name: String,
    pub artist: String,
    pub album: String,
    pub artwork_url: String,
    pub duration: u32,
    pub position: u32,
}

#[derive(Serialize, Deserialize)]
pub struct SpotifyState {
    pub is_running: bool,
    pub is_playing: bool,
    pub volume: u8,
    pub track: Option<SpotifyTrack>,
}

// ═══════════════════════════════════════════════════════════════
// PLATFORM-SPECIFIC APPLESCRIPT (macOS only)
// ═══════════════════════════════════════════════════════════════

#[cfg(target_os = "macos")]
fn run_applescript(script: &str) -> Result<String, String> {
    let output = Command::new("osascript")
        .arg("-e")
        .arg(script)
        .output()
        .map_err(|e| format!("Failed to execute AppleScript: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).trim().to_string())
    }
}

// ═══════════════════════════════════════════════════════════════
// DOCK BADGE & BOUNCE
// ═══════════════════════════════════════════════════════════════

/// Set dock badge label (macOS via AppleScript, others log only)
#[tauri::command]
fn set_dock_badge(label: String) -> Result<(), String> {
    println!(
        "[Dock] Badge set to: {}",
        if label.is_empty() {
            "(cleared)"
        } else {
            &label
        }
    );
    Ok(())
}

/// Clear dock badge
#[tauri::command]
fn clear_dock_badge() -> Result<(), String> {
    println!("[Dock] Badge cleared");
    Ok(())
}

/// Bounce dock icon (macOS only - shows notification on other platforms)
#[tauri::command]
#[cfg(target_os = "macos")]
fn bounce_dock(critical: bool) -> Result<isize, String> {
    let script = if critical {
        r#"
        tell application "System Events"
            set frontApp to name of first process whose frontmost is true
        end tell
        tell application frontApp
            activate
        end tell
        "#
    } else {
        r#"
        display notification "Timer Complete!" with title "Zenner" sound name "Glass"
        "#
    };

    match run_applescript(script) {
        Ok(_) => Ok(1),
        Err(e) => {
            println!("[Dock] Bounce failed: {}", e);
            Ok(0)
        }
    }
}

#[tauri::command]
#[cfg(not(target_os = "macos"))]
fn bounce_dock(_critical: bool) -> Result<isize, String> {
    // On Windows/Linux, just log - notification would be handled in frontend
    println!("[Dock] Bounce requested (not supported on this platform)");
    Ok(0)
}

/// Cancel a dock bounce
#[tauri::command]
fn cancel_dock_bounce(_request_id: isize) -> Result<(), String> {
    Ok(())
}

// ═══════════════════════════════════════════════════════════════
// SHELL COMMAND (cross-platform)
// ═══════════════════════════════════════════════════════════════

#[tauri::command]
fn run_shell_cmd(cmd: String, args: Vec<String>) -> Result<String, String> {
    let output = Command::new(&cmd)
        .args(args)
        .output()
        .map_err(|e| format!("Failed to execute command '{}': {}", cmd, e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        Err(if stderr.is_empty() {
            "Command failed with no stderr".to_string()
        } else {
            stderr
        })
    }
}

// ═══════════════════════════════════════════════════════════════
// SPOTIFY COMMANDS - macOS (AppleScript)
// ═══════════════════════════════════════════════════════════════

#[cfg(target_os = "macos")]
#[tauri::command]
fn spotify_is_running() -> Result<bool, String> {
    let script = r#"
        tell application "System Events"
            set isRunning to (name of processes) contains "Spotify"
        end tell
        return isRunning
    "#;
    let result = run_applescript(script)?;
    Ok(result == "true")
}

#[cfg(target_os = "macos")]
#[tauri::command]
fn spotify_play() -> Result<String, String> {
    run_applescript(r#"tell application "Spotify" to play"#)
}

#[cfg(target_os = "macos")]
#[tauri::command]
fn spotify_pause() -> Result<String, String> {
    run_applescript(r#"tell application "Spotify" to pause"#)
}

#[cfg(target_os = "macos")]
#[tauri::command]
fn spotify_toggle() -> Result<String, String> {
    run_applescript(r#"tell application "Spotify" to playpause"#)
}

#[cfg(target_os = "macos")]
#[tauri::command]
fn spotify_next() -> Result<String, String> {
    run_applescript(r#"tell application "Spotify" to next track"#)
}

#[cfg(target_os = "macos")]
#[tauri::command]
fn spotify_previous() -> Result<String, String> {
    run_applescript(r#"tell application "Spotify" to previous track"#)
}

#[cfg(target_os = "macos")]
#[tauri::command]
fn spotify_set_volume(level: u8) -> Result<String, String> {
    let level_clamped = level.min(100);
    let script = format!(
        r#"tell application "Spotify" to set sound volume to {}"#,
        level_clamped
    );
    run_applescript(&script)
}

#[cfg(target_os = "macos")]
#[tauri::command]
fn spotify_get_volume() -> Result<u8, String> {
    let script = r#"tell application "Spotify" to get sound volume"#;
    let result = run_applescript(script)?;
    result
        .parse::<u8>()
        .map_err(|e| format!("Failed to parse volume: {}", e))
}

#[cfg(target_os = "macos")]
#[tauri::command]
fn spotify_play_uri(uri: String) -> Result<String, String> {
    let script = format!(r#"tell application "Spotify" to play track "{}""#, uri);
    run_applescript(&script)
}

#[cfg(target_os = "macos")]
#[tauri::command]
fn spotify_open() -> Result<String, String> {
    run_applescript(r#"tell application "Spotify" to activate"#)
}

#[cfg(target_os = "macos")]
#[tauri::command]
fn spotify_get_state() -> Result<SpotifyState, String> {
    let is_running = spotify_is_running()?;

    if !is_running {
        return Ok(SpotifyState {
            is_running: false,
            is_playing: false,
            volume: 0,
            track: None,
        });
    }

    let script = r#"
        tell application "Spotify"
            set playerState to player state as string
            set vol to sound volume
            if playerState is not "stopped" then
                set trackName to name of current track
                set trackArtist to artist of current track
                set trackAlbum to album of current track
                try
                    set trackArtwork to artwork url of current track
                on error
                    set trackArtwork to ""
                end try
                set trackDuration to duration of current track
                set trackPosition to player position
                return playerState & "||" & vol & "||" & trackName & "||" & trackArtist & "||" & trackAlbum & "||" & trackArtwork & "||" & trackDuration & "||" & trackPosition
            else
                return playerState & "||" & vol & "||||||0||0"
            end if
        end tell
    "#;

    let result = run_applescript(script)?;
    let parts: Vec<&str> = result.split("||").collect();

    if parts.len() >= 8 {
        let is_playing = parts[0] == "playing";
        let volume = parts[1].parse::<u8>().unwrap_or(50);
        let track_name = parts[2].to_string();
        let track_artist = parts[3].to_string();
        let track_album = parts[4].to_string();
        let artwork_url = parts[5].to_string();
        let duration = parts[6].parse::<u32>().unwrap_or(0);
        let position = parts[7].parse::<u32>().unwrap_or(0);

        let track = if !track_name.is_empty() {
            Some(SpotifyTrack {
                name: track_name,
                artist: track_artist,
                album: track_album,
                artwork_url,
                duration,
                position,
            })
        } else {
            None
        };

        Ok(SpotifyState {
            is_running: true,
            is_playing,
            volume,
            track,
        })
    } else {
        Ok(SpotifyState {
            is_running: true,
            is_playing: false,
            volume: 50,
            track: None,
        })
    }
}

// ═══════════════════════════════════════════════════════════════
// SPOTIFY COMMANDS - Windows (via Spotify Web API - stubs)
// Note: Full implementation would use Spotify Connect API
// ═══════════════════════════════════════════════════════════════

#[cfg(target_os = "windows")]
#[tauri::command]
fn spotify_is_running() -> Result<bool, String> {
    // On Windows, we can't easily detect if Spotify is running
    // Return false and let frontend use Web API
    Ok(false)
}

#[cfg(target_os = "windows")]
#[tauri::command]
fn spotify_play() -> Result<String, String> {
    Err("Use Spotify Web API on Windows".to_string())
}

#[cfg(target_os = "windows")]
#[tauri::command]
fn spotify_pause() -> Result<String, String> {
    Err("Use Spotify Web API on Windows".to_string())
}

#[cfg(target_os = "windows")]
#[tauri::command]
fn spotify_toggle() -> Result<String, String> {
    Err("Use Spotify Web API on Windows".to_string())
}

#[cfg(target_os = "windows")]
#[tauri::command]
fn spotify_next() -> Result<String, String> {
    Err("Use Spotify Web API on Windows".to_string())
}

#[cfg(target_os = "windows")]
#[tauri::command]
fn spotify_previous() -> Result<String, String> {
    Err("Use Spotify Web API on Windows".to_string())
}

#[cfg(target_os = "windows")]
#[tauri::command]
fn spotify_set_volume(_level: u8) -> Result<String, String> {
    Err("Use Spotify Web API on Windows".to_string())
}

#[cfg(target_os = "windows")]
#[tauri::command]
fn spotify_get_volume() -> Result<u8, String> {
    Ok(50) // Default
}

#[cfg(target_os = "windows")]
#[tauri::command]
fn spotify_play_uri(_uri: String) -> Result<String, String> {
    Err("Use Spotify Web API on Windows".to_string())
}

#[cfg(target_os = "windows")]
#[tauri::command]
fn spotify_open() -> Result<String, String> {
    // Try to open Spotify via Windows
    let _ = Command::new("cmd")
        .args(["/C", "start", "spotify:"])
        .output();
    Ok("Attempting to open Spotify".to_string())
}

#[cfg(target_os = "windows")]
#[tauri::command]
fn spotify_get_state() -> Result<SpotifyState, String> {
    Ok(SpotifyState {
        is_running: false,
        is_playing: false,
        volume: 50,
        track: None,
    })
}

// ═══════════════════════════════════════════════════════════════
// SPOTIFY COMMANDS - Linux (via DBus MPRIS)
// ═══════════════════════════════════════════════════════════════

#[cfg(target_os = "linux")]
fn run_dbus_spotify(method: &str) -> Result<String, String> {
    let output = Command::new("dbus-send")
        .args([
            "--print-reply",
            "--dest=org.mpris.MediaPlayer2.spotify",
            "/org/mpris/MediaPlayer2",
            &format!("org.mpris.MediaPlayer2.Player.{}", method),
        ])
        .output()
        .map_err(|e| format!("DBus command failed: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).trim().to_string())
    }
}

#[cfg(target_os = "linux")]
#[tauri::command]
fn spotify_is_running() -> Result<bool, String> {
    let output = Command::new("pgrep")
        .args(["-x", "spotify"])
        .output()
        .map_err(|e| format!("pgrep failed: {}", e))?;
    Ok(output.status.success())
}

#[cfg(target_os = "linux")]
#[tauri::command]
fn spotify_play() -> Result<String, String> {
    run_dbus_spotify("Play")
}

#[cfg(target_os = "linux")]
#[tauri::command]
fn spotify_pause() -> Result<String, String> {
    run_dbus_spotify("Pause")
}

#[cfg(target_os = "linux")]
#[tauri::command]
fn spotify_toggle() -> Result<String, String> {
    run_dbus_spotify("PlayPause")
}

#[cfg(target_os = "linux")]
#[tauri::command]
fn spotify_next() -> Result<String, String> {
    run_dbus_spotify("Next")
}

#[cfg(target_os = "linux")]
#[tauri::command]
fn spotify_previous() -> Result<String, String> {
    run_dbus_spotify("Previous")
}

#[cfg(target_os = "linux")]
#[tauri::command]
fn spotify_set_volume(_level: u8) -> Result<String, String> {
    // MPRIS volume is 0.0-1.0, would need dbus-send with variant
    Err("Volume control via MPRIS not implemented yet".to_string())
}

#[cfg(target_os = "linux")]
#[tauri::command]
fn spotify_get_volume() -> Result<u8, String> {
    Ok(50) // Default - MPRIS metadata retrieval is complex
}

#[cfg(target_os = "linux")]
#[tauri::command]
fn spotify_play_uri(uri: String) -> Result<String, String> {
    // Use xdg-open to open Spotify URI
    Command::new("xdg-open")
        .arg(&uri)
        .output()
        .map_err(|e| format!("Failed to open URI: {}", e))?;
    Ok("Opened URI".to_string())
}

#[cfg(target_os = "linux")]
#[tauri::command]
fn spotify_open() -> Result<String, String> {
    Command::new("spotify")
        .spawn()
        .map_err(|e| format!("Failed to open Spotify: {}", e))?;
    Ok("Opening Spotify".to_string())
}

#[cfg(target_os = "linux")]
#[tauri::command]
fn spotify_get_state() -> Result<SpotifyState, String> {
    let is_running = spotify_is_running()?;

    if !is_running {
        return Ok(SpotifyState {
            is_running: false,
            is_playing: false,
            volume: 50,
            track: None,
        });
    }

    // Get playback status via dbus-send
    let status_output = Command::new("dbus-send")
        .args([
            "--print-reply",
            "--dest=org.mpris.MediaPlayer2.spotify",
            "/org/mpris/MediaPlayer2",
            "org.freedesktop.DBus.Properties.Get",
            "string:org.mpris.MediaPlayer2.Player",
            "string:PlaybackStatus",
        ])
        .output();

    let is_playing = match status_output {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout);
            stdout.contains("Playing")
        }
        Err(_) => false,
    };

    // Getting track metadata via MPRIS is complex - return minimal state
    Ok(SpotifyState {
        is_running: true,
        is_playing,
        volume: 50,
        track: None, // Would need to parse MPRIS Metadata dict
    })
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP ENTRY
// ═══════════════════════════════════════════════════════════════

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_localhost::Builder::new(1421).build())
        .invoke_handler(tauri::generate_handler![
            greet,
            run_shell_cmd,
            // Dock commands
            set_dock_badge,
            clear_dock_badge,
            bounce_dock,
            cancel_dock_bounce,
            // Spotify commands
            spotify_is_running,
            spotify_play,
            spotify_pause,
            spotify_toggle,
            spotify_next,
            spotify_previous,
            spotify_set_volume,
            spotify_get_volume,
            spotify_play_uri,
            spotify_open,
            spotify_get_state
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
