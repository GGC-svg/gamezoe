import { Game } from '../types';

const API_BASE = '/api/games';

export const gameService = {

  // GET: Fetch all games
  getAllGames: async (): Promise<Game[]> => {
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error('Failed to fetch games');
    return response.json();
  },

  // POST: Create a new game
  createGame: async (newGame: Game): Promise<Game> => {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGame)
    });
    if (!response.ok) throw new Error('Failed to create game');
    return response.json();
  },

  // PUT: Update an existing game
  updateGame: async (updatedGame: Game): Promise<Game> => {
    const response = await fetch(`${API_BASE}/${updatedGame.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedGame)
    });
    if (!response.ok) throw new Error('Failed to update game');
    return response.json();
  },

  // DELETE: Remove a game
  deleteGame: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete game');
  },

  // PUT: Reorder games
  reorderGames: async (orderedIds: string[]): Promise<void> => {
    const response = await fetch(`${API_BASE}/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds })
    });
    if (!response.ok) throw new Error('Failed to reorder games');
  }
};
