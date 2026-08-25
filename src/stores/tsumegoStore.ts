import { defineStore } from 'pinia';
import { useUserStore } from './useUserStore';
import { sound } from '../utils/sound';
import { TSUMEGO_PUZZLES } from '../data/tsumegoLibrary';

export const useTsumegoStore = defineStore('tsumego', {
  state: () => ({
    favoritePuzzleIds: [] as string[]
  }),
  getters: {
    solvedPuzzleIds(): string[] {
      const userStore = useUserStore();
      return userStore.solvedPuzzles;
    },
    totalSolvedCount(): number {
      const userStore = useUserStore();
      return userStore.solvedPuzzles.length;
    },
    totalPuzzlesCount(): number {
      return TSUMEGO_PUZZLES.length;
    },
    isSolved() {
      return (puzzleId: string): boolean => {
        const userStore = useUserStore();
        return userStore.solvedPuzzles.includes(puzzleId);
      };
    },
    isFavorite(state) {
      return (puzzleId: string): boolean => state.favoritePuzzleIds.includes(puzzleId);
    }
  },
  actions: {
    solvePuzzle(puzzleId: string) {
      const userStore = useUserStore();
      const isFirstTime = !userStore.solvedPuzzles.includes(puzzleId);

      if (isFirstTime) {
        userStore.recordPuzzleSolved(puzzleId);
        userStore.addExp(80);
        userStore.addCoins(30);
      }

      sound.playWinSound();
      sound.fireCelebrationConfetti();
    },
    toggleFavorite(puzzleId: string) {
      const idx = this.favoritePuzzleIds.indexOf(puzzleId);
      if (idx >= 0) {
        this.favoritePuzzleIds.splice(idx, 1);
      } else {
        this.favoritePuzzleIds.push(puzzleId);
        sound.playButtonSound();
      }
    }
  },
  persist: {
    key: 'yinuo_go_tsumego_store',
    storage: localStorage
  }
});


