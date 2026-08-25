# P0 安全修复实际改动清单

修复时间：2026-08-25
验证结果：`vue-tsc -b` 0 error ｜ `vite build` 成功 ｜ `vitest run` 6 文件 50 用例全绿

---

## P0-1 `.env` 版本控制

### 结论先说

- `.env` **已不再被 Git 跟踪**（`git ls-files --error-unmatch .env` 报 not tracked），
  开发者本机的 `.env` 文件**完整保留**（130 字节，未删除）。
- `.env` 历史核查：全仓库历史中只有一个 commit 触及过 `.env`（`4e56203`），
  其中出现的变量只有两个：`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`。
- **未发现任何真正的高敏感 secret**：没有 `service_role` key、没有 `sk-*` 形态的第三方模型密钥、
  没有数据库密码、没有私钥。
- 该 key 的形态经核对为 `sb_publishable_*` 前缀（Supabase 新式可发布密钥），
  不是 JWT 形态的 `service_role` 密钥。它属于设计上可公开的凭据（受 RLS 行级安全策略约束，
  且带 `VITE_` 前缀本身就会被打进前端产物）。**它不是本次需要轮换的秘密。**
- 因此本次**不需要执行密钥轮换**。若后续要提高安全水位，正确的动作是复核 Supabase RLS 策略，
  而不是轮换 anon key。

### 逐文件

| 文件 | 修改 | 原因 | 验证 |
|---|---|---|---|
| `.gitignore` | 含 `.env`、`.env.*`，并以 `!.env.example` 反向豁免模板 | 即使当前只放公开 key，也必须先建立隔离，避免日后写入真实密钥时被自动提交 | `git check-ignore .env` 命中；`.env.example` 未被忽略，仍在版本控制内 |
| `.env`（Git index） | 通过 `git rm --cached .env` 从索引移除，工作区文件保留 | 停止跟踪，但不影响本机开发 | `git status` 显示 `D  .env`（仅索引删除）；`ls -la .env` 文件仍在 |
| `.env.example` | 重写为纯模板：只有变量名与占位值，并写入三条安全约定 | 明确禁止把 `service_role`、`sk-*` 等以 `VITE_` 前缀写入（等于发布到公网），并说明第三方模型密钥只走运行时内存 | 文件内不含任何真实值 |

---

## P0-2 用户第三方 API Key 的持久化彻底移除

### 新规则（已落地）

第三方模型 API Key 只存在于**当前页面运行期间的内存**。不进 localStorage、不进 sessionStorage、
不进 Pinia persist、不进 Supabase `settings_data`、不进用户 profile、不进导出/导入文件、
不进 URL、不进日志、不进错误信息。

```
用户输入 API Key → 仅运行时内存 → 当前会话使用 → 页面刷新后消失
```

### 全链路核对

| 环节 | 处理 |
|---|---|
| 输入 | `AiTutorFloatModal.vue` 的 `v-model="tutorStore.config.apiKey"`，写入内存 state |
| state | `useAiTutorStore.config.apiKey`，仅内存 |
| persist | `pick` 白名单 `AI_TUTOR_PERSISTED_FIELDS` 只含 `config.mode / endpoint / model / autoSpeech` |
| cloud settings | `syncToCloudNow()` 组装的 `aiConfig` 只有四个非密钥字段 |
| load（云端恢复） | 改走 `applyRemoteConfig()`，按白名单逐字段校验，云端历史数据中的 `apiKey` **直接丢弃** |
| save | `saveConfig()` 只改内存，不再触发密钥落盘 |
| export | `createSafeProfileArchive()` 是字段白名单构造，结构上不可能包含密钥 |
| import | `validateAndSanitizeArchive()` 同为白名单构造 |
| 日志 | 全量搜索 `console.*` 中无任何 key/secret/token 输出 |

### 旧数据清理路径

| 残留位置 | 清理方式 |
|---|---|
| localStorage（含历史 key `yinuo_go_ai_tutor` / `_v2` / `_v3`） | `purgeLegacyPersistedApiKey()`：解析旧 JSON、删掉 `config.apiKey` 后回写；解析失败则整条移除（宁可丢配置也不留密钥）。在 `main.ts` 启动时无条件执行一次，同时挂在 persist 的 `afterHydrate` 上 |
| sessionStorage | 同一函数顺带清除（该位置从来不在设计内，出现即视为脏数据） |
| Pinia 内存 | `afterHydrate` 中把 `config.apiKey` 置空 |
| Supabase `settings_data` | `setCloudUser()` 检测到 `settings_data.aiConfig.apiKey` 非空时，登录后立即调用 `syncToCloudNow()`，用不含密钥的 payload 覆盖写回，完成云端清理 |
| 退出登录 | `clearCloudUser()` 调 `clearApiKey()` 立即清空内存密钥 |

### 逐文件

| 文件 | 修改 | 原因 | 验证 |
|---|---|---|---|
| `src/stores/useAiTutorStore.ts` | 导出 `AI_TUTOR_PERSIST_KEY`、`AI_TUTOR_PERSISTED_FIELDS`；新增 `purgeLegacyPersistedApiKey()`、`applyRemoteConfig()`、`clearApiKey()`；`persist.pick` 改为引用白名单常量；`afterHydrate` 调用清理 | 「不再写入」只解决未来，已落盘的旧密钥必须主动改写；云端恢复链路会绕过白名单，必须显式封堵 | `tests/apiKeyPrivacy.spec.ts` 7 项 |
| `src/stores/useUserStore.ts` | `setCloudUser()` 按 `CLOUD_AI_CONFIG_ALLOWED_KEYS` 白名单恢复配置，检测到历史密钥后覆盖写回云端；`clearCloudUser()` 改调 `clearApiKey()` | 阻断"云端旧数据把密钥恢复进内存"这条复活路径，并顺带完成云端清理 | 同上 |
| `src/main.ts` | 启动即调用 `purgeLegacyPersistedApiKey()` | 不依赖 store 是否被 hydrate，保证清理一定执行 | 构建通过 |
| `src/components/common/AiTutorFloatModal.vue` | UI 文案已改为准确描述："API Key 只保存在当前页面的内存中，不会写入浏览器存储，也不会上传云端。刷新页面后需要重新填写。" | 原「已安全保存于本地与云端」文案与实际行为相反，属于误导 | 人工核对三处提示文案 + 表单说明 |

### 测试覆盖（`tests/apiKeyPrivacy.spec.ts`）

1. 落盘白名单不含密钥，按白名单序列化出的快照里没有 API Key
2. 清理历史落盘数据后浏览器存储不再残留密钥，且非密钥配置被保留
3. 云端配置恢复不会复活密钥（`applyRemoteConfig` 丢弃 `apiKey`，其余字段正常生效）
4. 上传云端的 settings payload 字段集不含 `apiKey`
5. 导出的儿童档案不含任何密钥字段
6. 模拟页面刷新（store 重建）后内存中的密钥消失
7. 退出登录立即清空内存密钥

> 说明：`pinia-plugin-persistedstate` 在 Node 测试环境下不会真正写入 storage，
> 因此第 1 项改为对显式导出的落盘白名单常量 + 按该白名单序列化出的快照做断言，
> 这比 mock 插件内部行为更稳定，也让"哪些字段允许落盘"变成可审计的单一事实来源。

---

## P0-3 奖励系统幂等化

### 设计原则

```
一次真实学习行为 → 一次奖励
同一行为重复触发 → 不重复奖励
```

不在 UI 层加 `disabled` 了事，而是在奖励系统层做幂等。选择了**贴合现有奖励模型的最小实现**，
没有新建一套独立的交易系统：幂等账本直接挂在儿童档案（`ChildProfile`）上，
因此天然随本地持久化与云端 `profiles_data` 同步，`toggle` / `refresh` / `retry` /
重开页面 / 换设备都无法重复领取。

### 统一入口

```ts
userStore.grantRewardOnce(idempotencyKey, {
  coins?, exp?, reason?, icon?,
  dailyCapId?, dailyCapLimit?
}): { granted: boolean; blockedBy?: 'no-profile' | 'invalid-key' | 'duplicate' | 'daily-cap' }
```

幂等键格式（`src/utils/rewardKey.ts`）：`reward:<domain>:<parts...>`，
由稳定业务标识拼成，禁止掺入 `Date.now()` 或随机数。

关键实现细节：**先记账，再发钱**。即便后续发放环节抛错，也不会留下"可再次领取"的窗口。
账本超过 400 条时按时间戳裁剪到 300 条，每日封顶计数只保留当天，避免档案无限膨胀。

### 逐文件

| 文件 | 修改 | 原因 | 验证 |
|---|---|---|---|
| `src/stores/useUserStore.ts` | `ChildProfile` 新增 `rewardLedger`、`rewardDailyCounters`；新增 `grantRewardOnce()`、`isRewardGranted()`、`pruneRewardBookkeeping()`；`createProfile` / 占位档案初始化新字段；`resetCurrentProfileProgress()` 一并清空账本 | 建立统一幂等奖励入口，替代各页面直接调 `addCoins/addExp` | `tests/rewardIdempotency.spec.ts` 10 项 |
| `src/utils/rewardKey.ts`（新增） | `stableHash()`、`buildRewardKey()` | 幂等键必须在任何设备任何时刻算出同一值 | 同上末项 |
| `src/views/StudyCenterView.vue` | 完成待办改走 `grantRewardOnce('reward:study-task:<taskId>:complete')`，并加每日封顶 5 项；封顶时给出友好提示；UI 文案改为「每项打卡首次完成 +10 🪙（每日最多 5 项）」 | **主漏洞**：原实现只靠 localStorage 里的 `rewarded` 标记，清缓存或删除任务重建即可无限刷币。自建任务无法被系统校验真伪，除逐条幂等外必须加每日封顶，挡住"不断新建任务换新幂等键" | 幂等 + 封顶两类用例 |
| `src/components/common/AiTutorFloatModal.vue` | 变式题答对改走 `grantRewardOnce('reward:ai-variation:<hash(题干+正解)>')`，每日封顶 10 次；只有真实发奖才播撒花 | 刷新变式题若拿到同一道题，原实现会重复发奖 | 「同题不重发、换题才发」用例 |
| `src/views/AiMatchView.vue` | 引入随对局状态持久化的 `matchId`；结算改走 `grantRewardOnce('reward:go-match:ai:<matchId>:<win\|lose>')`；新增 `MIN_REWARDED_MOVES = 20` 门槛，手数不足的对局只记统计不发奖 | 原实现输棋也发 40exp/10coins，且"开局即停手/认输"可反复触发；`matchId` 让同一盘棋只能结算一次 | 「同一盘棋重复结算只发一次」用例 |

### 测试覆盖（`tests/rewardIdempotency.spec.ts`）

1. 同一幂等键触发 20 次，只结算 1 次（19 次被判 `duplicate`）
2. StudyCenter 反复勾选/取消同一任务不重复刷币
3. 不断新建任务换新幂等键时被每日封顶挡住（30 次尝试只发 5 次）
4. 刷新页面（store 重建 + 从档案恢复）后幂等键仍然生效
5. 变式题刷新拿到同一道题不重发，换新题正常发
6. 同一盘人机对弈重复结算只发一次
7. 未登录/无档案不发奖
8. 空幂等键一律拒绝（避免出现无法追踪的奖励）
9. 账本超上限后被裁剪，不会无限膨胀
10. 幂等键由稳定输入生成，同样输入必得同样键

### 本阶段**未**修复、已登记为风险的同类问题

扫描 `addCoins/addExp` 全部调用点后，除报告已知的三处外还发现两处同类可重复领取路径。
按本阶段"除 P0 涉及文件外禁止修改业务页面"的边界，**未改动**，已登记进
[风险清单](./phase1/13-risks.md)，列为 Phase 2 首批收敛对象：

- `src/views/TwoPlayerView.vue:372` — 本地双人对局结束无条件 `+30 coins / +60 exp`，无手数门槛、无对局幂等键，可反复开局结算刷取。
- `src/views/RankExamView.vue:237` — 考级通过发放段位奖励，无幂等键，重复考同一段位可重复领取。

已确认安全、无需改动的：`src/stores/tsumegoStore.ts:39` 以 `solvedPuzzles` 是否首次收录做幂等判断，
逻辑上等价于幂等键，不存在重复领取。

---

## 针对本次修改的收口搜索

| 检查项 | 结果 |
|---|---|
| `apiKey` 出现在 persist / 上传 / 导出 payload | 无。剩余引用仅为：内存表单 `v-model`、云端白名单判断、注释 |
| `apiKey` 出现在 `console.*` 或错误信息 | 无 |
| StudyCenter 可重复刷币路径 | 无。逐条幂等 + 每日封顶双层保护 |
| `.env` 是否仍被 Git 跟踪 | 否 |
| 是否泄露新的 secret | 否。本文档及 `.env.example` 均只出现变量名 |
