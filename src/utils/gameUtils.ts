import { v4 as uuidv4 } from 'uuid';
import { Command, CommandTier, Enemy, GameState, Particle, Player } from '../types';
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
  lastCommandDescription: null,
  suggestions: [],
  turretsEnabled: false,
  turretCooldown: 0,
  targetEnemy: null,
  particles: [],
  textAnimationTime: 0
});

// Constants for enemy spawning
export const MIN_SPAWN_HEIGHT = 100; // Minimum height from top to spawn enemies
export const MAX_SPAWN_HEIGHT_PERCENTAGE = 0.7; // Maximum percentage of game area height for spawning

// File extensions for different command tiers
const FILE_EXTENSIONS = {
  [CommandTier.BEGINNER]: ['.txt', '.log', '.md', '.csv', '.json'],
  [CommandTier.INTERMEDIATE]: ['.js', '.py', '.html', '.css', '.xml'],
  [CommandTier.ADVANCED]: ['.cpp', '.java', '.go', '.rs', '.php'],
  [CommandTier.PRO]: ['.sh', '.bash', '.conf', '.yml', '.toml']
};

// Generate a random filename
const generateRandomFilename = (tier: CommandTier): string => {
  // Random name prefixes
  const prefixes = [
    'data', 'config', 'user', 'system', 'app', 
    'server', 'client', 'backup', 'temp', 'log',
    'file', 'doc', 'report', 'project', 'test'
  ];
  
  // Random name suffixes
  const suffixes = [
    '', '1', '2', '3', '_old', '_new', '_backup', 
    '_temp', '_final', '_draft', '_v1', '_v2'
  ];
  
  // Get random prefix and suffix
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  // Get random extension for the tier
  const extensions = FILE_EXTENSIONS[tier];
  const extension = extensions[Math.floor(Math.random() * extensions.length)];
  
  return `${prefix}${suffix}${extension}`;
};

// Create a new enemy
export const createEnemy = (tier: CommandTier, isBoss: boolean = false): Enemy => {
  const id = uuidv4();
  const x = CANVAS_WIDTH;
  
  // Calculate spawn area to avoid spawning too high
  const minY = MIN_SPAWN_HEIGHT; // Minimum distance from top
  const maxY = GAME_AREA_HEIGHT * MAX_SPAWN_HEIGHT_PERCENTAGE;
  const spawnRange = maxY - minY - (isBoss ? BOSS_HEIGHT : ENEMY_HEIGHT);
  
  // Generate y position within the restricted range
  const y = minY + Math.random() * spawnRange;
  
  // Generate a random filename
  const filename = generateRandomFilename(tier);
  
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
      isBoss: true,
      filename
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
    isBoss: false,
    filename
  };
};

// Check if a command matches an enemy
export const checkCommandMatch = (input: string, enemy: Enemy): boolean => {
  const trimmedInput = input.trim();
  
  if (enemy.isBoss) {
    if (enemy.commandSequence && enemy.currentCommandIndex !== undefined) {
      const currentCommand = enemy.commandSequence[enemy.currentCommandIndex];
      
      // Check for command with filename
      const commandWithFilename = `${currentCommand.command} ${enemy.filename}`;
      
      return trimmedInput === currentCommand.command || trimmedInput === commandWithFilename;
    }
    return false;
  }
  
  // For regular enemies, check both plain command and command with filename
  const commandWithFilename = `${enemy.command.command} ${enemy.filename}`;
  
  return trimmedInput === enemy.command.command || trimmedInput === commandWithFilename;
};

// Process player input
export const processInput = (input: string, gameState: GameState): GameState => {
  const newGameState = { ...gameState };
  
  // Check for turret command
  if (input === 'turrets on' && !gameState.turretsEnabled) {
    return {
      ...newGameState,
      turretsEnabled: true,
      currentInput: '',
      lastCommandDescription: 'Activates automatic turret system to defeat regular enemies'
    };
  }
  
  if (input === 'turrets off' && gameState.turretsEnabled) {
    return {
      ...newGameState,
      turretsEnabled: false,
      currentInput: '',
      lastCommandDescription: 'Deactivates automatic turret system'
    };
  }
  
  // Check for enemy matches
  let matchFound = false;
  let commandDescription: string | null = null;
  let defeatedEnemy: Enemy | undefined = undefined;
  let newParticles: Particle[] = [];
  
  const updatedEnemies = gameState.enemies.map(enemy => {
    if (!matchFound && enemy.isActive && checkCommandMatch(input, enemy)) {
      matchFound = true;
      commandDescription = enemy.command.description;
      
      if (enemy.isBoss) {
        if (enemy.commandSequence && enemy.currentCommandIndex !== undefined) {
          const newIndex = enemy.currentCommandIndex + 1;
          
          if (newIndex >= enemy.commandSequence.length) {
            // Boss defeated
            defeatedEnemy = { ...enemy };
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
        defeatedEnemy = { ...enemy };
        return {
          ...enemy,
          isActive: false
        };
      }
    }
    return enemy;
  });
  
  // Create particles for defeated enemy
  if (defeatedEnemy) {
    const enemy = defeatedEnemy as Enemy; // Type assertion
    newParticles = createExplosion(
      enemy.x,
      enemy.y,
      enemy.width,
      enemy.height
    );
  }
  
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
      lastError: null,
      lastCommandDescription: commandDescription,
      particles: [...gameState.particles, ...newParticles],
      targetEnemy: null // Reset target enemy after successful command
    };
  } else {
    // Command didn't match any enemy
    return {
      ...newGameState,
      currentInput: '',
      lastError: `Command not found: ${input}`,
      lastCommandDescription: null,
      targetEnemy: null // Reset target enemy after failed command
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
  
  // Update particles
  const updatedParticles = updateParticles(gameState.particles, deltaTime);
  
  // Update text animation time
  const textAnimationTime = (gameState.textAnimationTime + deltaTime) % 1000;
  
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
    turretCooldown,
    particles: updatedParticles,
    textAnimationTime
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

// Particle system
export const PARTICLE_COLORS = ['#f38ba8', '#f9e2af', '#a6e3a1', '#89b4fa', '#cba6f7'];
export const PARTICLE_COUNT = 30; // Number of particles to create per explosion
export const PARTICLE_MAX_LIFE = 1000; // Maximum particle lifetime in ms

// Create particles for an explosion effect
export const createExplosion = (x: number, y: number, width: number, height: number): Particle[] => {
  const particles: Particle[] = [];
  
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Random position within the enemy bounds
    const particleX = x + Math.random() * width;
    const particleY = y + Math.random() * height;
    
    // Random velocity (fountain-like effect)
    const angle = Math.random() * Math.PI * 2; // Random angle
    const speed = 1 + Math.random() * 3; // Random speed
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed - 2; // Upward bias for fountain effect
    
    // Random color from palette
    const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
    
    // Random size
    const size = 2 + Math.random() * 4;
    
    // Random lifetime
    const life = PARTICLE_MAX_LIFE * (0.5 + Math.random() * 0.5);
    
    particles.push({
      x: particleX,
      y: particleY,
      vx,
      vy,
      color,
      size,
      life,
      maxLife: life
    });
  }
  
  return particles;
};

// Update particles (move them and reduce their lifetime)
export const updateParticles = (particles: Particle[], deltaTime: number): Particle[] => {
  return particles
    .map(particle => {
      // Apply gravity
      const vy = particle.vy + 0.1;
      
      // Update position
      const x = particle.x + particle.vx * deltaTime / 16;
      const y = particle.y + vy * deltaTime / 16;
      
      // Reduce lifetime
      const life = particle.life - deltaTime;
      
      return {
        ...particle,
        x,
        y,
        vy,
        life
      };
    })
    .filter(particle => particle.life > 0); // Remove dead particles
};
