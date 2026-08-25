// Chinese Checkers Core Engine
// 121 Holes, 6 Camps, BFS Jump Pathfinding, Multi-difficulty AI & Puzzle Levels

export interface BoardNode {
  id: string; // 'r_c'
  r: number;
  c: number;
  x: number; // scaled coordinate centered at 0
  y: number;
}

export interface MoveOption {
  to: string;
  path: string[]; // [fromId, intermediate1, intermediate2, ..., toId]
  isJump: boolean;
  hops: number;
  score?: number;
}

export type CampId = 0 | 1 | 2 | 3 | 4 | 5;

export type CheckersPlayerCount = 2 | 3 | 4 | 5 | 6;

/**
 * 六角星营地座次（对应玩家定义 id 1..6）
 * 2/3 人隔座对坐，4 人两对对坐，5 人空出东南角以免两家挤同一目标营
 */
export const CHECKERS_SEATS: Record<CheckersPlayerCount, number[]> = {
  2: [1, 2],
  3: [1, 3, 5],
  4: [1, 2, 3, 4],
  5: [1, 2, 3, 4, 5],
  6: [1, 2, 3, 4, 5, 6]
};

export function getCheckersSeats(count: number): number[] {
  if (count === 3 || count === 4 || count === 5 || count === 6) {
    return CHECKERS_SEATS[count];
  }
  return CHECKERS_SEATS[2];
}

export function parseCheckersPlayerCount(raw: unknown): CheckersPlayerCount {
  const n = Number(raw);
  if (n === 3 || n === 4 || n === 5 || n === 6) return n;
  return 2;
}

export interface PlayerConfig {
  id: number; // 1..6
  campId: CampId;
  targetCampId: CampId;
  name: string;
  avatar: string;
  colorName: string;
  colorHex: string;
  darkColorHex: string;
  glowColor: string;
  isAi: boolean;
  aiDifficulty?: 'easy' | 'medium' | 'hard';
}

export interface PuzzleLevel {
  id: number;
  title: string;
  desc: string;
  targetGoalText: string;
  boardState: Record<string, number>; // node.id -> playerId
  playerCamp: CampId;
  targetCamp: CampId;
  activePiece: string; // which piece to move or 'any'
  parHops: number; // Target hops in 1 move or target turns
  targetNodeId: string;
}

const ROW_SIZES = [1, 2, 3, 4, 13, 12, 11, 10, 9, 10, 11, 12, 13, 4, 3, 2, 1];

// Initialize all 121 nodes
export const BOARD_NODES: BoardNode[] = [];
export const NODE_MAP: Record<string, BoardNode> = {};

for (let r = 0; r < 17; r++) {
  const n = ROW_SIZES[r];
  for (let c = 0; c < n; c++) {
    const x = c - (n - 1) / 2;
    const y = (r - 8) * (Math.sqrt(3) / 2);
    const id = `${r}_${c}`;
    const node: BoardNode = { id, r, c, x, y };
    BOARD_NODES.push(node);
    NODE_MAP[id] = node;
  }
}

// 6 Camps:
// 0: N (Top), 1: NE (Top-Right), 2: SE (Bottom-Right), 3: S (Bottom), 4: SW (Bottom-Left), 5: NW (Top-Left)
export const CAMPS: Record<CampId, string[]> = {
  0: [],
  1: [],
  2: [],
  3: [],
  4: [],
  5: []
};

// Camp 0 (N): row 0..3
for (let r = 0; r <= 3; r++) {
  for (let c = 0; c < ROW_SIZES[r]; c++) CAMPS[0].push(`${r}_${c}`);
}

// Camp 3 (S): row 13..16
for (let r = 13; r <= 16; r++) {
  for (let c = 0; c < ROW_SIZES[r]; c++) CAMPS[3].push(`${r}_${c}`);
}

// Camp 5 (NW) & 1 (NE): row 4..7
for (let r = 4; r <= 7; r++) {
  const wingLen = 4 - (r - 4);
  const n = ROW_SIZES[r];
  for (let c = 0; c < wingLen; c++) CAMPS[5].push(`${r}_${c}`);
  for (let c = n - wingLen; c < n; c++) CAMPS[1].push(`${r}_${c}`);
}

// Camp 4 (SW) & 2 (SE): row 9..12
for (let r = 9; r <= 12; r++) {
  const wingLen = 1 + (r - 9);
  const n = ROW_SIZES[r];
  for (let c = 0; c < wingLen; c++) CAMPS[4].push(`${r}_${c}`);
  for (let c = n - wingLen; c < n; c++) CAMPS[2].push(`${r}_${c}`);
}

// Target Camp for each camp
export const TARGET_CAMPS: Record<CampId, CampId> = {
  0: 3,
  1: 4,
  2: 5,
  3: 0,
  4: 1,
  5: 2
};

// Camp Apexes
export const CAMP_APEX: Record<CampId, { x: number; y: number }> = {
  0: { x: 0, y: -8 * (Math.sqrt(3) / 2) },
  1: { x: 6, y: -4 * (Math.sqrt(3) / 2) },
  2: { x: 6, y: 4 * (Math.sqrt(3) / 2) },
  3: { x: 0, y: 8 * (Math.sqrt(3) / 2) },
  4: { x: -6, y: 4 * (Math.sqrt(3) / 2) },
  5: { x: -6, y: -4 * (Math.sqrt(3) / 2) }
};

// Unit target vectors
export const CAMP_TARGET_VECTORS: Record<CampId, { ux: number; uy: number }> = {
  0: { ux: 0, uy: -1 },
  1: { ux: Math.cos(-Math.PI / 6), uy: Math.sin(-Math.PI / 6) },
  2: { ux: Math.cos(Math.PI / 6), uy: Math.sin(Math.PI / 6) },
  3: { ux: 0, uy: 1 },
  4: { ux: Math.cos((5 * Math.PI) / 6), uy: Math.sin((5 * Math.PI) / 6) },
  5: { ux: Math.cos((-5 * Math.PI) / 6), uy: Math.sin((-5 * Math.PI) / 6) }
};

// Map node id -> camp index if it belongs to one of the 6 camps
export const NODE_CAMP_MAP: Record<string, CampId> = {};
for (let campId = 0; campId < 6; campId++) {
  for (const id of CAMPS[campId as CampId]) {
    NODE_CAMP_MAP[id] = campId as CampId;
  }
}

export interface BoardGridLine {
  id: string;
  fromId: string;
  toId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const BOARD_GRID_LINES: BoardGridLine[] = [];
for (const n1 of BOARD_NODES) {
  for (const n2 of BOARD_NODES) {
    if (n1.id >= n2.id) continue;
    const dx = n2.x - n1.x;
    const dy = n2.y - n1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (Math.abs(dist - 1.0) < 0.05) {
      BOARD_GRID_LINES.push({
        id: n1.id + '_' + n2.id,
        fromId: n1.id,
        toId: n2.id,
        x1: n1.x,
        y1: n1.y,
        x2: n2.x,
        y2: n2.y
      });
    }
  }
}

// Build adjacency and directional neighbors
export const NEIGHBORS: Record<string, { to: string; dir: number }[]> = {};
export const NEIGHBOR_IN_DIR: Record<string, Record<number, string>> = {};

for (const n1 of BOARD_NODES) {
  NEIGHBORS[n1.id] = [];
  NEIGHBOR_IN_DIR[n1.id] = {};
  for (const n2 of BOARD_NODES) {
    if (n1.id === n2.id) continue;
    const dx = n2.x - n1.x;
    const dy = n2.y - n1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (Math.abs(dist - 1.0) < 0.05) {
      const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
      const dirIndex = Math.round(angle / 60) % 6;
      NEIGHBORS[n1.id].push({ to: n2.id, dir: dirIndex });
      NEIGHBOR_IN_DIR[n1.id][dirIndex] = n2.id;
    }
  }
}

// Calculate all possible legal moves from a starting node
export function getLegalMoves(
  fromId: string,
  boardState: Record<string, number>,
  _ownCampId?: CampId,
  targetCampId?: CampId
): MoveOption[] {
  const moves: MoveOption[] = [];
  const startNode = NODE_MAP[fromId];
  if (!startNode || !boardState[fromId]) return moves;

  const currentCamp = NODE_CAMP_MAP[fromId];
  const isAlreadyInTarget = currentCamp !== undefined && targetCampId !== undefined && currentCamp === targetCampId;

  // 1. Single-step adjacent moves
  for (const n of NEIGHBORS[fromId] || []) {
    if (!boardState[n.to]) {
      // If already in target camp, prevent moving out of target camp
      if (isAlreadyInTarget && NODE_CAMP_MAP[n.to] !== targetCampId) {
        continue;
      }
      moves.push({
        to: n.to,
        path: [fromId, n.to],
        isJump: false,
        hops: 0
      });
    }
  }

  // 2. Multi-hop BFS jumps
  const visitedJumps = new Set<string>([fromId]);
  const queue: { pos: string; path: string[] }[] = [{ pos: fromId, path: [fromId] }];

  while (queue.length > 0) {
    const item = queue.shift()!;
    const pos = item.pos;
    const path = item.path;

    for (let d = 0; d < 6; d++) {
      const mid = NEIGHBOR_IN_DIR[pos]?.[d];
      if (mid && boardState[mid]) {
        const dest = NEIGHBOR_IN_DIR[mid]?.[d];
        if (dest && !boardState[dest] && !visitedJumps.has(dest)) {
          // If piece is already in target camp, don't jump out
          if (isAlreadyInTarget && NODE_CAMP_MAP[dest] !== targetCampId) {
            continue;
          }
          visitedJumps.add(dest);
          const newPath = [...path, dest];
          moves.push({
            to: dest,
            path: newPath,
            isJump: true,
            hops: newPath.length - 1
          });
          queue.push({ pos: dest, path: newPath });
        }
      }
    }
  }

  return moves;
}

// Compute progress score for a node towards a target camp
export function getNodeTargetScore(nodeId: string, targetCampId: CampId): number {
  const node = NODE_MAP[nodeId];
  if (!node) return 0;
  const vec = CAMP_TARGET_VECTORS[targetCampId];
  // Basic dot product
  let score = node.x * vec.ux + node.y * vec.uy;

  // Extra bonus if node is actually inside target camp
  if (NODE_CAMP_MAP[nodeId] === targetCampId) {
    score += 15;
    // Extra bonus if closer to apex of target camp
    const apex = CAMP_APEX[targetCampId];
    const distToApex = Math.sqrt((node.x - apex.x) ** 2 + (node.y - apex.y) ** 2);
    score += (10 - distToApex) * 2;
  }

  return score;
}

// Check if a player has won
export function checkPlayerWin(
  playerId: number,
  targetCampId: CampId,
  boardState: Record<string, number>
): boolean {
  const targetHoles = CAMPS[targetCampId];
  let count = 0;
  for (const holeId of targetHoles) {
    if (boardState[holeId] === playerId) {
      count++;
    }
  }
  return count === 10;
}

// Count how many pieces a player has in the target camp
export function getPlayerGoalCount(
  playerId: number,
  targetCampId: CampId,
  boardState: Record<string, number>
): number {
  const targetHoles = CAMPS[targetCampId];
  let count = 0;
  for (const holeId of targetHoles) {
    if (boardState[holeId] === playerId) {
      count++;
    }
  }
  return count;
}

// AI Move Selector
export function chooseAiMove(
  player: PlayerConfig,
  boardState: Record<string, number>
): { fromId: string; move: MoveOption } | null {
  const allMoves: { fromId: string; move: MoveOption; score: number }[] = [];

  // Find all pieces of player
  for (const node of BOARD_NODES) {
    if (boardState[node.id] === player.id) {
      const moves = getLegalMoves(node.id, boardState, player.campId, player.targetCampId);
      for (const m of moves) {
        const scoreBefore = getNodeTargetScore(node.id, player.targetCampId);
        const scoreAfter = getNodeTargetScore(m.to, player.targetCampId);
        const delta = scoreAfter - scoreBefore;

        // Base evaluation score
        let evalScore = delta * 10;

        // Long jump combo bonus!
        if (m.isJump) {
          evalScore += m.hops * 2.5;
        }

        // Penalty for moving out of target camp
        if (NODE_CAMP_MAP[node.id] === player.targetCampId && NODE_CAMP_MAP[m.to] !== player.targetCampId) {
          evalScore -= 1000;
        }

        // Bonus for entering target camp
        if (NODE_CAMP_MAP[node.id] !== player.targetCampId && NODE_CAMP_MAP[m.to] === player.targetCampId) {
          evalScore += 30;
        }

        // Encourage lagging pieces to move forward
        const distanceToTargetApex = Math.sqrt(
          (node.x - CAMP_APEX[player.targetCampId].x) ** 2 +
          (node.y - CAMP_APEX[player.targetCampId].y) ** 2
        );
        if (distanceToTargetApex > 8 && delta > 0) {
          evalScore += 4; // bonus to catch up
        }

        allMoves.push({ fromId: node.id, move: m, score: evalScore });
      }
    }
  }

  if (allMoves.length === 0) return null;

  // Sort moves by score descending
  allMoves.sort((a, b) => b.score - a.score);

  const difficulty = player.aiDifficulty || 'medium';

  if (difficulty === 'easy') {
    // Pick randomly among moves that advance forward (positive score), or top 5
    const forwardMoves = allMoves.filter(m => m.score > 0);
    const pool = forwardMoves.length > 0 ? forwardMoves.slice(0, Math.min(6, forwardMoves.length)) : allMoves.slice(0, 3);
    const choice = pool[Math.floor(Math.random() * pool.length)];
    return { fromId: choice.fromId, move: choice.move };
  } else if (difficulty === 'medium') {
    // Top 3 choices with 70% weight on best
    const topPool = allMoves.slice(0, Math.min(3, allMoves.length));
    const roll = Math.random();
    if (roll < 0.75 || topPool.length === 1) {
      return { fromId: topPool[0].fromId, move: topPool[0].move };
    } else {
      const choice = topPool[Math.floor(Math.random() * topPool.length)];
      return { fromId: choice.fromId, move: choice.move };
    }
  } else {
    // Hard / Master AI: Always pick best or evaluate deepest forward progress
    return { fromId: allMoves[0].fromId, move: allMoves[0].move };
  }
}

// 10 Engaging Kids Jump Challenges / Puzzles
export const PUZZLE_LEVELS: PuzzleLevel[] = [
  {
    id: 1,
    title: '第一关：轻盈一跃',
    desc: '观察前方的小伙伴，跳过它一步抵达指定光环位置！',
    targetGoalText: '跳跃1次，到达闪光点',
    boardState: {
      '14_0': 1,
      '13_1': 2
    },
    playerCamp: 3,
    targetCamp: 0,
    activePiece: '14_0',
    parHops: 1,
    targetNodeId: '12_2'
  },
  {
    id: 2,
    title: '第二关：双重跳跳乐',
    desc: '利用连续两个棋子作为跳板，完成炫酷的双连跳！',
    targetGoalText: '完成2连跳到达目标点',
    boardState: {
      '15_0': 1,
      '14_0': 2,
      '12_0': 2
    },
    playerCamp: 3,
    targetCamp: 0,
    activePiece: '15_0',
    parHops: 2,
    targetNodeId: '10_0'
  },
  {
    id: 3,
    title: '第三关：转弯蛇形跳',
    desc: '跳棋不仅能直跳，还能在跳跃中改变方向转弯哦！',
    targetGoalText: '转弯完成2连跳',
    boardState: {
      '13_2': 1,
      '12_6': 2,
      '10_4': 2
    },
    playerCamp: 3,
    targetCamp: 0,
    activePiece: '13_2',
    parHops: 2,
    targetNodeId: '10_2'
  },
  {
    id: 4,
    title: '第四关：三连飞跃',
    desc: '瞧！棋盘上排列了一条神奇走廊，一瞬间飞跃半个棋盘！',
    targetGoalText: '完成3连跳直奔中原',
    boardState: {
      '16_0': 1,
      '15_0': 2,
      '13_0': 2,
      '11_1': 2
    },
    playerCamp: 3,
    targetCamp: 0,
    activePiece: '16_0',
    parHops: 3,
    targetNodeId: '9_2'
  },
  {
    id: 5,
    title: '第五关：五星连珠超级跳',
    desc: '超级搭桥！顺着队友铺好的彩虹桥，完成不可思议的5连跳！',
    targetGoalText: '一气呵成完成5连跳！',
    boardState: {
      '16_0': 1,
      '15_1': 2,
      '13_3': 2,
      '11_5': 2,
      '9_7': 2,
      '7_7': 2
    },
    playerCamp: 3,
    targetCamp: 0,
    activePiece: '16_0',
    parHops: 5,
    targetNodeId: '5_7'
  },
  {
    id: 6,
    title: '第六关：左右开弓连环跳',
    desc: '左右摆动，寻找隐藏在迷宫般的棋子阵中的弹射路线！',
    targetGoalText: '完成4连跳穿越阻挡',
    boardState: {
      '14_2': 1,
      '13_2': 2,
      '11_4': 2,
      '9_4': 2,
      '7_5': 2
    },
    playerCamp: 3,
    targetCamp: 0,
    activePiece: '14_2',
    parHops: 4,
    targetNodeId: '5_6'
  },
  {
    id: 7,
    title: '第七关：直捣黄龙入大本营',
    desc: '最后一颗弹珠！跨越重重关卡，直接跳入对方大本营尖顶！',
    targetGoalText: '最后一跃入顶峰（0_0）',
    boardState: {
      '8_4': 1,
      '7_4': 2,
      '5_4': 2,
      '3_1': 2,
      '1_0': 2
    },
    playerCamp: 3,
    targetCamp: 0,
    activePiece: '8_4',
    parHops: 4,
    targetNodeId: '0_0'
  }
];


// Calculate Win Rate & Position Evaluation for Chinese Checkers
export function evaluateCheckersWinRate(
  boardState: Record<string, number>,
  p1: PlayerConfig,
  p2: PlayerConfig
): {
  p1WinRate: number;
  p2WinRate: number;
  leadScore: number;
  statusText: string;
} {
  // Compute progress score for both players
  let p1Total = 0;
  let p2Total = 0;
  let p1InGoal = 0;
  let p2InGoal = 0;

  for (const node of BOARD_NODES) {
    const owner = boardState[node.id];
    if (owner === p1.id) {
      p1Total += getNodeTargetScore(node.id, p1.targetCampId);
      if (NODE_CAMP_MAP[node.id] === p1.targetCampId) p1InGoal++;
    } else if (owner === p2.id) {
      p2Total += getNodeTargetScore(node.id, p2.targetCampId);
      if (NODE_CAMP_MAP[node.id] === p2.targetCampId) p2InGoal++;
    }
  }

  if (p1InGoal === 10) return { p1WinRate: 100, p2WinRate: 0, leadScore: 100, statusText: `${p1.name} 大获全胜！` };
  if (p2InGoal === 10) return { p1WinRate: 0, p2WinRate: 100, leadScore: -100, statusText: `${p2.name} 大获全胜！` };

  // Normalized score difference
  const diff = p1Total - p2Total;
  const rawWr = 1 / (1 + Math.exp(-0.06 * diff));
  const p1WinRate = Math.max(3, Math.min(97, Math.round(rawWr * 100)));
  const p2WinRate = 100 - p1WinRate;

  let statusText = '双方势均力敌';
  if (p1WinRate >= 80) statusText = `${p1.name} 胜势明显`;
  else if (p1WinRate >= 60) statusText = `${p1.name} 略占优势`;
  else if (p2WinRate >= 80) statusText = `${p2.name} 胜势明显`;
  else if (p2WinRate >= 60) statusText = `${p2.name} 略占优势`;

  return {
    p1WinRate,
    p2WinRate,
    leadScore: Math.round(diff),
    statusText
  };
}
