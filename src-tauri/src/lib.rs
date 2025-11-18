use tauri::Emitter;
use tiny_http::{Server, Response};
use url::Url;
use serde::{Deserialize, Serialize};
use tauri_plugin_shell::ShellExt;

const CLIENT_ID: &str = "32b60e6294ea47139465e2c1daeacaa4";
const CLIENT_SECRET: &str = "e39668bec9ea454280e622f17c580363";
const REDIRECT_URI: &str = "http://127.0.0.1:5000/auth/callback";

#[derive(Serialize, Deserialize)]
struct TokenResponse {
    access_token: String,
    token_type: String,
    scope: String,
    expires_in: i32,
    refresh_token: String,
}

#[tauri::command]
async fn login_spotify(app: tauri::AppHandle) -> Result<(), String> {
    let server = Server::http("127.0.0.1:5000").map_err(|e| e.to_string())?;
    
    let scope = "streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state";
    let auth_url = format!(
        "https://accounts.spotify.com/authorize?response_type=code&client_id={}&scope={}&redirect_uri={}",
        CLIENT_ID, scope, REDIRECT_URI
    );

    #[allow(deprecated)]
    app.shell().open(&auth_url, None).map_err(|e| e.to_string())?;

    tauri::async_runtime::spawn_blocking(move || {
        if let Ok(request) = server.recv() {
            let url_string = format!("http://127.0.0.1:5000{}", request.url());
            let url = Url::parse(&url_string).unwrap();
            let pairs: std::collections::HashMap<_, _> = url.query_pairs().into_owned().collect();
            
            if let Some(code) = pairs.get("code") {
                // Exchange code for token
                let client = reqwest::blocking::Client::new();
                let params = [
                    ("code", code.as_str()),
                    ("redirect_uri", REDIRECT_URI),
                    ("grant_type", "authorization_code"),
                ];
                
                let res = client.post("https://accounts.spotify.com/api/token")
                    .basic_auth(CLIENT_ID, Some(CLIENT_SECRET))
                    .form(&params)
                    .send();

                match res {
                    Ok(response) => {
                        if response.status().is_success() {
                            let token_data: TokenResponse = response.json().unwrap();
                            app.emit("spotify-token", token_data.access_token).unwrap();
                            
                            let _ = request.respond(Response::from_string("Login successful! You can close this window and return to the dashboard."));
                        } else {
                             let _ = request.respond(Response::from_string("Failed to exchange token."));
                        }
                    },
                    Err(_) => {
                         let _ = request.respond(Response::from_string("Failed to contact Spotify."));
                    }
                }
            }
        }
    });

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![login_spotify])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
