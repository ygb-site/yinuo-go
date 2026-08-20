import { getSupabaseClient } from '../lib/supabase';
import type { ChildProfile } from '../stores/useUserStore';

export interface CloudUserData {
  id: string;
  email: string;
  active_profile_id: string;
  profiles_data: ChildProfile[];
  settings_data: Record<string, any>;
  updated_at: string;
}

export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email?: string;
  } | null;
  error?: string;
}

export interface SyncResult {
  success: boolean;
  mergedProfiles?: ChildProfile[];
  activeProfileId?: string;
  settings?: Record<string, any>;
  error?: string;
  timestamp?: number;
}

/**
 * 智能合并本地档案与云端档案 (Smart Merge)
 * 优先合并最高通关关卡、累加/取最大星星数、经验、金币与勋章
 */
export function smartMergeProfiles(
  localProfiles: ChildProfile[],
  cloudProfiles: ChildProfile[],
  localActiveId?: string,
  cloudActiveId?: string
): { profiles: ChildProfile[]; activeId: string } {
  if (!cloudProfiles || cloudProfiles.length === 0) {
    return { profiles: localProfiles, activeId: localActiveId || localProfiles[0]?.id || '' };
  }
  if (!localProfiles || localProfiles.length === 0) {
    return { profiles: cloudProfiles, activeId: cloudActiveId || cloudProfiles[0]?.id || '' };
  }

  const mergedMap = new Map<string, ChildProfile>();

  // 1. Put cloud profiles first
  for (const cp of cloudProfiles) {
    mergedMap.set(cp.id || cp.nickname, { ...cp });
  }

  // 2. Merge local profiles into map
  for (const lp of localProfiles) {
    const key = lp.id || lp.nickname;
    const existing = mergedMap.get(key);

    if (!existing) {
      mergedMap.set(key, { ...lp });
    } else {
      // Merge progress (take highest stars & completed state)
      const mergedProgress: Record<string, { completed: boolean; stars: number; highscore?: number; completedAt?: string }> = {
        ...(existing.progress || {})
      };

      for (const [lvlId, lData] of Object.entries(lp.progress || {})) {
        const cData = mergedProgress[lvlId];
        if (!cData) {
          mergedProgress[lvlId] = { ...lData };
        } else {
          mergedProgress[lvlId] = {
            completed: cData.completed || lData.completed,
            stars: Math.max(cData.stars || 0, lData.stars || 0),
            highscore: Math.max(cData.highscore || 0, lData.highscore || 0),
            completedAt: cData.completedAt || lData.completedAt
          };
        }
      }

      // Calculate total stars from progress
      let totalStars = 0;
      for (const p of Object.values(mergedProgress)) {
        if (p.completed) {
          totalStars += p.stars || 0;
        }
      }

      // Merge badges
      const badgeSet = new Set([...(existing.badges || []), ...(lp.badges || [])]);

      // Merge solved puzzles
      const puzzleSet = new Set([...(existing.solvedPuzzles || []), ...(lp.solvedPuzzles || [])]);

      // Merge unlocked themes & avatars
      const themeSet = new Set([...(existing.unlockedThemes || ['wood']), ...(lp.unlockedThemes || ['wood'])]);
      const avatarSet = new Set([...(existing.unlockedAvatars || []), ...(lp.unlockedAvatars || [])]);

      // Merge mistakes
      const mistakeSet = new Set([...(existing.mistakes || []), ...(lp.mistakes || [])]);
      const solvedMistakeSet = new Set([...(existing.solvedMistakes || []), ...(lp.solvedMistakes || [])]);

      const merged: ChildProfile = {
        id: existing.id || lp.id,
        nickname: lp.nickname || existing.nickname,
        avatar: lp.avatar || existing.avatar,
        createdAt: Math.min(existing.createdAt || Date.now(), lp.createdAt || Date.now()),
        progress: mergedProgress,
        totalStars,
        badges: Array.from(badgeSet),
        solvedPuzzles: Array.from(puzzleSet),
        unlockedThemes: Array.from(themeSet),
        unlockedAvatars: Array.from(avatarSet),
        mistakes: Array.from(mistakeSet),
        solvedMistakes: Array.from(solvedMistakeSet),
        exp: Math.max(existing.exp || 0, lp.exp || 0),
        coins: Math.max(existing.coins || 0, lp.coins || 0),
        arcadeHighScores: {
          speedCapture: Math.max(existing.arcadeHighScores?.speedCapture || 0, lp.arcadeHighScores?.speedCapture || 0),
          countLiberties: Math.max(existing.arcadeHighScores?.countLiberties || 0, lp.arcadeHighScores?.countLiberties || 0),
          connectCut: Math.max(existing.arcadeHighScores?.connectCut || 0, lp.arcadeHighScores?.connectCut || 0)
        },
        captureGoStats: {
          wins: Math.max(existing.captureGoStats?.wins || 0, lp.captureGoStats?.wins || 0),
          matches: Math.max(existing.captureGoStats?.matches || 0, lp.captureGoStats?.matches || 0)
        },
        stats: {
          gamesPlayed: Math.max(existing.stats?.gamesPlayed || 0, lp.stats?.gamesPlayed || 0),
          gamesWon: Math.max(existing.stats?.gamesWon || 0, lp.stats?.gamesWon || 0),
          puzzlesSolved: Math.max(existing.stats?.puzzlesSolved || 0, lp.stats?.puzzlesSolved || 0),
          captureCount: Math.max(existing.stats?.captureCount || 0, lp.stats?.captureCount || 0),
          totalMoves: Math.max(existing.stats?.totalMoves || 0, lp.stats?.totalMoves || 0)
        }
      };

      mergedMap.set(key, merged);
    }
  }

  const profiles = Array.from(mergedMap.values());
  const activeId = localActiveId && profiles.some(p => p.id === localActiveId)
    ? localActiveId
    : cloudActiveId && profiles.some(p => p.id === cloudActiveId)
    ? cloudActiveId
    : profiles[0]?.id || '';

  return { profiles, activeId };
}

/**
 * 注册新家长账号
 */
export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: '未配置 Supabase 云数据库连接地址或密钥' };
  }

  try {
    const { data, error } = await client.auth.signUp({
      email: email.trim(),
      password
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      user: data.user ? { id: data.user.id, email: data.user.email } : null
    };
  } catch (err: any) {
    return { success: false, error: err?.message || '网络连接异常' };
  }
}

/**
 * 登录家长账号
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: '未配置 Supabase 云数据库连接地址或密钥' };
  }

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      user: data.user ? { id: data.user.id, email: data.user.email } : null
    };
  } catch (err: any) {
    return { success: false, error: err?.message || '网络连接异常' };
  }
}

/**
 * 退出云端账号
 */
export async function signOutCloud(): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: true };

  try {
    const { error } = await client.auth.signOut();
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || '退出登录失败' };
  }
}

/**
 * 获取当前登录用户信息
 */
export async function getCurrentCloudUser() {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data: { user } } = await client.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/**
 * 从 Supabase 下载云端进度
 */
export async function fetchCloudUserData(): Promise<CloudUserData | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data: { user } } = await client.auth.getUser();
    if (!user) return null;

    const { data, error } = await client
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.warn('[Cloud Fetch Warn]', error.message);
      return null;
    }

    return data as CloudUserData | null;
  } catch (err) {
    console.error('[Cloud Fetch Error]', err);
    return null;
  }
}

/**
 * 保存/上传全量进度到 Supabase
 */
export async function saveUserDataToCloud(
  profilesData: ChildProfile[],
  activeProfileId: string,
  settingsData: Record<string, any> = {}
): Promise<{ success: boolean; error?: string; timestamp?: number }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: '未连接 Supabase' };
  }

  try {
    const { data: { user } } = await client.auth.getUser();
    if (!user) {
      return { success: false, error: '尚未登录云端账号' };
    }

    const payload = {
      id: user.id,
      email: user.email,
      active_profile_id: activeProfileId,
      profiles_data: profilesData,
      settings_data: settingsData,
      updated_at: new Date().toISOString()
    };

    const { error } = await client
      .from('user_profiles')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('[Cloud Save Error]', error);
      return { success: false, error: error.message };
    }

    return { success: true, timestamp: Date.now() };
  } catch (err: any) {
    console.error('[Cloud Save Catch]', err);
    return { success: false, error: err?.message || '保存云端失败' };
  }
}

