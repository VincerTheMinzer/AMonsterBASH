import React, { useRef, useEffect, useState } from 'react';
import { GameState, Enemy, FileSystemItem } from '../types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  CONSOLE_HEIGHT, 
  GAME_AREA_HEIGHT, 
  formatTime, 
  getCurrentDirectory,
  getCurrentPathString,
  getVisibleItems
} from '../utils/gameUtils';
import { drawCommandIcon } from '../utils/iconUtils';
import { getSpriteCoordinates } from '../utils/spriteUtils';

interface GameCanvasProps {
  gameState: GameState;
  onCanvasClick: () => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, onCanvasClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spriteImage, setSpriteImage] = useState<HTMLImageElement | null>(null);
  
  // Load sprite sheet
  useEffect(() => {
    const img = new Image();
    img.src = 'guycoding.png';
    img.onload = () => {
      setSpriteImage(img);
      
      // Calculate frame dimensions once the image is loaded
      if (gameState.player.spriteAnimation.frameWidth === 0) {
        const frameWidth = img.width / 3;  // 3 columns
        const frameHeight = img.height / 3; // 3 rows
        
        // Update player sprite animation with frame dimensions
        gameState.player.spriteAnimation.frameWidth = frameWidth;
        gameState.player.spriteAnimation.frameHeight = frameHeight;
      }
    };
  }, []);

  // Draw the game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background
    ctx.fillStyle = '#1e1e2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, GAME_AREA_HEIGHT);

    // Draw console background
    ctx.fillStyle = '#11111b';
    ctx.fillRect(0, GAME_AREA_HEIGHT, CANVAS_WIDTH, CONSOLE_HEIGHT);

    // If game not started, only draw the background
    if (!gameState.isStarted) {
      return;
    }

    // Draw player
    if (spriteImage && gameState.player.spriteAnimation.frameWidth > 0) {
      // Get sprite coordinates based on current sprite index
      const { sourceX, sourceY } = getSpriteCoordinates(
        gameState.player.spriteAnimation.spriteIndex,
        gameState.player.spriteAnimation.frameWidth,
        gameState.player.spriteAnimation.frameHeight
      );
      
      // Draw the sprite
      ctx.drawImage(
        spriteImage,
        sourceX,
        sourceY,
        gameState.player.spriteAnimation.frameWidth,
        gameState.player.spriteAnimation.frameHeight,
        gameState.player.x,
        gameState.player.y,
        gameState.player.width,
        gameState.player.height
      );
    } else {
      // Fallback to rectangle if sprite not loaded
      ctx.fillStyle = '#89b4fa';
      ctx.fillRect(
        gameState.player.x,
        gameState.player.y,
        gameState.player.width,
        gameState.player.height
      );
    }

    // Draw player health bar
    const healthBarWidth = 200;
    const healthBarHeight = 10;
    const healthBarX = (CANVAS_WIDTH - healthBarWidth) / 2;
    const healthBarY = GAME_AREA_HEIGHT - 20;

    // Health bar background
    ctx.fillStyle = '#313244';
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

    // Health bar fill
    const healthPercentage = gameState.player.health / gameState.player.maxHealth;
    ctx.fillStyle = healthPercentage > 0.6 ? '#a6e3a1' : healthPercentage > 0.3 ? '#f9e2af' : '#f38ba8';
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);

    // Draw enemies
    gameState.enemies.forEach(enemy => {
      if (!enemy.isActive) return;

      // Common padding for text backgrounds
      const padding = 4;
      
      // Draw enemy with command icon
      const iconColor = enemy.isBoss ? '#f38ba8' : '#f9e2af';
      
      // Draw background rectangle
      ctx.fillStyle = iconColor;
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      
      // Find the enemy's location in the file system
      const findEnemyLocation = (item: FileSystemItem, path: string[]): { path: string, parentFolder: string } | null => {
        if (item.enemyId === enemy.id) {
          return {
            path: path.length === 0 ? '/' : '/' + path.join('/'),
            parentFolder: path.length > 0 ? path[path.length - 1] : ''
          };
        }
        
        if (item.type === 'directory' && item.content) {
          for (const child of item.content) {
            const newPath = item.name === 'root' ? path : [...path, item.name];
            const result = findEnemyLocation(child, newPath);
            if (result) return result;
          }
        }
        return null;
      };
      
      // Get enemy location
      const enemyLocation = findEnemyLocation(gameState.fileSystem.root, []) || { path: '', parentFolder: '' };
      const currentPath = getCurrentPathString(gameState.fileSystem);
      
      // If we found a path and the directory has been explored, show it above the enemy
      if (enemyLocation.path && gameState.fileSystem.exploredDirectories.includes(enemyLocation.path)) {
        ctx.font = '10px monospace';
        ctx.fillStyle = '#a6e3a1';
        ctx.textAlign = 'center';
        ctx.fillText(
          `In: ${enemyLocation.path}`,
          enemy.x + enemy.width / 2,
          enemy.y - 45
        );
      }
      
      // Draw command icon if available
      if (enemy.command.icon) {
        drawCommandIcon(
          ctx,
          enemy.x,
          enemy.y,
          enemy.width,
          enemy.height,
          enemy.command.icon,
          enemy.isBoss ? '#1e1e2e' : '#1e1e2e' // Dark color for contrast
        );
      }

      // Check if this enemy is the current target
      const isTargetEnemy = gameState.targetEnemy && gameState.targetEnemy.id === enemy.id;
      const currentInput = gameState.currentInput;
      
      // Draw command text above enemy
      const commandText = enemy.command.command;
      
      // Determine font size with animation for target enemy
      let fontSize = enemy.isBoss ? 16 : 14;
      if (isTargetEnemy) {
        // Pulse animation based on textAnimationTime
        const pulse = Math.sin(gameState.textAnimationTime / 100) * 2;
        fontSize += pulse;
        
        // Draw tab completion indicator
        ctx.font = '10px monospace';
        ctx.fillStyle = '#a6e3a1';
        ctx.textAlign = 'center';
        
        // If input exactly matches the command, show that tab will add filename
        if (currentInput === commandText) {
          ctx.fillText(
            '[TAB] to add filename',
            enemy.x + enemy.width / 2,
            enemy.y - 35
          );
        } else {
          ctx.fillText(
            '[TAB] to complete',
            enemy.x + enemy.width / 2,
            enemy.y - 35
          );
        }
      }
      
      // Draw command text
      ctx.font = `${enemy.isBoss ? 'bold' : ''} ${fontSize}px monospace`;
      ctx.textAlign = 'center';
      
      // Measure command text width for background
      const commandWidth = ctx.measureText(commandText).width;
      
      // Draw command text background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(
        enemy.x + enemy.width / 2 - commandWidth / 2 - padding,
        enemy.y - 25 - padding,
        commandWidth + padding * 2,
        20
      );
      
      // For target enemy, highlight the matched part of the command
      if (isTargetEnemy && currentInput.length > 0) {
        // Draw the matched part with highlight
        const matchedText = commandText.substring(0, currentInput.length);
        const remainingText = commandText.substring(currentInput.length);
        
        // Calculate positions
        const matchedWidth = ctx.measureText(matchedText).width;
        const fullWidth = ctx.measureText(commandText).width;
        const startX = enemy.x + enemy.width / 2 - fullWidth / 2;
        
        // Draw matched part with highlight color
        ctx.fillStyle = '#a6e3a1'; // Highlight color
        ctx.textAlign = 'left';
        ctx.fillText(matchedText, startX, enemy.y - 15);
        
        // Draw remaining part with normal color
        ctx.fillStyle = enemy.isBoss ? '#f9e2af' : '#cdd6f4';
        ctx.fillText(remainingText, startX + matchedWidth, enemy.y - 15);
      } else {
        // Draw normal command text
        ctx.fillStyle = enemy.isBoss ? '#f9e2af' : '#cdd6f4';
        ctx.textAlign = 'center';
        ctx.fillText(commandText, enemy.x + enemy.width / 2, enemy.y - 15);
      }
      
      // Check if this is a standalone command (like ls, pwd)
      const STANDALONE_COMMANDS = ['ls', 'pwd', 'clear', 'history'];
      const isStandaloneCommand = STANDALONE_COMMANDS.includes(enemy.command.command);
      
      // Determine what to display below the enemy
      let displayText = '';
      let textColor = '#ffffff'; // Default white for files
      
      if (isStandaloneCommand) {
        // For standalone commands, just show the command itself
        displayText = enemy.command.command;
        textColor = '#ffffff'; // White for command
      } else {
        // For commands that need a filename, determine what to show based on location
        // Check if the enemy is in the current directory and if it's been explored
        const isInCurrentDir = enemyLocation.path === currentPath;
        const isCurrentDirExplored = gameState.fileSystem.exploredDirectories.includes(currentPath);
        
        if (isInCurrentDir && isCurrentDirExplored) {
          // If in current directory and it's been explored, show filename
          displayText = enemy.filename;
          textColor = '#ffffff'; // White for files
        } else if (enemyLocation.path) {
          // If not in current directory, show step-by-step directory tree
          // Parse the path into components
          const pathParts = enemyLocation.path.split('/').filter(part => part !== '');
          const currentPathParts = currentPath.split('/').filter(part => part !== '');
          
          // Find the first divergent directory
          let divergentIndex = 0;
          while (divergentIndex < currentPathParts.length && 
                 divergentIndex < pathParts.length && 
                 currentPathParts[divergentIndex] === pathParts[divergentIndex]) {
            divergentIndex++;
          }
          
          // If we're at root and need to go to a top-level directory
          if (currentPathParts.length === 0 && pathParts.length > 0) {
            displayText = `in / rmv ${pathParts[0]}?`;
            textColor = '#f38ba8'; // Red for navigation command
          } 
          // If we need to navigate up and then down
          else if (divergentIndex < currentPathParts.length) {
            // Need to go up first
            displayText = 'cd ..';
            textColor = '#f38ba8'; // Red for cd command
          }
          // If we need to navigate down the tree
          else if (divergentIndex < pathParts.length) {
            // Construct the current path string up to the divergent point
            const currentSubPath = divergentIndex === 0 ? '/' : 
                                  '/' + pathParts.slice(0, divergentIndex).join('/') + '/';
            
            // Show the next directory to navigate to
            displayText = `in ${currentSubPath} rmv ${pathParts[divergentIndex]}?`;
            textColor = '#f38ba8'; // Red for navigation command
          }
          // If we're in the correct directory but haven't used ls yet
          else {
            displayText = 'ls?';
            textColor = '#f38ba8'; // Red for ls command
          }
        }
      }
      
      // Draw text below the enemy
      ctx.font = `12px monospace`;
      ctx.textAlign = 'center';
      
      // Measure display text width for background
      const displayWidth = ctx.measureText(displayText).width;
      
      // Check if this enemy's filename is being targeted by the current input
      const isFilenameTargeted = gameState.currentInput.includes(enemy.filename);
      
      // Draw text background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(
        enemy.x + enemy.width / 2 - displayWidth / 2 - padding,
        enemy.y + enemy.height + 5 - padding,
        displayWidth + padding * 2,
        20
      );
      
      // Draw text with appropriate color
      ctx.fillStyle = isFilenameTargeted ? '#a6e3a1' : textColor;
      ctx.fillText(
        displayText,
        enemy.x + enemy.width / 2,
        enemy.y + enemy.height + 15
      );
      
      // Draw corners around the text if it's targeted
      if (isFilenameTargeted) {
        const cornerSize = 5;
        const cornerX1 = enemy.x + enemy.width / 2 - displayWidth / 2 - padding;
        const cornerX2 = enemy.x + enemy.width / 2 + displayWidth / 2 + padding;
        const cornerY1 = enemy.y + enemy.height + 5 - padding;
        const cornerY2 = enemy.y + enemy.height + 5 + 20;
        
        ctx.strokeStyle = '#a6e3a1'; // Green color for corners
        ctx.lineWidth = 2;
        
        // Top-left corner
        ctx.beginPath();
        ctx.moveTo(cornerX1, cornerY1 + cornerSize);
        ctx.lineTo(cornerX1, cornerY1);
        ctx.lineTo(cornerX1 + cornerSize, cornerY1);
        ctx.stroke();
        
        // Top-right corner
        ctx.beginPath();
        ctx.moveTo(cornerX2 - cornerSize, cornerY1);
        ctx.lineTo(cornerX2, cornerY1);
        ctx.lineTo(cornerX2, cornerY1 + cornerSize);
        ctx.stroke();
        
        // Bottom-left corner
        ctx.beginPath();
        ctx.moveTo(cornerX1, cornerY2 - cornerSize);
        ctx.lineTo(cornerX1, cornerY2);
        ctx.lineTo(cornerX1 + cornerSize, cornerY2);
        ctx.stroke();
        
        // Bottom-right corner
        ctx.beginPath();
        ctx.moveTo(cornerX2 - cornerSize, cornerY2);
        ctx.lineTo(cornerX2, cornerY2);
        ctx.lineTo(cornerX2, cornerY2 - cornerSize);
        ctx.stroke();
      }

      // Draw boss health bar if it's a boss
      if (enemy.isBoss) {
        const bossHealthBarWidth = enemy.width;
        const bossHealthBarHeight = 5;
        const bossHealthBarX = enemy.x;
        const bossHealthBarY = enemy.y - 25;

        // Boss health bar background
        ctx.fillStyle = '#313244';
        ctx.fillRect(bossHealthBarX, bossHealthBarY, bossHealthBarWidth, bossHealthBarHeight);

        // Boss health bar fill
        const bossHealthPercentage = enemy.health / enemy.maxHealth;
        ctx.fillStyle = '#f38ba8';
        ctx.fillRect(
          bossHealthBarX,
          bossHealthBarY,
          bossHealthBarWidth * bossHealthPercentage,
          bossHealthBarHeight
        );

        // Draw command sequence for boss with improved readability
        if (enemy.commandSequence && enemy.currentCommandIndex !== undefined) {
          ctx.font = '12px monospace';
          
          enemy.commandSequence.forEach((cmd, index) => {
            const isCompleted = index < enemy.currentCommandIndex!;
            const isCurrent = index === enemy.currentCommandIndex;
            const sequenceText = cmd.command;
            
            // Calculate position for each command in sequence
            const yOffset = enemy.y - 40 - (enemy.commandSequence!.length - 1 - index) * 25;
            
            // Measure text width for background
            const seqWidth = ctx.measureText(sequenceText).width;
            
            // Draw text background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(
              enemy.x + enemy.width / 2 - seqWidth / 2 - padding,
              yOffset - 10 - padding,
              seqWidth + padding * 2,
              20
            );
            
            // Draw command text with appropriate color
            ctx.fillStyle = isCompleted ? '#a6e3a1' : isCurrent ? '#f9e2af' : '#6c7086';
            ctx.fillText(
              sequenceText,
              enemy.x + enemy.width / 2,
              yOffset
            );
          });
        }
      }
    });

    // Draw folder tree on the right side of the game area
    const drawFolderTree = () => {
      const treeWidth = 200;
      const treeX = CANVAS_WIDTH - treeWidth - 10;
      const treeY = 70;
      const treeHeight = GAME_AREA_HEIGHT - 100;
      
      // Draw tree background
      ctx.fillStyle = 'rgba(17, 17, 27, 0.8)';
      ctx.fillRect(treeX, treeY, treeWidth, treeHeight);
      
      // Draw tree border
      ctx.strokeStyle = '#313244';
      ctx.lineWidth = 2;
      ctx.strokeRect(treeX, treeY, treeWidth, treeHeight);
      
      // Draw tree title
      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = '#cdd6f4';
      ctx.textAlign = 'center';
      ctx.fillText('File Explorer', treeX + treeWidth / 2, treeY + 20);
      
      // Draw current path
      const currentPath = getCurrentPathString(gameState.fileSystem);
      ctx.font = '12px monospace';
      ctx.fillStyle = '#89b4fa';
      ctx.textAlign = 'left';
      ctx.fillText(`Path: ${currentPath}`, treeX + 10, treeY + 40);
      
      // Draw folder contents
      const visibleItems = getVisibleItems(gameState.fileSystem);
      const itemHeight = 20;
      const startY = treeY + 60;
      
      // If directory hasn't been explored yet, show a message
      if (visibleItems.length === 0) {
        const currentPathStr = getCurrentPathString(gameState.fileSystem);
        if (!gameState.fileSystem.exploredDirectories.includes(currentPathStr)) {
          ctx.fillStyle = '#f9e2af';
          ctx.textAlign = 'center';
          ctx.fillText(
            'Use "ls" to view contents',
            treeX + treeWidth / 2,
            startY + 20
          );
        } else {
          ctx.fillStyle = '#cdd6f4';
          ctx.textAlign = 'center';
          ctx.fillText(
            'Directory is empty',
            treeX + treeWidth / 2,
            startY + 20
          );
        }
      } else {
        // Draw each item
        visibleItems.forEach((item, index) => {
          const itemY = startY + index * itemHeight;
          
          // Determine item color based on type and status
          let iconColor = '#ffffff'; // Default white for files
          let textColor = '#ffffff'; // Default white for files
          
          if (item.type === 'directory') {
            // Check if directory has been visited
            const dirPath = currentPath + (currentPath.endsWith('/') ? '' : '/') + item.name;
            const isVisited = gameState.fileSystem.exploredDirectories.includes(dirPath);
            
            // Check if directory has new files (enemies associated with it)
            const hasNewFiles = gameState.enemies.some(enemy => {
              // Find the enemy's location
              const findEnemyLocation = (fsItem: FileSystemItem, path: string[]): boolean => {
                if (fsItem.enemyId === enemy.id) {
                  const enemyPath = path.length === 0 ? '/' : '/' + path.join('/');
                  return enemyPath === dirPath;
                }
                
                if (fsItem.type === 'directory' && fsItem.content) {
                  for (const child of fsItem.content) {
                    const newPath = fsItem.name === 'root' ? path : [...path, fsItem.name];
                    if (findEnemyLocation(child, newPath)) {
                      return true;
                    }
                  }
                }
                return false;
              };
              
              return enemy.isActive && findEnemyLocation(gameState.fileSystem.root, []);
            });
            
            // Set color based on status
            if (isVisited) {
              iconColor = hasNewFiles ? '#f9e2af' : '#a6e3a1'; // Orange if has new files, green if not
            } else {
              iconColor = '#89b4fa'; // Blue if unvisited
            }
          }
          
          // Draw item icon
          ctx.fillStyle = item.type === 'directory' ? iconColor : '#ffffff';
          ctx.fillRect(treeX + 10, itemY, 10, 10);
          
          // Draw item name
          ctx.fillStyle = item.type === 'directory' ? iconColor : '#ffffff';
          ctx.textAlign = 'left';
          ctx.fillText(
            item.name,
            treeX + 30,
            itemY + 10
          );
          
          // If this item has an associated enemy, highlight it
          if (item.enemyId) {
            const enemy = gameState.enemies.find(e => e.id === item.enemyId && e.isActive);
            if (enemy) {
              // Draw a connecting line to the enemy
              ctx.strokeStyle = iconColor;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(treeX, itemY + 5);
              ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height / 2);
              ctx.stroke();
              
              // Draw a highlight around the item
              ctx.strokeStyle = iconColor;
              ctx.lineWidth = 2;
              ctx.strokeRect(treeX + 5, itemY - 5, treeWidth - 10, itemHeight);
              
              // Draw a label above the enemy indicating its folder location
              const folderPath = getCurrentPathString(gameState.fileSystem);
              ctx.font = '10px monospace';
              ctx.fillStyle = '#a6e3a1';
              ctx.textAlign = 'center';
              ctx.fillText(
                `In: ${folderPath}`,
                enemy.x + enemy.width / 2,
                enemy.y - 45
              );
            }
          }
        });
      }
    };
    
    // Draw the folder tree
    drawFolderTree();
    
    // Draw score and timer
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#cdd6f4';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${gameState.score}`, 20, 30);
    
    ctx.textAlign = 'right';
    ctx.fillText(`Time: ${formatTime(gameState.timer)}`, CANVAS_WIDTH - 220, 30);

    // Draw current tier
    ctx.textAlign = 'center';
    ctx.fillText(`Tier: ${gameState.currentTier}`, CANVAS_WIDTH / 2, 30);

    // Draw turret status if enabled
    if (gameState.turretsEnabled) {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#a6e3a1';
      ctx.fillText('Turrets: ACTIVE', 20, 60);
    }

    // Draw PATH tutorial if needed
    if (gameState.showPathTutorial) {
      ctx.font = '14px monospace';
      ctx.fillStyle = '#f9e2af';
      ctx.textAlign = 'right';
      ctx.fillText(
        'Create a PATH variable for trash: export TRASH=/trash',
        CANVAS_WIDTH - 20,
        GAME_AREA_HEIGHT - 60
      );
      ctx.fillText(
        'Then use it with: mv filename.txt $TRASH',
        CANVAS_WIDTH - 20,
        GAME_AREA_HEIGHT - 40
      );
    } else if (gameState.pathVariables.length > 0) {
      // Draw PATH variables
      ctx.font = '14px monospace';
      ctx.fillStyle = '#a6e3a1';
      ctx.textAlign = 'right';
      
      gameState.pathVariables.forEach((pathVar, index) => {
        ctx.fillText(
          `${pathVar.name}=${pathVar.path}`,
          CANVAS_WIDTH - 20,
          GAME_AREA_HEIGHT - 60 + index * 20
        );
      });
    }
    
    // Draw console input
    ctx.font = '16px monospace';
    ctx.fillStyle = '#cdd6f4';
    ctx.textAlign = 'left';
    ctx.fillText('$ ' + gameState.currentInput, 20, GAME_AREA_HEIGHT + 30);

    // Draw error message if any
    if (gameState.lastError) {
      ctx.fillStyle = '#f38ba8';
      ctx.fillText(gameState.lastError, 20, GAME_AREA_HEIGHT + 60);
    }

    // Draw suggestions
    if (gameState.suggestions.length > 0) {
      ctx.fillStyle = '#bac2de';
      gameState.suggestions.forEach((suggestion, index) => {
        ctx.fillText(
          suggestion,
          20,
          GAME_AREA_HEIGHT + 90 + index * 20
        );
      });
    }
    
    // Draw tab cycling info if there are visible filenames
    if (gameState.visibleFilenames.length > 0 && gameState.currentInput.includes(' ')) {
      ctx.font = '14px monospace';
      ctx.fillStyle = '#89b4fa';
      ctx.textAlign = 'right';
      ctx.fillText(
        'Press TAB to cycle through filenames',
        CANVAS_WIDTH - 20,
        GAME_AREA_HEIGHT + 30
      );
    }
    
    // Draw command description at the bottom of the console
    if (gameState.lastCommandDescription) {
      ctx.font = '14px monospace';
      ctx.fillStyle = '#a6e3a1';
      ctx.textAlign = 'left';
      ctx.fillText(
        `Info: ${gameState.lastCommandDescription}`,
        20,
        CANVAS_HEIGHT - 20
      );
    }

    // Draw game over screen
    if (gameState.isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.font = 'bold 32px monospace';
      ctx.fillStyle = '#f38ba8';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

      ctx.font = '20px monospace';
      ctx.fillStyle = '#cdd6f4';
      ctx.fillText(`Final Score: ${gameState.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.fillText(`Time Survived: ${formatTime(gameState.timer)}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
      
      ctx.font = '16px monospace';
      ctx.fillStyle = '#a6e3a1';
      ctx.fillText('Press ENTER to play again', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 70);
    }

    // Draw particles
    gameState.particles.forEach(particle => {
      // Calculate opacity based on remaining life
      const opacity = particle.life / particle.maxLife;
      
      // Draw particle
      ctx.fillStyle = particle.color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Draw pause overlay
    if (gameState.isPaused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.font = 'bold 32px monospace';
      ctx.fillStyle = '#f9e2af';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      
      ctx.font = '16px monospace';
      ctx.fillStyle = '#cdd6f4';
      ctx.fillText('Click Resume to continue', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
    }
  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="border border-gray-700 shadow-lg cursor-pointer"
      onClick={onCanvasClick}
    />
  );
};

export default GameCanvas;
