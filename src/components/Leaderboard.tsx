import React, { useEffect, useState } from 'react';
import { leaderboardApi, type LeaderboardEntry } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardProps {
  compact?: boolean;
  limit?: number;
}

export function Leaderboard({ compact = false, limit }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'walls' | 'pass-through'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true);
      const mode = filter === 'all' ? undefined : filter;
      const data = await leaderboardApi.getLeaderboard(mode);
      setEntries(limit ? data.slice(0, limit) : data);
      setIsLoading(false);
    };

    loadLeaderboard();
  }, [filter, limit]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-muted-foreground">{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-400/10 border-yellow-400/30';
      case 2:
        return 'bg-gray-400/10 border-gray-400/30';
      case 3:
        return 'bg-amber-600/10 border-amber-600/30';
      default:
        return 'bg-muted/50 border-muted';
    }
  };

  return (
    <div className={compact ? '' : 'max-w-2xl mx-auto'}>
      {!compact && (
        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant={filter === 'all' ? 'neon' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filter === 'walls' ? 'neon' : 'outline'}
            onClick={() => setFilter('walls')}
            size="sm"
          >
            Walls
          </Button>
          <Button
            variant={filter === 'pass-through' ? 'neonAccent' : 'outline'}
            onClick={() => setFilter('pass-through')}
            size="sm"
          >
            Pass-Through
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="font-pixel text-primary animate-pulse">Loading...</div>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:scale-[1.02] ${getRankStyle(index + 1)}`}
            >
              <div className="flex items-center gap-4">
                {getRankIcon(index + 1)}
                <div>
                  <p className="font-medium text-foreground">{entry.username}</p>
                  {!compact && (
                    <p className="text-xs text-muted-foreground">
                      {entry.mode === 'walls' ? '🧱 Walls' : '🌀 Pass-Through'} • {entry.date.toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="font-pixel text-lg text-primary text-glow-sm">
                {entry.score.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {entries.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No scores yet. Be the first!</p>
        </div>
      )}
    </div>
  );
}
