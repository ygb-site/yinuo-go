/**
 * 衡水影子轻练：一年级每天一道，口算 / 识字 / 语感量级。
 * 不是预习包，不做第二套作业轰炸。
 */

export type ShadowDrillKind = 'math' | 'chinese' | 'sense';

export interface ShadowDrill {
  id: string;
  kind: ShadowDrillKind;
  title: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  tip: string;
}

export const HENGSHUI_SHADOW_DRILLS: ShadowDrill[] = [
  {
    id: 'hs-m-01',
    kind: 'math',
    title: '口算影子',
    prompt: '7 + 5 = ?',
    choices: ['11', '12', '13', '14'],
    answerIndex: 1,
    tip: '可以先数手指：7 再往上数 5。'
  },
  {
    id: 'hs-m-02',
    kind: 'math',
    title: '口算影子',
    prompt: '9 − 4 = ?',
    choices: ['3', '4', '5', '6'],
    answerIndex: 2,
    tip: '从 9 往回数 4 下。'
  },
  {
    id: 'hs-m-03',
    kind: 'math',
    title: '口算影子',
    prompt: '6 + 6 = ?',
    choices: ['10', '11', '12', '13'],
    answerIndex: 2,
    tip: '两个一样的数，是双数。'
  },
  {
    id: 'hs-m-04',
    kind: 'math',
    title: '口算影子',
    prompt: '8 − 3 = ?',
    choices: ['4', '5', '6', '7'],
    answerIndex: 1,
    tip: '去掉 3 个还剩几个。'
  },
  {
    id: 'hs-m-05',
    kind: 'math',
    title: '口算影子',
    prompt: '10 − 7 = ?',
    choices: ['2', '3', '4', '5'],
    answerIndex: 1,
    tip: '10 朋友里，7 的好朋友是几？'
  },
  {
    id: 'hs-c-01',
    kind: 'chinese',
    title: '识字影子',
    prompt: '「日」字念什么？',
    choices: ['yuè', 'rì', 'shuǐ', 'huǒ'],
    answerIndex: 1,
    tip: '太阳出来的那个字。'
  },
  {
    id: 'hs-c-02',
    kind: 'chinese',
    title: '识字影子',
    prompt: '「山」字有几笔？',
    choices: ['2 笔', '3 笔', '4 笔', '5 笔'],
    answerIndex: 1,
    tip: '竖、竖折、竖，一共三笔。'
  },
  {
    id: 'hs-c-03',
    kind: 'chinese',
    title: '识字影子',
    prompt: '「大」字下面加一横变成？',
    choices: ['天', '太', '犬', '夫'],
    answerIndex: 0,
    tip: '天，人在天下。'
  },
  {
    id: 'hs-c-04',
    kind: 'chinese',
    title: '识字影子',
    prompt: '哪个字表示嘴巴？',
    choices: ['目', '耳', '口', '手'],
    answerIndex: 2,
    tip: '张嘴的那个「口」。'
  },
  {
    id: 'hs-s-01',
    kind: 'sense',
    title: '语感影子',
    prompt: '「小猫爱喝牛奶」里，谁爱喝牛奶？',
    choices: ['小狗', '小猫', '小鱼', '小鸟'],
    answerIndex: 1,
    tip: '先找句子里的谁在做事。'
  },
  {
    id: 'hs-s-02',
    kind: 'sense',
    title: '语感影子',
    prompt: '下面哪一句说得通？',
    choices: ['苹果在天上飞', '小鸟在天上飞', '石头在天上飞', '桌子在天上飞'],
    answerIndex: 1,
    tip: '想一想谁真的会飞。'
  },
  {
    id: 'hs-m-06',
    kind: 'math',
    title: '口算影子',
    prompt: '3 + 8 = ?',
    choices: ['10', '11', '12', '13'],
    answerIndex: 1,
    tip: '先算 3 + 7 = 10，再加 1。'
  },
  {
    id: 'hs-c-05',
    kind: 'chinese',
    title: '识字影子',
    prompt: '「水」字的拼音是？',
    choices: ['huǒ', 'mù', 'shuǐ', 'tǔ'],
    answerIndex: 2,
    tip: '喝水的水。'
  },
  {
    id: 'hs-s-03',
    kind: 'sense',
    title: '语感影子',
    prompt: '「一」和「二」哪个更大？',
    choices: ['一', '二', '一样大', '说不清'],
    answerIndex: 1,
    tip: '二比一多一个。'
  }
];

/** 按本地日期稳定轮换，同一天全家看到同一道 */
export function pickShadowDrillForDate(dateKey: string): ShadowDrill {
  const list = HENGSHUI_SHADOW_DRILLS;
  let hash = 0;
  for (let i = 0; i < dateKey.length; i += 1) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return list[hash % list.length];
}

export function shadowKindLabel(kind: ShadowDrillKind): string {
  if (kind === 'math') return '口算';
  if (kind === 'chinese') return '识字';
  return '语感';
}
