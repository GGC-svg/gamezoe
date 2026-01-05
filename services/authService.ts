import { User } from '../types';

const API_BASE = '/api/auth';
const SESSION_KEY = 'nexus_user_session';

// Mock Profiles for login simulation request (sent to backend)
const MOCK_ADMIN: User = {
  id: 'u_admin_001',
  name: '管理員 (Admin)',
  email: 'admin@gamezoe.com',
  avatar: 'https://picsum.photos/id/64/200/200',
  provider: 'google',
  role: 'admin',
  gold_balance: 1000,
  silver_balance: 5000
};

const MOCK_USER: User = {
  id: 'u_player_001',
  name: '快樂玩家 (Player)',
  email: 'player@example.com',
  avatar: 'https://picsum.photos/id/237/200/200',
  provider: 'facebook',
  role: 'user',
  gold_balance: 0,
  silver_balance: 0
};

export const authService = {

  // LOGIN: Call Backend API
  login: async (provider: 'google' | 'facebook', token?: string): Promise<{ user: User, purchasedGames: string[], library?: any[] }> => {

    if (provider === 'google' && token) {
      // Google Login Flow
      const response = await fetch(`${API_BASE}/google-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token }),
      });

      if (!response.ok) throw new Error('Google Login Failed');

      const data = await response.json();
      localStorage.setItem(SESSION_KEY, data.user.id);
      return data;
    }

    // Default / Mock Flow (Facebook or Dev)
    const userProfile = provider === 'google' ? MOCK_ADMIN : MOCK_USER;

    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userProfile),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();

    // Save Session locally
    localStorage.setItem(SESSION_KEY, data.user.id);

    return data;
  },

  // LOGOUT
  logout: async (): Promise<void> => {
    localStorage.removeItem(SESSION_KEY);
    // Optional: Call backend to invalidate session if using cookies
  },

  // CHECK SESSION
  getCurrentSession: async (): Promise<{ user: User | null, purchasedGames: string[], library?: { gameId: string; expiresAt: string | null }[] }> => {
    const userId = localStorage.getItem(SESSION_KEY);

    if (!userId) {
      return { user: null, purchasedGames: [] };
    }

    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (e) {
      console.error("Session check failed", e);
    }

    // Invalid session
    localStorage.removeItem(SESSION_KEY);
    return { user: null, purchasedGames: [] };
  },

  // PURCHASE
  addGameToLibrary: async (userId: string, gameId: string): Promise<void> => {
    await fetch(`/api/users/${userId}/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameId }),
    });
  }
};