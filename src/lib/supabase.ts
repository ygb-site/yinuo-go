import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'yinuo_supabase_url';
const STORAGE_KEY_KEY = 'yinuo_supabase_anon_key';

// 官方默认云端连接凭据 (用于全网所有访客与新设备免配置开箱即用)
const DEFAULT_SUPABASE_URL = 'https://kzphjagsliouhmjqjoue.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_gBrKUr94Pie99SUfl2dM0g_co487tT1';

let cachedClient: SupabaseClient | null = null;

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isCustom: boolean;
}

/**
 * 自动净化并提取标准的 Supabase Origin (去除多余的 /rest/v1/ 等路径)
 */
export function sanitizeSupabaseUrl(rawUrl: string): string {
  let url = (rawUrl || '').trim();
  if (!url) return '';

  try {
    const parsed = new URL(url);
    return parsed.origin;
  } catch {
    url = url.replace(/\/+$/, '');
    url = url.replace(/\/rest\/v1\/?$/i, '');
    url = url.replace(/\/auth\/v1\/?$/i, '');
    url = url.replace(/\/+$/, '');
    return url;
  }
}

/**
 * 获取当前生效的 Supabase 配置 (优先环境变量与默认预置，自动清洗格式)
 */
export function getSupabaseConfig(): SupabaseConfig {
  let customUrl = '';
  let customKey = '';

  if (typeof window !== 'undefined' && window.localStorage) {
    customUrl = window.localStorage.getItem(STORAGE_KEY_URL) || '';
    customKey = window.localStorage.getItem(STORAGE_KEY_KEY) || '';
  }

  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  const rawUrl = envUrl || customUrl || DEFAULT_SUPABASE_URL;
  const url = sanitizeSupabaseUrl(rawUrl);
  const anonKey = (envKey || customKey || DEFAULT_SUPABASE_ANON_KEY).trim();

  // 如果 localStorage 中之前存储了带 /rest/v1/ 的路径，静默修正为标准 origin
  if (typeof window !== 'undefined' && window.localStorage && customUrl && customUrl !== url) {
    window.localStorage.setItem(STORAGE_KEY_URL, url);
  }

  return {
    url,
    anonKey,
    isCustom: Boolean(customUrl && customKey)
  };
}

/**
 * 判断 Supabase 是否已配置有效凭证
 */
export function isSupabaseConfigured(): boolean {
  const config = getSupabaseConfig();
  return (
    Boolean(config.url) &&
    Boolean(config.anonKey) &&
    config.url.startsWith('https://')
  );
}

/**
 * 获取或实例化 Supabase 客户端单例
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey || !config.url.startsWith('https://')) {
    return null;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'yinuo_go_auth_session'
      }
    });
    return cachedClient;
  } catch (err) {
    console.error('[Supabase Init Error]', err);
    return null;
  }
}

/**
 * 动态更新或清除 Supabase 自定义配置
 */
export function saveCustomSupabaseConfig(url: string, anonKey: string): boolean {
  if (typeof window === 'undefined') return false;

  const cleanUrl = sanitizeSupabaseUrl(url);
  const cleanKey = anonKey.trim();

  if (cleanUrl && cleanKey) {
    window.localStorage.setItem(STORAGE_KEY_URL, cleanUrl);
    window.localStorage.setItem(STORAGE_KEY_KEY, cleanKey);
  } else {
    window.localStorage.removeItem(STORAGE_KEY_URL);
    window.localStorage.removeItem(STORAGE_KEY_KEY);
  }

  cachedClient = null;
  return isSupabaseConfigured();
}

/**
 * 导出即用的 supabase 客户端代理
 */
export const supabase = {
  get client(): SupabaseClient | null {
    return getSupabaseClient();
  },
  get auth() {
    return getSupabaseClient()?.auth;
  }
};

