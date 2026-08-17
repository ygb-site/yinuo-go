import { defineStore } from 'pinia';
import { USER_RANKS, type UserRank, BADGES_DATA, type AchievementBadge } from '../data/achievementsData';
import { sound } from '../utils/sound';
import type { ThemeType } from '../engine/types';

/**
 * 独立儿童用户档案 (Child Profile Data Structure)
 * 零默认预设、纯前端 LocalStorage 本地持久化隔离
 */
export interface ChildProfile {
  id: string; // 唯一标识 uuid
  nickname: string; // 宝贝昵称 (如: 乐乐、小葡萄)
  avatar: string; // 卡通头像标识 (如: 🦁, 🐰, 🐼, 🐱, 🦊, 🐶, 🦄, 🐯, 🐨, 🤖)
  createdAt: number;
  progress: Record<string, { completed: boolean; stars: number; highscore?: number; completedAt?: string }>;
  totalStars: number;
  badges: string[]; // 已获得成就徽章
  solvedPuzzles: string[]; // 已攻克的死活题 ID 列表
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
  nickname: '未创建宝贝',
  avatar: '👶',
  createdAt: 0,
  progress: {},
  totalStars: 0,
  badges: [],
  solvedPuzzles: [],
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

export const useUserStore = defineStore('userStore', {
  state: () => ({
    // 多儿童档案列表 (默认空数组，完全零默认预设用户，由用户首次自行创建)
    profiles: [] as ChildProfile[],
    currentProfileId: '' as string,

    // 全局偏好设置 (Global App Settings)
    theme: 'wood' as ThemeType,
    soundEnabled: true,
    volume: 0.8,
    showLibertiesOverlay: true,
    showAtariAlerts: true,
    showTerritoryHeatmap: false,

    // 实时存储元信息
    lastSavedAt: Date.now()
  }),

  getters: {
    hasProfile(state): boolean {
      return state.profiles.length > 0;
    },

    currentProfile(state): ChildProfile {
      if (state.profiles.length === 0) {
        return EMPTY_PLACEHOLDER_PROFILE;
      }
      let found = state.profiles.find(p => p.id === state.currentProfileId);
      if (!found) {
        state.currentProfileId = state.profiles[0].id;
        found = state.profiles[0];
      }
      // 保证字段完整性
      if (!found.badges) found.badges = [];
      if (!found.solvedPuzzles) found.solvedPuzzles = [];
      if (!found.progress) found.progress = {};
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
    // 标记实时保存更新
    touchSave() {
      this.lastSavedAt = Date.now();
    },

    // 1. 创建新宝贝档案 (零默认初始数据，干净起步)
    createProfile(nickname: string, avatar: string): ChildProfile {
      const newId = 'kid_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const newProfile: ChildProfile = {
        id: newId,
        nickname: nickname.trim() || '小棋手',
        avatar: avatar || '🦁',
        createdAt: Date.now(),
        progress: {},
        totalStars: 0,
        badges: [], // 干净起步，0 初始徽章
        solvedPuzzles: [],
        exp: 0,
        coins: 0, // 干净起步，0 初始金币
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
      this.touchSave();
      sound.playWinSound();
      sound.fireCelebrationConfetti();
      return newProfile;
    },

    // 2. 切换当前宝贝角色
    switchProfile(id: string) {
      const target = this.profiles.find(p => p.id === id);
      if (target) {
        this.currentProfileId = id;
        this.touchSave();
        sound.playButtonSound();
      }
    },

    // 3. 删除指定宝贝档案
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

    // 清空所有档案与旧测试数据 (重置为零用户初始状态)
    clearAllProfiles() {
      this.profiles = [];
      this.currentProfileId = '';
      this.touchSave();
      sound.playButtonSound();
    },

    // 4. 更新当前宝贝关卡进度与星级
    updateLessonProgress(
      lessonId: string,
      stars: number,
      rewards: { exp?: number; coins?: number } = {}
    ) {
      if (this.profiles.length === 0) return;
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

      // 解锁首次落子与通关徽章
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

    // 5. 获得经验与升级检测
    addExp(amount: number) {
      if (this.profiles.length === 0) return;
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

    // 6. 获得金币
    addCoins(amount: number) {
      if (this.profiles.length === 0) return;
      this.currentProfile.coins = (this.currentProfile.coins || 0) + amount;
      this.touchSave();
      sound.playCoinSound();
    },

    // 7. 解锁徽章
    unlockBadge(badgeId: string) {
      if (this.profiles.length === 0) return;
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

    // 8. 记录对局结束
    recordGameEnd(won: boolean, captures: number, moves: number) {
      if (this.profiles.length === 0) return;
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

    // 9. 记录死活题解题
    recordPuzzleSolved(puzzleId?: string) {
      if (this.profiles.length === 0) return;
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

    // 10. 重置当前宝贝进度
    resetCurrentProfileProgress() {
      if (this.profiles.length === 0) return;
      const prof = this.currentProfile;
      prof.exp = 0;
      prof.coins = 0;
      prof.totalStars = 0;
      prof.progress = {};
      prof.badges = [];
      prof.solvedPuzzles = [];
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
    }
  },

  persist: {
    key: 'yinuo_go_user_store',
    storage: localStorage
  }
});

