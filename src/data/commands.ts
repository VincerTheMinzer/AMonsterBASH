import { Command, CommandTier } from '../types';

export const COMMANDS: Command[] = [
  // Beginner Tier
  { command: 'cd', description: 'Change directory', tier: CommandTier.BEGINNER },
  { command: 'ls', description: 'List directory contents', tier: CommandTier.BEGINNER },
  { command: 'pwd', description: 'Print working directory', tier: CommandTier.BEGINNER },
  { command: 'echo', description: 'Display a line of text', tier: CommandTier.BEGINNER },
  { command: 'cat', description: 'Concatenate files and print on the standard output', tier: CommandTier.BEGINNER },
  
  // Intermediate Tier
  { command: 'mkdir', description: 'Make directories', tier: CommandTier.INTERMEDIATE },
  { command: 'rm', description: 'Remove files or directories', tier: CommandTier.INTERMEDIATE },
  { command: 'cp', description: 'Copy files and directories', tier: CommandTier.INTERMEDIATE },
  { command: 'mv', description: 'Move (rename) files', tier: CommandTier.INTERMEDIATE },
  { command: 'grep', description: 'Print lines that match patterns', tier: CommandTier.INTERMEDIATE },
  { command: 'touch', description: 'Change file timestamps', tier: CommandTier.INTERMEDIATE },
  
  // Advanced Tier
  { command: 'chmod', description: 'Change file mode bits', tier: CommandTier.ADVANCED },
  { command: 'chown', description: 'Change file owner and group', tier: CommandTier.ADVANCED },
  { command: 'find', description: 'Search for files in a directory hierarchy', tier: CommandTier.ADVANCED },
  { command: 'tail', description: 'Output the last part of files', tier: CommandTier.ADVANCED },
  { command: 'head', description: 'Output the first part of files', tier: CommandTier.ADVANCED },
  { command: 'sed', description: 'Stream editor for filtering and transforming text', tier: CommandTier.ADVANCED },
  
  // Pro Tier
  { command: 'ls | grep', description: 'Pipe ls output to grep', tier: CommandTier.PRO },
  { command: 'find . -name', description: 'Find files by name', tier: CommandTier.PRO },
  { command: 'awk', description: 'Pattern scanning and processing language', tier: CommandTier.PRO },
  { command: 'xargs', description: 'Build and execute command lines from standard input', tier: CommandTier.PRO },
  { command: 'tar', description: 'Tape archiver', tier: CommandTier.PRO },
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
