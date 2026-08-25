# 15 · 架构决策记录（ADR）

本文件是 Phase 1 全部**最终决策**的索引。每条决策标注状态、正文出处、被否决的替代方案。
Phase 2 之后若要推翻其中任何一条，必须在此追加新 ADR 并说明触发原因，不允许在代码中静默偏离。

状态取值：`ACCEPTED`（已定稿，可施工）· `DEFERRED`（本阶段只定架构，实现留到后续）

---

## ADR-01 · 产品定位

**状态**：ACCEPTED · **正文**：[00](./00-product-positioning.md)

**决策**：定位为「以围棋为第一学科的儿童思维训练与能力成长平台」，不是"K12 全科学习 App"，
也不是"围棋游戏"。核心用户是 5–12 岁儿童（重心 6–9 岁）与作为付费决策方的家长。

**关键约束**：

- 儿童端价值 = 每天知道该做什么 + 看得见自己变强；
- 家长端价值 = 用真实数据回答"孩子在变强吗"；
- 游戏是围棋能力的**应用场景**，不是奖励诱饵；
- **不承诺不存在的能力**（这是本次删除"学科体系概览"静态区块的直接依据）。

**否决的替代方案**：继续做全科 K12 定位。理由：学业内容资产已被删除，
`SubjectId` 实际只有棋类，维持全科定位等于对家长虚假承诺。

---

## ADR-02 · 信息架构：儿童四 tab + 家长独立 Shell

**状态**：ACCEPTED · **正文**：[01 §2–3](./01-information-architecture.md)

**决策**：

```
儿童底部导航（4）：Today · Learn · Play · Me
家长端：独立 Shell，requiresParent 保护，不占儿童导航位
Admin：独立于产品结构
```

对建议的 `Today / Learn / Growth / Parent` 做了三处改动：

| 改动 | 理由 |
|---|---|
| Parent 移出儿童底部导航 | 能力评估、薄弱项属于对孩子的评价性信息，摆在儿童首屏是产品事故 |
| 新增 Play | 五子棋/跳棋/极速反应是真实内容但不承担能力归因。塞进 Learn 会污染"Learn 每一项都有能力归因"这条规则 |
| Growth 并入 Me | 儿童端成长展示本质是"关于我的"，独立成 tab 会让 Me 变空壳 |

**Today 是默认路由**，是"我现在该做什么"的唯一答案位。

**否决**：保留现有 17 入口平铺的 Hub 形态。理由：入口罗列页不回答任何用户问题。

---

## ADR-03 · AppShell 三态 + RouteMeta 驱动

**状态**：ACCEPTED · **正文**：[02](./02-app-shell.md)、[01 §6](./01-information-architecture.md)

**决策**：布局形态由 `route.meta` 单一来源决定，`App.vue` 按 `meta.mode` 派发到三种 Shell。

```
AppShellMode = 'child' | 'parent' | 'immersive'
```

`RouteMeta` 必填 `mode` + `title`；`child` 模式必填 `section`。
可选字段覆盖权限（`requiresParent` / `requiresAdmin` / `requiresProfile` / `unlockFeatureId`）、
导航（`hideNavigation` / `hideBottomNav` / `hideFooter` / `back` / `width`）、
能力开关（`aiTutor` / `orientation` / `keepAlive`）。
未写的字段由 Shell 按 [01 §6.1](./01-information-architecture.md) 的默认值表兜底。

**强制约束**：全站禁止 `route.path.startsWith(...)` / `route.path.includes(...)` 判断布局。
Phase 9 加 grep 检查拦住回归。

**这条决策同时消灭**：`App.vue` 的 `/lesson/` 硬编码、`Navbar.vue` 的 17 行路径匹配、
`router.afterEach` 的 `titleMap`、`unlockRules.ts` 里把 `route` 路径写进数据文件的耦合。

**否决**：在组件内用 `computed` 集中做路径判断。理由：仍然是路径字符串匹配，
新增路由必须回头改布局组件，耦合方向没变。

---

## ADR-04 · Design Token：CSS 变量单一来源 + 具体数值定稿

**状态**：ACCEPTED · **正文**：[03](./03-design-tokens.md)

**决策**：Token 定义在 `src/styles/tokens.css`，Tailwind 通过 `theme.extend` 引用变量。
组件与页面**只能**使用 Token，禁止硬编码色值与 px 字号。

已定稿的具体值覆盖：色板（brand / surface / text / border / 语义状态 / 领域色 / 棋盘色）、
6 级字阶（display / heading / title / body / label / caption，含 size + line-height + weight + letter-spacing）、
spacing scale、radius、5 级 elevation、motion（instant / fast / normal / slow / emphasis + 缓动 + 交互规范）、
z-index 分层。

**硬规则（可访问性，不可绕过）**：正文对比度 ≥ 4.5:1，大字号 ≥ 3:1；
`font-black` / `font-extrabold` 与 `text-[10px]` 进白名单管理；
全部装饰动效必须响应 `prefers-reduced-motion`。

**否决**：直接用 Tailwind 默认调色板。理由：无法表达领域色与棋盘色语义，
也无法支撑 ADR-05 的年龄主题覆盖。

---

## ADR-05 · Age Adaptive Theme：只定架构，不做四套视觉

**状态**：DEFERRED · **正文**：[03 §8](./03-design-tokens.md)

**决策**：链路为 `AgeStage → ThemeTokenOverride → CSS 变量覆盖 → 组件自动适配`。
四档为 `early-childhood` / `primary` / `middle-school` / `teen`。
实现方式是在根元素挂 `data-age-stage`，只覆盖**少量** token（字号基准、圆角、间距密度、动效强度），
不做四套独立视觉稿。

**本阶段边界**：只落地类型与覆盖表结构，`primary` 为唯一实际启用档位。

**否决**：现在就做四套完整视觉。理由：当前内容只覆盖 5–12 岁，
`middle-school` / `teen` 无内容支撑，做了就是死代码。

---

## ADR-06 · 组件架构：design-system（原子）与 features（语义）分离

**状态**：ACCEPTED · **正文**：[04](./04-component-api.md)

**决策**：

```
src/design-system/   11 个原子组件，零业务依赖，不 import store
src/features/<域>/components/   语义组件，可依赖领域层与 store
```

原子组件：`AppButton` `AppCard` `AppBadge` `AppProgress` `AppIcon` `AppAvatar`
`AppModal` `AppEmptyState` `AppSkeleton` `AppTabs` `AppSection`。

语义组件归属结论（[04 §3.1](./04-component-api.md)）：
`ContinueCard` / `DailyTaskCard` 属 features/today；`LessonCard` / `ChallengeCard` 属 features/learn；
`GrowthCard` / `AbilityCard` / `AchievementCard` 属 features/growth；
`RewardCard` 属 features/reward；`WeeklyReportCard` 属 features/parent。
**不把语义组件塞进 design-system。**

**由组件控制、业务页面不得自行实现的视觉行为**：颜色、圆角、阴影、内边距、
状态样式（hover/press/disabled/loading）、焦点环、过渡时长。

**否决**：全部组件放一个 `components/` 目录。理由：原子组件一旦允许 import store，
就无法被复用也无法测试，会退化成现在的样子。

---

## ADR-07 · Today 首页：回答"现在做什么"，首屏 ≤ 3 个主 CTA

**状态**：ACCEPTED · **正文**：[05](./05-today-home.md)

**决策**：手机版首屏自上而下为 问候+连续天数 → **Continue（主行动，唯一强调按钮）** →
今日任务（≤3 项）→ 小诺推荐；其余内容折叠或进二级页。
桌面版为双栏，主栏 Continue + 今日任务，侧栏连续天数 + 最近状态。

**首屏禁止出现**：入口网格、多个同等权重 CTA、未接线的"敬请期待"、装饰性空卡片。

**否决**：保留 `HomeView` 的入口罗列 + 增加一个 Continue 卡片。
理由：多个同等权重入口与"唯一主行动"互相抵消，等于没改。

---

## ADR-08 · Learning Model：Adapter 消费遗留内容，绝不改写内容资产

**状态**：ACCEPTED · **正文**：[06](./06-learning-model.md)

**决策**：

```
chapters.ts / tsumegoLibrary.ts（只读）
        ↓ Adapter
LearningNode（统一模型）
        ↓
UI / 解锁 / 能力 / 奖励
```

核心类型：`Domain` `LearningNode` `Skill` `KnowledgePoint` `Progress` `Mastery`
`UnlockRule` `RewardSpec`。

**ChapterId 撞号与三套 Chapter/Lesson 的解决方式**：
`LearningNode.legacyIds: string[]` 同时持有 `c<N>_l<M>` 与 `lesson_<N>_<M>` 两种历史 id，
读取 `progress` 时按 `legacyIds` 合并；第三套 `data/curriculum.ts` 随 `LevelPlayView` 一并删除。
**不改 `progress` 的真实数据结构**（改 key 等于让所有用户进度归零）。

**学业数据**：只在 `Domain` 层留挂载位，不实现、不展示。

**否决**：直接重构 5473 行 `chapters.ts` 为新结构。理由：违反原则 1 与原则 2，
且会破坏所有已有进度 key。

---

## ADR-09 · Ability Model：能力不是货币的别名

**状态**：ACCEPTED · **正文**：[07](./07-ability-model.md)

**决策**：六维为 `logic` `calculation` `language` `memory` `concentration` `spatial`。

```
学习行为 → LearningEvent → Skill 归因 → AbilityEvent → AbilityProfile
```

**硬规则**：

- **金币 ≠ 能力，经验 ≠ 能力，星星 ≠ 能力。** 能力值只由带 Skill 归因的
  `AbilityEvent` 产生，任何货币变动都不得写入 `AbilityProfile`；
- 能力**不是累加计数器**，是带时间衰减的表现估计，可以下降；
- 样本量门槛：< 5 次样本不显示具体分数（显示"正在积累"），≥ 20 次才算 `high` 置信。

**语言维度的诚实处理**：第一阶段围棋内容对 `language` 几乎无归因，
该维度长期为 `low` 置信，家长端按 ADR-11 降级展示，**不允许补零或造数**。

**否决**：用金币/经验/关卡数直接映射能力雷达。理由：那是活跃度指标，
不是能力指标，对家长构成误导。

---

## ADR-10 · Reward Model：统一入口 + 幂等键账本

**状态**：ACCEPTED（P0 已落地核心） · **正文**：[08](./08-reward-model.md)

**决策**：

```
LearningEvent（发生了什么）
    ↓ 有效性判定 EventValidity
RewardEvent（该给什么）
    ↓ 幂等键去重
RewardTransaction（实际发放，写入账本）
```

`IdempotencyKey` 格式 `reward:<domain>:<parts...>`，例：
`reward:study-task:<taskId>:<date>`、`reward:match:<matchId>`、`reward:exam:<tierId>`。

**六道防线**：有效性判定 → 幂等键 → 账本查重 → 每日封顶 → 数值集中配置 → 统一入口。

**对局有效性统一判定**（供所有棋种复用）：最小手数门槛 + 认输/中止不发奖 +
本地双人对局降额，杜绝"开局即认输领奖"与"自走两步结算"。

**最终状态**：`reportLearningEvent()` 是唯一发奖路径。页面**不得**直接调用
`addCoins(...)` / `addExp(...)`；Phase 9 加 grep 护栏。

**P0 已实现**：`src/utils/rewardKey.ts` + `grantRewardOnce` + `rewardLedger`，
已修 `StudyCenterView`、`AiTutorFloatModal`、`AiMatchView` 三处。
剩余调用点在 P2 收敛（见 [13](./13-risks.md) H-1/H-2/H-3、L-1/L-2）。

**否决**：在 UI 层加 `disabled` 防重复。理由：refresh / retry / toggle / replay
任何一条路径都能绕过，必须在奖励系统层保证幂等。

---

## ADR-11 · AI 小诺：六段链路，类型层强制 TTS 安全

**状态**：DEFERRED（架构定稿，实现在 P8；临时降险在 P2） · **正文**：[09](./09-ai-tutor.md)

**决策**：

```
User Input → ① Input Safety → ② Context Builder → ③ Tutor Engine
           → ④ Response Guard → ⑤ TTS Guard → ⑥ UI
```

**最关键的一条决策**：用类型系统而非流程纪律保证 TTS 安全。

```ts
export type SpeakableText = string & { readonly __speakable: unique symbol };
```

`speakText()` 只接受 `SpeakableText`，该类型**只能由 `ttsGuard` 产出**。
任何未经审查的 `string` 传入即**编译失败**。这样"忘记过 Guard"从人为疏漏变成构建错误。

`TutorProvider` 为 provider 接口，支持超时降级到本地规则；
`GuardVerdict` 覆盖内容安全、隐私、prompt injection、不适宜儿童内容、越权指令。

**Context Builder 消费**：当前课程、当前题目、当前知识点、最近错误与错因、
mastery、学习历史、年龄段、当前能力。**禁止**把 API Key 或其他用户数据写入上下文。

**P2 临时降险三件事**：`autoSpeech` 默认 `false`、家长 AI 默认本地规则、
错误文案不再拼 `err.message`。理由见 [14 §0 调整 1](./14-phase2-plan.md)。

**回滚原则**：不可回滚到无安全层状态。若 Guard 导致功能不可用，
正确做法是关闭 AI 入口，不是绕过 Guard。

**否决**：先上功能、后补安全层。理由违反原则 5，且 Critical 风险会存活整个重构周期。

---

## ADR-12 · Parent Mode：结论先行，缺数据就说缺数据

**状态**：ACCEPTED · **正文**：[10](./10-parent-mode.md)

**决策**：家长端回答五个问题而非堆数据大屏：
最近学了什么 / 哪些能力在增长 / 哪些地方卡住了 / 本周该关注什么 / 家长该怎么帮。

结构：`WeeklySummary` `LearnedItem` `Highlight` `Concern` `RecommendedAction`
`LearningHabit` `AbilityTrend`。

**降级展示三档**：`ready`（≥20 样本，显示分数与趋势）/
`accumulating`（5–19，显示"正在积累"）/ `insufficient`（<5，不显示该维度）。

**绝对禁止**：为数学、语文、英语伪造数据或渲染空维度占位。
雷达图在多数维度低置信时改画横向条形 + 置信标注，不画一个大部分是零的雷达。

**否决**：先做成完整六维雷达 + 学科分布饼图。理由：当前只有围棋数据，
这类图表必然需要造数才能"好看"，直接违反 ADR-01。

---

## ADR-13 · 响应式：七档断点 + 统一棋盘尺寸函数

**状态**：ACCEPTED · **正文**：[11](./11-responsive.md)

**决策**：针对 375 / 390 / 430 / 768 / 1024 / 1440 / 1920 给出内容最大宽度、
grid 列数、sidebar 与 bottom nav 出现条件、棋盘最大尺寸、BoardShell 布局。

棋盘尺寸由**唯一**的 `useBoardSize()` 实现（输入 `BoardSizeInput`），
取代各棋类页面各自的尺寸计算。

**iPad 横屏**：放开竖屏锁定（`meta.orientation: 'any'`），BoardShell 横向布局，
棋盘居中 + 侧栏放信息区。当前 `lockPortraitOrientation` 的全局无条件锁竖屏是明确要改的点。

**断点落地方式**：分两步。P3 新增 `phone` / `tablet` / `laptop` / `desktop`
与 Tailwind 默认断点共存；P9 页面全部迁移后再移除默认断点。
**禁止一次性覆盖 `screens`** —— 会让全站现有 `sm:` / `lg:` 语义静默漂移（[13 M-1](./13-risks.md)）。

**否决**：直接覆盖 Tailwind `screens`。理由同上，风险不可控且无法被类型检查发现。

---

## ADR-14 · Migration：Adapter 优先，数据结构最后动

**状态**：ACCEPTED · **正文**：[12](./12-keep-refactor-delete.md)、[14](./14-phase2-plan.md)

**决策**：

1. **KEEP 名单是硬约束**：`src/engine/**`、`chapters.ts`、`tsumegoLibrary.ts` 永久禁改，
   例外仅限"有失败测试证明的真实 bug"；
2. **零引用不等于可删**：每一项 DELETE 必须给出引用计数之外的第二个理由；
3. **涉及用户数据的一律不直删**，先 DEPRECATE 且先统计线上分布；
4. **`useUserStore` 拆分只拆 actions/getters，不改 state 形状与 store id**，
   否则用户表现为"进度全部丢失"；
5. **旧路径全部保留重定向至少两个大版本**（PWA 主屏图标与书签指向旧路径）；
6. 两个 `GoBoard` 按 [12 §5](./12-keep-refactor-delete.md) 五步合并，逐页人工回归，
   **不能简单删掉引用少的那个**。

汇总：KEEP 15 类、REFACTOR 24、MOVE 5 类、DEPRECATE 5、DELETE 8；
涉及数据迁移 4 项，全为 DEPRECATE，本阶段与 P2 均不执行真实迁移。

**否决**：一次性大重构 + 数据结构统一。理由：无法回滚，且任一环节出错都会造成用户数据事故。

---

## ADR-15 · 施工顺序：采纳建议主干，两处调整

**状态**：ACCEPTED · **正文**：[14](./14-phase2-plan.md)

**决策**：

```
P2 Migration+Cleanup → P3 Design System → P4 Learning+Ability
→ P5 AppShell+Today → P6 Go → P7 Growth+Parent → P8 AI → P9 QA
```

两处调整：

1. **AI 安全的临时降险从 P8 提前到 P2**（三件极小改动，避免 Critical 风险存活 6 个 Phase）；
2. **断点覆盖从"一次性"改为"两步走"**（P3 新增自定义断点，P9 移除默认断点）。

可并行：P3 与 P4 完全并行（无文件重叠）；P6 与 P7 并行（P5 完成后）；
P8 可在 P4 后随时启动，若人力允许建议与 P6 并行以尽早关闭 Critical。

不可并行：P2 独占；P5 必须在 P3+P4 后；P9 必须最后。

---

## 决策速查表

| ADR | 主题 | 状态 | 最早施工 Phase |
|---|---|---|---|
| 01 | 产品定位 | ACCEPTED | — （约束所有 Phase） |
| 02 | IA：儿童四 tab + 家长独立 Shell | ACCEPTED | P2（路由）/ P5（导航） |
| 03 | AppShell 三态 + RouteMeta | ACCEPTED | P2（meta）/ P5（Shell） |
| 04 | Design Token | ACCEPTED | P3 |
| 05 | Age Adaptive Theme | DEFERRED | P3（仅架构） |
| 06 | 组件架构分层 | ACCEPTED | P3 |
| 07 | Today 首页 | ACCEPTED | P5 |
| 08 | Learning Model + Adapter | ACCEPTED | P4 |
| 09 | Ability Model | ACCEPTED | P4 |
| 10 | Reward Model + 幂等 | ACCEPTED（P0 已落地核心） | P0 ✅ / P2 收敛 |
| 11 | AI 小诺六段链路 | DEFERRED | P2（降险）/ P8（实现） |
| 12 | Parent Mode 降级展示 | ACCEPTED | P7 |
| 13 | 响应式七档 + 棋盘尺寸 | ACCEPTED | P3（断点）/ P6（棋盘） |
| 14 | Migration 策略 | ACCEPTED | P2 起 |
| 15 | 施工顺序 | ACCEPTED | — |
