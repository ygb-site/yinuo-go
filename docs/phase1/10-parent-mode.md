# 10 · Parent Mode

## 1. 定位

家长端**不是数据大屏**。它是一份每周只看几分钟的简报，必须回答五个问题：

1. 最近学了什么？
2. 哪些能力在增长？
3. 哪些地方卡住了？
4. 本周应该关注什么？
5. 我应该怎么帮助他？

第五个问题是当前 `ParentDashboardView` 完全没有回答的，也是家长最需要的。

---

## 2. 信息架构

```
/parent                  概览（结论先行）
├── 本周一句话结论
├── 本周关注点（1–2 条，带可执行动作）
├── 学习概览（天数 / 时长 / 完成关卡 / 正确率）
├── 能力速览（六维，缺数据显式标注）
└── 快捷入口 → 周报 / 能力 / 记录

/parent/weekly           周报
├── 本周学了什么（按学科 → 节点，最多 8 条）
├── 与上周对比（学习天数、时长、正确率）
├── 高光时刻（首次通关、段位通过、连续天数里程碑）
└── 需要注意（薄弱技能 + 证据）

/parent/ability          能力
├── 六维雷达（当前 + 30 天前对比）
├── 逐维趋势折线（近 30 天）
├── 每维强项 / 弱项技能
└── 数据来源说明（哪些维度有数据、依据多少次练习）

/parent/records          学习记录
├── 时间线（按天分组）
├── 筛选：学科 / 类型（课程/训练/对局/考级）
├── 错题明细（可跳错题本）
└── 对局记录（可跳复盘）

/parent/children         多宝贝管理
├── 档案列表（切换 / 新建 / 删除）
└── 每个档案的学段设置

/parent/settings         设置
├── 账号与云同步状态
├── AI 伴学策略（关闭 / 仅本地 / 允许云端），默认"仅本地"
├── 数据导出 / 导入
└── 学习提醒偏好
```

**不做的东西**（明确列出，防止 Phase 7 跑偏）：
排行榜、与其他孩子对比、预测性评分（"预计三个月后达到 X 级"）、
学习时长目标施压、付费转化模块。

---

## 3. 核心数据结构

`src/domain/parent/types.ts`

```ts
export interface WeeklySummary {
  profileId: string;
  weekStart: number;              // 周一 00:00
  weekEnd: number;

  /** 结论先行：一句自然语言，规则生成，不是 AI 生成 */
  headline: string;

  activity: {
    activeDays: number;           // 本周有学习行为的天数
    totalMinutes: number;
    lessonsCompleted: number;
    drillsCompleted: number;
    matchesPlayed: number;
    questionsAnswered: number;
    accuracy: number | null;      // 样本不足时为 null
  };

  /** 与上周比较，null 表示上周无数据 */
  comparison: {
    activeDaysDelta: number | null;
    minutesDelta: number | null;
    accuracyDelta: number | null;
  };

  learnedItems: LearnedItem[];    // 本周学了什么，上限 8
  highlights: Highlight[];        // 高光时刻，上限 3
  concerns: Concern[];            // 需要注意，上限 2
  recommendedActions: RecommendedAction[];  // 上限 3

  /** 数据完整度，决定是否降级展示 */
  coverage: DataCoverage;
}

export interface LearnedItem {
  nodeId: LearningNodeId;
  domainName: string;             // '围棋'
  title: string;                  // '第 3 章 · 打二还一'
  at: number;
  outcome: 'completed' | 'attempted';
  stars?: 0 | 1 | 2 | 3;
}

export interface Highlight {
  kind: 'first-clear' | 'rank-passed' | 'streak-milestone' | 'ability-jump' | 'mistake-cleared';
  text: string;
  at: number;
}

export interface Concern {
  kind: 'weak-skill' | 'ability-drop' | 'inactive' | 'repeated-mistake';
  text: string;
  /** 证据：家长可以点开看到具体是哪几道题 */
  evidence: {
    skillId?: SkillId;
    mistakeRecordIds: string[];
    nodeIds: LearningNodeId[];
  };
}

/** 家长可执行动作。每个 Concern 至少配一个 Action */
export interface RecommendedAction {
  id: string;
  /** 家长视角的动作描述，必须具体 */
  text: string;                   // '陪他做这 3 道「打二还一」的死活题，重点看提子后的形状'
  estimatedMinutes: number;
  /** 一键跳转到对应内容（家长陪练场景） */
  route?: string;
  relatedSkillId?: SkillId;
}

export interface LearningHabit {
  /** 一周内各天的学习分钟数，用于识别习惯 */
  minutesByWeekday: [number, number, number, number, number, number, number];
  /** 常见学习时段 */
  preferredTimeSlot: 'morning' | 'afternoon' | 'evening' | 'irregular' | 'unknown';
  /** 单次平均时长，用于判断是否"碎片化" */
  averageSessionMinutes: number | null;
  consistency: 'stable' | 'improving' | 'declining' | 'unknown';
}

export interface AbilityTrend {
  dimensionId: AbilityDimensionId;
  hasData: boolean;
  points: Array<{ at: number; score: number }>;   // hasData=false 时为空数组
  currentScore: number | null;
  delta30d: number | null;
  confidence: 'none' | 'low' | 'medium' | 'high';
  /** 无数据时给家长看的说明 */
  emptyReason?: string;           // '该维度暂无数据来源：目前课程内容集中在围棋'
}
```

---

## 4. 降级展示规则（当前只有围棋数据）

这是本文档最重要的部分。**绝对不能伪造数学、语文等数据。**

### 4.1 三档展示状态

| 状态 | 触发条件 | 展示 |
|---|---|---|
| **有数据** | `confidence >= medium` | 正常展示分数、趋势、图表 |
| **正在积累** | `sampleCount 1–4`（`confidence: low`） | 展示"已练习 3 次，还在积累"+ 进度条，**不展示分数、不画曲线** |
| **尚未开始** | `sampleCount = 0`（`confidence: none`） | 展示"尚未开始"+ `emptyReason` 说明，区域置灰，**不画任何图形** |

### 4.2 具体到六个维度（第一阶段实际情况）

| 维度 | 第一阶段状态 | 家长端文案 |
|---|---|---|
| `logic` 逻辑推理 | 有数据 | 正常展示 |
| `calculation` 计算能力 | 有数据 | 正常展示 |
| `spatial` 空间感知 | 有数据 | 正常展示 |
| `concentration` 专注力 | 有数据 | 正常展示 |
| `memory` 记忆 | 样本少 | "正在积累" |
| `language` 语言表达 | **无数据** | "尚未开始 · 该维度需要语言类学习内容，目前课程集中在围棋" |

### 4.3 雷达图的降级画法

六维雷达在只有四维有数据时**不能**把另两维画成 0——那看起来像"孩子这两项很差"。

处理方式：
- 有数据的维度正常绘制。
- 无数据的维度：轴线保留（说明产品有这个维度），但**不连线到该轴**，
  在轴末端标注"待开始"，用虚线轴 + 灰色标签。
- 图例下方一行说明："当前评估基于围棋学习数据，覆盖 4 / 6 个能力维度。"

### 4.4 学科维度的降级

家长端"学科"区块只遍历 `Domain` 注册表中 `hasContent: true` 的学科（当前 3 个棋类）。
**不预置**数学/语文/英语的空卡片——空卡片是隐性承诺。

### 4.5 结论生成的诚实原则

`headline` 与 `concerns` 由规则生成，且必须满足：

| 规则 | 例 |
|---|---|
| 数据不足时不下结论 | 本周学习 < 2 天 → headline 为"本周学习较少（1 天），建议先恢复节奏"而不是能力评价 |
| 结论必须可追溯 | 每条 concern 必须有 `evidence`，家长点得进去 |
| 不做跨维度推测 | 不允许"逻辑好所以数学应该也不错" |
| 不做人格评价 | 说"这周专注时长下降"，不说"孩子专注力差" |

---

## 5. 概览页线框

```
┌──────────────────────────────────────────────────────────┐
│ ← 家长中心            一诺 ▾                    账号 ▾    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  本周（8/18 – 8/24）                                      │
│  一诺这周学了 4 天、共 62 分钟，通关 3 关。               │  headline
│  「打二还一」连续错了 3 次，建议本周重点看这个。          │  display/heading
│                                                          │
│  ┌─ 本周关注 ────────────────────────────────────────┐  │
│  │ ⚠ 打二还一（提子后的形状判断）                     │  │  Concern
│  │   证据：8/20、8/22、8/23 三道题都在同一步走错       │  │  + evidence
│  │                                                    │  │
│  │   你可以这样帮他：                                  │  │  RecommendedAction
│  │   陪他做这 3 道死活题，做完让他说一遍"为什么这里能提"│  │
│  │   约 8 分钟          [ 一起去练习 ]                 │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─ 学习概览 ─────────┐ ┌─ 能力速览 ─────────────────┐  │
│  │ 学习天数  4 (+1)   │ │ 逻辑推理   72  ↑           │  │
│  │ 时长      62′ (+8) │ │ 计算能力   68  →           │  │
│  │ 通关      3 关     │ │ 空间感知   75  ↑           │  │
│  │ 正确率    78% (-2) │ │ 专注力     64  ↓           │  │
│  │                    │ │ 记忆      正在积累          │  │
│  │                    │ │ 语言表达  尚未开始 ⓘ        │  │
│  └────────────────────┘ └────────────────────────────┘  │
│                                                          │
│  [ 查看完整周报 ]  [ 能力详情 ]  [ 学习记录 ]             │
└──────────────────────────────────────────────────────────┘
```

移动端（< 768px）：区块纵向堆叠，顺序不变（结论 → 关注 → 概览 → 能力 → 入口）。
**首屏必须能看到 headline 与第一条关注点。**

---

## 6. 与现有 `ParentDashboardView` 的关系

| 现有内容 | 处置 |
|---|---|
| 数据卡片网格（金币、星星、对局数等） | 精简。金币/星星是儿童激励指标，家长端只保留"学习天数/时长/通关/正确率" |
| 能力雷达 | 保留，但必须实现 §4.3 的降级画法 |
| 错题列表 | 移到 `/parent/records`，概览页只出现在 Concern 的 evidence 里 |
| 无"关注点 + 建议动作" | **新增**，是家长端的核心价值 |
| 无周对比 | **新增** |
| 无家长验证门槛 | **新增** `requiresParent` |
| 与儿童端共用 Navbar 与视觉语言 | 改为 Parent Shell（见 [02](./02-app-shell.md)） |

---

## 7. 交付边界（Phase 7）

| 允许 | 禁止 |
|---|---|
| 新建 `src/domain/parent/types.ts` 与周报生成器 | 在没有真实数据时输出任何数字 |
| 重写 `ParentDashboardView` 为 Parent Shell 下的多页 | 引入排行榜或横向对比 |
| 复用 `AbilityProfile`（Phase 4 产出） | 直接读 `KnowledgeMasteryRecord` 自己算能力 |
| 周报结论用规则生成 | 用 AI 生成家长端结论 |
