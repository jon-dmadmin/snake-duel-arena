import React from 'react';
import { Header } from '@/components/Header';
import { SpectateView } from '@/components/SpectateView';
import { Eye } from 'lucide-react';

const SpectatePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Eye className="w-8 h-8 text-accent" />
            <h1 className="font-pixel text-2xl md:text-3xl text-accent text-glow">
              SPECTATE
            </h1>
          </div>
          <p className="text-muted-foreground">
            Watch live games and learn from other players
          </p>
        </div>

        <SpectateView />
      </main>

      <footer className="border-t border-primary/10 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Learn from the best</p>
        </div>
      </footer>
    </div>
  );
};

export default SpectatePage;
