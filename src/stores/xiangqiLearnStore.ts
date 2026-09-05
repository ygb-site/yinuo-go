import { defineStore } from 'pinia';
import { XIANGQI_ENDGAMES, XIANGQI_LESSONS } from '../data/xiangqiCurriculum';
import { useUserStore } from './useUserStore';

export const useXiangqiLearnStore = defineStore('xiangqiLearn', {
  state: () => ({
    completedLessonIds: {} as Record<string, { stars: number; at: number }>
  }),
  getters: {
    completedCount(state): number {
      return Object.keys(state.completedLessonIds).length;
    },
    isLessonCompleted(state) {
      return (lessonId: string): boolean => Boolean(state.completedLessonIds[lessonId]);
    },
    isLessonUnlocked(state) {
      return (lessonId: string): boolean => {
        const idx = XIANGQI_LESSONS.findIndex((item) => item.id === lessonId);
        if (idx <= 0) return true;
        return Boolean(state.completedLessonIds[XIANGQI_LESSONS[idx - 1].id]);
      };
    },
    solvedEndgameCount(): number {
      const userStore = useUserStore();
      return XIANGQI_ENDGAMES.filter((item) => userStore.solvedPuzzles.includes(item.id)).length;
    },
    isEndgameSolved() {
      return (id: string): boolean => {
        const userStore = useUserStore();
        return userStore.solvedPuzzles.includes(id);
      };
    }
  },
  actions: {
    completeLesson(lessonId: string, stars = 3) {
      if (!this.completedLessonIds[lessonId]) {
        const userStore = useUserStore();
        userStore.addExp(60);
        userStore.addCoins(20);
      }
      this.completedLessonIds[lessonId] = {
        stars,
        at: Date.now()
      };
    },
    completeEndgame(endgameId: string) {
      const userStore = useUserStore();
      const first = !userStore.solvedPuzzles.includes(endgameId);
      userStore.recordPuzzleSolved(endgameId);
      if (first) {
        userStore.addExp(80);
        userStore.addCoins(30);
      }
    }
  },
  persist: {
    key: 'yinuo_xiangqi_learn_v1',
    storage: localStorage
  }
});
