# 14 · Phase 2+ 施工计划

## 0. 对建议顺序的确认与两处调整

原始建议顺序：

```
P0 → P1 Design → P2 Migration + Cleanup → P3 Design System
→ P4 Learning Domain + Ability → P5 AppShell + Today
→ P6 Go Experience → P7 Growth + Parent → P8 AI Tutor → P9 QA
```

**主干顺序确认采纳。** 它的依赖方向是正确的：底座（路由/数据/Token）先稳，
再做领域模型，再做外壳与页面，最后做最依赖上下文的 AI。

需要两处调整：

### 调整 1：把 AI 安全的"临时降险"从 P8 提前到 P2（必须）

**原因**：当前链路是
`用户输入 → 模型 → 直接渲染 → autoSpeech 默认 true 自动朗读`，
输出侧零审查（[13 C-1](./13-risks.md)）。这是 Critical 级儿童安全风险。

把它整体留到 P8，意味着**在 6 个 Phase 的施工周期内风险持续暴露**。
而完整的 Response Guard 需要 Context Builder、mastery、知识点等上游能力，
确实只能在 P8 做。

因此拆成两段：

- **P2 做三件极小改动**（不引入新架构、不动 AI 业务逻辑）：
  1. `autoSpeech` 默认值 `true → false`；
  2. 家长端 AI provider 默认值改为本地规则（输出完全可控）；
  3. 错误分支不再把 `err.message` 拼进儿童可见文案（[13 C-2](./13-risks.md)）。
- **P8 做完整安全层**：Input Safety / Response Guard / TTS Guard。

三件改动合计预计 20 行以内，风险远低于"让 Critical 风险再存活 6 个 Phase"。

### 调整 2：断点覆盖从 P3 内的"一次性覆盖"改为"两步走"（必须）

**原因**：本规格的七档断点与 Tailwind 默认值不同
（`sm` 390 vs 640、`lg` 768 vs 1024）。直接覆盖 `screens` 会让
**全站现存的每一个 `sm:` / `md:` / `lg:` 类名同时改变含义**，
产生大量无法通过类型检查或构建发现的静默视觉回归（[13 M-1](./13-risks.md)）。

改为：

- **P3**：新增自定义断点名 `phone` / `tablet` / `laptop` / `desktop`，与默认断点**共存**；
  新代码只用新名字。
- **P9**：页面全部迁移完成后，再移除 Tailwind 默认断点，并做一次全断点视觉回归。

### 不调整的部分及理由

| 有人可能想调的 | 为什么不调 |
|---|---|
| 把 P5 AppShell 提前到 P3 之前 | AppShell 的 Header/Nav 需要 `AppButton`/`AppIcon`/`AppBadge` 才能实现，否则又是一轮 Tailwind 拼类名，等于白做一遍 |
| 把 P6 Go 提前 | Go 页面要接 `reportLearningEvent()` 与 Immersive Shell，两者分别在 P4、P5 产出 |
| 把 P2 的路由迁移拆到各页面 Phase 里做 | 路由是全局契约。分散迁移会让重定向表长期处于半完成状态，PWA 用户随时落 404 |
| 把 P9 QA 提前或省略 | 它是唯一一次跨 Phase 的整体回归窗口 |

---

## 1. 全局约束（每个 Phase 都适用）

### 每个 Phase 的准入条件

- 上一个 Phase 的验收标准全部满足；
- `npx vue-tsc --noEmit` 0 error；
- `npm run build` 成功；
- `npx vitest run` 全绿。

### 每个 Phase 的收尾动作

1. 补齐该 Phase 声明的自动化测试；
2. 更新本目录中受影响的文档（**文档与代码不一致视为该 Phase 未完成**）；
3. 打一个 git tag：`phase-<n>-done`，作为回滚锚点。

### 永久禁止修改（所有 Phase）

```
src/engine/GoGame.ts        src/engine/GoBoard.ts       src/engine/GoAI.ts
src/engine/sgfParser.ts     src/engine/boardNames.ts    src/engine/types.ts
src/engine/checkers/checkersEngine.ts
src/engine/gomoku/gomokuEngine.ts
src/data/chapters.ts        src/data/tsumegoLibrary.ts
```

例外只有一种：修复这些文件内被测试证明的真实 bug，且必须先有失败的测试用例。

---

## 2. P2 · Migration + Cleanup

**目标**：让底座可靠。收敛剩余奖励漏洞、路由 meta 化、删除死代码、拆分巨型 store。
**不产出任何新视觉。**

### 输入

- [01 IA](./01-information-architecture.md) 的路由处置清单与 `RouteMeta` 类型
- [12 清单](./12-keep-refactor-delete.md) 的 DELETE / DEPRECATE / MOVE 部分
- [13 风险](./13-risks.md) 中标记 P2 的 13 项
- P0 已建立的 `grantRewardOnce` / `src/utils/rewardKey.ts`

### 修改范围

| 类别 | 具体内容 |
|---|---|
| 奖励收敛 | `TwoPlayerView`(H-1)、`RankExamView`(H-2)、`resolveMatchingMistake`(H-3)、`ArcadeView`/`CaptureGoView`(L-1)、`AdminView` 流水(L-2) |
| AI 临时降险 | `autoSpeech` 默认 false、家长 AI 默认本地规则、错误文案脱敏（C-1/C-2） |
| 路由 | `router/index.ts` 全面 meta 化；新增 `/learn/*` `/play/*` `/me/*` `/parent/*`；**全部旧路径保留 301 重定向** |
| 删除 | `HelloWorld.vue`、`LearnView.vue`、`LevelPlayView.vue`、`data/curriculum.ts`、`BattleView.vue`、`/study` 路由 |
| 废弃 | `stores/userStore.ts` shim 的 3 处 import 改直连 |
| Store | `useUserStore` 拆为 5 模块（**只拆 actions/getters，不改 state 形状与 store id**） |
| 云同步 | `settings_data` 加 `schemaVersion` + 未知字段保留策略（M-7） |
| 目录 | view 按域分目录（MOVE 表） |
| 运维 | Supabase RLS 策略复核（L-3，非编码动作） |

### 明确不允许修改

- 任何组件的视觉与 Tailwind 类名（那是 P3）
- `tailwind.config.js`（那是 P3）
- `App.vue` / `Navbar.vue` 的布局结构（那是 P5）
- 任何学习/能力/奖励的**模型结构**（那是 P4；P2 只补幂等键）
- `chapters.ts`、`tsumegoLibrary.ts`、`src/engine/`

### 验收标准

1. `router/index.ts` 中**不存在** `path.startsWith` / `path.includes` 形式的判断，
   全部守卫决策来自 `route.meta`；
2. 全站搜索 `addCoins(` / `addExp(` 的直接调用，除 `useUserStore` 内部与
   统一奖励入口外为 **0 处**；
3. 每一条被删除或迁移的旧路径都有对应重定向，手工验证 20 条旧 URL 全部可达；
4. `useUserStore` 拆分前后，同一份 localStorage 快照 hydrate 结果逐字段相同；
5. 死代码删除后 `npm run build` 产物体积不增加。

### 自动化测试

| 测试文件 | 断言 |
|---|---|
| `tests/rewardIdempotency.spec.ts`（扩展） | 对局/段位/错题奖励重复触发 N 次只结算一次；`TwoPlayerView` 短手数对局不发奖 |
| `tests/routeMeta.spec.ts`（新增） | 每条路由都有 `mode`；`requiresParent` 路由未验证时被拦截；解锁守卫对 `lesson_1_1` 与 `c1_l1` 双 id 均生效 |
| `tests/routeRedirect.spec.ts`（新增） | 旧路径 → 新路径映射表逐条断言 |
| `tests/userStoreMigration.spec.ts`（新增） | 旧快照 hydrate 后字段完整性 |
| `tests/aiTutorService.spec.ts`（扩展） | 错误分支返回的文案不包含 `err.message` 内容 |

### 回滚策略

- 每个子项独立 commit，可单独 revert。
- 路由 meta 化与 store 拆分**各自独立 PR**，不与其他改动混合。
- 灰度期加"守卫拦截"埋点；异常拦截率上升立即 revert 路由 commit（H-5）。
- 回滚锚点：`phase-1-done` tag。

---

## 3. P3 · Design System

**目标**：产出 Token 与原子组件，**不改造任何业务页面**。

### 输入

[03 Token](./03-design-tokens.md)、[04 组件 API](./04-component-api.md)、[11 响应式](./11-responsive.md)

### 修改范围

- `src/styles/tokens.css`：CSS 变量（color / typography / spacing / radius / shadow / motion）
- `tailwind.config.js`：**新增** `phone`/`tablet`/`laptop`/`desktop` 断点 + Token 变量映射（不删默认断点）
- `src/design-system/`：11 个原子组件 + 图标注册表
- `prefers-reduced-motion` 全局实现
- Storybook 或一个 `/__ds` 开发态预览页（仅 `import.meta.env.DEV`）

### 明确不允许修改

- 任何 `src/views/**`、任何现有 `src/components/**`
- Tailwind 默认断点（`sm`/`md`/`lg`/`xl`/`2xl` 的值保持不变）
- 路由、store、数据

### 验收标准

1. 11 个原子组件全部实现 [04](./04-component-api.md) 声明的 props/emits/slots/variant/size/state；
2. 组件内部**不出现硬编码颜色值与 px 字号**，全部走 Token 变量；
3. `git diff --stat src/views/` 为空；
4. 预览页在 375 / 768 / 1440 三个宽度下所有组件所有 variant 无溢出。

### 自动化测试

| 测试文件 | 断言 |
|---|---|
| `tests/designSystem/*.spec.ts` | 每个组件的 variant/size/disabled/loading 渲染快照；`AppButton` loading 时不触发 click；`AppModal` 焦点陷阱与 Esc 关闭 |
| `tests/tokenLint.spec.ts` | 扫描 `src/design-system/**`，出现 `#[0-9a-f]{3,6}` 或 `text-[\d+px]` 即失败 |

### 回滚策略

纯新增目录 + 一个 config 新增字段，`git revert` 无副作用。

---

## 4. P4 · Learning Domain + Ability

**目标**：产出领域层与 Adapter，**不迁移真实数据、不改内容资产**。

### 输入

[06 学习模型](./06-learning-model.md)、[07 能力模型](./07-ability-model.md)、[08 奖励模型](./08-reward-model.md)

### 修改范围

- `src/domain/learning/`：`LearningNode` 等类型 + `chaptersAdapter` / `tsumegoAdapter`（只读消费）
- `src/domain/ability/`：能力计算从 `useUserStore` getter 迁出
- `src/domain/reward/`：`reportLearningEvent()` 统一入口，包住 P0/P2 的幂等实现
- 幂等账本分类裁剪（M-3）
- `dataArchiveService` 导入时按 `progress` 预填账本（M-5）
- **并行内容工作项**：补齐 `knowledgePointsData.ts` 的知识点标注（M-2，不阻塞技术施工）

### 明确不允许修改

- `chapters.ts` / `tsumegoLibrary.ts`（Adapter 只读）
- `ChildProfile.progress` 的真实数据结构（`legacyIds` 只做读取合并）
- 任何页面与组件

### 验收标准

1. `chaptersAdapter` 输出的 `LearningNode` 数量与 `chapters.ts` 的关卡数一致，
   且每个节点的 `legacyIds` 同时包含 `c<N>_l<M>` 与 `lesson_<N>_<M>` 两种形态；
2. 同一份 `progress` 数据经 Adapter 读取，`lesson_1_1` 与 `c1_l1` 被识别为同一节点（撞号问题闭环）；
3. 能力计算迁出后，同一份档案的六维结果与迁出前**逐维相同**（回归基线）；
4. `reportLearningEvent()` 是唯一发奖路径。

### 自动化测试

| 测试文件 | 断言 |
|---|---|
| `tests/domain/chaptersAdapter.spec.ts` | 节点数、legacyIds 双形态、撞号合并 |
| `tests/domain/ability.spec.ts` | 迁出前后六维数值一致；`confidence` 门槛正确；金币/经验变化**不影响**能力值 |
| `tests/domain/reward.spec.ts` | 全部 `RewardEvent` 类型的幂等键唯一性；分类裁剪不裁永久键 |
| `tests/dataArchive.spec.ts`（扩展） | 导入后已完成节点不可重领奖励 |

### 回滚策略

领域层为新增目录，页面尚未接线，revert 即可。
唯一有外部影响的是账本裁剪策略与导入预填 —— 这两项单独 commit。

---

## 5. P5 · AppShell + Today

**目标**：三种 Shell 落地 + Today 首页替代入口罗列页。

### 输入

[02 AppShell](./02-app-shell.md)、[05 Today 线框](./05-today-home.md)、P2 的 `route.meta`、P3 的组件

### 修改范围

- `src/layouts/ChildShell.vue` / `ParentShell.vue` / `ImmersiveShell.vue`
- `App.vue` 精简为 GlobalLayer + Shell 派发（按 `route.meta.mode`）
- `Navbar.vue` 拆为 `AppHeader` + `AppBottomNav`
- `Footer.vue` 移入 Child Shell
- `HomeView.vue` 重写为 Today
- `utils/pwa.ts`：`lockPortraitOrientation` → `applyOrientation(mode)`
- Immersive 统一 `back` 行为 + 路由离开守卫（M-6）

### 明确不允许修改

- 棋类页面内部（那是 P6）
- 家长端页面内部（那是 P7）
- 领域模型、Token、组件（上游已定稿）

### 验收标准

1. 全站不存在 Shell 之外的布局判断逻辑；
2. Today 首屏在 375 宽度下**不超过 3 个主要 CTA**，明确回答"现在做什么"；
3. iPad 横屏进入棋盘页不再被强制锁竖屏；
4. Immersive 页面从 Header 返回、浏览器后退、Android 物理返回三条路径行为一致。

### 自动化测试

| 测试文件 | 断言 |
|---|---|
| `tests/shell.spec.ts` | `meta.mode` → Shell 映射；`hideNavigation` 生效；safe-area 类存在 |
| `tests/todayView.spec.ts` | 无进度新用户 / 有进度用户 / 全部完成三种状态的 Continue 卡片内容正确；不渲染任何未接线入口 |

### 回滚策略

Shell 与 Today 分两个 PR。Today 可先以 feature flag（`localStorage.__todayV2`）灰度，
问题时切回旧 `HomeView`（旧文件保留一个 Phase 再删）。

---

## 6. P6 · Go Experience

**目标**：棋类页面接入 Shell / 领域层，**合并两个 GoBoard**。

### 输入

[12 §5 GoBoard 合并流程](./12-keep-refactor-delete.md)、P4 领域层、P5 Immersive Shell

### 修改范围

- 9 个棋类 view 接 `ImmersiveShell` + `useBoardSize()` + `reportLearningEvent()`
- `src/components/board/GoBoard.vue` 吸收 `src/components/GoBoard.vue` 的独有能力后成为唯一实现
- Learn / Play 聚合页替换 `GoHubView` / `PuzzleHubView`

### 明确不允许修改

- `src/engine/**`（**绝对禁止**）
- `chapters.ts` / `tsumegoLibrary.ts`
- 任何棋局规则、AI 难度、死活判定逻辑

### 验收标准

1. 只剩一个 GoBoard 组件文件；
2. **8 个棋盘页逐页人工回归**：落子、提子、禁着点、高亮、悔棋、缩放、触控二次确认、
   SGF 导入导出 —— 全部与合并前一致；
3. 棋盘在 375 / 768 / 1024 横屏下的尺寸符合 [11](./11-responsive.md) 规格；
4. `tests/GoGame.spec.ts` 全绿且**未被修改**（引擎未动的证明）。

### 自动化测试

| 测试文件 | 断言 |
|---|---|
| `tests/board/goBoardProps.spec.ts` | 合并后组件覆盖两个旧组件的全部 prop/emit（差异表逐项） |
| `tests/board/boardSize.spec.ts` | 七档宽度下棋盘边长计算 |
| `tests/go/matchReward.spec.ts` | 认输/短手数/正常结束的发奖判定 |

### 回滚策略

**逐页迁移，一页一 commit。** 任一页回归失败只 revert 该页。
GoBoard 合并单独一个 PR，且旧组件文件在全部页面迁完并观察一个版本后才删除。

---

## 7. P7 · Growth + Parent

**目标**：成长模块与家长端落地，**含降级展示**。

### 输入

[07 能力模型](./07-ability-model.md)、[10 Parent Mode](./10-parent-mode.md)、P3 组件、P4 领域层

### 修改范围

- `src/features/growth/`：能力、成就、证书、记录
- `ProfileView` 重写为 Me（拆出成长模块）
- `ParentDashboardView` 重写为 Parent Shell 多页：Overview / Weekly / Ability / Records / Settings
- 家长身份验证入口

### 明确不允许修改

- 能力计算逻辑（P4 已定稿，此处只消费）
- 学习节点数据

### 验收标准

1. 家长端五个问题（学了什么 / 能力增长 / 卡在哪 / 本周关注 / 如何帮助）各有明确对应区块；
2. **只有围棋数据时，不出现任何数学/语文/英语的空维度或占位数据**（降级展示正确）；
3. `confidence` 为 `low` 的维度显示"正在积累"，不显示具体分数；
4. 未通过家长验证无法进入 `/parent/*`。

### 自动化测试

| 测试文件 | 断言 |
|---|---|
| `tests/parent/degradation.spec.ts` | 仅 go 数据的档案，渲染结果中不含其他学科名称；空数据不渲染图表骨架 |
| `tests/parent/weeklyReport.spec.ts` | 周报数据聚合正确；无数据周显示引导而非空图 |
| `tests/parent/gate.spec.ts` | 家长验证拦截 |

### 回滚策略

家长端与儿童端路由隔离，可独立 revert。
旧 `ParentDashboardView` 保留一个 Phase。

---

## 8. P8 · AI Tutor

**目标**：完整安全链路。**这个 Phase 的验收标准是安全，不是功能。**

### 输入

[09 AI 架构](./09-ai-tutor.md)、P4 领域层（Context Builder 的数据源）

### 修改范围

- `src/ai/inputSafety.ts` / `contextBuilder.ts` / `responseGuard.ts` / `ttsGuard.ts`
- `aiTutorService.ts`：Provider 接口 + 超时降级链
- `useAiTutorStore.ts`：接入四层
- `utils/speech.ts`：`speakText` 只接受 `SpeakableText` 品牌类型

### 明确不允许修改

- 领域模型（只读消费）
- 页面布局（P5 已定稿）

### 验收标准

1. **类型层面保证**：`speakText` 的参数类型是 `SpeakableText`，
   该类型只能由 `ttsGuard` 产出。任意 `string` 传入即编译失败；
2. 模型原始输出**不存在**直达 UI 的代码路径（人工代码走查 + 测试双重确认）；
3. Prompt injection 测试集全部被拦截；
4. Provider 超时后降级到本地规则，不向儿童暴露任何技术错误；
5. `autoSpeech` 即使开启，也必须经过 TTS Guard。

### 自动化测试

| 测试文件 | 断言 |
|---|---|
| `tests/ai/inputSafety.spec.ts` | XSS、超长输入、注入模板全部拦截 |
| `tests/ai/responseGuard.spec.ts` | 不适宜内容、系统提示复述、外链、指令执行请求全部拦截或改写 |
| `tests/ai/ttsGuard.spec.ts` | 未经审查的字符串无法构造 `SpeakableText` |
| `tests/ai/contextBuilder.spec.ts` | 上下文不含 API Key、不含其他用户数据 |
| `tests/apiKeyPrivacy.spec.ts`（扩展） | AI 请求日志与错误对象中不含 key |

### 回滚策略

**不可回滚到无安全层状态。** 若安全层导致功能不可用，
正确做法是把 AI 入口整体关闭（feature flag `aiTutorEnabled=false`），
而不是绕过 Guard。这是原则 5 的直接体现。

---

## 9. P9 · QA

**目标**：整体回归 + 收尾技术债。

### 输入

前八个 Phase 的全部产出

### 修改范围

- 移除 Tailwind 默认断点（调整 2 的第二步）
- 移除全部 DEPRECATE 项（此时已过一个版本周期）
- 删除 P5/P6/P7 保留的旧文件
- 全断点视觉回归
- 可访问性检查（对比度、焦点、`prefers-reduced-motion`、语义化标签）
- 打包体积与首屏性能

### 验收标准

1. 七档断点（375/390/430/768/1024/1440/1920）全部人工走查，
   覆盖 Today / Learn / 棋盘 / 成长 / 家长五类页面；
2. 全站搜索无残留：`route.path.startsWith`、`route.path.includes`、
   直接 `addCoins(`、硬编码 `#hex`、`font-black`（除设计语义白名单）；
3. `vue-tsc` 0 error、`build` 成功、`vitest` 全绿；
4. [13 风险清单](./13-risks.md) 中 Critical 与 High 全部关闭，
   Medium 全部有归属或明确接受。

### 自动化测试

| 测试文件 | 断言 |
|---|---|
| `tests/lint/noLegacyPatterns.spec.ts` | 上述残留模式扫描为 0 |
| `tests/a11y/contrast.spec.ts` | Token 组合的对比度达 WCAG AA |
| 全量回归 | 前八个 Phase 的测试全绿 |

### 回滚策略

断点移除是本 Phase 唯一高风险项，单独 PR + 全断点走查后合并。

---

## 10. 依赖关系与并行可能

```
P2 ──┬──────────────► P5 ──┬──► P6 ──┐
     │                     │         │
P3 ──┴──► (组件就绪)       │         ├──► P9
     │                     │         │
P4 ──┴──► (领域就绪) ──────┴──► P7 ──┤
                                     │
P4 ──────────────────────► P8 ───────┘
```

可并行的组合：

- **P3 与 P4 可完全并行**：一个只碰样式与新组件目录，一个只碰新领域目录，无文件重叠。
- **P6 与 P7 可并行**：棋类页面与成长/家长页面无文件重叠（前提是 P5 已完成）。
- **P8 可在 P4 完成后随时启动**，不必等 P6/P7。若人力允许，
  建议 P8 与 P6 并行，让 Critical 风险尽早关闭。

不可并行：

- P2 必须独占（改路由与 store，与所有 Phase 冲突）；
- P5 必须在 P3 与 P4 之后（依赖组件与领域层）；
- P9 必须最后。

---

## 11. Phase 1 完成状态

本文档写完即 Phase 1 结束。交付物：

- `docs/p0-security-fixes.md` — P0 实际改动清单
- `docs/phase1/00` ~ `15` — 完整产品设计规格 + ADR

**下一步等待人工审查通过后再启动 P2。不自动进入 Phase 2。**
