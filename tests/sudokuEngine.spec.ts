import { describe, it, expect } from 'vitest';
import {
  generateSudokuPuzzle,
  solveSudoku,
  isValidPlacement,
  findSmartHint,
  PRESET_SUDOKU_LEVELS
} from '../src/engine/sudoku/sudokuEngine';

describe('Sudoku Engine Unit Tests', () => {
  it('should validate placements accurately for 4x4, 6x6, 9x9', () => {
    const grid4 = [
      [1, 2, 0, 0],
      [3, 4, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    expect(isValidPlacement(grid4, 0, 2, 3, 4)).toBe(true);
    expect(isValidPlacement(grid4, 0, 2, 1, 4)).toBe(false); // Row conflict
    expect(isValidPlacement(grid4, 2, 0, 1, 4)).toBe(false); // Col conflict
    expect(isValidPlacement(grid4, 0, 1, 4, 4)).toBe(false); // Box conflict
  });

  it('should solve all preset levels with valid solutions', () => {
    for (const preset of PRESET_SUDOKU_LEVELS) {
      const result = solveSudoku(preset.initialGrid, preset.size);
      expect(result.solved).toBe(true);
      expect(result.count).toBe(1); // Unique solution
      expect(result.solution).toEqual(preset.solutionGrid);
    }
  });

  it('should generate 4x4 and 6x6 puzzles with guaranteed unique solutions', () => {
    const puzzle4 = generateSudokuPuzzle(4, 'easy');
    const solve4 = solveSudoku(puzzle4.initial, 4, true, 2);
    expect(solve4.solved).toBe(true);
    expect(solve4.count).toBe(1);

    const puzzle6 = generateSudokuPuzzle(6, 'easy');
    const solve6 = solveSudoku(puzzle6.initial, 6, true, 2);
    expect(solve6.solved).toBe(true);
    expect(solve6.count).toBe(1);
  });

  it('should provide smart deductive hints correctly', () => {
    const grid4 = [
      [1, 2, 3, 0],
      [3, 4, 1, 2],
      [2, 1, 4, 3],
      [4, 3, 2, 1]
    ];
    const solution4 = [
      [1, 2, 3, 4],
      [3, 4, 1, 2],
      [2, 1, 4, 3],
      [4, 3, 2, 1]
    ];
    const hint = findSmartHint(grid4, solution4, 4);
    expect(hint).not.toBeNull();
    expect(hint?.row).toBe(0);
    expect(hint?.col).toBe(3);
    expect(hint?.value).toBe(4);
    expect(hint?.technique).toBe('naked_single');
  });
});
