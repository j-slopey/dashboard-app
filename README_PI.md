# Raspberry Pi 3 Setup Instructions

This dashboard is optimized to run on a Raspberry Pi 3. Since the Pi 3 has limited RAM (1GB), compiling the app directly on the device requires some preparation.

## 1. OS Requirements
- Recommended: **Raspberry Pi OS (64-bit)** (Bookworm or newer).
- 32-bit is supported but 64-bit is preferred for modern Rust toolchains.

## 2. Increase Swap Size (Crucial for Compilation)
The compilation process will likely crash the Pi 3 due to out-of-memory errors unless you increase the swap size.

1.  Open the dphys-swapfile configuration:
    ```bash
    sudo nano /etc/dphys-swapfile
    ```
2.  Find `CONF_SWAPSIZE=100` and change it to `CONF_SWAPSIZE=2048` (2GB).
3.  Save and exit (Ctrl+O, Enter, Ctrl+X).
4.  Restart the swap service:
    ```bash
    sudo /etc/init.d/dphys-swapfile stop
    sudo /etc/init.d/dphys-swapfile start
    ```

## 3. Install System Dependencies
Run the following command to install the necessary build tools and WebKitGTK libraries.

**For Raspberry Pi OS Bookworm (Debian 12):**
```bash
sudo apt update
sudo apt install -y build-essential curl wget file libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libwebkit2gtk-4.1-dev
```

**For Raspberry Pi OS Bullseye (Debian 11):**
If you are on an older OS, use `libwebkit2gtk-4.0-dev` instead of `4.1`.

## 4. Install Rust & Node.js
1.  **Install Rust**:
    ```bash
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    source $HOME/.cargo/env
    ```
2.  **Install Node.js** (v18 or newer recommended):
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```

## 5. Build and Run
1.  Navigate to the project folder.
2.  Install NPM packages:
    ```bash
    npm install
    ```
3.  Run in Development Mode:
    ```bash
    npm run tauri dev
    ```
4.  Build for Production (Release):
    ```bash
    npm run tauri build
    ```
    The executable will be located at `src-tauri/target/release/dashboard-app`.

## Troubleshooting
- **White Screen / Glitches**: The app is configured to disable hardware compositing (`WEBKIT_DISABLE_COMPOSITING_MODE=1`) which fixes most rendering issues on the Pi's VideoCore GPU.
- **Slow Compilation**: The first build can take 20-30 minutes on a Pi 3. Subsequent builds will be faster.
