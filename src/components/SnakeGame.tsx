import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameCanvas } from './GameCanvas';
import { Button } from '@/components/ui/button';
import {
  createInitialState,
  changeDirection,
  tick,
  startGame,
  pauseGame,
  resumeGame,
  resetGame,
  type GameState,
  type GameMode,
  type Direction,
} from '@/lib/snakeGame';
import { useAuth } from '@/contexts/AuthContext';
import { leaderboardApi } from '@/services/api';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface SnakeGameProps {
  initialMode?: GameMode;
  isSpectateMode?: boolean;
  spectateState?: GameState;
}

export function SnakeGame({ initialMode = 'walls', isSpectateMode = false, spectateState }: SnakeGameProps) {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(initialMode));
  const [mode, setMode] = useState<GameMode>(initialMode);
  const gameLoopRef = useRef<number>();
  const { user } = useAuth();

  // Handle spectate mode
  useEffect(() => {
    if (isSpectateMode && spectateState) {
      setGameState(spectateState);
    }
  }, [isSpectateMode, spectateState]);

  // Game loop
  useEffect(() => {
    if (isSpectateMode) return;

    if (gameState.status === 'playing') {
      gameLoopRef.current = window.setInterval(() => {
        setGameState(prev => tick(prev));
      }, gameState.speed);
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState.status, gameState.speed, isSpectateMode]);

  // Submit score on game over
  useEffect(() => {
    if (gameState.status === 'game-over' && gameState.score > 0 && user) {
      leaderboardApi.submitScore(gameState.score, mode);
    }
  }, [gameState.status, gameState.score, mode, user]);

  // Keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isSpectateMode) return;

    const directionMap: Record<string, Direction> = {
      ArrowUp: 'UP',
      ArrowDown: 'DOWN',
      ArrowLeft: 'LEFT',
      ArrowRight: 'RIGHT',
      w: 'UP',
      s: 'DOWN',
      a: 'LEFT',
      d: 'RIGHT',
      W: 'UP',
      S: 'DOWN',
      A: 'LEFT',
      D: 'RIGHT',
    };

    const direction = directionMap[e.key];
    if (direction) {
      e.preventDefault();
      setGameState(prev => changeDirection(prev, direction));
    }

    if (e.key === ' ') {
      e.preventDefault();
      setGameState(prev => {
        if (prev.status === 'idle') return startGame(prev);
        if (prev.status === 'playing') return pauseGame(prev);
        if (prev.status === 'paused') return resumeGame(prev);
        return prev;
      });
    }
  }, [isSpectateMode]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleStart = () => {
    if (gameState.status === 'idle') {
      setGameState(startGame(gameState));
    } else if (gameState.status === 'paused') {
      setGameState(resumeGame(gameState));
    } else if (gameState.status === 'playing') {
      setGameState(pauseGame(gameState));
    }
  };

  const handleReset = () => {
    setGameState(resetGame(mode));
  };

  const handleModeChange = (newMode: GameMode) => {
    setMode(newMode);
    setGameState(resetGame(newMode));
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Mode selector */}
      {!isSpectateMode && (
        <div className="flex gap-4">
          <Button
            variant={mode === 'walls' ? 'neon' : 'outline'}
            onClick={() => handleModeChange('walls')}
            disabled={gameState.status === 'playing'}
          >
            Walls Mode
          </Button>
          <Button
            variant={mode === 'pass-through' ? 'neonAccent' : 'outline'}
            onClick={() => handleModeChange('pass-through')}
            disabled={gameState.status === 'playing'}
          >
            Pass-Through
          </Button>
        </div>
      )}

      {/* Score display */}
      <div className="text-center">
        <p className="font-pixel text-2xl text-primary text-glow">
          SCORE: {gameState.score}
        </p>
        {isSpectateMode && (
          <p className="font-pixel text-xs text-accent mt-2">SPECTATING</p>
        )}
      </div>

      {/* Game canvas */}
      <div className="relative">
        <GameCanvas gameState={gameState} cellSize={20} />
        
        {/* Overlay for game states */}
        {gameState.status === 'idle' && !isSpectateMode && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-lg">
            <p className="font-pixel text-lg text-primary text-glow mb-4">READY?</p>
            <p className="text-muted-foreground text-sm mb-4">Press SPACE or click START</p>
            <p className="text-muted-foreground text-xs">Use WASD or Arrow Keys</p>
          </div>
        )}
        
        {gameState.status === 'paused' && !isSpectateMode && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-lg">
            <p className="font-pixel text-xl text-accent text-glow animate-blink">PAUSED</p>
          </div>
        )}
        
        {gameState.status === 'game-over' && !isSpectateMode && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-lg">
            <p className="font-pixel text-xl text-destructive text-glow mb-4">GAME OVER</p>
            <p className="font-pixel text-lg text-primary mb-6">SCORE: {gameState.score}</p>
            <Button variant="neon" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          </div>
        )}
      </div>

      {/* Controls */}
      {!isSpectateMode && (
        <div className="flex gap-4">
          <Button
            variant="neon"
            size="lg"
            onClick={handleStart}
            disabled={gameState.status === 'game-over'}
          >
            {gameState.status === 'playing' ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                {gameState.status === 'paused' ? 'Resume' : 'Start'}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      )}

      {/* Mode description */}
      <p className="text-muted-foreground text-sm text-center max-w-md">
        {mode === 'walls' 
          ? 'Hit the walls and it\'s game over! Be careful around the edges.'
          : 'Pass through walls and appear on the other side. Only self-collision ends the game.'}
      </p>
    </div>
  );
}
