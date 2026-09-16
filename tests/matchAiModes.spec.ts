import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSilverStore } from '../src/stores/useSilverStore';
import { GoGame } from '../src/engine/GoGame';
import { chooseGoAiMove } from '../src/engine/goAi';
import { createEmptyBoard, chooseGomokuAiMove } from '../src/engine/gomoku/gomokuEngine';
import { createInitialXiangqiBoard, chooseXiangqiAiMove } from '../src/engine/xiangqi/xiangqiEngine';
import { chooseAiMove, type PlayerConfig, CAMPS } from '../src/engine/checkers/checkersEngine';

describe('Silver Note Zero Initialization & All Board Games AI Modes', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('verifies all project silver notes are initialized to 0 and transactions are empty', () => {
    const store = useSilverStore();
    expect(store.members.length).toBeGreaterThanOrEqual(3);
    for (const m of store.members) {
      expect(m.balance).toBe(0);
      expect(m.totalReward).toBe(0);
      expect(m.totalPenalty).toBe(0);
    }
    expect(store.totalFamilyBalance).toBe(0);
    expect(store.transactions).toEqual([]);
  });

  it('verifies Go AI supports easy, medium, and hard levels', () => {
    const game = new GoGame(9, 3.5);
    game.playMove(4, 4, 'B');

    for (const diff of ['easy', 'medium', 'hard'] as const) {
      const move = chooseGoAiMove(game, 'W', diff);
      expect(move).not.toBeNull();
      if (move) {
        expect(game.isValidCoord(move.r, move.c)).toBe(true);
        expect(game.getCell(move.r, move.c)).toBeNull();
      }
    }
  });

  it('verifies Gomoku AI supports easy, medium, and hard levels', () => {
    const board = createEmptyBoard();
    board[7][7] = 1;

    for (const diff of ['easy', 'medium', 'hard'] as const) {
      const move = chooseGomokuAiMove(board, 2, diff);
      expect(move).not.toBeNull();
      if (move) {
        expect(move.r).toBeGreaterThanOrEqual(0);
        expect(move.r).toBeLessThan(15);
        expect(move.c).toBeGreaterThanOrEqual(0);
        expect(move.c).toBeLessThan(15);
      }
    }
  });

  it('verifies Xiangqi AI supports easy, medium, and hard levels', () => {
    const board = createInitialXiangqiBoard();

    for (const diff of ['easy', 'medium', 'hard'] as const) {
      const move = chooseXiangqiAiMove(board, 'black', diff);
      expect(move).not.toBeNull();
      if (move) {
        expect(move.fromR).toBeGreaterThanOrEqual(0);
        expect(move.toR).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('verifies Chinese Checkers AI supports easy, medium, and hard levels', () => {
    const aiPlayer: PlayerConfig = {
      id: 2,
      campId: 0,
      targetCampId: 3,
      name: '萌宝小贝',
      avatar: '🐼',
      colorName: '蓝宝石',
      colorHex: '#3b82f6',
      darkColorHex: '#1e40af',
      glowColor: '#93c5fd',
      isAi: true
    };
    const boardState: Record<string, number> = {};
    for (const nodeId of CAMPS[0]) {
      boardState[nodeId] = 2;
    }

    for (const diff of ['easy', 'medium', 'hard'] as const) {
      const move = chooseAiMove({ ...aiPlayer, aiDifficulty: diff }, boardState);
      expect(move).not.toBeNull();
    }
  });
});
