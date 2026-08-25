/**
 * 棋盘坐标 (Board Point)
 */
export interface Point {
  r: number;
  c: number;
}

/**
 * 棋子颜色常量与代码定义 (Stone Color Codes)
 * 0: 空 None, 1: 黑 Black, 2: 白 White
 */
export const StoneColorCode = {
  NONE: 0,
  BLACK: 1,
  WHITE: 2
} as const;

export type NumericColor = (typeof StoneColorCode)[keyof typeof StoneColorCode];

/**
 * 棋子颜色字符串类型 ('B' | 'W')
 */
export type StoneColor = 'B' | 'W';
export type BoardCell = StoneColor | null;

/**
 * 棋盘标准尺寸定义
 * 5 路仅用于主线/死活等教学棋盘，亲子对局不开放。
 */
export type BoardSize = 5 | 7 | 9 | 13 | 19 | number;

/** 亲子对局可选路数 */
export const GO_MATCH_BOARD_SIZES = [7, 9, 13, 19] as const;
export type GoMatchBoardSize = (typeof GO_MATCH_BOARD_SIZES)[number];

export function isGoMatchBoardSize(size: number): size is GoMatchBoardSize {
  return (GO_MATCH_BOARD_SIZES as readonly number[]).includes(size);
}

/**
 * 棋子连通块与气数结构 (Stone Group & Liberties)
 */
export interface StoneGroup {
  color: StoneColor;
  stones: Point[];
  liberties: Point[];
  libertyCount: number;
}

/**
 * 单手着法历史记录 (Move Record for Undo & Single Ko Tracking)
 */
export interface MoveRecord {
  point: Point | null; // null 为虚手 Pass
  color: StoneColor;
  capturedStones: Point[];
  koPoint?: Point | null; // 产生打劫的禁着点坐标
  boardHash: string;
  comment?: string;
}

/**
 * 移动判定与执行结果 (Move Execution Result)
 */
export interface MoveResult {
  success: boolean;
  capturedStones: Point[];
  isSuicide?: boolean;
  isKo?: boolean;
  errorReason?: string;
}

/**
 * 终局数子与胜负判定结算结构 (Score Breakdown)
 */
export interface ScoreBreakdown {
  blackStones: number;
  whiteStones: number;
  blackTerritory: number;
  whiteTerritory: number;
  dame: number;
  komi: number;
  blackTotal: number;
  whiteTotal: number;
  winner: StoneColor | 'TIE';
  margin: number;
  territoryMap: ('B' | 'W' | 'DAME' | null)[][];
}

/**
 * 眼位状态评估 (Eye Shape Evaluation)
 */
export type EyeStatus = 'REAL' | 'FALSE' | 'NONE';

export interface EyeInfo {
  point: Point;
  ownerColor: StoneColor;
  status: EyeStatus;
  reason: string;
}

/**
 * 叫吃预警数据 (Atari Warning Alert)
 */
export interface AtariAlert {
  color: StoneColor;
  group: StoneGroup;
  escapePoints: Point[];
}

export interface AIMoveHint {
  point: Point;
  score: number;
  reason: string;
}

/**
 * 颜色转换与对手推导工具
 */
export function getOpponent(color: StoneColor): StoneColor {
  return color === 'B' ? 'W' : 'B';
}

