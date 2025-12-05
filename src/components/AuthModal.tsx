import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const result = await login(email, password);
        if (result.success) {
          toast.success('Welcome back!');
          onClose();
          resetForm();
        } else {
          toast.error(result.error || 'Login failed');
        }
      } else {
        const result = await signup(email, username, password);
        if (result.success) {
          toast.success('Account created! Welcome!');
          onClose();
          resetForm();
        } else {
          toast.error(result.error || 'Signup failed');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setUsername('');
    setPassword('');
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-primary/30 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-pixel text-lg text-primary text-glow text-center">
            {mode === 'login' ? 'LOGIN' : 'SIGN UP'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="player@game.com"
              required
              className="bg-muted border-primary/30 focus:border-primary"
            />
          </div>
          
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="SnakeMaster"
                required
                className="bg-muted border-primary/30 focus:border-primary"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="bg-muted border-primary/30 focus:border-primary"
            />
          </div>
          
          <Button
            type="submit"
            variant="neon"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              mode === 'login' ? 'Login' : 'Create Account'
            )}
          </Button>
        </form>
        
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {mode === 'login' 
              ? "Don't have an account? Sign up" 
              : 'Already have an account? Login'}
          </button>
        </div>

        {mode === 'login' && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Demo: Use any registered email with password "password123"
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
