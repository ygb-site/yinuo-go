import { describe, it, expect, beforeEach } from 'vitest';
import { GoGame } from '../src/engine/GoGame';

describe('GoGame Core Engine Tests', () => {
  let game: GoGame;

  beforeEach(() => {
    game = new GoGame(9);
  });

  it('should initialize empty 9x9 board correctly', () => {
    expect(game.size).toBe(9);
    expect(game.grid.length).toBe(9);
    expect(game.grid[0].length).toBe(9);
    expect(game.turn).toBe('B');
    expect(game.capturedByBlack).toBe(0);
    expect(game.capturedByWhite).toBe(0);
  });

  describe('Liberties Calculation', () => {
    it('should calculate 4 liberties for an isolated center stone', () => {
      game.playMove(4, 4); // Black
      expect(game.getLibertiesCount(4, 4)).toBe(4);
    });

    it('should calculate 3 liberties for an edge stone', () => {
      game.playMove(0, 4); // Black
      expect(game.getLibertiesCount(0, 4)).toBe(3);
    });

    it('should calculate 2 liberties for a corner stone', () => {
      game.playMove(0, 0); // Black
      expect(game.getLibertiesCount(0, 0)).toBe(2);
    });

    it('should merge liberties when stones connect', () => {
      game.playMove(4, 4); // Black
      game.playMove(0, 0); // White
      game.playMove(4, 5); // Black connects
      // 2 connected center stones have 6 shared liberties
      expect(game.getLibertiesCount(4, 4)).toBe(6);
      expect(game.getLibertiesCount(4, 5)).toBe(6);
    });
  });

  describe('Capture Logic', () => {
    it('should capture a single stone when all 4 liberties are filled', () => {
      // White in center (4, 4)
      game.playMove(0, 0); // B
      game.playMove(4, 4); // W
      game.playMove(3, 4); // B top
      game.playMove(0, 1); // W
      game.playMove(5, 4); // B bottom
      game.playMove(0, 2); // W
      game.playMove(4, 3); // B left
      game.playMove(0, 3); // W

      // White at 4,4 has 1 liberty left (4, 5)
      expect(game.getLibertiesCount(4, 4)).toBe(1);

      // Black plays last liberty (4, 5)
      const res = game.playMove(4, 5);
      expect(res.success).toBe(true);
      expect(res.capturedStones.length).toBe(1);
      expect(game.getCell(4, 4)).toBeNull();
      expect(game.capturedByBlack).toBe(1);
    });

    it('should capture a group of multiple stones', () => {
      // Place two white stones in corner (0,0) and (0,1)
      game.playMove(1, 0); // B
      game.playMove(0, 0); // W
      game.playMove(1, 1); // B
      game.playMove(0, 1); // W

      // White group has 1 liberty at (0, 2)
      expect(game.getLibertiesCount(0, 0)).toBe(1);

      // Black captures by playing (0, 2)
      const res = game.playMove(0, 2);
      expect(res.success).toBe(true);
      expect(res.capturedStones.length).toBe(2);
      expect(game.getCell(0, 0)).toBeNull();
      expect(game.getCell(0, 1)).toBeNull();
      expect(game.capturedByBlack).toBe(2);
    });
  });

  describe('Suicide Move Prohibition', () => {
    it('should reject suicide moves that do not capture any stone', () => {
      // White surrounds (1, 1)
      game.playMove(0, 0); // B
      game.playMove(0, 1); // W
      game.playMove(0, 8); // B
      game.playMove(2, 1); // W
      game.playMove(8, 8); // B
      game.playMove(1, 0); // W
      game.playMove(8, 0); // B
      game.playMove(1, 2); // W

      // (1,1) is completely surrounded by White. Black playing (1,1) has 0 liberties.
      const isLegal = game.isLegalMove(1, 1, 'B');
      expect(isLegal.legal).toBe(false);
      expect(isLegal.reason).toContain('自杀');
    });

    it('should allow playing in tight spot if it captures opponent stones (capture priority)', () => {
      // Setup position where playing captures enemy group
      game.playMove(0, 1); // B
      game.playMove(0, 0); // W (1 liberty at 1,0)
      
      // Black plays (1, 0) which completes capture of (0,0)
      const isLegal = game.isLegalMove(1, 0, 'B');
      expect(isLegal.legal).toBe(true);
      const res = game.playMove(1, 0);
      expect(res.success).toBe(true);
      expect(res.capturedStones.length).toBe(1);
    });
  });

  describe('Ko Rule (打劫禁着)', () => {
    it('should forbid immediate recapture in a single-stone Ko situation', () => {
      game.setCell(2, 2, 'B');
      game.setCell(4, 2, 'B');
      game.setCell(3, 1, 'B');

      game.setCell(2, 3, 'W');
      game.setCell(4, 3, 'W');
      game.setCell(3, 4, 'W');
      game.setCell(3, 2, 'W'); // White stone with 1 liberty at (3,3)

      game.turn = 'B';
      const moveRes = game.playMove(3, 3); // Black captures (3,2)
      expect(moveRes.success).toBe(true);
      expect(moveRes.capturedStones.length).toBe(1);
      expect(game.koPoint).toEqual({ r: 3, c: 2 });

      // Immediate recapture at (3,2) by White is forbidden by Ko rule.
      const wLegal = game.isLegalMove(3, 2, 'W');
      expect(wLegal.legal).toBe(false);
      expect(wLegal.reason).toContain('打劫');
    });
  });

  describe('Eye Evaluation (真假眼判定)', () => {
    it('should identify a true eye in the center when all 4 diagonals are safe', () => {
      // Black forms circle around (4,4)
      game.setCell(3, 4, 'B');
      game.setCell(5, 4, 'B');
      game.setCell(4, 3, 'B');
      game.setCell(4, 5, 'B');
      // Diagonals also filled by Black
      game.setCell(3, 3, 'B');
      game.setCell(3, 5, 'B');
      game.setCell(5, 3, 'B');
      game.setCell(5, 5, 'B');

      const eye = game.evaluateEye(4, 4, 'B');
      expect(eye.status).toBe('REAL');
    });

    it('should identify a false eye when diagonals are controlled by opponent', () => {
      // Black orthogonal surrounding (4,4)
      game.setCell(3, 4, 'B');
      game.setCell(5, 4, 'B');
      game.setCell(4, 3, 'B');
      game.setCell(4, 5, 'B');
      // Opponent controls 2 or more diagonals in center
      game.setCell(3, 3, 'W');
      game.setCell(5, 5, 'W');

      const eye = game.evaluateEye(4, 4, 'B');
      expect(eye.status).toBe('FALSE');
    });
  });

  describe('Self Tests Execution', () => {
    it('should pass built-in engine self tests', () => {
      const selfTest = GoGame.runSelfTests();
      expect(selfTest.success).toBe(true);
      expect(selfTest.passed).toBe(selfTest.total);
    });
  });
});
