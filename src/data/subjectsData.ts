import type { SubjectMeta, SubjectId } from '../types/curriculum';

export const SUBJECTS_CONFIG: Record<SubjectId, SubjectMeta> = {
  go: {
    id: 'go',
    name: '围棋博弈',
    subName: '一诺奕学',
    title: '一诺奕学 · 围棋博弈馆',
    slogan: '方寸黑白定乾坤，启迪全局大智慧',
    icon: '♟️',
    badge: '弈林探索',
    themeColor: 'emerald',
    bgGradient: 'from-emerald-500 via-teal-600 to-cyan-700',
    accentColor: '#10B981',
    borderColor: 'border-emerald-300',
    mascotGreeting: '欢迎来到围棋博弈馆！我是诺诺，让我们在黑白方寸之间开启智力冒险吧！',
    ageRange: '4-12 岁',
    features: [
      {
        title: '启蒙主线闯关',
        desc: '吃子魔法、死活奥秘、布局实战循序渐进',
        icon: '🧭',
        route: '/learn',
        isReady: true
      },
      {
        title: '死活专项训练',
        desc: '海量死活经典题库，提升敏锐棋感',
        icon: '🎯',
        route: '/tsumego',
        isReady: true
      },
      {
        title: '吃子吃鸡闯关',
        desc: '快节奏抢吃对弈，锻炼即时敏捷度',
        icon: '⚡',
        route: '/capture-go',
        isReady: true
      },
      {
        title: 'AI 人机对弈',
        desc: '9路/13路/19路 AI 智能伴学对弈复盘',
        icon: '🤖',
        route: '/ai-match',
        isReady: true
      },
      {
        title: '街机速度冲关',
        desc: '极速数气、断与连挑战限时高分榜',
        icon: '🕹️',
        route: '/arcade',
        isReady: true
      },
      {
        title: '段级位评测考级',
        desc: '官方模拟考级冲段试卷实战检验',
        icon: '🏆',
        route: '/rank-exam',
        isReady: true
      },
      {
        title: '双人同屏对弈',
        desc: '亲子对决、好友对弈同屏即刻开局',
        icon: '⚔️',
        route: '/two-player',
        isReady: true
      },
      {
        title: '棋诀与术语词典',
        desc: '朗朗上口的围棋口诀与百科学堂',
        icon: '📖',
        route: '/dictionary',
        isReady: true
      }
    ]
  },
  math: {
    id: 'math',
    name: '数理思维',
    subName: '一诺启思',
    title: '一诺启思 · 数理思维馆',
    slogan: '玩转数字几何逻辑，唤醒数学超级大脑',
    icon: '🔢',
    badge: '数理先锋',
    themeColor: 'blue',
    bgGradient: 'from-blue-500 via-indigo-600 to-violet-700',
    accentColor: '#3B82F6',
    borderColor: 'border-blue-300',
    mascotGreeting: '欢迎来到数理思维馆！数字、图形和天平藏着超多有趣的秘密，跟我一起解锁吧！',
    ageRange: '小学一二年级',
    features: [
      {
        title: '数学智能错题本',
        desc: '做题错题自动收录，支持随时随机抽题攻克，答对自动移出',
        icon: '📕',
        route: '/mistakes?subject=math',
        isReady: true
      },
      {
        title: '口算天天练 (100以内加减法)',
        desc: '自定义10~50题动态防重出题、智能批改、错题重练与A4打印',
        icon: '🧮',
        route: '/subject/math/drill',
        isReady: true
      },
      {
        title: '一二年级主线闯关',
        desc: '数感认知、进退位加减、钟表时间、图形与天平思维',
        icon: '🧭',
        route: '/subject/math/learn',
        isReady: true
      },
      {
        title: '速算冲天竞技场',
        desc: '30秒限时极速口算冲刺与连击加分',
        icon: '🚀',
        route: '/subject/math/speed',
        isReady: true
      },
      {
        title: '24点四则运算风暴',
        desc: '加减乘除趣味扑克智力挑战',
        icon: '🧩',
        route: '/subject/math/twenty-four',
        isReady: true
      }
    ]
  },
  chinese: {
    id: 'chinese',
    name: '国学语文',
    subName: '一诺博雅',
    title: '一诺博雅 · 国学语文馆',
    slogan: '品读千古经典诗篇，掌握汉字博大精深',
    icon: '🏮',
    badge: '博雅少年',
    themeColor: 'amber',
    bgGradient: 'from-amber-500 via-orange-600 to-red-600',
    accentColor: '#F59E0B',
    borderColor: 'border-amber-300',
    mascotGreeting: '欢迎来到国学语文馆！拼音、汉字、成语和诗词就像一幅美丽的画卷，等你来探索！',
    ageRange: '小学一二年级',
    features: [
      {
        title: '语文智能错题本',
        desc: '生字、拼音、成语错题自动归纳，随机抽题巩固薄弱点',
        icon: '📕',
        route: '/mistakes?subject=chinese',
        isReady: true
      },
      {
        title: '汉语拼音魔法王国',
        desc: '单韵母、23声母、复韵母、整体认读、四声调小汽车与声韵拼读器',
        icon: '👑',
        route: '/subject/chinese/pinyin',
        isReady: true
      },
      {
        title: '生字笔顺演练 (部编版)',
        desc: '一二年级必学生字动画演示、笔画拆解、组词造句与自由查字描红',
        icon: '✍️',
        route: '/subject/chinese/hanzi',
        isReady: true
      },
      {
        title: '经典古诗词点读背诵',
        desc: '唐诗三百首 + 小学必备75首、智能注音点读与背诵打卡',
        icon: '📜',
        route: '/subject/chinese/poetry',
        isReady: true
      },
      {
        title: '趣味成语大挑战',
        desc: '看图填字、成语释义与接龙探险',
        icon: '🐉',
        route: '/subject/chinese/idiom',
        isReady: true
      }
    ]
  },
  english: {
    id: 'english',
    name: '趣味英语',
    subName: '一诺灵犀',
    title: '一诺灵犀 · 趣味英语馆',
    slogan: '自然拼读母语启蒙，地道发音自信开口',
    icon: '🔤',
    badge: '灵犀探索',
    themeColor: 'purple',
    bgGradient: 'from-purple-500 via-fuchsia-600 to-pink-600',
    accentColor: '#8B5CF6',
    borderColor: 'border-purple-300',
    mascotGreeting: 'Welcome to English World! 跟着诺诺一起学自然拼读、玩单词游戏吧！',
    ageRange: '小学一二年级',
    features: [
      {
        title: '英语智能错题本',
        desc: '单词发音与词汇拼写错题归集，随时随机出题练',
        icon: '📕',
        route: '/mistakes?subject=english',
        isReady: true
      },
      {
        title: '自然拼读 26 字母发音板',
        desc: '26个字母Letter Sound发音规则与经典音频点读',
        icon: '🔊',
        route: '/subject/english/phonics',
        isReady: true
      },
      {
        title: '一二年级核心高频词闪卡',
        desc: '动物、颜色、水果、动作 3D 翻牌识记与拼读',
        icon: '🃏',
        route: '/subject/english/flashcards',
        isReady: true
      },
      {
        title: '英语启蒙主线闯关',
        desc: '字母拼读、主题词汇与日常对话句型拼装',
        icon: '🧭',
        route: '/subject/english/learn',
        isReady: true
      }
    ]
  }
};

export const ALL_SUBJECTS: SubjectMeta[] = [
  SUBJECTS_CONFIG.go,
  SUBJECTS_CONFIG.math,
  SUBJECTS_CONFIG.chinese,
  SUBJECTS_CONFIG.english
];

