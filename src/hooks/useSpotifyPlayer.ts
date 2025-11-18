import { useState, useEffect, useCallback } from 'react';

const track = {
  name: "",
  album: {
    images: [
      { url: "" }
    ]
  },
  artists: [
    { name: "" }
  ]
}

export const useSpotifyPlayer = (token: string) => {
  const [is_paused, setPaused] = useState(true);
  const [is_active, setActive] = useState(false);
  const [current_track, setTrack] = useState(track);
  const [volume, setVolume] = useState(50);
  const [device, setDevice] = useState<{name: string, id: string} | null>(null);

  const fetchState = useCallback(async () => {
      if (!token) return;
      try {
          const response = await fetch('https://api.spotify.com/v1/me/player', {
              headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.status === 204 || response.status > 400) {
              // 204 means no content (no active device)
              setActive(false);
              return;
          }

          const data = await response.json();
          if (!data || !data.item) {
              setActive(false);
              return;
          }

          setActive(true);
          setPaused(!data.is_playing);
          // Only update volume if we aren't currently dragging the slider (handled in UI, but good to know)
          // Actually, for polling, we might overwrite user input if we aren't careful. 
          // But for now let's just sync it.
          if (data.device) {
             setVolume(data.device.volume_percent);
             setDevice(data.device);
          }
          setTrack(data.item);

      } catch (e) {
          console.error("Error fetching state", e);
      }
  }, [token]);

  useEffect(() => {
      if (!token) return;
      fetchState();
      const interval = setInterval(fetchState, 1000); // Poll every second
      return () => clearInterval(interval);
  }, [token, fetchState]);

  // Control functions
  const performAction = async (endpoint: string, method: string = 'POST', body?: any) => {
      if (!token) return;
      try {
        await fetch(`https://api.spotify.com/v1/me/player/${endpoint}`, {
            method,
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: body ? JSON.stringify(body) : undefined
        });
        // Fetch state immediately after action to update UI
        setTimeout(fetchState, 200); 
      } catch (e) {
        console.error("Error performing action", e);
      }
  };

  const togglePlay = () => is_paused ? performAction('play', 'PUT') : performAction('pause', 'PUT');
  const nextTrack = () => performAction('next');
  const previousTrack = () => performAction('previous');
  const setPlayerVolume = (vol: number) => performAction(`volume?volume_percent=${vol}`, 'PUT');

  return { is_paused, is_active, current_track, volume, device, togglePlay, nextTrack, previousTrack, setPlayerVolume };
};
