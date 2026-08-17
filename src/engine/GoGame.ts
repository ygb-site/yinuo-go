import type {
  StoneColor,
  BoardCell,
  Point,
  StoneGroup,
  MoveResult,
  MoveRecord,
  ScoreBreakdown,
  EyeInfo,
  AtariAlert,
  BoardSize
} from './types';
import { getOpponent } from './types';

/**
 * 围棋规则状态机与核心算法引擎 (Go Game Rule State Machine & Engine)
 */
export class GoGame {
  public size: number;
  public grid: BoardCell[][];
  public turn: StoneColor;
  public history: MoveRecord[];
  public koPoint: Point | null = null;
  public capturedByBlack: number = 0;
  public capturedByWhite: number = 0;
  public consecutivePasses: number = 0;
  public komi: number = 5.5;
  public stateHistory: Set<string>;

  constructor(size: BoardSize = 9, komi: number = 5.5) {
    this.size = Number(size);
    this.komi = komi;
    this.grid = Array.from({ length: this.size }, () => Array(this.size).fill(null));
    this.turn = 'B';
    this.history = [];
    this.koPoint = null;
    this.stateHistory = new Set<string>();
    this.stateHistory.add(this.getRawGridHash());
  }

  /**
   * 深拷贝当前游戏状态 (Deep Clone)
   */
  public clone(): GoGame {
    const copy = new GoGame(this.size, this.komi);
    copy.grid = this.grid.map(row => [...row]);
    copy.turn = this.turn;
    copy.history = [...this.history];
    copy.koPoint = this.koPoint ? { ...this.koPoint } : null;
    copy.capturedByBlack = this.capturedByBlack;
    copy.capturedByWhite = this.capturedByWhite;
    copy.consecutivePasses = this.consecutivePasses;
    copy.stateHistory = new Set(this.stateHistory);
    return copy;
  }

  /**
   * 重置棋局 (Reset Game)
   */
  public reset(size?: BoardSize) {
    if (size) this.size = Number(size);
    this.grid = Array.from({ length: this.size }, () => Array(this.size).fill(null));
    this.turn = 'B';
    this.history = [];
    this.koPoint = null;
    this.capturedByBlack = 0;
    this.capturedByWhite = 0;
    this.consecutivePasses = 0;
    this.stateHistory = new Set<string>();
    this.stateHistory.add(this.getRawGridHash());
  }

  /**
   * 坐标有效性校验 (Coordinate Bounds Check)
   */
  public isValidCoord(r: number, c: number): boolean {
    return r >= 0 && r < this.size && c >= 0 && c < this.size;
  }

  /**
   * 获取指定交叉点状态 (Get Cell)
   */
  public getCell(r: number, c: number): BoardCell {
    if (!this.isValidCoord(r, c)) return null;
    return this.grid[r][c];
  }

  /**
   * 设置交叉点棋子 (Set Cell directly for puzzles/setup)
   */
  public setCell(r: number, c: number, color: BoardCell) {
    if (this.isValidCoord(r, c)) {
      this.grid[r][c] = color;
    }
  }

  /**
   * 获取棋盘字符哈希 (Board State Hash)
   */
  public getRawGridHash(): string {
    return this.grid.map(row => row.map(cell => cell || '.').join('')).join('/');
  }

  public getBoardHash(): string {
    return this.getRawGridHash() + ':' + this.turn;
  }

  /**
   * 获取上下左右正交相邻坐标 (Orthogonal 4 Neighbors)
   */
  public getOrthogonalNeighbors(r: number, c: number): Point[] {
    const deltas = [
      { r: -1, c: 0 },
      { r: 1, c: 0 },
      { r: 0, c: -1 },
      { r: 0, c: 1 }
    ];
    return deltas
      .map(d => ({ r: r + d.r, c: c + d.c }))
      .filter(p => this.isValidCoord(p.r, p.c));
  }

  /**
   * 获取对角相邻坐标 (Diagonal 4 Neighbors)
   */
  public getDiagonalNeighbors(r: number, c: number): Point[] {
    const deltas = [
      { r: -1, c: -1 },
      { r: -1, c: 1 },
      { r: 1, c: -1 },
      { r: 1, c: 1 }
    ];
    return deltas
      .map(d => ({ r: r + d.r, c: c + d.c }))
      .filter(p => this.isValidCoord(p.r, p.c));
  }

  /**
   * 1. 核心算法：计算连通块与气数 (Liberties & Stone Group Detection)
   * 采用 BFS 漫水算法搜索相连同色棋子集合，并统计所有外围唯一的空交叉点
   */
  public getGroup(r: number, c: number): StoneGroup | null {
    if (!this.isValidCoord(r, c)) return null;
    const color = this.grid[r][c];
    if (color === null) return null;

    const visited = new Set<string>();
    const stones: Point[] = [];
    const libertiesSet = new Set<string>();
    const queue: Point[] = [{ r, c }];
    visited.add(`${r},${c}`);

    while (queue.length > 0) {
      const current = queue.shift()!;
      stones.push(current);

      const neighbors = this.getOrthogonalNeighbors(current.r, current.c);
      for (const n of neighbors) {
        const key = `${n.r},${n.c}`;
        const nColor = this.grid[n.r][n.c];

        if (nColor === null) {
          libertiesSet.add(key);
        } else if (nColor === color && !visited.has(key)) {
          visited.add(key);
          queue.push(n);
        }
      }
    }

    const liberties: Point[] = Array.from(libertiesSet).map(key => {
      const [kr, kc] = key.split(',').map(Number);
      return { r: kr, c: kc };
    });

    return {
      color,
      stones,
      liberties,
      libertyCount: liberties.length
    };
  }

  public getGroupAt(r: number, c: number): StoneGroup | null {
    return this.getGroup(r, c);
  }

  /**
   * 辅助查询：获取指定坐标所在棋块的所有气坐标 (Get Liberties Of Coordinate)
   */
  public getLibertiesOf(r: number, c: number): Point[] {
    const group = this.getGroup(r, c);
    return group ? group.liberties : [];
  }

  /**
   * 辅助查询：获取指定坐标所在棋块的气数 (Get Liberties Count)
   */
  public getLibertiesCount(r: number, c: number): number {
    const group = this.getGroup(r, c);
    return group ? group.libertyCount : 0;
  }

  /**
   * 获取棋盘上所有互不相交的棋块 (Get All Connected Groups)
   */
  public getAllGroups(): StoneGroup[] {
    const visited = new Set<string>();
    const groups: StoneGroup[] = [];

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const key = `${r},${c}`;
        if (this.grid[r][c] !== null && !visited.has(key)) {
          const group = this.getGroup(r, c);
          if (group) {
            group.stones.forEach(p => visited.add(`${p.r},${p.c}`));
            groups.push(group);
          }
        }
      }
    }
    return groups;
  }

  /**
   * 辅助查询：获取所有处于“叫吃”（只剩1气）状态的棋块 (Get Atari Groups)
   */
  public getAtariGroups(): StoneGroup[] {
    return this.getAllGroups().filter(g => g.libertyCount === 1);
  }

  /**
   * 叫吃预警详细列表 (Check Atari Alerts for UI)
   */
  public checkAtari(): AtariAlert[] {
    const alerts: AtariAlert[] = [];
    const ataris = this.getAtariGroups();
    for (const g of ataris) {
      alerts.push({
        color: g.color,
        group: g,
        escapePoints: g.liberties
      });
    }
    return alerts;
  }

  /**
   * 2. 核心算法：着法合法性校验 (Legal Move Verification)
   * 包含：越界校验、空位校验、劫争判定、提子后气数校验、自杀步禁着点拦截
   */
  public isLegalMove(
    r: number,
    c: number,
    color: StoneColor = this.turn
  ): { legal: boolean; reason?: string } {
    if (!this.isValidCoord(r, c)) {
      return { legal: false, reason: '坐标超出棋盘范围' };
    }
    if (this.grid[r][c] !== null) {
      return { legal: false, reason: '该位置已有棋子' };
    }

    const opponent = getOpponent(color);

    // 劫争校验 (Ko Rule): 不能立即反提同一劫位
    if (this.koPoint && this.koPoint.r === r && this.koPoint.c === c) {
      return { legal: false, reason: '打劫禁着点（劫争）：不能立即反提，需先在别处找劫材' };
    }

    // 模拟落子 (Simulation Grid)
    const simGrid = this.grid.map(row => [...row]);
    simGrid[r][c] = color;

    // 检查是否能提吃对方相邻棋块
    const capturedStones: Point[] = [];
    const neighbors = this.getOrthogonalNeighbors(r, c);
    const checkedGroups = new Set<string>();

    for (const n of neighbors) {
      if (simGrid[n.r][n.c] === opponent) {
        const oppGroup = this.getGroupOnGrid(simGrid, n.r, n.c);
        if (oppGroup) {
          const repKey = `${oppGroup.stones[0].r},${oppGroup.stones[0].c}`;
          if (!checkedGroups.has(repKey)) {
            checkedGroups.add(repKey);
            if (oppGroup.libertyCount === 0) {
              capturedStones.push(...oppGroup.stones);
            }
          }
        }
      }
    }

    // 移除模拟被提掉的死子
    for (const p of capturedStones) {
      simGrid[p.r][p.c] = null;
    }

    // 自杀步校验 (Suicide Rule): 未吃子且自身气数为 0
    const ownGroup = this.getGroupOnGrid(simGrid, r, c);
    if (!ownGroup || ownGroup.libertyCount === 0) {
      return { legal: false, reason: '禁着点（自杀步）：落子后自身完全无气且未能提吃敌方棋子' };
    }

    // 全局同形比对 (Positional Superko Prevention)
    const resultingRawHash = simGrid.map(row => row.map(cell => cell || '.').join('')).join('/');
    if (this.history.length >= 2 && capturedStones.length === 1) {
      const twoTurnsAgoHash = this.history[this.history.length - 2]?.boardHash.split(':')[0];
      if (resultingRawHash === twoTurnsAgoHash) {
        return { legal: false, reason: '打劫禁着点（全局同形）：不可重复局面' };
      }
    }

    return { legal: true };
  }

  /**
   * 内部网格连通块计算 (Grid-level Group Detection)
   */
  public getGroupOnGrid(grid: BoardCell[][], r: number, c: number): StoneGroup | null {
    const color = grid[r][c];
    if (color === null) return null;

    const visited = new Set<string>();
    const stones: Point[] = [];
    const libertiesSet = new Set<string>();
    const queue: Point[] = [{ r, c }];
    visited.add(`${r},${c}`);

    while (queue.length > 0) {
      const cur = queue.shift()!;
      stones.push(cur);

      const neighbors = this.getOrthogonalNeighbors(cur.r, cur.c);
      for (const n of neighbors) {
        const key = `${n.r},${n.c}`;
        const nColor = grid[n.r][n.c];
        if (nColor === null) {
          libertiesSet.add(key);
        } else if (nColor === color && !visited.has(key)) {
          visited.add(key);
          queue.push(n);
        }
      }
    }

    const liberties: Point[] = Array.from(libertiesSet).map(key => {
      const [kr, kc] = key.split(',').map(Number);
      return { r: kr, c: kc };
    });

    return {
      color,
      stones,
      liberties,
      libertyCount: liberties.length
    };
  }

  /**
   * 3. 核心算法：落子执行 (Play Move)
   * 检查合法性 ➔ 放置棋子 ➔ 提吃死子 ➔ 判定单劫坐标 ➔ 记录历史 ➔ 轮转回合
   */
  public playMove(
    r: number,
    c: number,
    color: StoneColor = this.turn
  ): MoveResult {
    const check = this.isLegalMove(r, c, color);
    if (!check.legal) {
      return {
        success: false,
        capturedStones: [],
        errorReason: check.reason,
        isSuicide: check.reason?.includes('自杀'),
        isKo: check.reason?.includes('打劫')
      };
    }

    const opponent = getOpponent(color);
    this.grid[r][c] = color;
    const capturedStones: Point[] = [];

    // 提子逻辑：检索并移除所有 0 气的对手棋块
    const neighbors = this.getOrthogonalNeighbors(r, c);
    const checkedGroups = new Set<string>();

    for (const n of neighbors) {
      if (this.grid[n.r][n.c] === opponent) {
        const group = this.getGroup(n.r, n.c);
        if (group) {
          const repKey = `${group.stones[0].r},${group.stones[0].c}`;
          if (!checkedGroups.has(repKey)) {
            checkedGroups.add(repKey);
            if (group.libertyCount === 0) {
              capturedStones.push(...group.stones);
            }
          }
        }
      }
    }

    // 物理移除死子
    for (const p of capturedStones) {
      this.grid[p.r][p.c] = null;
    }

    // 统计提子总数
    if (color === 'B') {
      this.capturedByBlack += capturedStones.length;
    } else {
      this.capturedByWhite += capturedStones.length;
    }

    // 4. 劫争追踪 (Ko Point Tracking):
    // 若单子提单子，且落子后该子仅剩 1 气，则记录劫争禁着点坐标
    const ownGroupAfter = this.getGroup(r, c);
    if (
      capturedStones.length === 1 &&
      ownGroupAfter &&
      ownGroupAfter.stones.length === 1 &&
      ownGroupAfter.libertyCount === 1
    ) {
      this.koPoint = { ...capturedStones[0] };
    } else {
      this.koPoint = null;
    }

    this.consecutivePasses = 0;
    const currentHash = this.getBoardHash();
    this.stateHistory.add(currentHash);

    const record: MoveRecord = {
      point: { r, c },
      color,
      capturedStones,
      koPoint: this.koPoint ? { ...this.koPoint } : null,
      boardHash: currentHash
    };
    this.history.push(record);
    this.turn = opponent;

    return {
      success: true,
      capturedStones
    };
  }

  /**
   * 虚手停着 (Pass Move)
   */
  public pass(color: StoneColor = this.turn): boolean {
    const opponent = getOpponent(color);
    this.koPoint = null; // 虚手后劫争解开
    this.consecutivePasses++;

    const record: MoveRecord = {
      point: null,
      color,
      capturedStones: [],
      koPoint: null,
      boardHash: this.getBoardHash()
    };
    this.history.push(record);
    this.turn = opponent;

    return this.consecutivePasses >= 2;
  }

  /**
   * 悔棋 (Undo Move)
   */
  public undo(): boolean {
    if (this.history.length === 0) return false;
    this.history.pop();

    const originalHistory = [...this.history];
    const size = this.size;
    const komi = this.komi;
    this.reset(size);
    this.komi = komi;

    for (const record of originalHistory) {
      if (record.point === null) {
        this.pass(record.color);
      } else {
        this.playMove(record.point.r, record.point.c, record.color);
      }
    }
    return true;
  }

  /**
   * 5. 核心算法：真眼与假眼拓扑判定 (Real vs False Eye Evaluation)
   */
  public evaluateEye(r: number, c: number, ownerColor: StoneColor): EyeInfo {
    const opponent = getOpponent(ownerColor);

    if (!this.isValidCoord(r, c) || this.grid[r][c] !== null) {
      return { point: { r, c }, ownerColor, status: 'NONE', reason: '不是空交叉点' };
    }

    const orthoNeighbors = this.getOrthogonalNeighbors(r, c);
    const diagNeighbors = this.getDiagonalNeighbors(r, c);

    // 四周正交邻点必须全为己方棋子
    const orthoFriendly = orthoNeighbors.filter(p => this.grid[p.r][p.c] === ownerColor).length;
    if (orthoFriendly !== orthoNeighbors.length) {
      return { point: { r, c }, ownerColor, status: 'NONE', reason: '四周未被同色棋子完整包围' };
    }

    const opponentDiagonals = diagNeighbors.filter(p => this.grid[p.r][p.c] === opponent).length;
    const totalDiagonals = diagNeighbors.length;

    // 角部真眼 (总共 1 个对角点): 敌方占据 0 个为真眼
    if (totalDiagonals === 1) {
      if (opponentDiagonals === 0) {
        return { point: { r, c }, ownerColor, status: 'REAL', reason: '角部真眼（对角无敌方棋子）' };
      } else {
        return { point: { r, c }, ownerColor, status: 'FALSE', reason: '角部假眼（对角被敌方占据）' };
      }
    }

    // 边部真眼 (总共 2 个对角点): 敌方占据 0 个为真眼
    if (totalDiagonals === 2) {
      if (opponentDiagonals === 0) {
        return { point: { r, c }, ownerColor, status: 'REAL', reason: '边部真眼（两对角安全）' };
      } else {
        return { point: { r, c }, ownerColor, status: 'FALSE', reason: '边部假眼（对角有敌方棋子渗入）' };
      }
    }

    // 中腹真眼 (总共 4 个对角点): 敌方占据最多 1 个为真眼 (>=3 个安全)
    if (totalDiagonals === 4) {
      if (opponentDiagonals <= 1) {
        return { point: { r, c }, ownerColor, status: 'REAL', reason: '中腹真眼（占据至少3个对角）' };
      } else {
        return { point: { r, c }, ownerColor, status: 'FALSE', reason: '中腹假眼（敌方占据2个及以上对角）' };
      }
    }

    return { point: { r, c }, ownerColor, status: 'FALSE', reason: '假眼' };
  }

  /**
   * 6. 核心算法：中国数子法领地与胜负结算 (Chinese Area Scoring)
   */
  public calculateScore(): ScoreBreakdown {
    let blackStones = 0;
    let whiteStones = 0;

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] === 'B') blackStones++;
        if (this.grid[r][c] === 'W') whiteStones++;
      }
    }

    const territoryMap: ('B' | 'W' | 'DAME' | null)[][] = Array.from({ length: this.size }, () =>
      Array(this.size).fill(null)
    );
    const visited = new Set<string>();
    let blackTerritory = 0;
    let whiteTerritory = 0;
    let dame = 0;

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const key = `${r},${c}`;
        if (this.grid[r][c] === null && !visited.has(key)) {
          const region: Point[] = [];
          const queue: Point[] = [{ r, c }];
          visited.add(key);
          let touchesBlack = false;
          let touchesWhite = false;

          while (queue.length > 0) {
            const cur = queue.shift()!;
            region.push(cur);

            const neighbors = this.getOrthogonalNeighbors(cur.r, cur.c);
            for (const n of neighbors) {
              const nColor = this.grid[n.r][n.c];
              if (nColor === 'B') {
                touchesBlack = true;
              } else if (nColor === 'W') {
                touchesWhite = true;
              } else {
                const nKey = `${n.r},${n.c}`;
                if (!visited.has(nKey)) {
                  visited.add(nKey);
                  queue.push(n);
                }
              }
            }
          }

          let owner: 'B' | 'W' | 'DAME' = 'DAME';
          if (touchesBlack && !touchesWhite) {
            owner = 'B';
            blackTerritory += region.length;
          } else if (touchesWhite && !touchesBlack) {
            owner = 'W';
            whiteTerritory += region.length;
          } else {
            dame += region.length;
          }

          for (const p of region) {
            territoryMap[p.r][p.c] = owner;
          }
        }
      }
    }

    const blackTotal = blackStones + blackTerritory;
    const whiteTotal = whiteStones + whiteTerritory + this.komi;

    let winner: StoneColor | 'TIE' = 'TIE';
    if (blackTotal > whiteTotal) winner = 'B';
    else if (whiteTotal > blackTotal) winner = 'W';

    const margin = Math.abs(blackTotal - whiteTotal);

    return {
      blackStones,
      whiteStones,
      blackTerritory,
      whiteTerritory,
      dame,
      komi: this.komi,
      blackTotal,
      whiteTotal,
      winner,
      margin,
      territoryMap
    };
  }

  /**
   * 势力热力图评估 (Influence Map)
   */
  public getInfluenceMap(): number[][] {
    const map = Array.from({ length: this.size }, () => Array(this.size).fill(0));
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const color = this.grid[r][c];
        if (color) {
          const sign = color === 'B' ? 1 : -1;
          for (let tr = 0; tr < this.size; tr++) {
            for (let tc = 0; tc < this.size; tc++) {
              const dist = Math.abs(r - tr) + Math.abs(c - tc);
              if (dist <= 3) {
                const weight = Math.max(0, 1 - dist * 0.28);
                map[tr][tc] += sign * weight;
              }
            }
          }
        }
      }
    }
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        map[r][c] = Math.max(-1, Math.min(1, map[r][c]));
      }
    }
    return map;
  }

  public getOpponentColor(color: StoneColor): StoneColor {
    return getOpponent(color);
  }

  /**
   * 7. 规则引擎自动化单测套件 (Rule Engine Self-Test Suite)
   */
  public static runSelfTests(): { success: boolean; passed: number; total: number; logs: string[] } {
    const logs: string[] = [];
    let passed = 0;
    let total = 0;

    const test = (name: string, fn: () => boolean) => {
      total++;
      try {
        const ok = fn();
        if (ok) {
          passed++;
          logs.push(`✅ [PASS] ${name}`);
        } else {
          logs.push(`❌ [FAIL] ${name}`);
        }
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e);
        logs.push(`❌ [ERROR] ${name}: ${errMsg}`);
      }
    };

    // Test 1: Liberties count on empty board
    test('中心独子应有 4 气，边上 3 气，角上 2 气', () => {
      const g = new GoGame(5);
      g.setCell(2, 2, 'B'); // Center
      g.setCell(0, 2, 'B'); // Side
      g.setCell(0, 0, 'B'); // Corner
      return (
        g.getLibertiesCount(2, 2) === 4 &&
        g.getLibertiesCount(0, 2) === 3 &&
        g.getLibertiesCount(0, 0) === 2
      );
    });

    // Test 2: Connected group liberty sharing
    test('连通块共享所有外围气', () => {
      const g = new GoGame(5);
      g.playMove(2, 2, 'B');
      g.playMove(0, 0, 'W');
      g.playMove(2, 3, 'B'); // Connected to (2,2)
      return g.getLibertiesCount(2, 2) === 6;
    });

    // Test 3: Capture of 1 stone
    test('单子提吃：堵住最后一口气完成提子', () => {
      const g = new GoGame(5);
      g.setCell(2, 2, 'W');
      g.setCell(1, 2, 'B');
      g.setCell(3, 2, 'B');
      g.setCell(2, 1, 'B');
      // White has only (2,3) left
      const res = g.playMove(2, 3, 'B');
      return res.success && res.capturedStones.length === 1 && g.getCell(2, 2) === null;
    });

    // Test 4: Suicide rule rejection
    test('自杀步禁着点拦截：落子后自身无气被判定为非法', () => {
      const g = new GoGame(5);
      g.setCell(1, 2, 'W');
      g.setCell(3, 2, 'W');
      g.setCell(2, 1, 'W');
      g.setCell(2, 3, 'W');
      // Black playing into (2,2) is suicide
      const check = g.isLegalMove(2, 2, 'B');
      return !check.legal && (check.reason?.includes('自杀') ?? false);
    });

    // Test 5: Suicide allowed when capturing
    test('落子虽自身无气但能提吃对方子，属于合法着法', () => {
      const g = new GoGame(5);
      g.setCell(0, 0, 'W');
      g.setCell(0, 1, 'B');
      // White on (0,0) has only (1,0)
      const res = g.playMove(1, 0, 'B');
      return res.success && res.capturedStones.length === 1 && g.getCell(0, 0) === null;
    });

    // Test 6: Ko Rule detection
    test('打劫禁着点拦截：单子互提不能即时反提', () => {
      const g = new GoGame(5);
      // Setup Ko shape
      g.setCell(1, 2, 'B');
      g.setCell(3, 2, 'B');
      g.setCell(2, 1, 'B');
      g.setCell(1, 3, 'W');
      g.setCell(3, 3, 'W');
      g.setCell(2, 4, 'W');
      g.setCell(2, 3, 'W'); // White in atari at (2,3)

      // Black takes Ko at (2,2)
      const res1 = g.playMove(2, 2, 'B');
      if (!res1.success || res1.capturedStones.length !== 1) return false;

      // White immediately trying to retake at (2,3) must be illegal
      const checkKo = g.isLegalMove(2, 3, 'W');
      return !checkKo.legal && (checkKo.reason?.includes('打劫') ?? false);
    });

    // Test 7: Atari detection
    test('叫吃高亮预警判定', () => {
      const g = new GoGame(5);
      g.setCell(2, 2, 'W');
      g.setCell(1, 2, 'B');
      g.setCell(3, 2, 'B');
      g.setCell(2, 1, 'B');
      const ataris = g.getAtariGroups();
      return ataris.length === 1 && ataris[0].color === 'W' && ataris[0].libertyCount === 1;
    });

    return {
      success: passed === total,
      passed,
      total,
      logs
    };
  }
}

