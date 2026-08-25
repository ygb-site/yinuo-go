/**
 * 奖励幂等键工具
 *
 * 幂等键必须满足：同一次真实学习行为在任何设备、任何时刻算出来都一样，
 * 因此只能由稳定的业务标识拼成，禁止掺入 Date.now()、随机数这类会变的量。
 */

/** djb2 变体短哈希：把题干等长文本压成稳定短串，作为幂等键的一部分 */
export function stableHash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
}

/**
 * 拼装奖励幂等键：`reward:<domain>:<parts...>`
 */
export function buildRewardKey(domain: string, ...parts: (string | number)[]): string {
  const tail = parts
    .map(p => String(p).trim())
    .filter(Boolean)
    .join(':');
  return 'reward:' + domain + (tail ? ':' + tail : '');
}
