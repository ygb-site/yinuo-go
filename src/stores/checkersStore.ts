import { defineStore } from 'pinia';
import type { PlayerConfig } from '../engine/checkers/checkersEngine';

export interface CheckersMoveRecord {
  stepIndex: number;
  playerId: number;
  playerName: string;
  playerAvatar: string;
  playerColorHex: string;
  fromId: string;
  toId: string;
  path: string[];
  isJump: boolean;
  hops: number;
  timestamp: number;
  notation: string;
  boardStateAfter: Record<string, number>;
}

export interface CheckersGameRecord {
  id: string;
  playedAt: string;
  mode: 'ai' | 'twoPlayer' | 'multiPlayer' | 'puzzle';
  modeName: string;
  aiDifficulty?: 'easy' | 'medium' | 'hard';
  winnerName: string;
  winnerAvatar: string;
  winnerPlayerId: number;
  isUserWinner: boolean;
  totalSteps: number;
  bestComboHops: number;
  durationSeconds: number;
  players: PlayerConfig[];
  initialState: Record<string, number>;
  moves: CheckersMoveRecord[];
}

export const useCheckersStore = defineStore('checkers', {
  state: () => ({
    historyRecords: [] as CheckersGameRecord[],
    totalWins: 0,
    totalGames: 0,
    maxHopsRecord: 0
  }),
  getters: {
    recentRecords: (state) => {
      return [...state.historyRecords].sort((a, b) => b.id.localeCompare(a.id));
    },
    winRate: (state) => {
      if (state.totalGames === 0) return 0;
      return Math.round((state.totalWins / state.totalGames) * 100);
    }
  },
  actions: {
    saveGameRecord(record: CheckersGameRecord) {
      this.historyRecords.unshift(record);
      // Keep up to 50 recent game records
      if (this.historyRecords.length > 50) {
        this.historyRecords.pop();
      }
      this.totalGames++;
      if (record.isUserWinner) {
        this.totalWins++;
      }
      if (record.bestComboHops > this.maxHopsRecord) {
        this.maxHopsRecord = record.bestComboHops;
      }
    },

    deleteGameRecord(id: string) {
      this.historyRecords = this.historyRecords.filter(r => r.id !== id);
    },

    clearAllRecords() {
      this.historyRecords = [];
    }
  },
  persist: true
});

