# 02 · AppShell 设计

## 1. 结构

```
App.vue
└── AppShell.vue                 读 route.meta.mode，只做分发，不含具体布局
    ├── ChildShell.vue
    ├── ParentShell.vue
    ├── ImmersiveShell.vue
    └── GlobalLayer.vue          三种 Shell 共用的全局层
```

`App.vue` 收敛为：全局层挂载 + `<AppShell>` + `<router-view>`。
现有 `App.vue` 里的 `isImmersiveView = route.path.startsWith('/lesson/')` 与
`Navbar.vue` 里的 `route.path.includes('/lesson/')` 一并删除。

### GlobalLayer 内容（与 Shell 无关，始终挂载一份）

`GlobalLoadingBar`、`CartoonAlertModal`、`AuthModal`、`ProfileSwitcherModal`、
`UnlockCelebrationModal`、`AiTutorFloatModal`（由 `meta.aiTutor` 控制显隐）。

---

## 2. Child Shell

儿童日常学习环境。目标：任何时刻孩子都知道自己在哪、怎么回去。

### Header

- 高度：移动端 56px，桌面 64px。
- 左：返回按钮（`meta.back.type !== 'none'` 时显示）或产品标识（顶级 tab）。
- 中：页面标题（`meta.label ?? meta.title`），单行截断。
- 右：档案头像（点击打开档案切换）+ 金币数。
  **不放**设置、不放通知、不放家长入口——右侧最多两个元素。
- 滚动行为：向下滚动 > 64px 时 Header 收起（仅移动端），向上滚动立即回来。
  桌面端 Header 常驻不收起。

### Navigation

| 断点 | 形态 |
|---|---|
| < 1024px | 底部 Tab Bar（4 项），Header 无导航 |
| ≥ 1024px | 左侧固定侧栏（宽 240px，含 4 个分区 + 二级项），无底部 Tab Bar |

底部 Tab Bar：
- 高度 56px + `env(safe-area-inset-bottom)`。
- 4 项等宽：Today / Learn / Play / Me。图标 24px + 10px 标签，标签**不可省略**（儿童识图能力有限）。
- 高亮由 `meta.section` 决定，禁止路径匹配。
- 内容区底部 padding：`calc(56px + env(safe-area-inset-bottom) + 16px)`。

### Back behavior

按 `meta.back` 执行，统一实现在 `useAppBack()` 组合式函数里：

```
none     → 不渲染按钮
history  → window.history.length > 1 ? router.back() : router.push(fallbackOf(section))
route    → router.push(to)
confirm  → 先 showConfirm，取消则留在当前页
```

**Android 物理返回键 / 浏览器后退**必须与 Header 返回按钮行为一致：
`confirm` 类型的页面需要注册 `onBeforeRouteLeave` 做同样的拦截，否则会出现
"点按钮会确认、按系统返回直接走"的不一致（当前 `AiMatchView` 就是这个状态）。

### Safe area

- 底部：Tab Bar 使用 `padding-bottom: max(6px, env(safe-area-inset-bottom))`。
- 顶部：Header 使用 `padding-top: env(safe-area-inset-top)`（PWA 全屏模式下必需）。
- 左右：横屏刘海设备使用 `padding-inline: env(safe-area-inset-left/right)`。

### Desktop / Mobile

| | 移动端 (< 1024) | 桌面 (≥ 1024) |
|---|---|---|
| 导航 | 底部 Tab | 左侧栏 240px |
| Header | 56px，可收起 | 64px，常驻 |
| 内容宽度 | 100% - 24px | 按 `meta.width`，见 11-responsive |
| Footer | 隐藏 | 显示 |

---

## 3. Parent Shell

家长分析环境。视觉语言与儿童端**明确区分**：更低饱和、更高信息密度、无卡通装饰。

### Header

- 高度 64px，常驻。
- 左：返回（回儿童端）+ "家长中心"标题。
- 中：当前查看的孩子选择器（多档案时）。
- 右：账号菜单（云同步状态 / 退出）。

### Navigation

| 断点 | 形态 |
|---|---|
| < 768px | Header 下方横向 Tab（可滚动）：概览 / 周报 / 能力 / 记录 / 设置 |
| ≥ 768px | 左侧栏 200px |

**家长端不使用底部 Tab Bar。** 底部 Tab 是儿童端的视觉签名，
家长端复用会让两个模式在感知上混淆。

### 进入与退出

- 进入 `/parent*` 必须满足 `requiresParent`：已登录家长账号 + 通过一次轻量家长验证
  （Phase 7 定义具体形式，建议出生年份或简单算术，不做密码）。
- 验证结果在当前会话内有效（内存，不持久化）。
- 退出家长中心一律回 `/`（Today），不用 `history.back()`——
  否则会退回到验证前的中间态。

### Safe area / 响应式

- 顶部同 Child Shell。
- 底部无 Tab Bar，仅需 `padding-bottom: env(safe-area-inset-bottom)`。
- 内容宽度 `wide`（1200px），表格类区域允许横向滚动，但**首屏结论区永不横滚**。

---

## 4. Immersive Shell

棋盘、答题、课程等需要持续注视的环境。目标：内容占满，干扰归零。

### Header

- 高度 48px（比 Child 更矮），**半透明玻璃底 + 内容不遮挡**。
- 左：返回（按 `meta.back`，对局页一律 `confirm`）。
- 中：极简状态（如"第 3/8 关"、"黑棋 vs 小狗"），**不放长标题**。
- 右：最多 2 个上下文动作（如 提示 / 全屏）。其余动作放在内容区的工具栏里，不进 Header。

### Navigation

- 无底部 Tab Bar，无侧栏，无 Footer。
- 唯一的全局出口是 Header 返回按钮。

### 内容布局（BoardShell）

Immersive 内部再分两块：**主舞台（棋盘/题目）** 与 **辅助区（状态、提示、操作）**。

| 断点 | 布局 |
|---|---|
| 手机竖屏 | 单列：辅助区(上) / 棋盘 / 操作栏(下)。棋盘居中，占据可用高度的最大正方形 |
| 平板竖屏 | 单列但棋盘更大，辅助区可左右分栏 |
| iPad 横屏 / 桌面 | 两栏：棋盘固定在左（或居中），辅助区固定在右侧 320–360px 栏 |

棋盘尺寸计算（统一到 `useBoardSize()`，禁止各页面自己算）：

```
availableH = viewportH - headerH(48) - toolbarH - safeAreaBottom - gap*2
availableW = contentW - (sidePanelVisible ? panelW + gap : 0)
boardSize  = clamp(minBoardSize, min(availableH, availableW), maxBoardSize)
```

具体像素值见 [11-responsive](./11-responsive.md)。

### Back behavior

- 一律 `{ type: 'confirm' }`，条件是"存在未完成的进度"（对局有落子、答题已开始）。
- 无进度时降级为直接返回，不弹确认框（不要为了严谨骚扰用户）。
- 返回目标是**所属聚合页**（如 AI 对弈 → `/learn/go/match`），不是 `history.back()`。
  从深链接直接进入时，`history.back()` 会离开应用。

### Safe area

- 棋盘区域必须避开底部安全区，否则最后一行落子点在全屏 PWA 里点不到。
- 横屏时左右安全区内缩，避免棋盘被刘海裁切。

### Orientation

- `meta.orientation` 为 `'any'`：棋盘页在 iPad 横屏是**更好**的体验，必须允许。
- 现状 `App.vue` 的 `lockPortraitOrientation()` 是全局无条件调用，
  改为按当前路由 meta 决定：进入 `orientation: 'any'` 的页面时解锁，离开时恢复。

---

## 5. Modal behavior（三种 Shell 统一）

| 规则 | 内容 |
|---|---|
| 层级 | 全局层 z-index 统一在 `z-modal(1000)` 之上，Shell 内的浮层不得超过它 |
| 尺寸 | 移动端：底部抽屉（`max-height: 85vh`，圆角仅顶部）；桌面：居中卡片（`max-width: 560px`） |
| 滚动锁 | 打开时锁 body 滚动，关闭时恢复。必须记录并还原滚动位置（当前 `AiTutorFloatModal` 直接改 `document.body.style.overflow`，会丢失滚动位置） |
| 关闭 | 遮罩点击关闭 + Esc 关闭 + 右上角关闭按钮，三者都要有。**破坏性确认框例外**：只允许显式按钮 |
| 键盘 | 移动端输入框弹起时用 `visualViewport` 调整高度（`AiTutorFloatModal` 里已有可复用实现） |
| 焦点 | 打开时焦点移入弹窗首个可交互元素，关闭后归还给触发元素 |
| 并发 | 同时只允许一个全屏 Modal。新的打开请求排队，不叠加 |
| Immersive 中 | Modal 不隐藏 Header，但必须暂停棋盘交互与自动语音 |

---

## 6. 迁移影响

| 现文件 | 动作 |
|---|---|
| `src/App.vue` | 精简为 GlobalLayer + AppShell，删除 `isImmersiveView` |
| `src/components/Navbar.vue` | 拆成 `ChildShell` 内的 `AppHeader` + `AppBottomNav`，删除 17 行路径判断 |
| `src/components/Footer.vue` | 移入 `ChildShell`，仅桌面渲染 |
| `src/utils/pwa.ts` | `lockPortraitOrientation` 改为可传参的 `applyOrientation(mode)` |
| 各 Immersive 页面 | 各自的 `goBack`、棋盘尺寸计算、`min-h-screen` 容器类 收敛到 Shell 与 `useBoardSize()` |
