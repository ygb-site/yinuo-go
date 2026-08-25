# 07 · Ability Growth 模型

## 1. 第一原则

```
金币 ≠ 能力
经验 ≠ 能力
星星 ≠ 能力
```

| 概念 | 是什么 | 谁看 |
|---|---|---|
| 金币 | 可消费的行为激励代币 | 儿童 |
| 经验 / 段位 | 累计投入量的表征 | 儿童 |
| 星星 | 单关表现评级 | 儿童 |
| **能力** | 对"孩子在某个认知维度上的真实水平"的估计 | **家长为主**，儿童看简化版 |

金币和经验可以靠时间堆出来，能力不行。能力只由**答题正确性、难度、稳定性、时间衰减**决定，
与投入时长无关，与奖励系统完全解耦。任何"多下一盘棋就涨能力"的实现都是错的。

---

## 2. 六个维度

沿用现有 `src/types/curriculum.ts` 已定义的六维（不新造），
但补齐每一维的可操作定义与围棋侧证据来源：

| 维度 id | 名称 | 可操作定义 | 围棋侧证据 | 第一阶段有数据 |
|---|---|---|---|---|
| `logic` | 逻辑推理 | 依据规则进行多步推演、判断因果 | 死活题、手筋、布局选择 | ✅ |
| `calculation` | 计算能力 | 准确数数、比较大小、算清得失 | 数气、比气、目数计算 | ✅ |
| `spatial` | 空间感知 | 识别形状、方位、结构关系 | 棋形识别、眼位、连断 | ✅ |
| `concentration` | 专注力 | 在干扰下持续维持任务 | 长对局稳定性、限时训练失误率 | ✅ |
| `memory` | 记忆 | 短期保持与回忆信息 | 定式记忆、复盘还原、口诀 | ⚠️ 弱（样本少） |
| `language` | 语言表达 | 理解与表述 | 目前无有效证据来源 | ❌ 无数据 |

**`language` 在第一阶段必须显式标记为"无数据"**，家长端展示为"尚未开始"。
这是 [10-parent-mode](./10-parent-mode.md) 降级规则的直接来源，不允许用其他维度的值推算填充。

```ts
export type AbilityDimensionId =
  | 'logic' | 'calculation' | 'spatial' | 'concentration' | 'memory' | 'language';
```

> 注：用户给出的候选维度名为 `logic / calculation / language / memory / concentration / spatial`，
> 与仓库现有的 `logical / calculation / language / memory / concentration / spatial` 一致，
> 仅 `logical` → `logic` 一处命名差异。**采用 `logic`**，并在 Adapter 中做 legacy 名映射，
> 避免在新模型里继续使用形容词形式。

---

## 3. 数据链路

```
学习行为（答题/对局/训练）
        ↓  ① 归一化
LearningEvent            ← 唯一入口，见 08
        ↓  ② Skill 归因
SkillProgress / Mastery  ← 按 Skill 聚合正确率与稳定性
        ↓  ③ 能力归因（skill.abilityWeights 加权）
AbilityEvent             ← 一次可信的能力信号
        ↓  ④ 聚合 + 时间衰减
AbilityProfile           ← 家长端与儿童端读取的最终结果
```

四步都是纯函数，可单测。**任何页面都不允许直接写 AbilityProfile。**

### 关键设计：能力值不是累加计数器

`AbilityProfile` 是**由事件流推导出的派生值**，不是自增字段。
理由：自增字段一旦被错误行为污染（如某页面重复上报）就永久污染，
且无法解释"为什么是 72 分"。派生值可重算、可解释、可回滚。

---

## 4. 类型设计

`src/domain/ability/types.ts`

```ts
/** 一次可信的能力信号，由 LearningEvent 经 Skill 归因产生 */
export interface AbilityEvent {
  id: string;
  profileId: string;
  at: number;
  dimensionId: AbilityDimensionId;
  skillId: SkillId;

  /** 本次表现：0–1。答对=1、答错=0、部分正确取比例 */
  performance: number;
  /** 题目难度层级，来自 Skill.level */
  difficulty: 1 | 2 | 3 | 4 | 5;
  /** 该 Skill 对本维度的归因权重（skill.abilityWeights[dimensionId]） */
  weight: number;
  /** 溯源：出自哪个学习节点，用于家长端给出证据 */
  sourceNodeId: LearningNodeId;
  /** 溯源：出自哪次学习事件，保证可审计 */
  sourceEventId: string;
}

export interface SkillProgress {
  skillId: SkillId;
  mastery: Mastery;                  // 见 06
  /** 最近 N 次表现，用于判断趋势（上升/持平/下降） */
  recentPerformance: number[];
  trend: 'up' | 'flat' | 'down' | 'unknown';
}

export interface AbilityDimensionState {
  dimensionId: AbilityDimensionId;

  /**
   * 0–100。**没有数据时为 null，不是 0。**
   * 0 表示"测过，很差"；null 表示"没测过"。两者对家长的含义完全不同。
   */
  score: number | null;

  /** 样本量。低于阈值时不对外展示分数，只展示"正在积累" */
  sampleCount: number;
  confidence: 'none' | 'low' | 'medium' | 'high';

  /** 近 7 日 / 近 30 日变化量，null 表示无法比较 */
  delta7d: number | null;
  delta30d: number | null;

  trend: 'up' | 'flat' | 'down' | 'unknown';
  /** 该维度下最强/最弱的 Skill，用于给家长具体抓手 */
  strongestSkillId?: SkillId;
  weakestSkillId?: SkillId;
  lastUpdatedAt: number | null;
}

export interface AbilityProfile {
  profileId: string;
  computedAt: number;
  /** 六维状态，固定六个键，缺数据的维度 score 为 null */
  dimensions: Record<AbilityDimensionId, AbilityDimensionState>;
  skills: SkillProgress[];
  /** 综合评价用的自然语言结论，由规则生成，不是模型生成 */
  highlights: string[];
  concerns: string[];
}
```

---

## 5. 计算规则

### 5.1 由 AbilityEvent 到维度分数

```
对某维度 D：
  取该维度全部 AbilityEvent，按时间倒序
  w_i = weight_i × difficultyFactor(difficulty_i) × decay(now - at_i)

  difficultyFactor: [1,2,3,4,5] → [0.6, 0.8, 1.0, 1.25, 1.5]
      难题答对更有信息量，简单题答错也更说明问题

  decay(Δt): 半衰期 30 天 → 0.5 ^ (Δt / 30d)，下限 0.15
      能力会退化，一个月前的表现不能代表现在；但保留下限，避免久未练习直接归零

  score_D = round(100 × Σ(performance_i × w_i) / Σ(w_i))
```

### 5.2 样本量门槛（防止早期误判）

| sampleCount | confidence | 对外展示 |
|---|---|---|
| 0 | `none` | "尚未开始"，`score = null` |
| 1–4 | `low` | "正在积累（已练 3 次）"，**不展示分数** |
| 5–19 | `medium` | 展示分数 + "参考值" |
| ≥ 20 | `high` | 展示分数 |

这条规则的意义：家长第一次打开看到的不是一个随便算出来的 65 分，
而是诚实的"还在积累"。信任比数字好看重要。

### 5.3 趋势判定

比较近 7 日窗口分数与前 7 日窗口分数，
差值 ≥ +3 记 `up`、≤ -3 记 `down`、否则 `flat`；任一窗口样本 < 3 记 `unknown`。

### 5.4 highlights / concerns 生成

**规则生成，不是 AI 生成**（家长端结论必须可复现、可审计）：

- highlights：`confidence >= medium` 且（`score >= 75` 或 `delta7d >= +5`）的维度，最多 2 条。
- concerns：`confidence >= medium` 且（`score <= 55` 或 `delta7d <= -5`）的维度，最多 2 条。
- 每条必须携带证据（`weakestSkillId` + 最近相关错题），供 `WeakSkillCard` 渲染。

---

## 6. 与现有实现的关系

现有 `useUserStore.studentLearningProfile` getter 已经在做一个简化版：
按 `KNOWLEDGE_POINTS_REPOSITORY` 的 `abilityDimension` 把 `masteryRate` 平均成六维分数。

| 现有实现的问题 | 新模型的处理 |
|---|---|
| 无数据时输出 0（`scoreOf` 返回 0） | 输出 `null` + `confidence: 'none'` |
| 无难度加权 | `difficultyFactor` |
| 无时间衰减 | 30 天半衰期 |
| 无样本量门槛 | 四档 confidence |
| 无趋势、无证据溯源 | `delta7d/30d`、`sourceNodeId`、`sourceEventId` |
| 每次 getter 全量重算（六维 × 全知识点） | 事件流 + 缓存，`computedAt` 控制失效 |

**迁移策略**：新模型以 `KnowledgeMasteryRecord` 为初始数据源（通过 Adapter 反推
近似 AbilityEvent），因此**上线即有数据，不需要用户重新练一遍**。
真正的 `AbilityEvent` 持久化从 Phase 4 上线之日起累积，两者并存一段时间后自然过渡。

---

## 7. 儿童端与家长端的表达差异

同一份 `AbilityProfile`，两种表达。**这是产品要求，不是样式差异。**

| | 儿童端（Me → Ability） | 家长端（Parent → Ability） |
|---|---|---|
| 展示什么 | 只讲优势与"正在变强" | 全六维 + 趋势 + 薄弱项 |
| 弱项 | **不展示**"你的计算力只有 42 分" | 展示，并给出具体训练建议 |
| 形式 | 徽章式（"空间小达人"）+ 成长条 | 雷达图 + 趋势折线 + 证据列表 |
| 无数据维度 | 显示为"还没解锁这项能力测评" | 显示为"尚未开始（该维度暂无数据来源）" |
| 分数 | 只在 `confidence: high` 时显示数字 | `medium` 起显示，标注"参考值" |

原因：把弱项数字直接摆给孩子看会打击自我效能感，而这正是家长最需要的信息。
一个数据源，两种受众，两套呈现规则。

---

## 8. 本阶段交付边界

| 允许 | 禁止 |
|---|---|
| 新建 `src/domain/ability/types.ts`（纯类型） | 修改 `useUserStore` 的能力相关 getter |
| 撰写计算规则（本文档） | 新增能力字段到 `ChildProfile` 持久化结构 |
| — | 实现能力计算引擎（Phase 4） |
| — | 改动任何家长端页面（Phase 7） |
