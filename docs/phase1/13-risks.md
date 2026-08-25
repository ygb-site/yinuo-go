# 13 · 风险清单

分级标准：

| 级别 | 定义 |
|---|---|
| **Critical** | 儿童安全、隐私泄露、数据不可恢复。必须在下一个 Phase 内解决 |
| **High** | 经济系统失衡、核心交互回归、用户信任受损。Phase 2–3 内解决 |
| **Medium** | 体验退化、维护成本、技术债累积。有明确 Phase 归属 |
| **Low** | 已知瑕疵，可容忍，需登记避免遗忘 |

---

## Critical

### C-1 AI 模型输出未经审查即展示并自动朗读

- **位置**：`useAiTutorStore.sendUserMessage()` → `chatMessages.push(reply)` → `speakText(reply)`
- **影响**：儿童可能看到/听到不适合的内容；prompt injection 可让模型复述系统提示或输出越界内容；
  `autoSpeech` 默认 `true` 使风险自动触发。
- **现状**：输入侧仅有 XSS 清洗，**输出侧零审查**。
- **缓解**：Phase 8 首个任务实现 Response Guard + TTS Guard（[09](./09-ai-tutor.md)）。
- **临时降险（可在 Phase 2 立即做，改动极小）**：
  1. `autoSpeech` 默认值改为 `false`；
  2. 家长 AI 策略默认"仅本地规则"（`local-rule` provider 输出完全可控）；
  3. 错误分支不再把 `err.message` 拼进儿童可见文案。
- **责任 Phase**：P2（临时降险）+ P8（完整实现）

### C-2 错误信息向儿童暴露内部细节

- **位置**：`useAiTutorStore.sendUserMessage()` 的 catch 分支
  `'…遇到了一点小网络问题：' + (err.message || '未知错误')`
- **影响**：可能泄露自定义 endpoint 地址、上游报错原文、鉴权失败细节。
- **缓解**：错误一律映射为固定儿童话术，原始错误只进本地审计。
- **责任 Phase**：P2

---

## High

### H-1 `TwoPlayerView` 对局奖励可无限刷取

- **位置**：`src/views/TwoPlayerView.vue:372`，对局结束无条件 `addCoins(30)` + `addExp(60)`
- **影响**：无幂等键、无手数门槛、无有效性判定。本地双人模式下自己走两步结算即可反复领取，
  与 P0 修复的 `AiMatchView` 是同一类漏洞。
- **为何本阶段未修**：超出"除 P0 涉及文件外禁止修改业务页面"的边界。
- **缓解**：Phase 2 首批，套用 P0 已建立的 `grantRewardOnce` + `matchId` + `MIN_REWARDED_MOVES` 方案。
- **责任 Phase**：P2

### H-2 `RankExamView` 段位奖励可重复领取

- **位置**：`src/views/RankExamView.vue:237-238`
- **影响**：通过同一段位考试即发 `rewardExp` / `rewardCoins`，无 `tierId` 幂等键，重复考可重复领。
  段位奖励数值最高（100 币 / 300 经验级别），影响大于 H-1。
- **缓解**：Phase 2 首批，幂等键 `reward:exam:<tierId>`。
- **责任 Phase**：P2

### H-3 `resolveMatchingMistake` 未检查 `resolved` 即发奖

- **位置**：`useUserStore.resolveMatchingMistake()`
- **影响**：兄弟方法 `resolveSubjectMistake` 有 `if (!item.resolved)` 保护，
  但 `resolveMatchingMistake` 直接 `addCoins(30) + addExp(40)`。
  若调用方在 `removeImmediately=false` 模式下重复调用，可重复发奖。
- **缓解**：Phase 2 统一走 `mistake-resolved` 事件 + `reward:mistake:<id>` 幂等键。
- **责任 Phase**：P2

### H-4 两个 GoBoard 组件并存

- **位置**：`src/components/GoBoard.vue`（3 处引用）与 `src/components/board/GoBoard.vue`（5 处引用）
- **影响**：棋盘行为在不同页面可能不一致；任何棋盘修复都要做两遍或漏一遍；
  合并过程是核心交互回归的高风险点。
- **缓解**：Phase 6 按 [12 §5](./12-keep-refactor-delete.md) 的五步流程执行，逐页人工回归。
- **责任 Phase**：P6

### H-5 路由守卫 meta 化可能锁死用户

- **位置**：`router/index.ts` 的三段守卫改造
- **影响**：解锁规则、管理员校验、课程渐进解锁若在迁移中出错，会把用户挡在内容之外，
  且用户无法自行绕过。课程解锁当前依赖 `lesson_1_1`/`c1_l1` 双 id 硬编码，迁移时极易漏一套。
- **缓解**：
  1. 守卫逻辑必须先有单测（含双 id 场景）再改造；
  2. 灰度期加"守卫拦截"埋点，异常拦截率上升立即回滚；
  3. 保留一个 `?bypassUnlock=1` 的开发态旁路（仅 `import.meta.env.DEV`）。
- **责任 Phase**：P2

### H-6 `useUserStore` 拆分风险

- **位置**：`src/stores/useUserStore.ts`，1300+ 行、`persist: true` 全量落盘
- **影响**：拆分若改变 store id 或 state 形状，会导致用户本地数据无法 hydrate，
  表现为"进度全部丢失"。这是最容易造成用户流失的一类事故。
- **缓解**：
  1. 拆分**只拆 actions/getters，不改 state 形状与 store id**；
  2. 拆分前后各跑一次"旧 localStorage 快照 → hydrate → 断言字段完整"的测试；
  3. 保留一个 schema 版本号字段，为将来真正改结构留迁移入口。
- **责任 Phase**：P2

---

## Medium

### M-1 Tailwind 断点覆盖导致现有 `sm:` / `lg:` 语义漂移

- **影响**：本规格的七档断点（`sm:390` / `lg:768` / `xl:1024`）与 Tailwind 默认值
  （`sm:640` / `lg:1024`）不同。一旦覆盖 `screens`，**全站现有响应式类名的含义都会变**。
- **缓解**：分两步走。Phase 3 先新增自定义断点名（`phone` / `tablet` / `laptop` / `desktop`），
  与默认断点共存；页面迁移完成后再移除默认断点。**禁止**一次性覆盖。
- **责任 Phase**：P3

### M-2 知识点仓库样本过少，能力模型长期低置信

- **位置**：`src/data/knowledgePointsData.ts` 当前只有 **6 个** `go` 知识点
- **影响**：能力模型的 `confidence` 门槛（≥5 次样本才展示分数、≥20 次才算 high）
  在只有 6 个知识点的情况下，六维中多数维度会长期停留在 `low`，
  家长端大面积显示"正在积累"，削弱产品说服力。
- **缓解**：这是**内容问题，不是技术问题**。需要一个独立的内容工作项：
  为 `chapters.ts` 的 22 关补齐知识点标注（预计 30–50 个知识点），并建立知识点→Skill 映射。
- **责任 Phase**：P4 并行的内容工作项（不阻塞技术施工）

### M-3 幂等账本裁剪可能允许远期行为重领一次

- **位置**：`pruneRewardBookkeeping()`，超 400 条裁剪到 300 条
- **影响**：被裁掉的旧幂等键对应的行为理论上可再次领取一次。
- **实际风险低**：裁剪按时间倒序，被裁的是 400 条之前的记录，对应行为多为一次性
  （关卡首通、勋章），用户很难主动触发重领。
- **缓解**：Phase 4 改为分类裁剪——永久键（lesson/exam/badge/tsumego）不裁剪，
  只裁剪日期类键（check-in / daily-task / drill）。
- **责任 Phase**：P4

### M-4 路由大规模迁移影响 PWA 与书签

- **影响**：应用已注册 Service Worker 并支持添加到主屏，用户主屏图标与书签指向旧路径。
  路径迁移后若无重定向，用户会落到 404 兜底（当前兜底是 `redirect: '/'`，会静默丢失意图）。
- **缓解**：全部旧路径保留重定向至少两个大版本；Service Worker 需在新版本上线时
  正确失效旧缓存（检查 `vite.config.ts` 的 PWA 配置与 `registerPwaServiceWorker`）。
- **责任 Phase**：P2

### M-5 `dataArchiveService` 导入不包含奖励账本

- **位置**：`validateAndSanitizeArchive()` 白名单构造，不含 `rewardLedger`
- **影响**：导入档案产生的新 profile 账本为空，其 `progress` 中已完成的关卡理论上可重领奖励一次。
- **缓解**：Phase 4 导入时按 `progress` 中 `completed` 的节点预填账本。
- **责任 Phase**：P4

### M-6 Immersive 页面缺少统一的返回一致性

- **位置**：`AiMatchView.goBack()` 有 `showConfirm`，但**未注册** `onBeforeRouteLeave`
- **影响**：点 Header 返回按钮会确认，按 Android 物理返回键 / 浏览器后退直接离开，
  对局状态虽有 localStorage 自动保存，但行为不一致会让用户困惑。
- **缓解**：Phase 5 由 Immersive Shell 统一实现 `back` 行为 + 路由离开守卫。
- **责任 Phase**：P5

### M-7 `settings_data` 云端结构无版本号

- **位置**：`saveUserDataToCloud()` 的 `settings_data` 是自由 `Record<string, any>`
- **影响**：字段增删无版本管理，新旧客户端并存时可能互相覆盖字段
  （P0 已经暴露过这个问题：历史 `apiKey` 字段需要专门写清理逻辑）。
- **缓解**：Phase 2 加 `schemaVersion` 字段与"未知字段保留"的合并策略。
- **责任 Phase**：P2

### M-8 全局装饰动画未遵守 `prefers-reduced-motion`

- **位置**：全站 `animate-bounce` / `animate-ping` / `animate-pulse`
- **影响**：可访问性问题；对前庭功能敏感用户不友好。
- **缓解**：Phase 3 Token 层统一实现（[03 §6.4](./03-design-tokens.md)）。
- **责任 Phase**：P3

---

## Low

### L-1 `ArcadeView` / `CaptureGoView` 奖励无幂等键

- `recordArcadeScore` 按分数发币、`recordCaptureGoWin` 无幂等。
  实际风险低于 H-1/H-2（需要真实完成游戏流程），但仍应收敛。
- **责任 Phase**：P2 随统一入口一并处理

### L-2 `AdminView` 手工加币不写流水

- 直接改 `child.coins`，`coinLog` 里缺记录，事后无法审计。
- **责任 Phase**：P2

### L-3 Supabase anon key 硬编码在 `src/lib/supabase.ts` 作为默认值

- P0 核查确认该 key 是设计上可公开的 publishable key，受 RLS 约束，**不是需要轮换的秘密**。
- 但"零配置默认可用"意味着任何人都能对该项目发请求，安全性完全依赖 RLS 策略正确性。
- **缓解**：不改代码，但需要一次独立的 **RLS 策略复核**（确认 `user_profiles` 表
  只允许 `auth.uid() = id` 的读写）。这是运维动作，不是编码动作。
- **责任 Phase**：P2 前置检查项

### L-4 `vendor-lucide` 打包 85.9 kB

- 图标库整体较大。Phase 3 建立图标注册表后可按需引入优化。
- **责任 Phase**：P3

### L-5 `emoji` 被当作 UI 图标使用

- 多处用 emoji 充当导航/状态图标，跨平台渲染不一致，无法着色，无障碍语义缺失。
- **责任 Phase**：P3（图标注册表 + [04 §2.5](./04-component-api.md) 的 emoji 治理规则）

### L-6 `stores/checkersStore.ts` / `adventureStore.ts` / `unlockStore.ts` 未纳入本次审查

- 这三个 store 在本轮 P0 与 Phase 1 中未被深入检查，可能存在同类问题（奖励、持久化）。
- **缓解**：Phase 2 清理阶段补一次定向审查。
- **责任 Phase**：P2

---

## 汇总

| 级别 | 数量 | 最早解决 Phase |
|---|---|---|
| Critical | 2 | P2（临时降险）/ P8（完整） |
| High | 6 | P2（4 项）、P5、P6 |
| Medium | 8 | P2（3 项）、P3（3 项）、P4（2 项）、P5 |
| Low | 6 | P2（4 项）、P3（2 项） |

**Phase 2 必须处理的项**：C-1（临时降险）、C-2、H-1、H-2、H-3、H-5、H-6*、M-4、M-7、L-1、L-2、L-3、L-6
（*H-6 的完整实现在 P5，P2 只需保证不新增不一致）
