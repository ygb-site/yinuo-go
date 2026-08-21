import type { StoneColor, Point, BoardSize } from '../engine/types';

export type SubjectId = 'go' | 'math' | 'chinese' | 'english';

export type GradeLevel =
  | 'g1_t1' | 'g1_t2'
  | 'g2_t1' | 'g2_t2'
  | 'g3_t1' | 'g3_t2'
  | 'g4_t1' | 'g4_t2'
  | 'g5_t1' | 'g5_t2'
  | 'g6_t1' | 'g6_t2';

export interface GradeMeta {
  id: GradeLevel;
  name: string;
  shortName: string;
  subtitle: string;
  badge: string;
}

export const GRADE_LEVELS: GradeMeta[] = [
  { id: 'g1_t1', name: '一年级上册', shortName: '一上', subtitle: '基础启蒙', badge: '基础基石' },
  { id: 'g1_t2', name: '一年级下册', shortName: '一下', subtitle: '进阶巩固', badge: '进阶巩固' },
  { id: 'g2_t1', name: '二年级上册', shortName: '二上', subtitle: '思维拔高', badge: '思维培优' },
  { id: 'g2_t2', name: '二年级下册', shortName: '二下', subtitle: '综合飞跃', badge: '综合飞跃' },
  { id: 'g3_t1', name: '三年级上册', shortName: '三上', subtitle: '概念深化', badge: '核心拓展' },
  { id: 'g3_t2', name: '三年级下册', shortName: '三下', subtitle: '逻辑建构', badge: '逻辑跃升' },
  { id: 'g4_t1', name: '四年级上册', shortName: '四上', subtitle: '系统思维', badge: '高阶进阶' },
  { id: 'g4_t2', name: '四年级下册', shortName: '四下', subtitle: '模型建立', badge: '建模探索' },
  { id: 'g5_t1', name: '五年级上册', shortName: '五上', subtitle: '抽象综合', badge: '综合素养' },
  { id: 'g5_t2', name: '五年级下册', shortName: '五下', subtitle: '深度探究', badge: '深度探究' },
  { id: 'g6_t1', name: '六年级上册', shortName: '六上', subtitle: '小升初冲刺', badge: '冲刺培优' },
  { id: 'g6_t2', name: '六年级下册', shortName: '六下', subtitle: '初小衔接', badge: '初小衔接' }
];

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
  subjectMastery: Record<SubjectId, number>;
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
  subjectMinutes: Record<SubjectId, number>;
  completedLessons: number;
  masteredKnowledgePoints: string[];
  weakKnowledgePoints: string[];
  mistakesCount: number;
  resolvedMistakesCount: number;
  parentAdvice: string;
  tomorrowRecommendations: string[];
}

