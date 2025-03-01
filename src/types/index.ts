export enum CommandTier {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  PRO = 'PRO'
}

export interface Command {
  command: string;
  description: string;
  tier: CommandTier;
  icon?: string; // Icon identifier for the command
}

export interface Enemy {
  id: string;
  type: string;
  command: Command;
  health: number;
  maxHealth: number;
  x: number;
  y: number;
  speed: number;
  damage: number;
  width: number;
  height: number;
  isActive: boolean;
  isBoss: boolean;
  commandSequence?: Command[];
  currentCommandIndex?: number;
  filename: string; // Filename associated with the enemy
}

export interface Player {
  health: number;
  maxHealth: number;
  x: number;
  y: number;
  width: number;
  height: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  spriteAnimation: {
    spriteIndex: number;
    frameWidth: number;
    frameHeight: number;
    lastInputTime: number;
  };
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  gravity?: number; // Optional gravity effect for the particle
}

export interface PathVariable {
  name: string;
  path: string;
}

// File system structure
export interface FileSystemItem {
  name: string;
  type: 'file' | 'directory';
  content?: FileSystemItem[]; // For directories
  isVisible?: boolean; // Whether this item is visible to the player (after ls)
  enemyId?: string; // Associated enemy ID if any
}

export interface FileSystem {
  root: FileSystemItem;
  currentPath: string[]; // Array of directory names representing current path
  exploredDirectories: string[]; // Directories where 'ls' has been used
}

export interface GameState {
  player: Player;
  enemies: Enemy[];
  score: number;
  timer: number;
  currentTier: CommandTier;
  isGameOver: boolean;
  isPaused: boolean;
  isStarted: boolean;
  currentInput: string;
  lastError: string | null;
  lastCommandDescription: string | null;
  suggestions: string[];
  turretsEnabled: boolean;
  turretCooldown: number;
  targetEnemy: Enemy | null; // Enemy currently being targeted
  particles: Particle[]; // Particles for visual effects
  textAnimationTime: number; // For animating text
  pathVariables: PathVariable[]; // PATH variables created by the player
  showPathTutorial: boolean; // Whether to show the PATH tutorial
  tabIndex: number; // Current index when cycling through filenames with tab
  visibleFilenames: string[]; // All filenames currently visible on screen
  fileSystem: FileSystem; // File system structure
}
