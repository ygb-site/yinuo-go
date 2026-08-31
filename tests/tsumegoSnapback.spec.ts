import { describe, it, expect } from 'vitest';
import { GoGame } from '../src/engine/GoGame';
import { TSUMEGO_PUZZLES } from '../src/data/tsumegoLibrary';
import { getOpponent } from '../src/engine/types';

function setupPuzzle(puzzleId: string): { game: GoGame; puzzle: (typeof TSUMEGO_PUZZLES)[number] } {
  const puzzle = TSUMEGO_PUZZLES.find(item => item.id === puzzleId);
  if (!puzzle) {
    throw new Error(`找不到死活题 ${puzzleId}`);
  }

  const game = new GoGame(puzzle.boardSize);
  for (const stone of puzzle.initialStones) {
    game.setCell(stone.r, stone.c, stone.color);
  }
  game.turn = puzzle.playerColor;
  return { game, puzzle };
}

describe('死活倒扑题可完成', () => {
  it('ts_cap_4 诱饵、白提、反提三步都合法且能提掉白棋', () => {
    const { game, puzzle } = setupPuzzle('ts_cap_4');
    const first = puzzle.correctMoves[0];
    const branch = puzzle.botBranchMoves;
    expect(branch).toBeTruthy();
    if (!branch) return;

    const bait = game.playMove(first.r, first.c, puzzle.playerColor);
    expect(bait.success).toBe(true);
    expect(bait.capturedStones).toHaveLength(0);

    const botColor = getOpponent(puzzle.playerColor);
    const whiteCapture = game.playMove(branch.botMove.r, branch.botMove.c, botColor);
    expect(whiteCapture.success).toBe(true);
    expect(whiteCapture.capturedStones).toHaveLength(1);
    expect(game.getCell(first.r, first.c)).toBeNull();

    const recapture = game.playMove(branch.nextValidMove.r, branch.nextValidMove.c, puzzle.playerColor);
    expect(recapture.success).toBe(true);
    expect(recapture.capturedStones.length).toBeGreaterThanOrEqual(2);
  });

  it('所有带白棋应手的死活题，谱着必须能完整下完', () => {
    const branched = TSUMEGO_PUZZLES.filter(puzzle => puzzle.botBranchMoves);
    expect(branched.length).toBeGreaterThan(0);

    for (const puzzle of branched) {
      const { game } = setupPuzzle(puzzle.id);
      const first = puzzle.correctMoves[0];
      const branch = puzzle.botBranchMoves!;
      const bait = game.playMove(first.r, first.c, puzzle.playerColor);
      expect(bait.success, `${puzzle.id} 第一手非法`).toBe(true);

      const botColor = getOpponent(puzzle.playerColor);
      const botMove = game.playMove(branch.botMove.r, branch.botMove.c, botColor);
      expect(botMove.success, `${puzzle.id} 白棋应手非法: ${botMove.errorReason}`).toBe(true);

      const recapture = game.playMove(branch.nextValidMove.r, branch.nextValidMove.c, puzzle.playerColor);
      expect(recapture.success, `${puzzle.id} 反提非法: ${recapture.errorReason}`).toBe(true);
    }
  });
});
