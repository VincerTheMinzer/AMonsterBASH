import { Command, CommandTier } from '../types';

// Command icons
export const COMMAND_ICONS = {
  MOVE: 'move',           // For cd
  LIST: 'list',           // For ls
  PRINT: 'print',         // For pwd, echo, cat
  CREATE: 'create',       // For mkdir, touch
  DELETE: 'delete',       // For rm
  COPY: 'copy',           // For cp
  RENAME: 'rename',       // For mv
  SEARCH: 'search',       // For grep, find
  PERMISSION: 'permission', // For chmod, chown
  VIEW: 'view',           // For tail, head
  TRANSFORM: 'transform', // For sed, awk
  ARCHIVE: 'archive',     // For tar
  PIPE: 'pipe',           // For piped commands
  ADVANCED: 'advanced'    // For other complex commands
};

export const COMMANDS: Command[] = [
  // Beginner Tier
  { command: 'cd', description: 'Change directory', tier: CommandTier.BEGINNER, icon: COMMAND_ICONS.MOVE },
  { command: 'ls', description: 'List directory contents', tier: CommandTier.BEGINNER, icon: COMMAND_ICONS.LIST },
  { command: 'pwd', description: 'Print working directory', tier: CommandTier.BEGINNER, icon: COMMAND_ICONS.PRINT },
  { command: 'echo', description: 'Display a line of text', tier: CommandTier.BEGINNER, icon: COMMAND_ICONS.PRINT },
  { command: 'cat', description: 'Concatenate files and print on the standard output', tier: CommandTier.BEGINNER, icon: COMMAND_ICONS.PRINT },
  
  // Intermediate Tier
  { command: 'mkdir', description: 'Make directories', tier: CommandTier.INTERMEDIATE, icon: COMMAND_ICONS.CREATE },
  { command: 'rm', description: 'Remove files or directories', tier: CommandTier.INTERMEDIATE, icon: COMMAND_ICONS.DELETE },
  { command: 'cp', description: 'Copy files and directories', tier: CommandTier.INTERMEDIATE, icon: COMMAND_ICONS.COPY },
  { command: 'mv', description: 'Move (rename) files', tier: CommandTier.INTERMEDIATE, icon: COMMAND_ICONS.RENAME },
  { command: 'grep', description: 'Print lines that match patterns', tier: CommandTier.INTERMEDIATE, icon: COMMAND_ICONS.SEARCH },
  { command: 'touch', description: 'Change file timestamps', tier: CommandTier.INTERMEDIATE, icon: COMMAND_ICONS.CREATE },
  
  // Advanced Tier
  { command: 'chmod', description: 'Change file mode bits', tier: CommandTier.ADVANCED, icon: COMMAND_ICONS.PERMISSION },
  { command: 'chown', description: 'Change file owner and group', tier: CommandTier.ADVANCED, icon: COMMAND_ICONS.PERMISSION },
  { command: 'find', description: 'Search for files in a directory hierarchy', tier: CommandTier.ADVANCED, icon: COMMAND_ICONS.SEARCH },
  { command: 'tail', description: 'Output the last part of files', tier: CommandTier.ADVANCED, icon: COMMAND_ICONS.VIEW },
  { command: 'head', description: 'Output the first part of files', tier: CommandTier.ADVANCED, icon: COMMAND_ICONS.VIEW },
  { command: 'sed', description: 'Stream editor for filtering and transforming text', tier: CommandTier.ADVANCED, icon: COMMAND_ICONS.TRANSFORM },
  
  // Pro Tier
  { command: 'ls | grep', description: 'Pipe ls output to grep', tier: CommandTier.PRO, icon: COMMAND_ICONS.PIPE },
  { command: 'find . -name', description: 'Find files by name', tier: CommandTier.PRO, icon: COMMAND_ICONS.SEARCH },
  { command: 'awk', description: 'Pattern scanning and processing language', tier: CommandTier.PRO, icon: COMMAND_ICONS.TRANSFORM },
  { command: 'xargs', description: 'Build and execute command lines from standard input', tier: CommandTier.PRO, icon: COMMAND_ICONS.ADVANCED },
  { command: 'tar', description: 'Tape archiver', tier: CommandTier.PRO, icon: COMMAND_ICONS.ARCHIVE },
];

export const getCommandsByTier = (tier: CommandTier): Command[] => {
  return COMMANDS.filter(command => command.tier === tier);
};

export const getRandomCommand = (tier: CommandTier): Command => {
  const commands = getCommandsByTier(tier);
  return commands[Math.floor(Math.random() * commands.length)];
};

export const getRandomCommandSequence = (tier: CommandTier, length: number): Command[] => {
  const commands = getCommandsByTier(tier);
  const sequence: Command[] = [];
  
  for (let i = 0; i < length; i++) {
    sequence.push(commands[Math.floor(Math.random() * commands.length)]);
  }
  
  return sequence;
};
