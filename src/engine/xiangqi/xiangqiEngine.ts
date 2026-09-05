export type XiangqiSide = 'red' | 'black';
export type XiangqiPieceType =
  | 'king'
  | 'advisor'
  | 'elephant'
  | 'horse'
  | 'chariot'
  | 'cannon'
  | 'pawn';

export interface XiangqiPiece {
  type: XiangqiPieceType;
  side: XiangqiSide;
}

export type XiangqiBoard = (XiangqiPiece | null)[][];

export interface XiangqiPoint {
  r: number;
  c: number;
}

export interface XiangqiMove {
  fromR: number;
  fromC: number;
  toR: number;
  toC: number;
  piece: XiangqiPiece;
  captured: XiangqiPiece | null;
  stepIndex: number;
  notation: string;
  redWinRate: number;
  blackWinRate: number;
  delta: number;
  timestamp: number;
}

export type XiangqiGameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate';

export const XIANGQI_ROWS = 10;
export const XIANGQI_COLS = 9;

export const XIANGQI_LABEL: Record<XiangqiSide, Record<XiangqiPieceType, string>> = {
  red: {
    king: '帅',
    advisor: '仕',
    elephant: '相',
    horse: '馬',
    chariot: '車',
    cannon: '炮',
    pawn: '兵'
  },
  black: {
    king: '将',
    advisor: '士',
    elephant: '象',
    horse: '馬',
    chariot: '車',
    cannon: '砲',
    pawn: '卒'
  }
};

const HORSE_STEPS = [
  { dr: -2, dc: -1, blockR: -1, blockC: 0 },
  { dr: -2, dc: 1, blockR: -1, blockC: 0 },
  { dr: 2, dc: -1, blockR: 1, blockC: 0 },
  { dr: 2, dc: 1, blockR: 1, blockC: 0 },
  { dr: -1, dc: -2, blockR: 0, blockC: -1 },
  { dr: 1, dc: -2, blockR: 0, blockC: -1 },
  { dr: -1, dc: 2, blockR: 0, blockC: 1 },
  { dr: 1, dc: 2, blockR: 0, blockC: 1 }
];

const ELEPHANT_STEPS = [
  { dr: -2, dc: -2, eyeR: -1, eyeC: -1 },
  { dr: -2, dc: 2, eyeR: -1, eyeC: 1 },
  { dr: 2, dc: -2, eyeR: 1, eyeC: -1 },
  { dr: 2, dc: 2, eyeR: 1, eyeC: 1 }
];

const ORTHO = [
  { dr: -1, dc: 0 },
  { dr: 1, dc: 0 },
  { dr: 0, dc: -1 },
  { dr: 0, dc: 1 }
];

const DIAG = [
  { dr: -1, dc: -1 },
  { dr: -1, dc: 1 },
  { dr: 1, dc: -1 },
  { dr: 1, dc: 1 }
];

const MATERIAL: Record<XiangqiPieceType, number> = {
  king: 10000,
  chariot: 900,
  cannon: 450,
  horse: 400,
  advisor: 200,
  elephant: 200,
  pawn: 100
};

export function oppositeSide(side: XiangqiSide): XiangqiSide {
  return side === 'red' ? 'black' : 'red';
}

export function inBoard(r: number, c: number): boolean {
  return r >= 0 && r < XIANGQI_ROWS && c >= 0 && c < XIANGQI_COLS;
}

export function inPalace(r: number, c: number, side: XiangqiSide): boolean {
  if (c < 3 || c > 5) return false;
  return side === 'red' ? r >= 7 && r <= 9 : r >= 0 && r <= 2;
}

export function hasCrossedRiver(r: number, side: XiangqiSide): boolean {
  return side === 'red' ? r <= 4 : r >= 5;
}

export function pawnForward(side: XiangqiSide): number {
  return side === 'red' ? -1 : 1;
}

export function createEmptyXiangqiBoard(): XiangqiBoard {
  return Array.from({ length: XIANGQI_ROWS }, () => Array(XIANGQI_COLS).fill(null));
}

export interface XiangqiSetupPiece {
  r: number;
  c: number;
  type: XiangqiPieceType;
  side: XiangqiSide;
}

export function boardFromPieces(pieces: XiangqiSetupPiece[]): XiangqiBoard {
  const board = createEmptyXiangqiBoard();
  for (const item of pieces) {
    if (!inBoard(item.r, item.c)) continue;
    board[item.r][item.c] = { type: item.type, side: item.side };
  }
  return board;
}

function piece(type: XiangqiPieceType, side: XiangqiSide): XiangqiPiece {
  return { type, side };
}

export function createInitialXiangqiBoard(): XiangqiBoard {
  const board = createEmptyXiangqiBoard();
  const back: XiangqiPieceType[] = [
    'chariot',
    'horse',
    'elephant',
    'advisor',
    'king',
    'advisor',
    'elephant',
    'horse',
    'chariot'
  ];

  for (let c = 0; c < XIANGQI_COLS; c++) {
    board[0][c] = piece(back[c], 'black');
    board[9][c] = piece(back[c], 'red');
  }

  board[2][1] = piece('cannon', 'black');
  board[2][7] = piece('cannon', 'black');
  board[7][1] = piece('cannon', 'red');
  board[7][7] = piece('cannon', 'red');

  for (const c of [0, 2, 4, 6, 8]) {
    board[3][c] = piece('pawn', 'black');
    board[6][c] = piece('pawn', 'red');
  }

  return board;
}

export function cloneXiangqiBoard(board: XiangqiBoard): XiangqiBoard {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

export function findKing(board: XiangqiBoard, side: XiangqiSide): XiangqiPoint | null {
  for (let r = 0; r < XIANGQI_ROWS; r++) {
    for (let c = 0; c < XIANGQI_COLS; c++) {
      const cell = board[r][c];
      if (cell && cell.type === 'king' && cell.side === side) {
        return { r, c };
      }
    }
  }
  return null;
}

function kingsFaceEachOther(board: XiangqiBoard): boolean {
  const redKing = findKing(board, 'red');
  const blackKing = findKing(board, 'black');
  if (!redKing || !blackKing || redKing.c !== blackKing.c) return false;

  const minR = Math.min(redKing.r, blackKing.r);
  const maxR = Math.max(redKing.r, blackKing.r);
  for (let r = minR + 1; r < maxR; r++) {
    if (board[r][redKing.c]) return false;
  }
  return true;
}

function addIfEnemyOrEmpty(
  board: XiangqiBoard,
  side: XiangqiSide,
  r: number,
  c: number,
  out: XiangqiPoint[]
): boolean {
  if (!inBoard(r, c)) return false;
  const cell = board[r][c];
  if (!cell) {
    out.push({ r, c });
    return true;
  }
  if (cell.side !== side) out.push({ r, c });
  return false;
}

export function generateRawMoves(board: XiangqiBoard, r: number, c: number): XiangqiPoint[] {
  const pieceOn = board[r][c];
  if (!pieceOn) return [];

  const { type, side } = pieceOn;
  const moves: XiangqiPoint[] = [];

  if (type === 'king') {
    for (const step of ORTHO) {
      const nr = r + step.dr;
      const nc = c + step.dc;
      if (!inPalace(nr, nc, side)) continue;
      addIfEnemyOrEmpty(board, side, nr, nc, moves);
    }
    return moves;
  }

  if (type === 'advisor') {
    for (const step of DIAG) {
      const nr = r + step.dr;
      const nc = c + step.dc;
      if (!inPalace(nr, nc, side)) continue;
      addIfEnemyOrEmpty(board, side, nr, nc, moves);
    }
    return moves;
  }

  if (type === 'elephant') {
    for (const step of ELEPHANT_STEPS) {
      const nr = r + step.dr;
      const nc = c + step.dc;
      const eyeR = r + step.eyeR;
      const eyeC = c + step.eyeC;
      if (!inBoard(nr, nc) || board[eyeR][eyeC]) continue;
      if (side === 'red' && nr < 5) continue;
      if (side === 'black' && nr > 4) continue;
      addIfEnemyOrEmpty(board, side, nr, nc, moves);
    }
    return moves;
  }

  if (type === 'horse') {
    for (const step of HORSE_STEPS) {
      const blockR = r + step.blockR;
      const blockC = c + step.blockC;
      if (!inBoard(blockR, blockC) || board[blockR][blockC]) continue;
      addIfEnemyOrEmpty(board, side, r + step.dr, c + step.dc, moves);
    }
    return moves;
  }

  if (type === 'chariot') {
    for (const step of ORTHO) {
      let nr = r + step.dr;
      let nc = c + step.dc;
      while (inBoard(nr, nc)) {
        const canContinue = addIfEnemyOrEmpty(board, side, nr, nc, moves);
        if (!canContinue) break;
        nr += step.dr;
        nc += step.dc;
      }
    }
    return moves;
  }

  if (type === 'cannon') {
    for (const step of ORTHO) {
      let nr = r + step.dr;
      let nc = c + step.dc;
      let jumped = false;
      while (inBoard(nr, nc)) {
        const cell = board[nr][nc];
        if (!jumped) {
          if (!cell) {
            moves.push({ r: nr, c: nc });
          } else {
            jumped = true;
          }
        } else if (cell) {
          if (cell.side !== side) moves.push({ r: nr, c: nc });
          break;
        }
        nr += step.dr;
        nc += step.dc;
      }
    }
    return moves;
  }

  const forward = pawnForward(side);
  addIfEnemyOrEmpty(board, side, r + forward, c, moves);
  if (hasCrossedRiver(r, side)) {
    addIfEnemyOrEmpty(board, side, r, c - 1, moves);
    addIfEnemyOrEmpty(board, side, r, c + 1, moves);
  }
  return moves;
}

export function isInCheck(board: XiangqiBoard, side: XiangqiSide): boolean {
  const king = findKing(board, side);
  if (!king) return true;
  if (kingsFaceEachOther(board)) return true;

  for (let r = 0; r < XIANGQI_ROWS; r++) {
    for (let c = 0; c < XIANGQI_COLS; c++) {
      const cell = board[r][c];
      if (!cell || cell.side === side) continue;
      const attacks = generateRawMoves(board, r, c);
      if (attacks.some((pt) => pt.r === king.r && pt.c === king.c)) {
        return true;
      }
    }
  }
  return false;
}

function applyMoveMut(
  board: XiangqiBoard,
  fromR: number,
  fromC: number,
  toR: number,
  toC: number
): XiangqiPiece | null {
  const captured = board[toR][toC];
  board[toR][toC] = board[fromR][fromC];
  board[fromR][fromC] = null;
  return captured;
}

function undoMoveMut(
  board: XiangqiBoard,
  fromR: number,
  fromC: number,
  toR: number,
  toC: number,
  captured: XiangqiPiece | null
): void {
  board[fromR][fromC] = board[toR][toC];
  board[toR][toC] = captured;
}

export interface XiangqiLegalMove {
  fromR: number;
  fromC: number;
  toR: number;
  toC: number;
  captured: XiangqiPiece | null;
}

export function generateLegalMoves(board: XiangqiBoard, side: XiangqiSide): XiangqiLegalMove[] {
  const legal: XiangqiLegalMove[] = [];

  for (let r = 0; r < XIANGQI_ROWS; r++) {
    for (let c = 0; c < XIANGQI_COLS; c++) {
      const cell = board[r][c];
      if (!cell || cell.side !== side) continue;
      const raw = generateRawMoves(board, r, c);
      for (const dest of raw) {
        const captured = applyMoveMut(board, r, c, dest.r, dest.c);
        const safe = !isInCheck(board, side);
        undoMoveMut(board, r, c, dest.r, dest.c, captured);
        if (safe) {
          legal.push({
            fromR: r,
            fromC: c,
            toR: dest.r,
            toC: dest.c,
            captured
          });
        }
      }
    }
  }

  return legal;
}

export function generateLegalMovesFrom(
  board: XiangqiBoard,
  r: number,
  c: number
): XiangqiLegalMove[] {
  const cell = board[r][c];
  if (!cell) return [];
  return generateLegalMoves(board, cell.side).filter((m) => m.fromR === r && m.fromC === c);
}

export function getPositionStatus(board: XiangqiBoard, side: XiangqiSide): XiangqiGameStatus {
  const legal = generateLegalMoves(board, side);
  const checked = isInCheck(board, side);
  if (legal.length === 0) return checked ? 'checkmate' : 'stalemate';
  return checked ? 'check' : 'playing';
}

export function toIccs(r: number, c: number): string {
  return `${String.fromCharCode(97 + c)}${9 - r}`;
}

export function formatXiangqiMove(
  pieceOn: XiangqiPiece,
  fromR: number,
  fromC: number,
  toR: number,
  toC: number,
  captured: XiangqiPiece | null
): string {
  const sideName = pieceOn.side === 'red' ? '红' : '黑';
  const name = XIANGQI_LABEL[pieceOn.side][pieceOn.type];
  const verb = captured ? '吃' : '走';
  return `${sideName}${name} ${toIccs(fromR, fromC)}${verb}${toIccs(toR, toC)}`;
}

export function applyXiangqiMove(
  board: XiangqiBoard,
  fromR: number,
  fromC: number,
  toR: number,
  toC: number
): { board: XiangqiBoard; captured: XiangqiPiece | null; notation: string } | null {
  const moving = board[fromR]?.[fromC];
  if (!moving) return null;

  const legal = generateLegalMovesFrom(board, fromR, fromC);
  const match = legal.find((m) => m.toR === toR && m.toC === toC);
  if (!match) return null;

  const next = cloneXiangqiBoard(board);
  const captured = applyMoveMut(next, fromR, fromC, toR, toC);
  return {
    board: next,
    captured,
    notation: formatXiangqiMove(moving, fromR, fromC, toR, toC, captured)
  };
}

function pawnValue(r: number, side: XiangqiSide): number {
  return hasCrossedRiver(r, side) ? 220 : 100;
}

function piecePosBonus(type: XiangqiPieceType, r: number, c: number, side: XiangqiSide): number {
  const center = 4 - Math.abs(c - 4);
  if (type === 'horse' || type === 'cannon') return center * 8;
  if (type === 'chariot') return center * 4;
  if (type === 'pawn') {
    const advanced = side === 'red' ? 9 - r : r;
    return advanced * 6 + (hasCrossedRiver(r, side) ? 30 : 0);
  }
  return 0;
}

export function evaluateXiangqiBoard(board: XiangqiBoard): number {
  let score = 0;
  for (let r = 0; r < XIANGQI_ROWS; r++) {
    for (let c = 0; c < XIANGQI_COLS; c++) {
      const cell = board[r][c];
      if (!cell) continue;
      const base = cell.type === 'pawn' ? pawnValue(r, cell.side) : MATERIAL[cell.type];
      const bonus = piecePosBonus(cell.type, r, c, cell.side);
      const signed = cell.side === 'red' ? 1 : -1;
      score += signed * (base + bonus);
    }
  }
  return score;
}

export function evaluateXiangqiWinRate(board: XiangqiBoard): {
  redWinRate: number;
  blackWinRate: number;
  leadScore: number;
  statusText: string;
} {
  const leadScore = evaluateXiangqiBoard(board);
  const raw = 1 / (1 + Math.exp(-0.004 * leadScore));
  const redWinRate = Math.max(4, Math.min(96, Math.round(raw * 100)));
  const blackWinRate = 100 - redWinRate;

  let statusText = '双方均势胶着';
  if (redWinRate >= 80) statusText = '红方胜势明显';
  else if (redWinRate >= 60) statusText = '红方略占主动';
  else if (blackWinRate >= 80) statusText = '黑方胜势明显';
  else if (blackWinRate >= 60) statusText = '黑方略占主动';

  return { redWinRate, blackWinRate, leadScore, statusText };
}

function evalForSide(board: XiangqiBoard, side: XiangqiSide): number {
  const redScore = evaluateXiangqiBoard(board);
  return side === 'red' ? redScore : -redScore;
}

function searchBest(
  board: XiangqiBoard,
  side: XiangqiSide,
  depth: number
): { move: XiangqiLegalMove | null; score: number } {
  const moves = generateLegalMoves(board, side);
  if (moves.length === 0) {
    const checked = isInCheck(board, side);
    return { move: null, score: checked ? -20000 - depth : -18000 - depth };
  }

  moves.sort((a, b) => {
    const capA = a.captured ? MATERIAL[a.captured.type] : 0;
    const capB = b.captured ? MATERIAL[b.captured.type] : 0;
    return capB - capA;
  });

  if (depth === 0) {
    return { move: moves[0], score: evalForSide(board, side) };
  }

  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    const captured = applyMoveMut(board, move.fromR, move.fromC, move.toR, move.toC);
    const reply = searchBest(board, oppositeSide(side), depth - 1);
    undoMoveMut(board, move.fromR, move.fromC, move.toR, move.toC, captured);
    const score = -reply.score;
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return { move: bestMove, score: bestScore };
}

export function chooseXiangqiAiMove(
  board: XiangqiBoard,
  aiSide: XiangqiSide,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): XiangqiLegalMove | null {
  const working = cloneXiangqiBoard(board);
  const moves = generateLegalMoves(working, aiSide);
  if (moves.length === 0) return null;

  if (difficulty === 'easy') {
    const scored = moves.map((move) => {
      const captured = applyMoveMut(working, move.fromR, move.fromC, move.toR, move.toC);
      const score = evalForSide(working, aiSide);
      undoMoveMut(working, move.fromR, move.fromC, move.toR, move.toC, captured);
      return { move, score };
    });
    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, Math.min(6, scored.length));
    return top[Math.floor(Math.random() * top.length)].move;
  }

  const depth = difficulty === 'hard' ? 2 : 1;
  return searchBest(working, aiSide, depth).move;
}

export function replayXiangqiMoves(
  moves: Array<Pick<XiangqiMove, 'fromR' | 'fromC' | 'toR' | 'toC'>>,
  untilStep = moves.length
): XiangqiBoard {
  const board = createInitialXiangqiBoard();
  const limit = Math.max(0, Math.min(moves.length, untilStep));
  for (let i = 0; i < limit; i++) {
    const move = moves[i];
    applyMoveMut(board, move.fromR, move.fromC, move.toR, move.toC);
  }
  return board;
}
