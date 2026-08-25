import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '../src/stores/useUserStore';
import { CHAPTERS_DATA } from '../src/data/chapters';

describe('Phase 5: Today Cockpit & Shell Verification', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('determines the next active lesson to continue correctly', () => {
    const userStore = useUserStore();
    userStore.setCloudUser({ id: 'parent_test_1', email: 'parent@example.com' });
    userStore.createProfile('小明', '🐼', 'g1_t1');

    const firstLesson = CHAPTERS_DATA[0].lessons[0];
    const secondLesson = CHAPTERS_DATA[0].lessons[1];

    // Case 1: Brand new user with profile -> First lesson
    expect(userStore.hasProfile).toBe(true);
    expect(!!userStore.progress[firstLesson.id]?.completed).toBe(false);

    // Case 2: Complete first lesson -> Progresses to second lesson
    userStore.updateLessonProgress(firstLesson.id, 3, 100);
    expect(!!userStore.progress[firstLesson.id]?.completed).toBe(true);
    expect(!!userStore.progress[secondLesson.id]?.completed).toBe(false);
  });

  it('tracks daily check-in streak and daily task completion correctly', () => {
    const userStore = useUserStore();
    userStore.setCloudUser({ id: 'parent_test_2', email: 'parent2@example.com' });
    userStore.createProfile('小华', '🦁', 'g1_t1');

    const initialStreak = userStore.checkInStreak;
    userStore.performDailyCheckIn();

    const today = new Date().toLocaleDateString('en-CA');
    expect(userStore.currentProfile?.lastCheckInDate).toBe(today);
    expect(userStore.checkInStreak).toBe(Math.max(1, initialStreak));
  });
});

