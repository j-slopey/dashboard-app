import { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, MonitorSpeaker } from 'lucide-react';
import { useSpotifyPlayer } from '../hooks/useSpotifyPlayer';

interface MediaControlWidgetProps {
  token: string;
}

export const MediaControlWidget = ({ token }: MediaControlWidgetProps) => {
  const { 
    is_paused, 
    is_active, 
    current_track, 
    volume, 
    device,
    togglePlay, 
    nextTrack, 
    previousTrack, 
    setPlayerVolume 
  } = useSpotifyPlayer(token);
  
  const [localVolume, setLocalVolume] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  // Sync local volume with player volume when not dragging
  useEffect(() => {
    if (!isDragging) {
      setLocalVolume(volume);
    }
  }, [volume, isDragging]);

  const handleVolumeChange = (val: number) => {
    setLocalVolume(val);
  };

  const handleVolumeCommit = () => {
    setIsDragging(false);
    setPlayerVolume(localVolume);
  };

  if (!token) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl w-full max-w-md border border-gray-700 flex items-center justify-center h-64">
        <p className="text-gray-400">Please log in to Spotify</p>
      </div>
    );
  }

  if (!is_active) {
     return (
      <div className="bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl w-full max-w-md border border-gray-700 flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-400">No active playback</p>
        <p className="text-sm text-gray-500 text-center">Start playing music on any Spotify device to see it here.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl w-full max-w-md border border-gray-700">
      <div className="flex flex-col gap-6">
        {/* Device Info */}
        {device && (
          <div className="flex items-center justify-center gap-2 text-green-400 text-xs uppercase tracking-wider font-semibold">
            <MonitorSpeaker size={14} />
            <span>{device.name}</span>
          </div>
        )}

        {/* Song Info */}
        <div className="text-center">
          <div className="w-full flex justify-center mb-4">
             {current_track.album.images[0]?.url ? (
               <img src={current_track.album.images[0].url} alt="Album Art" className="w-32 h-32 rounded-lg shadow-lg object-cover" />
             ) : (
               <div className="w-32 h-32 bg-gray-700 rounded-lg shadow-lg flex items-center justify-center">
                 <span className="text-gray-500">No Art</span>
               </div>
             )}
          </div>
          <h3 className="text-white text-xl font-bold truncate">{current_track.name}</h3>
          <p className="text-gray-400 text-sm truncate">{current_track.artists[0].name}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-8">
          <button onClick={previousTrack} className="text-gray-300 hover:text-white transition-colors active:scale-95">
            <SkipBack size={32} />
          </button>
          
          <button 
            onClick={togglePlay}
            className="bg-blue-500 hover:bg-blue-400 text-white p-4 rounded-full shadow-lg transition-all active:scale-95"
          >
            {is_paused ? <Play size={32} fill="currentColor" className="ml-1" /> : <Pause size={32} fill="currentColor" />}
          </button>

          <button onClick={nextTrack} className="text-gray-300 hover:text-white transition-colors active:scale-95">
            <SkipForward size={32} />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-3 text-gray-400">
          <Volume2 size={20} />
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={localVolume} 
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            onMouseUp={handleVolumeCommit}
            onTouchEnd={handleVolumeCommit}
            className="w-full cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
