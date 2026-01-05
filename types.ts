export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: 'google' | 'facebook';
  role?: 'admin' | 'user';
  gold_balance: number;
  silver_balance: number;
  library?: { gameId: string; expiresAt: string | null }[];
}

export enum GameCategory {
  ACTION = '動作',
  PUZZLE = '益智',
  RPG = '角色扮演',
  STRATEGY = '策略',
  CASUAL = '休閒'
}

export interface Game {
  id: string;
  title: string;
  description: string;
  fullDescription: string; // Longer text for modal
  category: GameCategory;
  thumbnailUrl: string; // Square/Portrait for grid
  coverUrl: string; // Landscape for modal header
  gameUrl: string; // The actual URL to play the game (iframe or external)
  price: number; // 0 for free
  isFree: boolean;
  developer: string;
  releaseDate: string;
  pricingTiers?: { id: number; label: string; price_gold: number; duration_minutes: number }[];
  selectedTier?: { id: number; label: string; price_gold: number; duration_minutes: number };
}

export interface PaymentMethod {
  cardNumber: string;
  expiry: string;
  cvc: string;
}