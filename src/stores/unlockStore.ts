import { defineStore } from 'pinia';
import { UNLOCK_FEATURES, type UnlockFeature } from '../data/unlockRules';
import { useUserStore } from './useUserStore';
import { sound } from '../utils/sound';

export const useUnlockStore = defineStore('unlockStore', {
  state: () => ({
    lastSeenUnlockedModalFeatureId: '' as string,
    showCelebrationModal: false as boolean,
    currentCelebrationFeature: null as UnlockFeature | null
  }),

  getters: {
    completedLessonsCount(): number {
      const userStore = useUserStore();
      const prog = userStore.progress;
      if (!prog) return 0;
      let count = 0;
      for (const key in prog) {
        if (prog[key]?.completed) {
          count++;
        }
      }
      return count;
    },

    isFeatureUnlocked(): (featureId: string) => boolean {
      return (featureId: string): boolean => {
        const feat = UNLOCK_FEATURES.find(f => f.id === featureId);
        if (!feat) return true;
        if (feat.lessonsRequired === 0) return true;
        return this.completedLessonsCount >= feat.lessonsRequired;
      };
    },

    getFeature(): (featureId: string) => UnlockFeature | undefined {
      return (featureId: string) => UNLOCK_FEATURES.find(f => f.id === featureId);
    },

    allFeatures(): UnlockFeature[] {
      return UNLOCK_FEATURES;
    },

    featuresByCategory(): Record<string, UnlockFeature[]> {
      return {
        learn: UNLOCK_FEATURES.filter(f => f.category === 'learn'),
        battle: UNLOCK_FEATURES.filter(f => f.category === 'battle'),
        practice: UNLOCK_FEATURES.filter(f => f.category === 'practice'),
        profile: UNLOCK_FEATURES.filter(f => f.category === 'profile')
      };
    },

    nextLockedFeature(): UnlockFeature | null {
      const locked = UNLOCK_FEATURES.filter(f => !this.isFeatureUnlocked(f.id));
      if (locked.length === 0) return null;
      // Sort by lessonsRequired ascending
      locked.sort((a, b) => a.lessonsRequired - b.lessonsRequired);
      return locked[0];
    },

    unlockedCount(): number {
      return UNLOCK_FEATURES.filter(f => this.isFeatureUnlocked(f.id)).length;
    }
  },

  actions: {
    checkNewUnlocks(previousLessonCount: number, currentLessonCount: number) {
      if (currentLessonCount <= previousLessonCount) return;
      const newlyUnlocked = UNLOCK_FEATURES.filter(
        f => f.lessonsRequired > previousLessonCount && f.lessonsRequired <= currentLessonCount
      );
      if (newlyUnlocked.length > 0) {
        this.currentCelebrationFeature = newlyUnlocked[0];
        this.showCelebrationModal = true;
        sound.playWinSound();
        sound.fireCelebrationConfetti();
      }
    },

    closeCelebrationModal() {
      this.showCelebrationModal = false;
      this.currentCelebrationFeature = null;
    }
  }
});

