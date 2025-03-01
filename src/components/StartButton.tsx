import React from 'react';
import { Play } from 'lucide-react';

interface StartButtonProps {
  onStart: () => void;
  isStarted: boolean;
}

const StartButton: React.FC<StartButtonProps> = ({ onStart, isStarted }) => {
  if (isStarted) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-6">Bash Quest: Survival</h2>
        <p className="text-gray-300 mb-8 max-w-md mx-auto">
          Defeat enemies by typing bash commands. Survive as long as possible and master the command line!
        </p>
        <button
          onClick={onStart}
          className="px-8 py-4 bg-green-600 text-white rounded-lg text-xl font-bold flex items-center justify-center mx-auto hover:bg-green-700 transition-colors"
        >
          <Play className="mr-2" size={24} />
          Start Game
        </button>
      </div>
    </div>
  );
};

export default StartButton;
