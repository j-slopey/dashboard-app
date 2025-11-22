import { useCallback, useEffect, useMemo, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { DashboardLayout } from './widgets/DashboardLayout';
import { buildWidgetConfigs } from './widgets/registry';

function App() {
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    let unlisten: UnlistenFn | null = null;

    const attachListener = async () => {
      unlisten = await listen<string>('spotify-token', (event) => {
        setToken(event.payload);
      });
    };

    attachListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  const handleLogin = useCallback(async () => {
    try {
      await invoke('login_spotify');
    } catch (e) {
      console.error("Login failed", e);
      window.location.href = 'http://localhost:5000/auth/login';
    }
  }, []);

  const widgets = useMemo(
    () => buildWidgetConfigs({ token, requestSpotifyAuth: handleLogin }),
    [token, handleLogin]
  );

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      <DashboardLayout widgets={widgets} />
    </div>
  );
}

export default App;
