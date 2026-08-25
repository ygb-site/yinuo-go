import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '../src/stores/useUserStore';
import { buildRewardKey, stableHash } from '../src/utils/rewardKey';
import { buildMatchRewardKey, isRewardableMatch, MIN_REWARDED_MOVES } from '../src/utils/matchReward';

function createLoggedInStore(seed = '1') {
  const userStore = useUserStore();
  userStore.setCloudUser('parent_' + seed, 'parent' + seed + '@example.com');
  userStore.createProfile('宝贝' + seed, '🐼', 'g1_t1');
  return userStore;
}

describe('统一幂等奖励入口', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('同一幂等键重复触发 N 次，只结算一次', () => {
    const userStore = createLoggedInStore('a');
    const before = userStore.coins;
    const key = buildRewardKey('study-task', 'task_1', 'complete');

    const results = Array.from({ length: 20 }, () =>
      userStore.grantRewardOnce(key, { coins: 10, exp: 5 })
    );

    expect(results.filter(r => r.granted)).toHaveLength(1);
    expect(results.filter(r => r.blockedBy === 'duplicate')).toHaveLength(19);
    expect(userStore.coins).toBe(before + 10);
  });

  it('StudyCenter 反复勾选/取消同一任务不会重复刷币', () => {
    const userStore = createLoggedInStore('b');
    const before = userStore.coins;
    const key = buildRewardKey('study-task', 'task_toggle', 'complete');

    // 模拟 toggle：完成 -> 取消 -> 完成 …… 只有真实首次完成应当发奖
    for (let i = 0; i < 10; i++) {
      userStore.grantRewardOnce(key, { coins: 10, dailyCapId: 'study-task', dailyCapLimit: 5 });
    }

    expect(userStore.coins).toBe(before + 10);
    expect(userStore.isRewardGranted(key)).toBe(true);
  });

  it('不断新建任务换新幂等键时，被每日封顶挡住', () => {
    const userStore = createLoggedInStore('c');
    const before = userStore.coins;

    let grantedCount = 0;
    let cappedCount = 0;
    for (let i = 0; i < 30; i++) {
      const res = userStore.grantRewardOnce(
        buildRewardKey('study-task', 'task_' + i, 'complete'),
        { coins: 10, dailyCapId: 'study-task', dailyCapLimit: 5 }
      );
      if (res.granted) grantedCount++;
      if (res.blockedBy === 'daily-cap') cappedCount++;
    }

    expect(grantedCount).toBe(5);
    expect(cappedCount).toBe(25);
    expect(userStore.coins).toBe(before + 50);
  });

  it('刷新页面（store 重建）后幂等键仍然生效，档案账本可续用', () => {
    const userStore = createLoggedInStore('d');
    const key = buildRewardKey('ai-variation', stableHash('黑先如何提子|opt_b'));
    userStore.grantRewardOnce(key, { coins: 10 });

    const snapshot = JSON.parse(JSON.stringify(userStore.profiles));
    const coinsAfterFirst = userStore.coins;

    // 刷新等价于新 pinia + 从持久化数据恢复 profiles
    setActivePinia(createPinia());
    const revived = useUserStore();
    revived.setCloudUser('parent_d', 'parentd@example.com');
    revived.profiles = snapshot;
    revived.currentProfileId = snapshot[0].id;

    const res = revived.grantRewardOnce(key, { coins: 10 });
    expect(res.granted).toBe(false);
    expect(res.blockedBy).toBe('duplicate');
    expect(revived.coins).toBe(coinsAfterFirst);
  });

  it('变式题刷新后拿到同一道题不再重复发奖，换新题才发', () => {
    const userStore = createLoggedInStore('e');
    const before = userStore.coins;

    const sameQuizKey = buildRewardKey('ai-variation', stableHash('这颗棋子还剩几口气？|opt_a'));
    userStore.grantRewardOnce(sameQuizKey, { coins: 10, dailyCapId: 'ai-variation', dailyCapLimit: 10 });
    userStore.grantRewardOnce(sameQuizKey, { coins: 10, dailyCapId: 'ai-variation', dailyCapLimit: 10 });
    expect(userStore.coins).toBe(before + 10);

    const otherQuizKey = buildRewardKey('ai-variation', stableHash('真眼和假眼的区别？|opt_c'));
    userStore.grantRewardOnce(otherQuizKey, { coins: 10, dailyCapId: 'ai-variation', dailyCapLimit: 10 });
    expect(userStore.coins).toBe(before + 20);
  });

  it('同一盘人机对弈重复结算只发一次奖励', () => {
    const userStore = createLoggedInStore('f');
    const before = userStore.coins;
    const key = buildRewardKey('go-match', 'ai', 'm_abc123', 'win');

    userStore.grantRewardOnce(key, { coins: 50, exp: 150 });
    userStore.grantRewardOnce(key, { coins: 50, exp: 150 });
    userStore.grantRewardOnce(key, { coins: 50, exp: 150 });

    expect(userStore.coins).toBe(before + 50);
  });

  it('未登录/无档案时不发放奖励', () => {
    const userStore = useUserStore();
    const res = userStore.grantRewardOnce(buildRewardKey('study-task', 'x'), { coins: 10 });
    expect(res.granted).toBe(false);
    expect(res.blockedBy).toBe('no-profile');
  });

  it('空幂等键一律拒绝，避免出现无法追踪的奖励', () => {
    const userStore = createLoggedInStore('g');
    const res = userStore.grantRewardOnce('   ', { coins: 10 });
    expect(res.granted).toBe(false);
    expect(res.blockedBy).toBe('invalid-key');
  });

  it('幂等账本超过上限后会被裁剪，不会无限膨胀', () => {
    const userStore = createLoggedInStore('h');
    for (let i = 0; i < 450; i++) {
      userStore.grantRewardOnce(buildRewardKey('bulk', i), { coins: 1 });
    }
    const ledgerSize = Object.keys(userStore.currentProfile.rewardLedger || {}).length;
    expect(ledgerSize).toBeLessThanOrEqual(400);
    expect(ledgerSize).toBeGreaterThan(0);
  });

  it('幂等键由稳定输入生成，同样输入必须得到同样的键', () => {
    expect(buildRewardKey('study-task', 'task_9', 'complete')).toBe('reward:study-task:task_9:complete');
    expect(stableHash('同一道题')).toBe(stableHash('同一道题'));
    expect(stableHash('题目 A')).not.toBe(stableHash('题目 B'));
  });
});

/**
 * 复刻 TwoPlayerView.triggerScoringSettlement 的发奖链路：
 * 有效性判断走共享政策，发放走统一幂等入口，测试与页面用的是同一套函数
 */
function settleTwoPlayerMatch(
  userStore: ReturnType<typeof useUserStore>,
  matchId: string,
  totalMoves: number,
  resigned = false
): boolean {
  if (!isRewardableMatch(totalMoves, resigned)) return false;
  return userStore.grantRewardOnce(buildMatchRewardKey('local', matchId, 'win'), {
    exp: 60,
    coins: 30,
    reason: '完成一盘双人面对面对弈'
  }).granted;
}

describe('双人面对面对弈结算奖励', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('奖励幂等键使用稳定的对局标识结构', () => {
    expect(buildMatchRewardKey('local', 'm_abc', 'win')).toBe('reward:go-match:local:m_abc:win');
  });

  it('正常完成一盘完整对局，发放奖励', () => {
    const userStore = createLoggedInStore('tp1');
    const before = userStore.coins;

    expect(settleTwoPlayerMatch(userStore, 'm_full_1', 42)).toBe(true);
    expect(userStore.coins).toBe(before + 30);
  });

  it('同一局重复结算（反复点目/刷新续局）只发一次奖励', () => {
    const userStore = createLoggedInStore('tp2');
    const before = userStore.coins;

    const results = Array.from({ length: 8 }, () => settleTwoPlayerMatch(userStore, 'm_same', 60));

    expect(results.filter(Boolean)).toHaveLength(1);
    expect(userStore.coins).toBe(before + 30);
  });

  it('手数不足最低门槛的短局不发奖励', () => {
    const userStore = createLoggedInStore('tp3');
    const before = userStore.coins;

    expect(isRewardableMatch(MIN_REWARDED_MOVES - 1)).toBe(false);
    expect(settleTwoPlayerMatch(userStore, 'm_short', MIN_REWARDED_MOVES - 1)).toBe(false);
    expect(userStore.coins).toBe(before);

    // 达到门槛的同一盘棋仍可正常发奖，说明拦的是短局而不是全部
    expect(settleTwoPlayerMatch(userStore, 'm_short', MIN_REWARDED_MOVES)).toBe(true);
    expect(userStore.coins).toBe(before + 30);
  });

  it('认输结束的对局拿不到正常奖励，且认输后再点目也刷不出来', () => {
    const userStore = createLoggedInStore('tp4');
    const before = userStore.coins;

    expect(isRewardableMatch(80, true)).toBe(false);
    expect(settleTwoPlayerMatch(userStore, 'm_resign', 80, true)).toBe(false);
    expect(settleTwoPlayerMatch(userStore, 'm_resign', 80, true)).toBe(false);
    expect(userStore.coins).toBe(before);
  });
});

describe('段位考级首通奖励', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const passExam = (userStore: ReturnType<typeof useUserStore>, tierId: number) =>
    userStore.grantRewardOnce(buildRewardKey('exam', tierId), { exp: 250, coins: 60 }).granted;

  it('同一段位首次通过发奖，再次通过不再重复发首通奖励', () => {
    const userStore = createLoggedInStore('ex1');
    const before = userStore.coins;

    expect(buildRewardKey('exam', 1)).toBe('reward:exam:1');
    expect(passExam(userStore, 1)).toBe(true);
    expect(passExam(userStore, 1)).toBe(false);
    expect(passExam(userStore, 1)).toBe(false);
    expect(userStore.coins).toBe(before + 60);
  });

  it('不同段位各自独立首通，互不影响', () => {
    const userStore = createLoggedInStore('ex2');
    const before = userStore.coins;

    expect(passExam(userStore, 1)).toBe(true);
    expect(passExam(userStore, 2)).toBe(true);
    expect(userStore.coins).toBe(before + 120);
  });
});

describe('攻克错题奖励', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const recordGoMistake = (userStore: ReturnType<typeof useUserStore>, prompt: string) => {
    userStore.recordSubjectMistake({
      subjectId: 'go',
      topic: '数气与提子',
      knowledgePointTitle: '数气',
      questionPrompt: prompt,
      userAnswer: 'D4',
      correctAnswer: 'C3',
      errorCategory: 'concept',
      errorReason: '气数没数清'
    });
  };

  it('首次攻克错题发奖', () => {
    const userStore = createLoggedInStore('mk1');
    recordGoMistake(userStore, '黑先如何提子？');
    const before = userStore.coins;

    userStore.resolveMatchingMistake('go', '黑先如何提子？');
    expect(userStore.coins).toBe(before + 30);
  });

  it('同一条错题重复 resolve 不重复发奖', () => {
    const userStore = createLoggedInStore('mk2');
    recordGoMistake(userStore, '黑先如何做活？');
    const before = userStore.coins;

    for (let i = 0; i < 5; i++) {
      userStore.resolveMatchingMistake('go', '黑先如何做活？', false);
    }
    expect(userStore.coins).toBe(before + 30);
  });

  it('「答错 → 攻克 → 再答错 → 再攻克」循环刷不出重复奖励', () => {
    const userStore = createLoggedInStore('mk3');
    const before = userStore.coins;

    for (let i = 0; i < 6; i++) {
      recordGoMistake(userStore, '黑先如何分断？');
      userStore.resolveMatchingMistake('go', '黑先如何分断？', false);
    }
    expect(userStore.coins).toBe(before + 30);
  });

  it('resolveSubjectMistake 与 resolveMatchingMistake 共用同一个幂等键', () => {
    const userStore = createLoggedInStore('mk4');
    recordGoMistake(userStore, '黑先如何长气？');
    const recordId = userStore.currentProfile.mistakeRecords![0].id;
    const before = userStore.coins;

    userStore.resolveSubjectMistake(recordId, false);
    expect(userStore.coins).toBe(before + 30);

    // 再答错会复用同一条记录并重置 resolved，此时另一条 resolve 路径也必须撞上同一个幂等键
    recordGoMistake(userStore, '黑先如何长气？');
    userStore.resolveMatchingMistake('go', '黑先如何长气？', false);
    expect(userStore.coins).toBe(before + 30);
    expect(userStore.isRewardGranted(buildRewardKey('mistake', recordId))).toBe(true);
  });
});

describe('趣味闯关与吃子棋奖励收敛', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('同一局闯关成绩重复结算只发一次，换局刷分被每日封顶挡住', () => {
    const userStore = createLoggedInStore('ar1');
    const before = userStore.coins;

    userStore.recordArcadeScore('speedCapture', 200, 5);
    userStore.recordArcadeScore('speedCapture', 200, 5);
    expect(userStore.coins).toBe(before + 5);

    // 每次换一个分数就是一局新对局，最终被每日 10 次封顶截断
    for (let score = 201; score < 260; score++) {
      userStore.recordArcadeScore('speedCapture', score, 5);
    }
    expect(userStore.coins).toBe(before + 50);
  });

  it('同一盘吃子棋重复结算只发一次奖励', () => {
    const userStore = createLoggedInStore('cg1');
    const before = userStore.coins;
    const key = buildMatchRewardKey('capture-go', 'cg_match_1', 'win');

    userStore.recordCaptureGoWin(15, 25, key);
    userStore.recordCaptureGoWin(15, 25, key);
    userStore.recordCaptureGoWin(15, 25, key);

    expect(userStore.coins).toBe(before + 15);
    // 对局统计照旧累加，奖励幂等不影响行为记录
    expect(userStore.captureGoStats.wins).toBe(3);
  });
});
