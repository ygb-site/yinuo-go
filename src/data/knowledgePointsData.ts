import type { KnowledgePoint, SubjectId, GradeLevel } from '../types/curriculum';

export const KNOWLEDGE_POINTS_REPOSITORY: KnowledgePoint[] = [
  // =========================================================================
  // 🔢 数学学科知识点 (Math Knowledge Points)
  // =========================================================================
  {
    id: 'math.g1.count.1_10',
    subjectId: 'math',
    gradeLevel: 'g1_t1',
    unitNumber: 1,
    title: '1~10 的认识与手口对应点数',
    category: '数与代数',
    importance: 'core',
    description: '认识 1~10 的具体实物数量与抽象数字符号，能够手口一致准确点数。',
    abilityDimension: 'calculation',
    tags: ['数感', '认数', '点数']
  },
  {
    id: 'math.g1.compare.size',
    subjectId: 'math',
    gradeLevel: 'g1_t1',
    unitNumber: 1,
    title: '比大小与比多少（＞、＜、＝）',
    category: '数与代数',
    importance: 'core',
    description: '理解“同样多”、“多”、“少”的相对概念，并能正确使用大于号、小于号和等号。',
    abilityDimension: 'logical',
    prerequisites: ['math.g1.count.1_10'],
    tags: ['比较', '符号认知']
  },
  {
    id: 'math.g1.addition.within10',
    subjectId: 'math',
    gradeLevel: 'g1_t1',
    unitNumber: 3,
    title: '10 以内加法（合与分）',
    category: '数与代数',
    importance: 'core',
    description: '掌握 10 以内数的组成与分解，熟练进行 10 以内不进位口算加法。',
    abilityDimension: 'calculation',
    prerequisites: ['math.g1.count.1_10'],
    tags: ['加法', '合与分', '口算']
  },
  {
    id: 'math.g1.subtraction.within10',
    subjectId: 'math',
    gradeLevel: 'g1_t1',
    unitNumber: 3,
    title: '10 以内减法（剩余与减少）',
    category: '数与代数',
    importance: 'core',
    description: '理解减法的含义（去掉、还剩），熟练口算 10 以内一步减法。',
    abilityDimension: 'calculation',
    prerequisites: ['math.g1.addition.within10'],
    tags: ['减法', '口算']
  },
  {
    id: 'math.g1.addition.within20_carry',
    subjectId: 'math',
    gradeLevel: 'g1_t1',
    unitNumber: 8,
    title: '20 以内进位加法（凑十法）',
    category: '数与代数',
    importance: 'core',
    description: '掌握“看大数、分小数、凑成十、加剩数”的凑十法计算策略。',
    abilityDimension: 'calculation',
    prerequisites: ['math.g1.addition.within10'],
    tags: ['凑十法', '进位加法', '口算核心']
  },
  {
    id: 'math.g1.subtraction.within20_borrow',
    subjectId: 'math',
    gradeLevel: 'g1_t2',
    unitNumber: 2,
    title: '20 以内退位减法（破十法与想加算减）',
    category: '数与代数',
    importance: 'core',
    description: '掌握破十法和平十法，能够根据 20 以内进位加法迅速反推退位减法。',
    abilityDimension: 'calculation',
    prerequisites: ['math.g1.addition.within20_carry'],
    tags: ['破十法', '退位减法', '计算基石']
  },
  {
    id: 'math.g1.shapes.recognize',
    subjectId: 'math',
    gradeLevel: 'g1_t1',
    unitNumber: 4,
    title: '认识立体与平面图形（长方体/正方体/圆柱/球）',
    category: '图形与几何',
    importance: 'core',
    description: '直观感知常见物体的形状特征，能辨析长方体、正方体、圆柱和球。',
    abilityDimension: 'spatial',
    tags: ['立体图形', '空间感']
  },
  {
    id: 'math.g2.addition.within100_carry',
    subjectId: 'math',
    gradeLevel: 'g2_t1',
    unitNumber: 2,
    title: '100 以内两位数进位加法（竖式计算）',
    category: '数与代数',
    importance: 'core',
    description: '掌握相同数位对齐、从个位加起、个位满十向十位进一的竖式规则。',
    abilityDimension: 'calculation',
    prerequisites: ['math.g1.addition.within20_carry'],
    tags: ['进位加法', '竖式计算', '数位概念']
  },
  {
    id: 'math.g2.subtraction.within100_borrow',
    subjectId: 'math',
    gradeLevel: 'g2_t1',
    unitNumber: 2,
    title: '100 以内两位数退位减法（借一当十）',
    category: '数与代数',
    importance: 'core',
    description: '掌握竖式减法借位法则：个位不够减向十位借一当十，计算时注意减去退位 1。',
    abilityDimension: 'calculation',
    prerequisites: ['math.g1.subtraction.within20_borrow'],
    tags: ['退位减法', '借位法则', '竖式规范']
  },
  {
    id: 'math.g2.multiplication.table99',
    subjectId: 'math',
    gradeLevel: 'g2_t1',
    unitNumber: 4,
    title: '表内乘法与九九乘法口诀',
    category: '数与代数',
    importance: 'core',
    description: '理解乘法是求几个相同加数和的简便运算，熟练背诵九九乘法表并熟练计算。',
    abilityDimension: 'calculation',
    prerequisites: ['math.g1.addition.within20_carry'],
    tags: ['乘法口诀', '表内乘法', '基础算力']
  },
  {
    id: 'math.g2.division.table99',
    subjectId: 'math',
    gradeLevel: 'g2_t2',
    unitNumber: 2,
    title: '表内除法与平均分概念',
    category: '数与代数',
    importance: 'core',
    description: '建立“平均分”的具象模型，掌握用乘法口诀求商的方法。',
    abilityDimension: 'logical',
    prerequisites: ['math.g2.multiplication.table99'],
    tags: ['除法', '平均分', '用乘求商']
  },
  {
    id: 'math.g2.division.remainder',
    subjectId: 'math',
    gradeLevel: 'g2_t2',
    unitNumber: 6,
    title: '有余数的除法',
    category: '数与代数',
    importance: 'core',
    description: '理解余数必须比除数小，能正确写出带余数的除法算式并解决简单实际问题。',
    abilityDimension: 'logical',
    prerequisites: ['math.g2.division.table99'],
    tags: ['余数', '除法竖式', '实际问题']
  },
  {
    id: 'math.g2.numbers.within10000',
    subjectId: 'math',
    gradeLevel: 'g2_t2',
    unitNumber: 7,
    title: '万以内数的认识与读写',
    category: '数与代数',
    importance: 'core',
    description: '认识千位、万位，会读写万以内的数，理解计数单位和数位顺序。',
    abilityDimension: 'calculation',
    prerequisites: ['math.g1.count.1_10'],
    tags: ['数位', '读数写数', '万以内']
  },
  {
    id: 'math.g3.fraction.intro',
    subjectId: 'math',
    gradeLevel: 'g3_t1',
    unitNumber: 8,
    title: '分数的初步认识（几分之一与几分之几）',
    category: '数与代数',
    importance: 'core',
    description: '通过图形等分理解分数的含义，认识分子、分母和分数线，进行同分母分数比大小。',
    abilityDimension: 'logical',
    tags: ['分数', '分子分母', '等分模型']
  },
  {
    id: 'math.g3.geometry.perimeter',
    subjectId: 'math',
    gradeLevel: 'g3_t1',
    unitNumber: 7,
    title: '长方形与正方形的周长计算公式',
    category: '图形与几何',
    importance: 'core',
    description: '理解周长的概念，推导并运用 C = (a+b)×2 与 C = 4a 进行实际测量与计算。',
    abilityDimension: 'spatial',
    tags: ['周长', '公式计算', '长方形正方形']
  },
  {
    id: 'math.g4.geometry.area',
    subjectId: 'math',
    gradeLevel: 'g4_t1',
    unitNumber: 5,
    title: '面积单位与长宽面积公式 (S = a × b)',
    category: '图形与几何',
    importance: 'core',
    description: '掌握平方米、平方分米、平方厘米的进率换算，灵活运用面积公式解决实际问题。',
    abilityDimension: 'spatial',
    tags: ['面积公式', '单位换算', '空间几何']
  },

  // =========================================================================
  // 🏮 语文学科知识点 (Chinese Knowledge Points)
  // =========================================================================
  {
    id: 'chinese.g1.strokes.basic',
    subjectId: 'chinese',
    gradeLevel: 'g1_t1',
    unitNumber: 1,
    title: '汉字基本笔画（横、竖、撇、捺、点、折）',
    category: '字词基础',
    importance: 'core',
    description: '正确书写横、竖、撇、捺、点、提、折等基础笔画，掌握正确的起笔与落笔力度。',
    abilityDimension: 'language',
    tags: ['笔画', '书写规范', '汉字基石']
  },
  {
    id: 'chinese.g1.strokes.order',
    subjectId: 'chinese',
    gradeLevel: 'g1_t1',
    unitNumber: 1,
    title: '汉字笔顺规则（先横后竖、从上到下、先左后右）',
    category: '字词基础',
    importance: 'core',
    description: '牢记“先横后竖，从上到下，从左到右，先中间后两边，先里头后封口”的书写口诀。',
    abilityDimension: 'memory',
    prerequisites: ['chinese.g1.strokes.basic'],
    tags: ['笔顺口诀', '书写规范', '田字格']
  },
  {
    id: 'chinese.g1.pinyin.initials',
    subjectId: 'chinese',
    gradeLevel: 'g1_t1',
    unitNumber: 2,
    title: '汉语拼音 23 个声母认读与书写',
    category: '拼音拼读',
    importance: 'core',
    description: '熟练认读 b, p, m, f, d, t, n, l, g, k, h, j, q, x, zh, ch, sh, r, z, c, s, y, w。',
    abilityDimension: 'language',
    tags: ['声母', '发音位置', '拼音']
  },
  {
    id: 'chinese.g1.pinyin.finals',
    subjectId: 'chinese',
    gradeLevel: 'g1_t1',
    unitNumber: 2,
    title: '汉语拼音 24 个韵母（单韵母、复韵母、鼻韵母）',
    category: '拼音拼读',
    importance: 'core',
    description: '掌握 a, o, e, i, u, ü 及 ai, ei, ui, ao, ou, iu, ie, üe, er 和前后鼻韵母的发音与四声调。',
    abilityDimension: 'language',
    tags: ['韵母', '声调', '拼音拼读']
  },
  {
    id: 'chinese.g1.pinyin.tones',
    subjectId: 'chinese',
    gradeLevel: 'g1_t1',
    unitNumber: 2,
    title: '拼音声调标调口诀（有 a 别放过，没 a 找 o e）',
    category: '拼音拼读',
    importance: 'core',
    description: '掌握标调规则：有 a 在把帽戴，a 要不在找 o e，i u 并列标在后，单个韵母不用说。',
    abilityDimension: 'memory',
    prerequisites: ['chinese.g1.pinyin.finals'],
    tags: ['标调规则', '四声调']
  },
  {
    id: 'chinese.g1.radicals.common',
    subjectId: 'chinese',
    gradeLevel: 'g1_t2',
    unitNumber: 1,
    title: '常见偏旁部首表意规律（三点水、草字头、木字旁）',
    category: '字词基础',
    importance: 'core',
    description: '通过形声字构字规律理解偏旁部首的意义，体会“形旁表意、声旁表音”。',
    abilityDimension: 'logical',
    tags: ['偏旁部首', '形声字', '汉字规律']
  },
  {
    id: 'chinese.g1.poetry.recite',
    subjectId: 'chinese',
    gradeLevel: 'g1_t1',
    unitNumber: 4,
    title: '小学必背古诗词朗读与意境理解',
    category: '传统文化与古诗',
    importance: 'extended',
    description: '熟读成诵《咏鹅》《静夜思》《悯农》等经典篇目，感受汉语音韵美与画面美。',
    abilityDimension: 'language',
    tags: ['古诗', '背诵', '国学素养']
  },
  {
    id: 'chinese.g2.polyphone.recognition',
    subjectId: 'chinese',
    gradeLevel: 'g2_t1',
    unitNumber: 3,
    title: '多音字与同音字辨析',
    category: '字词基础',
    importance: 'core',
    description: '准确区分根据词义与语境变化读音的多音字（如 行、得、长、重、乐）。',
    abilityDimension: 'language',
    tags: ['多音字', '语境理解', '易错字']
  },

  // =========================================================================
  // 🔤 英语学科知识点 (English Knowledge Points)
  // =========================================================================
  {
    id: 'english.g1.phonics.letters26',
    subjectId: 'english',
    gradeLevel: 'g1_t1',
    unitNumber: 1,
    title: '26 个英文字母认读与大小写对应',
    category: '字母与发音',
    importance: 'core',
    description: '掌握 26 个字母的印刷体、手写体大小写规范，以及字母名称音。',
    abilityDimension: 'memory',
    tags: ['字母', 'ABC', '书写规范']
  },
  {
    id: 'english.g1.phonics.short_vowels',
    subjectId: 'english',
    gradeLevel: 'g1_t1',
    unitNumber: 2,
    title: '自然拼读基础：5 个元音字母短音发音 (/æ/, /e/, /ɪ/, /ɒ/, /ʌ/)',
    category: '自然拼读',
    importance: 'core',
    description: '掌握 A, E, I, O, U 在闭音节中的短元音发音规则（如 cat, bed, pig, dog, bus）。',
    abilityDimension: 'language',
    prerequisites: ['english.g1.phonics.letters26'],
    tags: ['自然拼读', '短元音', 'CVC单词']
  },
  {
    id: 'english.g1.vocab.greetings',
    subjectId: 'english',
    gradeLevel: 'g1_t1',
    unitNumber: 1,
    title: '日常问候与礼貌用语 (Hello, Goodbye, Thank you)',
    category: '情境交际',
    importance: 'core',
    description: '能够在真实场景中熟练运用日常英语问好、自我介绍及礼貌告别。',
    abilityDimension: 'language',
    tags: ['问候', '日常口语', '礼貌表达']
  },
  {
    id: 'english.g1.vocab.colors',
    subjectId: 'english',
    gradeLevel: 'g1_t1',
    unitNumber: 2,
    title: '常见颜色词汇表达 (Red, Blue, Yellow, Green, etc.)',
    category: '主题词汇',
    importance: 'core',
    description: '认识并听懂 8 种基础颜色单词，能用 "It is blue." 等简单句型描述周围事物。',
    abilityDimension: 'memory',
    tags: ['颜色', '生活词汇', '描述句型']
  },
  {
    id: 'english.g1.vocab.animals',
    subjectId: 'english',
    gradeLevel: 'g1_t1',
    unitNumber: 3,
    title: '常见小动物词汇 (Cat, Dog, Bear, Panda, Lion, Tiger)',
    category: '主题词汇',
    importance: 'core',
    description: '掌握农场和森林常见动物的英文发音与拼写，模仿动物叫声进行互动。',
    abilityDimension: 'memory',
    tags: ['动物', '趣味词汇']
  },
  {
    id: 'english.g2.vocab.family',
    subjectId: 'english',
    gradeLevel: 'g2_t1',
    unitNumber: 1,
    title: '家庭成员与人际称谓 (Father, Mother, Brother, Sister)',
    category: '主题词汇',
    importance: 'core',
    description: '熟练掌握家庭成员英文表达，能用 "This is my mother." 介绍家人。',
    abilityDimension: 'language',
    tags: ['家庭', '称谓', '介绍句型']
  },
  {
    id: 'english.g2.phonics.blends',
    subjectId: 'english',
    gradeLevel: 'g2_t1',
    unitNumber: 2,
    title: '辅音双拼与组合发音 (bl, cl, fl, gl, pl, sl, sh, ch, th)',
    category: '自然拼读',
    importance: 'core',
    description: '掌握辅音连缀和常见二合字母（sh, ch, th）的发音规则，提高见词能读能力。',
    abilityDimension: 'language',
    prerequisites: ['english.g1.phonics.short_vowels'],
    tags: ['辅音连缀', '自然拼读进阶']
  },
  {
    id: 'english.g1.vocab.numbers',
    subjectId: 'english',
    gradeLevel: 'g1_t2',
    unitNumber: 1,
    title: '1~10 数字英语 (one to ten)',
    category: '主题词汇',
    importance: 'core',
    description: '能听懂并说出 one 到 ten，会用 How many 询问数量。',
    abilityDimension: 'memory',
    tags: ['数字', '数数', 'How many']
  },
  {
    id: 'english.g2.vocab.weather',
    subjectId: 'english',
    gradeLevel: 'g2_t2',
    unitNumber: 1,
    title: '天气表达 (sunny, rainy, cloudy, windy)',
    category: '主题词汇',
    importance: 'core',
    description: '能用 It is sunny. 等句型描述天气，听懂简单天气预报。',
    abilityDimension: 'language',
    tags: ['天气', '日常口语']
  },
  {
    id: 'english.g2.vocab.clothes',
    subjectId: 'english',
    gradeLevel: 'g2_t2',
    unitNumber: 2,
    title: '服装词汇 (shirt, dress, shoes, hat)',
    category: '主题词汇',
    importance: 'core',
    description: '认识常见衣服单词，能用 Put on / Take off 进行简单指令。',
    abilityDimension: 'memory',
    tags: ['服装', '生活词汇']
  },
  {
    id: 'english.g3.vocab.school',
    subjectId: 'english',
    gradeLevel: 'g3_t1',
    unitNumber: 1,
    title: '校园生活 (school, friend, classroom)',
    category: '情境交际',
    importance: 'core',
    description: '能介绍自己的学校和朋友，使用 This is my friend. 等句型。',
    abilityDimension: 'language',
    tags: ['校园', '朋友', '介绍']
  },

  // =========================================================================
  // ♟️ 围棋学科知识点 (Go Knowledge Points)
  // =========================================================================
  {
    id: 'go.rules.liberties',
    subjectId: 'go',
    gradeLevel: 'g1_t1',
    unitNumber: 1,
    title: '棋子的“气”与交叉点直线连接',
    category: '基础规则',
    importance: 'core',
    description: '理解棋子只有通过横线和竖线直接相连的空交叉点才算作“气”，斜线不算气。',
    abilityDimension: 'spatial',
    tags: ['气的概念', '直线相连', '围棋第一课']
  },
  {
    id: 'go.rules.capture',
    subjectId: 'go',
    gradeLevel: 'g1_t1',
    unitNumber: 1,
    title: '提子规则（紧紧包围没气即可拿走）',
    category: '基础规则',
    importance: 'core',
    description: '当对方棋子的所有气都被堵住（气数归零）时，立即将死子提出棋盘。',
    abilityDimension: 'spatial',
    prerequisites: ['go.rules.liberties'],
    tags: ['提子', '吃子规则']
  },
  {
    id: 'go.tactics.atari',
    subjectId: 'go',
    gradeLevel: 'g1_t1',
    unitNumber: 2,
    title: '“叫吃”（打吃）与逃跑连接',
    category: '吃子技巧',
    importance: 'core',
    description: '识别只剩最后 1 口气的危险状态，学会主动叫吃对方与及时为己方长气逃跑。',
    abilityDimension: 'logical',
    prerequisites: ['go.rules.capture'],
    tags: ['叫吃', '打吃', '长气逃跑']
  },
  {
    id: 'go.tactics.connect_cut',
    subjectId: 'go',
    gradeLevel: 'g1_t1',
    unitNumber: 3,
    title: '连接与分断（虎口、断点与分头）',
    category: '行棋手筋',
    importance: 'core',
    description: '掌握“棋从断处生”的战略思想，保护己方断点，切断对方联络形成以多打少。',
    abilityDimension: 'spatial',
    tags: ['连接', '分断', '断点']
  },
  {
    id: 'go.life_death.two_eyes',
    subjectId: 'go',
    gradeLevel: 'g1_t2',
    unitNumber: 1,
    title: '两眼活棋与真假眼辨析',
    category: '死活基础',
    importance: 'core',
    description: '理解禁入点规则，掌握做成两只独立真眼实现绝对活棋的死活基本定理。',
    abilityDimension: 'logical',
    prerequisites: ['go.tactics.connect_cut'],
    tags: ['两眼活棋', '真眼假眼', '死活']
  },
  {
    id: 'go.tactics.snapback',
    subjectId: 'go',
    gradeLevel: 'g2_t1',
    unitNumber: 1,
    title: '倒扑手筋（弃子引诱反提多子）',
    category: '中级战术',
    importance: 'extended',
    description: '主动将一子送入对方虎口被吃，随即利用对方气紧反提对方整块大棋。',
    abilityDimension: 'logical',
    prerequisites: ['go.tactics.atari'],
    tags: ['倒扑', '弃子手筋']
  }
];

export function getKnowledgePointById(id: string): KnowledgePoint | undefined {
  return KNOWLEDGE_POINTS_REPOSITORY.find(kp => kp.id === id);
}

export function getKnowledgePointsBySubject(subjectId: SubjectId): KnowledgePoint[] {
  return KNOWLEDGE_POINTS_REPOSITORY.filter(kp => kp.subjectId === subjectId);
}

export function getKnowledgePointsByGrade(gradeLevel: GradeLevel): KnowledgePoint[] {
  return KNOWLEDGE_POINTS_REPOSITORY.filter(kp => kp.gradeLevel === gradeLevel);
}

export function searchKnowledgePoints(query: string, subjectId?: SubjectId): KnowledgePoint[] {
  const q = query.trim().toLowerCase();
  return KNOWLEDGE_POINTS_REPOSITORY.filter(kp => {
    if (subjectId && kp.subjectId !== subjectId) return false;
    if (!q) return true;
    return (
      kp.title.toLowerCase().includes(q) ||
      kp.description.toLowerCase().includes(q) ||
      kp.category.toLowerCase().includes(q) ||
      (kp.tags && kp.tags.some(t => t.toLowerCase().includes(q)))
    );
  });
}

