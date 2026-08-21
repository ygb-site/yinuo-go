import type { UniversalChapter } from '../../types/curriculum';

export const MATH_CHAPTERS: UniversalChapter[] = [
  // =========================================================
  // 🎒 一年级上册 (人教版同步)
  // =========================================================
  {
    id: 101,
    subjectId: 'math',
    gradeLevel: 'g1_t1',
    unitNumber: 1,
    title: '第一单元：准备课（数一数与比多少）',
    subtitle: '认识数量 1~10 与“同样多、多、少”的概念',
    icon: '🍎',
    badge: '一年级上册',
    themeGradient: 'from-blue-500 to-indigo-600',
    description: '通过具体生动的水果与可爱小动物，学会手口一致点数，比较物体多少。',
    lessons: [
      {
        id: 'math_g1t1_l1',
        subjectId: 'math',
        gradeLevel: 'g1_t1',
        chapterId: 101,
        chapterTitle: '准备课（数一数与比多少）',
        chapterIcon: '🍎',
        title: '看图数一数与数量对应',
        subtitle: '数清小动物与水果的数量并找到对应的数字',
        icon: '🍓',
        badge: '基础数感',
        summary: '学会手口一致数数，并将具体数量与阿拉伯数字进行配对。',
        knowledgePointId: 'math.g1.count.1_10',
        rewards: { stars: 3, coins: 50, exp: 100 },
        steps: [
          {
            id: 'mg1t1_1_s1',
            type: 'math_counter',
            knowledgePointId: 'math.g1.count.1_10',
            difficulty: 1,
            title: '数一数苹果',
            subtitle: '数一数树上有几个红苹果',
            promptText: '树上结了红彤彤的苹果，点击每一个苹果数一数，一共有几个？',
            promptVoice: '小朋友，数一数这里有几个红苹果呢？',
            dialogues: ['诺诺：哇，好甜的苹果！小朋友数数看一共有几颗？'],
            mode: 'fruit_count',
            targetCount: 5,
            itemIcon: '🍎',
            questionText: '屏幕上一共有几只红苹果？',
            hint: '用手指一个一个点着数：1、2、3、4、5！',
            explanation: '每一颗苹果对应一个数字，点到第5颗，所以总共有 5 颗苹果。'
          },
          {
            id: 'mg1t1_1_s2',
            type: 'single_choice',
            knowledgePointId: 'math.g1.count.1_10',
            difficulty: 1,
            title: '找对应的数字',
            subtitle: '观察小兔子数量选择正确的数字',
            promptText: '草地上有 4 只可爱的小白兔 🐰🐰🐰🐰，对应的数字是几？',
            promptVoice: '草地上有四只小白兔，快帮它们找到正确的数字家吧！',
            hint: '数一数小兔子的个数：1、2、3、4。',
            explanation: '4 只小兔子对应数字 4。',
            options: [
              { id: 'opt_3', text: '3', subText: '三' },
              { id: 'opt_4', text: '4', subText: '四' },
              { id: 'opt_5', text: '5', subText: '五' },
              { id: 'opt_6', text: '6', subText: '六' }
            ],
            correctOptionIds: ['opt_4']
          },
          {
            id: 'mg1t1_1_s3',
            type: 'drag_match',
            knowledgePointId: 'math.g1.count.1_10',
            difficulty: 1,
            title: '数量与数字连连看',
            subtitle: '将物品数量和对应的数字连线配对',
            promptText: '请把左边的物品数量与右边的正确数字配对起来吧！',
            promptVoice: '请把物品和对应的数字配对起来。',
            hint: '先数清楚左边的个数，再找右边相同的数字。',
            explanation: '⭐ 对应 1，⭐⭐⭐ 对应 3，⭐⭐⭐⭐⭐ 对应 5。',
            pairs: [
              { id: 'p1', left: { text: '⭐ 1颗星星' }, right: { text: '数字 1' } },
              { id: 'p2', left: { text: '⭐⭐⭐ 3颗星星' }, right: { text: '数字 3' } },
              { id: 'p3', left: { text: '⭐⭐⭐⭐⭐ 5颗星星' }, right: { text: '数字 5' } }
            ]
          }
        ]
      },
      {
        id: 'math_g1t1_l2',
        subjectId: 'math',
        gradeLevel: 'g1_t1',
        chapterId: 101,
        chapterTitle: '准备课（数一数与比多少）',
        chapterIcon: '🍎',
        title: '比多少与大小认知',
        subtitle: '学会比较两组物品谁多谁少',
        icon: '⚖️',
        badge: '比较思维',
        summary: '用一一对应的方法比较两组物体的多少。',
        knowledgePointId: 'math.g1.compare.size',
        rewards: { stars: 3, coins: 50, exp: 100 },
        steps: [
          {
            id: 'mg1t1_2_s1',
            type: 'single_choice',
            knowledgePointId: 'math.g1.compare.size',
            difficulty: 1,
            title: '比一比谁更多',
            subtitle: '比较两组数量的大小',
            promptText: '小熊有 7 颗糖果 🍬，小猴有 4 颗糖果，谁的糖果多？',
            promptVoice: '小熊有7颗糖果，小猴有4颗，谁的糖果多？',
            hint: '7 比 4 大，7 > 4。',
            explanation: '7 大于 4，所以小熊的糖果更多。',
            options: [
              { id: 'opt_bear', text: '🐻 小熊 (7颗)' },
              { id: 'opt_monkey', text: '🐒 小猴 (4颗)' },
              { id: 'opt_equal', text: '一样多' }
            ],
            correctOptionIds: ['opt_bear']
          },
          {
            id: 'mg1t1_2_s2',
            type: 'ordering',
            knowledgePointId: 'math.g1.compare.size',
            difficulty: 2,
            title: '数字从小到大排列',
            subtitle: '将散落的数字从小到大排好队',
            promptText: '请按【从小到大】的顺序排列这几个数字：',
            promptVoice: '请把数字从小到大排排队。',
            hint: '最小的是 2，然后是 5，最大的是 8。',
            explanation: '2 < 5 < 8。',
            items: [
              { id: 'i8', text: '8' },
              { id: 'i2', text: '2' },
              { id: 'i5', text: '5' }
            ],
            correctOrder: ['i2', 'i5', 'i8']
          }
        ]
      }
    ]
  },
  {
    id: 102,
    subjectId: 'math',
    gradeLevel: 'g1_t1',
    unitNumber: 2,
    title: '第二单元：位置与空间认知',
    subtitle: '认识上下、前后、左右的方位关系',
    icon: '🧭',
    badge: '一年级上册',
    themeGradient: 'from-indigo-500 to-blue-600',
    description: '通过排队场景、桌面摆放和教室情景，准确判断物体的相对位置。',
    lessons: [
      {
        id: 'math_g1t1_l3',
        subjectId: 'math',
        gradeLevel: 'g1_t1',
        chapterId: 102,
        chapterTitle: '位置与空间认知',
        chapterIcon: '🧭',
        title: '分清上、下、前、后、左、右',
        subtitle: '准确描述物体在空间中的位置',
        icon: '📍',
        badge: '方位认知',
        summary: '掌握以自身或参照物为标准的方位判断法。',
        knowledgePointId: 'math.g1.shapes.recognize',
        rewards: { stars: 3, coins: 50, exp: 100 },
        steps: [
          {
            id: 'mg1t1_3_s1',
            type: 'single_choice',
            knowledgePointId: 'math.g1.shapes.recognize',
            difficulty: 1,
            title: '谁在小狗的前面？',
            subtitle: '观察排队顺序',
            promptText: '小动物排队：小猫在最前面，小狗在中间，小兔在最后面。谁在小狗的前面？',
            promptVoice: '小猫在最前面，小狗在中间，小兔在最后面。谁在小狗的前面？',
            hint: '小猫排在第1个，小狗在第2个。',
            explanation: '小猫在小狗的前面。',
            options: [
              { id: 'opt_cat', text: '🐱 小猫' },
              { id: 'opt_rabbit', text: '🐰 小兔' },
              { id: 'opt_none', text: '没有人' }
            ],
            correctOptionIds: ['opt_cat']
          }
        ]
      }
    ]
  },
  {
    id: 103,
    subjectId: 'math',
    gradeLevel: 'g1_t1',
    unitNumber: 3,
    title: '第三单元：20以内进位加法（凑十法）',
    subtitle: '9加几、8/7/6加几与凑十法精讲',
    icon: '🔟',
    badge: '一年级上册',
    themeGradient: 'from-blue-600 to-purple-600',
    description: '小学数学最核心的基础算法——凑十法，看大数分小数，凑成十再加剩。',
    lessons: [
      {
        id: 'math_g1t1_l4',
        subjectId: 'math',
        gradeLevel: 'g1_t1',
        chapterId: 103,
        chapterTitle: '20以内进位加法（凑十法）',
        chapterIcon: '🔟',
        title: '9加几的凑十魔法',
        subtitle: '看到9想到1，凑成10真容易',
        icon: '✨',
        badge: '凑十法',
        summary: '熟练掌握 9+几 的快速心算口诀。',
        knowledgePointId: 'math.g1.addition.within20_carry',
        rewards: { stars: 3, coins: 60, exp: 120 },
        steps: [
          {
            id: 'mg1t1_4_s1',
            type: 'fill_blank',
            knowledgePointId: 'math.g1.addition.within20_carry',
            difficulty: 2,
            title: '9加5等于几？',
            subtitle: '把5分成1和4',
            promptText: '9 + 5 = ? (先把5分成 1 和 4，9 + 1 = 10，10 + 4 = ?)',
            promptVoice: '9加5等于多少呢？看到9想到1，把5分成1和4。',
            hint: '9加1等于10，10加4等于14。',
            explanation: '9 + 5 = 14。',
            template: '9 + 5 = [?]',
            correctAnswers: ['14'],
            optionsPool: ['13', '14', '15', '16'],
            keypadType: 'number'
          },
          {
            id: 'mg1t1_4_s2',
            type: 'drag_match',
            knowledgePointId: 'math.g1.addition.within20_carry',
            difficulty: 2,
            title: '凑十好朋友对对碰',
            subtitle: '两数相加等于10',
            promptText: '快来帮相加等于10的两个数字好朋友连线吧：',
            promptVoice: '请把能凑成10的数字连起来。',
            hint: '一九一九好朋友，二八二八手拉手，三七三七真亲密！',
            explanation: '9+1=10, 8+2=10, 7+3=10。',
            pairs: [
              { id: 'p1', left: { text: '数字 9' }, right: { text: '数字 1' } },
              { id: 'p2', left: { text: '数字 8' }, right: { text: '数字 2' } },
              { id: 'p3', left: { text: '数字 7' }, right: { text: '数字 3' } }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================
  // 🎒 一年级下册 (人教版同步)
  // =========================================================
  {
    id: 104,
    subjectId: 'math',
    gradeLevel: 'g1_t2',
    unitNumber: 1,
    title: '第一单元：20以内的退位减法（破十法）',
    subtitle: '十几减9、8、7、6与破十法思维',
    icon: '⚡',
    badge: '一年级下册',
    themeGradient: 'from-teal-500 to-emerald-600',
    description: '掌握“破十法”与“想加算减法”，轻松破解退位减法难关。',
    lessons: [
      {
        id: 'math_g1t2_l1',
        subjectId: 'math',
        gradeLevel: 'g1_t2',
        chapterId: 104,
        chapterTitle: '20以内的退位减法（破十法）',
        chapterIcon: '⚡',
        title: '十几减9的破十法',
        subtitle: '15 - 9 怎么破？先用10减9剩1，再加上5',
        icon: '✂️',
        badge: '破十法',
        summary: '用破十法和想加算减法迅速计算 15-9, 13-9 等算式。',
        knowledgePointId: 'math.g1.subtraction.within20_borrow',
        rewards: { stars: 3, coins: 60, exp: 120 },
        steps: [
          {
            id: 'mg1t2_1_s1',
            type: 'fill_blank',
            knowledgePointId: 'math.g1.subtraction.within20_borrow',
            difficulty: 2,
            title: '15减9等于几？',
            subtitle: '破十法计算',
            promptText: '15 - 9 = ? (把15分成 10 和 5，10 - 9 = 1，1 + 5 = ?)',
            promptVoice: '15减9等于几？用10减9等于1，再加上5。',
            hint: '10 - 9 = 1, 1 + 5 = 6。',
            explanation: '15 - 9 = 6。',
            template: '15 - 9 = [?]',
            correctAnswers: ['6'],
            optionsPool: ['5', '6', '7', '8'],
            keypadType: 'number'
          }
        ]
      }
    ]
  },

  // =========================================================
  // 🎒 二年级上册 (人教版同步)
  // =========================================================
  {
    id: 201,
    subjectId: 'math',
    gradeLevel: 'g2_t1',
    unitNumber: 1,
    title: '第一单元：100以内加法和减法（笔算与竖式）',
    subtitle: '两位数进位加法、退位减法与加减混合',
    icon: '📝',
    badge: '二年级上册',
    themeGradient: 'from-violet-500 to-indigo-600',
    description: '规范列竖式计算，相同数位对齐，从个位算起，满十进一，不够减退一当十。',
    lessons: [
      {
        id: 'math_g2t1_l1',
        subjectId: 'math',
        gradeLevel: 'g2_t1',
        chapterId: 201,
        chapterTitle: '100以内加法和减法（笔算与竖式）',
        chapterIcon: '📝',
        title: '两位数进位加法',
        subtitle: '个位相加满十，向十位进一',
        icon: '➕',
        badge: '进位加法',
        summary: '熟练掌握 37 + 28 这种两位数加法运算。',
        knowledgePointId: 'math.g2.addition.within100_carry',
        rewards: { stars: 3, coins: 60, exp: 120 },
        steps: [
          {
            id: 'mg2t1_1_s1',
            type: 'fill_blank',
            knowledgePointId: 'math.g2.addition.within100_carry',
            difficulty: 3,
            title: '37 + 28 = ?',
            subtitle: '进位加法计算',
            promptText: '计算：37 + 28 = ? (个位 7+8=15 写5进1，十位 3+2+1=6)',
            promptVoice: '37加28等于多少？个位相加满十向十位进一。',
            hint: '7+8=15，30+20+10=60，60+5=65。',
            explanation: '37 + 28 = 65。',
            template: '37 + 28 = [?]',
            correctAnswers: ['65'],
            optionsPool: ['55', '65', '75', '64'],
            keypadType: 'number'
          }
        ]
      }
    ]
  },
  {
    id: 202,
    subjectId: 'math',
    gradeLevel: 'g2_t1',
    unitNumber: 2,
    title: '第二单元：表内乘法（九九乘法表）',
    subtitle: '认识乘号、求几个相同加数的和与2~6乘法口诀',
    icon: '✖️',
    badge: '二年级上册',
    themeGradient: 'from-orange-500 to-rose-600',
    description: '理解乘法是相同加数相加的简便算法，朗朗上口背诵九九乘法口诀。',
    lessons: [
      {
        id: 'math_g2t1_l2',
        subjectId: 'math',
        gradeLevel: 'g2_t1',
        chapterId: 202,
        chapterTitle: '表内乘法（九九乘法表）',
        chapterIcon: '✖️',
        title: '认识乘法与 5 的乘法口诀',
        subtitle: '一五得五、二五一十、三五十五',
        icon: '🖐️',
        badge: '乘法口诀',
        summary: '用手指数数体会 5 的乘法规律。',
        knowledgePointId: 'math.g2.multiplication.table99',
        rewards: { stars: 3, coins: 60, exp: 120 },
        steps: [
          {
            id: 'mg2t1_2_s1',
            type: 'single_choice',
            knowledgePointId: 'math.g2.multiplication.table99',
            difficulty: 2,
            title: '4 个 5 相加写成乘法算式是？',
            subtitle: '乘法的意义',
            promptText: '5 + 5 + 5 + 5 表示 4 个 5 相加，可以简写成什么乘法算式？',
            promptVoice: '4个5相加写成乘法算式是什么呢？',
            hint: '几个几相加就是几乘几：4 × 5。',
            explanation: '4 个 5 相加写成 4 × 5 或 5 × 4。',
            options: [
              { id: 'opt_4x5', text: '4 × 5' },
              { id: 'opt_4plus5', text: '4 + 5' },
              { id: 'opt_4444', text: '4 × 4' }
            ],
            correctOptionIds: ['opt_4x5']
          }
        ]
      }
    ]
  },

  // =========================================================
  // 🎒 二年级下册 (人教版同步：表内除法、有余数除法、万以内数)
  // =========================================================
  {
    id: 203,
    subjectId: 'math',
    gradeLevel: 'g2_t2',
    unitNumber: 2,
    title: '第二单元：表内除法（平均分）',
    subtitle: '把一些物品平均分成几份，每份是几个',
    icon: '➗',
    badge: '二年级下册',
    themeGradient: 'from-cyan-500 to-sky-600',
    description: '建立平均分的直观模型，学会用乘法口诀求商。',
    lessons: [
      {
        id: 'math_g2t2_l1',
        subjectId: 'math',
        gradeLevel: 'g2_t2',
        chapterId: 203,
        chapterTitle: '表内除法（平均分）',
        chapterIcon: '➗',
        title: '平均分与除法算式',
        subtitle: '12 个橘子平均分给 3 个小朋友，每人几个？',
        icon: '🍊',
        badge: '平均分',
        summary: '理解“平均分”就是每份同样多，并用除法算式表示。',
        knowledgePointId: 'math.g2.division.table99',
        rewards: { stars: 3, coins: 60, exp: 120 },
        steps: [
          {
            id: 'mg2t2_1_s1',
            type: 'single_choice',
            knowledgePointId: 'math.g2.division.table99',
            difficulty: 2,
            title: '12 个橘子平均分给 3 人',
            subtitle: '每份同样多',
            promptText: '把 12 个橘子 🍊 平均分给 3 个小朋友，每个小朋友分到几个？',
            promptVoice: '12个橘子平均分给3个小朋友，每人几个？',
            hint: '想乘法口诀：三三得九，三四十二。3 × 4 = 12，所以每人 4 个。',
            explanation: '12 ÷ 3 = 4，每个小朋友分到 4 个橘子。',
            options: [
              { id: 'opt_3', text: '3 个' },
              { id: 'opt_4', text: '4 个' },
              { id: 'opt_6', text: '6 个' }
            ],
            correctOptionIds: ['opt_4']
          },
          {
            id: 'mg2t2_1_s2',
            type: 'fill_blank',
            knowledgePointId: 'math.g2.division.table99',
            difficulty: 2,
            title: '用口诀求商',
            subtitle: '15 ÷ 5 = ?',
            promptText: '计算：15 ÷ 5 = ? （想：五几得十五？）',
            promptVoice: '15除以5等于几？想一想乘法口诀。',
            hint: '五三十五，所以商是 3。',
            explanation: '因为 5 × 3 = 15，所以 15 ÷ 5 = 3。',
            template: '15 ÷ 5 = [?]',
            correctAnswers: ['3'],
            optionsPool: ['2', '3', '4', '5'],
            keypadType: 'number'
          }
        ]
      }
    ]
  },
  {
    id: 204,
    subjectId: 'math',
    gradeLevel: 'g2_t2',
    unitNumber: 6,
    title: '第六单元：有余数的除法',
    subtitle: '余数要比除数小',
    icon: '🍪',
    badge: '二年级下册',
    themeGradient: 'from-fuchsia-500 to-pink-600',
    description: '理解不能正好分完时会剩下几份，余数必须比除数小。',
    lessons: [
      {
        id: 'math_g2t2_l2',
        subjectId: 'math',
        gradeLevel: 'g2_t2',
        chapterId: 204,
        chapterTitle: '有余数的除法',
        chapterIcon: '🍪',
        title: '余数要比除数小',
        subtitle: '10 块饼干，每人 3 块，能分给几人？还剩几块？',
        icon: '🍪',
        badge: '有余数',
        summary: '会写带余数的除法：10 ÷ 3 = 3 …… 1。',
        knowledgePointId: 'math.g2.division.remainder',
        rewards: { stars: 3, coins: 65, exp: 130 },
        steps: [
          {
            id: 'mg2t2_2_s1',
            type: 'single_choice',
            knowledgePointId: 'math.g2.division.remainder',
            difficulty: 3,
            title: '10 块饼干每人 3 块',
            subtitle: '能分给几人，还剩几块',
            promptText: '有 10 块饼干，每人分 3 块。最多能分给几个人？还剩几块？',
            promptVoice: '10块饼干每人3块，能分给几人，还剩几块？',
            hint: '3 × 3 = 9，10 - 9 = 1，所以分给 3 人，还剩 1 块。',
            explanation: '10 ÷ 3 = 3 …… 1，商是 3，余数是 1。余数 1 比除数 3 小。',
            options: [
              { id: 'opt_a', text: '分给 3 人，剩 1 块' },
              { id: 'opt_b', text: '分给 4 人，剩 0 块' },
              { id: 'opt_c', text: '分给 2 人，剩 4 块' }
            ],
            correctOptionIds: ['opt_a']
          },
          {
            id: 'mg2t2_2_s2',
            type: 'fill_blank',
            knowledgePointId: 'math.g2.division.remainder',
            difficulty: 3,
            title: '17 ÷ 5 的余数',
            subtitle: '余数必须比除数小',
            promptText: '17 ÷ 5 = 3 …… ?  问号里应填几？',
            promptVoice: '17除以5，商是3，余数是几？',
            hint: '5 × 3 = 15，17 - 15 = 2。',
            explanation: '17 ÷ 5 = 3 …… 2。余数 2 比除数 5 小。',
            template: '17 ÷ 5 = 3 …… [?]',
            correctAnswers: ['2'],
            optionsPool: ['1', '2', '3', '5'],
            keypadType: 'number'
          }
        ]
      }
    ]
  },
  {
    id: 205,
    subjectId: 'math',
    gradeLevel: 'g2_t2',
    unitNumber: 7,
    title: '第七单元：万以内数的认识',
    subtitle: '认识千位、万位，会读会写',
    icon: '🔢',
    badge: '二年级下册',
    themeGradient: 'from-lime-500 to-green-600',
    description: '知道计数单位“千”和“万”，能正确读写万以内的数。',
    lessons: [
      {
        id: 'math_g2t2_l3',
        subjectId: 'math',
        gradeLevel: 'g2_t2',
        chapterId: 205,
        chapterTitle: '万以内数的认识',
        chapterIcon: '🔢',
        title: '读一读、写一写万以内的数',
        subtitle: '2300 怎么读？四千零五十怎么写？',
        icon: '📖',
        badge: '读数写数',
        summary: '掌握数位顺序：个、十、百、千、万。',
        knowledgePointId: 'math.g2.numbers.within10000',
        rewards: { stars: 3, coins: 65, exp: 130 },
        steps: [
          {
            id: 'mg2t2_3_s1',
            type: 'single_choice',
            knowledgePointId: 'math.g2.numbers.within10000',
            difficulty: 2,
            title: '2300 怎么读',
            subtitle: '中间没有零的整百数',
            promptText: '数字 2300 正确的读法是？',
            promptVoice: '二千三百，应该怎么读这个数？',
            hint: '从高位读起：二千三百。末尾的 0 不用读。',
            explanation: '2300 读作二千三百。',
            options: [
              { id: 'opt_a', text: '二千三百' },
              { id: 'opt_b', text: '二千三百零零' },
              { id: 'opt_c', text: '二三零零' }
            ],
            correctOptionIds: ['opt_a']
          },
          {
            id: 'mg2t2_3_s2',
            type: 'fill_blank',
            knowledgePointId: 'math.g2.numbers.within10000',
            difficulty: 3,
            title: '四千零五十怎么写',
            subtitle: '中间有零要占位',
            promptText: '“四千零五十”写成数字是？',
            promptVoice: '四千零五十，写成数字是多少？',
            hint: '千位是 4，百位是 0，十位是 5，个位是 0。',
            explanation: '四千零五十写作 4050。中间的 0 不能丢掉。',
            template: '四千零五十 = [?]',
            correctAnswers: ['4050'],
            optionsPool: ['4050', '4500', '405', '450'],
            keypadType: 'number'
          }
        ]
      }
    ]
  },

  // =========================================================
  // 🎒 三年级上册 (分数与几何周长公式 KaTeX 实战)
  // =========================================================
  {
    id: 301,
    subjectId: 'math',
    gradeLevel: 'g3_t1',
    unitNumber: 1,
    title: '第一单元：分数的初步认识与公式表达 (KaTeX)',
    subtitle: '几分之一、几分之几与同分母分数比大小',
    icon: '🍰',
    badge: '三年级上册',
    themeGradient: 'from-amber-500 to-orange-600',
    description: '通过图形均分理解分子、分母与分数线，使用 KaTeX 数学公式渲染标准分数表达式。',
    lessons: [
      {
        id: 'math_g3t1_l1',
        subjectId: 'math',
        gradeLevel: 'g3_t1',
        chapterId: 301,
        chapterTitle: '分数的初步认识与公式表达',
        chapterIcon: '🍰',
        title: '认识几分之一与标准分数公式',
        subtitle: '把一个月饼平均分成 2 份，每份是它的二分之一',
        icon: '🍕',
        badge: '分数概念',
        summary: '掌握分数的标准书写格式 \frac{a}{b} 与分子分母意义。',
        knowledgePointId: 'math.g3.fraction.intro',
        rewards: { stars: 3, coins: 70, exp: 140 },
        steps: [
          {
            id: 'mg3t1_1_s1',
            type: 'math_formula',
            knowledgePointId: 'math.g3.fraction.intro',
            difficulty: 2,
            title: '标准分数的分子与分母',
            subtitle: '观察标准分数公式',
            promptText: '下面的分数公式中，分子是几，分母是几？',
            promptVoice: '仔细观察这个标准分数公式，分子是几呢？',
            latex: '\\frac{1}{2}',
            subFormula: '\\text{分子}=1,\\;\\text{分母}=2',
            hint: '横线上方的是分子，横线下方的是分母。',
            explanation: '在分数 \\frac{1}{2} 中，上面的 1 是分子，下面的 2 是分母。',
            options: [
              { id: 'opt_num1', text: '分子是 1，分母是 2', latex: '1 \\;\\text{(分子)}, \\; 2 \\;\\text{(分母)}' },
              { id: 'opt_num2', text: '分子是 2，分母是 1', latex: '2 \\;\\text{(分子)}, \\; 1 \\;\\text{(分母)}' }
            ],
            correctOptionIds: ['opt_num1']
          },
          {
            id: 'mg3t1_1_s2',
            type: 'math_formula',
            knowledgePointId: 'math.g3.fraction.intro',
            difficulty: 3,
            title: '同分母分数加法',
            subtitle: '分母相同，分子相加',
            promptText: '计算下面同分母分数的和：',
            promptVoice: '计算同分母分数相加：五分之一加五分之二等于多少？',
            latex: '\\frac{1}{5} + \\frac{2}{5} = ?',
            hint: '分母不变，分子 1 + 2 = 3！',
            explanation: '\\frac{1}{5} + \\frac{2}{5} = \\frac{3}{5}。',
            options: [
              { id: 'opt_f1', text: '3/5', latex: '\\frac{3}{5}' },
              { id: 'opt_f2', text: '3/10', latex: '\\frac{3}{10}' },
              { id: 'opt_f3', text: '2/5', latex: '\\frac{2}{5}' }
            ],
            correctOptionIds: ['opt_f1']
          }
        ]
      },
      {
        id: 'math_g3t1_l2',
        subjectId: 'math',
        gradeLevel: 'g3_t1',
        chapterId: 301,
        chapterTitle: '长方形与正方形的周长计算公式',
        chapterIcon: '📐',
        title: '长方形周长公式应用',
        subtitle: '长方形周长 C = (a + b) × 2',
        icon: '📏',
        badge: '几何公式',
        summary: '运用 KaTeX 几何周长公式推导计算。',
        knowledgePointId: 'math.g3.geometry.perimeter',
        rewards: { stars: 3, coins: 70, exp: 140 },
        steps: [
          {
            id: 'mg3t1_2_s1',
            type: 'math_formula',
            knowledgePointId: 'math.g3.geometry.perimeter',
            difficulty: 3,
            title: '长方形周长公式',
            subtitle: '已知长 a=6, 宽 b=4',
            promptText: '一个长方形的长是 6cm，宽是 4cm，请利用周长公式计算它的周长：',
            promptVoice: '长方形的长是6厘米，宽是4厘米，周长是多少厘米？',
            latex: 'C = (a + b) \\times 2',
            subFormula: 'a = 6\\text{cm},\\; b = 4\\text{cm}',
            hint: '先算括号里的 6 + 4 = 10，再乘 2 等于 20！',
            explanation: 'C = (6 + 4) \\times 2 = 10 \\times 2 = 20\\text{cm}。',
            correctAnswer: '20'
          }
        ]
      }
    ]
  }
];

