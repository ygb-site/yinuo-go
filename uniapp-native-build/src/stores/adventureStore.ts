import { defineStore } from 'pinia';
import { CURRICULUM_CHAPTERS } from '../data/curriculum';
import { CHAPTERS_DATA } from '../data/chapters';
import { useUserStore } from './useUserStore';
import { sound } from '../utils/sound';

export interface LevelProgress {
  stars: number;
  completedAt: string;
  attempts?: number;
}

export const useAdventureStore = defineStore('adventure', {
  state: () => ({
    currentLevelId: 'lesson_1_1'
  }),
  getters: {
    // 动态返回当前活跃宝贝的关卡记录
    completedLevels(): Record<string, LevelProgress> {
      const userStore = useUserStore();
      const res: Record<string, LevelProgress> = {};
      const prog = userStore.progress;
      for (const key in prog) {
        res[key] = {
          stars: prog[key].stars || 0,
          completedAt: prog[key].completedAt || new Date().toISOString()
        };
      }
      return res;
    },

    totalStarsEarned(): number {
      const userStore = useUserStore();
      return userStore.totalStars;
    },

    isLevelUnlocked() {
      return (levelId: string): boolean => {
        // 第一关永远解锁
        if (levelId === 'lesson_1_1' || levelId === 'c1_l1') return true;

        const userStore = useUserStore();
        const prog = userStore.progress;

        // Flatten all lessons across chapters
        const allList: { id: string }[] = [];
        for (const c of CHAPTERS_DATA) {
          allList.push(...c.lessons);
        }
        for (const c of CURRICULUM_CHAPTERS) {
          allList.push(...c.levels);
        }

        const idx = allList.findIndex(l => l.id === levelId);
        if (idx <= 0) return true;

        const prev = allList[idx - 1];
        return !!prog[prev.id]?.completed;
      };
    },

    getChapterProgress() {
      return (chapterId: number) => {
        const userStore = useUserStore();
        const prog = userStore.progress;

        const chapter =
          CHAPTERS_DATA.find(c => c.id === chapterId) ||
          CURRICULUM_CHAPTERS.find(c => c.id === chapterId);

        if (!chapter) return { completed: 0, total: 0, stars: 0, totalStars: 0, percent: 0 };
        const lessons = 'lessons' in chapter ? chapter.lessons : chapter.levels;
        const total = lessons.length;
        const totalStars = total * 3;
        let completed = 0;
        let stars = 0;

        for (const lvl of lessons) {
          const rec = prog[lvl.id];
          if (rec && rec.completed) {
            completed++;
            stars += rec.stars || 0;
          }
        }

        return {
          completed,
          total,
          stars,
          totalStars,
          percent: total > 0 ? Math.round((completed / total) * 100) : 0
        };
      };
    }
  },
  actions: {
    completeLevel(levelId: string, stars: number, rewards: { exp: number; coins: number }) {
      const userStore = useUserStore();
      userStore.updateLessonProgress(levelId, stars, rewards);
      sound.playWinSound();
      sound.fireCelebrationConfetti();
    }
  },
  persist: true
});


