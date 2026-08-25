/**
 * 异常脱敏工具
 *
 * 面向儿童的界面永远只展示固定兜底文案，原始异常只允许经过这里压成短摘要后
 * 进开发环境日志或安全审计，绝不能带出 API Key / Bearer Token。
 */

/** 抹掉密钥类片段：第三方接口的错误体有可能回显请求头或参数 */
export function redactSecrets(input: string): string {
  if (!input) return '';
  return input
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer ***')
    .replace(/"(api[_-]?key|authorization|token)"\s*:\s*"[^"]*"/gi, '"$1":"***"')
    .replace(/\b(sk|pk|api|key|token)[-_][A-Za-z0-9\-._]{6,}/gi, '***');
}

/** 把任意异常压成一句可安全落日志的短摘要（只进日志，不进儿童 UI） */
export function toSafeErrorDigest(err: unknown): string {
  const raw = err instanceof Error ? err.message : typeof err === 'string' ? err : '未知异常';
  return redactSecrets(raw).slice(0, 200);
}
