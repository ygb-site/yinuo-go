import type {
  SubjectId,
  MistakeRecord,
  KnowledgeMasteryRecord,
  StudentLearningProfile,
  GradeLevel
} from '../types/curriculum';
import { defineStore } from 'pinia';
import { USER_RANKS, type UserRank, BADGES_DATA, type AchievementBadge } from '../data/achievementsData';
import { KNOWLEDGE_POINTS_REPOSITORY } from '../data/knowledgePointsData';
import { sound } from '../utils/sound';
import type { ThemeType } from '../engine/types';
import {
  saveUserDataToCloud,
  fetchUserProfile,
  getCurrentCloudUser,
} from '../services/cloudSyncService';
import { isSupabaseConfigured, getSupabaseClient } from '../lib/supabase';

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

export interface ChildProfile {
  id: string;
  nickname: string;
  avatar: string;
  createdAt: number;
  gradeLevel?: GradeLevel;
  progress: Record<string, { completed: boolean; stars: number; highscore?: number; completedAt?: string }>;
  totalStars: number;
  badges: string[];
  solvedPuzzles: string[];
  unlockedThemes?: string[];
  unlockedAvatars?: string[];
  mistakes?: string[];
  lastCheckInDate?: string;
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

const EMPTY_PLACEHOLDER_PROFILE: ChildProfile = {
  id: '',
  nickname: '未登录',
  avatar: '👶',
  createdAt: 0,
  gradeLevel: 'g1_t1',
  progress: {},
  totalStars: 0,
  badges: [],
  solvedPuzzles: [],
  unlockedThemes: ['wood'],
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

let syncTimer: ReturnType<typeof setTimeout> | null = null;

export const useUserStore = defineStore('userStore', {
  state: () => ({
    // 🔐 纯云端登录与权限状态 (Cloud Auth & Role State)
    isLoggedIn: false as boolean,
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
    theme: 'wood' as ThemeType,
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
      if (!found.unlockedThemes) found.unlockedThemes = ['wood'];
      if (!found.unlockedAvatars) found.unlockedAvatars = ['🦁', '👶', '🐱', '🐼'];
      if (!found.mistakes) found.mistakes = [];
      if (!found.solvedMistakes) found.solvedMistakes = [];
      if (!found.mistakeRecords) found.mistakeRecords = [];
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

    unlockedThemes(): string[] {
      return this.currentProfile.unlockedThemes || ['wood'];
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
      return this.currentProfile.mistakeRecords || [];
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
        math: { sum: 0, n: 0 },
        chinese: { sum: 0, n: 0 },
        english: { sum: 0, n: 0 },
        go: { sum: 0, n: 0 }
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
        math: scoreOf(subjectTotals.math),
        chinese: scoreOf(subjectTotals.chinese),
        english: scoreOf(subjectTotals.english),
        go: scoreOf(subjectTotals.go)
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

    /**
     * 统一鉴权拦截器 (Auth Guard Helper)
     */
    requireAuth(): boolean {
      if (!this.isLoggedIn) {
        this.openAuthModal();
        return false;
      }
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
      if (row) {
        this.isAdmin = Boolean(row.is_admin);
        this.profiles = row.profiles_data || [];
        this.currentProfileId = row.active_profile_id || (this.profiles[0]?.id || '');
        if (row.settings_data) {
          if (row.settings_data.theme) this.theme = row.settings_data.theme;
          if (typeof row.settings_data.soundEnabled === 'boolean') this.soundEnabled = row.settings_data.soundEnabled;
          if (typeof row.settings_data.volume === 'number') this.volume = row.settings_data.volume;
        }
      }

      this.lastSavedAt = Date.now();
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

        client.auth.onAuthStateChange(async (event, session) => {
          if (session && session.user) {
            await this.setCloudUser(session.user.id, session.user.email || '');
          } else if (event === 'SIGNED_OUT') {
            this.clearCloudUser();
          }
        });
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
            theme: this.theme,
            soundEnabled: this.soundEnabled,
            volume: this.volume
          }
        );

        this.isSyncing = false;

        if (res.success) {
          this.lastSavedAt = res.timestamp || Date.now();
          return true;
        } else {
          this.syncError = res.error || '云端保存失败';
          return false;
        }
      } catch (err: any) {
        this.isSyncing = false;
        this.syncError = err?.message || '网络连接异常';
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

    createProfile(nickname: string, avatar: string, gradeLevel: GradeLevel = 'g1_t1'): ChildProfile | null {
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
      const newProfile: ChildProfile = {
        id: newId,
        nickname: trimmed,
        avatar: pickedAvatar,
        createdAt: Date.now(),
        gradeLevel,
        progress: {},
        totalStars: 0,
        badges: [],
        solvedPuzzles: [],
        unlockedThemes: ['wood'],
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

    buyTheme(themeId: ThemeType, price: number): boolean {
      if (!this.hasProfile) return false;
      const prof = this.currentProfile;
      if (!prof.unlockedThemes) prof.unlockedThemes = ['wood'];
      if (prof.unlockedThemes.includes(themeId)) {
        this.setTheme(themeId);
        return true;
      }
      if (this.spendCoins(price, '兑换棋盘皮肤', '🎨')) {
        prof.unlockedThemes.push(themeId);
        this.setTheme(themeId);
        this.touchSave();
        sound.playWinSound();
        sound.fireCelebrationConfetti();
        return true;
      }
      sound.playErrorSound();
      return false;
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
      if (coinsEarned > 0) this.addCoins(coinsEarned, '趣味闯关奖励', '🎮');
      this.addExp(Math.round(score * 2));
      this.touchSave();
    },

    recordCaptureGoWin(coinsEarned: number, expEarned: number) {
      if (!this.hasProfile) return;
      const prof = this.currentProfile;
      if (!prof.captureGoStats) {
        prof.captureGoStats = { wins: 0, matches: 0 };
      }
      prof.captureGoStats.matches++;
      prof.captureGoStats.wins++;
      this.addCoins(coinsEarned, '吃子游戏获胜', '🦁');
      this.addExp(expEarned);
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
      if (!this.hasProfile) return;
      const prof = this.currentProfile;
      if (!prof.mistakeRecords) prof.mistakeRecords = [];
      const id = 'mr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      const existing = prof.mistakeRecords.find(
        m => m.subjectId === payload.subjectId && m.questionPrompt === payload.questionPrompt && !m.resolved
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
        if (prof.mistakeRecords.length > 50) prof.mistakeRecords.length = 50;
      } else {
        existing.wrongCount = (existing.wrongCount || 1) + 1;
        existing.lastWrongAt = Date.now();
      }

      if (payload.knowledgePointId) {
        this.recordKnowledgePractice(payload.knowledgePointId, false);
      }

      this.touchSave();
    },

    resolveSubjectMistake(recordId: string) {
      if (!this.hasProfile) return;
      const prof = this.currentProfile;
      if (!prof.mistakeRecords) prof.mistakeRecords = [];
      const item = prof.mistakeRecords.find(m => m.id === recordId);
      if (item && !item.resolved) {
        item.resolved = true;
        item.resolvedAt = Date.now();
        if (item.knowledgePointId) {
          this.recordKnowledgePractice(item.knowledgePointId, true);
        }
        this.addCoins(30, '攻克错题(双倍金币)', '💪');
        this.addExp(40);
        this.touchSave();
      }
    },

    resetCurrentProfileProgress() {
      if (!this.hasProfile) return;
      const prof = this.currentProfile;
      prof.exp = 0;
      prof.coins = 0;
      prof.totalStars = 0;
      prof.coinLog = [];
      prof.starLog = [];
      prof.progress = {};
      prof.badges = [];
      prof.solvedPuzzles = [];
      prof.unlockedThemes = ['wood'];
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

    setTheme(theme: ThemeType) {
      this.theme = theme;
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

    toggleTouchConfirm() {
      this.touchConfirmEnabled = !this.touchConfirmEnabled;
      this.touchSave();
    }
  },

  persist: true
});


