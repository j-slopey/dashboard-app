import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export const SystemVolumeWidget = () => {
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="bg-gray-800/80 backdrop-blur-md p-4 rounded-2xl shadow-xl h-full max-h-[400px] w-24 border border-gray-700 flex flex-col items-center justify-between py-8">
      <div className="h-48 w-full flex items-center justify-center relative group">
        {/* Custom Vertical Slider using rotation */}
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="relative w-48 h-12 flex items-center justify-center -rotate-90">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={isMuted ? 0 : volume} 
                onChange={handleVolumeChange}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
           </div>
        </div>
      </div>

      <button 
        onClick={toggleMute}
        className={`p-3 rounded-full transition-colors ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
      >
        {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>
    </div>
  );
};
