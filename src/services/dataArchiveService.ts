import type { ChildProfile } from '../stores/useUserStore';
import type { MistakeRecord, KnowledgeMasteryRecord, GradeLevel } from '../types/curriculum';

export interface ExportedArchiveData {
  schemaVersion: '1.0';
  app: 'yinuo-go';
  exportedAt: string;
  profile: {
    nickname: string;
    avatar: string;
    gradeLevel?: GradeLevel;
    progress: Record<string, { completed: boolean; stars: number; highscore?: number; completedAt?: string }>;
    totalStars: number;
    badges: string[];
    solvedPuzzles: string[];
    unlockedAvatars?: string[];
    mistakes?: string[];
    solvedMistakes?: string[];
    mistakeRecords?: MistakeRecord[];
    knowledgeMastery?: Record<string, KnowledgeMasteryRecord>;
    arcadeHighScores?: {
      speedCapture: number;
      countLiberties: number;
      connectCut: number;
    };
    captureGoStats?: {
      wins: number;
      matches: number;
    };
    exp: number;
    coins: number;
    stats: {
      gamesPlayed: number;
      gamesWon: number;
      puzzlesSolved: number;
      captureCount: number;
      totalMoves: number;
      totalQuestionsAnswered?: number;
      totalStudyMinutes?: number;
    };
  };
}

export interface ValidationResult {
  valid: boolean;
  profile?: ChildProfile;
  error?: string;
}

/**
 * 净化并转义普通文本，防止 XSS 或恶意注入
 */
export function sanitizeText(input: unknown, maxLen = 100): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLen);
}

/**
 * 安全导出儿童档案：彻底剥离家长 UID、邮箱、Auth Token、管理员标识等敏感账户信息
 */
export function createSafeProfileArchive(profile: ChildProfile): ExportedArchiveData {
  return {
    schemaVersion: '1.0',
    app: 'yinuo-go',
    exportedAt: new Date().toISOString(),
    profile: {
      nickname: sanitizeText(profile.nickname || '宝贝', 20),
      avatar: sanitizeText(profile.avatar || '🦁', 10),
      gradeLevel: profile.gradeLevel || 'g1_t1',
      progress: JSON.parse(JSON.stringify(profile.progress || {})),
      totalStars: Math.max(0, Number(profile.totalStars) || 0),
      badges: Array.isArray(profile.badges) ? profile.badges.map(b => sanitizeText(b, 50)).filter(Boolean) : [],
      solvedPuzzles: Array.isArray(profile.solvedPuzzles) ? profile.solvedPuzzles.map(p => sanitizeText(p, 50)).filter(Boolean) : [],
      unlockedAvatars: Array.isArray(profile.unlockedAvatars) ? profile.unlockedAvatars.map(a => sanitizeText(a, 10)).filter(Boolean) : ['🦁', '👶', '🐱', '🐼'],
      mistakes: Array.isArray(profile.mistakes) ? profile.mistakes.map(m => sanitizeText(m, 50)).filter(Boolean) : [],
      solvedMistakes: Array.isArray(profile.solvedMistakes) ? profile.solvedMistakes.map(m => sanitizeText(m, 50)).filter(Boolean) : [],
      mistakeRecords: Array.isArray(profile.mistakeRecords) ? JSON.parse(JSON.stringify(profile.mistakeRecords)) : [],
      knowledgeMastery: JSON.parse(JSON.stringify(profile.knowledgeMastery || {})),
      arcadeHighScores: {
        speedCapture: Math.max(0, Number(profile.arcadeHighScores?.speedCapture) || 0),
        countLiberties: Math.max(0, Number(profile.arcadeHighScores?.countLiberties) || 0),
        connectCut: Math.max(0, Number(profile.arcadeHighScores?.connectCut) || 0)
      },
      captureGoStats: {
        wins: Math.max(0, Number(profile.captureGoStats?.wins) || 0),
        matches: Math.max(0, Number(profile.captureGoStats?.matches) || 0)
      },
      exp: Math.max(0, Number(profile.exp) || 0),
      coins: Math.max(0, Number(profile.coins) || 0),
      stats: {
        gamesPlayed: Math.max(0, Number(profile.stats?.gamesPlayed) || 0),
        gamesWon: Math.max(0, Number(profile.stats?.gamesWon) || 0),
        puzzlesSolved: Math.max(0, Number(profile.stats?.puzzlesSolved) || 0),
        captureCount: Math.max(0, Number(profile.stats?.captureCount) || 0),
        totalMoves: Math.max(0, Number(profile.stats?.totalMoves) || 0),
        totalQuestionsAnswered: Math.max(0, Number(profile.stats?.totalQuestionsAnswered) || 0),
        totalStudyMinutes: Math.max(0, Number(profile.stats?.totalStudyMinutes) || 0)
      }
    }
  };
}

/**
 * 校验并深度清洗导入的 JSON 数据
 * - 防原型污染 (__proto__, constructor, prototype)
 * - 文件大小与结构白名单校验
 * - 类型守卫与安全默认值补齐
 */
export function validateAndSanitizeArchive(rawJson: string, maxSizeBytes = 2 * 1024 * 1024): ValidationResult {
  if (!rawJson || typeof rawJson !== 'string') {
    return { valid: false, error: '备份文件内容为空' };
  }

  if (rawJson.length > maxSizeBytes) {
    return { valid: false, error: '备份文件超过最大允许限制 (2MB)' };
  }

  // 严格检测 Prototype Pollution 关键字
  if (/"(__proto__|constructor|prototype)"\s*:/i.test(rawJson)) {
    return { valid: false, error: '安全拦截：检测到非法属性注入 (Prototype Pollution 风险)' };
  }

  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { valid: false, error: '备份文件格式不符合标准 JSON 语法' };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { valid: false, error: 'JSON 根节点必须为对象结构' };
  }

  // 支持标准格式 { schemaVersion, profile: { ... } } 或历史直接档案结构 { nickname, progress ... }
  const source = parsed.profile && typeof parsed.profile === 'object' ? parsed.profile : parsed;

  const nickname = sanitizeText(source.nickname || '导入宝贝', 20);
  const avatar = sanitizeText(source.avatar || '🦁', 10);
  const gradeLevel: GradeLevel = ['g1_t1', 'g1_t2', 'g2_t1', 'g2_t2', 'g3_t1', 'g3_t2'].includes(source.gradeLevel)
    ? source.gradeLevel
    : 'g1_t1';

  // 校验 progress
  const progress: Record<string, { completed: boolean; stars: number; highscore?: number; completedAt?: string }> = {};
  if (source.progress && typeof source.progress === 'object' && !Array.isArray(source.progress)) {
    for (const [key, val] of Object.entries(source.progress)) {
      const cleanKey = sanitizeText(key, 50);
      if (cleanKey && val && typeof val === 'object') {
        const item = val as any;
        progress[cleanKey] = {
          completed: Boolean(item.completed),
          stars: Math.min(3, Math.max(0, Number(item.stars) || 0)),
          highscore: typeof item.highscore === 'number' ? Math.max(0, item.highscore) : undefined,
          completedAt: typeof item.completedAt === 'string' ? sanitizeText(item.completedAt, 50) : undefined
        };
      }
    }
  }

  // 校验 mistakeRecords
  const mistakeRecords: MistakeRecord[] = [];
  if (Array.isArray(source.mistakeRecords)) {
    for (const item of source.mistakeRecords) {
      if (item && typeof item === 'object') {
        mistakeRecords.push({
          id: sanitizeText(item.id || 'mr_' + Date.now(), 50),
          subjectId: ['go', 'math', 'chinese', 'english'].includes(item.subjectId) ? item.subjectId : 'math',
          gradeLevel: item.gradeLevel,
          topic: sanitizeText(item.topic || '基础知识点', 50),
          knowledgePointId: item.knowledgePointId ? sanitizeText(item.knowledgePointId, 50) : undefined,
          knowledgePointTitle: sanitizeText(item.knowledgePointTitle || item.topic || '基础要点', 50),
          questionPrompt: sanitizeText(item.questionPrompt || '', 300),
          userAnswer: sanitizeText(item.userAnswer || '', 100),
          correctAnswer: sanitizeText(item.correctAnswer || '', 100),
          errorCategory: ['concept', 'calculation', 'reading', 'rule', 'misclick'].includes(item.errorCategory) ? item.errorCategory : 'calculation',
          errorReason: sanitizeText(item.errorReason || '在步骤理解上偶有疏漏', 300),
          createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
          resolved: Boolean(item.resolved),
          resolvedAt: typeof item.resolvedAt === 'number' ? item.resolvedAt : undefined,
          wrongCount: Math.max(1, Number(item.wrongCount) || 1),
          lastWrongAt: typeof item.lastWrongAt === 'number' ? item.lastWrongAt : Date.now()
        });
      }
    }
  }

  // 校验 knowledgeMastery
  const knowledgeMastery: Record<string, KnowledgeMasteryRecord> = {};
  if (source.knowledgeMastery && typeof source.knowledgeMastery === 'object') {
    for (const [k, v] of Object.entries(source.knowledgeMastery)) {
      const cleanK = sanitizeText(k, 50);
      if (cleanK && v && typeof v === 'object') {
        const item = v as any;
        knowledgeMastery[cleanK] = {
          knowledgePointId: cleanK,
          totalCount: Math.max(0, Number(item.totalCount) || 0),
          correctCount: Math.max(0, Number(item.correctCount) || 0),
          wrongCount: Math.max(0, Number(item.wrongCount) || 0),
          masteryRate: Math.min(1, Math.max(0, Number(item.masteryRate) || 0)),
          lastPracticedAt: typeof item.lastPracticedAt === 'number' ? item.lastPracticedAt : 0,
          streak: Math.max(0, Number(item.streak) || 0)
        };
      }
    }
  }

  const cleanProfile: ChildProfile = {
    id: 'kid_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    nickname,
    avatar,
    createdAt: typeof source.createdAt === 'number' ? source.createdAt : Date.now(),
    gradeLevel,
    progress,
    totalStars: Math.max(0, Number(source.totalStars) || 0),
    badges: Array.isArray(source.badges) ? source.badges.map((b: any) => sanitizeText(b, 50)).filter(Boolean) : [],
    solvedPuzzles: Array.isArray(source.solvedPuzzles) ? source.solvedPuzzles.map((p: any) => sanitizeText(p, 50)).filter(Boolean) : [],
    unlockedAvatars: Array.isArray(source.unlockedAvatars) ? source.unlockedAvatars.map((a: any) => sanitizeText(a, 10)).filter(Boolean) : ['🦁', '👶', '🐱', '🐼'],
    mistakes: Array.isArray(source.mistakes) ? source.mistakes.map((m: any) => sanitizeText(m, 50)).filter(Boolean) : [],
    solvedMistakes: Array.isArray(source.solvedMistakes) ? source.solvedMistakes.map((m: any) => sanitizeText(m, 50)).filter(Boolean) : [],
    mistakeRecords,
    knowledgeMastery,
    arcadeHighScores: {
      speedCapture: Math.max(0, Number(source.arcadeHighScores?.speedCapture) || 0),
      countLiberties: Math.max(0, Number(source.arcadeHighScores?.countLiberties) || 0),
      connectCut: Math.max(0, Number(source.arcadeHighScores?.connectCut) || 0)
    },
    captureGoStats: {
      wins: Math.max(0, Number(source.captureGoStats?.wins) || 0),
      matches: Math.max(0, Number(source.captureGoStats?.matches) || 0)
    },
    exp: Math.max(0, Number(source.exp) || 0),
    coins: Math.max(0, Number(source.coins) || 0),
    coinLog: [],
    starLog: [],
    stats: {
      gamesPlayed: Math.max(0, Number(source.stats?.gamesPlayed) || 0),
      gamesWon: Math.max(0, Number(source.stats?.gamesWon) || 0),
      puzzlesSolved: Math.max(0, Number(source.stats?.puzzlesSolved) || 0),
      captureCount: Math.max(0, Number(source.stats?.captureCount) || 0),
      totalMoves: Math.max(0, Number(source.stats?.totalMoves) || 0),
      totalQuestionsAnswered: Math.max(0, Number(source.stats?.totalQuestionsAnswered) || 0),
      totalStudyMinutes: Math.max(0, Number(source.stats?.totalStudyMinutes) || 0)
    }
  };

  return {
    valid: true,
    profile: cleanProfile
  };
}
