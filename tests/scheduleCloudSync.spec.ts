import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useScheduleStore } from '../src/stores/useScheduleStore';
import { useUserStore } from '../src/stores/useUserStore';

describe('Schedule Cloud Sync & Profile Persistence', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should persist schedule, version records and custom subjects into user profile for cloud sync', () => {
    const userStore = useUserStore();
    const scheduleStore = useScheduleStore();

    // 准备一个测试学员档案
    userStore.profiles = [
      {
        id: 'child_yinuo_test',
        nickname: '诺宝',
        avatar: '👦',
        createdAt: Date.now(),
        gradeLevel: 'g1_t1',
        progress: {},
        totalStars: 10,
        badges: [],
        solvedPuzzles: [],
        unlockedAvatars: [],
        mistakes: [],
        solvedMistakes: [],
        mistakeRecords: [],
        knowledgeMastery: {},
        stats: {
          gamesPlayed: 0,
          gamesWon: 0,
          puzzlesSolved: 0,
          captureCount: 0,
          totalMoves: 0
        }
      }
    ];
    userStore.currentProfileId = 'child_yinuo_test';
    userStore.isLoggedIn = true;

    // 1. 添加自定义科目并排课
    const customSubj = scheduleStore.addCustomSubject({
      name: '乐高机器人',
      defaultTeacher: '胡老师'
    });
    scheduleStore.setCellSchedule(1, 3, customSubj.id, '胡老师');

    // 2. 另存为一个新版本
    scheduleStore.saveNewVersionRecord({
      gradeYear: 'g1',
      gradeLabel: '一年级',
      term: 'term1',
      termLabel: '上学期',
      versionDate: '2026.09.15',
      title: '9月中旬微调版',
      setAsCurrent: true
    });

    // 验证学员档案上的 schedule 快照（即将随 touchSave 推送至 Supabase 云端的载荷）
    const profileSchedule = userStore.currentProfile.schedule;
    expect(profileSchedule).toBeDefined();
    expect(profileSchedule?.grid['1-3']).toBe(customSubj.id);
    expect(profileSchedule?.versionRecords).toBeDefined();
    expect(profileSchedule?.versionRecords?.length).toBeGreaterThanOrEqual(2);
    expect(profileSchedule?.versionRecords?.some(r => r.versionDate === '2026.09.15')).toBe(true);
    expect(profileSchedule?.customSubjects?.some(s => s.name === '乐高机器人')).toBe(true);

    // 3. 模拟在新设备上登录并还原 (hydrateFromProfile)
    const newScheduleStore = useScheduleStore();
    newScheduleStore.hydrateFromProfile();

    expect(newScheduleStore.cellSubject(1, 3).name).toBe('乐高机器人');
    expect(newScheduleStore.cellTeacher(1, 3)).toBe('胡老师');
    expect(newScheduleStore.versionRecords.some(r => r.versionDate === '2026.09.15')).toBe(true);
  });
});

