import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthModal } from './AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, Trophy, Eye, Gamepad2 } from 'lucide-react';

export function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="border-b border-primary/20 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-pixel text-xl text-primary text-glow">SNAKE</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <Link 
              to="/" 
              className={`flex items-center gap-2 text-sm transition-colors ${
                isActive('/') ? 'text-primary text-glow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span className="hidden sm:inline">Play</span>
            </Link>
            <Link 
              to="/leaderboard" 
              className={`flex items-center gap-2 text-sm transition-colors ${
                isActive('/leaderboard') ? 'text-primary text-glow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Link>
            <Link 
              to="/spectate" 
              className={`flex items-center gap-2 text-sm transition-colors ${
                isActive('/spectate') ? 'text-primary text-glow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Watch</span>
            </Link>
          </nav>

          {/* Auth section */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-foreground font-medium">{user.username}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAuthClick('login')}
                >
                  Login
                </Button>
                <Button
                  variant="neon"
                  size="sm"
                  onClick={() => handleAuthClick('signup')}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
}
