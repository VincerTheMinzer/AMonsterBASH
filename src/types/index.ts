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
}
