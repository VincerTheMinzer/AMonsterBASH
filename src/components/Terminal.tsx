import React, { useState, useEffect, useRef } from 'react';
import { GameState } from '../types';
import { processInput, generateSuggestions } from '../utils/gameUtils';

interface TerminalProps {
  gameState: GameState;
  onInputProcessed: (newState: GameState) => void;
  onRestart: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ gameState, onInputProcessed, onRestart }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount and when game state changes
  useEffect(() => {
    if (inputRef.current && !gameState.isPaused && !gameState.isGameOver && gameState.isStarted) {
      inputRef.current.focus();
    }
  }, [gameState.isPaused, gameState.isGameOver, gameState.isStarted]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = e.target.value;
    setInput(newInput);
    
    // Find potential target enemy based on input
    let targetEnemy: typeof gameState.targetEnemy = null;
    if (newInput) {
      const foundEnemy = gameState.enemies.find(enemy => 
        enemy.isActive && enemy.command.command.startsWith(newInput)
      );
      if (foundEnemy) {
        targetEnemy = foundEnemy;
      }
    }
    
    // Generate suggestions
    const suggestions = generateSuggestions(newInput, gameState.currentTier);
    onInputProcessed({
      ...gameState,
      currentInput: newInput,
      suggestions,
      targetEnemy,
      textAnimationTime: 0 // Reset animation time when input changes
    });
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (gameState.isGameOver) {
        // Restart game
        onRestart();
      } else {
        // Process command
        const newState = processInput(input, gameState);
        onInputProcessed(newState);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      // Prevent default tab behavior (focus change)
      e.preventDefault();
      
      // Handle tab completion
      if (gameState.targetEnemy) {
        // Check if we should complete with command only or command + filename
        const currentInput = input.trim();
        const targetCommand = gameState.targetEnemy.command.command;
        
        // If the input already matches the command exactly, add the filename
        if (currentInput === targetCommand) {
          const fullCommand = `${targetCommand} ${gameState.targetEnemy.filename}`;
          setInput(fullCommand);
          
          // Update game state with the new input
          onInputProcessed({
            ...gameState,
            currentInput: fullCommand,
            suggestions: []
          });
        } else {
          // Otherwise just complete the command
          setInput(targetCommand);
          
          // Update game state with the new input
          const suggestions = generateSuggestions(targetCommand, gameState.currentTier);
          onInputProcessed({
            ...gameState,
            currentInput: targetCommand,
            suggestions
          });
        }
      } else if (gameState.suggestions.length > 0) {
        // Complete with the first suggestion
        setInput(gameState.suggestions[0]);
        
        // Update game state with the new input
        const suggestions = generateSuggestions(gameState.suggestions[0], gameState.currentTier);
        onInputProcessed({
          ...gameState,
          currentInput: gameState.suggestions[0],
          suggestions
        });
      }
    }
  };

  // Handle canvas click to focus input
  const focusInput = () => {
    if (inputRef.current && gameState.isStarted && !gameState.isPaused && !gameState.isGameOver) {
      inputRef.current.focus();
    }
  };

  // Expose focus method to parent
  useEffect(() => {
    if (window) {
      // @ts-ignore
      window.focusTerminal = focusInput;
    }
  }, []);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        disabled={gameState.isGameOver || gameState.isPaused || !gameState.isStarted}
        autoFocus={gameState.isStarted}
        className="w-full bg-transparent text-white outline-none absolute opacity-0"
        aria-label="Terminal input"
      />
    </div>
  );
};

export default Terminal;
