import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '../src/stores/useUserStore';

describe('Daily Quest & Rewards Single-Claim Guarantee Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should only allow claiming daily quests bonus once per day', () => {
    const userStore = useUserStore();
    userStore.setCloudUser({ id: 'test_user_1', email: 'test@yinuogo.cn' });
    userStore.createProfile('小明', '👶', 'g1_t1');

    const initialCoins = userStore.coins;
    const initialExp = userStore.currentProfile.exp;

    // 1st Claim -> Success
    const res1 = userStore.claimDailyQuestsReward();
    expect(res1.success).toBe(true);
    expect(res1.coins).toBe(50);
    expect(res1.exp).toBe(100);
    expect(userStore.coins).toBe(initialCoins + 50);
    expect(userStore.currentProfile.exp).toBe(initialExp + 100);

    // 2nd Claim on same day -> Must Fail / Disallowed
    const res2 = userStore.claimDailyQuestsReward();
    expect(res2.success).toBe(false);
    expect(res2.coins).toBe(0);
    expect(res2.exp).toBe(0);
    expect(userStore.coins).toBe(initialCoins + 50); // Unchanged
    expect(userStore.currentProfile.exp).toBe(initialExp + 100); // Unchanged
  });

  it('should only allow claiming daily riddle bonus once per day', () => {
    const userStore = useUserStore();
    userStore.setCloudUser({ id: 'test_user_2', email: 'test@yinuogo.cn' });
    userStore.createProfile('小红', '🐱', 'g1_t1');

    const initialCoins = userStore.coins;

    // 1st Claim -> Success
    const res1 = userStore.claimDailyRiddleReward();
    expect(res1.success).toBe(true);
    expect(res1.coins).toBe(30);
    expect(userStore.coins).toBe(initialCoins + 30);

    // 2nd Claim on same day -> Must Fail
    const res2 = userStore.claimDailyRiddleReward();
    expect(res2.success).toBe(false);
    expect(userStore.coins).toBe(initialCoins + 30); // Unchanged
  });
});
