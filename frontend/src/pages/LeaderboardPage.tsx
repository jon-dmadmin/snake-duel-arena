import React from 'react';
import { Header } from '@/components/Header';
import { Leaderboard } from '@/components/Leaderboard';
import { Trophy } from 'lucide-react';

const LeaderboardPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-primary" />
            <h1 className="font-pixel text-2xl md:text-3xl text-primary text-glow">
              LEADERBOARD
            </h1>
          </div>
          <p className="text-muted-foreground">
            The greatest snake masters of all time
          </p>
        </div>

        <Leaderboard />
      </main>

      <footer className="border-t border-primary/10 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Can you reach the top?</p>
        </div>
      </footer>
    </div>
  );
};

export default LeaderboardPage;
