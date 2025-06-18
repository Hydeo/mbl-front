import { defineStore } from 'pinia';
import { fetchUserCollection } from '../api/bgg';
import type { BoardGame } from '../types/bgg';

export const useBoardGamesStore = defineStore('boardGames', {
  state: () => ({
    collection: [] as BoardGame[],
    isLoading: false,
    error: null as string | null,
  }),
  getters: {
    getBoardGames(state): BoardGame[] {
      return state.collection;
    },
    getIsLoading(state): boolean {
      return state.isLoading;
    },
    getError(state): string | null {
      return state.error;
    },
  },
  actions: {
    async loadCollection(username: string) {
      this.isLoading = true;
      this.error = null;
      try {
        this.collection = await fetchUserCollection(username);
      } catch (err: any) {
        this.error = err.message || 'Failed to load collection.';
        console.error('Pinia store error:', err);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
