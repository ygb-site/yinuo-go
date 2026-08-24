import type { StoneColor, Point, BoardSize } from '../engine/types';

export type SchoolStage = 'primary' | 'junior' | 'senior';

export type CoreSubjectId = 'go' | 'math' | 'chinese' | 'english';

export type SubjectId =
  | CoreSubjectId
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'history'
  | 'geography'
  | 'politics'
  | 'ethics'
  | 'science';

export type GradeLevel =
  | 'g1_t1' | 'g1_t2'
  | 'g2_t1' | 'g2_t2'
  | 'g3_t1' | 'g3_t2'
  | 'g4_t1' | 'g4_t2'
  | 'g5_t1' | 'g5_t2'
  | 'g6_t1' | 'g6_t2'
  | 'g7_t1' | 'g7_t2'
  | 'g8_t1' | 'g8_t2'
  | 'g9_t1' | 'g9_t2'
  | 'g10_t1' | 'g10_t2'
  | 'g11_t1' | 'g11_t2'
  | 'g12_t1' | 'g12_t2';

export interface GradeMeta {
  id: GradeLevel;
  stage: SchoolStage;
  name: string;
  shortName: string;
  subtitle: string;
  badge: string;
  defaultSubjects: SubjectId[];
}

export const GRADE_LEVELS: GradeMeta[] = [
  // 🏫 小学阶段 (Primary 1-6)
  { id: 'g1_t1', stage: 'primary', name: '一年级上册', shortName: '一上', subtitle: '幼小衔接·基础基石', badge: '基础基石', defaultSubjects: ['chinese', 'math', 'english', 'ethics'] },
  { id: 'g1_t2', stage: 'primary', name: '一年级下册', shortName: '一下', subtitle: '进阶巩固·思维初启', badge: '进阶巩固', defaultSubjects: ['chinese', 'math', 'english', 'ethics'] },
  { id: 'g2_t1', stage: 'primary', name: '二年级上册', shortName: '二上', subtitle: '乘法启蒙·素养培优', badge: '思维培优', defaultSubjects: ['chinese', 'math', 'english', 'ethics'] },
  { id: 'g2_t2', stage: 'primary', name: '二年级下册', shortName: '二下', subtitle: '有余除法·综合跃升', badge: '综合飞跃', defaultSubjects: ['chinese', 'math', 'english', 'ethics'] },
  { id: 'g3_t1', stage: 'primary', name: '三年级上册', shortName: '三上', subtitle: '分水岭突破·概念深化', badge: '核心拓展', defaultSubjects: ['chinese', 'math', 'english', 'science'] },
  { id: 'g3_t2', stage: 'primary', name: '三年级下册', shortName: '三下', subtitle: '面积小数·逻辑建构', badge: '逻辑跃升', defaultSubjects: ['chinese', 'math', 'english', 'science'] },
  { id: 'g4_t1', stage: 'primary', name: '四年级上册', shortName: '四上', subtitle: '大数运算·系统思维', badge: '高阶进阶', defaultSubjects: ['chinese', 'math', 'english', 'science'] },
  { id: 'g4_t2', stage: 'primary', name: '四年级下册', shortName: '四下', subtitle: '简便计算·模型探索', badge: '建模探索', defaultSubjects: ['chinese', 'math', 'english', 'science'] },
  { id: 'g5_t1', stage: 'primary', name: '五年级上册', shortName: '五上', subtitle: '小数因倍·抽象综合', badge: '综合素养', defaultSubjects: ['chinese', 'math', 'english', 'science'] },
  { id: 'g5_t2', stage: 'primary', name: '五年级下册', shortName: '五下', subtitle: '分数字母·深度探究', badge: '深度探究', defaultSubjects: ['chinese', 'math', 'english', 'science'] },
  { id: 'g6_t1', stage: 'primary', name: '六年级上册', shortName: '六上', subtitle: '分数乘除·小升初冲刺', badge: '冲刺培优', defaultSubjects: ['chinese', 'math', 'english', 'science'] },
  { id: 'g6_t2', stage: 'primary', name: '六年级下册', shortName: '六下', subtitle: '负数比例·初小衔接', badge: '初小衔接', defaultSubjects: ['chinese', 'math', 'english', 'science'] },

  // 🎓 初中阶段 (Junior 7-9)
  { id: 'g7_t1', stage: 'junior', name: '初一上册(七年级)', shortName: '初一上', subtitle: '有理数整式·初中启程', badge: '初中起航', defaultSubjects: ['chinese', 'math', 'english', 'ethics', 'history', 'geography', 'biology'] },
  { id: 'g7_t2', stage: 'junior', name: '初一下册(七年级)', shortName: '初一下', subtitle: '相交线方程·体系形成', badge: '初阶深化', defaultSubjects: ['chinese', 'math', 'english', 'ethics', 'history', 'geography', 'biology'] },
  { id: 'g8_t1', stage: 'junior', name: '初二上册(八年级)', shortName: '初二上', subtitle: '几何全等·初二物理登场', badge: '物理启蒙', defaultSubjects: ['chinese', 'math', 'english', 'physics', 'history', 'geography', 'biology'] },
  { id: 'g8_t2', stage: 'junior', name: '初二下册(八年级)', shortName: '初二下', subtitle: '函数勾股·地生中考会考', badge: '地生会考', defaultSubjects: ['chinese', 'math', 'english', 'physics', 'history', 'geography', 'biology'] },
  { id: 'g9_t1', stage: 'junior', name: '初三上册(九年级)', shortName: '初三上', subtitle: '一元二次·初三化学登场', badge: '化学开启', defaultSubjects: ['chinese', 'math', 'english', 'physics', 'chemistry', 'ethics', 'history'] },
  { id: 'g9_t2', stage: 'junior', name: '初三下册(九年级)', shortName: '初三下', subtitle: '中考总复习·衡水中考真题', badge: '中考冲刺', defaultSubjects: ['chinese', 'math', 'english', 'physics', 'chemistry', 'ethics', 'history'] },

  // 🏛️ 高中阶段 (Senior 10-12)
  { id: 'g10_t1', stage: 'senior', name: '高一上册(必修一)', shortName: '高一上', subtitle: '集合函数·高中基础筑基', badge: '高一筑基', defaultSubjects: ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology'] },
  { id: 'g10_t2', stage: 'senior', name: '高一下册(必修二)', shortName: '高一下', subtitle: '三角函数向量·新高考选科', badge: '选科定位', defaultSubjects: ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology'] },
  { id: 'g11_t1', stage: 'senior', name: '高二上册(选必一)', shortName: '高二上', subtitle: '圆锥曲线导数·深度拔高', badge: '重点突破', defaultSubjects: ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology'] },
  { id: 'g11_t2', stage: 'senior', name: '高二下册(选必二)', shortName: '高二下', subtitle: '数列立体几何·一轮前哨', badge: '高阶攻坚', defaultSubjects: ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology'] },
  { id: 'g12_t1', stage: 'senior', name: '高三上册(一轮总复习)', shortName: '高三一轮', subtitle: '全科地毯式扫雷·衡水百校模考', badge: '一轮复习', defaultSubjects: ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology'] },
  { id: 'g12_t2', stage: 'senior', name: '高三下册(高考全真冲刺)', shortName: '高三冲刺', subtitle: '北京卷/衡水模拟·终极压轴', badge: '高考冲刺', defaultSubjects: ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology'] }
];

export type ExamRegion = 'beijing' | 'hengshui';
export type ExamType = 'weekly' | 'monthly' | 'midterm' | 'final';

export interface ExamQuestion {
  id: string;
  type: 'single_choice' | 'fill_blank' | 'calculation' | 'solution';
  prompt: string;
  options?: string[];
  correctAnswer: string;
  score: number;
  knowledgePoint: string;
  difficulty: number; // 1-5
  regionFlavor: ExamRegion;
  explanation: string;
  stepGuide?: string[];
  userAnswer?: string;
  isCorrect?: boolean;
  awardedScore?: number;
}

export interface ExamPaper {
  id: string;
  title: string;
  stage: SchoolStage;
  gradeLevel: GradeLevel;
  subjectId: SubjectId;
  examType: ExamType;
  region: ExamRegion;
  durationMinutes: number;
  totalScore: number;
  questions: ExamQuestion[];
  createdAt: number;
  paperCode: string;
  summary: string;
}

export interface HomeworkEntry {
  id: string;
  createdAt: number;
  dateStr: string;
  stage: SchoolStage;
  gradeLevel: GradeLevel;
  subjectId: SubjectId;
  textbookVersion: string;
  chapterTitle: string;
  pageRange: string;
  homeworkContent: string;
  imageUrl?: string;
  keyKnowledgePoints: string[];
  generatedQuiz: ExamQuestion[];
  quizCompleted: boolean;
  quizScore?: number;
}

export interface SubjectMeta {
  id: SubjectId;
  name: string;
  subName: string;
  title: string;
  slogan: string;
  icon: string;
  badge: string;
  themeColor: string;
  bgGradient: string;
  accentColor: string;
  borderColor: string;
  mascotGreeting: string;
  ageRange: string;
  features: {
    title: string;
    desc: string;
    icon: string;
    route: string;
    isReady: boolean;
  }[];
}

export type QuestionType =
  | 'go_board'
  | 'single_choice'
  | 'multi_choice'
  | 'drag_match'
  | 'fill_blank'
  | 'ordering'
  | 'hanzi_canvas'
  | 'math_counter'
  | 'audio_identify'
  | 'math_formula'
  | 'formula';

export interface BaseQuestionStep {
  id: string;
  type: QuestionType;
  title: string;
  subtitle?: string;
  promptText: string;
  promptVoice?: string;
  dialogues?: string[];
  hint: string;
  explanation: string;
  knowledgePointId?: string;
  difficulty?: number; // 1-5
  abilityDimension?: 'spatial' | 'logical' | 'calculation' | 'language' | 'concentration' | 'memory';
  gradeLevel?: GradeLevel;
  subjectId?: SubjectId;
  unitNumber?: number;
}

// 1. Single/Multi Choice Step
export interface ChoiceOption {
  id: string;
  text: string;
  subText?: string;
  pinyin?: string;
  latex?: string;
  imageUrl?: string;
  audioText?: string;
  badge?: string;
}

export interface ChoiceQuestionStep extends BaseQuestionStep {
  type: 'single_choice' | 'multi_choice';
  options: ChoiceOption[];
  correctOptionIds: string[];
  visualContent?: {
    type: 'image' | 'math_formula' | 'hanzi' | 'pinyin' | 'english_word';
    content: string;
    subContent?: string;
  };
}

// 2. Drag & Match / Pairing Step
export interface MatchPair {
  id: string;
  left: { text: string; sub?: string; icon?: string; latex?: string };
  right: { text: string; sub?: string; icon?: string; latex?: string };
}

export interface DragMatchQuestionStep extends BaseQuestionStep {
  type: 'drag_match';
  pairs: MatchPair[];
}

// 3. Fill Blank / Keypad Step
export interface FillBlankQuestionStep extends BaseQuestionStep {
  type: 'fill_blank';
  template: string;
  correctAnswers: string[];
  optionsPool?: string[];
  keypadType?: 'number' | 'alphabet' | 'pinyin' | 'formula';
  displayLatex?: string;
}

// 4. Ordering Step
export interface OrderItem {
  id: string;
  text: string;
  sub?: string;
  latex?: string;
}

export interface OrderingQuestionStep extends BaseQuestionStep {
  type: 'ordering';
  items: OrderItem[];
  correctOrder: string[];
}

// 5. Hanzi Stroke / Character Step
export interface HanziQuestionStep extends BaseQuestionStep {
  type: 'hanzi_canvas';
  char: string;
  pinyin: string;
  meaning: string;
  radical: string;
  strokeCount: number;
  words: string[];
  strokes?: string[];
  sampleSentence?: string;
}

// 6. Math Counter / Balance Step
export interface MathCounterQuestionStep extends BaseQuestionStep {
  type: 'math_counter';
  mode: 'ten_frame' | 'fruit_count' | 'balance_scale' | 'number_line';
  initialCount?: number;
  targetCount: number;
  itemIcon: string;
  questionText: string;
}

// 7. Go Board Step
export interface PuzzleNode {
  coord: Point;
  comment: string;
  isCorrect: boolean;
  opponentResponse?: {
    coord: Point;
    comment: string;
  } | null;
  nextBranches?: PuzzleNode[];
}

export interface GoBoardQuestionStep extends BaseQuestionStep {
  type: 'go_board';
  boardSize: BoardSize;
  initialStones: { r: number; c: number; color: StoneColor }[];
  playerColor: StoneColor;
  targetHighlight?: Point[];
  puzzleRoot?: PuzzleNode[];
  stepIndex?: number;
  goalText?: string;
  goalTextEn?: string;
}

// 8. Math Formula Step
export interface FormulaQuestionStep extends BaseQuestionStep {
  type: 'math_formula' | 'formula';
  latex: string;
  questionText?: string;
  interactiveType?: 'choice' | 'fill_blank' | 'evaluate';
  options?: ChoiceOption[];
  correctAnswer?: string;
  correctOptionIds?: string[];
  subFormula?: string;
}

export type UniversalQuestionStep =
  | ChoiceQuestionStep
  | DragMatchQuestionStep
  | FillBlankQuestionStep
  | OrderingQuestionStep
  | HanziQuestionStep
  | MathCounterQuestionStep
  | GoBoardQuestionStep
  | FormulaQuestionStep;

// Unified Lesson Structure
export interface UniversalLesson {
  id: string;
  subjectId: SubjectId;
  gradeLevel?: GradeLevel;
  chapterId: number;
  chapterTitle: string;
  chapterIcon: string;
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  summary: string;
  knowledgePointId?: string;
  starsRequiredToUnlock?: number;
  rewards: {
    stars: number;
    coins: number;
    exp: number;
  };
  steps: UniversalQuestionStep[];
}

// Unified Chapter Structure
export interface UniversalChapter {
  id: number;
  subjectId: SubjectId;
  gradeLevel?: GradeLevel;
  unitNumber?: number;
  title: string;
  subtitle: string;
  icon: string;
  themeGradient: string;
  description: string;
  badge: string;
  lessons: UniversalLesson[];
}

// =========================================================================
// 🧠 知识点与能力画像体系 (Knowledge Points & Competencies)
// =========================================================================
export interface KnowledgePoint {
  id: string;
  subjectId: SubjectId;
  gradeLevel: GradeLevel;
  unitNumber?: number;
  title: string;
  category: string;
  importance: 'core' | 'extended' | 'challenge';
  description: string;
  abilityDimension: 'spatial' | 'logical' | 'calculation' | 'language' | 'concentration' | 'memory';
  prerequisites?: string[];
  tags?: string[];
}

export interface AbilityDimension {
  id: string;
  name: string;
  code: 'spatial' | 'logical' | 'calculation' | 'language' | 'concentration' | 'memory';
  score: number; // 0-100
}

export interface KnowledgeMasteryRecord {
  knowledgePointId: string;
  totalCount: number;
  correctCount: number;
  wrongCount: number;
  masteryRate: number; // 0.0 ~ 1.0
  lastPracticedAt: number;
  streak: number;
}

export interface StudentLearningProfile {
  studentId: string;
  nickname: string;
  gradeLevel: GradeLevel;
  totalStudyMinutes: number;
  totalQuestionsAnswered: number;
  accuracy: number;
  streak: number;
  knowledgeMastery: Record<string, KnowledgeMasteryRecord>;
  abilityDimensions: Record<'spatial' | 'logical' | 'calculation' | 'language' | 'concentration' | 'memory', number>;
  subjectMastery: Partial<Record<SubjectId, number>>;
  recentMistakes: MistakeRecord[];
  weakKnowledgePoints: KnowledgePoint[];
  masteredKnowledgePoints: KnowledgePoint[];
  updatedAt: number;
}

// =========================================================================
// 🔤 英语词汇与语音模型 (English Vocabulary & Speech)
// =========================================================================
export type PartOfSpeech =
  | 'n.'
  | 'v.'
  | 'adj.'
  | 'adv.'
  | 'prep.'
  | 'pron.'
  | 'conj.'
  | 'num.'
  | 'interj.'
  | 'phrase';

export interface VocabularyItem {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  partOfSpeech: PartOfSpeech;
  grade: GradeLevel;
  unit: number;
  category: string;
  phonicsRule?: string;
  exampleEn: string;
  exampleCn: string;
  synonyms?: string[];
  antonyms?: string[];
  icon?: string;
  audioUrl?: string;
  knowledgePointId?: string;
  difficulty?: number;
}

// =========================================================================
// 📕 全学科通用错题记录模型 (Unified Multi-Subject Mistake Model)
// =========================================================================
export type ErrorCategory = 'calculation' | 'concept' | 'reading' | 'spelling' | 'rule' | 'careless';

export interface MistakeRecord {
  id: string;
  studentId?: string;
  subjectId: SubjectId;
  gradeLevel?: GradeLevel;
  topic: string;
  questionId?: string;
  knowledgePointId?: string;
  knowledgePointTitle: string;
  questionPrompt: string;
  userAnswer: string;
  correctAnswer: string;
  wrongAnswer?: string;
  wrongCount?: number;
  lastWrongAt?: number;
  mastery?: number;
  difficulty?: number;
  errorCategory: ErrorCategory;
  errorReason: string;
  createdAt: number;
  resolved: boolean;
  resolvedAt?: number;
  hintsRevealed?: number; // 0, 1, 2, 3
  stepHints?: string[];
  aiExplanation?: string;
  questionType?: QuestionType | string;
  options?: ChoiceOption[] | string[];
  template?: string;
  latex?: string;
  visualContent?: any;
  audioText?: string;
  variationQuestion?: {
    prompt: string;
    options?: ChoiceOption[];
    correctAnswer: string;
    hint: string;
    explanation?: string;
  };
}

export interface DailyLearningReport {
  date: string; // YYYY-MM-DD
  totalMinutes: number;
  subjectMinutes: Partial<Record<SubjectId, number>>;
  completedLessons: number;
  masteredKnowledgePoints: string[];
  weakKnowledgePoints: string[];
  mistakesCount: number;
  resolvedMistakesCount: number;
  parentAdvice: string;
  tomorrowRecommendations: string[];
}
