import { useEffect, useState } from 'react';
import { MediaControlWidget } from './components/MediaControlWidget';
import { SystemVolumeWidget } from './components/SystemVolumeWidget';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

function App() {
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    // Listen for token from Tauri backend
    const unlisten = listen<string>('spotify-token', (event) => {
      setToken(event.payload);
    });

    return () => {
      unlisten.then(f => f());
    };
  }, []);

  const handleLogin = async () => {
    try {
      await invoke('login_spotify');
    } catch (e) {
      console.error("Login failed", e);
      // Fallback for browser dev mode
      window.location.href = 'http://localhost:5000/auth/login';
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      <div className="flex h-screen p-6 gap-6">
        {/* Left Sidebar / System Volume */}
        <div className="flex flex-col justify-center">
          <SystemVolumeWidget />
        </div>

        {/* Main Dashboard Area */}
        <div className="flex-1 flex items-center justify-center relative">
          {!token && (
            <div className="absolute top-4 right-4">
              <button 
                onClick={handleLogin}
                className="bg-green-500 hover:bg-green-400 text-black font-bold py-2 px-4 rounded-full transition-colors"
              >
                Connect Spotify
              </button>
            </div>
          )}
          
          <MediaControlWidget token={token} />
        </div>
      </div>
    </div>
  );
}

export default App;
