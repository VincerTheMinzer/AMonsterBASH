import React from 'react';
import { GameState } from '../types';

interface GameControlsProps {
  gameState: GameState;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  onPause,
  onResume,
  onRestart
}) => {
  return (
    <div className="flex space-x-4 mt-4">
      {!gameState.isGameOver && (
        <>
          {gameState.isPaused ? (
            <button
              onClick={onResume}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Resume
            </button>
          ) : (
            <button
              onClick={onPause}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
            >
              Pause
            </button>
          )}
        </>
      )}
      
      <button
        onClick={onRestart}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        {gameState.isGameOver ? 'Play Again' : 'Restart'}
      </button>
    </div>
  );
};

export default GameControls;
