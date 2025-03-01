import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState } from '../types';
import { 
  initializeGameState, 
  updateGameState, 
  createEnemy, 
  ENEMY_SPAWN_INTERVAL,
  BOSS_SPAWN_INTERVAL
} from '../utils/gameUtils';

export const useGameLoop = () => {
  // Core state
  const [gameState, setGameState] = useState<GameState>(initializeGameState());
  
  // Animation timing refs
  const lastFrameTimeRef = useRef<number>(0);
  const lastEnemySpawnRef = useRef<number>(0);
  const lastBossSpawnRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number>(0);
  
  // Game state ref for avoiding stale closures
  const gameStateRef = useRef<GameState>(gameState);
  
  // Update ref when state changes
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Process game state updates
  const processGameState = useCallback((newState: GameState) => {
    setGameState(newState);
  }, []);

  // Focus terminal helper
  const focusTerminalHelper = useCallback(() => {
    if (window && window.focusTerminal) {
      // @ts-ignore
      window.focusTerminal();
    }
  }, []);

  // Start game
  const startGame = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      isStarted: true
    }));
    
    // Focus terminal input
    setTimeout(focusTerminalHelper, 100);
  }, [focusTerminalHelper]);

  // Restart game
  const restartGame = useCallback(() => {
    const newState = initializeGameState();
    newState.isStarted = true; // Keep the game started
    
    setGameState(newState);
    lastFrameTimeRef.current = 0;
    lastEnemySpawnRef.current = 0;
    lastBossSpawnRef.current = 0;
    
    // Focus terminal input
    setTimeout(focusTerminalHelper, 100);
  }, [focusTerminalHelper]);

  // Pause game
  const pauseGame = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      isPaused: true
    }));
  }, []);

  // Resume game
  const resumeGame = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      isPaused: false
    }));
    
    // Focus terminal input
    setTimeout(focusTerminalHelper, 100);
  }, [focusTerminalHelper]);

  // Focus terminal
  const focusTerminal = useCallback(() => {
    const currentState = gameStateRef.current;
    if (currentState.isStarted && !currentState.isPaused && !currentState.isGameOver) {
      focusTerminalHelper();
    }
  }, [focusTerminalHelper]);

  // Game loop
  useEffect(() => {
    // Skip if game is not active
    if (gameState.isGameOver || gameState.isPaused || !gameState.isStarted) {
      return;
    }

    const gameLoop = (timestamp: number) => {
      // Get current state from ref to avoid stale closures
      const currentState = gameStateRef.current;
      
      // Skip if game is over, paused, or not started
      if (currentState.isGameOver || currentState.isPaused || !currentState.isStarted) {
        return;
      }
      
      // Calculate delta time
      const deltaTime = lastFrameTimeRef.current ? timestamp - lastFrameTimeRef.current : 0;
      
      // Update game state
      let updatedState = updateGameState(currentState, deltaTime);
      
      // Spawn enemies
      if (timestamp - lastEnemySpawnRef.current >= ENEMY_SPAWN_INTERVAL) {
        const newEnemy = createEnemy(updatedState.currentTier);
        updatedState = {
          ...updatedState,
          enemies: [...updatedState.enemies, newEnemy]
        };
        lastEnemySpawnRef.current = timestamp;
      }
      
      // Spawn bosses
      if (timestamp - lastBossSpawnRef.current >= BOSS_SPAWN_INTERVAL) {
        const newBoss = createEnemy(updatedState.currentTier, true);
        updatedState = {
          ...updatedState,
          enemies: [...updatedState.enemies, newBoss]
        };
        lastBossSpawnRef.current = timestamp;
      }
      
      // Clean up inactive enemies
      updatedState = {
        ...updatedState,
        enemies: updatedState.enemies.filter(enemy => 
          enemy.isActive || (timestamp - lastFrameTimeRef.current) < 1000
        )
      };
      
      // Update state
      setGameState(updatedState);
      lastFrameTimeRef.current = timestamp;
      
      // Continue loop
      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    };
    
    animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [gameState.isGameOver, gameState.isPaused, gameState.isStarted]);

  return {
    gameState,
    processGameState,
    startGame,
    restartGame,
    pauseGame,
    resumeGame,
    focusTerminal
  };
};
