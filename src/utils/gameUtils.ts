import { v4 as uuidv4 } from 'uuid';
import { Command, CommandTier, Enemy, GameState, Player } from '../types';
import { getRandomCommand, getRandomCommandSequence, getCommandsByTier } from '../data/commands';

// Constants
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const CONSOLE_HEIGHT = 200;
export const GAME_AREA_HEIGHT = CANVAS_HEIGHT - CONSOLE_HEIGHT;

// Player constants
export const PLAYER_WIDTH = 50;
export const PLAYER_HEIGHT = 50;
export const PLAYER_INITIAL_X = 100;
export const PLAYER_INITIAL_Y = GAME_AREA_HEIGHT - PLAYER_HEIGHT - 20;

// Enemy constants
export const ENEMY_WIDTH = 40;
export const ENEMY_HEIGHT = 40;
export const BOSS_WIDTH = 80;
export const BOSS_HEIGHT = 80;
export const ENEMY_SPAWN_INTERVAL = 3000; // ms
export const BOSS_SPAWN_INTERVAL = 30000; // ms

// Game mechanics
export const TIER_UPGRADE_TIME = 60000; // ms (1 minute)
export const TURRET_COOLDOWN = 5000; // ms

// Initialize player
export const initializePlayer = (): Player => ({
  health: 100,
  maxHealth: 100,
  x: PLAYER_INITIAL_X,
  y: PLAYER_INITIAL_Y,
  width: PLAYER_WIDTH,
  height: PLAYER_HEIGHT,
  level: 1,
  experience: 0,
  experienceToNextLevel: 100
});

// Initialize game state
export const initializeGameState = (): GameState => ({
  player: initializePlayer(),
  enemies: [],
  score: 0,
  timer: 0,
  currentTier: CommandTier.BEGINNER,
  isGameOver: false,
  isPaused: false,
  isStarted: false,
  currentInput: '',
  lastError: null,
  suggestions: [],
  turretsEnabled: false,
  turretCooldown: 0
});

// Create a new enemy
export const createEnemy = (tier: CommandTier, isBoss: boolean = false): Enemy => {
  const id = uuidv4();
  const x = CANVAS_WIDTH;
  const y = Math.random() * (GAME_AREA_HEIGHT - (isBoss ? BOSS_HEIGHT : ENEMY_HEIGHT) - 20);
  
  if (isBoss) {
    const commandSequence = getRandomCommandSequence(tier, 3);
    return {
      id,
      type: 'boss',
      command: commandSequence[0],
      commandSequence,
      currentCommandIndex: 0,
      health: 100,
      maxHealth: 100,
      x,
      y,
      speed: 0.5,
      damage: 20,
      width: BOSS_WIDTH,
      height: BOSS_HEIGHT,
      isActive: true,
      isBoss: true
    };
  }
  
  return {
    id,
    type: 'regular',
    command: getRandomCommand(tier),
    health: 1,
    maxHealth: 1,
    x,
    y,
    speed: 1 + Math.random(),
    damage: 10,
    width: ENEMY_WIDTH,
    height: ENEMY_HEIGHT,
    isActive: true,
    isBoss: false
  };
};

// Check if a command matches an enemy
export const checkCommandMatch = (input: string, enemy: Enemy): boolean => {
  if (enemy.isBoss) {
    if (enemy.commandSequence && enemy.currentCommandIndex !== undefined) {
      const currentCommand = enemy.commandSequence[enemy.currentCommandIndex];
      return input.trim() === currentCommand.command;
    }
    return false;
  }
  
  return input.trim() === enemy.command.command;
};

// Process player input
export const processInput = (input: string, gameState: GameState): GameState => {
  const newGameState = { ...gameState };
  
  // Check for turret command
  if (input === 'turrets on' && !gameState.turretsEnabled) {
    return {
      ...newGameState,
      turretsEnabled: true,
      currentInput: ''
    };
  }
  
  if (input === 'turrets off' && gameState.turretsEnabled) {
    return {
      ...newGameState,
      turretsEnabled: false,
      currentInput: ''
    };
  }
  
  // Check for enemy matches
  let matchFound = false;
  
  const updatedEnemies = gameState.enemies.map(enemy => {
    if (!matchFound && enemy.isActive && checkCommandMatch(input, enemy)) {
      matchFound = true;
      
      if (enemy.isBoss) {
        if (enemy.commandSequence && enemy.currentCommandIndex !== undefined) {
          const newIndex = enemy.currentCommandIndex + 1;
          
          if (newIndex >= enemy.commandSequence.length) {
            // Boss defeated
            return {
              ...enemy,
              isActive: false
            };
          } else {
            // Move to next command in sequence
            return {
              ...enemy,
              currentCommandIndex: newIndex,
              command: enemy.commandSequence[newIndex]
            };
          }
        }
      } else {
        // Regular enemy defeated
        return {
          ...enemy,
          isActive: false
        };
      }
    }
    return enemy;
  });
  
  if (matchFound) {
    // Calculate score increase
    const scoreIncrease = gameState.currentTier === CommandTier.BEGINNER ? 10 :
                         gameState.currentTier === CommandTier.INTERMEDIATE ? 20 :
                         gameState.currentTier === CommandTier.ADVANCED ? 30 : 50;
    
    return {
      ...newGameState,
      enemies: updatedEnemies,
      score: gameState.score + scoreIncrease,
      currentInput: '',
      lastError: null
    };
  } else {
    // Command didn't match any enemy
    return {
      ...newGameState,
      currentInput: '',
      lastError: `Command not found: ${input}`
    };
  }
};

// Update game state for a frame
export const updateGameState = (gameState: GameState, deltaTime: number): GameState => {
  if (gameState.isGameOver || gameState.isPaused || !gameState.isStarted) {
    return gameState;
  }
  
  const newTimer = gameState.timer + deltaTime;
  let newTier = gameState.currentTier;
  
  // Check for tier upgrade
  if (newTimer >= TIER_UPGRADE_TIME && gameState.currentTier === CommandTier.BEGINNER) {
    newTier = CommandTier.INTERMEDIATE;
  } else if (newTimer >= TIER_UPGRADE_TIME * 2 && gameState.currentTier === CommandTier.INTERMEDIATE) {
    newTier = CommandTier.ADVANCED;
  } else if (newTimer >= TIER_UPGRADE_TIME * 3 && gameState.currentTier === CommandTier.ADVANCED) {
    newTier = CommandTier.PRO;
  }
  
  // Update enemy positions
  const updatedEnemies = gameState.enemies
    .filter(enemy => enemy.isActive)
    .map(enemy => {
      const newX = enemy.x - enemy.speed * deltaTime / 16;
      
      // Check if enemy reached the player
      if (newX <= gameState.player.x + gameState.player.width) {
        return {
          ...enemy,
          isActive: false
        };
      }
      
      return {
        ...enemy,
        x: newX
      };
    });
  
  // Calculate player damage from enemies that reached the player
  const reachedEnemies = gameState.enemies.filter(
    enemy => enemy.isActive && enemy.x <= gameState.player.x + gameState.player.width
  );
  
  const totalDamage = reachedEnemies.reduce((sum, enemy) => sum + enemy.damage, 0);
  const newHealth = Math.max(0, gameState.player.health - totalDamage);
  
  // Check for game over
  const isGameOver = newHealth <= 0;
  
  // Update turret cooldown
  let turretCooldown = gameState.turretCooldown - deltaTime;
  if (turretCooldown < 0) turretCooldown = 0;
  
  // Fire turret if enabled and cooldown is 0
  let enemiesAfterTurret = [...updatedEnemies];
  if (gameState.turretsEnabled && turretCooldown === 0) {
    // Find the first active enemy
    const targetEnemy = enemiesAfterTurret.find(enemy => enemy.isActive && !enemy.isBoss);
    
    if (targetEnemy) {
      // Turret hits the enemy
      enemiesAfterTurret = enemiesAfterTurret.map(enemy => 
        enemy.id === targetEnemy.id ? { ...enemy, isActive: false } : enemy
      );
      
      // Reset turret cooldown
      turretCooldown = TURRET_COOLDOWN;
    }
  }
  
  return {
    ...gameState,
    timer: newTimer,
    currentTier: newTier,
    enemies: enemiesAfterTurret,
    player: {
      ...gameState.player,
      health: newHealth
    },
    isGameOver,
    turretCooldown
  };
};

// Generate suggestions based on current input
export const generateSuggestions = (input: string, tier: CommandTier): string[] => {
  if (!input) return [];
  
  const allCommands = [
    ...getCommandsByTier(CommandTier.BEGINNER),
    ...(tier >= CommandTier.INTERMEDIATE ? getCommandsByTier(CommandTier.INTERMEDIATE) : []),
    ...(tier >= CommandTier.ADVANCED ? getCommandsByTier(CommandTier.ADVANCED) : []),
    ...(tier >= CommandTier.PRO ? getCommandsByTier(CommandTier.PRO) : [])
  ];
  
  return allCommands
    .filter(cmd => cmd.command.startsWith(input))
    .map(cmd => cmd.command)
    .slice(0, 4);
};

// Format time (milliseconds to MM:SS)
export const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
