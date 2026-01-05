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

#[tauri::command]
fn spotify_play() -> Result<String, String> {
    run_applescript(r#"tell application "Spotify" to play"#)
}

#[tauri::command]
fn spotify_pause() -> Result<String, String> {
    run_applescript(r#"tell application "Spotify" to pause"#)
}

#[tauri::command]
fn spotify_toggle() -> Result<String, String> {
    run_applescript(r#"tell application "Spotify" to playpause"#)
}

#[tauri::command]
fn spotify_next() -> Result<String, String> {
    run_applescript(r#"tell application "Spotify" to next track"#)
}

#[tauri::command]
fn spotify_previous() -> Result<String, String> {
    run_applescript(r#"tell application "Spotify" to previous track"#)
}

#[tauri::command]
fn spotify_set_volume(level: u8) -> Result<String, String> {
    let level_clamped = level.min(100);
    let script = format!(
        r#"tell application "Spotify" to set sound volume to {}"#,
        level_clamped
    );
    run_applescript(&script)
}

#[tauri::command]
fn spotify_get_volume() -> Result<u8, String> {
    let script = r#"tell application "Spotify" to get sound volume"#;
    let result = run_applescript(script)?;
    result
        .parse::<u8>()
        .map_err(|e| format!("Failed to parse volume: {}", e))
}

#[tauri::command]
fn spotify_play_uri(uri: String) -> Result<String, String> {
    let script = format!(r#"tell application "Spotify" to play track "{}""#, uri);
    run_applescript(&script)
}

#[tauri::command]
fn spotify_open() -> Result<String, String> {
    run_applescript(r#"tell application "Spotify" to activate"#)
}

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

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_localhost::Builder::new(1421).build())
        .invoke_handler(tauri::generate_handler![
            greet,
            run_shell_cmd,
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
