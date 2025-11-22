# Dashboard App Setup Instructions

This dashboard is designed to run on various platforms, including Raspberry Pi, Windows, and Ubuntu. Below are the setup instructions for each platform, along with additional details for Raspberry Pi users and information on configuring Spotify credentials.

---

## 1. General Setup Instructions

### 1.1 Install System Dependencies

1. Install [Node.js](https://nodejs.org/) (v18 or newer).
2. Install [Rust](https://rustup.rs/):

#### Aditional Instructions For Linux
1. Update your system:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
2. Install required dependencies:
   ```bash
   sudo apt install -y build-essential curl wget file libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libwebkit2gtk-4.1-dev
---

### 1.2 Build and Run

1. Navigate to the project folder.
2. Install NPM packages:
   ```bash
   npm install
   ```
3. Run in Development Mode:
   ```bash
   npm run tauri dev
   ```
4. Build for Production (Release):
   ```bash
   npm run tauri build
   ```
   The executable will be located at `src-tauri/target/release/dashboard-app`.

---

## 2. Additional Raspberry Pi Details

### 2.1 Increase Swap Size (Crucial for Compilation)
The compilation process may crash on a Raspberry Pi 3 due to out-of-memory errors unless you increase the swap size.

1. Open the dphys-swapfile configuration:
   ```bash
   sudo nano /etc/dphys-swapfile
   ```
2. Find `CONF_SWAPSIZE=100` and change it to `CONF_SWAPSIZE=2048` (2GB).
3. Save and exit (Ctrl+O, Enter, Ctrl+X).
4. Restart the swap service:
   ```bash
   sudo /etc/init.d/dphys-swapfile stop
   sudo /etc/init.d/dphys-swapfile start
   ```

### 2.2 Troubleshooting

- **Slow Compilation**: The first build can take 20-30 minutes on a Pi 3. Subsequent builds will be faster.

---

## 3. Setting Up Spotify Credentials

To enable Spotify integration, you need to set up a `.env` file with your Spotify credentials. Follow these steps:

1. Create a `.env` file in the root of the project directory.
2. Add the following lines to the `.env` file:
   ```env
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   ```
3. Replace `your_spotify_client_id` and `your_spotify_client_secret` with the credentials from your Spotify Developer Dashboard.
4. Save the file.

### Obtaining Spotify Credentials
1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/).
2. Log in and create a new application.
3. Copy the `Client ID` and `Client Secret` from the application settings.
4. Add a redirect URI `http://127.0.0.1:5000/auth/callback`

---

## 4. Notes
- Ensure your system meets the minimum requirements for Node.js and Rust.
- For cross-platform compatibility, test the app on all target platforms after building.
- Use a secure network when running the app to avoid exposing sensitive data.
