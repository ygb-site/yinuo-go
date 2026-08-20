import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'yinuo_supabase_url';
const STORAGE_KEY_KEY = 'yinuo_supabase_anon_key';

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
    // 如果带有多余路径或结尾斜杠，自动提取标准 origin (如 https://xxx.supabase.co)
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
 * 获取当前生效的 Supabase 配置 (优先 localStorage，其次环境变量，自动修正异常路径)
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

  const rawUrl = customUrl || envUrl || '';
  const url = sanitizeSupabaseUrl(rawUrl);
  const anonKey = (customKey || envKey || '').trim();

  // 如果 localStorage 中之前存储了带 /rest/v1/ 的脏路径，自动静默修正为干净的 origin
  if (typeof window !== 'undefined' && window.localStorage && customUrl && customUrl !== url) {
    window.localStorage.setItem(STORAGE_KEY_URL, url);
  }

  return {
    url,
    anonKey,
    isCustom: !!(customUrl && customKey)
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

