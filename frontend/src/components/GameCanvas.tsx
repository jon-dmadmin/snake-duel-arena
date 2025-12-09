import React, { useRef, useEffect } from 'react';
import type { GameState } from '@/lib/snakeGame';

interface GameCanvasProps {
  gameState: GameState;
  cellSize?: number;
}

export function GameCanvas({ gameState, cellSize = 25 }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { snake, food, gridSize, mode } = gameState;
  const canvasSize = gridSize * cellSize;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'hsl(220, 20%, 6%)';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw grid (more pronounced)
    ctx.strokeStyle = 'hsl(220, 20%, 14%)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvasSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvasSize, i * cellSize);
      ctx.stroke();
    }

    // Draw walls border if walls mode
    if (mode === 'walls') {
      ctx.strokeStyle = 'hsl(280, 80%, 50%)';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, canvasSize - 4, canvasSize - 4);
      
      // Add glow effect
      ctx.shadowColor = 'hsl(280, 80%, 50%)';
      ctx.shadowBlur = 10;
      ctx.strokeRect(2, 2, canvasSize - 4, canvasSize - 4);
      ctx.shadowBlur = 0;
    }

    // Draw food with glow
    ctx.shadowColor = 'hsl(0, 100%, 60%)';
    ctx.shadowBlur = 15;
    ctx.fillStyle = 'hsl(0, 100%, 60%)';
    ctx.beginPath();
    ctx.arc(
      food.x * cellSize + cellSize / 2,
      food.y * cellSize + cellSize / 2,
      cellSize / 2.5,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw snake
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      const alpha = 1 - (index / snake.length) * 0.5;
      
      if (isHead) {
        // Head with glow
        ctx.shadowColor = 'hsl(120, 100%, 50%)';
        ctx.shadowBlur = 15;
      }
      
      ctx.fillStyle = `hsla(120, 100%, ${isHead ? 60 : 50}%, ${alpha})`;
      
      const padding = isHead ? 1 : 2;
      ctx.fillRect(
        segment.x * cellSize + padding,
        segment.y * cellSize + padding,
        cellSize - padding * 2,
        cellSize - padding * 2
      );
      
      ctx.shadowBlur = 0;
    });

    // Draw eyes on head
    if (snake.length > 0) {
      const head = snake[0];
      ctx.fillStyle = 'hsl(220, 20%, 6%)';
      const eyeSize = cellSize / 6;
      const eyeOffset = cellSize / 4;
      
      ctx.beginPath();
      ctx.arc(
        head.x * cellSize + cellSize / 2 - eyeOffset,
        head.y * cellSize + cellSize / 2 - eyeOffset / 2,
        eyeSize,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(
        head.x * cellSize + cellSize / 2 + eyeOffset,
        head.y * cellSize + cellSize / 2 - eyeOffset / 2,
        eyeSize,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }, [snake, food, gridSize, cellSize, canvasSize, mode]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      className="border-2 border-primary/30 rounded-lg"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
