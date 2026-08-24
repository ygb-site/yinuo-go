export interface UnlockFeature {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  badge: string;
  badgeColor: string;
  gradient: string;
  route: string;
  category: 'learn' | 'practice' | 'battle' | 'profile';
  lessonsRequired: number;
  chapterRequired: number;
  unlockTitle: string;
  unlockTip: string;
  desc: string;
}

export const UNLOCK_FEATURES: UnlockFeature[] = [
  // 1. 启蒙闯关 (Learn · 3项)
  {
    id: 'adventure',
    name: '趣味主线闯关',
    nameEn: 'Adventure Map (22 Lessons)',
    icon: '🧭',
    badge: '启蒙主线 · 循序渐进',
    badgeColor: 'bg-emerald-500',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
    route: '/adventure',
    category: 'learn',
    lessonsRequired: 0,
    chapterRequired: 0,
    unlockTitle: '启蒙主线',
    unlockTip: '始终开放',
    desc: '从数气到手筋，6大篇章阶梯式趣味小故事与互动练习，带你一步步成为围棋小高手！'
  },
  {
    id: 'dictionary',
    name: '围棋小词典',
    nameEn: 'Go Dictionary & Terms',
    icon: '📚',
    badge: '随身宝典 · 始终开放',
    badgeColor: 'bg-teal-600',
    gradient: 'from-teal-400 via-cyan-500 to-blue-500',
    route: '/dictionary',
    category: 'learn',
    lessonsRequired: 0,
    chapterRequired: 0,
    unlockTitle: '随身宝典',
    unlockTip: '始终开放，随时查阅',
    desc: '中英双语围棋术语大全，生动图文与棋盘演练解析每一个围棋专业概念！'
  },
  {
    id: 'rhymes',
    name: '棋理口诀卡',
    nameEn: 'Go Rhyme Cards',
    icon: '🎵',
    badge: '随身宝典 · 始终开放',
    badgeColor: 'bg-amber-600',
    gradient: 'from-yellow-400 via-amber-500 to-orange-500',
    route: '/rhymes',
    category: 'learn',
    lessonsRequired: 0,
    chapterRequired: 0,
    unlockTitle: '随身宝典',
    unlockTip: '始终开放，随时学唱',
    desc: '金角银边草肚皮、棋逢断处生、有打有吃莫慌张，点击卡片即时动态演示！'
  },

  // 2. 技能训练 (Practice · 5项)
  {
    id: 'arcade',
    name: '反应乐园',
    nameEn: 'Speed Arcade 60s',
    icon: '🔥',
    badge: '极速连击',
    badgeColor: 'bg-rose-500',
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    route: '/arcade',
    category: 'practice',
    lessonsRequired: 8,
    chapterRequired: 2,
    unlockTitle: '通关第2章【捕鱼手筋】',
    unlockTip: '需通关第2章（掌握双打与征吃）',
    desc: '60秒闪电提子、数气大作战、连断速判！在极速连击中秒变肌肉记忆！'
  },
  {
    id: 'tsumego',
    name: '每日死活题',
    nameEn: 'Daily Tsumego Camp',
    icon: '🧩',
    badge: '46道必修死活',
    badgeColor: 'bg-indigo-500',
    gradient: 'from-indigo-400 via-purple-500 to-pink-500',
    route: '/tsumego',
    category: 'practice',
    lessonsRequired: 12,
    chapterRequired: 3,
    unlockTitle: '通关第3章【死活城堡】',
    unlockTip: '需通关第3章（掌握真眼假眼与做活）',
    desc: '精选吃子、做眼、杀棋、对杀、劫争46道经典实战题，AI智能分步拆解！'
  },
  {
    id: 'mistakes',
    name: '语数外错题本',
    nameEn: 'Mistake Notebook',
    icon: '📕',
    badge: '随机抽题',
    badgeColor: 'bg-rose-500',
    gradient: 'from-rose-500 via-pink-500 to-purple-600',
    route: '/mistakes',
    category: 'practice',
    lessonsRequired: 0,
    chapterRequired: 0,
    unlockTitle: '随时开启',
    unlockTip: '做题错题自动归纳，支持随机出题攻克',
    desc: '自动收录做错的死活与手筋，针对性专项复习，重新解对可领双倍金币！'
  },
  {
    id: 'worksheet',
    name: '打印题卡',
    nameEn: 'Printable Worksheets',
    icon: '🖨️',
    badge: '线下纸质练',
    badgeColor: 'bg-teal-600',
    gradient: 'from-teal-400 via-emerald-500 to-green-500',
    route: '/worksheet',
    category: 'practice',
    lessonsRequired: 17,
    chapterRequired: 4,
    unlockTitle: '通关第4章【死活城堡】',
    unlockTip: '需通关第4章',
    desc: '一键生成并打印A4高清围棋习题纸，保护视力，随时随地线下做题！'
  },
  {
    id: 'free-board',
    name: '自由打谱台',
    nameEn: 'Sandbox & SGF',
    icon: '📐',
    badge: '高阶工具',
    badgeColor: 'bg-slate-600',
    gradient: 'from-slate-500 via-gray-600 to-zinc-700',
    route: '/free-board',
    category: 'practice',
    lessonsRequired: 22,
    chapterRequired: 5,
    unlockTitle: '完成全部启蒙闯关',
    unlockTip: '需通关全部启蒙关卡',
    desc: '自由摆设死活局、SGF棋谱导入导出与多分支复盘！'
  },

  // 3. 对弈竞技 (Battle · 5项)
  {
    id: 'checkers',
    name: '快乐六角跳棋',
    nameEn: 'Chinese Checkers Fun',
    icon: '⭐',
    badge: '亲子畅玩 · 始终开放',
    badgeColor: 'bg-amber-500',
    gradient: 'from-amber-400 via-pink-500 to-indigo-600',
    route: '/checkers',
    category: 'battle',
    lessonsRequired: 0,
    chapterRequired: 0,
    unlockTitle: '始终开放',
    unlockTip: '始终开放，随时畅玩',
    desc: '经典六角星中国跳棋！人机对战、亲子同屏、连跳解密闯关与6人派对，一键连跳起飞超好玩！'
  },
  {
    id: 'capture-go',
    name: '吃子对弈场',
    nameEn: 'Capture Go (First Capture)',
    icon: '⚡',
    badge: '极速对战',
    badgeColor: 'bg-orange-500',
    gradient: 'from-orange-400 via-amber-500 to-yellow-500',
    route: '/capture-go',
    category: 'battle',
    lessonsRequired: 4,
    chapterRequired: 1,
    unlockTitle: '通关第1章【吃子魔法】',
    unlockTip: '需通关第1章前4关（掌握基本提子）',
    desc: '先吃1子或3子获胜！极简规则、极速开局，零基础孩子最爱的对战模式！'
  },
  {
    id: 'two-player',
    name: '亲子面对面',
    nameEn: 'Pass & Play Local',
    icon: '👥',
    badge: '双人同屏',
    badgeColor: 'bg-purple-500',
    gradient: 'from-purple-400 via-indigo-500 to-blue-500',
    route: '/two-player',
    category: 'battle',
    lessonsRequired: 8,
    chapterRequired: 2,
    unlockTitle: '通关第2章【捕鱼手筋】',
    unlockTip: '需通关第2章（掌握双打与抱吃）',
    desc: '平板或电脑平放两人对局，带计时钟、气数辅助、叫吃预警与一键悔棋！'
  },
  {
    id: 'ai-match',
    name: '萌宠AI对弈场',
    nameEn: 'Mascot AI Arena',
    icon: '🤖',
    badge: '5只萌宠大师',
    badgeColor: 'bg-blue-500',
    gradient: 'from-blue-400 via-sky-500 to-indigo-500',
    route: '/ai-match',
    category: 'battle',
    lessonsRequired: 17,
    chapterRequired: 4,
    unlockTitle: '通关第4章【死活城堡】',
    unlockTip: '需通关第4章（掌握死活眼位与做活）',
    desc: '小狗贝贝、小猫喵喵、狐狸阿福、小诺师傅等你来挑战，支持实时辅助！'
  },
  {
    id: 'rank-exam',
    name: '定段升级考',
    nameEn: 'Rank Exam & Certificate',
    icon: '📜',
    badge: '考取证书',
    badgeColor: 'bg-rose-600',
    gradient: 'from-rose-500 via-pink-500 to-red-500',
    route: '/rank-exam',
    category: 'battle',
    lessonsRequired: 22,
    chapterRequired: 5,
    unlockTitle: '完成全部启蒙闯关',
    unlockTip: '需通关全部启蒙关卡',
    desc: '模拟正规少儿定级考，十道综合实战大测验，考取你的第一张围棋荣誉证书！'
  },

  // 4. 成长中心 (Profile · 1项)
  {
    id: 'shop',
    name: '装扮商城',
    nameEn: 'Theme Shop & Avatars',
    icon: '🛍️',
    badge: '主题工坊',
    badgeColor: 'bg-pink-500',
    gradient: 'from-pink-400 via-rose-500 to-purple-500',
    route: '/shop',
    category: 'profile',
    lessonsRequired: 4,
    chapterRequired: 1,
    unlockTitle: '通关第1章【吃子魔法】',
    unlockTip: '需通关第1章（赚取第一桶金）',
    desc: '用闯关赢取的金币兑换原木、糖果、星空、翡翠等专属棋盘与可爱头像！'
  }
];
