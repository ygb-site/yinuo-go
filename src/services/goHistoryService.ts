import type { BoardSize, MoveRecord, ScoreBreakdown, StoneColor } from '../engine/types';

export interface SavedGoGame {
  id: string;
  title: string;
  createdAt: number;
  dateFormatted: string;
  mode: 'twoplayer' | 'aimatch' | 'freeboard';
  modeLabel: string;
  boardSize: BoardSize;
  komi: number;
  blackName: string;
  whiteName: string;
  history: MoveRecord[];
  totalMoves: number;
  durationSeconds?: number;
  durationFormatted?: string;
  scoreResult?: ScoreBreakdown | null;
  winner?: StoneColor | 'TIE' | null;
  winReason?: string;
}

const STORAGE_KEY = 'yinuo_saved_go_games_v1';

function formatTimestampToDate(ts: number): string {
  const d = new Date(ts);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

export function getSavedGoGames(): SavedGoGame[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list;
  } catch {
    return [];
  }
}

export function saveGoGame(
  data: Omit<SavedGoGame, 'id' | 'createdAt' | 'dateFormatted' | 'title' | 'totalMoves'> & { title?: string; totalMoves?: number }
): SavedGoGame {
  const ts = Date.now();
  const dateFormatted = formatTimestampToDate(ts);
  const modeName = data.mode === 'aimatch' ? '人机对弈' : data.mode === 'freeboard' ? '自由摆盘' : '双人对弈';
  const defaultTitle = data.title || `${dateFormatted} · ${data.boardSize}路${modeName}`;

  const newGame: SavedGoGame = {
    id: `game_${ts}_${Math.random().toString(36).substring(2, 6)}`,
    title: defaultTitle,
    createdAt: ts,
    dateFormatted,
    mode: data.mode,
    modeLabel: data.modeLabel || modeName,
    boardSize: data.boardSize,
    komi: data.komi,
    blackName: data.blackName,
    whiteName: data.whiteName,
    history: data.history,
    totalMoves: data.history.length,
    durationSeconds: data.durationSeconds,
    durationFormatted: data.durationFormatted,
    scoreResult: data.scoreResult,
    winner: data.winner,
    winReason: data.winReason
  };

  const existing = getSavedGoGames();
  // Prepend latest and cap at 100
  const updated = [newGame, ...existing.filter(g => g.id !== newGame.id)].slice(0, 100);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('[GoHistoryService] localStorage quota exceeded, truncating', e);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 30)));
  }

  return newGame;
}

export function deleteSavedGoGame(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const existing = getSavedGoGames();
    const filtered = existing.filter(g => g.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

export function clearAllSavedGoGames(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
