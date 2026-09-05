import { describe, expect, it } from 'vitest';
import {
  applyXiangqiMove,
  chooseXiangqiAiMove,
  createEmptyXiangqiBoard,
  createInitialXiangqiBoard,
  generateLegalMoves,
  generateLegalMovesFrom,
  generateRawMoves,
  getPositionStatus,
  isInCheck,
  replayXiangqiMoves,
  type XiangqiBoard,
  type XiangqiPiece
} from '../src/engine/xiangqi/xiangqiEngine';

function put(board: XiangqiBoard, r: number, c: number, type: XiangqiPiece['type'], side: XiangqiPiece['side']) {
  board[r][c] = { type, side };
}

describe('中国象棋引擎', () => {
  it('开局双方各 16 子，红先可走车、马、炮、兵', () => {
    const board = createInitialXiangqiBoard();
    let count = 0;
    for (const row of board) {
      for (const cell of row) {
        if (cell) count++;
      }
    }
    expect(count).toBe(32);

    const redMoves = generateLegalMoves(board, 'red');
    expect(redMoves.length).toBeGreaterThan(10);
    expect(redMoves.some((m) => board[m.fromR][m.fromC]?.type === 'chariot')).toBe(true);
    expect(redMoves.some((m) => board[m.fromR][m.fromC]?.type === 'cannon')).toBe(true);
  });

  it('马被蹩腿时不能跳过去', () => {
    const board = createEmptyXiangqiBoard();
    put(board, 9, 1, 'horse', 'red');
    put(board, 8, 1, 'pawn', 'red');
    const moves = generateRawMoves(board, 9, 1);
    expect(moves.some((m) => m.r === 7 && m.c === 0)).toBe(false);
    expect(moves.some((m) => m.r === 7 && m.c === 2)).toBe(false);
  });

  it('象不能过河，象眼被塞也不能走', () => {
    const board = createEmptyXiangqiBoard();
    put(board, 5, 2, 'elephant', 'red');
    put(board, 6, 3, 'pawn', 'black');
    const moves = generateRawMoves(board, 5, 2);
    expect(moves.some((m) => m.r === 7 && m.c === 4)).toBe(false);
    expect(moves.some((m) => m.r === 3 && m.c === 0)).toBe(false);
    expect(moves.some((m) => m.r === 3 && m.c === 4)).toBe(false);
  });

  it('炮隔一子才能吃，中间没有炮架不能吃', () => {
    const board = createEmptyXiangqiBoard();
    put(board, 7, 1, 'cannon', 'red');
    put(board, 3, 1, 'horse', 'black');
    const emptyEat = generateRawMoves(board, 7, 1);
    expect(emptyEat.some((m) => m.r === 3 && m.c === 1)).toBe(false);

    put(board, 5, 1, 'pawn', 'black');
    const withScreen = generateRawMoves(board, 7, 1);
    expect(withScreen.some((m) => m.r === 3 && m.c === 1)).toBe(true);
  });

  it('兵未过河只能向前，过河后可以横走', () => {
    const board = createEmptyXiangqiBoard();
    put(board, 6, 4, 'pawn', 'red');
    const before = generateRawMoves(board, 6, 4);
    expect(before).toEqual([{ r: 5, c: 4 }]);

    put(board, 4, 4, 'pawn', 'red');
    const after = generateRawMoves(board, 4, 4);
    expect(after).toEqual(
      expect.arrayContaining([
        { r: 3, c: 4 },
        { r: 4, c: 3 },
        { r: 4, c: 5 }
      ])
    );
    expect(after.some((m) => m.r === 5 && m.c === 4)).toBe(false);
  });

  it('将帅对面中间无子时，让开中路的走法不合法', () => {
    const board = createEmptyXiangqiBoard();
    put(board, 9, 4, 'king', 'red');
    put(board, 0, 4, 'king', 'black');
    put(board, 5, 4, 'chariot', 'red');
    put(board, 7, 0, 'chariot', 'red');

    const sideways = generateLegalMovesFrom(board, 5, 4);
    expect(sideways.some((m) => m.toC !== 4)).toBe(false);
    expect(isInCheck(board, 'red')).toBe(false);
  });

  it('双车困宫时判定为将死', () => {
    const board = createEmptyXiangqiBoard();
    put(board, 9, 3, 'king', 'red');
    put(board, 0, 4, 'king', 'black');
    put(board, 0, 8, 'chariot', 'red');
    put(board, 1, 0, 'chariot', 'red');

    expect(getPositionStatus(board, 'black')).toBe('checkmate');
  });

  it('合法走子后棋盘更新，复盘能还原', () => {
    const start = createInitialXiangqiBoard();
    const first = applyXiangqiMove(start, 6, 4, 5, 4);
    expect(first).not.toBeNull();
    expect(first?.board[5][4]?.type).toBe('pawn');
    expect(first?.board[6][4]).toBeNull();

    const restored = replayXiangqiMoves([
      { fromR: 6, fromC: 4, toR: 5, toC: 4 }
    ]);
    expect(restored[5][4]?.type).toBe('pawn');
    expect(restored[6][4]).toBeNull();
  });

  it('人机在开局能给出一步合法着法', () => {
    const board = createInitialXiangqiBoard();
    const move = chooseXiangqiAiMove(board, 'red', 'easy');
    expect(move).not.toBeNull();
    const legal = generateLegalMoves(board, 'red');
    expect(legal.some((m) =>
      m.fromR === move?.fromR && m.fromC === move.fromC && m.toR === move.toR && m.toC === move.toC
    )).toBe(true);
  });
});
