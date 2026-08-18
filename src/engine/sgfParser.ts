import { GoBoard } from './GoBoard';
import type { StoneColor, Point } from './types';

export interface SGFGameInfo {
  gameName?: string;
  blackPlayer?: string;
  whitePlayer?: string;
  boardSize: number;
  komi: number;
  result?: string;
  date?: string;
  moves: { color: StoneColor; point: Point | null; comment?: string }[];
  initialStones?: { color: StoneColor; point: Point }[];
}

export class SGFParser {
  private static charToCoord(c: string): number {
    return c.charCodeAt(0) - 'a'.charCodeAt(0);
  }

  private static coordToChar(n: number): string {
    return String.fromCharCode('a'.charCodeAt(0) + n);
  }

  /**
   * Export a GoBoard history to SGF string
   */
  public static exportToSGF(
    board: GoBoard,
    info: {
      blackPlayer?: string;
      whitePlayer?: string;
      gameName?: string;
      result?: string;
    } = {}
  ): string {
    const today = new Date().toISOString().split('T')[0];
    let sgf = '(;GM[1]FF[4]CA[UTF-8]';
    sgf += `AP[YiNuoGo:1.0]`;
    sgf += `SZ[${board.size}]`;
    sgf += `KM[${board.komi}]`;
    sgf += `RU[Chinese]`;
    sgf += `GN[${info.gameName || '一诺弈学少儿对局'}]`;
    sgf += `PB[${info.blackPlayer || '小棋手'}]`;
    sgf += `PW[${info.whitePlayer || '一诺AI'}]`;
    sgf += `DT[${today}]`;
    if (info.result) {
      sgf += `RE[${info.result}]`;
    }

    for (const record of board.history) {
      const colorTag = record.color === 'B' ? 'B' : 'W';
      if (record.point === null) {
        sgf += `;${colorTag}[]`;
      } else {
        const colChar = this.coordToChar(record.point.c);
        const rowChar = this.coordToChar(record.point.r);
        sgf += `;${colorTag}[${colChar}${rowChar}]`;
      }
    }

    sgf += ')';
    return sgf;
  }

  /**
   * Parse an SGF string into SGFGameInfo
   */
  public static parseSGF(sgfText: string): SGFGameInfo {
    const clean = sgfText.trim();
    let boardSize = 9;
    let komi = 5.5;
    let blackPlayer = '黑方';
    let whitePlayer = '白方';
    let gameName = '围棋棋谱';
    let result = '';
    const moves: { color: StoneColor; point: Point | null; comment?: string }[] = [];
    const initialStones: { color: StoneColor; point: Point }[] = [];

    // Extract SZ
    const szMatch = clean.match(/SZ\[(\d+)\]/i);
    if (szMatch) boardSize = parseInt(szMatch[1], 10);

    // Extract KM
    const kmMatch = clean.match(/KM\[([0-9.]+)\]/i);
    if (kmMatch) komi = parseFloat(kmMatch[1]);

    // Extract PB / PW
    const pbMatch = clean.match(/PB\[([^\]]+)\]/i);
    if (pbMatch) blackPlayer = pbMatch[1];
    const pwMatch = clean.match(/PW\[([^\]]+)\]/i);
    if (pwMatch) whitePlayer = pwMatch[1];

    // Extract GN
    const gnMatch = clean.match(/GN\[([^\]]+)\]/i);
    if (gnMatch) gameName = gnMatch[1];

    // Extract RE
    const reMatch = clean.match(/RE\[([^\]]+)\]/i);
    if (reMatch) result = reMatch[1];

    // Parse Nodes: ;B[ab] or ;W[cd] or ;B[]
    const nodeRegex = /;([BW])\[([a-z]*)\](?:C\[([^\]]*)\])?/gi;
    let match: RegExpExecArray | null;

    while ((match = nodeRegex.exec(clean)) !== null) {
      const color: StoneColor = match[1].toUpperCase() === 'B' ? 'B' : 'W';
      const coordStr = match[2];
      const comment = match[3];

      if (!coordStr || coordStr === 'tt' || coordStr.length < 2) {
        moves.push({ color, point: null, comment });
      } else {
        const c = this.charToCoord(coordStr[0]);
        const r = this.charToCoord(coordStr[1]);
        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize) {
          moves.push({ color, point: { r, c }, comment });
        }
      }
    }

    return {
      boardSize,
      komi,
      blackPlayer,
      whitePlayer,
      gameName,
      result,
      moves,
      initialStones
    };
  }
}

