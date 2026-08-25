# 12 · 删除 / 保留 / 重构清单

## 0. 动作定义与判定原则

| 动作 | 含义 |
|---|---|
| **KEEP** | 不动或仅做 Token 层适配 |
| **REFACTOR** | 保留能力，重写实现 |
| **MOVE** | 位置/路径变更，能力不变 |
| **DEPRECATE** | 标记废弃，保留一个版本周期后再删 |
| **DELETE** | 直接移除 |

判定原则（重要）：

1. **零引用不等于可删。** 必须区分"废弃遗留"与"尚未接线的新能力"。
   本清单中每一项 DELETE 都给出了除引用计数以外的第二个理由。
2. **有引用不等于要留。** `BattleView` 有路由引用，但它的能力被 Match 聚合页完全覆盖。
3. **涉及用户数据的一律不直删。** 先 DEPRECATE，且必须先有线上数据分布统计。

---

## 1. KEEP（不得修改）

| 对象 | 原因 | 依赖 | 风险 |
|---|---|---|---|
| `src/engine/GoGame.ts` / `GoBoard.ts` / `GoAI.ts` | 已验证的规则与 AI 实现，有 `tests/GoGame.spec.ts` 覆盖 | 全部围棋页面 | 修改即高风险，无收益 |
| `src/engine/checkers/checkersEngine.ts`、`gomoku/gomokuEngine.ts` | 同上 | Play 区 | 同上 |
| `src/engine/sgfParser.ts` | 棋谱标准实现 | 复盘、打谱 | 同上 |
| `src/engine/boardNames.ts` / `types.ts` | 基础类型与坐标命名 | 全部棋盘 | — |
| `src/data/chapters.ts`（5473 行） | 核心内容资产。通过 Adapter 消费，不改写 | Adventure、Lesson、router | 改动会破坏所有进度数据的 key |
| `src/data/tsumegoLibrary.ts` | 核心内容资产 | Tsumego | 同上 |
| `src/data/knowledgePointsData.ts` | 知识点仓库，能力模型的输入 | 能力、错题、AI 上下文 | 见风险清单（当前仅 6 个 go 知识点） |
| `src/data/achievementsData.ts` / `shopData.ts` / `rhymesData.ts` / `dictionaryData.ts` | 内容与配置资产 | 勋章、商城、资料区 | — |
| `src/services/dataArchiveService.ts` | 已有完整安全测试（原型污染、XSS、越界数值） | 导入导出 | 只需补 `rewardLedger` 处理 |
| `src/lib/supabase.ts` | 含 `sanitizeSupabaseUrl` 安全实现，已有测试 | 云同步 | — |
| `src/utils/rewardKey.ts` | P0 新增，幂等键工具 | 奖励系统 | — |
| `tests/GoGame.spec.ts` / `securityAudit.spec.ts` / `dailyRewards.spec.ts` / `aiTutorService.spec.ts` / `apiKeyPrivacy.spec.ts` / `rewardIdempotency.spec.ts` | 回归护栏 | — | 重构过程中必须始终保持全绿 |

---

## 2. REFACTOR

| 对象 | 动作 | 原因 | 依赖 | 风险 | 数据迁移 |
|---|---|---|---|---|---|
| `src/App.vue` | 精简为 GlobalLayer + AppShell | 含 `route.path.startsWith('/lesson/')` 硬编码；布局职责与全局层混在一起 | 全站 | 低 | 无 |
| `src/components/Navbar.vue` | 拆为 `AppHeader` + `AppBottomNav`（Child Shell 内） | 17 行路径匹配决定高亮；同时承担 Header 与底部导航两种职责 | 全站 | 中（导航是回归高发区） | 无 |
| `src/components/Footer.vue` | 移入 Child Shell，仅桌面渲染 | 现在由 `App.vue` 用 `hidden lg:block` 控制 | 全站 | 低 | 无 |
| `src/router/index.ts` | 全面 meta 化 | 三段守卫逻辑靠路径字符串匹配；`titleMap` 硬编码；课程解锁写死 `lesson_1_1`/`c1_l1` 双 id | 全站 | **高**（守卫出错会锁死用户） | 无（但需保留全部旧路径重定向） |
| `src/data/unlockRules.ts` | 拆分：解锁条件迁入 `UnlockRule`，视觉字段（`gradient`/`badgeColor`/`icon`）移除 | 数据文件里写了 `route` 与 Tailwind 渐变类名，把路由与视觉耦合进数据层 | router、`BattleView`、`LearnView`、`GoHubView` | 中 | 无 |
| `src/stores/useUserStore.ts`（1300+ 行） | 拆分为 `profile` / `progress` / `reward` / `settings` / `sync` 五个模块 | 单文件承担档案、进度、奖励、设置、云同步、能力计算六种职责 | 全站 | **高** | 无（拆分不改持久化结构） |
| `src/stores/useAiTutorStore.ts` | 接入 Input Safety / Response Guard / TTS Guard | 当前模型输出直达 UI 与 TTS | AI 伴学 | **Critical 安全** | 无 |
| `src/services/aiTutorService.ts` | Provider 接口收紧 + 超时降级链 | `askKidTutor` 无超时、无输出审查；错误信息拼给儿童 | AI 伴学 | 高 | 无 |
| `src/views/HomeView.vue` | 重写为 Today | 入口罗列页，不回答"现在做什么" | — | 中 | 无 |
| `src/views/GoHubView.vue` | 重写为 Learn 结构页 | 17 入口平铺 | — | 中 | 无 |
| `src/views/PuzzleHubView.vue` | 重写为 Play 聚合页 | — | — | 低 | 无 |
| `src/views/ProfileView.vue` | 重写为 Me（拆出成长模块） | 混装档案、成长、设置、商城入口 | — | 中 | 无 |
| `src/views/ParentDashboardView.vue` | 重写为 Parent Shell 多页 | 数据大屏形态，无关注点与建议动作，无家长验证 | — | 中 | 无 |
| `src/views/AiMatchView.vue` / `TwoPlayerView.vue` / `CaptureGoView.vue` / `TsumegoView.vue` / `FreeBoardView.vue` / `ArcadeView.vue` / `RankExamView.vue` / `GomokuView.vue` / `ChineseCheckersView.vue` | 接入 Immersive Shell + `useBoardSize()` + `reportLearningEvent()` | 各自实现棋盘尺寸计算、返回逻辑、奖励发放 | 引擎（只读） | 中 | 无 |
| `src/views/MistakesView.vue` | 接入新组件与 `mistake-resolved` 事件 | — | — | 低 | 无 |
| `src/views/AdminView.vue` | 手工加币写入 `coinLog` 并标记来源 | 直接改 `child.coins`，无流水记录 | — | 低 | 无 |
| `src/utils/pwa.ts` | `lockPortraitOrientation` → `applyOrientation(mode)` | 全局无条件锁竖屏，阻断 iPad 横屏对局 | Immersive | 低 | 无 |
| `src/utils/speech.ts` | `speakText` 只接受 `SpeakableText` | 任何字符串都能直接朗读 | AI、课程语音 | 中 | 无 |
| `tailwind.config.js` | 断点覆盖 + Token 变量映射 | 现有断点是 Tailwind 默认值，与本规格的七档不一致 | 全站样式 | **高**（`sm:`/`lg:` 语义漂移） | 无 |

---

## 3. MOVE

| 对象 | 从 | 到 | 原因 | 风险 |
|---|---|---|---|---|
| 路由路径（约 20 条） | 扁平 `/xxx` | `/learn/go/*`、`/play/*`、`/me/*`、`/parent/*` | 见 [01-IA](./01-information-architecture.md) | 中：必须保留旧路径重定向至少两个版本（PWA 主屏图标、书签） |
| `views/*.vue`（棋类页） | `src/views/` | `src/views/go/`、`src/views/play/`、`src/views/parent/` | 27 个 view 平铺在一个目录 | 低 |
| 语义组件 | 各 view 内联 | `src/features/<domain>/components/` | 复用与一致性 | 低 |
| `StudyCenterView` 的今日打卡区块 | `/study` | Today 页 `Today's Tasks` | 见 [01 §4.5](./01-information-architecture.md) | 中：**P0 已修的幂等键与每日封顶逻辑必须原样迁移**，不得在重写中丢失 |
| 能力计算 | `useUserStore.studentLearningProfile` getter | `src/domain/ability/` | getter 里做全量六维计算 | 中 |

---

## 4. DEPRECATE（标记废弃，保留一个版本）

| 对象 | 原因 | 依赖 | 风险 | 数据迁移 |
|---|---|---|---|---|
| `src/stores/userStore.ts` | 内容只有 `export * from './useUserStore'`，是历史改名留下的转发 shim | **仍被 3 个文件引用**：`FreeBoardView.vue`、`TsumegoView.vue`、`LevelPlayView.vue` | 低 | 无 |
| | 动作：先把这 3 处 import 改成 `./useUserStore`，下个版本删除文件 | | | |
| `ChildProfile.mistakes` / `solvedMistakes`（`string[]` 的旧错题结构） | 已被 `mistakeRecords: MistakeRecord[]` 取代，但仍在 `recordMistake` / `resolveMistake` 中读写，且 `resolveMistake` 会发奖 | `useUserStore`、部分棋类页 | 中 | **有**：需先统计线上仍在使用旧结构的档案比例，再决定合并策略 |
| `ChildProfile.progress` 中的 `lesson_N_M` 形态 key | 历史 id，与 `c<N>_l<M>` 指向同一关卡，造成撞号 | `router` 守卫、`updateLessonProgress` 勋章判定 | 中 | **有**：本阶段用 `legacyIds` 读取合并（见 [06 §4.1](./06-learning-model.md)），Phase 4 末尾再做真实清理 |
| `MistakeRecord.subjectId` 的 `'math' \| 'chinese' \| 'english'` 取值 | `dataArchiveService.ts:175` 仍在白名单里校验这三个学科，但 `SubjectId` 已不含它们，学业内容也已删除 | 导入逻辑 | 低 | **有**：历史档案里可能存在这类记录。导入时保留、显示为"其他"，不再新增 |
| `settings_data.aiConfig.apiKey`（云端历史字段） | P0 已实现登录时自动覆盖清理 | 云同步 | 低 | **有，已自动处理** |

---

## 5. DELETE

每一项都给出「零引用」之外的第二个理由。

| 对象 | 引用数 | 第二个理由 | 风险 | 数据迁移 |
|---|---|---|---|---|
| `src/components/HelloWorld.vue` | 0 | Vite 脚手架模板文件，从未属于本产品 | 无 | 无 |
| `src/views/LearnView.vue` | 0（无路由、无 import） | 与 `BattleView` 是同一模板的 `category='learn'` 变体，能力被 Learn 聚合页完全覆盖；它连路由都没接上，说明当初就被 `GoHubView` 取代了 | 无 | 无 |
| `src/views/LevelPlayView.vue` | 0 | 使用的是第三套课程数据 `CURRICULUM_CHAPTERS`，与现行 `chapters.ts` 主线无关；同时是 `stores/userStore.ts` shim 的引用方之一 | 无 | 无 |
| `src/data/curriculum.ts` | 1（仅 `LevelPlayView`） | 第三套 Chapter/Lesson 定义，是 ChapterId 撞号的来源之一；随 `LevelPlayView` 一并移除 | 无 | 无（该结构未产生独立进度数据；如有，`progress` 里的孤立 key 会被 Adapter 忽略） |
| `src/views/BattleView.vue` | 1（路由 `/battle`） | 能力 = "按 `category==='battle'` 过滤 `UNLOCK_FEATURES` 并列出入口"，与 `/learn/go/match` 聚合页完全重叠。保留会形成两个对局入口 | 低（`/battle` 需重定向到 `/learn/go/match`） | 无 |
| `StudyCenterView` 的「一年级至高中学科体系概览」区块 | — | 纯静态文本，无学习闭环、无内容支撑。保留等于向家长承诺不存在的能力（违反 [00 §8](./00-product-positioning.md)） | 低 | 无 |
| `/study` 路由 | — | 三块内容分别迁至 Today / Learn / Parent 后不再有独立职责 | 低（需重定向到 `/`） | 无 |
| `src/components/GoBoard.vue` **或** `src/components/board/GoBoard.vue` | 3 / 5 | **两个真实在用的棋盘组件并存**：`TsumegoView`、`FreeBoardView`、`AiMatchView` 用前者，`CaptureGoView`、`RankExamView`、`DictionaryView`、`LessonPlayView`、`ArcadeView` 用后者。必须合并为一个 | **高** | 无 |

### 关于两个 GoBoard 的处置说明

这是本清单里最需要谨慎的一项。**不能简单删掉引用少的那个。**

要求（Phase 6 执行）：

1. 先做逐 prop / 逐 emit / 逐渲染差异对比，产出差异表。
2. 保留 `src/components/board/GoBoard.vue` 作为唯一实现（引用多、目录归属正确）。
3. 把另一个的独有能力合并进来，形成能力超集。
4. 逐页迁移，每迁一页做一次人工回归（落子、提子、高亮、悔棋、缩放、触控确认）。
5. 全部迁完后删除 `src/components/GoBoard.vue`。

风险来源：棋盘是本产品的核心交互，任何回归都是 P0 级体验事故。

---

## 6. 汇总

| 动作 | 数量（对象级） |
|---|---|
| KEEP | 15 类（引擎 5 + 内容资产 6 + 服务与工具 3 + 测试 6 个文件） |
| REFACTOR | 24 |
| MOVE | 5 类 |
| DEPRECATE | 5 |
| DELETE | 8 |

涉及数据迁移的项共 **4** 个，全部为 DEPRECATE，均要求"先统计线上分布，再动手"。
本阶段与 Phase 2 都不执行真实数据迁移。
