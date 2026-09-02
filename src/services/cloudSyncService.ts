import { getSupabaseClient } from '../lib/supabase';
import type { ChildProfile } from '../stores/useUserStore';

export interface UserProfileRow {
  id: string;
  email: string;
  is_admin?: boolean;
  active_profile_id: string;
  profiles_data: ChildProfile[];
  settings_data: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email?: string;
  } | null;
  error?: string;
}

export interface AdminStats {
  totalParents: number;
  totalChildren: number;
  totalStars: number;
  totalGames: number;
  totalCoins: number;
  totalExp: number;
}

/**
 * 登录家长账号
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: '未配置云端数据库连接' };
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
 * 退出登录
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
 * 从 Supabase 下载指定用户或当前登录用户的档案数据
 */
export async function fetchUserProfile(targetUserId?: string): Promise<UserProfileRow | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    let uid = targetUserId;
    if (!uid) {
      const { data: { user } } = await client.auth.getUser();
      if (!user) return null;
      uid = user.id;
    }

    const { data, error } = await client
      .from('user_profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();

    if (error) {
      console.warn('[Fetch Profile Warn]', error.message);
      return null;
    }

    return data as UserProfileRow | null;
  } catch (err) {
    console.error('[Fetch Profile Error]', err);
    return null;
  }
}

/**
 * 实时保存用户所有宝贝档案与设置到 Supabase 云端
 */
export async function saveUserDataToCloud(
  profilesData: ChildProfile[],
  activeProfileId: string,
  settingsData: Record<string, any> = {}
): Promise<{ success: boolean; error?: string; timestamp?: number }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: '未连接云数据库' };
  }

  try {
    const { data: { user } } = await client.auth.getUser();
    if (!user) {
      return { success: false, error: '尚未登录' };
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
      console.error('[Cloud Realtime Save Error]', error);
      return { success: false, error: error.message };
    }

    return { success: true, timestamp: Date.now() };
  } catch (err: any) {
    console.error('[Cloud Realtime Save Catch]', err);
    return { success: false, error: err?.message || '云端保存失败' };
  }
}

/* =========================================================
 * 👑 管理后台专享 API (Admin Management APIs)
 * ========================================================= */

/**
 * 管理员获取全站所有家庭账号列表
 */
export async function fetchAdminUserList(): Promise<{ success: boolean; users: UserProfileRow[]; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, users: [], error: '未连接云数据库' };

  try {
    const { data, error } = await client
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, users: [], error: error.message };
    }

    return { success: true, users: (data || []) as UserProfileRow[] };
  } catch (err: any) {
    return { success: false, users: [], error: err?.message || '获取用户列表失败' };
  }
}

/**
 * 管理员汇总统计全站关键数据
 */
export async function fetchAdminStats(): Promise<{ success: boolean; stats: AdminStats; error?: string }> {
  const listRes = await fetchAdminUserList();
  if (!listRes.success) {
    return {
      success: false,
      stats: { totalParents: 0, totalChildren: 0, totalStars: 0, totalGames: 0, totalCoins: 0, totalExp: 0 },
      error: listRes.error
    };
  }

  let totalChildren = 0;
  let totalStars = 0;
  let totalGames = 0;
  let totalCoins = 0;
  let totalExp = 0;

  for (const u of listRes.users) {
    const children = u.profiles_data || [];
    totalChildren += children.length;
    for (const c of children) {
      totalStars += c.totalStars || 0;
      totalCoins += c.coins || 0;
      totalExp += c.exp || 0;
      totalGames += (c.stats?.gamesPlayed || 0) + (c.captureGoStats?.matches || 0);
    }
  }

  return {
    success: true,
    stats: {
      totalParents: listRes.users.length,
      totalChildren,
      totalStars,
      totalGames,
      totalCoins,
      totalExp
    }
  };
}

/**
 * 管理员修改特定用户的档案、金币/星星或设置管理员角色
 */
export async function updateUserByAdmin(
  targetUserId: string,
  payload: Partial<UserProfileRow>
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: '未连接云数据库' };

  try {
    const { error } = await client
      .from('user_profiles')
      .update({
        ...payload,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetUserId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || '修改失败' };
  }
}

/**
 * 管理员删除指定用户
 */
export async function deleteUserByAdmin(targetUserId: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: '未连接云数据库' };

  try {
    const { error } = await client
      .from('user_profiles')
      .delete()
      .eq('id', targetUserId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || '删除失败' };
  }
}

