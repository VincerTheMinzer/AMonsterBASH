import React, { useRef, useEffect } from 'react';
import { GameState, Enemy } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, CONSOLE_HEIGHT, GAME_AREA_HEIGHT, formatTime } from '../utils/gameUtils';

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

      // Draw enemy
      ctx.fillStyle = enemy.isBoss ? '#f38ba8' : '#f9e2af';
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

      // Draw command text above enemy
      ctx.font = enemy.isBoss ? 'bold 14px monospace' : '12px monospace';
      ctx.fillStyle = '#cdd6f4';
      ctx.textAlign = 'center';
      ctx.fillText(
        enemy.command.command,
        enemy.x + enemy.width / 2,
        enemy.y - 10
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

        // Draw command sequence for boss
        if (enemy.commandSequence && enemy.currentCommandIndex !== undefined) {
          ctx.font = '10px monospace';
          ctx.fillStyle = '#bac2de';
          
          enemy.commandSequence.forEach((cmd, index) => {
            const isCompleted = index < enemy.currentCommandIndex!;
            const isCurrent = index === enemy.currentCommandIndex;
            
            ctx.fillStyle = isCompleted ? '#a6e3a1' : isCurrent ? '#f9e2af' : '#6c7086';
            ctx.fillText(
              cmd.command,
              enemy.x + enemy.width / 2,
              enemy.y - 35 - (enemy.commandSequence!.length - 1 - index) * 15
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
