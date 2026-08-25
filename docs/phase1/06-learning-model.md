# 06 · Learning 领域模型

**本阶段只设计模型，不迁移任何真实数据。** 不改 `chapters.ts`（5473 行），
不改 `tsumegoLibrary.ts`，不改 `src/engine/`。

---

## 1. 要解决的四个具体问题

### 1.1 三套 Chapter/Lesson 并存

| 来源 | 结构 | id 形态 | 现状 |
|---|---|---|---|
| `src/data/chapters.ts` | `Chapter` / `Lesson` / `LessonSubPuzzle` / `PuzzleNode` | `c1_l1`、`c3_l2` | **现行主线**，被 `AdventureView`、`LessonPlayView`、`router` 使用 |
| 历史版本 | 同上语义 | `lesson_1_1`、`lesson_2_4` | 已无数据文件，但 id 仍**硬编码残留**在 `router/index.ts:128` 与 `useUserStore.updateLessonProgress()` 的勋章判定里 |
| `src/data/curriculum.ts` | `CURRICULUM_CHAPTERS` / `LevelItem` | 另一套 | 仅被零引用的 `LevelPlayView.vue` 使用，实际已废弃 |

### 1.2 ChapterId 撞号

`ChildProfile.progress` 是扁平的 `Record<string, {...}>`，三套 id 落在**同一个命名空间**里。
`c1_l1` 与 `lesson_1_1` 语义上是同一关，但会被记成两条进度；
`curriculum.ts` 与 `chapters.ts` 的章节编号也会互相覆盖。
这既造成进度统计偏差，也让"通关第 1 章"的勋章判定不得不写成
`lessonId === 'lesson_1_3' || lessonId === 'c1_l4'` 这种双 id 兜底。

### 1.3 `SubjectId` 只有棋类

```ts
export type SubjectId = 'go' | 'checkers' | 'gomoku';   // src/types/curriculum.ts:3
```
学科被硬编码成三个枚举值，且 `useUserStore.studentLearningProfile` 里的
`subjectTotals` 是 `Record<SubjectId, ...>` 的字面量对象——加一个学科要改多处。

### 1.4 学业数据无法进入统一模型

`MistakeRecord`、`KnowledgeMastery` 已经是通用结构（`dataArchiveService` 里
甚至还在校验 `['go','math','chinese','english']`，说明曾有学业数据），
但课程/关卡侧完全被围棋结构绑死，学业内容没有可挂载的位置。

---

## 2. 核心思路

```
Legacy Content (chapters.ts / tsumegoLibrary.ts / …)
        ↓  Adapter（只读，纯函数）
   LearningNode 统一模型
        ↓
UI / Progress / Ability / Reward / AI Context
```

三条约束：

1. **Adapter 单向只读。** 不回写 legacy 数据，不修改 legacy 文件。
2. **id 双轨。** `LearningNode.id` 是新的带命名空间 id；`legacyIds` 记录该节点在历史上
   用过的全部 id。进度读写继续走 legacy id，**因此本阶段零数据迁移**。
3. **Domain 数据驱动。** 学科不再是 union 字面量，而是注册表里的一条记录。

---

## 3. 类型设计

新建 `src/domain/learning/types.ts`。

### 3.1 Domain（学科/领域）

```ts
/** 学科不再写死为 union：新增学科 = 往注册表加一条，不改类型 */
export type DomainId = string;

/** 历史 SubjectId 继续存在，仅作为 legacy 兼容别名，禁止在新代码里扩展 */
export type LegacySubjectId = 'go' | 'checkers' | 'gomoku';

export interface Domain {
  id: DomainId;                  // 'go' | 'gomoku' | 'checkers' | 'math' | …
  name: string;                  // '围棋'
  shortName: string;             // '棋'
  /** 是否为承担主线课程的完整学科。false = 只有玩法、没有课程体系 */
  isPrimary: boolean;
  /** 该学科当前是否有真实内容。false 时儿童端不展示入口，家长端显示"尚未开始" */
  hasContent: boolean;
  accent: 'learning' | 'growth' | 'challenge';
  /** 该学科主要训练的能力维度，用于能力归因兜底 */
  primaryAbilities: AbilityDimensionId[];
}
```

第一阶段注册表内容：`go`（primary, hasContent）、`gomoku`（非 primary, hasContent）、
`checkers`（非 primary, hasContent）。**不预置** math/chinese/english——
没有内容的学科连注册表都不该进（否则又会长出空入口）。

### 3.2 LearningNode（统一学习节点）

```ts
export type LearningNodeKind =
  | 'course'      // 课程/学科根
  | 'chapter'     // 章
  | 'lesson'      // 关卡（可玩的最小学习单元）
  | 'drill'       // 专项训练（死活题集、数气练习）
  | 'match'       // 对局
  | 'exam'        // 考级/测评
  | 'reference';  // 资料（词典、口诀）

/** 全局唯一 id，格式：`<domainId>:<kind>:<path>`，例：'go:lesson:c3/l2' */
export type LearningNodeId = string;

export interface LearningNode {
  id: LearningNodeId;
  domainId: DomainId;
  kind: LearningNodeKind;

  title: string;
  subtitle?: string;
  description?: string;

  /** 树结构 */
  parentId?: LearningNodeId;
  order: number;

  /** 该节点覆盖的知识点（复用现有 KNOWLEDGE_POINTS_REPOSITORY 的 id） */
  knowledgePointIds: string[];
  /** 该节点训练的技能 */
  skillIds: SkillId[];

  /** 解锁条件 */
  unlock: UnlockRule;
  /** 奖励规格（声明式，由奖励系统统一结算，页面不自行发奖） */
  reward: RewardSpec;

  /** 进入该节点的路由 */
  route: string;
  /** 预计时长（分钟），用于 Today 排任务 */
  estimatedMinutes: number;

  /**
   * 历史 id 列表：进度、错题、勋章判定继续用它们读写。
   * 例：['c3_l2', 'lesson_3_2']
   * 这是本阶段实现零数据迁移的关键字段。
   */
  legacyIds: string[];

  /** 内容载荷保持不透明：Adapter 原样透传 legacy 对象，由具体播放器解释 */
  payload?: unknown;
}
```

### 3.3 Skill 与 KnowledgePoint

```ts
export type SkillId = string;   // 'go.liberties' | 'go.capture.snapback' | …

export interface Skill {
  id: SkillId;
  domainId: DomainId;
  name: string;                         // '打二还一'
  /** 归因到能力维度，可多维带权（权重和为 1） */
  abilityWeights: Partial<Record<AbilityDimensionId, number>>;
  /** 前置技能，用于生成推荐与解锁 */
  prerequisiteIds: SkillId[];
  level: 1 | 2 | 3 | 4 | 5;             // 难度层级
}

/**
 * KnowledgePoint 沿用现有 src/types/curriculum.ts 的定义与
 * KNOWLEDGE_POINTS_REPOSITORY 数据，不重建。
 * 新模型只增加一层映射：knowledgePointId → skillId。
 */
export interface KnowledgePointSkillMap {
  knowledgePointId: string;
  skillId: SkillId;
}
```

**刻意的取舍**：不把现有 `KnowledgePoint` 推倒重做。它已经带了
`abilityDimension` 与 `subjectId`，能直接复用；Skill 层的价值在于比知识点更细的
"可训练动作"粒度以及多维能力归因。两层共存，靠映射表连接。

### 3.4 Progress 与 Mastery

```ts
export interface Progress {
  nodeId: LearningNodeId;
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  stars: 0 | 1 | 2 | 3;
  bestScore?: number;
  attempts: number;
  firstCompletedAt?: number;
  lastAttemptAt?: number;
  /** 累计学习秒数，用于家长端"学习时长" */
  totalSeconds: number;
}

export interface Mastery {
  skillId: SkillId;
  /** 0–1。由正确率 + 时间衰减 + 难度加权得出，不是简单正确率 */
  level: number;
  confidence: 'low' | 'medium' | 'high';   // 由样本量决定，样本不足不下结论
  totalCount: number;
  correctCount: number;
  lastPracticedAt: number;
  /** 连续正确次数，用于判定"已掌握" */
  streak: number;
}
```

`Mastery` 与现有 `KnowledgeMasteryRecord` 的关系：后者按知识点统计、已在用，
保留不动；`Mastery` 按 Skill 统计，是能力模型的输入。Adapter 负责由
`KnowledgeMasteryRecord` + `KnowledgePointSkillMap` 聚合出 `Mastery`，
**不新增持久化字段**（Phase 4 决定是否落库）。

### 3.5 UnlockRule

取代当前散在三处的解锁逻辑（`router.beforeEach` 的路径匹配、
`unlockRules.ts` 里把路由路径写进数据、`AdventureView` 内部的相邻关卡判断）。

```ts
export type UnlockRule =
  | { type: 'always' }
  | { type: 'node-completed'; nodeId: LearningNodeId }
  | { type: 'nodes-completed'; nodeIds: LearningNodeId[]; count?: number }  // count 缺省=全部
  | { type: 'lesson-count'; count: number }                 // 累计通关数，兼容现有 lessonsRequired
  | { type: 'skill-mastery'; skillId: SkillId; minLevel: number }
  | { type: 'rank'; minRankLevel: number }
  | { type: 'all'; rules: UnlockRule[] }
  | { type: 'any'; rules: UnlockRule[] };

export interface UnlockEvaluation {
  unlocked: boolean;
  /** 未解锁时给用户看的说明，必须是具体的、可行动的 */
  reason?: string;
  /** 达成进度，用于展示"还差 2 关" */
  progress?: { current: number; required: number };
}
```

统一求值入口：`evaluateUnlock(rule, ctx): UnlockEvaluation`，纯函数、可单测。
路由守卫、卡片锁定态、Today 排任务三处共用同一实现。

### 3.6 RewardSpec

```ts
export interface RewardSpec {
  /** 首次完成的奖励 */
  first: { coins: number; exp: number; stars?: number };
  /** 重复完成的奖励（可为 0，表示不重复发） */
  repeat?: { coins: number; exp: number };
  /** 幂等键的 domain 段，最终键由奖励系统拼装，见 08 */
  rewardDomain: string;
  /** 同类行为每日封顶 */
  dailyCap?: { capId: string; limit: number };
}
```

详见 [08-reward-model](./08-reward-model.md)。

---

## 4. Adapter 规格

`src/domain/learning/adapters/`

| Adapter | 输入 | 输出 |
|---|---|---|
| `goAdventureAdapter.ts` | `CHAPTERS_DATA`（chapters.ts） | `go:chapter:cN` + `go:lesson:cN/lM` 节点树 |
| `goTsumegoAdapter.ts` | `tsumegoLibrary.ts` | `go:drill:tsumego/*` 节点 |
| `goMatchAdapter.ts` | `AI_BOTS`（GoAI.ts） | `go:match:ai/<bot>` 等节点 |
| `goExamAdapter.ts` | 段位配置 | `go:exam:<tier>` 节点 |
| `puzzleAdapter.ts` | gomoku / checkers 配置 | `gomoku:match:*`、`checkers:match:*` |

约定：

1. Adapter 是**纯函数 + 模块级缓存**，输入是 legacy 常量，输出是冻结的节点数组。
2. `legacyIds` 由 Adapter 负责填写。`go:lesson:c3/l2` 的 `legacyIds` 是
   `['c3_l2', 'lesson_3_2']`（历史 id 按章关号推导，一次性写死在 Adapter 里）。
3. Adapter **必须**有单测：节点数与 legacy 数据条数一致、id 全局唯一、
   `legacyIds` 无跨节点重复、父子关系完整。这是防止撞号复发的护栏。

### 4.1 撞号问题的解决方式

```ts
/** 读进度：优先新 id，回落到全部 legacy id，取最优记录 */
export function readProgress(node: LearningNode, raw: ChildProfile['progress']): Progress {
  const candidates = [node.id, ...node.legacyIds].map(id => raw[id]).filter(Boolean);
  // 合并：completed 取 or，stars 取 max，completedAt 取最早
  …
}

/** 写进度：写新 id，同时兼容写主 legacy id，保证回滚后旧代码仍能读到 */
export function writeProgress(node: LearningNode, …): void { … }
```

这样撞号从"数据问题"降级为"读取时合并"，不需要一次性数据迁移，
也允许 Phase 2 出问题时安全回滚。真正的清理放到 Phase 4 末尾，
且必须先有一次线上数据分布统计再动手。

---

## 5. 学业数据的挂载方式（不实现，只留位）

将来接入数学/语文时：

1. 往 Domain 注册表加一条 `{ id: 'math', isPrimary: true, hasContent: true }`。
2. 写一个 `mathCurriculumAdapter`，输出 `math:chapter:*` / `math:lesson:*` 节点。
3. 定义该学科的 `Skill` 与 `abilityWeights`。
4. 儿童端 Learn 页自动出现学科分区（因为 Learn 是遍历 Domain 注册表渲染的，不是硬编码）。

**唯一需要新写的是 Adapter 与 Skill 定义，UI、进度、奖励、能力、AI 上下文全部无需改动。**
这条就是本模型设计的验收标准。

---

## 6. 本阶段交付边界

| 允许 | 禁止 |
|---|---|
| 新建 `src/domain/learning/types.ts`（纯类型） | 修改 `chapters.ts` / `tsumegoLibrary.ts` / `src/engine/` |
| 新建 Domain 注册表常量 | 迁移 `ChildProfile.progress` 的 key |
| 撰写 Adapter 规格（本文档） | 实现 Adapter（Phase 4） |
| — | 删除 `curriculum.ts` / `LevelPlayView.vue`（Phase 2 清理，见 12） |
