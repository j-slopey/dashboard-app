import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export const SystemVolumeWidget = () => {
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const displayedVolume = isMuted ? 0 : volume;

  return (
    <div className="flex flex-col items-center justify-between gap-6 h-full">
      <div className="h-48 flex items-center justify-center w-full">
        <div className="relative w-48 h-12 flex items-center justify-center -rotate-90">
          <input
            type="range"
            min="0"
            max="100"
            value={displayedVolume}
            onChange={handleVolumeChange}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>

      <button
        onClick={toggleMute}
        className={`p-3 rounded-full transition-colors ${
          displayedVolume === 0 ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 hover:bg-gray-600 text-white'
        }`}
      >
        {displayedVolume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>
    </div>
  );
};
