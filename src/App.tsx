import React from 'react';
import { Terminal } from 'lucide-react';
import GameCanvas from './components/GameCanvas';
import TerminalInput from './components/Terminal';
import GameControls from './components/GameControls';
import GameInstructions from './components/GameInstructions';
import StartButton from './components/StartButton';
import { useGameLoop } from './hooks/useGameLoop';

function App() {
  const { 
    gameState, 
    processGameState, 
    startGame,
    restartGame, 
    pauseGame, 
    resumeGame,
    focusTerminal
  } = useGameLoop();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <header className="mb-4 flex items-center">
        <Terminal className="text-green-500 mr-2" size={32} />
        <h1 className="text-3xl font-bold text-white">Bash Quest: Survival</h1>
      </header>
      
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex flex-col items-center relative">
          <GameCanvas 
            gameState={gameState} 
            onCanvasClick={focusTerminal}
          />
          
          <StartButton 
            onStart={startGame} 
            isStarted={gameState.isStarted} 
          />
          
          <TerminalInput 
            gameState={gameState} 
            onInputProcessed={processGameState}
            onRestart={restartGame}
          />
          
          <GameControls 
            gameState={gameState}
            onPause={pauseGame}
            onResume={resumeGame}
            onRestart={restartGame}
          />
        </div>
        
        <div className="flex flex-col gap-4">
          <GameInstructions />
          
          <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-2">Keyboard Controls</h2>
            <ul className="text-sm space-y-1">
              <li>Type commands in the terminal to defeat enemies</li>
              <li>Press <span className="font-mono bg-gray-700 px-1 rounded">Enter</span> to submit commands</li>
              <li>Press <span className="font-mono bg-gray-700 px-1 rounded">Enter</span> to restart when game is over</li>
              <li>Click on the game area to focus the terminal</li>
            </ul>
          </div>
          
          <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-2">Command Tiers</h2>
            <ul className="text-sm space-y-2">
              <li>
                <span className="font-bold text-blue-300">Beginner:</span> 
                <span className="font-mono ml-2 text-xs">cd, ls, pwd, echo, cat</span>
              </li>
              <li>
                <span className="font-bold text-green-300">Intermediate:</span> 
                <span className="font-mono ml-2 text-xs">mkdir, rm, cp, mv, grep, touch</span>
              </li>
              <li>
                <span className="font-bold text-yellow-300">Advanced:</span> 
                <span className="font-mono ml-2 text-xs">chmod, chown, find, tail, head, sed</span>
              </li>
              <li>
                <span className="font-bold text-red-300">Pro:</span> 
                <span className="font-mono ml-2 text-xs">ls | grep, find . -name, awk, xargs, tar</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <footer className="mt-6 text-gray-400 text-sm">
        {gameState.isStarted ? "Click on the game area to focus and start typing commands" : "Press Start to begin the game"}
      </footer>
    </div>
  );
}

export default App;
