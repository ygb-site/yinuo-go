import type { StoneColor, Point, BoardSize } from '../engine/types';

export type SubjectId = 'go' | 'checkers' | 'gomoku';

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
  { id: 'g1_t1', name: '一年级上册', shortName: '一上', subtitle: '启蒙初学', badge: '基础启蒙' },
  { id: 'g1_t2', name: '一年级下册', shortName: '一下', subtitle: '死活进阶', badge: '进阶巩固' },
  { id: 'g2_t1', name: '二年级上册', shortName: '二上', subtitle: '手筋战术', badge: '思维拔高' },
  { id: 'g2_t2', name: '二年级下册', shortName: '二下', subtitle: '对弈实战', badge: '对战提高' },
  { id: 'g3_t1', name: '三年级上册', shortName: '三上', subtitle: '大局观探索', badge: '布局拓展' },
  { id: 'g3_t2', name: '三年级下册', shortName: '三下', subtitle: '段位冲刺', badge: '冲段大师' }
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
  | 'ordering';

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

export interface ChoiceOption {
  id: string;
  text: string;
  subText?: string;
  imageUrl?: string;
  audioText?: string;
  badge?: string;
}

export interface ChoiceQuestionStep extends BaseQuestionStep {
  type: 'single_choice' | 'multi_choice';
  options: ChoiceOption[];
  correctOptionIds: string[];
}

export interface MatchPair {
  id: string;
  left: { text: string; sub?: string; icon?: string };
  right: { text: string; sub?: string; icon?: string };
}

export interface DragMatchQuestionStep extends BaseQuestionStep {
  type: 'drag_match';
  pairs: MatchPair[];
}

export interface FillBlankQuestionStep extends BaseQuestionStep {
  type: 'fill_blank';
  template: string;
  correctAnswers: string[];
  optionsPool?: string[];
  keypadType?: 'number' | 'alphabet';
}

export interface OrderItem {
  id: string;
  text: string;
  sub?: string;
}

export interface OrderingQuestionStep extends BaseQuestionStep {
  type: 'ordering';
  items: OrderItem[];
  correctOrder: string[];
}

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

export type UniversalQuestionStep =
  | ChoiceQuestionStep
  | DragMatchQuestionStep
  | FillBlankQuestionStep
  | OrderingQuestionStep
  | GoBoardQuestionStep;

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
// 📕 错题记录模型 (Mistake Record Model)
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


