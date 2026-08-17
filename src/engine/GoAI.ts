import { GoBoard } from './GoBoard';
import type { StoneColor, Point, AIMoveHint } from './types';

export type AIDifficulty = 'puppy' | 'kitty' | 'fox' | 'panda' | 'master';

export interface AIPersonality {
  id: AIDifficulty;
  name: string;
  avatar: string;
  rank: string;
  description: string;
  catchphrase: string;
  avatarColor: string;
}

export const AI_BOTS: Record<AIDifficulty, AIPersonality> = {
  puppy: {
    id: 'puppy',
    name: '小狗贝贝',
    avatar: '🐶',
    rank: '启蒙 25K',
    description: '活泼好动的小萌犬，偶尔会下出可爱的小糊涂棋，适合新手小白！',
    catchphrase: '汪汪！我们来下一盘快乐的围棋吧~',
    avatarColor: 'bg-amber-100 border-amber-300 text-amber-800'
  },
  kitty: {
    id: 'kitty',
    name: '小猫喵喵',
    avatar: '🐱',
    rank: '入门 20K',
    description: '超级喜欢抓鱼的小猫咪，一看到有叫吃就会扑上去提子！',
    catchphrase: '喵~ 你的棋子看起来很好吃哦！',
    avatarColor: 'bg-pink-100 border-pink-300 text-pink-800'
  },
  fox: {
    id: 'fox',
    name: '狐狸阿福',
    avatar: '🦊',
    rank: '进阶 15K',
    description: '聪明伶俐的小狐狸，擅长各种吃子手筋与声东击西！',
    catchphrase: '嘿嘿，可不要中了我的双叫吃小陷阱呀！',
    avatarColor: 'bg-orange-100 border-orange-300 text-orange-800'
  },
  panda: {
    id: 'panda',
    name: '熊猫师傅',
    avatar: '🐼',
    rank: '高手 10K',
    description: '沉稳大气的武术大师，精通做眼活棋与大局观！',
    catchphrase: '金角银边草肚皮，心静如水，棋自通神。',
    avatarColor: 'bg-emerald-100 border-emerald-300 text-emerald-800'
  },
  master: {
    id: 'master',
    name: '一诺大师',
    avatar: '🤖',
    rank: '宗师 5K',
    description: '智慧超凡的围棋AI守护神，计算精确，布局严谨！',
    catchphrase: '黑白之间天地宽，每一步棋都是智慧的火花！',
    avatarColor: 'bg-indigo-100 border-indigo-300 text-indigo-800'
  }
};

export class GoAI {
  /**
   * Find all legal moves for a color on the board
   */
  public static getLegalMoves(board: GoBoard, color: StoneColor): Point[] {
    const moves: Point[] = [];
    for (let r = 0; r < board.size; r++) {
      for (let c = 0; c < board.size; c++) {
        if (board.isLegalMove(r, c, color).legal) {
          moves.push({ r, c });
        }
      }
    }
    return moves;
  }

  /**
   * Evaluate a move with detailed heuristic weights
   */
  public static evaluateMove(board: GoBoard, r: number, c: number, color: StoneColor): { score: number; reason: string } {
    const opponent = board.getOpponentColor(color);
    let score = 0;
    let mainReason = '普通占位';

    // Test board state after move
    const testBoard = board.clone();
    const res = testBoard.playMove(r, c, color);
    if (!res.success) return { score: -9999, reason: '非法着法' };

    // 1. Capture Opponent Stones
    if (res.capturedStones.length > 0) {
      const capScore = res.capturedStones.length * 150;
      score += capScore;
      mainReason = `提吃敌方 ${res.capturedStones.length} 颗子`;
    }

    // 2. Saving Own Group from Atari
    const ownPreAtaris = board.checkAtari().filter(a => a.color === color);
    for (const alert of ownPreAtaris) {
      // If this move is one of the escape points
      if (alert.escapePoints.some(p => p.r === r && p.c === c)) {
        const groupAfter = testBoard.getGroup(r, c);
        if (groupAfter && groupAfter.libertyCount > 1) {
          score += 120 + alert.group.stones.length * 40;
          mainReason = '成功逃跑并增加气数';
        }
      }
    }

    // 3. Placing Opponent in Atari (叫吃)
    const opponentAtaris = testBoard.checkAtari().filter(a => a.color === opponent);
    if (opponentAtaris.length > 0) {
      score += 45 * opponentAtaris.length;
      if (mainReason === '普通占位') mainReason = '形成叫吃威胁';
    }

    // 4. Double Atari (双叫吃) Bonus
    if (opponentAtaris.length >= 2) {
      score += 110;
      mainReason = '绝妙的双叫吃手筋！';
    }

    // 5. Liberty evaluation of the resulting group
    const newGroup = testBoard.getGroup(r, c);
    if (newGroup) {
      if (newGroup.libertyCount === 1) {
        // Danger: self-atari
        score -= 90;
        if (mainReason === '普通占位') mainReason = '自身气数危险（自投罗网）';
      } else if (newGroup.libertyCount === 2) {
        score += 10;
      } else if (newGroup.libertyCount >= 3) {
        score += 25;
      }
    }

    // 6. Real Eye creation
    const eyeCheck = testBoard.evaluateEye(r, c, color);
    if (eyeCheck.status === 'REAL') {
      score += 60;
      mainReason = '占据做眼要点';
    }

    // 7. Positional heuristics (Corners > Sides > Center)
    const distR = Math.min(r, board.size - 1 - r);
    const distC = Math.min(c, board.size - 1 - c);

    if (distR === 2 && distC === 2) {
      // 3-3 point (Star point in 9x9 / corner vital point)
      score += 35;
      if (mainReason === '普通占位') mainReason = '抢占金角要位（三三/星位）';
    } else if ((distR === 2 && distC === 3) || (distR === 3 && distC === 2)) {
      score += 25;
      if (mainReason === '普通占位') mainReason = '边角拓展';
    } else if (distR === 0 || distC === 0) {
      // 1st line (Edge / Death line in early game)
      if (board.history.length < 15 && res.capturedStones.length === 0) {
        score -= 25; // Discourage early 1st line crawls
      }
    }

    // 8. Adjacent stone connection / cutting
    const neighbors = board.getOrthogonalNeighbors(r, c);
    let friendlyNeighbors = 0;
    let enemyNeighbors = 0;
    for (const n of neighbors) {
      const cell = board.getCell(n.r, n.c);
      if (cell === color) friendlyNeighbors++;
      if (cell === opponent) enemyNeighbors++;
    }

    if (friendlyNeighbors >= 2) {
      score += 20; // Connecting stones
      if (mainReason === '普通占位') mainReason = '连接己方棋子';
    }
    if (enemyNeighbors >= 2) {
      score += 15; // Splitting / cutting pressure
    }

    return { score, reason: mainReason };
  }

  /**
   * AI move selection based on difficulty
   */
  public static selectMove(board: GoBoard, difficulty: AIDifficulty, color: StoneColor = board.turn): Point | null {
    const legalMoves = this.getLegalMoves(board, color);
    if (legalMoves.length === 0) return null;

    // Puppy (25K): 70% random, 30% avoids self-atari
    if (difficulty === 'puppy') {
      if (Math.random() < 0.45) {
        return legalMoves[Math.floor(Math.random() * legalMoves.length)];
      }
      // Filter out immediate self-atari
      const safeMoves = legalMoves.filter(p => {
        const tb = board.clone();
        tb.playMove(p.r, p.c, color);
        const g = tb.getGroup(p.r, p.c);
        return g && g.libertyCount > 1;
      });
      const pool = safeMoves.length > 0 ? safeMoves : legalMoves;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    // Evaluate all legal moves
    const scoredMoves = legalMoves.map(p => {
      const evalRes = this.evaluateMove(board, p.r, p.c, color);
      return { point: p, score: evalRes.score, reason: evalRes.reason };
    });

    // Sort descending
    scoredMoves.sort((a, b) => b.score - a.score);

    // Kitty (20K): Focuses strongly on immediate captures and atari
    if (difficulty === 'kitty') {
      const best = scoredMoves.slice(0, Math.min(3, scoredMoves.length));
      return best[Math.floor(Math.random() * best.length)].point;
    }

    // Fox (15K): Tactical, picks from top 2 with some variety
    if (difficulty === 'fox') {
      const best = scoredMoves.slice(0, Math.min(2, scoredMoves.length));
      return best[0].point;
    }

    // Panda (10K): Solid best move
    if (difficulty === 'panda') {
      return scoredMoves[0].point;
    }

    // Master (5K): Deep heuristic with positional stability
    if (difficulty === 'master') {
      return scoredMoves[0].point;
    }

    return scoredMoves[0].point;
  }

  /**
   * Provide top kid-friendly move hint with bilingual explanation
   */
  public static getBestMoveHint(board: GoBoard, color: StoneColor = board.turn): AIMoveHint | null {
    const legalMoves = this.getLegalMoves(board, color);
    if (legalMoves.length === 0) return null;

    const scoredMoves = legalMoves.map(p => {
      const evalRes = this.evaluateMove(board, p.r, p.c, color);
      return { point: p, score: evalRes.score, reason: evalRes.reason };
    });

    scoredMoves.sort((a, b) => b.score - a.score);
    const top = scoredMoves[0];

    return {
      point: top.point,
      score: top.score,
      reason: top.reason
    };
  }
}

