import type { UniversalChapter } from '../../types/curriculum';

export const CHINESE_CHAPTERS: UniversalChapter[] = [
  // =========================================================
  // 🎒 一年级上册 (部编版语文同步)
  // =========================================================
  {
    id: 101,
    subjectId: 'chinese',
    gradeLevel: 'g1_t1',
    unitNumber: 1,
    title: '第一单元：识字篇《天地人》与《日月水火》',
    subtitle: '认识天地人、金木水火土与象形字造字之美',
    icon: '☀️',
    badge: '一年级上册',
    themeGradient: 'from-amber-500 to-orange-600',
    description: '从中国最古老的象形文字和部编版第一课《天地人》出发，领略汉字的博大精深。',
    lessons: [
      {
        id: 'chi_g1t1_l1',
        subjectId: 'chinese',
        gradeLevel: 'g1_t1',
        chapterId: 101,
        chapterTitle: '识字篇《天地人》与《日月水火》',
        chapterIcon: '☀️',
        title: '识字第一课《天地人·金木水火土》',
        subtitle: '天在上，地在下，人立于天地之间',
        icon: '🌍',
        badge: '部编第一课',
        summary: '认识“天、地、人、你、我、他”六个基础生字。',
        knowledgePointId: 'chinese.g1.strokes.basic',
        rewards: { stars: 3, coins: 50, exp: 100 },
        steps: [
          {
            id: 'cg1t1_1_s1',
            type: 'hanzi_canvas',
            knowledgePointId: 'chinese.g1.strokes.basic',
            difficulty: 1,
            title: '认识汉字【天】',
            subtitle: '大上面加一横',
            promptText: '古人说“天在上，地在下”，大上面加一横就是“天”。',
            promptVoice: '天，就是蓝天、天空的天。',
            char: '天',
            pinyin: 'tiān',
            meaning: '天空、一天、日子',
            radical: '大',
            strokeCount: 4,
            words: ['蓝天', '晴天', '今天', '冬天'],
            strokes: ['横', '横', '撇', '捺'],
            hint: '先写两横，再写撇捺。',
            explanation: '天字本义指头顶之上的广阔苍穹。'
          },
          {
            id: 'cg1t1_1_s2',
            type: 'drag_match',
            knowledgePointId: 'chinese.g1.strokes.basic',
            difficulty: 1,
            title: '生字与拼音连线',
            subtitle: '帮生字找到正确的拼音伙伴',
            promptText: '把生字和它正确的拼音连线配对吧：',
            promptVoice: '把生字和它的拼音连起来。',
            hint: '天是 tiān，地是 dì，人是 rén！',
            explanation: '天 (tiān), 地 (dì), 人 (rén)。',
            pairs: [
              { id: 'p1', left: { text: '【天】' }, right: { text: 'tiān' } },
              { id: 'p2', left: { text: '【地】' }, right: { text: 'dì' } },
              { id: 'p3', left: { text: '【人】' }, right: { text: 'rén' } }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 102,
    subjectId: 'chinese',
    gradeLevel: 'g1_t1',
    unitNumber: 2,
    title: '第二单元：汉语拼音王国（声母与韵母）',
    subtitle: '单韵母 a o e i u ü 与声母 b p m f 快乐拼读',
    icon: '🗣️',
    badge: '一年级上册',
    themeGradient: 'from-orange-500 to-red-600',
    description: '通过儿歌口诀、四声调小汽车与口型模拟，轻松掌握拼音发音规则。',
    lessons: [
      {
        id: 'chi_g1t1_l2',
        subjectId: 'chinese',
        gradeLevel: 'g1_t1',
        chapterId: 102,
        chapterTitle: '汉语拼音王国（声母与韵母）',
        chapterIcon: '🗣️',
        title: '单韵母 a o e 与四声调',
        subtitle: '嘴巴张大 a a a，公鸡打鸣 o o o',
        icon: '🎶',
        badge: '拼音发音',
        summary: '掌握单韵母标准发音与四声调。',
        knowledgePointId: 'chinese.g1.pinyin.finals',
        rewards: { stars: 3, coins: 50, exp: 100 },
        steps: [
          {
            id: 'cg1t1_2_s1',
            type: 'single_choice',
            knowledgePointId: 'chinese.g1.pinyin.finals',
            difficulty: 1,
            title: '选出发音口型',
            subtitle: '听口诀选字母',
            promptText: '“圆圆脸蛋扎小辫，张大嘴巴 —— ？” 请选出对应的单韵母：',
            promptVoice: '圆圆脸蛋扎小辫，张大嘴巴是什么？',
            hint: '张大嘴巴 a a a！',
            explanation: '单韵母 a 发音时嘴巴张大。',
            options: [
              { id: 'opt_a', text: 'a', subText: '张大嘴巴' },
              { id: 'opt_o', text: 'o', subText: '圆圆嘴巴' },
              { id: 'opt_e', text: 'e', subText: '扁扁嘴巴' }
            ],
            correctOptionIds: ['opt_a']
          }
        ]
      }
    ]
  },

  // =========================================================
  // 🎒 一年级下册 (部编版语文同步)
  // =========================================================
  {
    id: 103,
    subjectId: 'chinese',
    gradeLevel: 'g1_t2',
    unitNumber: 1,
    title: '第一单元：四季之美与识字歌',
    subtitle: '《春夏秋冬》《姓氏歌》《小青蛙》',
    icon: '🌸',
    badge: '一年级下册',
    themeGradient: 'from-pink-500 to-rose-600',
    description: '春风夏雨秋霜冬雪，探索四季自然变化与姓氏文化。',
    lessons: [
      {
        id: 'chi_g1t2_l1',
        subjectId: 'chinese',
        gradeLevel: 'g1_t2',
        chapterId: 103,
        chapterTitle: '四季之美与识字歌',
        chapterIcon: '🌸',
        title: '识字第一课《春夏秋冬》',
        subtitle: '春风吹，夏雨落，秋霜降，冬雪飘',
        icon: '❄️',
        badge: '四季歌',
        summary: '认识春、夏、秋、冬及自然气候生字。',
        knowledgePointId: 'chinese.g1.radicals.common',
        rewards: { stars: 3, coins: 60, exp: 120 },
        steps: [
          {
            id: 'cg1t2_1_s1',
            type: 'ordering',
            knowledgePointId: 'chinese.g1.radicals.common',
            difficulty: 2,
            title: '一年四季排排队',
            subtitle: '按时间顺序排列四个季节',
            promptText: '请按一年的先后顺序排列春夏秋冬四个季节：',
            promptVoice: '请按一年的顺序排列春夏秋冬。',
            hint: '春天 -> 夏天 -> 秋天 -> 冬天。',
            explanation: '春、夏、秋、冬是一年的四个季节顺序。',
            items: [
              { id: 's_autumn', text: '🍁 秋天' },
              { id: 's_spring', text: '🌸 春天' },
              { id: 's_winter', text: '❄️ 冬天' },
              { id: 's_summer', text: '🍉 夏天' }
            ],
            correctOrder: ['s_spring', 's_summer', 's_autumn', 's_winter']
          }
        ]
      }
    ]
  },

  // =========================================================
  // 🎒 二年级上册 (部编版语文同步)
  // =========================================================
  {
    id: 201,
    subjectId: 'chinese',
    gradeLevel: 'g2_t1',
    unitNumber: 1,
    title: '第一单元：大自然的秘密与经典古诗',
    subtitle: '《小蝌蚪找妈妈》《植物妈妈有办法》《登鹳雀楼》',
    icon: '🐸',
    badge: '二年级上册',
    themeGradient: 'from-emerald-600 to-teal-700',
    description: '探索小蝌蚪变青蛙的神奇成长过程，背诵王之涣名篇《登鹳雀楼》。',
    lessons: [
      {
        id: 'chi_g2t1_l1',
        subjectId: 'chinese',
        gradeLevel: 'g2_t1',
        chapterId: 201,
        chapterTitle: '大自然的秘密与经典古诗',
        chapterIcon: '🐸',
        title: '必背古诗《登鹳雀楼》',
        subtitle: '欲穷千里目，更上一层楼',
        icon: '🏯',
        badge: '登鹳雀楼',
        summary: '熟读背诵唐代诗人王之涣的千古名篇。',
        knowledgePointId: 'chinese.g1.poetry.recite',
        rewards: { stars: 3, coins: 60, exp: 120 },
        steps: [
          {
            id: 'cg2t1_1_s1',
            type: 'ordering',
            knowledgePointId: 'chinese.g1.poetry.recite',
            difficulty: 2,
            title: '《登鹳雀楼》诗句排序',
            subtitle: '按古诗顺序还原四句诗',
            promptText: '请按正确顺序排列唐代诗人王之涣的《登鹳雀楼》：',
            promptVoice: '请排列登鹳雀楼的诗句。',
            hint: '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。',
            explanation: '《登鹳雀楼》表达了积极向上、站得高看得远的博大胸怀。',
            items: [
              { id: 'l2', text: '黄河入海流' },
              { id: 'l1', text: '白日依山尽' },
              { id: 'l4', text: '更上一层楼' },
              { id: 'l3', text: '欲穷千里目' }
            ],
            correctOrder: ['l1', 'l2', 'l3', 'l4']
          }
        ]
      }
    ]
  },

  // =========================================================
  // 🎒 二年级下册 (部编版语文同步)
  // =========================================================
  {
    id: 202,
    subjectId: 'chinese',
    gradeLevel: 'g2_t2',
    unitNumber: 1,
    title: '第一单元：春天的赞歌与传统文化',
    subtitle: '《村居》《咏柳》《找春天》《神州谣》',
    icon: '🌱',
    badge: '二年级下册',
    themeGradient: 'from-teal-600 to-cyan-700',
    description: '草长莺飞二月天，拂堤杨柳醉春烟。儿童散学归来早，忙趁东风放纸鸢。',
    lessons: [
      {
        id: 'chi_g2t2_l1',
        subjectId: 'chinese',
        gradeLevel: 'g2_t2',
        chapterId: 202,
        chapterTitle: '春天的赞歌与传统文化',
        chapterIcon: '🌱',
        title: '古诗诵读《村居》',
        subtitle: '儿童散学归来早，忙趁东风放纸鸢',
        icon: '🪁',
        badge: '村居',
        summary: '感受春天乡村放风筝的欢快童趣。',
        knowledgePointId: 'chinese.g1.poetry.recite',
        rewards: { stars: 3, coins: 60, exp: 120 },
        steps: [
          {
            id: 'cg2t2_1_s1',
            type: 'single_choice',
            knowledgePointId: 'chinese.g1.poetry.recite',
            difficulty: 2,
            title: '“纸鸢”指的是什么？',
            subtitle: '理解古代词义',
            promptText: '诗句“忙趁东风放纸鸢”中的“纸鸢”在现代指的是什么玩具？',
            promptVoice: '忙趁东风放纸鸢，纸鸢指的是什么呢？',
            hint: '用纸糊的在天上飞的玩具——风筝！',
            explanation: '纸鸢就是风筝的古称。',
            options: [
              { id: 'opt_kite', text: '🪁 风筝' },
              { id: 'opt_plane', text: '✈️ 纸飞机' },
              { id: 'opt_bird', text: '🦅 小鸟' }
            ],
            correctOptionIds: ['opt_kite']
          }
        ]
      }
    ]
  }
];

