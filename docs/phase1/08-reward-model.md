# 08 · Reward 系统设计

## 0. 现状：P0 已落地的部分

P0-3 已经建立了统一幂等入口，本文档在它之上收敛为完整模型，**不推翻已落地实现**：

| 已有（P0） | 位置 |
|---|---|
| `grantRewardOnce(key, spec)` 统一入口 | `useUserStore` |
| `ChildProfile.rewardLedger` 幂等账本（随本地与云端同步） | `useUserStore` |
| `ChildProfile.rewardDailyCounters` 每日封顶 | `useUserStore` |
| `buildRewardKey()` / `stableHash()` 幂等键工具 | `src/utils/rewardKey.ts` |
| 三处调用点改造（StudyCenter / 变式题 / AI 对局） | 见 [p0-security-fixes](../p0-security-fixes.md) |

本阶段要补的是：**LearningEvent 这一层**，以及把剩余直接调 `addCoins/addExp` 的调用点收敛掉。

---

## 1. 分层模型

```
用户行为
   ↓
LearningEvent        ① 唯一上报入口。描述"发生了什么"，不含奖励金额
   ↓
├── Ability 归因      → AbilityEvent（见 07）
├── Progress 更新     → Progress（见 06）
└── Reward 结算       → RewardEvent → RewardTransaction
```

关键：**LearningEvent 不知道奖励金额，RewardSpec 才知道。**
页面上报"我完成了 go:lesson:c3/l2，3 星"，由奖励系统查 `RewardSpec` 决定发多少。
这样调整奖励数值不需要改任何页面。

---

## 2. 类型设计

`src/domain/reward/types.ts`

```ts
/** ① 学习事件：唯一的行为上报结构 */
export type LearningEventType =
  | 'lesson-completed'      // 关卡通关
  | 'question-answered'     // 单题作答
  | 'drill-completed'       // 专项训练完成
  | 'match-finished'        // 对局结束
  | 'exam-passed'           // 考级通过
  | 'mistake-resolved'      // 错题攻克
  | 'daily-task-completed'  // 今日任务完成
  | 'daily-check-in'        // 每日打卡
  | 'badge-unlocked';       // 勋章解锁

export interface LearningEvent {
  /** 事件唯一 id，同时作为奖励幂等键的核心组成 */
  id: string;
  type: LearningEventType;
  profileId: string;
  at: number;

  nodeId?: LearningNodeId;
  domainId?: DomainId;
  skillIds?: SkillId[];
  knowledgePointIds?: string[];

  /** 结果 */
  outcome: {
    success: boolean;
    /** 0–1，用于能力归因；答题类必填 */
    performance?: number;
    stars?: 0 | 1 | 2 | 3;
    score?: number;
    /** 有效时长（秒），用于家长端学习时长与专注力 */
    durationSeconds?: number;
  };

  /**
   * 有效性标记：由**领域层**判定，不由页面判定。
   * 无效事件仍然记录（用于分析），但不产生奖励，也不产生 AbilityEvent。
   */
  validity: EventValidity;
}

export interface EventValidity {
  valid: boolean;
  /** 无效原因，便于排查与埋点 */
  reason?:
    | 'too-short'          // 手数/时长不足（如开局即停手的对局）
    | 'surrendered'        // 认输
    | 'replay'             // 重复内容（同一题目再次提交）
    | 'self-authored'      // 用户自建、系统无法校验（如自填待办）
    | 'assisted';          // 使用了答案提示
}

/** ② 奖励事件：由 LearningEvent + RewardSpec 计算得出的待结算意图 */
export interface RewardEvent {
  idempotencyKey: IdempotencyKey;
  sourceEventId: string;
  coins: number;
  exp: number;
  stars: number;
  reason: string;
  icon: string;
  dailyCap?: { capId: string; limit: number };
}

/** ③ 奖励交易：实际入账记录 */
export interface RewardTransaction {
  idempotencyKey: IdempotencyKey;
  grantedAt: number;
  coins: number;
  exp: number;
  stars: number;
  reason: string;
  balanceAfter: { coins: number; exp: number; stars: number };
}

/** ④ 幂等键 */
export type IdempotencyKey = string;   // `reward:<domain>:<parts...>`
```

---

## 3. 幂等键规范

格式：`reward:<domain>:<稳定业务标识...>`

| 行为 | 键 |
|---|---|
| 关卡通关 | `reward:lesson:<nodeId>:first` / `:repeat:<yyyy-mm-dd>` |
| 死活题 | `reward:tsumego:<puzzleId>` |
| 专项训练 | `reward:drill:<nodeId>:<yyyy-mm-dd>` |
| 对局 | `reward:go-match:<mode>:<matchId>:<win\|lose>` |
| 考级 | `reward:exam:<tierId>` |
| 错题攻克 | `reward:mistake:<mistakeRecordId>` |
| 变式题 | `reward:ai-variation:<hash(题干+正解)>` |
| 今日任务 | `reward:study-task:<taskId>:complete` |
| 每日打卡 | `reward:check-in:<yyyy-mm-dd>` |
| 全勤奖 | `reward:daily-quest:<yyyy-mm-dd>` |
| 勋章 | `reward:badge:<badgeId>` |

硬规则：

1. 键只能由**稳定标识**拼成。**禁止** `Date.now()`、`Math.random()`、
   数组下标、循环计数器。
2. 需要"每天可再领一次"的行为，把日期作为键的一部分（`:<yyyy-mm-dd>`），
   而不是靠清空账本实现。
3. 无法生成稳定键的行为，**不发奖励**。这不是妥协，是设计。

---

## 4. 什么能拿奖励，什么不能

### 4.1 可以

| 行为 | 判定 |
|---|---|
| 首次通关一个关卡 | 幂等键 `:first` |
| 重复通关且星级提升 | 只对**新增星数**发奖（现有 `updateLessonProgress` 已是这个逻辑，保留） |
| 完成一道未做过的死活题 | 按 puzzleId 幂等 |
| 完成每日训练配额 | 按日期幂等 |
| 完成一盘**有效**对局 | 有效性见 4.3 |
| 通过一个未通过的段位考 | 按 tierId 幂等 |
| 攻克一道错题 | 按错题 id 幂等 |
| 每日打卡 / 全勤奖 | 按日期幂等 |
| 解锁勋章 | 按 badgeId 幂等 |

### 4.2 不可以

| 行为 | 原因 |
|---|---|
| 重复通关且星级未提升 | 无新增学习成果 |
| 重做已做对的题 | 同上 |
| 认输 / 开局即结算的对局 | `validity.reason = 'surrendered' / 'too-short'` |
| 使用"显示答案"后判定正确 | `validity.reason = 'assisted'`。仍记录进度，不发奖 |
| 用户自建待办 | `'self-authored'`：**降级发放**（可发，但受每日封顶约束）。P0 已实现：逐条幂等 + 每日 5 项 |
| 纯浏览行为（打开词典、看口诀） | 不是学习闭环 |
| 切换设备后重放同一批事件 | 幂等键随档案同步，天然拦截 |

### 4.3 对局有效性判定（统一，供所有棋种复用）

```ts
export function evaluateMatchValidity(input: {
  moveCount: number;
  resigned: boolean;
  durationSeconds: number;
  usedUnlimitedHints: boolean;
}): EventValidity {
  if (input.resigned) return { valid: false, reason: 'surrendered' };
  if (input.moveCount < MIN_REWARDED_MOVES) return { valid: false, reason: 'too-short' };
  if (input.durationSeconds < MIN_REWARDED_SECONDS) return { valid: false, reason: 'too-short' };
  return { valid: true };
}
```

阈值（可配置，初值）：`MIN_REWARDED_MOVES = 20`（P0 已在 `AiMatchView` 使用该值）、
`MIN_REWARDED_SECONDS = 30`。不同棋种可覆盖（五子棋手数更少，阈值可调低）。

---

## 5. 防重复的六道防线

| 攻击方式 | 防线 |
|---|---|
| `refresh` | 幂等键持久化在档案里，刷新后账本仍在 |
| `retry`（网络失败重试） | 同一 `LearningEvent.id` → 同一幂等键 |
| `toggle`（勾选/取消反复） | 幂等键与"当前勾选状态"无关，只与"是否结算过"有关 |
| `replay`（重放同一内容） | 键含内容 hash（如变式题）或内容 id（如 puzzleId） |
| `surrender` / 开局即结算 | `EventValidity` 前置拦截，无效事件不进奖励流程 |
| `repeated answer` | 同题同幂等键；不同题但同类行为受 `dailyCap` 约束 |
| 额外：新建对象换新键 | `dailyCap` 兜底（自建待办每日 5 项） |
| 额外：先记账后发钱 | 发放环节异常也不留可重领窗口（P0 已实现） |

---

## 6. 统一奖励入口

### 6.1 目标状态

```ts
// 页面/领域层唯一允许调用的东西
await reportLearningEvent(event: LearningEvent): Promise<{
  progress?: Progress;
  reward?: RewardTransaction;     // undefined = 本次未发奖
  abilityEvents: AbilityEvent[];
}>;
```

页面**不再**调用 `addCoins` / `addExp` / `grantRewardOnce`，也不再自己判断有效性。
`addCoins` / `addExp` 降级为 store 内部方法（改名加 `_` 前缀或迁入内部模块），
只有奖励结算器可以调用。

### 6.2 现存调用点收敛清单

| 位置 | 现状 | 目标 |
|---|---|---|
| `views/StudyCenterView.vue` | ✅ P0 已走 `grantRewardOnce` | 迁到 `reportLearningEvent('daily-task-completed')` |
| `components/common/AiTutorFloatModal.vue` | ✅ P0 已走 `grantRewardOnce` | 迁到 `question-answered` |
| `views/AiMatchView.vue` | ✅ P0 已走 `grantRewardOnce` + 手数门槛 | 迁到 `match-finished` |
| `stores/tsumegoStore.ts:39` | 靠 `solvedPuzzles` 首次判定，等价幂等，**安全** | 迁到 `drill-completed` |
| `views/TwoPlayerView.vue:372` | ❌ 无幂等、无门槛，**可反复刷** | **Phase 2 首批修复**，迁到 `match-finished` |
| `views/RankExamView.vue:237` | ❌ 无幂等，重复考同段位可重领 | **Phase 2 首批修复**，迁到 `exam-passed` |
| `views/ArcadeView.vue:306` | `recordArcadeScore` 无幂等（按分数发币） | 迁到 `drill-completed` + 每日封顶 |
| `views/CaptureGoView.vue:245` | `recordCaptureGoWin` 无幂等 | 迁到 `match-finished` |
| `useUserStore.resolveMistake/resolveSubjectMistake/resolveMatchingMistake` | 靠 `resolved` 标记，`resolveMatchingMistake` **未检查 resolved** 即发奖 | 迁到 `mistake-resolved`，统一幂等 |
| `useUserStore.unlockBadge` | 靠 `badges.includes` 判定，等价幂等，**安全** | 迁到 `badge-unlocked` |
| `useUserStore.performDailyCheckIn` / `claimDailyQuestsReward` / `claimDailyRiddleReward` | 靠日期字段判定，**安全**（已有测试） | 迁到日期幂等键，行为不变 |
| `views/AdminView.vue:221` | 管理员手工加币，直接改 `child.coins` | 保留，但必须写入 `coinLog` 并标记 `source: 'admin'` |

### 6.3 强制护栏（Phase 9 QA）

- grep 检查：`src/views/` 与 `src/components/` 下不得出现 `addCoins(` / `addExp(`。
- 单测：对每一个 `LearningEventType`，验证"同一事件上报 N 次只结算一次"。
- 单测：验证每个 `EventValidity.reason` 都能正确阻止发奖。

---

## 7. 数值配置集中化

所有奖励数值收进一张表，页面与领域层都不写字面量：

```ts
export const REWARD_SPECS: Record<string, RewardSpec> = {
  'lesson':        { first: { coins: 20, exp: 50, stars: 3 }, repeat: { coins: 0, exp: 5 },  rewardDomain: 'lesson' },
  'tsumego':       { first: { coins: 30, exp: 80 },            rewardDomain: 'tsumego' },
  'drill':         { first: { coins: 10, exp: 20 },            rewardDomain: 'drill',      dailyCap: { capId: 'drill', limit: 10 } },
  'match-win':     { first: { coins: 50, exp: 150 },           rewardDomain: 'go-match' },
  'match-lose':    { first: { coins: 10, exp: 40 },            rewardDomain: 'go-match' },
  'exam':          { first: { coins: 100, exp: 300 },          rewardDomain: 'exam' },
  'mistake':       { first: { coins: 30, exp: 40 },            rewardDomain: 'mistake' },
  'daily-task':    { first: { coins: 10, exp: 10 },            rewardDomain: 'study-task', dailyCap: { capId: 'study-task', limit: 5 } },
  'ai-variation':  { first: { coins: 10, exp: 10 },            rewardDomain: 'ai-variation', dailyCap: { capId: 'ai-variation', limit: 10 } },
  'check-in':      { first: { coins: 15, exp: 0 },             rewardDomain: 'check-in' },
  'daily-quest':   { first: { coins: 50, exp: 100 },           rewardDomain: 'daily-quest' }
};
```

初值取自现有实现，保证迁移后经济系统不变（不能因为重构让孩子的金币收入突然变化）。

---

## 8. 账本容量与云同步

| 项 | 规则 |
|---|---|
| 账本上限 | 400 条，超出裁剪到最近 300 条（P0 已实现） |
| 裁剪风险 | 被裁掉的**远期**幂等键理论上可再次领取一次。可接受：裁剪按时间倒序，被裁的都是 400 条之前的旧记录，对应行为早已完成，且多为一次性行为（关卡首通）。Phase 4 可改为"永久键（关卡/勋章/考级）不裁剪，只裁剪日期类键" |
| 每日计数 | 只保留当天，跨天自动清空（P0 已实现） |
| 云同步 | 账本在 `ChildProfile` 内，随 `profiles_data` 同步，跨设备生效 |
| 导入档案 | 当前 `validateAndSanitizeArchive` 不带账本，导入产生的新档案账本为空 → 理论上可重领一次。已登记为 Low 风险（见 [13-risks](./13-risks.md)），Phase 4 处理：导入时按 `progress` 中已完成的节点预填账本 |
