import React, { useRef, useEffect } from 'react';
import { GameState, Enemy } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, CONSOLE_HEIGHT, GAME_AREA_HEIGHT, formatTime } from '../utils/gameUtils';
import { drawCommandIcon } from '../utils/iconUtils';

interface GameCanvasProps {
  gameState: GameState;
  onCanvasClick: () => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, onCanvasClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    ctx.fillStyle = '#89b4fa';
    ctx.fillRect(
      gameState.player.x,
      gameState.player.y,
      gameState.player.width,
      gameState.player.height
    );

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

      // Draw enemy with command icon
      const iconColor = enemy.isBoss ? '#f38ba8' : '#f9e2af';
      
      // Draw background rectangle
      ctx.fillStyle = iconColor;
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      
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
      
      // Draw command text above enemy with background for better readability
      const commandText = enemy.command.command;
      const currentInput = gameState.currentInput;
      
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
      
      ctx.font = `${enemy.isBoss ? 'bold' : ''} ${fontSize}px monospace`;
      ctx.textAlign = 'center';
      
      // Measure text width for background
      const textWidth = ctx.measureText(commandText).width;
      const padding = 4;
      
      // Draw text background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(
        enemy.x + enemy.width / 2 - textWidth / 2 - padding,
        enemy.y - 25 - padding,
        textWidth + padding * 2,
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
      
      // Draw filename below the enemy
      ctx.font = `12px monospace`;
      ctx.textAlign = 'center';
      
      // Measure filename width for background
      const filenameWidth = ctx.measureText(enemy.filename).width;
      
      // Draw filename background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(
        enemy.x + enemy.width / 2 - filenameWidth / 2 - padding,
        enemy.y + enemy.height + 5 - padding,
        filenameWidth + padding * 2,
        20
      );
      
      // Draw filename text
      ctx.fillStyle = '#89b4fa'; // Blue color for filenames
      ctx.fillText(
        enemy.filename,
        enemy.x + enemy.width / 2,
        enemy.y + enemy.height + 15
      );

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
            const textWidth = ctx.measureText(sequenceText).width;
            const padding = 4;
            
            // Draw text background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(
              enemy.x + enemy.width / 2 - textWidth / 2 - padding,
              yOffset - 10 - padding,
              textWidth + padding * 2,
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

    // Draw score and timer
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#cdd6f4';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${gameState.score}`, 20, 30);
    
    ctx.textAlign = 'right';
    ctx.fillText(`Time: ${formatTime(gameState.timer)}`, CANVAS_WIDTH - 20, 30);

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
