import React, { useEffect, useState, useRef } from 'react';
import { GameCanvas } from './GameCanvas';
import { Button } from '@/components/ui/button';
import { spectateApi, type ActivePlayer } from '@/services/api';
import {
  createInitialState,
  tick,
  startGame,
  getAIDirection,
  changeDirection,
  type GameState,
} from '@/lib/snakeGame';
import { Users, ArrowLeft, Eye } from 'lucide-react';

export function SpectateView() {
  const [activePlayers, setActivePlayers] = useState<ActivePlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<ActivePlayer | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const gameLoopRef = useRef<number>();

  // Load active players
  useEffect(() => {
    const loadPlayers = async () => {
      setIsLoading(true);
      const players = await spectateApi.getActivePlayers();
      setActivePlayers(players);
      setIsLoading(false);
    };

    loadPlayers();
    const interval = setInterval(loadPlayers, 5000); // Refresh every 5s

    return () => clearInterval(interval);
  }, []);

  // Simulate AI playing when spectating
  useEffect(() => {
    if (!selectedPlayer) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      setGameState(null);
      return;
    }

    // Initialize game for spectating
    let state = createInitialState(selectedPlayer.mode);
    state = startGame(state);
    setGameState(state);

    // Run AI game loop
    gameLoopRef.current = window.setInterval(() => {
      setGameState(prev => {
        if (!prev || prev.status !== 'playing') {
          // Reset if game over
          let newState = createInitialState(selectedPlayer.mode);
          return startGame(newState);
        }

        // AI decides direction
        const aiDirection = getAIDirection(prev);
        let newState = changeDirection(prev, aiDirection);
        return tick(newState);
      });
    }, 120);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [selectedPlayer]);

  const handleSelectPlayer = (player: ActivePlayer) => {
    setSelectedPlayer(player);
  };

  const handleBack = () => {
    setSelectedPlayer(null);
  };

  if (selectedPlayer && gameState) {
    return (
      <div className="flex flex-col items-center gap-6">
        <Button variant="ghost" onClick={handleBack} className="self-start">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Players
        </Button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-accent" />
            <span className="font-pixel text-accent text-sm">SPECTATING</span>
          </div>
          <h2 className="font-pixel text-xl text-primary text-glow">
            {selectedPlayer.username}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {selectedPlayer.mode === 'walls' ? '🧱 Walls Mode' : '🌀 Pass-Through Mode'}
          </p>
        </div>

        <div className="font-pixel text-2xl text-primary text-glow">
          SCORE: {gameState.score}
        </div>

        <GameCanvas gameState={gameState} cellSize={20} />

        <p className="text-muted-foreground text-sm">
          Watching AI simulate {selectedPlayer.username}'s gameplay
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-2 mb-8">
        <Users className="w-6 h-6 text-primary" />
        <h2 className="font-pixel text-lg text-primary">ACTIVE PLAYERS</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="font-pixel text-primary animate-pulse">Loading...</div>
        </div>
      ) : activePlayers.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-muted">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No players currently online</p>
          <p className="text-sm text-muted-foreground mt-2">Check back later!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {activePlayers.map((player) => (
            <button
              key={player.id}
              onClick={() => handleSelectPlayer(player)}
              className="flex items-center justify-between p-6 rounded-lg border border-primary/30 bg-card hover:bg-muted/50 hover:border-primary/60 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-pixel text-primary text-lg">
                    {player.username.charAt(0)}
                  </span>
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {player.username}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {player.mode === 'walls' ? '🧱 Walls' : '🌀 Pass-Through'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-pixel text-primary text-glow-sm">{player.score}</p>
                  <p className="text-xs text-muted-foreground">Current Score</p>
                </div>
                <Eye className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
