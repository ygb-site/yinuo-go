/**
 * 少儿智趣数独引擎 (Kid-Friendly Smart Sudoku Engine)
 * 支持 4×4 (四宫格), 6×6 (六宫格), 9×9 (九宫格)
 * 具备：确定性唯一解生成器、回溯求解器、候选数推导、智能提示、主题映射
 */

export type SudokuSize = 4 | 6 | 9;
export type SudokuDifficulty = "easy" | "medium" | "hard";
export type SudokuTheme = "number" | "fruit" | "animal" | "gem";

export interface SudokuBoxConfig {
  boxRows: number;
  boxCols: number;
}

export const SUDOKU_CONFIGS: Record<SudokuSize, SudokuBoxConfig> = {
  4: { boxRows: 2, boxCols: 2 },
  6: { boxRows: 2, boxCols: 3 },
  9: { boxRows: 3, boxCols: 3 }
};

export const SUDOKU_THEMES: Record<SudokuTheme, { name: string; icon: string; symbols: string[] }> = {
  number: {
    name: "经典数字",
    icon: "🔢",
    symbols: ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
  },
  fruit: {
    name: "美味水果",
    icon: "🍎",
    symbols: ["🍎", "🍌", "🍇", "🍓", "🍊", "🍉", "🥝", "🍍", "🍒"]
  },
  animal: {
    name: "萌趣动物",
    icon: "🐶",
    symbols: ["🐶", "🐱", "🐰", "🐼", "🦊", "🦁", "🐻", "🐯", "🐨"]
  },
  gem: {
    name: "奇幻宝石",
    icon: "💎",
    symbols: ["💎", "🔮", "⭐", "🍀", "🌸", "⚡", "🌙", "🔥", "☀️"]
  }
};

export interface SudokuCell {
  row: number;
  col: number;
  value: number; // 0 for empty, 1..size for filled
  solutionValue: number;
  isInitial: boolean; // Pre-filled clue
  notes: number[]; // Pencil marks (1..size)
  isError?: boolean;
  isHinted?: boolean;
}

export interface SudokuPuzzleDef {
  id: string;
  title: string;
  size: SudokuSize;
  difficulty: SudokuDifficulty;
  cluesCount: number;
  initialGrid: number[][];
  solutionGrid: number[][];
}

/**
 * 检查在 (row, col) 放置 value 是否符合行、列、宫唯一性
 */
export function isValidPlacement(
  grid: number[][],
  row: number,
  col: number,
  value: number,
  size: SudokuSize
): boolean {
  if (value < 1 || value > size) return false;
  const { boxRows, boxCols } = SUDOKU_CONFIGS[size];

  // 1. 检查行
  for (let c = 0; c < size; c++) {
    if (c !== col && grid[row][c] === value) return false;
  }

  // 2. 检查列
  for (let r = 0; r < size; r++) {
    if (r !== row && grid[r][col] === value) return false;
  }

  // 3. 检查所在宫
  const startRow = Math.floor(row / boxRows) * boxRows;
  const startCol = Math.floor(col / boxCols) * boxCols;
  for (let r = startRow; r < startRow + boxRows; r++) {
    for (let c = startCol; c < startCol + boxCols; c++) {
      if ((r !== row || c !== col) && grid[r][c] === value) return false;
    }
  }

  return true;
}

/**
 * 获取指定单元格的所有有效候选数
 */
export function getCandidates(grid: number[][], row: number, col: number, size: SudokuSize): number[] {
  if (grid[row][col] !== 0) return [];
  const candidates: number[] = [];
  for (let val = 1; val <= size; val++) {
    if (isValidPlacement(grid, row, col, val, size)) {
      candidates.push(val);
    }
  }
  return candidates;
}

/**
 * 求解数独 (回溯法，支持返回解的数量以验证唯一解)
 */
export function solveSudoku(
  grid: number[][],
  size: SudokuSize,
  countOnly: boolean = false,
  maxSolutions: number = 2
): { solved: boolean; count: number; solution: number[][] | null } {
  const current = grid.map(row => [...row]);
  let solutionCount = 0;
  let finalSolution: number[][] | null = null;

  function findEmptyCell(): [number, number] | null {
    let minCandidates = 999;
    let bestCell: [number, number] | null = null;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (current[r][c] === 0) {
          const candidates = getCandidates(current, r, c, size);
          if (candidates.length === 0) return [-1, -1]; // Dead end
          if (candidates.length < minCandidates) {
            minCandidates = candidates.length;
            bestCell = [r, c];
            if (minCandidates === 1) return bestCell;
          }
        }
      }
    }
    return bestCell;
  }

  function backtrack(): boolean {
    const next = findEmptyCell();
    if (!next) {
      // All filled
      solutionCount++;
      if (!finalSolution) {
        finalSolution = current.map(row => [...row]);
      }
      if (!countOnly) return true;
      return solutionCount >= maxSolutions;
    }

    const [row, col] = next;
    if (row === -1) return false; // Dead end

    const candidates = getCandidates(current, row, col, size);
    for (const val of candidates) {
      current[row][col] = val;
      if (backtrack()) {
        return true;
      }
      current[row][col] = 0;
    }
    return false;
  }

  backtrack();

  return {
    solved: solutionCount > 0,
    count: solutionCount,
    solution: finalSolution
  };
}

/**
 * 随机洗牌数组
 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 生成完整的有效数独终盘 (Full Valid Board)
 */
export function generateFullBoard(size: SudokuSize): number[][] {
  const grid: number[][] = Array.from({ length: size }, () => Array(size).fill(0));
  const digits = Array.from({ length: size }, (_, i) => i + 1);

  function fillGrid(): boolean {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === 0) {
          const shuffledDigits = shuffle(digits);
          for (const val of shuffledDigits) {
            if (isValidPlacement(grid, r, c, val, size)) {
              grid[r][c] = val;
              if (fillGrid()) return true;
              grid[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  fillGrid();
  return grid;
}

/**
 * 根据难度挖空生成题目，并确保【唯一解】
 */
export function generateSudokuPuzzle(
  size: SudokuSize,
  difficulty: SudokuDifficulty = "easy"
): { initial: number[][]; solution: number[][] } {
  const fullBoard = generateFullBoard(size);
  const solution = fullBoard.map(row => [...row]);
  const puzzle = fullBoard.map(row => [...row]);

  // 根据规格和难度决定保留提示数目标
  let targetClues = 0;
  if (size === 4) {
    targetClues = difficulty === "easy" ? 9 : difficulty === "medium" ? 7 : 6;
  } else if (size === 6) {
    targetClues = difficulty === "easy" ? 20 : difficulty === "medium" ? 16 : 13;
  } else {
    // 9x9
    targetClues = difficulty === "easy" ? 38 : difficulty === "medium" ? 30 : 25;
  }

  // 生成所有坐标并随机打乱
  const positions: [number, number][] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      positions.push([r, c]);
    }
  }
  const shuffledPositions = shuffle(positions);

  let currentClues = size * size;
  for (const [r, c] of shuffledPositions) {
    if (currentClues <= targetClues) break;

    const originalVal = puzzle[r][c];
    puzzle[r][c] = 0;

    // 检查挖空后是否仍然保持唯一解
    const check = solveSudoku(puzzle, size, true, 2);
    if (check.count !== 1) {
      // 非唯一解，还原该格
      puzzle[r][c] = originalVal;
    } else {
      currentClues--;
    }
  }

  return {
    initial: puzzle,
    solution
  };
}

/**
 * 智能提示：寻找当前盘面最易于推理的一个步骤
 */
export interface SmartHintResult {
  row: number;
  col: number;
  value: number;
  technique: "naked_single" | "hidden_single_row" | "hidden_single_col" | "hidden_single_box" | "solution_fallback";
  explanation: string;
}

export function findSmartHint(
  currentGrid: number[][],
  solutionGrid: number[][],
  size: SudokuSize
): SmartHintResult | null {
  const { boxRows, boxCols } = SUDOKU_CONFIGS[size];

  // 1. 优先寻找 显性唯一数 (Naked Single - 该格只有1个合法候选数)
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (currentGrid[r][c] === 0) {
        const candidates = getCandidates(currentGrid, r, c, size);
        if (candidates.length === 1) {
          const val = candidates[0];
          return {
            row: r,
            col: c,
            value: val,
            technique: "naked_single",
            explanation: "观察第 " + (r + 1) + " 行第 " + (c + 1) + " 列，该格子所在的行、列或宫已经包含了其他数字，因此这里只能填入 " + val + "！"
          };
        }
      }
    }
  }

  // 2. 寻找 隐性唯余 (Hidden Single in Row / Col / Box)
  // 检查行
  for (let r = 0; r < size; r++) {
    for (let val = 1; val <= size; val++) {
      let count = 0;
      let targetCol = -1;
      for (let c = 0; c < size; c++) {
        if (currentGrid[r][c] === 0 && isValidPlacement(currentGrid, r, c, val, size)) {
          count++;
          targetCol = c;
        }
      }
      if (count === 1 && targetCol !== -1) {
        return {
          row: r,
          col: targetCol,
          value: val,
          technique: "hidden_single_row",
          explanation: "在第 " + (r + 1) + " 行中，数字 " + val + " 只能填在第 " + (targetCol + 1) + " 列的位置！"
        };
      }
    }
  }

  // 检查列
  for (let c = 0; c < size; c++) {
    for (let val = 1; val <= size; val++) {
      let count = 0;
      let targetRow = -1;
      for (let r = 0; r < size; r++) {
        if (currentGrid[r][c] === 0 && isValidPlacement(currentGrid, r, c, val, size)) {
          count++;
          targetRow = r;
        }
      }
      if (count === 1 && targetRow !== -1) {
        return {
          row: targetRow,
          col: c,
          value: val,
          technique: "hidden_single_col",
          explanation: "在第 " + (c + 1) + " 列中，数字 " + val + " 只能填在第 " + (targetRow + 1) + " 行的位置！"
        };
      }
    }
  }

  // 检查宫
  for (let br = 0; br < size; br += boxRows) {
    for (let bc = 0; bc < size; bc += boxCols) {
      for (let val = 1; val <= size; val++) {
        let count = 0;
        let targetR = -1;
        let targetC = -1;
        for (let r = br; r < br + boxRows; r++) {
          for (let c = bc; c < bc + boxCols; c++) {
            if (currentGrid[r][c] === 0 && isValidPlacement(currentGrid, r, c, val, size)) {
              count++;
              targetR = r;
              targetC = c;
            }
          }
        }
        if (count === 1 && targetR !== -1) {
          return {
            row: targetR,
            col: targetC,
            value: val,
            technique: "hidden_single_box",
            explanation: "在当前宫格中，数字 " + val + " 只有一个空位可以放下！"
          };
        }
      }
    }
  }

  // 3. Fallback: 任意找一个未填空位并返回正确解
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (currentGrid[r][c] === 0) {
        const solVal = solutionGrid[r][c];
        return {
          row: r,
          col: c,
          value: solVal,
          technique: "solution_fallback",
          explanation: "小诺提示：第 " + (r + 1) + " 行第 " + (c + 1) + " 列填入数字 " + solVal + " 即可继续顺畅通关！"
        };
      }
    }
  }

  return null;
}

/**
 * 经典预设启蒙关卡库 (Curated Kid-Friendly Level Pack)
 */
export const PRESET_SUDOKU_LEVELS: SudokuPuzzleDef[] = [
  {
    "id": "sudoku_4_1",
    "title": "四宫格 · 初尝数独",
    "size": 4,
    "difficulty": "easy",
    "cluesCount": 10,
    "initialGrid": [
      [
        1,
        2,
        3,
        0
      ],
      [
        3,
        0,
        1,
        2
      ],
      [
        0,
        1,
        4,
        0
      ],
      [
        4,
        3,
        0,
        1
      ]
    ],
    "solutionGrid": [
      [
        1,
        2,
        3,
        4
      ],
      [
        3,
        4,
        1,
        2
      ],
      [
        2,
        1,
        4,
        3
      ],
      [
        4,
        3,
        2,
        1
      ]
    ]
  },
  {
    "id": "sudoku_4_2",
    "title": "四宫格 · 水果连线",
    "size": 4,
    "difficulty": "easy",
    "cluesCount": 8,
    "initialGrid": [
      [
        3,
        0,
        1,
        4
      ],
      [
        4,
        1,
        0,
        0
      ],
      [
        0,
        0,
        3,
        2
      ],
      [
        2,
        3,
        0,
        1
      ]
    ],
    "solutionGrid": [
      [
        3,
        2,
        1,
        4
      ],
      [
        4,
        1,
        2,
        3
      ],
      [
        1,
        4,
        3,
        2
      ],
      [
        2,
        3,
        4,
        1
      ]
    ]
  },
  {
    "id": "sudoku_4_3",
    "title": "四宫格 · 萌宝进阶",
    "size": 4,
    "difficulty": "medium",
    "cluesCount": 6,
    "initialGrid": [
      [
        0,
        4,
        2,
        0
      ],
      [
        2,
        0,
        0,
        3
      ],
      [
        1,
        0,
        0,
        4
      ],
      [
        0,
        3,
        1,
        0
      ]
    ],
    "solutionGrid": [
      [
        3,
        4,
        2,
        1
      ],
      [
        2,
        1,
        4,
        3
      ],
      [
        1,
        2,
        3,
        4
      ],
      [
        4,
        3,
        1,
        2
      ]
    ]
  },
  {
    "id": "sudoku_6_1",
    "title": "六宫格 · 趣味启航",
    "size": 6,
    "difficulty": "easy",
    "cluesCount": 22,
    "initialGrid": [
      [
        1,
        2,
        3,
        4,
        5,
        0
      ],
      [
        4,
        0,
        6,
        1,
        0,
        3
      ],
      [
        2,
        3,
        1,
        5,
        6,
        4
      ],
      [
        5,
        6,
        0,
        2,
        3,
        1
      ],
      [
        0,
        1,
        2,
        6,
        4,
        5
      ],
      [
        6,
        4,
        5,
        0,
        1,
        2
      ]
    ],
    "solutionGrid": [
      [
        1,
        2,
        3,
        4,
        5,
        6
      ],
      [
        4,
        5,
        6,
        1,
        2,
        3
      ],
      [
        2,
        3,
        1,
        5,
        6,
        4
      ],
      [
        5,
        6,
        4,
        2,
        3,
        1
      ],
      [
        3,
        1,
        2,
        6,
        4,
        5
      ],
      [
        6,
        4,
        5,
        3,
        1,
        2
      ]
    ]
  },
  {
    "id": "sudoku_6_2",
    "title": "六宫格 · 智慧森林",
    "size": 6,
    "difficulty": "medium",
    "cluesCount": 16,
    "initialGrid": [
      [
        1,
        0,
        3,
        0,
        5,
        0
      ],
      [
        0,
        5,
        0,
        1,
        0,
        3
      ],
      [
        2,
        0,
        1,
        0,
        6,
        4
      ],
      [
        0,
        6,
        0,
        2,
        0,
        1
      ],
      [
        3,
        0,
        2,
        0,
        4,
        0
      ],
      [
        0,
        4,
        0,
        3,
        0,
        2
      ]
    ],
    "solutionGrid": [
      [
        1,
        2,
        3,
        4,
        5,
        6
      ],
      [
        4,
        5,
        6,
        1,
        2,
        3
      ],
      [
        2,
        3,
        1,
        5,
        6,
        4
      ],
      [
        5,
        6,
        4,
        2,
        3,
        1
      ],
      [
        3,
        1,
        2,
        6,
        4,
        5
      ],
      [
        6,
        4,
        5,
        3,
        1,
        2
      ]
    ]
  },
  {
    "id": "sudoku_9_1",
    "title": "九宫格 · 大师初试",
    "size": 9,
    "difficulty": "easy",
    "cluesCount": 30,
    "initialGrid": [
      [
        5,
        3,
        0,
        0,
        7,
        0,
        0,
        0,
        0
      ],
      [
        6,
        0,
        0,
        1,
        9,
        5,
        0,
        0,
        0
      ],
      [
        0,
        9,
        8,
        0,
        0,
        0,
        0,
        6,
        0
      ],
      [
        8,
        0,
        0,
        0,
        6,
        0,
        0,
        0,
        3
      ],
      [
        4,
        0,
        0,
        8,
        0,
        3,
        0,
        0,
        1
      ],
      [
        7,
        0,
        0,
        0,
        2,
        0,
        0,
        0,
        6
      ],
      [
        0,
        6,
        0,
        0,
        0,
        0,
        2,
        8,
        0
      ],
      [
        0,
        0,
        0,
        4,
        1,
        9,
        0,
        0,
        5
      ],
      [
        0,
        0,
        0,
        0,
        8,
        0,
        0,
        7,
        9
      ]
    ],
    "solutionGrid": [
      [
        5,
        3,
        4,
        6,
        7,
        8,
        9,
        1,
        2
      ],
      [
        6,
        7,
        2,
        1,
        9,
        5,
        3,
        4,
        8
      ],
      [
        1,
        9,
        8,
        3,
        4,
        2,
        5,
        6,
        7
      ],
      [
        8,
        5,
        9,
        7,
        6,
        1,
        4,
        2,
        3
      ],
      [
        4,
        2,
        6,
        8,
        5,
        3,
        7,
        9,
        1
      ],
      [
        7,
        1,
        3,
        9,
        2,
        4,
        8,
        5,
        6
      ],
      [
        9,
        6,
        1,
        5,
        3,
        7,
        2,
        8,
        4
      ],
      [
        2,
        8,
        7,
        4,
        1,
        9,
        6,
        3,
        5
      ],
      [
        3,
        4,
        5,
        2,
        8,
        6,
        1,
        7,
        9
      ]
    ]
  }
];
