import type { GuardContext, GuardIssue, GuardVerdict } from './types';

const PRIVACY_LEAK_PATTERNS = [
  new RegExp('sk-[a-zA-Z0-9]{20,}', 'i'),
  new RegExp('1[3-9]\\d{9}'),
  new RegExp('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', 'i'),
  new RegExp('https?:\\/\\/[^\\s]+', 'i')
];

const UNSAFE_OUTPUT_PATTERNS = [
  new RegExp('自杀|自残|色情|暴力|加微信|转账|付款', 'i')
];

const PROMPT_LEAK_PATTERNS = [
  new RegExp('我的系统提示是|我的角色设定是|system prompt', 'i')
];

export const SAFE_KID_FALLBACK =
  '🌟 小诺助教提示：先数一数双方棋子的“气”，仔细观察全局关键连断，你一定会找到最好的正解！💡';

export function guardResponse(raw: string, _ctx: GuardContext = {}): GuardVerdict {
  if (!raw || typeof raw !== 'string' || !raw.trim()) {
    return {
      action: 'reject',
      issues: ['empty'],
      fallbackText: SAFE_KID_FALLBACK
    };
  }

  let text = raw.trim();
  const issues: GuardIssue[] = [];

  for (const pattern of UNSAFE_OUTPUT_PATTERNS) {
    if (pattern.test(text)) {
      return {
        action: 'reject',
        issues: ['unsafe-content'],
        fallbackText: SAFE_KID_FALLBACK
      };
    }
  }

  for (const pattern of PROMPT_LEAK_PATTERNS) {
    if (pattern.test(text)) {
      return {
        action: 'reject',
        issues: ['prompt-leak'],
        fallbackText: SAFE_KID_FALLBACK
      };
    }
  }

  for (const pattern of PRIVACY_LEAK_PATTERNS) {
    if (pattern.test(text)) {
      text = text.replace(pattern, '[已脱敏]');
      issues.push('privacy-leak');
    }
  }

  text = text
    .replace(/<[^>]+>/g, '')
    .trim();

  if (text.length > 200) {
    text = text.slice(0, 195) + '...';
    issues.push('too-long');
  }

  if (issues.length > 0) {
    return {
      action: 'rewrite',
      text,
      removed: issues
    };
  }

  return {
    action: 'approve',
    text
  };
}

