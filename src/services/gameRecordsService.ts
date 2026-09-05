import { getSupabaseClient } from '../lib/supabase';
import { useUserStore } from '../stores/useUserStore';

export type GameType = 'go' | 'checkers' | 'gomoku' | 'xiangqi';

export interface WinRatePoint {
  stepIndex: number;
  player1WinRate: number; // 0..100 (e.g. Black / Player 1)
  player2WinRate: number; // 0..100 (e.g. White / Player 2)
  delta: number;
  quality?: 'god_move' | 'great_move' | 'normal_move' | 'slow_move' | 'blunder';
  qualityBadge?: string;
  comment?: string;
}

export interface UnifiedGameRecord {
  id: string;
  gameType: GameType;
  gameTypeName: string;
  mode: string;
  modeName: string;
  title: string;
  playedAt: string;
  createdAt: number;
  winnerName: string;
  winnerAvatar: string;
  winnerPlayerId: number | string;
  isUserWinner: boolean;
  totalMoves: number;
  durationSeconds: number;
  metadata?: Record<string, unknown>;
  initialState?: Record<string, unknown>;
  moves: unknown[];
  winRateHistory: WinRatePoint[];
}

const LOCAL_STORAGE_KEY = 'yinuo_unified_game_records_v1';

export function getLocalGameRecords(gameType?: GameType | 'all'): UnifiedGameRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const list: UnifiedGameRecord[] = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    if (!gameType || gameType === 'all') {
      return list;
    }
    return list.filter(r => r.gameType === gameType);
  } catch (e) {
    console.error('[GameRecordsService] Failed to read local records', e);
    return [];
  }
}

export async function saveUnifiedGameRecord(record: UnifiedGameRecord): Promise<UnifiedGameRecord> {
  // 1. Always save to LocalStorage first (Instant & Offline resilient)
  if (typeof window !== 'undefined') {
    try {
      const existing = getLocalGameRecords('all');
      const updated = [record, ...existing.filter(r => r.id !== record.id)].slice(0, 100);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('[GameRecordsService] LocalStorage save quota exceeded', e);
    }
  }

  // 2. Cloud Sync to Supabase if client is ready and user is signed in
  const client = getSupabaseClient();
  const userStore = useUserStore();

  if (client && userStore.isLoggedIn && userStore.currentUserId) {
    try {
      const dbRow = {
        id: record.id,
        user_id: userStore.currentUserId,
        game_type: record.gameType,
        mode: record.mode,
        title: record.title,
        winner: record.winnerName,
        is_user_winner: record.isUserWinner,
        total_moves: record.totalMoves,
        duration_seconds: record.durationSeconds,
        metadata: record.metadata || {},
        moves_data: record.moves || [],
        win_rate_history: record.winRateHistory || []
      };

      const { error } = await client
        .from('game_records')
        .upsert(dbRow, { onConflict: 'id' });

      if (error) {
        console.warn('[GameRecordsService] Supabase sync notice:', error.message);
      } else {
        console.log('[GameRecordsService] Successfully synced game record to cloud DB:', record.id);
      }
    } catch (err) {
      console.warn('[GameRecordsService] Cloud sync error:', err);
    }
  }

  return record;
}

export async function deleteUnifiedGameRecord(id: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      const existing = getLocalGameRecords('all');
      const filtered = existing.filter(r => r.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    } catch {}
  }

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('game_records').delete().eq('id', id);
    } catch {}
  }

  return true;
}

export function clearLocalGameRecords(gameType?: GameType | 'all'): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (!gameType || gameType === 'all') {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } else {
      const existing = getLocalGameRecords('all');
      const remaining = existing.filter(r => r.gameType !== gameType);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remaining));
    }
    return true;
  } catch {
    return false;
  }
}

