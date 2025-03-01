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
    const suggestions = generateSuggestions(newInput, gameState.currentTier, gameState);
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
      
      // If we have a command and there are items in the current directory
      const currentDir = gameState.fileSystem.currentPath;
      const currentPathStr = currentDir.length === 0 ? '/' : '/' + currentDir.join('/');
      
      // Check if this directory has been explored
      if (gameState.fileSystem.exploredDirectories.includes(currentPathStr)) {
        // Get the current command parts
        const parts = input.trim().split(' ');
        const command = parts[0];
        const partialName = parts.length > 1 ? parts[1] : '';
        
        // If we have a command, cycle through file explorer items
        if (command) {
          // Get visible items from the current directory
          const visibleItems = gameState.fileSystem.root;
          let currentItems = visibleItems;
          
          // Navigate to current directory
          for (const dir of currentDir) {
            const found = currentItems.content?.find(item => 
              item.type === 'directory' && item.name === dir
            );
            
            if (found && found.type === 'directory') {
              currentItems = found;
            }
          }
          
          // Filter items based on partial name if provided
          const filteredItems = (currentItems.content || [])
            .filter(item => !partialName || item.name.startsWith(partialName))
            .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
          
          if (filteredItems.length > 0) {
            // Get the next item in the cycle
            const nextIndex = (gameState.tabIndex + 1) % filteredItems.length;
            const nextItem = filteredItems[nextIndex];
            
            // Create the new command with the item name
            const newInput = `${command} ${nextItem.name}`;
            setInput(newInput);
            
            // Update game state with the new input and tab index
            onInputProcessed({
              ...gameState,
              currentInput: newInput,
              tabIndex: nextIndex,
              suggestions: []
            });
            
            return;
          }
        }
      }
      
      // Fall back to cycling through visible filenames if no directory items match
      if (gameState.visibleFilenames.length > 0) {
        // Get the current command parts
        const parts = input.trim().split(' ');
        const command = parts[0];
        
        // If we have a command, cycle through filenames
        if (command) {
          // Get the next filename in the cycle
          const nextIndex = (gameState.tabIndex + 1) % gameState.visibleFilenames.length;
          const filename = gameState.visibleFilenames[nextIndex];
          
          // Create the new command with the filename
          const newInput = `${command} ${filename}`;
          setInput(newInput);
          
          // Update game state with the new input and tab index
          onInputProcessed({
            ...gameState,
            currentInput: newInput,
            tabIndex: nextIndex,
            suggestions: []
          });
          
          return;
        }
      }
      
      // Fall back to original tab completion behavior if no filenames to cycle through
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
          const suggestions = generateSuggestions(targetCommand, gameState.currentTier, gameState);
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
        const suggestions = generateSuggestions(gameState.suggestions[0], gameState.currentTier, gameState);
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

  // Generate a hint for the closest enemy
  const getClosestEnemyHint = () => {
    if (!gameState.isStarted || gameState.isPaused || gameState.isGameOver || !gameState.enemies.length) {
      return null;
    }
    
    // Find the closest enemy (lowest x value)
    const closestEnemy = [...gameState.enemies]
      .filter(enemy => enemy.isActive)
      .sort((a, b) => a.x - b.x)[0];
    
    if (!closestEnemy) return null;
    
    // Generate a hint based on the command type
    const command = closestEnemy.command.command;
    const filename = closestEnemy.filename;
    
    // Check if this is a standalone command
    const isStandaloneCommand = ['ls', 'pwd', 'clear', 'history'].includes(command);
    
    if (isStandaloneCommand) {
      return `You need to run the '${command}' command to see what's in this directory.`;
    }
    
    if (command === 'cd') {
      return `You want to change to the '${filename}' directory using 'cd ${filename}'.`;
    }
    
    if (command === 'cat') {
      return `You want to view the contents of '${filename}' using 'cat ${filename}'.`;
    }
    
    if (command === 'rm') {
      return `You want to delete the file '${filename}' using 'rm ${filename}'.`;
    }
    
    if (command === 'mv') {
      // Find a suitable destination directory
      const currentPath = gameState.fileSystem.currentPath;
      let destinationDir = '/home/user';
      
      // Check file extension to suggest appropriate destination
      if (filename.endsWith('.mp4') || filename.endsWith('.mkv') || filename.endsWith('.webm')) {
        destinationDir = '/home/user/videos';
      } else if (filename.endsWith('.jpg') || filename.endsWith('.png')) {
        destinationDir = '/home/user/pictures';
      } else if (filename.endsWith('.mp3') || filename.endsWith('.flac') || filename.endsWith('.wav')) {
        destinationDir = '/home/user/music';
      } else if (filename.endsWith('.pdf') || filename.endsWith('.docx') || filename.endsWith('.txt')) {
        destinationDir = '/home/user/documents';
      }
      
      return `You want to move '${filename}' to ${destinationDir} using 'mv ${filename} ${destinationDir}'.`;
    }
    
    if (command === 'cp') {
      return `You want to copy '${filename}' to a backup location using 'cp ${filename} ${filename}.backup'.`;
    }
    
    // Generic hint for other commands
    return `You need to use '${command}' on '${filename}'.`;
  };
  
  const hint = getClosestEnemyHint();

  return (
    <div className="relative w-full">
      {hint && (
        <div className="absolute bottom-full mb-6 w-full text-center text-yellow-300 bg-gray-900 bg-opacity-70 py-1 px-2 rounded">
          <span className="text-sm">{hint}</span>
        </div>
      )}
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
