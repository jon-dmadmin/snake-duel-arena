// Centralized mock API service - all backend calls go through here
// This makes it easy to swap with real backend later

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  mode: 'walls' | 'pass-through';
  date: Date;
}

export interface ActivePlayer {
  id: string;
  username: string;
  score: number;
  mode: 'walls' | 'pass-through';
  startedAt: Date;
}

// Simulated delay to mimic network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage
let currentUser: User | null = null;
const registeredUsers: Map<string, { user: User; password: string }> = new Map();

// Pre-populate with some users
const mockUsers = [
  { id: '1', username: 'PixelMaster', email: 'pixel@game.com' },
  { id: '2', username: 'SnakeKing', email: 'snake@game.com' },
  { id: '3', username: 'RetroGamer', email: 'retro@game.com' },
  { id: '4', username: 'ArcadeHero', email: 'arcade@game.com' },
  { id: '5', username: 'NeonPlayer', email: 'neon@game.com' },
];

mockUsers.forEach(u => {
  registeredUsers.set(u.email, {
    user: { ...u, createdAt: new Date() },
    password: 'password123'
  });
});

// Mock leaderboard data
const mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', username: 'PixelMaster', score: 2450, mode: 'walls', date: new Date('2024-01-15') },
  { id: '2', username: 'SnakeKing', score: 2100, mode: 'pass-through', date: new Date('2024-01-14') },
  { id: '3', username: 'RetroGamer', score: 1890, mode: 'walls', date: new Date('2024-01-13') },
  { id: '4', username: 'ArcadeHero', score: 1750, mode: 'pass-through', date: new Date('2024-01-12') },
  { id: '5', username: 'NeonPlayer', score: 1620, mode: 'walls', date: new Date('2024-01-11') },
  { id: '6', username: 'GameWizard', score: 1500, mode: 'pass-through', date: new Date('2024-01-10') },
  { id: '7', username: 'PixelPro', score: 1350, mode: 'walls', date: new Date('2024-01-09') },
  { id: '8', username: 'SnakeLord', score: 1200, mode: 'pass-through', date: new Date('2024-01-08') },
  { id: '9', username: 'RetroKing', score: 1050, mode: 'walls', date: new Date('2024-01-07') },
  { id: '10', username: 'ArcadeMaster', score: 900, mode: 'pass-through', date: new Date('2024-01-06') },
];

// Mock active players for spectating
const mockActivePlayers: ActivePlayer[] = [
  { id: 'active-1', username: 'SnakeKing', score: 450, mode: 'walls', startedAt: new Date() },
  { id: 'active-2', username: 'RetroGamer', score: 320, mode: 'pass-through', startedAt: new Date() },
  { id: 'active-3', username: 'NeonPlayer', score: 580, mode: 'walls', startedAt: new Date() },
];

// Auth API
export const authApi = {
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    await delay(500);
    
    const record = registeredUsers.get(email);
    if (!record) {
      return { success: false, error: 'User not found' };
    }
    if (record.password !== password) {
      return { success: false, error: 'Invalid password' };
    }
    
    currentUser = record.user;
    return { success: true, user: record.user };
  },

  async signup(email: string, username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    await delay(500);
    
    if (registeredUsers.has(email)) {
      return { success: false, error: 'Email already registered' };
    }
    
    const existingUsername = Array.from(registeredUsers.values()).find(r => r.user.username === username);
    if (existingUsername) {
      return { success: false, error: 'Username already taken' };
    }
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      email,
      createdAt: new Date(),
    };
    
    registeredUsers.set(email, { user: newUser, password });
    currentUser = newUser;
    
    return { success: true, user: newUser };
  },

  async logout(): Promise<void> {
    await delay(200);
    currentUser = null;
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(100);
    return currentUser;
  },
};

// Leaderboard API
export const leaderboardApi = {
  async getLeaderboard(mode?: 'walls' | 'pass-through'): Promise<LeaderboardEntry[]> {
    await delay(300);
    
    let entries = [...mockLeaderboard];
    if (mode) {
      entries = entries.filter(e => e.mode === mode);
    }
    
    return entries.sort((a, b) => b.score - a.score);
  },

  async submitScore(score: number, mode: 'walls' | 'pass-through'): Promise<{ success: boolean; rank?: number }> {
    await delay(300);
    
    if (!currentUser) {
      return { success: false };
    }
    
    const entry: LeaderboardEntry = {
      id: `score-${Date.now()}`,
      username: currentUser.username,
      score,
      mode,
      date: new Date(),
    };
    
    mockLeaderboard.push(entry);
    mockLeaderboard.sort((a, b) => b.score - a.score);
    
    const rank = mockLeaderboard.findIndex(e => e.id === entry.id) + 1;
    
    return { success: true, rank };
  },
};

// Spectate API
export const spectateApi = {
  async getActivePlayers(): Promise<ActivePlayer[]> {
    await delay(300);
    return [...mockActivePlayers];
  },

  async getPlayerStream(playerId: string): Promise<ActivePlayer | null> {
    await delay(100);
    return mockActivePlayers.find(p => p.id === playerId) || null;
  },
};
