import { defineStore } from 'pinia';
import { USER_RANKS, type UserRank, BADGES_DATA, type AchievementBadge } from '../data/achievementsData';
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
export interface ChildProfile {
  id: string;
  nickname: string;
  avatar: string;
  createdAt: number;
  progress: Record<string, { completed: boolean; stars: number; highscore?: number; completedAt?: string }>;
  totalStars: number;
  badges: string[];
  solvedPuzzles: string[];
  unlockedThemes?: string[];
  unlockedAvatars?: string[];
  mistakes?: string[];
  solvedMistakes?: string[];
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
  };
}

const EMPTY_PLACEHOLDER_PROFILE: ChildProfile = {
  id: '',
  nickname: '未登录',
  avatar: '👶',
  createdAt: 0,
  progress: {},
  totalStars: 0,
  badges: [],
  solvedPuzzles: [],
  unlockedThemes: ['wood'],
  unlockedAvatars: ['🦁', '👶', '🐱', '🐼'],
  mistakes: [],
  solvedMistakes: [],
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
    totalMoves: 0
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
          totalMoves: 0
        };
      }
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
    }
  },

  actions: {
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
     * 未登录弹出登录弹窗，已登录无宝贝档案弹出创建宝贝弹窗
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

      // Fetch cloud data directly
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

      // If user has no child profiles yet, prompt to create one!
      if (this.profiles.length === 0) {
        this.isProfileModalOpen = true;
      }

      this.lastSavedAt = Date.now();
    },

    /**
     * 清除登录状态与本地内存缓存
     */
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

    /**
     * 应用启动时自动恢复 Supabase 登录会话
     */
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

        // Listen to Supabase auth events in real-time
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

    /**
     * 实时保存当前所有档案至 Supabase 云数据库
     */
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

    /**
     * 节流实时保存 (Debounced Real-time Cloud Save)
     */
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

    createProfile(nickname: string, avatar: string): ChildProfile | null {
      if (!this.isLoggedIn) {
        this.openAuthModal();
        return null;
      }

      const trimmed = nickname.trim() || '小棋手';
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
        progress: {},
        totalStars: 0,
        badges: [],
        solvedPuzzles: [],
        unlockedThemes: ['wood'],
        unlockedAvatars: Array.from(new Set(['🦁', '👶', '🐱', '🐼', pickedAvatar])),
        mistakes: [],
        solvedMistakes: [],
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
          totalMoves: 0
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

    updateLessonProgress(
      lessonId: string,
      stars: number,
      rewards: { exp?: number; coins?: number } = {}
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
      }

      if (rewards.exp) this.addExp(rewards.exp);
      if (rewards.coins) this.addCoins(rewards.coins);

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

    addCoins(amount: number) {
      if (!this.hasProfile) return;
      this.currentProfile.coins = (this.currentProfile.coins || 0) + amount;
      this.touchSave();
      sound.playCoinSound();
    },

    spendCoins(amount: number): boolean {
      if (!this.hasProfile) return false;
      const prof = this.currentProfile;
      if ((prof.coins || 0) >= amount) {
        prof.coins = (prof.coins || 0) - amount;
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
          this.addCoins(badge.coinReward);
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
        this.addCoins(10);
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
      if (this.spendCoins(price)) {
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
      if (this.spendCoins(price)) {
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
      if (coinsEarned > 0) this.addCoins(coinsEarned);
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
      this.addCoins(coinsEarned);
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

    resetCurrentProfileProgress() {
      if (!this.hasProfile) return;
      const prof = this.currentProfile;
      prof.exp = 0;
      prof.coins = 0;
      prof.totalStars = 0;
      prof.progress = {};
      prof.badges = [];
      prof.solvedPuzzles = [];
      prof.unlockedThemes = ['wood'];
      prof.unlockedAvatars = ['🦁', '👶', '🐱', '🐼'];
      prof.mistakes = [];
      prof.solvedMistakes = [];
      prof.arcadeHighScores = { speedCapture: 0, countLiberties: 0, connectCut: 0 };
      prof.captureGoStats = { wins: 0, matches: 0 };
      prof.stats = {
        gamesPlayed: 0,
        gamesWon: 0,
        puzzlesSolved: 0,
        captureCount: 0,
        totalMoves: 0
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

    toggleTouchConfirm() {
      this.touchConfirmEnabled = !this.touchConfirmEnabled;
      this.touchSave();
    }
  },

  persist: true
});

