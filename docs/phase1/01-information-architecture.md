# 01 · IA 信息架构

## 1. 现状问题（简述，不重复诊断报告）

当前 27 条路由几乎全部平铺在同一层，`GoHubView` 与 `HomeView` 各自罗列十余个入口，
底部导航靠 `Navbar.vue` 里一段 17 行的 `route.path === ...` 硬编码判断来决定高亮，
沉浸态靠 `App.vue` 的 `route.path.startsWith('/lesson/')` 与 `Navbar` 的
`route.path.includes('/lesson/')` **两处各自判断**。加一个页面要改三个地方。

## 2. 顶层结构决策

用户给出的候选是 `Today / Learn / Growth / Parent`。经过对真实路由与用户角色的推导，
**采纳其中三个，把 Parent 从儿童底部导航中移出，并新增 Play**：

```
儿童底部导航（4 个）：Today · Learn · Play · Me
家长端：独立 Shell，需家长验证后进入，不占儿童导航位
```

理由：

1. **Parent 不能是儿童底部 tab。** 家长看板包含能力评估、薄弱项、学习习惯分析，
   属于对孩子的评价性信息，直接摆在儿童首屏底部是产品事故。它必须在独立 Shell 中，
   且入口受保护（见 `requiresParent`）。
2. **必须有 Play。** 现存 `PuzzleHubView`、`ArcadeView`、跳棋、五子棋是真实存在且孩子会玩的内容，
   但它们不承担围棋主线的能力归因。如果强行塞进 Learn，会污染"Learn 里的每一项都有能力归因"这条规则；
   如果删掉，等于砍掉现有价值。给它一个诚实的位置。
3. **Growth 并入 Me。** 儿童端的成长展示（能力、成就、证书、记录）本质是"关于我的"，
   与头像、装扮、档案切换天然同属一处。独立成 tab 会让 Me 变成空壳。
4. **Today 必须是第一 tab 且是默认路由。** 它是"我现在该做什么"的唯一答案位。

## 3. 完整树状结构

```
Today  /                                    [child · section=today]
├── Continue                     首屏主行动，跳到 Immersive
├── Today's Tasks                今日任务清单（3 项内）
├── Daily Practice               每日死活题 / 每日一练
├── AI Recommendation            小诺推荐（基于薄弱知识点）
├── Streak & Check-in            连续天数与打卡
└── Recent State                 最近学习状态摘要

Learn  /learn                               [child · section=learn]
└── Go  围棋主线（第一阶段唯一完整学科）
    ├── Adventure      /learn/go/adventure      主线地图（章 → 关）
    │   └── Lesson     /lesson/:id              [immersive]
    ├── Training       /learn/go/training       专项训练聚合页
    │   ├── Tsumego    /learn/go/tsumego        死活题训练营 [immersive]
    │   ├── Practice   /learn/go/practice       知识点专项练习 [immersive]
    │   └── Arcade     /learn/go/arcade         极速反应（数气/吃子/连断）[immersive]
    ├── Match          /learn/go/match          对局聚合页
    │   ├── AI Match   /learn/go/match/ai       萌宠 AI 对弈 [immersive]
    │   ├── Two Player /learn/go/match/local    亲子双人对弈 [immersive]
    │   └── Capture Go /learn/go/match/capture  吃子游戏（入门对局）[immersive]
    ├── Rank Exam      /learn/go/rank-exam      段级位考 [immersive]
    ├── Review         /learn/go/review         复盘与棋谱
    │   └── Free Board /learn/go/free-board     自由打谱台 [immersive]
    ├── Mistakes       /learn/mistakes          智能错题本
    └── Reference      /learn/go/reference      资料区（词典 · 口诀 · 习题纸）

Play  /play                                 [child · section=play]
├── Gomoku            /play/gomoku            欢乐五子棋 [immersive]
├── Checkers          /play/checkers          六角跳棋 [immersive]
└── （后续益智内容挂在此处，不进 Learn）

Me  /me                                     [child · section=me]
├── Overview                     档案卡：昵称 · 头像 · 段位 · 连续天数
├── Ability                      能力雷达（儿童版：只讲优势与"正在变强"）
├── Achievements                 勋章墙
├── Certificates                 证书（段级位考产出）
├── Records                      学习记录 / 对局记录
├── Shop              /me/shop   装扮商城
└── Settings                     声音 · 主题 · 辅助显示

Parent  /parent                             [parent · requiresParent]
├── Overview          /parent                本周结论先行
├── Weekly Report     /parent/weekly         周报
├── Ability           /parent/ability        能力趋势与薄弱项
├── Records           /parent/records        学习记录明细
├── Children          /parent/children       多宝贝档案管理
└── Settings          /parent/settings       账号 · 云同步 · AI 配置 · 数据导出

Admin  /admin                               [parent · requiresAdmin]
└── 运营后台（非产品功能，独立于上述结构）
```

## 4. 路由处置清单

处置动作定义：**KEEP** 保留路径与语义；**MOVE** 语义保留但路径重挂（旧路径 301 重定向）；
**MERGE** 并入其他页面；**INTERNAL** 不出现在导航中的内部页；**DELETE** 移除。

### 4.1 顶级入口

| 现路由 | 组件 | 处置 | 新路径 | 说明 |
|---|---|---|---|---|
| `/` | `HomeView` | **重写** | `/`（Today） | 从"入口罗列页"改为 Today。组件重写但路由不变 |
| `/learn` | `GoHubView` | **重写** | `/learn` | 从"17 入口平铺"改为 Learn 结构页 |
| `/puzzle` | `PuzzleHubView` | **MOVE + 重写** | `/play` | 语义即 Play |
| `/study` | `StudyCenterView` | **拆分** | 见下 | 见 4.5 |
| `/profile` | `ProfileView` | **MOVE + 重写** | `/me` | 拆出成长模块 |

### 4.2 围棋主线与训练

| 现路由 | 处置 | 新路径 | Shell |
|---|---|---|---|
| `/adventure` | MOVE | `/learn/go/adventure` | child |
| `/lesson/:id` | KEEP | `/lesson/:id` | **immersive** |
| `/adventure/:id` | KEEP（重定向） | → `/lesson/:id` | — |
| `/tsumego` | MOVE | `/learn/go/tsumego` | immersive |
| `/practice` | MOVE | `/learn/go/practice` | immersive |
| `/arcade` | MOVE | `/learn/go/arcade` | immersive |
| `/rank-exam` | MOVE | `/learn/go/rank-exam` | immersive |
| `/free-board` | MOVE | `/learn/go/free-board` | immersive |
| `/mistakes` | MOVE | `/learn/mistakes` | child |
| `/battle` | **MERGE** | → `/learn/go/match` | `BattleView` 与 Match 聚合页职责重叠，二者合一 |

### 4.3 对局

| 现路由 | 处置 | 新路径 | Shell |
|---|---|---|---|
| `/ai-match` | MOVE | `/learn/go/match/ai` | immersive |
| `/two-player` | MOVE | `/learn/go/match/local` | immersive |
| `/capture-go` | MOVE | `/learn/go/match/capture` | immersive |
| `/gomoku` | MOVE | `/play/gomoku` | immersive |
| `/checkers` | MOVE | `/play/checkers` | immersive |

### 4.4 资料区

| 现路由 | 处置 | 新路径 | 说明 |
|---|---|---|---|
| `/dictionary` | MOVE + INTERNAL | `/learn/go/reference/dictionary` | 低频，收进资料区，不占一级入口 |
| `/rhymes` | MOVE + INTERNAL | `/learn/go/reference/rhymes` | 同上 |
| `/worksheet` | MOVE + INTERNAL | `/learn/go/reference/worksheet` | A4 打印，家长使用场景 > 儿童 |

### 4.5 `/study` 的拆分（重点）

`StudyCenterView` 目前混装三样东西，必须拆开：

| 现有区块 | 处置 | 去向 |
|---|---|---|
| 今日作业打卡（可增删待办 + 完成给币） | **MOVE** | 迁入 Today 的 `Today's Tasks`。P0 已修的幂等与每日封顶逻辑随之迁移，不得丢失 |
| 全科智能错题本入口 | MERGE | 已在 `/learn/mistakes` |
| 家长学情看板入口 | MERGE | 已在 `/parent` |
| 一年级至高中"学科体系概览"静态文本 | **DELETE** | 纯静态展示，无学习闭环、无内容支撑。保留它等于对家长承诺不存在的能力（违反产品定位第 8 条） |
| `/study` 路径本身 | **DELETE + 重定向** | → `/`（Today） |

### 4.6 家长与运营

| 现路由 | 处置 | 新路径 | 说明 |
|---|---|---|---|
| `/parent-dashboard` | MOVE | `/parent` | 进入 Parent Shell，加 `requiresParent` |
| `/dashboard` | KEEP（重定向） | → `/parent` | |
| `/shop` | MOVE | `/me/shop` | |
| `/admin` | KEEP | `/admin` | 已有 `requiresAdmin` 守卫，迁到 meta 驱动 |

### 4.7 兜底

| 现路由 | 处置 |
|---|---|
| `/subject/:pathMatch(.*)*` → `/study` | 改为 → `/learn` |
| `/:pathMatch(.*)*` → `/` | KEEP |
| 全部 4.2–4.6 的旧路径 | 一律保留为重定向，**至少保留两个大版本**。PWA 已上线，用户主屏图标与浏览器书签会指向旧路径 |

## 5. 模式归属总表

| Shell | 页面 |
|---|---|
| **Child** | Today、Learn 及其聚合页、Play 聚合页、Me 及子页、Mistakes、Reference 聚合页 |
| **Immersive** | Lesson、Tsumego、Practice、Arcade、Rank Exam、Free Board、AI Match、Two Player、Capture Go、Gomoku、Checkers |
| **Parent** | `/parent` 全部子页、`/admin` |

判定规则（写进代码注释）：
**只要页面主体是一块需要持续注视的棋盘/答题区，就是 Immersive。**

## 6. RouteMeta 完整类型设计

替代当前散落在 `App.vue`、`Navbar.vue`、`router/index.ts` 里的三处硬编码判断。

新建 `src/types/route.ts`：

```ts
import type { UnlockFeatureId } from '../data/unlockRules';

/** AppShell 三态：决定 Header / Navigation / 安全区 / 内容宽度的整体形态 */
export type AppShellMode = 'child' | 'parent' | 'immersive';

/** 儿童底部导航分区，决定哪个 tab 高亮 */
export type ChildNavSection = 'today' | 'learn' | 'play' | 'me';

/** 内容最大宽度档位，具体像素值见 11-responsive */
export type ContentWidth = 'narrow' | 'default' | 'wide' | 'full';

/** 返回行为 */
export type BackBehavior =
  | { type: 'none' }                                  // 不显示返回（顶级 tab）
  | { type: 'history' }                               // 优先 router.back()
  | { type: 'route'; to: string }                     // 固定回到某路由
  | { type: 'confirm'; to: string; message: string }; // 有未完成状态时先确认

declare module 'vue-router' {
  interface RouteMeta {
    /** 必填：Shell 形态 */
    mode: AppShellMode;

    /** 必填：文档标题（取代 router.afterEach 里的 titleMap 硬编码表） */
    title: string;

    /** child 模式必填：底部导航高亮分区 */
    section?: ChildNavSection;

    /** 面包屑/Header 标题，缺省用 title */
    label?: string;

    // ——— 权限 ———
    /** 需要已登录家长账号 + 通过家长验证才能进入 */
    requiresParent?: boolean;
    /** 需要管理员 */
    requiresAdmin?: boolean;
    /** 需要至少一个儿童档案（缺失时弹档案创建，而非静默失败） */
    requiresProfile?: boolean;
    /** 解锁门槛，取代 router.beforeEach 里对 UNLOCK_FEATURES 的路径匹配 */
    unlockFeatureId?: UnlockFeatureId;

    // ——— 导航与布局 ———
    /** 完全隐藏全局导航（Header + BottomNav），immersive 默认 true */
    hideNavigation?: boolean;
    /** 只隐藏底部导航 */
    hideBottomNav?: boolean;
    /** 隐藏页脚 */
    hideFooter?: boolean;
    /** 返回行为 */
    back?: BackBehavior;
    /** 内容最大宽度 */
    width?: ContentWidth;

    // ——— 能力开关 ———
    /** 是否展示 AI 小诺悬浮入口；immersive 学习页应为 true，纯娱乐页为 false */
    aiTutor?: boolean;
    /** 该页面是否需要保持竖屏锁定（棋盘页在 iPad 横屏应放开） */
    orientation?: 'portrait' | 'any';
    /** 是否缓存组件实例（对局页需要，聚合页不需要） */
    keepAlive?: boolean;
  }
}
```

### 6.1 默认值约定

由 AppShell 统一兜底，路由表不必逐条写满：

| 字段 | `mode: 'child'` | `mode: 'immersive'` | `mode: 'parent'` |
|---|---|---|---|
| `hideNavigation` | `false` | `true` | `false` |
| `hideBottomNav` | `false` | `true` | `true`（家长端用侧栏/顶部 tab） |
| `hideFooter` | 移动端隐藏、桌面显示 | `true` | `true` |
| `back` | 顶级 tab `none`，其余 `history` | `{ type: 'route', to: 上级聚合页 }` | `history` |
| `width` | `default` | `full` | `wide` |
| `aiTutor` | `true` | 学习页 `true`、娱乐页 `false` | `false` |
| `orientation` | `portrait` | `any` | `any` |

### 6.2 路由表写法示例

```ts
{
  path: '/learn/go/match/ai',
  name: 'go-match-ai',
  component: () => import('../views/go/GoAiMatchView.vue'),
  meta: {
    mode: 'immersive',
    title: '萌宠 AI 对弈',
    section: 'learn',
    requiresProfile: true,
    unlockFeatureId: 'ai_match',
    back: { type: 'confirm', to: '/learn/go/match', message: '当前对局还没下完，确定要离开吗？棋局已自动保存。' },
    aiTutor: true,
    orientation: 'any',
    keepAlive: true
  }
}
```

### 6.3 守卫改造要求

`router.beforeEach` 里现有三段逻辑全部改为读 meta，不再匹配路径字符串：

1. 管理员校验 → `to.meta.requiresAdmin`
2. 玩法解锁校验 → `to.meta.unlockFeatureId`（替代 `UNLOCK_FEATURES.find(f => f.route === to.path)`
   这种把路由路径写进数据文件的耦合）
3. 家长区校验 → `to.meta.requiresParent`
4. 课程渐进解锁（`lesson_1_1` / `c1_l1` 双 id 硬编码）→ 迁到 LearningNode 的 `UnlockRule`，
   见 [06-learning-model](./06-learning-model.md)
5. `document.title` → 统一读 `to.meta.title`，删除 `titleMap`

### 6.4 强制约束

- **禁止**在任何组件里出现 `route.path.startsWith(...)`、`route.path.includes(...)`
  来判断布局形态。Phase 9 QA 阶段应加一条 lint/grep 检查项拦住回归。
