// Gomoku (五子棋) Core Engine
// 15x15 Board, Win Check, AI Opponent (3 Difficulties), Win-rate Evaluation, Move Quality & Puzzles

export type StoneColor = 1 | 2; // 1 = Black (先行), 2 = White (后行)

export interface GomokuMove {
  r: number;
  c: number;
  player: StoneColor;
  stepIndex: number;
  blackWinRate: number;
  whiteWinRate: number;
  delta: number;
  quality: 'god_move' | 'great_move' | 'normal_move' | 'slow_move' | 'blunder';
  qualityBadge: string;
  qualityDesc: string;
  comment: string;
  timestamp: number;
}

export interface GomokuPuzzle {
  id: number;
  title: string;
  desc: string;
  targetGoalText: string;
  player: StoneColor;
  initialBoard: number[][];
  targetPoint: { r: number; c: number };
}

export const GOMOKU_BOARD_SIZE = 15;

// Star Points (天元与星位)
export const GOMOKU_STAR_POINTS = [
  { r: 3, c: 3 },
  { r: 3, c: 11 },
  { r: 7, c: 7 }, // 天元
  { r: 11, c: 3 },
  { r: 11, c: 11 }
];

export function createEmptyBoard(): number[][] {
  return Array.from({ length: GOMOKU_BOARD_SIZE }, () =>
    Array(GOMOKU_BOARD_SIZE).fill(0)
  );
}

// 4 Directions for Gomoku check
const DIRECTIONS = [
  [0, 1],  // Horizontal
  [1, 0],  // Vertical
  [1, 1],  // Main diagonal (\)
  [1, -1]  // Anti diagonal (/)
];

// Check if move results in 5 in a row
export function checkGomokuWin(
  board: number[][],
  r: number,
  c: number,
  player: StoneColor
): { win: boolean; winningLine?: { r: number; c: number }[] } {
  for (const [dr, dc] of DIRECTIONS) {
    const line = [{ r, c }];

    // Forward
    for (let step = 1; step < 5; step++) {
      const nr = r + dr * step;
      const nc = c + dc * step;
      if (nr < 0 || nr >= GOMOKU_BOARD_SIZE || nc < 0 || nc >= GOMOKU_BOARD_SIZE || board[nr][nc] !== player) {
        break;
      }
      line.push({ r: nr, c: nc });
    }

    // Backward
    for (let step = 1; step < 5; step++) {
      const nr = r - dr * step;
      const nc = c - dc * step;
      if (nr < 0 || nr >= GOMOKU_BOARD_SIZE || nc < 0 || nc >= GOMOKU_BOARD_SIZE || board[nr][nc] !== player) {
        break;
      }
      line.unshift({ r: nr, c: nc });
    }

    if (line.length >= 5) {
      return { win: true, winningLine: line };
    }
  }

  return { win: false };
}

// Evaluate line pattern score for a single point
function evaluatePointPattern(board: number[][], r: number, c: number, player: StoneColor): number {
  let totalScore = 0;
  const opp = player === 1 ? 2 : 1;

  for (const [dr, dc] of DIRECTIONS) {
    let count = 1;
    let openEnds = 0;

    // Check forward
    let step = 1;
    while (step < 5) {
      const nr = r + dr * step;
      const nc = c + dc * step;
      if (nr < 0 || nr >= GOMOKU_BOARD_SIZE || nc < 0 || nc >= GOMOKU_BOARD_SIZE || board[nr][nc] === opp) {
        break;
      }
      if (board[nr][nc] === player) {
        count++;
      } else if (board[nr][nc] === 0) {
        openEnds++;
        break;
      }
      step++;
    }

    // Check backward
    step = 1;
    while (step < 5) {
      const nr = r - dr * step;
      const nc = c - dc * step;
      if (nr < 0 || nr >= GOMOKU_BOARD_SIZE || nc < 0 || nc >= GOMOKU_BOARD_SIZE || board[nr][nc] === opp) {
        break;
      }
      if (board[nr][nc] === player) {
        count++;
      } else if (board[nr][nc] === 0) {
        openEnds++;
        break;
      }
      step++;
    }

    if (count >= 5) totalScore += 100000;
    else if (count === 4) totalScore += openEnds === 2 ? 10000 : 2500;
    else if (count === 3) totalScore += openEnds === 2 ? 3000 : 500;
    else if (count === 2) totalScore += openEnds === 2 ? 200 : 50;
    else if (count === 1 && openEnds === 2) totalScore += 10;
  }

  return totalScore;
}

// Evaluate overall board score from Black's perspective
export function evaluateGomokuBoard(board: number[][]): number {
  let blackScore = 0;
  let whiteScore = 0;

  for (let r = 0; r < GOMOKU_BOARD_SIZE; r++) {
    for (let c = 0; c < GOMOKU_BOARD_SIZE; c++) {
      if (board[r][c] === 1) {
        blackScore += evaluatePointPattern(board, r, c, 1);
      } else if (board[r][c] === 2) {
        whiteScore += evaluatePointPattern(board, r, c, 2);
      }
    }
  }

  return blackScore - whiteScore;
}

// Compute Win Rate percentage
export function evaluateGomokuWinRate(board: number[][]): {
  blackWinRate: number;
  whiteWinRate: number;
  leadScore: number;
  statusText: string;
} {
  const diff = evaluateGomokuBoard(board);
  const rawWr = 1 / (1 + Math.exp(-0.0008 * diff));
  const blackWinRate = Math.max(3, Math.min(97, Math.round(rawWr * 100)));
  const whiteWinRate = 100 - blackWinRate;

  let statusText = '双方均势胶着';
  if (blackWinRate >= 80) statusText = '黑方胜势明显';
  else if (blackWinRate >= 60) statusText = '黑方略占主动';
  else if (whiteWinRate >= 80) statusText = '白方胜势明显';
  else if (whiteWinRate >= 60) statusText = '白方略占主动';

  return {
    blackWinRate,
    whiteWinRate,
    leadScore: diff,
    statusText
  };
}

// Get candidate points adjacent to existing stones (radius 2)
function getCandidates(board: number[][]): { r: number; c: number }[] {
  const visited = new Set<string>();
  const candidates: { r: number; c: number }[] = [];

  let hasStones = false;
  for (let r = 0; r < GOMOKU_BOARD_SIZE; r++) {
    for (let c = 0; c < GOMOKU_BOARD_SIZE; c++) {
      if (board[r][c] !== 0) {
        hasStones = true;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < GOMOKU_BOARD_SIZE && nc >= 0 && nc < GOMOKU_BOARD_SIZE && board[nr][nc] === 0) {
              const key = `${nr}_${nc}`;
              if (!visited.has(key)) {
                visited.add(key);
                candidates.push({ r: nr, c: nc });
              }
            }
          }
        }
      }
    }
  }

  // If empty board, return Tian Yuan (7, 7)
  if (!hasStones) {
    return [{ r: 7, c: 7 }];
  }

  return candidates;
}

// Choose AI Move
export function chooseGomokuAiMove(
  board: number[][],
  aiPlayer: StoneColor,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): { r: number; c: number; score: number } | null {
  const opp = aiPlayer === 1 ? 2 : 1;
  const candidates = getCandidates(board);
  if (candidates.length === 0) return { r: 7, c: 7, score: 0 };

  const scored: { r: number; c: number; attack: number; defense: number; total: number }[] = [];

  for (const pt of candidates) {
    board[pt.r][pt.c] = aiPlayer;
    const attack = evaluatePointPattern(board, pt.r, pt.c, aiPlayer);
    board[pt.r][pt.c] = 0;

    board[pt.r][pt.c] = opp;
    const defense = evaluatePointPattern(board, pt.r, pt.c, opp);
    board[pt.r][pt.c] = 0;

    if (attack >= 100000) return { r: pt.r, c: pt.c, score: 999999 };
    if (defense >= 100000) return { r: pt.r, c: pt.c, score: 888888 };

    const total = attack * 1.15 + defense;
    scored.push({ r: pt.r, c: pt.c, attack, defense, total });
  }

  scored.sort((a, b) => b.total - a.total);

  if (difficulty === 'easy') {
    const top = scored.slice(0, Math.min(5, scored.length));
    const pick = top[Math.floor(Math.random() * top.length)];
    return { r: pick.r, c: pick.c, score: pick.total };
  } else if (difficulty === 'medium') {
    const top = scored.slice(0, Math.min(2, scored.length));
    const pick = Math.random() < 0.8 ? top[0] : top[top.length - 1];
    return { r: pick.r, c: pick.c, score: pick.total };
  } else {
    return { r: scored[0].r, c: scored[0].c, score: scored[0].total };
  }
}

// Evaluate Move Quality & Commentary
export function evaluateGomokuMoveQuality(
  delta: number,
  isWinning: boolean
): {
  quality: 'god_move' | 'great_move' | 'normal_move' | 'slow_move' | 'blunder';
  qualityBadge: string;
  qualityDesc: string;
  comment: string;
} {
  if (isWinning) {
    return {
      quality: 'god_move',
      qualityBadge: '绝杀妙手',
      qualityDesc: '五子连珠必胜！',
      comment: '🌟 一击必杀，五子连珠大获全胜！'
    };
  }

  if (delta >= 15) {
    return {
      quality: 'god_move',
      qualityBadge: '绝妙好手',
      qualityDesc: '胜率暴涨',
      comment: '✨ 妙手！精准抢占攻防要道，局势大幅占优！'
    };
  } else if (delta >= 6) {
    return {
      quality: 'great_move',
      qualityBadge: '好手',
      qualityDesc: '稳健进攻',
      comment: '👍 布局严密，形成双重连三威胁。'
    };
  } else if (delta >= -6) {
    return {
      quality: 'normal_move',
      qualityBadge: '正手',
      qualityDesc: '平稳推进',
      comment: '平稳着子，继续拓展棋型。'
    };
  } else if (delta >= -15) {
    return {
      quality: 'slow_move',
      qualityBadge: '缓手',
      qualityDesc: '略显被动',
      comment: '落子略显保守，错失了更好的进攻展开点。'
    };
  } else {
    return {
      quality: 'blunder',
      qualityBadge: '败着失误',
      qualityDesc: '漏看防守',
      comment: '⚠️ 漏看了对手的做杀要点，局势陷入被动！'
    };
  }
}

// Gomoku Puzzle Challenges
export const GOMOKU_PUZZLES: GomokuPuzzle[] = [
  {
    id: 1,
    title: '第一关：一步连五 (一击必杀)',
    desc: '观察黑方已有四颗连子，找到正好的第五颗完成五连！',
    targetGoalText: '落子完成五子连珠获胜',
    player: 1,
    initialBoard: (() => {
      const b = createEmptyBoard();
      b[7][5] = 1; b[7][6] = 1; b[7][7] = 1; b[7][8] = 1;
      b[6][6] = 2; b[8][6] = 2; b[6][7] = 2;
      return b;
    })(),
    targetPoint: { r: 7, c: 9 }
  },
  {
    id: 2,
    title: '第二关：冲四活三 (双重打击)',
    desc: '找到关键交叉点，同时形成冲四与活三！',
    targetGoalText: '落子形成四三杀法',
    player: 1,
    initialBoard: (() => {
      const b = createEmptyBoard();
      b[7][5] = 1; b[7][6] = 1; b[7][7] = 1;
      b[5][8] = 1; b[6][8] = 1;
      b[8][5] = 2; b[8][7] = 2; b[6][6] = 2;
      return b;
    })(),
    targetPoint: { r: 7, c: 8 }
  },
  {
    id: 3,
    title: '第三关：双活三做杀 (无法阻挡)',
    desc: '一子双活三，对手只能防一边，必胜！',
    targetGoalText: '落子形成双活三',
    player: 1,
    initialBoard: (() => {
      const b = createEmptyBoard();
      b[7][5] = 1; b[7][6] = 1;
      b[5][7] = 1; b[6][7] = 1;
      b[9][5] = 2; b[9][7] = 2; b[4][6] = 2;
      return b;
    })(),
    targetPoint: { r: 7, c: 7 }
  },
  {
    id: 4,
    title: '第四关：绝地反杀 (反抢先手)',
    desc: '白棋正要冲四，找到既能防守又能形成反杀的关键点！',
    targetGoalText: '落子防守并反杀',
    player: 1,
    initialBoard: (() => {
      const b = createEmptyBoard();
      b[6][5] = 2; b[6][6] = 2; b[6][7] = 2;
      b[4][8] = 1; b[5][8] = 1; b[7][8] = 1;
      return b;
    })(),
    targetPoint: { r: 6, c: 8 }
  }
];

