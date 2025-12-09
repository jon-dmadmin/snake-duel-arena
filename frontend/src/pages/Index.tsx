import React from 'react';
import { Header } from '@/components/Header';
import { SnakeGame } from '@/components/SnakeGame';
import { Leaderboard } from '@/components/Leaderboard';
import { Link } from 'react-router-dom';
import { Trophy, Eye } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="font-pixel text-3xl md:text-4xl text-primary text-glow mb-4">
            SNAKE GAME
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Classic arcade action with modern vibes. Choose your mode and compete for the top spot!
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-8 max-w-6xl mx-auto">
          {/* Game area */}
          <div className="flex justify-center">
            <SnakeGame />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top scores */}
            <div className="bg-card/50 rounded-lg border border-primary/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <h3 className="font-pixel text-sm text-primary">TOP SCORES</h3>
                </div>
                <Link 
                  to="/leaderboard" 
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  View all →
                </Link>
              </div>
              <Leaderboard compact limit={5} />
            </div>

            {/* Watch live */}
            <Link
              to="/spectate"
              className="block bg-card/50 rounded-lg border border-accent/20 p-6 hover:border-accent/50 transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-accent" />
                <h3 className="font-pixel text-sm text-accent">WATCH LIVE</h3>
              </div>
              <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                Spectate other players in real-time and learn from the best!
              </p>
            </Link>

            {/* Tips */}
            <div className="bg-muted/30 rounded-lg p-6">
              <h3 className="font-medium text-foreground mb-3">Quick Tips</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Use <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">WASD</kbd> or Arrow keys</li>
                <li>• Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Space</kbd> to pause</li>
                <li>• Login to save your scores</li>
                <li>• Pass-through mode = safer edges</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-primary/10 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built with neon dreams and pixel precision</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
