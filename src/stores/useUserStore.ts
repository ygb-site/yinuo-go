import type {
  SubjectId,
  MistakeRecord,
  KnowledgeMasteryRecord,
  StudentLearningProfile,
  GradeLevel
} from '../types/curriculum';
import {
  resolveGrowthTracks,
  resolveTogetherWeek,
  resolveGradeLevel,
  type EducationTrackId,
  type ReturnWindowId,
  type TogetherItemId,
  type TogetherWeekState,
  type TrackRole
} from '../domain/growth/tracks';
import { resolveDayPlan, type DayPlanState } from '../domain/today/dayPlan';
import { defineStore } from 'pinia';
import { USER_RANKS, type UserRank, BADGES_DATA, type AchievementBadge } from '../data/achievementsData';
import { KNOWLEDGE_POINTS_REPOSITORY } from '../data/knowledgePointsData';
import { sound } from '../utils/sound';
import {
  saveUserDataToCloud,
  fetchUserProfile,
  getCurrentCloudUser,
} from '../services/cloudSyncService';
import { isSupabaseConfigured, getSupabaseClient } from '../lib/supabase';
import { useAiTutorStore } from './useAiTutorStore';
import { buildRewardKey } from '../utils/rewardKey';
import { toSafeErrorDigest } from '../utils/safeError';

/**
 * 独立儿童用户档案 (Child Profile Data Structure)
 */
export interface CoinLogEntry {
  id: string;
  at: number;
  amount: number;
  balance: number;
  reason: string;
  icon: string;
}

/**
 * 奖励发放请求：所有会增加金币/经验的学习行为都必须经由 grantRewardOnce 走这个结构，
 * 而不是各页面自己调 addCoins/addExp。
 */
export interface RewardGrantSpec {
  coins?: number;
  exp?: number;
  reason?: string;
  icon?: string;
  /** 同类行为的每日封顶标识；用于挡住「无限新建自建任务换新幂等键」这种绕过手法 */
  dailyCapId?: string;
  dailyCapLimit?: number;
}

export type RewardBlockedReason = 'no-profile' | 'invalid-key' | 'duplicate' | 'daily-cap';

export interface RewardGrantResult {
  granted: boolean;
  blockedBy?: RewardBlockedReason;
}

/** 幂等账本保留上限，超出后裁剪最旧记录，避免档案无限膨胀 */
const REWARD_LEDGER_MAX = 400;
const REWARD_LEDGER_KEEP = 300;

/** 攻克错题奖励额度：一条错题记录只结算一次 */
const MISTAKE_RESOLVE_COINS = 30;
const MISTAKE_RESOLVE_EXP = 40;

/** 趣味闯关每日发奖上限：同一模式可无限重开，靠每日封顶挡住刷币 */
const ARCADE_DAILY_REWARD_CAP = 10;

/** 吃子棋每日发奖上限：小盘 1 子目标一分钟能打完一局，仅靠 matchId 幂等挡不住刷量 */
const CAPTURE_GO_DAILY_REWARD_CAP = 20;

/** 云端同步失败时对外展示的固定文案：原始异常不进儿童可见界面 */
const CLOUD_SYNC_FAILED_TEXT = '云端同步暂时没成功，稍后会自动重试';

export interface ChildProfile {
  id: string;
  nickname: string;
  avatar: string;
  createdAt: number;
  gradeLevel?: GradeLevel;
  /** 当前在读城市轨道，默认北京 */
  schoolTrack?: EducationTrackId;
  /** 老家对齐轨道，默认衡水 */
  hometownTrack?: EducationTrackId;
  /** 预计回老家的年级窗口，默认四到六年级 */
  returnWindow?: ReturnWindowId;
  /** current=仍跟当前学校；hometown=已切到老家学校 */
  trackRole?: TrackRole;
  /** 本周亲子一起做，不算能力分 */
  togetherWeek?: TogetherWeekState;
  /** 儿童「今天」页当日勾选进度 */
  dayPlan?: DayPlanState;
  progress: Record<string, { completed: boolean; stars: number; highscore?: number; completedAt?: string }>;
  totalStars: number;
  badges: string[];
  solvedPuzzles: string[];
  unlockedAvatars?: string[];
  mistakes?: string[];
  lastCheckInDate?: string;
  lastDailyQuestsClaimDate?: string;
  lastDailyRiddleDate?: string;
  checkInStreak?: number;
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
  coinLog?: CoinLogEntry[];
  starLog?: CoinLogEntry[];
  /** 奖励幂等账本：幂等键 -> 发放时间戳。存在即表示该行为已结算过，不再重复发放 */
  rewardLedger?: Record<string, number>;
  /** 每日封顶计数：`<capId>:<yyyy-mm-dd>` -> 当日已发放次数 */
  rewardDailyCounters?: Record<string, number>;
  /** 当前年级课表（随档案上云，多端一致） */
  schedule?: {
    grid: Record<string, string>;
    schoolName: string;
    className: string;
    studentName?: string;
    version?: string;
  };
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    puzzlesSolved: number;
    captureCount: number;
    totalMoves: number;
    totalQuestionsAnswered?: number;
    totalStudyMinutes?: number;
  };
}

function normalizeMistakePrompt(prompt: string): string {
  return (prompt || '').trim().toLowerCase().replace(/\s+/g, '');
}

const EMPTY_PLACEHOLDER_PROFILE: ChildProfile = {
  id: '',
  nickname: '未登录',
  avatar: '👶',
  createdAt: 0,
  gradeLevel: 'g1_t1',
  schoolTrack: 'beijing',
  hometownTrack: 'hengshui',
  returnWindow: 'g4_g6',
  trackRole: 'current',
  togetherWeek: undefined,
  dayPlan: undefined,
  progress: {},
  totalStars: 0,
  badges: [],
  solvedPuzzles: [],
  unlockedAvatars: ['🦁', '👶', '🐱', '🐼'],
  mistakes: [],
  solvedMistakes: [],
  mistakeRecords: [],
  knowledgeMastery: {},
  arcadeHighScores: {
    speedCapture: 0,
    countLiberties: 0,
    connectCut: 0
  },
  captureGoStats: {
    wins: 0,
    matches: 0
  },
  exp: 0,
  coins: 0,
  rewardLedger: {},
  rewardDailyCounters: {},
  stats: {
    gamesPlayed: 0,
    gamesWon: 0,
    puzzlesSolved: 0,
    captureCount: 0,
    totalMoves: 0,
    totalQuestionsAnswered: 0,
    totalStudyMinutes: 0
  }
};

/** 云端设置里允许恢复的 AI 配置字段白名单：apiKey 等密钥字段永远不在其中 */
const CLOUD_AI_CONFIG_ALLOWED_KEYS = ['mode', 'endpoint', 'model', 'autoSpeech'] as const;

function applyGrowthDefaults(profile: ChildProfile): ChildProfile {
  const tracks = resolveGrowthTracks(profile);
  profile.gradeLevel = resolveGradeLevel(profile.gradeLevel);
  profile.schoolTrack = tracks.schoolTrack;
  profile.hometownTrack = tracks.hometownTrack;
  profile.returnWindow = tracks.returnWindow;
  profile.trackRole = tracks.trackRole;

  // getter 里也会走到这里：只在缺字段或跨周/跨日时写回，避免每次新建对象触发递归更新
  const together = resolveTogetherWeek(profile.togetherWeek);
  if (!profile.togetherWeek || profile.togetherWeek.weekKey !== together.weekKey) {
    profile.togetherWeek = together;
  }

  const plan = resolveDayPlan(profile.dayPlan);
  if (!profile.dayPlan || profile.dayPlan.date !== plan.date) {
    profile.dayPlan = plan;
  }

  return profile;
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;
/** 会话初始化单飞：路由守卫和 App 启动共用，避免重复绑定 onAuthStateChange */
let authInitPromise: Promise<void> | null = null;
let cloudSessionListenerBound = false;

export const useUserStore = defineStore('userStore', {
  state: () => ({
    // 🔐 纯云端登录与权限状态 (Cloud Auth & Role State)
    isLoggedIn: false as boolean,
    /** 是否已完成一次会话探测；未完成前不要按「未登录」拦路由 */
    authReady: false as boolean,
    currentUserEmail: null as string | null,
    currentUserId: null as string | null,
    isAdmin: false as boolean,

    // 👶 关联的宝贝档案列表 (仅在登录后从云端加载)
    profiles: [] as ChildProfile[],
    currentProfileId: '' as string,
    isProfileModalOpen: false as boolean,
    showAuthModal: false as boolean,

    // 📚 当前选中学科 (Multi-Subject Academy Context)
    activeSubject: 'go' as SubjectId,

    // ⚙️ 游戏设置与个性化
    soundEnabled: true as boolean,
    volume: 0.8 as number,
    showLibertiesOverlay: true as boolean,
    showAtariAlerts: true as boolean,
    showTerritoryHeatmap: false as boolean,
    touchConfirmEnabled: false as boolean,

    // ⚡ 实时云同步状态
    isSyncing: false as boolean,
    lastSavedAt: null as number | null,
    syncError: null as string | null
  }),

  getters: {
    // 是否为已登录且拥有至少一个宝贝档案的就绪状态
    hasProfile(state): boolean {
      return state.isLoggedIn && state.profiles.length > 0 && Boolean(state.currentProfileId);
    },

    isCloudLoggedIn(state): boolean {
      return state.isLoggedIn;
    },

    isSyncingToCloud(state): boolean {
      return state.isSyncing;
    },

    lastCloudSyncedAt(state): number | null {
      return state.lastSavedAt;
    },

    cloudSyncError(state): string | null {
      return state.syncError;
    },

    currentProfile(state): ChildProfile {
      if (!state.isLoggedIn || state.profiles.length === 0) {
        return EMPTY_PLACEHOLDER_PROFILE;
      }
      let found = state.profiles.find(p => p.id === state.currentProfileId);
      if (!found) {
        state.currentProfileId = state.profiles[0].id;
        found = state.profiles[0];
      }
      if (!found.badges) found.badges = [];
      if (!found.solvedPuzzles) found.solvedPuzzles = [];
      if (!found.progress) found.progress = {};
      if (!found.unlockedAvatars) found.unlockedAvatars = ['🦁', '👶', '🐱', '🐼'];
      if (!found.mistakes) found.mistakes = [];
      if (!found.solvedMistakes) found.solvedMistakes = [];
      if (!found.mistakeRecords) found.mistakeRecords = [];
      if (found.mistakeRecords.length > 0 && found.mistakeRecords.some(m => String(m.id || '').startsWith('sample_'))) {
        found.mistakeRecords = found.mistakeRecords.filter(m => !String(m.id || '').startsWith('sample_'));
      }
      applyGrowthDefaults(found);
      if (!found.knowledgeMastery) found.knowledgeMastery = {};
      if (!found.arcadeHighScores) {
        found.arcadeHighScores = { speedCapture: 0, countLiberties: 0, connectCut: 0 };
      }
      if (!found.captureGoStats) {
        found.captureGoStats = { wins: 0, matches: 0 };
      }
      if (!found.stats) {
        found.stats = {
          gamesPlayed: 0,
          gamesWon: 0,
          puzzlesSolved: 0,
          captureCount: 0,
          totalMoves: 0,
          totalQuestionsAnswered: 0,
          totalStudyMinutes: 0
        };
      }
      // Ensure totalStars is synced from progress
      let computedStars = 0;
      if (found.progress) {
        for (const item of Object.values(found.progress)) {
          if (item && item.completed) {
            computedStars += item.stars || 0;
          }
        }
      }
      found.totalStars = Math.max(computedStars, found.totalStars || 0);
      if (!found.coinLog) found.coinLog = [];
      if (!found.starLog) found.starLog = [];
      if (!found.rewardLedger) found.rewardLedger = {};
      if (!found.rewardDailyCounters) found.rewardDailyCounters = {};
      return found;
    },

    nickname(): string {
      return this.currentProfile.nickname;
    },

    avatar(): string {
      return this.currentProfile.avatar;
    },

    exp(): number {
      return this.currentProfile.exp || 0;
    },

    coins(): number {
      return this.currentProfile.coins || 0;
    },

    stars(): number {
      return this.currentProfile.totalStars || 0;
    },

    totalStars(): number {
      return this.currentProfile.totalStars || 0;
    },

    coinLog(): CoinLogEntry[] {
      return this.currentProfile.coinLog || [];
    },

    starLog(): CoinLogEntry[] {
      return this.currentProfile.starLog || [];
    },

    familyTotalStars(state): number {
      return (state.profiles || []).reduce((acc, p) => {
        let s = 0;
        if (p.progress) {
          for (const item of Object.values(p.progress)) {
            if (item && item.completed) {
              s += item.stars || 0;
            }
          }
        }
        return acc + Math.max(s, p.totalStars || 0);
      }, 0);
    },

    unlockedBadges(): string[] {
      return this.currentProfile.badges || [];
    },

    solvedPuzzles(): string[] {
      return this.currentProfile.solvedPuzzles || [];
    },

    unlockedAvatars(): string[] {
      return this.currentProfile.unlockedAvatars || ['🦁', '👶', '🐱', '🐼'];
    },

    mistakes(): string[] {
      return this.currentProfile.mistakes || [];
    },

    solvedMistakes(): string[] {
      return this.currentProfile.solvedMistakes || [];
    },

    mistakeRecords(): MistakeRecord[] {
      const list = this.currentProfile.mistakeRecords || [];
      return list.filter(m => !String(m.id || '').startsWith('sample_'));
    },

    knowledgeMastery(): Record<string, KnowledgeMasteryRecord> {
      return this.currentProfile.knowledgeMastery || {};
    },

    studentLearningProfile(): StudentLearningProfile {
      const prof = this.currentProfile;
      const mastery = prof.knowledgeMastery || {};
      const mistakes = prof.mistakeRecords || [];

      let masteryQ = 0;
      let totalCorrect = 0;
      for (const k of Object.values(mastery)) {
        masteryQ += k.totalCount || 0;
        totalCorrect += k.correctCount || 0;
      }
      const totalQ = Math.max(prof.stats?.totalQuestionsAnswered || 0, masteryQ);
      const accuracy = masteryQ > 0 ? Math.round((totalCorrect / masteryQ) * 100) : 0;

      const dimensionTotals: Record<'spatial' | 'logical' | 'calculation' | 'language' | 'concentration' | 'memory', { sum: number; n: number }> = {
        spatial: { sum: 0, n: 0 },
        logical: { sum: 0, n: 0 },
        calculation: { sum: 0, n: 0 },
        language: { sum: 0, n: 0 },
        concentration: { sum: 0, n: 0 },
        memory: { sum: 0, n: 0 }
      };

      const subjectTotals: Record<SubjectId, { sum: number; n: number }> = {
        go: { sum: 0, n: 0 },
        checkers: { sum: 0, n: 0 },
        gomoku: { sum: 0, n: 0 }
      };

      for (const kp of KNOWLEDGE_POINTS_REPOSITORY) {
        const rec = mastery[kp.id];
        if (!rec || rec.totalCount <= 0) continue;
        const score = rec.masteryRate * 100;
        dimensionTotals[kp.abilityDimension].sum += score;
        dimensionTotals[kp.abilityDimension].n += 1;
        subjectTotals[kp.subjectId].sum += score;
        subjectTotals[kp.subjectId].n += 1;
      }

      const scoreOf = (bucket: { sum: number; n: number }) =>
        bucket.n > 0 ? Math.round(bucket.sum / bucket.n) : 0;

      const abilityDimensions: Record<'spatial' | 'logical' | 'calculation' | 'language' | 'concentration' | 'memory', number> = {
        spatial: scoreOf(dimensionTotals.spatial),
        logical: scoreOf(dimensionTotals.logical),
        calculation: scoreOf(dimensionTotals.calculation),
        language: scoreOf(dimensionTotals.language),
        concentration: scoreOf(dimensionTotals.concentration),
        memory: scoreOf(dimensionTotals.memory)
      };

      const subjectMastery: Record<SubjectId, number> = {
        go: scoreOf(subjectTotals.go),
        checkers: scoreOf(subjectTotals.checkers),
        gomoku: scoreOf(subjectTotals.gomoku)
      };

      const weakKps = KNOWLEDGE_POINTS_REPOSITORY.filter(kp => {
        const rec = mastery[kp.id];
        return rec && rec.totalCount >= 2 && rec.masteryRate < 0.65;
      });

      const masteredKps = KNOWLEDGE_POINTS_REPOSITORY.filter(kp => {
        const rec = mastery[kp.id];
        return rec && rec.totalCount >= 2 && rec.masteryRate >= 0.8;
      });

      return {
        studentId: prof.id || 'default_student',
        nickname: prof.nickname || '聪明宝贝',
        gradeLevel: prof.gradeLevel || 'g1_t1',
        totalStudyMinutes: prof.stats?.totalStudyMinutes || 0,
        totalQuestionsAnswered: totalQ,
        accuracy,
        streak: prof.checkInStreak || 0,
        knowledgeMastery: mastery,
        abilityDimensions,
        subjectMastery,
        recentMistakes: mistakes.slice(0, 10),
        weakKnowledgePoints: weakKps,
        masteredKnowledgePoints: masteredKps,
        updatedAt: Date.now()
      };
    },

    arcadeHighScores(): { speedCapture: number; countLiberties: number; connectCut: number } {
      return this.currentProfile.arcadeHighScores || { speedCapture: 0, countLiberties: 0, connectCut: 0 };
    },

    captureGoStats(): { wins: number; matches: number } {
      return this.currentProfile.captureGoStats || { wins: 0, matches: 0 };
    },

    stats(): ChildProfile['stats'] {
      return this.currentProfile.stats;
    },

    progress(): ChildProfile['progress'] {
      return this.currentProfile.progress || {};
    },

    currentRank(): UserRank {
      const expVal = this.currentProfile.exp || 0;
      let current = USER_RANKS[0];
      for (const rank of USER_RANKS) {
        if (expVal >= rank.minExp) {
          current = rank;
        } else {
          break;
        }
      }
      return current;
    },

    nextRank(): UserRank | null {
      const cur = this.currentRank;
      const idx = USER_RANKS.findIndex(r => r.rankLevel === cur.rankLevel);
      if (idx >= 0 && idx < USER_RANKS.length - 1) {
        return USER_RANKS[idx + 1];
      }
      return null;
    },

    rankProgressPercent(): number {
      const cur = this.currentRank;
      const next = this.nextRank;
      if (!next) return 100;
      const range = next.minExp - cur.minExp;
      if (range <= 0) return 100;
      const curExpInRange = (this.currentProfile.exp || 0) - cur.minExp;
      return Math.min(100, Math.max(0, Math.round((curExpInRange / range) * 100)));
    },

    allBadges(): AchievementBadge[] {
      return BADGES_DATA;
    },

    checkInStreak(): number {
      const prof = this.currentProfile;
      if (!prof.id || prof.id === '') return 1;
      const today = new Date().toLocaleDateString('en-CA');
      if (!prof.lastCheckInDate) return 1;
      const lastDate = new Date(prof.lastCheckInDate);
      const nowDate = new Date(today);
      const diffDays = Math.round((nowDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 0 || diffDays === 1) {
        return Math.max(1, Math.min(7, prof.checkInStreak || 1));
      }
      return 1;
    }
  },

  actions: {
    setActiveSubject(subject: SubjectId) {
      this.activeSubject = subject;
    },
    openProfileModal() {
      if (!this.isLoggedIn) {
        this.openAuthModal();
        return;
      }
      this.isProfileModalOpen = true;
    },

    closeProfileModal() {
      this.isProfileModalOpen = false;
    },

    openAuthModal() {
      this.showAuthModal = true;
    },

    closeAuthModal() {
      this.showAuthModal = false;
    },

    /** 只要登录。未登录就弹登录框，用于侧栏/路由拦截。 */
    requireLogin(): boolean {
      if (this.isLoggedIn) return true;
      this.openAuthModal();
      return false;
    },

    /**
     * 统一鉴权拦截器：登录 + 已有宝贝档案
     */
    requireAuth(): boolean {
      if (!this.requireLogin()) return false;
      if (this.profiles.length === 0) {
        this.isProfileModalOpen = true;
        return false;
      }
      return true;
    },

    /**
     * 设置已登录用户信息并加载云端进度
     */
    async setCloudUser(userId: string, email: string) {
      this.isLoggedIn = true;
      this.currentUserId = userId;
      this.currentUserEmail = email;

      const row = await fetchUserProfile(userId);
      let hasLegacyCloudApiKey = false;

      if (row) {
        this.isAdmin = Boolean(row.is_admin);
        this.profiles = (row.profiles_data || []).map((item) => applyGrowthDefaults(item));
        this.currentProfileId = row.active_profile_id || (this.profiles[0]?.id || '');
        if (row.settings_data) {
          if (typeof row.settings_data.soundEnabled === 'boolean') this.soundEnabled = row.settings_data.soundEnabled;
          if (typeof row.settings_data.volume === 'number') this.volume = row.settings_data.volume;

          const remoteAiConfig = row.settings_data.aiConfig;
          if (remoteAiConfig && typeof remoteAiConfig === 'object') {
            hasLegacyCloudApiKey = typeof remoteAiConfig.apiKey === 'string' && remoteAiConfig.apiKey.trim().length > 0;
            try {
              // 只按白名单恢复非密钥字段，历史云端数据里的 apiKey 一律丢弃
              const safeConfig: Record<string, unknown> = {};
              for (const field of CLOUD_AI_CONFIG_ALLOWED_KEYS) {
                if (remoteAiConfig[field] !== undefined) safeConfig[field] = remoteAiConfig[field];
              }
              useAiTutorStore().applyRemoteConfig(safeConfig);
            } catch (e) {
              console.warn('[AI Config Cloud Restore Warn]', e);
            }
          }
        }
      }

      this.lastSavedAt = Date.now();

      // 历史版本曾把第三方密钥写进 settings_data：登录后立即用不含密钥的 payload 覆盖写回，完成云端清理
      if (hasLegacyCloudApiKey) {
        await this.syncToCloudNow();
      }
    },

    clearCloudUser() {
      this.isLoggedIn = false;
      this.currentUserId = null;
      this.currentUserEmail = null;
      this.isAdmin = false;
      this.profiles = [];
      this.currentProfileId = '';
      this.lastSavedAt = null;
      this.syncError = null;
      try {
        useAiTutorStore().clearApiKey();
      } catch {}
    },

    /** 等会话探测结束；可被路由守卫与 App 启动重复调用 */
    async ensureAuthReady() {
      if (this.authReady) return;
      if (!authInitPromise) {
        authInitPromise = this.initCloudSession().finally(() => {
          this.authReady = true;
        });
      }
      await authInitPromise;
    },

    async initCloudSession() {
      if (!isSupabaseConfigured()) return;
      const client = getSupabaseClient();
      if (!client) return;

      try {
        const user = await getCurrentCloudUser();
        if (user) {
          await this.setCloudUser(user.id, user.email || '');
        } else {
          this.clearCloudUser();
        }

        if (!cloudSessionListenerBound) {
          cloudSessionListenerBound = true;
          client.auth.onAuthStateChange(async (event, session) => {
            if (session && session.user) {
              await this.setCloudUser(session.user.id, session.user.email || '');
            } else if (event === 'SIGNED_OUT') {
              this.clearCloudUser();
            }
          });
        }
      } catch (err) {
        console.warn('[Supabase Auth Init Warn]', err);
      }
    },

    async syncToCloudNow(): Promise<boolean> {
      if (!this.isLoggedIn || !isSupabaseConfigured()) {
        return false;
      }

      this.isSyncing = true;
      this.syncError = null;

      try {
        const res = await saveUserDataToCloud(
          this.profiles,
          this.currentProfileId,
          {
            soundEnabled: this.soundEnabled,
            volume: this.volume,
            // 不上传 apiKey：第三方模型密钥不进入云端存储
            aiConfig: {
              mode: useAiTutorStore().config.mode,
              endpoint: useAiTutorStore().config.endpoint,
              model: useAiTutorStore().config.model,
              autoSpeech: useAiTutorStore().config.autoSpeech
            }
          }
        );

        this.isSyncing = false;

        if (res.success) {
          this.lastSavedAt = res.timestamp || Date.now();
          return true;
        }

        // syncError 会直接显示在孩子看得到的页面上，只放固定文案；原始原因仅在开发环境落日志
        this.syncError = CLOUD_SYNC_FAILED_TEXT;
        if (import.meta.env?.DEV) {
          console.warn('[Cloud Sync Failed]', toSafeErrorDigest(res.error));
        }
        return false;
      } catch (err) {
        this.isSyncing = false;
        this.syncError = CLOUD_SYNC_FAILED_TEXT;
        if (import.meta.env?.DEV) {
          console.warn('[Cloud Sync Failed]', toSafeErrorDigest(err));
        }
        return false;
      }
    },

    touchSave() {
      if (!this.isLoggedIn || !isSupabaseConfigured()) return;

      if (syncTimer) clearTimeout(syncTimer);
      syncTimer = setTimeout(() => {
        this.syncToCloudNow();
      }, 400);
    },

    isNicknameTaken(nickname: string, excludeId?: string): boolean {
      const trimmed = nickname.trim().toLowerCase();
      if (!trimmed) return false;
      return this.profiles.some(
        p => (!excludeId || p.id !== excludeId) && p.nickname.trim().toLowerCase() === trimmed
      );
    },

    createProfile(
      nickname: string,
      avatar: string,
      gradeLevel: GradeLevel = 'g1_t1',
      tracks?: Partial<{
        schoolTrack: EducationTrackId;
        hometownTrack: EducationTrackId;
        returnWindow: ReturnWindowId;
        trackRole: TrackRole;
      }>
    ): ChildProfile | null {
      if (!this.isLoggedIn) {
        this.openAuthModal();
        return null;
      }

      const trimmed = nickname.trim() || '聪明宝贝';
      if (this.isNicknameTaken(trimmed)) {
        return null;
      }
      const newId = 'kid_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const pickedAvatar = avatar || '🦁';
      const resolvedTracks = resolveGrowthTracks(tracks);
      const newProfile: ChildProfile = {
        id: newId,
        nickname: trimmed,
        avatar: pickedAvatar,
        createdAt: Date.now(),
        gradeLevel: resolveGradeLevel(gradeLevel),
        schoolTrack: resolvedTracks.schoolTrack,
        hometownTrack: resolvedTracks.hometownTrack,
        returnWindow: resolvedTracks.returnWindow,
        trackRole: resolvedTracks.trackRole,
        togetherWeek: resolveTogetherWeek(null),
        dayPlan: resolveDayPlan(null),
        progress: {},
        totalStars: 0,
        badges: [],
        solvedPuzzles: [],
        unlockedAvatars: Array.from(new Set(['🦁', '👶', '🐱', '🐼', pickedAvatar])),
        mistakes: [],
        solvedMistakes: [],
        mistakeRecords: [],
        knowledgeMastery: {},
        arcadeHighScores: {
          speedCapture: 0,
          countLiberties: 0,
          connectCut: 0
        },
        captureGoStats: {
          wins: 0,
          matches: 0
        },
        exp: 0,
        coins: 0,
        coinLog: [],
        starLog: [],
        rewardLedger: {},
        rewardDailyCounters: {},
        schedule: undefined,
        stats: {
          gamesPlayed: 0,
          gamesWon: 0,
          puzzlesSolved: 0,
          captureCount: 0,
          totalMoves: 0,
          totalQuestionsAnswered: 0,
          totalStudyMinutes: 0
        }
      };

      this.profiles.push(newProfile);
      this.currentProfileId = newId;
      this.isProfileModalOpen = false;
      this.touchSave();
      sound.playWinSound();
      sound.fireCelebrationConfetti();
      return newProfile;
    },

    updateGrowthTracks(
      patch: Partial<{
        gradeLevel: GradeLevel;
        schoolTrack: EducationTrackId;
        hometownTrack: EducationTrackId;
        returnWindow: ReturnWindowId;
        trackRole: TrackRole;
      }>
    ) {
      const prof = this.profiles.find((item) => item.id === this.currentProfileId);
      if (!prof) return;
      if (patch.gradeLevel) prof.gradeLevel = resolveGradeLevel(patch.gradeLevel);
      const next = resolveGrowthTracks({
        schoolTrack: patch.schoolTrack ?? prof.schoolTrack,
        hometownTrack: patch.hometownTrack ?? prof.hometownTrack,
        returnWindow: patch.returnWindow ?? prof.returnWindow,
        trackRole: patch.trackRole ?? prof.trackRole
      });
      prof.schoolTrack = next.schoolTrack;
      prof.hometownTrack = next.hometownTrack;
      prof.returnWindow = next.returnWindow;
      prof.trackRole = next.trackRole;
      this.touchSave();
    },

    toggleTogetherItem(itemId: TogetherItemId) {
      const prof = this.profiles.find((item) => item.id === this.currentProfileId);
      if (!prof) return;
      const week = resolveTogetherWeek(prof.togetherWeek);
      week.done[itemId] = !week.done[itemId];
      prof.togetherWeek = week;
      this.touchSave();
    },

    /** 更新「今天」页当日计划勾选；跨日自动重置 */
    patchDayPlan(patch: Partial<Omit<DayPlanState, 'date'>>) {
      const prof = this.profiles.find((item) => item.id === this.currentProfileId);
      if (!prof) return;
      const current = resolveDayPlan(prof.dayPlan);
      prof.dayPlan = resolveDayPlan({ ...current, ...patch, date: current.date });
      this.touchSave();
    },

    toggleDayHomework(itemId: string) {
      const prof = this.profiles.find((item) => item.id === this.currentProfileId);
      if (!prof) return;
      const current = resolveDayPlan(prof.dayPlan);
      const set = new Set(current.homeworkDoneIds);
      if (set.has(itemId)) set.delete(itemId);
      else set.add(itemId);
      prof.dayPlan = resolveDayPlan({ ...current, homeworkDoneIds: Array.from(set) });
      this.touchSave();
    },

    switchProfile(id: string) {
      const target = this.profiles.find(p => p.id === id);
      if (target) {
        this.currentProfileId = id;
        this.touchSave();
        sound.playButtonSound();
      }
    },

    deleteProfile(id: string) {
      const idx = this.profiles.findIndex(p => p.id === id);
      if (idx >= 0) {
        this.profiles.splice(idx, 1);
        if (this.currentProfileId === id) {
          this.currentProfileId = this.profiles.length > 0 ? this.profiles[0].id : '';
        }
        this.touchSave();
        sound.playButtonSound();
      }
    },

    clearAllProfiles() {
      this.profiles = [];
      this.currentProfileId = '';
      this.touchSave();
      sound.playButtonSound();
    },

    /**
     * 🧠 知识点练习结果追踪与画像打通 (Knowledge Point Tracking)
     */
    recordKnowledgePractice(knowledgePointId: string, isCorrect: boolean) {
      if (!this.hasProfile || !knowledgePointId) return;
      const prof = this.currentProfile;
      if (!prof.knowledgeMastery) prof.knowledgeMastery = {};

      const existing = prof.knowledgeMastery[knowledgePointId] || {
        knowledgePointId,
        totalCount: 0,
        correctCount: 0,
        wrongCount: 0,
        masteryRate: 0,
        lastPracticedAt: Date.now(),
        streak: 0
      };

      existing.totalCount++;
      if (isCorrect) {
        existing.correctCount++;
        existing.streak = (existing.streak || 0) + 1;
      } else {
        existing.wrongCount++;
        existing.streak = 0;
      }
      existing.masteryRate = Number((existing.correctCount / existing.totalCount).toFixed(2));
      existing.lastPracticedAt = Date.now();

      prof.knowledgeMastery[knowledgePointId] = existing;

      if (!prof.stats) {
        prof.stats = { gamesPlayed: 0, gamesWon: 0, puzzlesSolved: 0, captureCount: 0, totalMoves: 0 };
      }
      prof.stats.totalQuestionsAnswered = (prof.stats.totalQuestionsAnswered || 0) + 1;

      this.touchSave();
    },

    getKnowledgeMastery(knowledgePointId: string): KnowledgeMasteryRecord {
      const mastery = this.currentProfile.knowledgeMastery || {};
      return mastery[knowledgePointId] || {
        knowledgePointId,
        totalCount: 0,
        correctCount: 0,
        wrongCount: 0,
        masteryRate: 0,
        lastPracticedAt: 0,
        streak: 0
      };
    },

    updateLessonProgress(
      lessonId: string,
      stars: number,
      rewards: { exp?: number; coins?: number } = {},
      knowledgePointId?: string
    ) {
      if (!this.hasProfile) return;
      const prof = this.currentProfile;
      if (!prof.progress) prof.progress = {};
      const prev = prof.progress[lessonId];
      const prevStars = prev ? prev.stars : 0;
      const starsGained = Math.max(0, stars - prevStars);

      prof.progress[lessonId] = {
        completed: true,
        stars: Math.max(prevStars, stars),
        completedAt: new Date().toISOString()
      };

      if (starsGained > 0) {
        prof.totalStars = (prof.totalStars || 0) + starsGained;
        this.appendRewardLog(prof, 'starLog', starsGained, '闯关获得星星', '⭐');
      }

      if (rewards.exp) this.addExp(rewards.exp);
      if (rewards.coins) this.addCoins(rewards.coins, '闯关金币奖励', '🎯');

      if (knowledgePointId) {
        this.recordKnowledgePractice(knowledgePointId, true);
      }

      this.unlockBadge('first_move');
      if (lessonId === 'lesson_1_3' || lessonId === 'c1_l4') {
        this.unlockBadge('first_door');
        this.unlockBadge('chapter_1_clear');
      }
      if (lessonId === 'lesson_2_4' || lessonId === 'c2_l4') {
        this.unlockBadge('chapter_2_clear');
      }
      this.touchSave();
    },

    addExp(amount: number) {
      if (!this.hasProfile) return;
      const prof = this.currentProfile;
      const oldRank = this.currentRank.rankLevel;
      prof.exp = (prof.exp || 0) + amount;
      this.touchSave();
      const newRank = this.currentRank.rankLevel;
      if (newRank > oldRank) {
        sound.playWinSound();
        sound.fireCelebrationConfetti();
      }
    },

    appendRewardLog(
      prof: ChildProfile,
      key: 'coinLog' | 'starLog',
      amount: number,
      reason: string,
      icon: string
    ) {
      if (!prof[key]) prof[key] = [];
      const list = prof[key] as CoinLogEntry[];
      const balance = key === 'coinLog' ? prof.coins || 0 : prof.totalStars || 0;
      list.unshift({
        id: key[0] + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        at: Date.now(),
        amount,
        balance,
        reason,
        icon
      });
      if (list.length > 40) list.length = 40;
    },

    /**
     * 查询某个奖励幂等键是否已经结算过（供 UI 判断是否还要展示奖励动效）
     */
    isRewardGranted(idempotencyKey: string): boolean {
      if (!this.hasProfile || !idempotencyKey) return false;
      return Boolean(this.currentProfile.rewardLedger?.[idempotencyKey]);
    },

    /**
     * 统一幂等奖励入口：一次真实学习行为只结算一次奖励。
     *
     * 幂等键落在儿童档案里，随本地持久化与云端 profiles_data 一起走，
     * 因此 toggle、刷新、重开页面、换设备都无法重复领取。
     */
    grantRewardOnce(idempotencyKey: string, spec: RewardGrantSpec): RewardGrantResult {
      if (!this.hasProfile) return { granted: false, blockedBy: 'no-profile' };

      const key = (idempotencyKey || '').trim();
      if (!key) return { granted: false, blockedBy: 'invalid-key' };

      const prof = this.currentProfile;
      if (!prof.rewardLedger) prof.rewardLedger = {};
      if (prof.rewardLedger[key]) return { granted: false, blockedBy: 'duplicate' };

      let capKey = '';
      if (spec.dailyCapId && spec.dailyCapLimit && spec.dailyCapLimit > 0) {
        if (!prof.rewardDailyCounters) prof.rewardDailyCounters = {};
        capKey = spec.dailyCapId + ':' + new Date().toLocaleDateString('en-CA');
        if ((prof.rewardDailyCounters[capKey] || 0) >= spec.dailyCapLimit) {
          return { granted: false, blockedBy: 'daily-cap' };
        }
      }

      // 先记账再发钱：即便后续发放环节抛错，也不会留下"可再次领取"的窗口
      prof.rewardLedger[key] = Date.now();
      if (capKey) {
        prof.rewardDailyCounters![capKey] = (prof.rewardDailyCounters![capKey] || 0) + 1;
      }
      this.pruneRewardBookkeeping(prof);

      if (spec.exp) this.addExp(spec.exp);
      if (spec.coins) this.addCoins(spec.coins, spec.reason || '学习奖励', spec.icon || '🪙');
      this.touchSave();

      return { granted: true };
    },

    /**
     * 裁剪幂等账本与每日计数，避免档案体积随时间无限增长
     */
    pruneRewardBookkeeping(prof: ChildProfile) {
      const ledger = prof.rewardLedger;
      if (ledger) {
        const entries = Object.entries(ledger);
        if (entries.length > REWARD_LEDGER_MAX) {
          entries.sort((a, b) => b[1] - a[1]);
          prof.rewardLedger = Object.fromEntries(entries.slice(0, REWARD_LEDGER_KEEP));
        }
      }

      const counters = prof.rewardDailyCounters;
      if (counters) {
        const today = new Date().toLocaleDateString('en-CA');
        for (const counterKey of Object.keys(counters)) {
          if (!counterKey.endsWith(':' + today)) delete counters[counterKey];
        }
      }
    },

    addCoins(amount: number, reason = '获得金币', icon = '🪙') {
      if (!this.hasProfile || !amount) return;
      const prof = this.currentProfile;
      prof.coins = (prof.coins || 0) + amount;
      this.appendRewardLog(prof, 'coinLog', amount, reason, icon);
      this.touchSave();
      sound.playCoinSound();
    },

    spendCoins(amount: number, reason = '消费金币', icon = '🛒'): boolean {
      if (!this.hasProfile) return false;
      const prof = this.currentProfile;
      if ((prof.coins || 0) >= amount) {
        prof.coins = (prof.coins || 0) - amount;
        this.appendRewardLog(prof, 'coinLog', -amount, reason, icon);
        this.touchSave();
        return true;
      }
      return false;
    },

    unlockBadge(badgeId: string) {
      if (!this.hasProfile) return;
      const prof = this.currentProfile;
      if (!prof.badges) prof.badges = [];
      if (!prof.badges.includes(badgeId)) {
        prof.badges.push(badgeId);
        this.touchSave();
        const badge = BADGES_DATA.find(b => b.id === badgeId);
        if (badge) {
          this.addExp(badge.expReward);
          this.addCoins(badge.coinReward, '解锁勋章奖励', '🏅');
          sound.fireCelebrationConfetti();
        }
      }
    },

    recordGameEnd(won: boolean, captures: number, moves: number) {
      if (!this.hasProfile) return;
      const prof = this.currentProfile;
      if (!prof.stats) {
        prof.stats = { gamesPlayed: 0, gamesWon: 0, puzzlesSolved: 0, captureCount: 0, totalMoves: 0 };
      }
      prof.stats.gamesPlayed++;
      if (won) prof.stats.gamesWon++;
      prof.stats.captureCount += captures;
      prof.stats.totalMoves += moves;

      if (moves > 0) this.unlockBadge('first_move');
      if (captures > 0) this.unlockBadge('first_capture');
      if (prof.stats.captureCount >= 10) this.unlockBadge('capture_master_10');
      if (won) this.unlockBadge('defeat_puppy');
      this.touchSave();
    },

    recordPuzzleSolved(puzzleId?: string) {
      if (!this.hasProfile) return;
      const prof = this.currentProfile;
      if (!prof.solvedPuzzles) prof.solvedPuzzles = [];
      if (puzzleId && !prof.solvedPuzzles.includes(puzzleId)) {
        prof.solvedPuzzles.push(puzzleId);
      }
      if (!prof.stats) {
        prof.stats = { gamesPlayed: 0, gamesWon: 0, puzzlesSolved: 0, captureCount: 0, totalMoves: 0 };
      }
      prof.stats.puzzlesSolved = prof.solvedPuzzles.length;
      if (prof.stats.puzzlesSolved >= 10) {
        this.unlockBadge('tsumego_10');
      }
      this.touchSave();
    },

    recordMistake(puzzleId: string) {
      if (!this.hasProfile) return;
      const prof = this.currentProfile;
      if (!prof.mistakes) prof.mistakes = [];
      if (!prof.mistakes.includes(puzzleId)) {
        prof.mistakes.push(puzzleId);
        this.touchSave();
      }
    },

    resolveMistake(puzzleId: string) {
      if (!this.hasProfile) return;
      const prof = this.currentProfile;
      if (!prof.solvedMistakes) prof.solvedMistakes = [];
      if (!prof.solvedMistakes.includes(puzzleId)) {
        prof.solvedMistakes.push(puzzleId);
        this.addCoins(10, '消灭错题奖励', '💪');
        this.addExp(20);
        this.touchSave();
      }
    },

    buyAvatar(avatar: string, price: number): boolean {
      if (!this.hasProfile) return false;
      const prof = this.currentProfile;
      if (!prof.unlockedAvatars) prof.unlockedAvatars = ['🦁', '👶', '🐱', '🐼'];
      if (prof.unlockedAvatars.includes(avatar)) {
        prof.avatar = avatar;
        this.touchSave();
        sound.playButtonSound();
        return true;
      }
      if (this.spendCoins(price, '兑换头像', '😊')) {
        prof.unlockedAvatars.push(avatar);
        prof.avatar = avatar;
        this.touchSave();
        sound.playWinSound();
        sound.fireCelebrationConfetti();
        return true;
      }
      sound.playErrorSound();
      return false;
    },

    recordArcadeScore(
      gameType: 'speedCapture' | 'countLiberties' | 'connectCut',
      score: number,
      coinsEarned: number
    ) {
      if (!this.hasProfile) return;
      const prof = this.currentProfile;
      if (!prof.arcadeHighScores) {
        prof.arcadeHighScores = { speedCapture: 0, countLiberties: 0, connectCut: 0 };
      }
      if (score > (prof.arcadeHighScores[gameType] || 0)) {
        prof.arcadeHighScores[gameType] = score;
      }

      // 闯关没有天然业务 id：用「模式 + 当天 + 本局得分」当稳定标识，
      // 同一局重复结算算出同一个键，换局刷分则由每日封顶兜住
      this.grantRewardOnce(
        buildRewardKey('arcade', gameType, new Date().toLocaleDateString('en-CA'), score),
        {
          coins: Math.max(0, coinsEarned),
          exp: Math.round(score * 2),
          reason: '趣味闯关奖励',
          icon: '🎮',
          dailyCapId: 'arcade:' + gameType,
          dailyCapLimit: ARCADE_DAILY_REWARD_CAP
        }
      );
      this.touchSave();
    },

    recordCaptureGoWin(coinsEarned: number, expEarned: number, rewardKey: string) {
      if (!this.hasProfile) return;
      const prof = this.currentProfile;
      if (!prof.captureGoStats) {
        prof.captureGoStats = { wins: 0, matches: 0 };
      }
      prof.captureGoStats.matches++;
      prof.captureGoStats.wins++;
      this.grantRewardOnce(rewardKey, {
        coins: coinsEarned,
        exp: expEarned,
        reason: '吃子游戏获胜',
        icon: '🦁',
        dailyCapId: 'capture-go-win',
        dailyCapLimit: CAPTURE_GO_DAILY_REWARD_CAP
      });
      this.touchSave();
    },

    recordCaptureGoMatch() {
      if (!this.hasProfile) return;
      const prof = this.currentProfile;
      if (!prof.captureGoStats) {
        prof.captureGoStats = { wins: 0, matches: 0 };
      }
      prof.captureGoStats.matches++;
      this.touchSave();
    },

    recordSubjectMistake(payload: Omit<MistakeRecord, 'id' | 'createdAt' | 'resolved'>) {
      const prof = this.currentProfile;
      if (!prof.mistakeRecords) prof.mistakeRecords = [];
      const id = 'mr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      const cleanPrompt = normalizeMistakePrompt(payload.questionPrompt);
      const existing = prof.mistakeRecords.find(
        m => m.subjectId === payload.subjectId &&
             normalizeMistakePrompt(m.questionPrompt) === cleanPrompt
      );
      if (!existing) {
        prof.mistakeRecords.unshift({
          id,
          createdAt: Date.now(),
          resolved: false,
          wrongCount: 1,
          lastWrongAt: Date.now(),
          ...payload
        });
        if (prof.mistakeRecords.length > 200) prof.mistakeRecords.length = 200;
      } else {
        existing.resolved = false;
        existing.wrongCount = (existing.wrongCount || 1) + 1;
        existing.lastWrongAt = Date.now();
        existing.userAnswer = payload.userAnswer;
        existing.correctAnswer = payload.correctAnswer;
        if (payload.errorReason) existing.errorReason = payload.errorReason;
        if (payload.options) existing.options = payload.options;
        if (payload.template) existing.template = payload.template;
        
        if (payload.questionType) existing.questionType = payload.questionType;
      }

      if (payload.knowledgePointId) {
        this.recordKnowledgePractice(payload.knowledgePointId, false);
      }

      this.touchSave();
    },

    removeSubjectMistake(recordId: string) {
      const prof = this.currentProfile;
      if (!prof.mistakeRecords) return;
      const idx = prof.mistakeRecords.findIndex(m => m.id === recordId);
      if (idx >= 0) {
        prof.mistakeRecords.splice(idx, 1);
        this.touchSave();
      }
    },

    /**
     * 攻克错题奖励统一入口：按错题记录 id 幂等。
     *
     * 错题记录在「再次答错」时会被复用并重置 resolved，
     * 因此只靠 resolved 标记无法阻止「答错→攻克→再答错→再攻克」的循环刷奖。
     */
    grantMistakeResolveReward(recordId: string) {
      this.grantRewardOnce(buildRewardKey('mistake', recordId), {
        coins: MISTAKE_RESOLVE_COINS,
        exp: MISTAKE_RESOLVE_EXP,
        reason: '攻克错题(双倍金币)',
        icon: '💪'
      });
    },

    resolveSubjectMistake(recordId: string, removeImmediately = true) {
      const prof = this.currentProfile;
      if (!prof.mistakeRecords) prof.mistakeRecords = [];
      const idx = prof.mistakeRecords.findIndex(m => m.id === recordId);
      if (idx >= 0) {
        const item = prof.mistakeRecords[idx];
        if (!item.resolved) {
          if (item.knowledgePointId) {
            this.recordKnowledgePractice(item.knowledgePointId, true);
          }
          this.grantMistakeResolveReward(item.id);
        }
        if (removeImmediately) {
          prof.mistakeRecords.splice(idx, 1);
        } else {
          item.resolved = true;
          item.resolvedAt = Date.now();
        }
        this.touchSave();
      }
    },

    resolveMatchingMistake(subjectId: SubjectId, questionPrompt: string, removeImmediately = true) {
      const prof = this.currentProfile;
      if (!prof.mistakeRecords || prof.mistakeRecords.length === 0) return;
      const cleanPrompt = normalizeMistakePrompt(questionPrompt);
      const idx = prof.mistakeRecords.findIndex(
        m => m.subjectId === subjectId &&
             !m.resolved &&
             normalizeMistakePrompt(m.questionPrompt) === cleanPrompt
      );
      if (idx >= 0) {
        const item = prof.mistakeRecords[idx];
        const resolvedRecordId = item.id;
        if (removeImmediately) {
          prof.mistakeRecords.splice(idx, 1);
        } else {
          item.resolved = true;
          item.resolvedAt = Date.now();
        }
        this.grantMistakeResolveReward(resolvedRecordId);
        this.touchSave();
      }
    },

    clearResolvedMistakes(subjectId?: SubjectId) {
      const prof = this.currentProfile;
      if (!prof.mistakeRecords) return;
      if (subjectId) {
        prof.mistakeRecords = prof.mistakeRecords.filter(m => !(m.resolved && m.subjectId === subjectId));
      } else {
        prof.mistakeRecords = prof.mistakeRecords.filter(m => !m.resolved);
      }
      this.touchSave();
    },

    purgeDemoMistakes() {
      const prof = this.currentProfile;
      if (!prof.mistakeRecords || prof.mistakeRecords.length === 0) return;
      const next = prof.mistakeRecords.filter(m => !String(m.id || '').startsWith('sample_'));
      if (next.length === prof.mistakeRecords.length) return;
      prof.mistakeRecords = next;
      this.touchSave();
    },

    resetCurrentProfileProgress() {
      if (!this.hasProfile) return;
      const prof = this.currentProfile;
      prof.exp = 0;
      prof.coins = 0;
      prof.totalStars = 0;
      prof.coinLog = [];
      prof.starLog = [];
      // 家长主动重置进度视为重新开始学习，幂等账本一并清空
      prof.rewardLedger = {};
      prof.rewardDailyCounters = {};
      prof.progress = {};
      prof.badges = [];
      prof.solvedPuzzles = [];
      prof.unlockedAvatars = ['🦁', '👶', '🐱', '🐼'];
      prof.mistakes = [];
      prof.solvedMistakes = [];
      prof.mistakeRecords = [];
      prof.knowledgeMastery = {};
      prof.arcadeHighScores = { speedCapture: 0, countLiberties: 0, connectCut: 0 };
      prof.captureGoStats = { wins: 0, matches: 0 };
      prof.stats = {
        gamesPlayed: 0,
        gamesWon: 0,
        puzzlesSolved: 0,
        captureCount: 0,
        totalMoves: 0,
        totalQuestionsAnswered: 0,
        totalStudyMinutes: 0
      };
      this.touchSave();
      sound.playButtonSound();
    },

    toggleSound() {
      this.soundEnabled = !this.soundEnabled;
      sound.enabled = this.soundEnabled;
      this.touchSave();
    },

    setVolume(val: number) {
      this.volume = val;
      sound.volume = val;
      this.touchSave();
    },

    performDailyCheckIn(): { isNewCheckIn: boolean; streak: number; rewardCoins: number } {
      if (!this.hasProfile) return { isNewCheckIn: false, streak: 1, rewardCoins: 0 };
      const prof = this.currentProfile;
      const today = new Date().toLocaleDateString('en-CA');
      const last = prof.lastCheckInDate;

      if (last === today) {
        return {
          isNewCheckIn: false,
          streak: Math.max(1, Math.min(7, prof.checkInStreak || 1)),
          rewardCoins: 0
        };
      }

      let newStreak = 1;
      if (last) {
        const lastDate = new Date(last);
        const nowDate = new Date(today);
        const diffDays = Math.round((nowDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          newStreak = ((prof.checkInStreak || 1) % 7) + 1;
        }
      }

      prof.lastCheckInDate = today;
      prof.checkInStreak = newStreak;
      const coinsGained = newStreak === 7 ? 50 : 15;
      this.addCoins(coinsGained, newStreak === 7 ? '连续打卡满7天大奖' : '每日打卡奖励', '📅');
      this.touchSave();

      return {
        isNewCheckIn: true,
        streak: newStreak,
        rewardCoins: coinsGained
      };
    },


    claimDailyQuestsReward(): { success: boolean; coins: number; exp: number } {
      if (!this.hasProfile) return { success: false, coins: 0, exp: 0 };
      const prof = this.currentProfile;
      const today = new Date().toLocaleDateString("en-CA");
      if (prof.lastDailyQuestsClaimDate === today) {
        return { success: false, coins: 0, exp: 0 };
      }
      prof.lastDailyQuestsClaimDate = today;
      this.addCoins(50, "每日全勤通关大奖", "🎁");
      this.addExp(100);
      this.touchSave();
      return { success: true, coins: 50, exp: 100 };
    },

    claimDailyRiddleReward(): { success: boolean; coins: number } {
      if (!this.hasProfile) return { success: false, coins: 0 };
      const prof = this.currentProfile;
      const today = new Date().toLocaleDateString("en-CA");
      if (prof.lastDailyRiddleDate === today) {
        return { success: false, coins: 0 };
      }
      prof.lastDailyRiddleDate = today;
      this.addCoins(30, "每日一谜打卡奖励", "🎉");
      this.touchSave();
      return { success: true, coins: 30 };
    },

    toggleTouchConfirm() {
      this.touchConfirmEnabled = !this.touchConfirmEnabled;
      this.touchSave();
    }
  },

  persist: true
});






