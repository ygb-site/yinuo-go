import type {
  SchoolStage,
  GradeLevel,
  SubjectId,
  ExamRegion,
  ExamType,
  ExamPaper,
  ExamQuestion
} from '../types/curriculum';

export interface StageInfo {
  id: SchoolStage;
  name: string;
  subtitle: string;
  icon: string;
  grades: GradeLevel[];
  badge: string;
  color: string;
}

export const SCHOOL_STAGES: StageInfo[] = [
  {
    id: 'primary',
    name: '小学部 (1-6年级)',
    subtitle: '习惯养成·思维筑基·双基启蒙',
    icon: '🎒',
    grades: ['g1_t1', 'g1_t2', 'g2_t1', 'g2_t2', 'g3_t1', 'g3_t2', 'g4_t1', 'g4_t2', 'g5_t1', 'g5_t2', 'g6_t1', 'g6_t2'],
    badge: '小学基础',
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: 'junior',
    name: '初中部 (7-9年级)',
    subtitle: '学科分化·逻辑严密·中考拔高',
    icon: '📐',
    grades: ['g7_t1', 'g7_t2', 'g8_t1', 'g8_t2', 'g9_t1', 'g9_t2'],
    badge: '初中攻坚',
    color: 'from-blue-600 to-indigo-600'
  },
  {
    id: 'senior',
    name: '高中部 (10-12年级)',
    subtitle: '新高考选科·衡水模拟·冲刺名校',
    icon: '🏛️',
    grades: ['g10_t1', 'g10_t2', 'g11_t1', 'g11_t2', 'g12_t1', 'g12_t2'],
    badge: '高考冲刺',
    color: 'from-purple-600 to-rose-600'
  }
];

export interface K12SubjectMeta {
  id: SubjectId;
  name: string;
  enName: string;
  icon: string;
  tag: string;
  color: string;
  bgGradient: string;
  stages: SchoolStage[];
  textbookVersions: { id: string; name: string; isDefault?: boolean }[];
  description: string;
}

export const K12_SUBJECTS: K12SubjectMeta[] = [
  {
    id: 'chinese',
    name: '语文',
    enName: 'Chinese',
    icon: '🏮',
    tag: '博雅素养',
    color: 'amber',
    bgGradient: 'from-amber-500 to-orange-500',
    stages: ['primary', 'junior', 'senior'],
    textbookVersions: [
      { id: 'renjiao', name: '统编版/部编版 (全国统一标准)', isDefault: true },
      { id: 'beijing', name: '北京课改版' },
      { id: 'jijiao', name: '冀教版 (河北)' }
    ],
    description: '生字笔画、拼音识字、阅读理解、古诗文默写与写作表达'
  },
  {
    id: 'math',
    name: '数学',
    enName: 'Mathematics',
    icon: '🔢',
    tag: '数理逻辑',
    color: 'blue',
    bgGradient: 'from-blue-500 to-cyan-500',
    stages: ['primary', 'junior', 'senior'],
    textbookVersions: [
      { id: 'renjiao', name: '人教版 (全国标准)', isDefault: true },
      { id: 'beijing', name: '北京课改版 (海淀/西城常用)' },
      { id: 'jijiao', name: '冀教版 (河北衡水常用)' },
      { id: 'beishida', name: '北师大版' },
      { id: 'sujiao', name: '苏教版' }
    ],
    description: '口算速算、几何图形、方程函数、数论逻辑与高难压轴变式'
  },
  {
    id: 'english',
    name: '英语',
    enName: 'English',
    icon: '🔤',
    tag: '国际视野',
    color: 'purple',
    bgGradient: 'from-purple-500 to-indigo-500',
    stages: ['primary', 'junior', 'senior'],
    textbookVersions: [
      { id: 'renjiao_pep', name: '人教PEP版 (三年级起点)', isDefault: true },
      { id: 'renjiao_sl', name: '人教精通版 (一年级起点)' },
      { id: 'beijing', name: '北京人教新起点版' },
      { id: 'jijiao', name: '冀教版 (河北)' },
      { id: 'waiyan', name: '外研社版' }
    ],
    description: 'Phonics自然拼读、核心词汇句型、语法时态、听力与阅读写作'
  },
  {
    id: 'physics',
    name: '物理',
    enName: 'Physics',
    icon: '⚡',
    tag: '格物致知',
    color: 'emerald',
    bgGradient: 'from-emerald-500 to-teal-500',
    stages: ['junior', 'senior'],
    textbookVersions: [
      { id: 'renjiao', name: '人教版 (全国统一)', isDefault: true },
      { id: 'beijing', name: '北京课改版' },
      { id: 'jijiao', name: '冀教版 (河北)' }
    ],
    description: '力热光电磁、实验探究、模型构建与衡水物理综合大题'
  },
  {
    id: 'chemistry',
    name: '化学',
    enName: 'Chemistry',
    icon: '🧪',
    tag: '微观转化',
    color: 'teal',
    bgGradient: 'from-teal-500 to-emerald-600',
    stages: ['junior', 'senior'],
    textbookVersions: [
      { id: 'renjiao', name: '人教版', isDefault: true },
      { id: 'jijiao', name: '冀教版' }
    ],
    description: '元素周期律、化学方程式配平、工业流程与实验探究'
  },
  {
    id: 'biology',
    name: '生物',
    enName: 'Biology',
    icon: '🧬',
    tag: '生命科学',
    color: 'green',
    bgGradient: 'from-green-500 to-emerald-500',
    stages: ['junior', 'senior'],
    textbookVersions: [
      { id: 'renjiao', name: '人教版', isDefault: true }
    ],
    description: '细胞遗传、生态系统、生理调节与图表遗传概率演算'
  },
  {
    id: 'history',
    name: '历史',
    enName: 'History',
    icon: '📜',
    tag: '古今贯通',
    color: 'rose',
    bgGradient: 'from-rose-500 to-pink-500',
    stages: ['junior', 'senior'],
    textbookVersions: [
      { id: 'renjiao', name: '统编人教版', isDefault: true }
    ],
    description: '中国古代史、近代史、世界史时空坐标与材料分析'
  },
  {
    id: 'geography',
    name: '地理',
    enName: 'Geography',
    icon: '🌏',
    tag: '经纬天地',
    color: 'cyan',
    bgGradient: 'from-cyan-500 to-blue-500',
    stages: ['junior', 'senior'],
    textbookVersions: [
      { id: 'renjiao', name: '人教版', isDefault: true }
    ],
    description: '等高线地形图、地球公转自转、区域自然地理与人文经济'
  },
  {
    id: 'ethics',
    name: '道德与法治',
    enName: 'Morality & Law',
    icon: '⚖️',
    tag: '法治品格',
    color: 'orange',
    bgGradient: 'from-orange-500 to-amber-500',
    stages: ['primary', 'junior'],
    textbookVersions: [
      { id: 'renjiao', name: '统编版', isDefault: true }
    ],
    description: '道德行为习惯、宪法法律常识、社会责任与思辨问答'
  },
  {
    id: 'science',
    name: '科学',
    enName: 'Science',
    icon: '🔭',
    tag: '科学探究',
    color: 'sky',
    bgGradient: 'from-sky-500 to-blue-500',
    stages: ['primary'],
    textbookVersions: [
      { id: 'renjiao', name: '教科版/人教版', isDefault: true }
    ],
    description: '植物动物探究、简单机械、天气与宇宙天文启蒙'
  }
];

export interface TextbookChapter {
  id: string;
  gradeLevel: GradeLevel;
  subjectId: SubjectId;
  unitName: string;
  lessonTitle: string;
  pageRange: string;
  coreKnowledge: string[];
}

export const SAMPLE_TEXTBOOK_CHAPTERS: TextbookChapter[] = [
  { id: 'm_g1_1', gradeLevel: 'g1_t1', subjectId: 'math', unitName: '第一单元 准备课', lessonTitle: '数一数与比多少', pageRange: '第2-8页', coreKnowledge: ['1-10数字认知', '同样多、多与少', '一一对应'] },
  { id: 'm_g1_2', gradeLevel: 'g1_t1', subjectId: 'math', unitName: '第二单元 位置', lessonTitle: '上下、前后、左右', pageRange: '第9-13页', coreKnowledge: ['方位判断', '空间相对性', '参照物认知'] },
  { id: 'm_g1_3', gradeLevel: 'g1_t1', subjectId: 'math', unitName: '第三单元 1~5的认识和加减法', lessonTitle: '5以内数的组成与加减', pageRange: '第14-31页', coreKnowledge: ['数的分解与组成', '加号减号含义', '0的认识与运算'] },
  { id: 'm_g1_4', gradeLevel: 'g1_t1', subjectId: 'math', unitName: '第四单元 认识图形(一)', lessonTitle: '长方体正方体圆柱球', pageRange: '第34-38页', coreKnowledge: ['立体图形特征', '滚与堆的性质', '实物分类'] },
  { id: 'm_g1_5', gradeLevel: 'g1_t1', subjectId: 'math', unitName: '第五单元 6~10的认识和加减法', lessonTitle: '10以内连加连减与混合', pageRange: '第39-71页', coreKnowledge: ['凑十准备', '一图四式', '连加连减运算顺序'] },
  { id: 'm_g1_6', gradeLevel: 'g1_t1', subjectId: 'math', unitName: '第六单元 11~20各数的认识', lessonTitle: '十位与个位及十几加几', pageRange: '第73-83页', coreKnowledge: ['计数单位一和十', '数位顺序表', '不进位加减法'] },
  { id: 'm_g1_7', gradeLevel: 'g1_t1', subjectId: 'math', unitName: '第七单元 认识钟表', lessonTitle: '读整时与半时', pageRange: '第84-87页', coreKnowledge: ['时针分针区分', '整时刻读法', '快到与刚过'] },
  { id: 'm_g1_8', gradeLevel: 'g1_t1', subjectId: 'math', unitName: '第八单元 20以内的进位加法', lessonTitle: '凑十法专项计算', pageRange: '第88-104页', coreKnowledge: ['9加几/8加几/7加几', '凑十法口诀', '解决图文应用题'] },

  { id: 'm_g1_2_1', gradeLevel: 'g1_t2', subjectId: 'math', unitName: '第一单元 认识图形(二)', lessonTitle: '平面图形的拼组', pageRange: '第2-7页', coreKnowledge: ['长方形正方形平行四边形', '七巧板拼图'] },
  { id: 'm_g1_2_2', gradeLevel: 'g1_t2', subjectId: 'math', unitName: '第二单元 20以内的退位减法', lessonTitle: '破十法与想加算减法', pageRange: '第8-26页', coreKnowledge: ['十几减9/8/7', '破十法拆解', '比多少应用题'] },
  { id: 'm_g1_2_3', gradeLevel: 'g1_t2', subjectId: 'math', unitName: '第五单元 认识人民币', lessonTitle: '元角分换算与简单计算', pageRange: '第52-60页', coreKnowledge: ['1元=10角=100分', '商品找零计算', '付钱策略'] },
  { id: 'm_g1_2_4', gradeLevel: 'g1_t2', subjectId: 'math', unitName: '第六单元 100以内的加法和减法(一)', lessonTitle: '两位数加减一位数与整十数', pageRange: '第61-84页', coreKnowledge: ['进位加法', '退位减法', '小括号的应用'] },

  { id: 'm_g2_1', gradeLevel: 'g2_t1', subjectId: 'math', unitName: '第二单元 100以内的加法和减法(二)', lessonTitle: '竖式进位加与退位减', pageRange: '第11-37页', coreKnowledge: ['笔算加减法竖式', '进位符号标法', '连加连减与加减混合'] },
  { id: 'm_g2_2', gradeLevel: 'g2_t1', subjectId: 'math', unitName: '第四单元 表内乘法(一)', lessonTitle: '乘法的初步认识与2-6口诀', pageRange: '第46-67页', coreKnowledge: ['乘法算式含义', '相同加数连加', '九九乘法表前半部分'] },

  { id: 'c_g1_1', gradeLevel: 'g1_t1', subjectId: 'chinese', unitName: '识字第一单元', lessonTitle: '天地人·金木水火土·口耳目', pageRange: '第6-11页', coreKnowledge: ['一、二、三、上、下等基础象形字', '田字格标准占位', '横竖撇捺基础笔画'] },
  { id: 'c_g1_2', gradeLevel: 'g1_t1', subjectId: 'chinese', unitName: '拼音第一单元', lessonTitle: '单韵母 a o e i u ü 与声调', pageRange: '第20-27页', coreKnowledge: ['四声调标号规则', '口型发音要领', '四线三格占位'] },
  { id: 'c_g1_3', gradeLevel: 'g1_t1', subjectId: 'chinese', unitName: '拼音第二单元', lessonTitle: '声母 b p m f d t n l g k h', pageRange: '第28-40页', coreKnowledge: ['声母发音', '两拼音节与三拼音节', '标调歌口诀'] },
  { id: 'c_g1_4', gradeLevel: 'g1_t1', subjectId: 'chinese', unitName: '课文第一单元', lessonTitle: '秋天·小小的船·江南', pageRange: '第54-61页', coreKnowledge: ['部编必背古诗《江南》', '叠词朗读', '拼音与汉字对照朗读'] },

  { id: 'e_g1_1', gradeLevel: 'g1_t1', subjectId: 'english', unitName: 'Unit 1 Hello!', lessonTitle: 'Greetings & 26 Letters Phonics (A-G)', pageRange: 'Page 4-13', coreKnowledge: ['Hello / Hi / Good morning', 'Letters A-G sounds', 'Apple, Bear, Cat, Dog'] },
  { id: 'e_g1_2', gradeLevel: 'g1_t1', subjectId: 'english', unitName: 'Unit 2 Colours', lessonTitle: 'Red, Yellow, Blue, Green & Phonics (H-N)', pageRange: 'Page 14-23', coreKnowledge: ['Color words', 'I see red.', 'Hat, Ice, Juice, Kite'] },

  { id: 'm_g7_1', gradeLevel: 'g7_t1', subjectId: 'math', unitName: '第一章 有理数', lessonTitle: '正数负数、数轴、相反数与绝对值', pageRange: '第1-28页', coreKnowledge: ['有理数分类', '数轴三要素', '绝对值的代数与几何意义', '有理数四则混合运算'] },
  { id: 'm_g7_2', gradeLevel: 'g7_t1', subjectId: 'math', unitName: '第二章 整式的加减', lessonTitle: '单项式多项式与同类项合并', pageRange: '第53-76页', coreKnowledge: ['系数与次数', '同类项概念', '去括号法则与整式化简'] },

  { id: 'm_g10_1', gradeLevel: 'g10_t1', subjectId: 'math', unitName: '第一章 集合与常用逻辑用语', lessonTitle: '集合运算与充分必要条件', pageRange: '第1-32页', coreKnowledge: ['交并补运算', '命题否定', '充要条件证明'] },
  { id: 'm_g10_2', gradeLevel: 'g10_t1', subjectId: 'math', unitName: '第三章 函数的概念与性质', lessonTitle: '单调性、奇偶性与函数模型', pageRange: '第60-95页', coreKnowledge: ['定义域与值域', '单调性证明', '奇偶性判定与对称性'] }
];

export function generateExamPaper(options: {
  stage: SchoolStage;
  gradeLevel: GradeLevel;
  subjectId: SubjectId;
  examType: ExamType;
  region: ExamRegion;
  questionCount?: number;
}): ExamPaper {
  const { stage, gradeLevel, subjectId, examType, region, questionCount = 20 } = options;
  
  const examTypeTitles: Record<ExamType, string> = {
    weekly: '第4周 阶段过关强化卷',
    monthly: '月度知识综合质量检测卷',
    midterm: '第一学期 期中教学质量检测全真试卷',
    final: '学年第一学期 期末统一素养评估试卷'
  };

  const gradeLabel = gradeLevel.includes('g1') ? '一年级' : gradeLevel.includes('g7') ? '初一' : gradeLevel.includes('g10') ? '高一' : '年级';
  const subjectLabel = K12_SUBJECTS.find(s => s.id === subjectId)?.name || '学科';
  
  const regionPrefix = region === 'beijing' ? '【北京名校教研组】' : '【河北衡水名校联考】';

  const title = regionPrefix + ' ' + gradeLabel + subjectLabel + ' ' + examTypeTitles[examType];
  const paperCode = 'EXAM-' + region.toUpperCase() + '-' + gradeLevel.toUpperCase() + '-' + Date.now().toString().slice(-6);

  const questions: ExamQuestion[] = buildQuestionsForExam(stage, gradeLevel, subjectId, region, examType, questionCount);
  const totalScore = questions.reduce((acc, q) => acc + q.score, 0);
  const durationMinutes = stage === 'primary' ? 45 : stage === 'junior' ? 90 : 120;

  return {
    id: 'paper_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    title,
    stage,
    gradeLevel,
    subjectId,
    examType,
    region,
    durationMinutes,
    totalScore,
    questions,
    createdAt: Date.now(),
    paperCode,
    summary: region === 'beijing'
      ? '注重生活情境化阅读、多维度逻辑推导与创新表达，考查学生学科综合素养。'
      : '强调基础公式定理滚瓜烂熟、计算严谨规范、题型变式多、大题步骤分要求极高。'
  };
}

function buildQuestionsForExam(
  _stage: SchoolStage,
  gradeLevel: GradeLevel,
  subjectId: SubjectId,
  region: ExamRegion,
  _examType: ExamType,
  _count: number
): ExamQuestion[] {
  const list: ExamQuestion[] = [];

  if (subjectId === 'math' && (gradeLevel === 'g1_t1' || gradeLevel === 'g1_t2')) {
    if (region === 'hengshui') {
      list.push(
        {
          id: 'q_hs_1',
          type: 'calculation',
          prompt: '【计算神速】请在3分钟内写出下列各式结果：9 + 4 = (   )，15 - 7 = (   )，8 + 6 - 5 = (   )。',
          correctAnswer: '13, 8, 9',
          score: 10,
          knowledgePoint: '20以内进位加退位减与连加连减',
          difficulty: 3,
          regionFlavor: 'hengshui',
          explanation: '9+4用凑十法拆4为1和3得到13；15-7破十法10-7=3, 3+5=8；8+6-5依次计算8+6=14, 14-5=9。',
          stepGuide: ['步骤1: 9+4=13', '步骤2: 15-7=8', '步骤3: 8+6-5=9']
        },
        {
          id: 'q_hs_2',
          type: 'fill_blank',
          prompt: '【衡水严谨填空】比 13 大且比 18 小的单数（奇数）有 (       ) 和 (       )。',
          correctAnswer: '15, 17',
          score: 10,
          knowledgePoint: '20以内数的顺序与奇偶数认知',
          difficulty: 4,
          regionFlavor: 'hengshui',
          explanation: '13与18之间的数有14, 15, 16, 17，其中单数（不能被2整除）是15和17。',
          stepGuide: ['列举区间内的所有整数: 14, 15, 16, 17', '筛选单数: 15, 17']
        },
        {
          id: 'q_hs_3',
          type: 'solution',
          prompt: '【衡水经典排队大题】操场排队做操，小明从前往后数排第 7，从后往前数排第 9，这队一共有多少名小朋友？（列算式并作答）',
          correctAnswer: '7 + 9 - 1 = 15(人)',
          score: 15,
          knowledgePoint: '重叠排队问题 (基数与序数)',
          difficulty: 4,
          regionFlavor: 'hengshui',
          explanation: '小明在数数时被重复计算了两次，所以总人数 = 从前往后数 + 从后往前数 - 1，即 7 + 9 - 1 = 15 人。',
          stepGuide: ['从前往后数包含小明共7人', '从后往前数包含小明共9人', '小明数了两次，减去1: 7 + 9 - 1 = 15人']
        },
        {
          id: 'q_hs_4',
          type: 'single_choice',
          prompt: '【易错变式】小红有 8 支铅笔，小华有 14 支铅笔，小华给小红 (   ) 支后，两人的铅笔一样多？',
          options: ['A. 6支', 'B. 3支', 'C. 4支', 'D. 2支'],
          correctAnswer: 'B. 3支',
          score: 15,
          knowledgePoint: '移多补少思维',
          difficulty: 5,
          regionFlavor: 'hengshui',
          explanation: '小华比小红多 14 - 8 = 6 支。将相差的6支平均分成2份，每份是3支，所以小华给小红3支后两人都是11支。',
          stepGuide: ['求差: 14 - 8 = 6支', '移多补少: 6 ÷ 2 = 3支']
        }
      );
    } else {
      list.push(
        {
          id: 'q_bj_1',
          type: 'single_choice',
          prompt: '【北京动物园情境】周末小明去北京动物园看熊猫，熊猫馆上午接待了 8 组家庭，下午接待的家庭比上午多 5 组。下午接待了多少组家庭？',
          options: ['A. 3 组', 'B. 12 组', 'C. 13 组', 'D. 14 组'],
          correctAnswer: 'C. 13 组',
          score: 10,
          knowledgePoint: '比多比少加法情境应用',
          difficulty: 2,
          regionFlavor: 'beijing',
          explanation: '下午比上午多5组，即用上午的8组加上多的5组：8 + 5 = 13 组。'
        },
        {
          id: 'q_bj_2',
          type: 'solution',
          prompt: '【图形思维探究】用同样长的小木棒拼正方形，拼 1 个独立的正方形需要 4 根小棒。如果要像一列小火车一样紧挨着拼出 3 个相连的正方形，最少需要几根小棒？请写出你的思考过程。',
          correctAnswer: '10 根 (4 + 3 + 3 = 10)',
          score: 15,
          knowledgePoint: '空间几何规律与共用边探究',
          difficulty: 4,
          regionFlavor: 'beijing',
          explanation: '拼第1个正方形需要4根，后面每增加1个正方形只需共用1根边，额外添3根。因此 4 + 3 + 3 = 10 根。'
        },
        {
          id: 'q_bj_3',
          type: 'fill_blank',
          prompt: '【钟表生活观察】晚上爸爸下班回家，钟面上的时针刚走过 6，分针正指在 6 上，这时是晚上 (      ) 点 (      ) 分。',
          correctAnswer: '6 点 30 分 (或六点半)',
          score: 10,
          knowledgePoint: '钟表的认识 (半时认读)',
          difficulty: 3,
          regionFlavor: 'beijing',
          explanation: '分针指向6表示30分（半小时），时针在6和7之间刚过6，所以是6点30分。'
        }
      );
    }
  } else if (subjectId === 'chinese') {
    list.push(
      {
        id: 'q_c_1',
        type: 'fill_blank',
        prompt: '【生字笔顺与笔画】“火”字的笔顺规则是先中间后两边，它的第二笔是 (       )，全字共 (       ) 画。',
        correctAnswer: '撇 (丿), 4',
        score: 10,
        knowledgePoint: '部编版生字笔顺与笔画认知',
        difficulty: 2,
        regionFlavor: region,
        explanation: '“火”字的笔顺是：点(丶)、撇(丿)、撇(丿)、捺(乀)，共4画。'
      },
      {
        id: 'q_c_2',
        type: 'single_choice',
        prompt: '【声调标号口诀】请选出下列音节拼写与标调完全正确的一项：',
        options: ['A. xué (学)', 'B. xüé', 'C. liù (标在i上)', 'D. qùe'],
        correctAnswer: 'A. xué (学)',
        score: 10,
        knowledgePoint: '汉语拼音小ü见j q x省两点规律与标调法则',
        difficulty: 3,
        regionFlavor: region,
        explanation: 'j q x y 与 ü 相拼时 ü 上两点要省略，所以写成 xué。有 a 先找 a，没 a 找 o e，i u 并列标在后。'
      },
      {
        id: 'q_c_3',
        type: 'solution',
        prompt: '【古诗默写】请补全古诗《江南》：“江南可采莲，莲叶何田田。鱼戏莲叶间。鱼戏莲叶(     )，鱼戏莲叶(     )，鱼戏莲叶(     )，鱼戏莲叶(     )。”',
        correctAnswer: '东、西、南、北',
        score: 15,
        knowledgePoint: '部编版一年级必背古诗词默写',
        difficulty: 2,
        regionFlavor: region,
        explanation: '《汉乐府·江南》：鱼戏莲叶东，鱼戏莲叶西，鱼戏莲叶南，鱼戏莲叶北。'
      }
    );
  } else if (subjectId === 'english') {
    list.push(
      {
        id: 'q_e_1',
        type: 'single_choice',
        prompt: '【Phonics 自然拼读】选出划线字母发音与其他三个不同的一项：',
        options: ['A. c<u>a</u>t', 'B. <u>a</u>pple', 'C. b<u>a</u>g', 'D. b<u>a</u>by'],
        correctAnswer: 'D. baby',
        score: 10,
        knowledgePoint: '字母 a 在闭音节中发 /æ/ 与开音节中发 /eɪ/',
        difficulty: 3,
        regionFlavor: region,
        explanation: 'cat, apple, bag 中字母 a 发短元音 /æ/；baby 中 a 处于开音节发 /eɪ/。'
      },
      {
        id: 'q_e_2',
        type: 'fill_blank',
        prompt: '【日常交际】当你早上在校门口遇到老师时，你应该礼貌地说：“Good (          ), Miss Li!”',
        correctAnswer: 'morning',
        score: 10,
        knowledgePoint: '日常问候用语',
        difficulty: 2,
        regionFlavor: region,
        explanation: '早晨问好使用 Good morning，下午使用 Good afternoon。'
      }
    );
  } else {
    list.push(
      {
        id: 'q_gen_1',
        type: 'single_choice',
        prompt: '【' + (region === 'hengshui' ? '衡水名校联考核心考点' : '北京综合素养新题型') + '】关于当前学科核心概念，下列说法完全正确的是：',
        options: ['A. 遵循基本物理/数学定理且条件完备', 'B. 概念混淆且忽略了反例', 'C. 计算忽略了单位换算', 'D. 逻辑推导存在自相矛盾'],
        correctAnswer: 'A. 遵循基本物理/数学定理且条件完备',
        score: 10,
        knowledgePoint: '核心定理与严谨逻辑',
        difficulty: 3,
        regionFlavor: region,
        explanation: '考查学科基本功与推导规范。'
      }
    );
  }

  return list;
}

export function generateHomeworkSmartQuiz(
  subjectId: SubjectId,
  _gradeLevel: GradeLevel,
  _homeworkText: string,
  pageRange: string
): ExamQuestion[] {
  const quizzes: ExamQuestion[] = [];
  const seed = Date.now();

  if (subjectId === 'math') {
    quizzes.push(
      {
        id: 'hw_quiz_' + seed + '_1',
        type: 'calculation',
        prompt: '【巩固举一反三·变式题 1】根据今日作业（' + (pageRange || '随堂要点') + '），计算：8 + ( 15 - 9 ) = (   )',
        correctAnswer: '14',
        score: 10,
        knowledgePoint: '含括号的加减混合运算',
        difficulty: 2,
        regionFlavor: 'hengshui',
        explanation: '先算括号里面的 15 - 9 = 6，再算 8 + 6 = 14。'
      },
      {
        id: 'hw_quiz_' + seed + '_2',
        type: 'solution',
        prompt: '【巩固举一反三·应用拓展 2】书架上有 17 本故事书，借走一些后还剩 8 本，借走了多少本故事书？（列式计算）',
        correctAnswer: '17 - 8 = 9 (本)',
        score: 15,
        knowledgePoint: '减法解决实际问题',
        difficulty: 3,
        regionFlavor: 'beijing',
        explanation: '原有数量 - 剩下数量 = 借走数量，17 - 8 = 9 本。'
      },
      {
        id: 'hw_quiz_' + seed + '_3',
        type: 'fill_blank',
        prompt: '【易错避坑 3】在 ○ 里填上“>”、“<”或“=”：9 + 7 ○ 17 - 2，14 - 6 ○ 8 + 0',
        correctAnswer: '>, =',
        score: 10,
        knowledgePoint: '算式大小比较',
        difficulty: 3,
        regionFlavor: 'hengshui',
        explanation: '9+7=16, 17-2=15, 16>15；14-6=8, 8+0=8, 8=8。'
      }
    );
  } else if (subjectId === 'chinese') {
    quizzes.push(
      {
        id: 'hw_quiz_' + seed + '_1',
        type: 'fill_blank',
        prompt: '【生字演练】写出今日作业重点生字的拼音与笔画：“禾”字的拼音是 (       )，第四笔是 (       )。',
        correctAnswer: 'hé, 撇 (丿)',
        score: 10,
        knowledgePoint: '生字音形义',
        difficulty: 2,
        regionFlavor: 'beijing',
        explanation: '禾 (hé)，笔顺：撇(丿)、横(一)、竖(丨)、撇(丿)、捺(乀)，共5画。'
      },
      {
        id: 'hw_quiz_' + seed + '_2',
        type: 'single_choice',
        prompt: '【组词辨析】选出下列词语搭配完全恰当的一项：',
        options: ['A. 一只树木', 'B. 一座高山', 'C. 一条小鸟', 'D. 一本小鱼'],
        correctAnswer: 'B. 一座高山',
        score: 10,
        knowledgePoint: '量词正确搭配',
        difficulty: 2,
        regionFlavor: 'beijing',
        explanation: '山一般用“座”，树木用“棵”，小鸟和小鱼用“只/条”。'
      }
    );
  } else if (subjectId === 'english') {
    quizzes.push(
      {
        id: 'hw_quiz_' + seed + '_1',
        type: 'single_choice',
        prompt: '【Phonics 变式】选出与单词 "cat" 中元音发音相同的单词：',
        options: ['A. hat', 'B. cake', 'C. name', 'D. car'],
        correctAnswer: 'A. hat',
        score: 10,
        knowledgePoint: 'Short vowel /æ/ sound',
        difficulty: 2,
        regionFlavor: 'beijing',
        explanation: 'cat 和 hat 中的 a 都发短元音 /æ/。'
      }
    );
  } else {
    quizzes.push(
      {
        id: 'hw_quiz_' + seed + '_1',
        type: 'fill_blank',
        prompt: '【知识点自测】请简要写出今天所学核心概念的定义或关键公式：(               )',
        correctAnswer: '参考课本定义',
        score: 10,
        knowledgePoint: '课堂核心概念默写',
        difficulty: 2,
        regionFlavor: 'hengshui',
        explanation: '强化课堂基础知识点记忆。'
      }
    );
  }

  return quizzes;
}
