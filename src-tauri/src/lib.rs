use dotenvy::dotenv;
use serde::{Deserialize, Serialize};
use tauri::{Emitter, Manager, State};
use tauri_plugin_shell::ShellExt;
use tiny_http::{Response, Server};
use url::Url;

struct SpotifyConfig {
    client_id: String,
    client_secret: String,
    redirect_uri: String,
}

#[derive(Serialize, Deserialize)]
struct TokenResponse {
    access_token: String,
    token_type: String,
    scope: String,
    expires_in: i32,
    refresh_token: String,
}

#[tauri::command]
async fn login_spotify(
    app: tauri::AppHandle,
    config: State<'_, SpotifyConfig>,
) -> Result<(), String> {
    let client_id = config.client_id.clone();
    let client_secret = config.client_secret.clone();
    let redirect_uri = config.redirect_uri.clone();

    let server = Server::http("127.0.0.1:5000").map_err(|e| e.to_string())?;

    let scope = "streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state";
    let auth_url = format!(
        "https://accounts.spotify.com/authorize?response_type=code&client_id={}&scope={}&redirect_uri={}",
        client_id, scope, redirect_uri
    );

    #[allow(deprecated)]
    app.shell()
        .open(&auth_url, None)
        .map_err(|e| e.to_string())?;

    tauri::async_runtime::spawn_blocking(move || {
        if let Ok(request) = server.recv() {
            let url_string = format!("http://127.0.0.1:5000{}", request.url());
            let url = Url::parse(&url_string).unwrap();
            let pairs: std::collections::HashMap<_, _> = url.query_pairs().into_owned().collect();

            if let Some(code) = pairs.get("code") {
                let client = reqwest::blocking::Client::new();
                let params = [
                    ("code", code.as_str()),
                    ("redirect_uri", redirect_uri.as_str()),
                    ("grant_type", "authorization_code"),
                ];

                let res = client
                    .post("https://accounts.spotify.com/api/token")
                    .basic_auth(client_id, Some(client_secret))
                    .form(&params)
                    .send();

                match res {
                    Ok(response) => {
                        if response.status().is_success() {
                            if let Ok(token_data) = response.json::<TokenResponse>() {
                                let _ = app.emit("spotify-token", token_data.access_token);
                                let _ = request.respond(Response::from_string("Login successful! You can close this window and return to the dashboard."));
                            } else {
                                let _ = request.respond(Response::from_string("Failed to parse Spotify response."));
                            }
                        } else {
                            let _ =
                                request.respond(Response::from_string("Failed to exchange token."));
                        }
                    }
                    Err(_) => {
                        let _ =
                            request.respond(Response::from_string("Failed to contact Spotify."));
                    }
                }
            }
        }
    });

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    dotenv().ok();

    let client_id = std::env::var("SPOTIFY_CLIENT_ID").expect("SPOTIFY_CLIENT_ID must be set");
    let client_secret = std::env::var("SPOTIFY_CLIENT_SECRET").expect("SPOTIFY_CLIENT_SECRET must be set");
    let redirect_uri = std::env::var("SPOTIFY_REDIRECT_URI")
        .unwrap_or_else(|_| "http://127.0.0.1:5000/auth/callback".to_string());

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .manage(SpotifyConfig {
            client_id,
            client_secret,
            redirect_uri,
        })
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                if let Ok(monitors) = window.available_monitors() {
                    // Support selecting a specific monitor by name via env var for manual overrides
                    let preferred_name = std::env::var("DASHBOARD_MONITOR_NAME").ok();
                    // Choose the smallest monitor by area (width * height).
                    // This generalizes the previous hard-coded monitor selection
                    // to pick the smallest connected display available.
                    let smallest = if let Some(pref) = &preferred_name {
                        monitors.iter().find(|m| m.name().map(|n| n.contains(pref)).unwrap_or(false)).map(|m| m.clone())
                    } else {
                        None
                    }.or_else(|| monitors.iter().min_by_key(|m| {(m.size().width as u64) * (m.size().height as u64)}).map(|m| m.clone()));

                    if let Some(monitor) = smallest {
                        let scale = monitor.scale_factor();
                        let pos = monitor.position();
                        let size = monitor.size();

                        // Convert physical origin/size to logical (CSS) units
                        let logical_x = (pos.x as f64 / scale).round();
                        let logical_y = (pos.y as f64 / scale).round();
                        let logical_w = (size.width as f64 / scale).round();
                        let logical_h = (size.height as f64 / scale).round();

                        // Debug/diagnostic logs
                        println!(
                            "Monitor: {:?} scale: {} physical pos: {:?} physical size: {:?} -> logical pos: ({}, {}), logical size: ({}, {})",
                            monitor.name(),
                            scale,
                            pos,
                            size,
                            logical_x,
                            logical_y,
                            logical_w,
                            logical_h
                        );
                        // Log selection (monitor name is optional)
                        println!(
                            "Selected monitor: {:?} size: {:?} pos: {:?}",
                            monitor.name(),
                            monitor.size(),
                            monitor.position()
                        );
                        if let Err(err) = window.set_position(tauri::Position::Logical(tauri::LogicalPosition { x: logical_x, y: logical_y })) {
                            eprintln!("Failed to position window: {err}");
                        }
                        // Ensure the webview size matches the monitor logical size before fullscreening.
                        // Try setting physical size first, then logical as an extra measure if the OS handles DPI scaling differently.
                        if let Err(err) = window.set_size(tauri::Size::Physical(tauri::PhysicalSize { width: size.width, height: size.height })) {
                            eprintln!("Failed to set physical size for window: {err}");
                        }

                        if let Err(err) = window.set_size(tauri::Size::Logical(tauri::LogicalSize { width: logical_w, height: logical_h })) {
                            eprintln!("Failed to set inner size for window: {err}");
                        }

                        if let Err(err) = window.set_fullscreen(true) {
                            eprintln!("Failed to set fullscreen: {err}");
                        }
                        // Log final state for diagnostics
                        if let Ok(inner) = window.inner_size() {
                            println!("Window reported inner size after fullscreen: {:?}", inner);
                        }
                        if let Ok(sf) = window.scale_factor() {
                            println!("Window reported scale factor: {}", sf);
                        }
                    } else {
                        println!("No connected monitors found, staying on primary.");
                    }
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![login_spotify])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
