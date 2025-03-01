import { v4 as uuidv4 } from 'uuid';
import { Command, CommandTier, Enemy, FileSystem, FileSystemItem, GameState, Particle, Player } from '../types';
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

// Predefined file pools for different directories
const FILE_POOLS = {
  documents: [
    'resume.pdf', 'report.docx', 'notes.txt', 'budget.xlsx', 
    'presentation.pptx', 'contract.pdf', 'todo.md', 'meeting_minutes.txt',
    'project_plan.xlsx', 'thesis.pdf', 'letter.docx', 'schedule.xlsx'
  ],
  pictures: [
    'vacation.jpg', 'family.png', 'party.jpg', 'screenshot.png', 
    'profile.jpg', 'landscape.png', 'birthday.jpg', 'wedding.png',
    'sunset.jpg', 'cat.png', 'dog.jpg', 'selfie.png'
  ],
  videos: [
    'tutorial.mp4', 'movie.mkv', 'lecture.mp4', 'gameplay.webm', 
    'interview.mp4', 'concert.mkv', 'vlog.mp4', 'animation.webm',
    'presentation.mp4', 'travel.mkv', 'wedding.mp4', 'highlights.webm'
  ],
  music: [
    'song.mp3', 'album.flac', 'playlist.m3u', 'podcast.mp3', 
    'soundtrack.flac', 'recording.wav', 'ringtone.mp3', 'audiobook.m4a',
    'live_performance.mp3', 'remix.flac', 'voice_memo.wav', 'radio_show.mp3'
  ],
  downloads: [
    'installer.exe', 'archive.zip', 'ebook.pdf', 'software.dmg', 
    'update.msi', 'dataset.csv', 'driver.exe', 'backup.tar.gz',
    'movie.mp4', 'album.zip', 'game.iso', 'firmware.bin'
  ],
  code: [
    'script.js', 'index.html', 'styles.css', 'app.py', 
    'main.cpp', 'config.json', 'server.js', 'database.sql',
    'utils.py', 'component.jsx', 'api.ts', 'Dockerfile'
  ],
  config: [
    'settings.json', 'config.yml', '.env', 'preferences.xml', 
    'options.ini', 'profile.conf', 'rules.json', 'schema.xml',
    'routes.yml', 'users.json', 'permissions.conf', 'defaults.ini'
  ],
  logs: [
    'system.log', 'error.log', 'access.log', 'debug.log', 
    'application.log', 'server.log', 'events.log', 'audit.log',
    'performance.log', 'security.log', 'network.log', 'database.log'
  ]
};

// Initialize file system with a logical structure and predefined files
export const initializeFileSystem = (): FileSystem => {
  return {
    root: {
      name: 'root',
      type: 'directory',
      content: [
        {
          name: 'home',
          type: 'directory',
          content: [
            {
              name: 'user',
              type: 'directory',
              content: [
                { 
                  name: 'documents', 
                  type: 'directory', 
                  content: FILE_POOLS.documents.slice(0, 5).map(name => ({ name, type: 'file' }))
                },
                { 
                  name: 'pictures', 
                  type: 'directory', 
                  content: FILE_POOLS.pictures.slice(0, 5).map(name => ({ name, type: 'file' }))
                },
                { 
                  name: 'videos', 
                  type: 'directory', 
                  content: FILE_POOLS.videos.slice(0, 5).map(name => ({ name, type: 'file' }))
                },
                { 
                  name: 'music', 
                  type: 'directory', 
                  content: FILE_POOLS.music.slice(0, 5).map(name => ({ name, type: 'file' }))
                },
                { 
                  name: 'downloads', 
                  type: 'directory', 
                  content: FILE_POOLS.downloads.slice(0, 5).map(name => ({ name, type: 'file' }))
                },
                { 
                  name: 'code', 
                  type: 'directory', 
                  content: FILE_POOLS.code.slice(0, 5).map(name => ({ name, type: 'file' }))
                },
                { name: 'readme.txt', type: 'file' }
              ]
            }
          ]
        },
        {
          name: 'bin',
          type: 'directory',
          content: [
            { name: 'bash', type: 'file' },
            { name: 'ls', type: 'file' },
            { name: 'cd', type: 'file' },
            { name: 'mv', type: 'file' },
            { name: 'cp', type: 'file' },
            { name: 'rm', type: 'file' }
          ]
        },
        {
          name: 'etc',
          type: 'directory',
          content: FILE_POOLS.config.slice(0, 6).map(name => ({ name, type: 'file' }))
        },
        {
          name: 'var',
          type: 'directory',
          content: [
            { 
              name: 'log', 
              type: 'directory', 
              content: FILE_POOLS.logs.slice(0, 6).map(name => ({ name, type: 'file' }))
            }
          ]
        }
      ]
    },
    currentPath: [], // Start at root
    exploredDirectories: ['/'] // Root is explored by default
  };
};

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
  textAnimationTime: 0,
  pathVariables: [],
  showPathTutorial: true,
  tabIndex: 0,
  visibleFilenames: [],
  fileSystem: initializeFileSystem()
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

// Create a directory in the file system
export const createDirectoryInFileSystem = (
  fileSystem: FileSystem,
  parentPath: string[],
  dirName: string,
  enemyId: string
): FileSystem => {
  // Clone the file system
  const newFileSystem = { ...fileSystem, root: { ...fileSystem.root } };
  
  // Navigate to the parent directory
  let current = newFileSystem.root;
  let parentDir = current;
  
  for (const dir of parentPath) {
    parentDir = current;
    const found = current.content?.find(item => 
      item.type === 'directory' && item.name === dir
    );
    
    if (found && found.type === 'directory') {
      // Clone the directory
      current = { ...found, content: [...(found.content || [])] };
      
      // Update the parent's content with the cloned directory
      const index = parentDir.content?.findIndex(item => 
        item.type === 'directory' && item.name === dir
      ) || -1;
      
      if (index !== -1 && parentDir.content) {
        parentDir.content[index] = current;
      }
    } else {
      // If directory not found, create it
      const newDir: FileSystemItem = {
        name: dir,
        type: 'directory',
        content: []
      };
      
      if (!current.content) {
        current.content = [];
      }
      
      current.content.push(newDir);
      current = newDir;
    }
  }
  
  // Create the new directory
  const newDir: FileSystemItem = {
    name: dirName,
    type: 'directory',
    content: [],
    enemyId
  };
  
  if (!current.content) {
    current.content = [];
  }
  
  current.content.push(newDir);
  
  return newFileSystem;
};

// Create a file in the file system
export const createFileInFileSystem = (
  fileSystem: FileSystem,
  parentPath: string[],
  fileName: string,
  enemyId: string
): FileSystem => {
  // Clone the file system
  const newFileSystem = { ...fileSystem, root: { ...fileSystem.root } };
  
  // Navigate to the parent directory
  let current = newFileSystem.root;
  let parentDir = current;
  
  for (const dir of parentPath) {
    parentDir = current;
    const found = current.content?.find(item => 
      item.type === 'directory' && item.name === dir
    );
    
    if (found && found.type === 'directory') {
      // Clone the directory
      current = { ...found, content: [...(found.content || [])] };
      
      // Update the parent's content with the cloned directory
      const index = parentDir.content?.findIndex(item => 
        item.type === 'directory' && item.name === dir
      ) || -1;
      
      if (index !== -1 && parentDir.content) {
        parentDir.content[index] = current;
      }
    } else {
      // If directory not found, create it
      const newDir: FileSystemItem = {
        name: dir,
        type: 'directory',
        content: []
      };
      
      if (!current.content) {
        current.content = [];
      }
      
      current.content.push(newDir);
      current = newDir;
    }
  }
  
  // Create the new file
  const newFile: FileSystemItem = {
    name: fileName,
    type: 'file',
    enemyId
  };
  
  if (!current.content) {
    current.content = [];
  }
  
  current.content.push(newFile);
  
  return newFileSystem;
};

// Get a random filename from the appropriate pool based on directory
const getFileFromPool = (dirPath: string[]): string => {
  // Default to documents if no match
  let pool = FILE_POOLS.documents;
  
  // Check the last directory in the path to determine which pool to use
  if (dirPath.length > 0) {
    const lastDir = dirPath[dirPath.length - 1].toLowerCase();
    
    if (lastDir === 'documents' || lastDir === 'docs') {
      pool = FILE_POOLS.documents;
    } else if (lastDir === 'pictures' || lastDir === 'pics' || lastDir === 'images') {
      pool = FILE_POOLS.pictures;
    } else if (lastDir === 'videos' || lastDir === 'movies') {
      pool = FILE_POOLS.videos;
    } else if (lastDir === 'music' || lastDir === 'audio') {
      pool = FILE_POOLS.music;
    } else if (lastDir === 'downloads' || lastDir === 'dl') {
      pool = FILE_POOLS.downloads;
    } else if (lastDir === 'code' || lastDir === 'src' || lastDir === 'source') {
      pool = FILE_POOLS.code;
    } else if (lastDir === 'config' || lastDir === 'conf' || lastDir === 'etc') {
      pool = FILE_POOLS.config;
    } else if (lastDir === 'log' || lastDir === 'logs' || lastDir === 'var') {
      pool = FILE_POOLS.logs;
    }
  }
  
  // Get a random file from the pool
  return pool[Math.floor(Math.random() * pool.length)];
};

// Commands that don't require a filename
const STANDALONE_COMMANDS_LIST = ['ls', 'pwd', 'clear', 'history'];

// Create a new enemy
export const createEnemy = (tier: CommandTier, isBoss: boolean = false, gameState: GameState): { enemy: Enemy, updatedFileSystem: FileSystem } => {
  const id = uuidv4();
  const x = CANVAS_WIDTH;
  
  // Calculate spawn area to avoid spawning too high
  const minY = MIN_SPAWN_HEIGHT; // Minimum distance from top
  const maxY = GAME_AREA_HEIGHT * MAX_SPAWN_HEIGHT_PERCENTAGE;
  const spawnRange = maxY - minY - (isBoss ? BOSS_HEIGHT : ENEMY_HEIGHT);
  
  // Generate y position within the restricted range
  const y = minY + Math.random() * spawnRange;
  
  // Determine command based on enemy type
  let command: Command;
  let commandSequence: Command[] | undefined;
  let currentCommandIndex: number | undefined;
  let updatedFileSystem = gameState.fileSystem;
  let filename = '';
  
  // Get the game timer in seconds
  const gameTimeSeconds = gameState.timer / 1000;
  
  if (isBoss) {
    // Boss enemies use command sequences
    commandSequence = getRandomCommandSequence(tier, 3);
    command = commandSequence[0];
    currentCommandIndex = 0;
    filename = generateRandomFilename(tier); // Use generic filename for bosses
  } else {
    // For the first 30 seconds, only spawn cd and ls commands
    if (gameTimeSeconds < 30) {
      // Get all available commands for the current tier
      const availableCommands = getCommandsByTier(tier);
      
      // Filter to only include cd and standalone commands
      const filteredCommands = availableCommands.filter(cmd => 
        cmd.command === 'cd' || STANDALONE_COMMANDS_LIST.includes(cmd.command)
      );
      
      // If no filtered commands, fall back to cd
      if (filteredCommands.length === 0) {
        command = availableCommands.find(cmd => cmd.command === 'cd') || getRandomCommand(tier);
      } else {
        // Randomly select from filtered commands
        command = filteredCommands[Math.floor(Math.random() * filteredCommands.length)];
      }
    } else {
      // After 30 seconds, use normal command selection
      command = getRandomCommand(tier);
    }
    
    // Special handling for file system commands
    if (command.command === 'cd') {
      // Create a directory in the file system
      // Choose a logical path to place the directory
      const dirOptions = [
        { path: [], name: 'projects' },
        { path: ['home'], name: 'user' },
        { path: ['home', 'user'], name: 'desktop' },
        { path: ['var'], name: 'cache' },
        { path: ['etc'], name: 'network' }
      ];
      
      const dirOption = dirOptions[Math.floor(Math.random() * dirOptions.length)];
      const dirName = dirOption.name;
      filename = dirName; // Use directory name as filename
      
      updatedFileSystem = createDirectoryInFileSystem(
        gameState.fileSystem,
        dirOption.path,
        dirName,
        id
      );
    } else if (STANDALONE_COMMANDS_LIST.includes(command.command)) {
      // For standalone commands like ls, pwd, etc.
      // No filename needed, but we'll set one for consistency
      filename = command.command;
    } else if (command.command === 'cat' || command.command === 'rm' || 
               command.command === 'cp' || command.command === 'mv') {
      // Create a file in the file system
      // Choose a logical path to place the file
      const pathOptions = [
        { path: ['home', 'user', 'documents'], type: 'documents' },
        { path: ['home', 'user', 'pictures'], type: 'pictures' },
        { path: ['home', 'user', 'videos'], type: 'videos' },
        { path: ['home', 'user', 'music'], type: 'music' },
        { path: ['home', 'user', 'downloads'], type: 'downloads' },
        { path: ['home', 'user', 'code'], type: 'code' },
        { path: ['etc'], type: 'config' },
        { path: ['var', 'log'], type: 'logs' }
      ];
      
      const pathOption = pathOptions[Math.floor(Math.random() * pathOptions.length)];
      filename = getFileFromPool(pathOption.path);
      
      updatedFileSystem = createFileInFileSystem(
        gameState.fileSystem,
        pathOption.path,
        filename,
        id
      );
    } else {
      // For other commands, just use a generic filename
      filename = generateRandomFilename(tier);
    }
  }
  
  const enemy: Enemy = {
    id,
    type: isBoss ? 'boss' : 'regular',
    command,
    commandSequence,
    currentCommandIndex,
    health: isBoss ? 100 : 1,
    maxHealth: isBoss ? 100 : 1,
    x,
    y,
    speed: isBoss ? 0.3 : 0.5 + Math.random() * 0.5, // Slower speeds
    damage: isBoss ? 20 : 10,
    width: isBoss ? BOSS_WIDTH : ENEMY_WIDTH,
    height: isBoss ? BOSS_HEIGHT : ENEMY_HEIGHT,
    isActive: true,
    isBoss,
    filename
  };
  
  return { enemy, updatedFileSystem };
};

// File system navigation functions
export const getCurrentDirectory = (fileSystem: FileSystem): FileSystemItem => {
  let current = fileSystem.root;
  
  // Navigate through the path
  for (const dir of fileSystem.currentPath) {
    const found = current.content?.find(item => 
      item.type === 'directory' && item.name === dir
    );
    
    if (found && found.type === 'directory') {
      current = found;
    } else {
      // If directory not found, return current
      break;
    }
  }
  
  return current;
};

// Get the current path as a string
export const getCurrentPathString = (fileSystem: FileSystem): string => {
  if (fileSystem.currentPath.length === 0) {
    return '/';
  }
  
  return '/' + fileSystem.currentPath.join('/');
};

// Get items in the current directory that are visible (after ls)
export const getVisibleItems = (fileSystem: FileSystem): FileSystemItem[] => {
  const currentDir = getCurrentDirectory(fileSystem);
  const currentPathStr = getCurrentPathString(fileSystem);
  
  // Check if this directory has been explored
  if (!fileSystem.exploredDirectories.includes(currentPathStr)) {
    return [];
  }
  
  return currentDir.content || [];
};

// Commands that don't require a filename
const STANDALONE_COMMANDS = ['ls', 'pwd', 'clear', 'history'];

// Check if a command matches an enemy
export const checkCommandMatch = (input: string, enemy: Enemy, gameState: GameState): boolean => {
  const trimmedInput = input.trim();
  
  // Unconditionally destroy enemies with cd, pwd, or ls commands if the corresponding command is given
  if ((enemy.command.command === 'cd' && trimmedInput.startsWith('cd ')) ||
      (enemy.command.command === 'ls' && trimmedInput === 'ls') ||
      (enemy.command.command === 'pwd' && trimmedInput === 'pwd')) {
    return true;
  }
  
  if (enemy.isBoss) {
    if (enemy.commandSequence && enemy.currentCommandIndex !== undefined) {
      const currentCommand = enemy.commandSequence[enemy.currentCommandIndex];
      
      // Check if this is a standalone command
      if (STANDALONE_COMMANDS.includes(currentCommand.command)) {
        return trimmedInput === currentCommand.command;
      }
      
      // Check for command with filename
      const commandWithFilename = `${currentCommand.command} ${enemy.filename}`;
      
      return trimmedInput === currentCommand.command || trimmedInput === commandWithFilename;
    }
    return false;
  }
  
  // Check if this is a standalone command (ls, pwd, etc.)
  if (STANDALONE_COMMANDS.includes(enemy.command.command)) {
    return trimmedInput === enemy.command.command;
  }
  
  // For regular enemies, check both plain command and command with filename
  const commandWithFilename = `${enemy.command.command} ${enemy.filename}`;
  return trimmedInput === enemy.command.command || trimmedInput === commandWithFilename;
};

// Get all visible filenames in alphabetical order
export const getVisibleFilenames = (enemies: Enemy[]): string[] => {
  return enemies
    .filter(enemy => enemy.isActive)
    .map(enemy => enemy.filename)
    .sort();
};

// Check if a command requires a path variable
export const requiresPathVariable = (command: string): boolean => {
  // Commands that typically require a destination
  const commandsRequiringPath = ['mv', 'cp'];
  
  // Check if the command starts with any of these
  return commandsRequiringPath.some(cmd => command.startsWith(cmd));
};

// Process file system commands
export const processFileSystemCommand = (input: string, gameState: GameState): GameState | null => {
  const trimmedInput = input.trim();
  const parts = trimmedInput.split(' ');
  const command = parts[0];
  
  // Handle cd command
  if (command === 'cd') {
    const targetDir = parts[1];
    
    // Handle cd with no arguments (go to root)
    if (!targetDir || targetDir === '/') {
      return {
        ...gameState,
        fileSystem: {
          ...gameState.fileSystem,
          currentPath: []
        },
        currentInput: '',
        lastCommandDescription: 'Changed directory to /',
        lastError: null
      };
    }
    
    // Handle cd .. (go up one level)
    if (targetDir === '..') {
      if (gameState.fileSystem.currentPath.length === 0) {
        return {
          ...gameState,
          currentInput: '',
          lastError: 'Already at root directory',
          lastCommandDescription: null
        };
      }
      
      const newPath = [...gameState.fileSystem.currentPath];
      newPath.pop();
      
      return {
        ...gameState,
        fileSystem: {
          ...gameState.fileSystem,
          currentPath: newPath
        },
        currentInput: '',
        lastCommandDescription: `Changed directory to ${newPath.length === 0 ? '/' : '/' + newPath.join('/')}`,
        lastError: null
      };
    }
    
    // Handle cd to a specific directory
    const currentDir = getCurrentDirectory(gameState.fileSystem);
    const dirItem = currentDir.content?.find(item => 
      item.type === 'directory' && item.name === targetDir
    );
    
    if (!dirItem) {
      return {
        ...gameState,
        currentInput: '',
        lastError: `Directory not found: ${targetDir}`,
        lastCommandDescription: null
      };
    }
    
    // Navigate to the directory
    const newPath = [...gameState.fileSystem.currentPath, targetDir];
    
    return {
      ...gameState,
      fileSystem: {
        ...gameState.fileSystem,
        currentPath: newPath
      },
      currentInput: '',
      lastCommandDescription: `Changed directory to /${newPath.join('/')}`,
      lastError: null
    };
  }
  
  // Handle ls command
  if (command === 'ls') {
    const currentPathStr = getCurrentPathString(gameState.fileSystem);
    let exploredDirectories = [...gameState.fileSystem.exploredDirectories];
    
    // Mark this directory as explored if it's not already
    if (!exploredDirectories.includes(currentPathStr)) {
      exploredDirectories.push(currentPathStr);
    }
    
    // Get the current directory
    const currentDir = getCurrentDirectory(gameState.fileSystem);
    const items = currentDir.content || [];
    
    // Format the items for display
    const itemsText = items.length === 0 
      ? 'Directory is empty' 
      : items.map(item => `${item.type === 'directory' ? 'd' : '-'} ${item.name}`).join(', ');
    
    return {
      ...gameState,
      fileSystem: {
        ...gameState.fileSystem,
        exploredDirectories
      },
      currentInput: '',
      lastCommandDescription: `Contents of ${currentPathStr}: ${itemsText}`,
      lastError: null
    };
  }
  
  // Handle pwd command
  if (command === 'pwd') {
    const currentPathStr = getCurrentPathString(gameState.fileSystem);
    
    return {
      ...gameState,
      currentInput: '',
      lastCommandDescription: `Current directory: ${currentPathStr}`,
      lastError: null
    };
  }
  
  // If not a file system command, return null
  return null;
};

// Process player input
export const processInput = (input: string, gameState: GameState): GameState => {
  const newGameState = { ...gameState };
  const trimmedInput = input.trim();
  
  // Check for turret command
  if (trimmedInput === 'turrets on' && !gameState.turretsEnabled) {
    return {
      ...newGameState,
      turretsEnabled: true,
      currentInput: '',
      lastCommandDescription: 'Activates automatic turret system to defeat regular enemies'
    };
  }
  
  if (trimmedInput === 'turrets off' && gameState.turretsEnabled) {
    return {
      ...newGameState,
      turretsEnabled: false,
      currentInput: '',
      lastCommandDescription: 'Deactivates automatic turret system'
    };
  }
  
  // Check for step-by-step directory navigation commands
  // Match patterns like "in / rmv home?" or "in /home/ rmv user?"
  const dirNavRegex = /^in\s+(\S+)\s+rmv\s+(\S+)\??$/i;
  const dirNavMatch = trimmedInput.match(dirNavRegex);
  
  if (dirNavMatch) {
    const path = dirNavMatch[1];
    const dirToNavigate = dirNavMatch[2];
    
    // Convert this to a cd command
    const cdCommand = `cd ${dirToNavigate}`;
    const fileSystemResult = processFileSystemCommand(cdCommand, gameState);
    if (fileSystemResult) {
      return fileSystemResult;
    }
  }
  
  // Check for "ls?" command
  if (trimmedInput === 'ls?' || trimmedInput === 'ls') {
    const lsCommand = 'ls';
    const fileSystemResult = processFileSystemCommand(lsCommand, gameState);
    if (fileSystemResult) {
      return fileSystemResult;
    }
  }
  
  // Check for file system commands
  const fileSystemResult = processFileSystemCommand(input, gameState);
  if (fileSystemResult) {
    return fileSystemResult;
  }
  
  // Check for PATH variable creation command (export PATH_NAME=/path)
  if (trimmedInput.startsWith('export ') && trimmedInput.includes('=')) {
    const parts = trimmedInput.substring(7).split('=');
    if (parts.length === 2) {
      const name = parts[0].trim();
      const path = parts[1].trim();
      
      // Add or update the PATH variable
      const existingPathIndex = gameState.pathVariables.findIndex(p => p.name === name);
      let updatedPathVariables = [...gameState.pathVariables];
      
      if (existingPathIndex >= 0) {
        // Update existing PATH
        updatedPathVariables[existingPathIndex] = { name, path };
      } else {
        // Add new PATH
        updatedPathVariables.push({ name, path });
      }
      
      return {
        ...newGameState,
        pathVariables: updatedPathVariables,
        showPathTutorial: false, // Hide tutorial after creating a PATH
        currentInput: '',
        lastCommandDescription: `Created PATH variable: ${name}=${path}`
      };
    }
  }
  
  // Check for commands that require a PATH variable
  if (requiresPathVariable(trimmedInput)) {
    const parts = trimmedInput.split(' ');
    if (parts.length >= 2) {
      const command = parts[0];
      const filename = parts[1];
      
      // Check if there's a destination specified
      if (parts.length < 3) {
        return {
          ...newGameState,
          currentInput: '',
          lastError: `${command} requires a destination. Use a PATH variable like $TRASH`
        };
      }
      
      const destination = parts[2];
      
      // Check if the destination is a PATH variable
      if (destination.startsWith('$')) {
        const pathName = destination.substring(1);
        const pathVariable = gameState.pathVariables.find(p => p.name === pathName);
        
        if (!pathVariable) {
          return {
            ...newGameState,
            currentInput: '',
            lastError: `PATH variable ${pathName} not found. Create it with: export ${pathName}=/path`
          };
        }
      }
    }
  }
  
  // Check for enemy matches
  let matchFound = false;
  let commandDescription: string | null = null;
  let defeatedEnemy: Enemy | undefined = undefined;
  let newParticles: Particle[] = [];
  
  const updatedEnemies = gameState.enemies.map(enemy => {
    if (!matchFound && enemy.isActive && checkCommandMatch(input, enemy, gameState)) {
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
      enemy.height,
      enemy.command.icon // Pass the command icon type for themed particles
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
  
  // Update visible filenames
  const visibleFilenames = getVisibleFilenames(updatedEnemies);
  
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
    textAnimationTime,
    visibleFilenames
  };
};

// Generate suggestions based on current input and file system
export const generateSuggestions = (input: string, tier: CommandTier, gameState?: GameState): string[] => {
  if (!input) return [];
  
  // Get all available commands based on tier
  const allCommands = [
    ...getCommandsByTier(CommandTier.BEGINNER),
    ...(tier >= CommandTier.INTERMEDIATE ? getCommandsByTier(CommandTier.INTERMEDIATE) : []),
    ...(tier >= CommandTier.ADVANCED ? getCommandsByTier(CommandTier.ADVANCED) : []),
    ...(tier >= CommandTier.PRO ? getCommandsByTier(CommandTier.PRO) : [])
  ];
  
  // Check if input is a partial command
  const commandSuggestions = allCommands
    .filter(cmd => cmd.command.startsWith(input))
    .map(cmd => cmd.command);
  
  // If we have a game state and the input starts with 'cd ' or 'ls ', suggest directories
  if (gameState && input.startsWith('cd ')) {
    const partialPath = input.substring(3).trim();
    
    // Get current directory contents
    const currentDir = getCurrentDirectory(gameState.fileSystem);
    const currentPathStr = getCurrentPathString(gameState.fileSystem);
    
    // Only suggest directories that have been explored
    if (gameState.fileSystem.exploredDirectories.includes(currentPathStr)) {
      const dirSuggestions = currentDir.content
        ?.filter(item => 
          item.type === 'directory' && 
          item.name.startsWith(partialPath)
        )
        .map(item => `cd ${item.name}`) || [];
      
      // Add cd .. suggestion if we're not at root
      if (gameState.fileSystem.currentPath.length > 0 && '..'.startsWith(partialPath)) {
        dirSuggestions.unshift('cd ..');
      }
      
      // Add cd / suggestion if we're not at root
      if (gameState.fileSystem.currentPath.length > 0 && '/'.startsWith(partialPath)) {
        dirSuggestions.unshift('cd /');
      }
      
      return [...dirSuggestions, ...commandSuggestions].slice(0, 4);
    }
  }
  
  return commandSuggestions.slice(0, 4);
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

// Command-specific particle effects
export const COMMAND_PARTICLE_EFFECTS = {
  // Movement commands (cd)
  move: {
    count: 20,
    color: '#89b4fa', // Blue
    size: [2, 5],
    speed: [1, 3],
    pattern: 'directional', // Particles move in the direction of the command (left to right)
    gravity: -0.5
  },
  
  // List commands (ls)
  list: {
    count: 30,
    color: '#a6e3a1', // Green
    size: [1, 3],
    speed: [0.5, 2],
    pattern: 'expand', // Particles expand outward in all directions
    gravity: 0
  },
  
  // Print commands (echo, cat, pwd)
  print: {
    count: 25,
    color: '#cdd6f4', // White/light gray
    size: [1, 4],
    speed: [1, 2],
    pattern: 'cascade', // Particles cascade downward like text
    gravity: 0.2
  },
  
  // Create commands (mkdir, touch)
  create: {
    count: 35,
    color: '#f9e2af', // Yellow
    size: [2, 4],
    speed: [1, 3],
    pattern: 'burst', // Particles burst outward from center
    gravity: -0.1
  },
  
  // Delete commands (rm)
  delete: {
    count: 40,
    color: '#f38ba8', // Red
    size: [2, 5],
    speed: [2, 4],
    pattern: 'implode', // Particles move inward and then disappear
    gravity: 0.3
  },
  
  // Copy commands (cp)
  copy: {
    count: 30,
    color: '#89dceb', // Cyan
    size: [2, 4],
    speed: [1, 2.5],
    pattern: 'duplicate', // Particles split and duplicate
    gravity: 0
  },
  
  // Rename/move commands (mv)
  rename: {
    count: 25,
    color: '#cba6f7', // Purple
    size: [2, 4],
    speed: [1, 3],
    pattern: 'transform', // Particles transform shape
    gravity: 0.1
  },
  
  // Default for other commands
  default: {
    count: 30,
    color: 'random', // Random colors from palette
    size: [2, 4],
    speed: [1, 3],
    pattern: 'fountain', // Standard fountain effect
    gravity: 0.1
  }
};

// Create particles for an explosion effect based on command type
export const createExplosion = (x: number, y: number, width: number, height: number, iconType?: string): Particle[] => {
  const particles: Particle[] = [];
  
  // Get particle effect settings based on command type
  const effectType = iconType || 'default';
  const effect = COMMAND_PARTICLE_EFFECTS[effectType as keyof typeof COMMAND_PARTICLE_EFFECTS] || COMMAND_PARTICLE_EFFECTS.default;
  
  // Determine particle count
  const particleCount = effect.count;
  
  for (let i = 0; i < particleCount; i++) {
    // Initial position (may be modified by pattern)
    let particleX = x + width / 2; // Start from center for most patterns
    let particleY = y + height / 2;
    
    // Determine velocity based on pattern
    let vx = 0;
    let vy = 0;
    
    switch (effect.pattern) {
      case 'directional':
        // Particles move primarily rightward (like cd command)
        vx = effect.speed[0] + Math.random() * (effect.speed[1] - effect.speed[0]);
        vy = (Math.random() - 0.5) * effect.speed[1];
        break;
        
      case 'expand':
        // Particles expand in all directions (like ls command)
        {
          const angle = Math.random() * Math.PI * 2;
          const speed = effect.speed[0] + Math.random() * (effect.speed[1] - effect.speed[0]);
          vx = Math.cos(angle) * speed;
          vy = Math.sin(angle) * speed;
        }
        break;
        
      case 'cascade':
        // Particles cascade downward (like print commands)
        vx = (Math.random() - 0.5) * effect.speed[1];
        vy = effect.speed[0] + Math.random() * (effect.speed[1] - effect.speed[0]);
        break;
        
      case 'burst':
        // Particles burst outward from center (like create commands)
        {
          const angle = Math.random() * Math.PI * 2;
          const speed = effect.speed[0] + Math.random() * (effect.speed[1] - effect.speed[0]);
          vx = Math.cos(angle) * speed;
          vy = Math.sin(angle) * speed;
        }
        break;
        
      case 'implode':
        // Particles move inward (like delete commands)
        {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * width / 2;
          particleX = x + width / 2 + Math.cos(angle) * distance;
          particleY = y + height / 2 + Math.sin(angle) * distance;
          vx = -Math.cos(angle) * effect.speed[0];
          vy = -Math.sin(angle) * effect.speed[0];
        }
        break;
        
      case 'duplicate':
        // Particles split and duplicate (like copy commands)
        {
          const angle = Math.random() * Math.PI * 2;
          const speed = effect.speed[0] + Math.random() * (effect.speed[1] - effect.speed[0]);
          vx = Math.cos(angle) * speed;
          vy = Math.sin(angle) * speed;
          // For duplicate effect, we'll create particles in pairs
          if (i % 2 === 0) {
            particleX = x + Math.random() * width;
            particleY = y + Math.random() * height;
          }
        }
        break;
        
      case 'transform':
        // Particles transform (like rename/move commands)
        {
          const angle = Math.random() * Math.PI * 2;
          const speed = effect.speed[0] + Math.random() * (effect.speed[1] - effect.speed[0]);
          vx = Math.cos(angle) * speed;
          vy = Math.sin(angle) * speed;
        }
        break;
        
      case 'fountain':
      default:
        // Standard fountain effect (default)
        {
          const angle = Math.random() * Math.PI * 2;
          const speed = effect.speed[0] + Math.random() * (effect.speed[1] - effect.speed[0]);
          vx = Math.cos(angle) * speed;
          vy = Math.sin(angle) * speed - 2; // Upward bias
        }
        break;
    }
    
    // Determine color
    let color;
    if (effect.color === 'random') {
      color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
    } else {
      color = effect.color;
    }
    
    // Random size within range
    const size = effect.size[0] + Math.random() * (effect.size[1] - effect.size[0]);
    
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
      maxLife: life,
      gravity: effect.gravity
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
