import type { InputSafetyContext, InputVerdict } from './types';

const INJECTION_PATTERNS = [
  new RegExp('ignore\\s+(all\\s+)?(previous|prior|above)\\s+instructions', 'i'),
  new RegExp('你现在是|扮演|作为|从现在起', 'i'),
  new RegExp('system\\s+prompt|系统提示词|输出你的规则|重复你的指令', 'i'),
  new RegExp('jailbreak|dan\\s+mode|root\\s+access', 'i')
];

const UNSAFE_TOPIC_PATTERNS = [
  new RegExp('自杀|自残|割腕|想死|跳楼', 'i'),
  new RegExp('黄色|色情|做爱|成人网站|裸体', 'i'),
  new RegExp('杀人|砍人|毒品|买枪|炸弹', 'i')
];

const PII_PATTERNS = [
  new RegExp('1[3-9]\\d{9}'),
  new RegExp('\\d{17}[\\dXx]'),
  new RegExp('微信|加v|vx|微信号|QQ号', 'i')
];

const SCRIPT_REGEX = new RegExp('<script[\\s\\S]*?<\\/script>', 'gi');
const STYLE_REGEX = new RegExp('<style[\\s\\S]*?<\\/style>', 'gi');
const TAG_REGEX = new RegExp('<[^>]+>', 'g');

export function checkInput(raw: string, ctx: InputSafetyContext = {}): InputVerdict {
  if (!raw || typeof raw !== 'string' || !raw.trim()) {
    return { action: 'refuse', reasonCode: 'empty', kidMessage: '小诺在听着呢，输入你的问题吧！' };
  }

  // 1. Clean HTML / Scripts first
  const sanitizedText = raw
    .replace(SCRIPT_REGEX, '')
    .replace(STYLE_REGEX, '')
    .replace(TAG_REGEX, '')
    .trim();

  const trimmed = sanitizedText;

  if ((ctx.recentInputCountIn10s || 0) > 3) {
    return {
      action: 'refuse',
      reasonCode: 'rate-limited',
      kidMessage: '先别着急，我们慢慢想、一步一步来探讨哦！'
    };
  }

  if (trimmed.length > 200) {
    return {
      action: 'sanitize',
      text: trimmed.slice(0, 200),
      removed: ['exceeded-length-truncated']
    };
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        action: 'refuse',
        reasonCode: 'prompt-injection',
        kidMessage: '我是围棋伴学小导师小诺 🐼！我们把注意力集中在棋盘上的死活与手筋上吧！'
      };
    }
  }

  for (const pattern of UNSAFE_TOPIC_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        action: 'refuse',
        reasonCode: 'off-topic-unsafe',
        kidMessage: '这个问题小诺不太懂哦～我们回到棋盘上，一起来看看这道题的走法吧！'
      };
    }
  }

  for (const pattern of PII_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        action: 'refuse',
        reasonCode: 'personal-info',
        kidMessage: '这些个人隐私信息不用告诉小诺哦！保护个人隐私安全最重要！'
      };
    }
  }

  return { action: 'allow', text: sanitizedText };
}

