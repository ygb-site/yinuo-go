# 03 · Design Token

Token 是唯一的视觉事实来源。**业务页面不允许出现字面量颜色、字面量字号、任意 `text-[10px]`。**

落地形式：`src/design/tokens.css` 定义 CSS 变量 → `tailwind.config.js` 的
`theme.extend` 引用这些变量 → 组件与页面只用语义类名。
这样 Age Adaptive Theme 换主题时只需覆盖变量，无需改任何组件。

---

## 1. Color

### 1.1 基础色板

| Token | 值 | 用途 |
|---|---|---|
| `--color-background` | `#FBF8F3` | 页面底色（暖白纸感，延续现有 `#FDFBF7` 的调性但统一） |
| `--color-surface` | `#FFFFFF` | 卡片、列表项底色 |
| `--color-surface-elevated` | `#FFFFFF` | 浮层、Modal（与 surface 同色，靠 elevation 区分） |
| `--color-surface-sunken` | `#F4EFE7` | 输入框、进度槽、内嵌区块 |
| `--color-brand` | `#E0722C` | 品牌橙。强调、图标、进度条填充、选中态描边 |
| `--color-brand-strong` | `#B85618` | 主按钮底色、需要承载白色文字的品牌色块 |
| `--color-brand-soft` | `#FDF0E4` | 品牌色浅底（标签、选中背景） |
| `--color-text` | `#24201C` | 主文本 |
| `--color-text-secondary` | `#5C5449` | 次要文本、说明 |
| `--color-text-muted` | `#94897B` | 弱化文本（时间戳、占位） |
| `--color-text-on-brand` | `#FFFFFF` | 品牌色块上的文字 |
| `--color-border` | `#E7DFD3` | 默认描边 |
| `--color-border-strong` | `#D3C7B6` | 需要强调的分隔与描边 |

### 1.2 语义状态色

每个状态色都是一对：`X` 用于文字/图标/描边，`X-soft` 用于背景。

| Token | 主色 | Soft 底 |
|---|---|---|
| `--color-success` | `#2E9E6B` | `#E6F5EE` |
| `--color-warning` | `#B8790A` | `#FDF3DC` |
| `--color-danger` | `#C93B3B` | `#FBEAEA` |
| `--color-info` | `#2F6FC7` | `#E8F0FC` |

### 1.3 领域色（用于区分内容类别，不表达状态）

| Token | 值 | 语义 |
|---|---|---|
| `--color-learning` | `#2F6FC7` | 学习 / 课程 / 训练 |
| `--color-growth` | `#2E9E6B` | 成长 / 能力 / 成就 |
| `--color-challenge` | `#6B4FCF` | 挑战 / 对局 / 考级 |

领域色只允许出现在：区块标题图标、类别标签、进度条填充、卡片左侧色条。
**不允许**用它给整张卡片刷渐变底——那是当前"每个页面自己定义颜色"的根源。

### 1.4 对比度硬规则（可访问性，不可绕过）

| 规则 | 原因 |
|---|---|
| `--color-brand` (#E0722C) **不得**作为正文文字色 | 对白底对比度约 3.4:1，低于 WCAG AA 4.5:1。只能用于 ≥24px 大字、图标、填充 |
| 承载白字的品牌色块必须用 `--color-brand-strong` | #B85618 对白对比度约 5.8:1，达标 |
| `--color-text-muted` 只能用于 ≥14px 且非必要信息 | 对白约 3.3:1 |
| 状态色文字一律用主色，不用 soft 色 | soft 色是背景专用 |

### 1.5 棋盘专属色

棋盘配色属于**内容层**，不属于 UI 主题层。棋盘固定为暖木纹理，
**不纳入本 Token 体系**，也不随 Age Theme 变化。
这是刻意的隔离：换 UI 主题不应该换棋盘木纹。

---

## 2. Typography

字体族：
```
--font-sans: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif;
--font-display: 'ZCOOL KuaiLe', var(--font-sans);   /* 现有 font-cartoon，仅用于 display/heading */
--font-mono: ui-monospace, 'SF Mono', Menlo, monospace;  /* 棋谱坐标、计时 */
```

### 2.1 六个层级

| 层级 | 移动端 (< 768px) | 桌面 (≥ 768px) | weight | letter-spacing | 用途 |
|---|---|---|---|---|---|
| `display` | 28px / 36px | 32px / 40px | 700 | -0.02em | 每屏最多一个：Today 问候、结果页主标题 |
| `heading` | 22px / 30px | 24px / 32px | 700 | -0.01em | 页面标题、Modal 标题 |
| `title` | 18px / 26px | 18px / 26px | 600 | 0 | 卡片标题、区块标题 |
| `body` | 16px / 26px | 16px / 26px | 400 | 0 | 正文。儿童端正文**不得小于 16px** |
| `label` | 14px / 20px | 14px / 20px | 600 | 0.01em | 按钮文字、标签、表单标签 |
| `caption` | 12px / 18px | 12px / 18px | 500 | 0.02em | 时间戳、辅助说明。**全局最小字号** |

补充变体（不新增层级，只是同层的粗体）：`body-strong`（body + weight 600）。

### 2.2 硬规则

| 禁止 | 原因 / 替代 |
|---|---|
| `font-black` (900) | 当前全站滥用，导致没有层级可言。**只允许 `display` 层级可选 800**，其余最高 700 |
| `font-extrabold` (800) | 同上，仅 `display` 可用 |
| `text-[10px]` 及任何 < 12px | 儿童可读性下限。当前 `StudyCenterView` 等页面存在多处 `text-[10px]`，全部提到 `caption` |
| 任意 `text-[Npx]` 字面量 | 一律用六个层级的语义类 |
| 同一屏出现两个 `display` | 层级失效 |
| 正文用 `font-display`（卡通字体） | 卡通字体只用于 display/heading，正文用 sans 保证可读性 |

### 2.3 字体族分配

- `display` / `heading`：`--font-display`（保留现有 `font-cartoon` 的亲和力）
- `title` / `body` / `label` / `caption`：`--font-sans`
- 棋谱坐标、计时器、比分：`--font-mono`（等宽避免数字跳动）

---

## 3. Spacing

4px 基准栅格。**只允许使用这个 scale 里的值。**

| Token | 值 | 典型用途 |
|---|---|---|
| `--space-0` | 0 | |
| `--space-1` | 4px | 图标与紧邻文字 |
| `--space-2` | 8px | 标签内边距、紧密列表行距 |
| `--space-3` | 12px | 卡片内元素间距 |
| `--space-4` | 16px | 卡片内边距（移动端）、区块内元素间距 |
| `--space-5` | 20px | |
| `--space-6` | 24px | 卡片内边距（桌面）、区块之间 |
| `--space-8` | 32px | 大区块之间 |
| `--space-10` | 40px | 页面区段之间 |
| `--space-12` | 48px | 页面顶部/底部留白 |
| `--space-16` | 64px | 桌面大区段 |

页面级约定：

| 场景 | 值 |
|---|---|
| 页面左右边距（移动端） | `--space-4` (16px) |
| 页面左右边距（≥768px） | `--space-6` (24px) |
| 卡片内边距（移动端） | `--space-4` |
| 卡片内边距（桌面） | `--space-6` |
| 卡片之间垂直间距 | `--space-4`（同组）/ `--space-8`（跨区块） |
| 区块标题与内容 | `--space-3` |

---

## 4. Radius

| Token | 值 | 用途 |
|---|---|---|
| `--radius-sm` | 8px | 标签、徽章、小图标底 |
| `--radius-md` | 12px | 按钮、输入框、列表项 |
| `--radius-lg` | 16px | 卡片 |
| `--radius-xl` | 24px | 大卡片、Hero 区、移动端底部抽屉顶部 |
| `--radius-full` | 9999px | 头像、圆形按钮、进度条 |

规则：**同一层级的元素必须用同一档圆角。** 当前多个页面混用 `rounded-2xl` / `rounded-3xl` /
`rounded-xl` 于同类卡片，是"不一致"的主要来源。

---

## 5. Elevation / Shadow

儿童产品需要一点立体感，但当前的多层 `shadow-xl` + 渐变 + 玻璃态叠加过重。收敛为 5 档：

| Token | 值 | 用途 |
|---|---|---|
| `--elevation-0` | `none` | 平铺区块，靠 `--color-border` 区分 |
| `--elevation-1` | `0 1px 2px rgba(36,32,28,.06)` | 卡片默认 |
| `--elevation-2` | `0 2px 8px rgba(36,32,28,.08)` | 卡片 hover、吸顶 Header |
| `--elevation-3` | `0 8px 24px rgba(36,32,28,.10)` | 浮层、下拉、Popover |
| `--elevation-4` | `0 16px 48px rgba(36,32,28,.14)` | Modal、底部抽屉 |

硬规则：
- **禁止** glassmorphism（`backdrop-blur` + 半透明白）作为常规卡片样式。
  只允许两处：Immersive Header、吸顶导航。
- **禁止**无语义渐变。渐变只允许出现在：进度条填充、成就/证书这类"奖状感"必需的场合。
  卡片底色一律纯色。
- 一个页面里最多出现两种 elevation 层级。

---

## 6. Motion

### 6.1 时长

| Token | 值 | 用途 |
|---|---|---|
| `--duration-instant` | 0ms | 需要立即响应的状态切换（勾选） |
| `--duration-fast` | 120ms | hover、颜色变化、小图标切换 |
| `--duration-normal` | 200ms | 展开/收起、页面转场、Modal 进出 |
| `--duration-slow` | 320ms | 大面积布局变化、抽屉 |
| `--duration-emphasis` | 480ms | 成功反馈、进度增长动画 |

### 6.2 缓动

| Token | 值 | 用途 |
|---|---|---|
| `--ease-standard` | `cubic-bezier(.2, 0, .2, 1)` | 默认 |
| `--ease-out` | `cubic-bezier(0, 0, .2, 1)` | 元素进入 |
| `--ease-in` | `cubic-bezier(.4, 0, 1, 1)` | 元素退出 |
| `--ease-emphasis` | `cubic-bezier(.2, .8, .2, 1)` | 奖励、解锁等需要"弹一下"的场合 |

### 6.3 交互动效规范

| 场景 | 规范 |
|---|---|
| `hover` | 仅指针设备生效（`@media (hover: hover)`）。`--duration-fast`，只改背景色/描边色，**不改变尺寸**（避免布局跳动） |
| `press` | `transform: scale(.97)`，`--duration-instant` 按下、`--duration-fast` 回弹。所有可点元素必须有 |
| `success` | 目标元素 `scale(1) → 1.04 → 1`，`--duration-emphasis` + `--ease-emphasis`，配合数值滚动（金币从旧值滚到新值） |
| `unlock` | 编排动效，总时长 ≤ 720ms：遮罩淡入(120) → 徽章从 .8 弹到 1(320, emphasis) → 文字淡入上移(200) → 撒花(一次，粒子数 ≤ 60) |
| `page transition` | 淡入 + 8px 上移，`--duration-normal`，`--ease-out`。Immersive 进出用淡入淡出，**不做横向滑动**（会与棋盘拖拽手势冲突） |
| `skeleton` | 1.2s 循环的微亮扫过，不用旋转 spinner 占位 |

### 6.4 硬规则

- 必须实现 `@media (prefers-reduced-motion: reduce)`：所有 `--duration-*` 归零，
  撒花与弹跳一律禁用。当前全站的 `animate-bounce`、`animate-ping`、`animate-pulse` 无一遵守。
- 常驻循环动画（`animate-bounce` / `animate-ping`）**每屏最多一个**，
  且只允许用于引导用户注意唯一的主行动。
- 撒花（`canvas-confetti`）只允许出现在：关卡通关、解锁、段位考通过、勋章获得。
  单次 `particleCount ≤ 60`。**不允许**普通答题正确就撒花。

---

## 7. Z-index

| Token | 值 | 层 |
|---|---|---|
| `--z-base` | 0 | 内容 |
| `--z-sticky` | 100 | 吸顶 Header、吸底工具栏 |
| `--z-nav` | 200 | 底部 Tab Bar、侧栏 |
| `--z-float` | 300 | AI 小诺悬浮按钮 |
| `--z-popover` | 400 | 下拉、Tooltip |
| `--z-modal` | 1000 | Modal、抽屉 |
| `--z-toast` | 1100 | 全局提示 |
| `--z-loading` | 1200 | 全局加载条 |

禁止在业务代码中写 `z-[9999]` 之类的字面量。

---

## 8. Age Adaptive Theme（架构，本阶段不做四套视觉）

### 8.1 链路

```
Age / Stage  →  Theme Token Override  →  Component Style
（儿童档案 gradeLevel 推导）   （只覆盖 CSS 变量）   （组件零改动）
```

### 8.2 四档定义

| Stage | 对应年龄 / 学段 | 设计意图 |
|---|---|---|
| `early-childhood` | 5–6 岁 / 学前 | 最大字号、最大圆角、最强色彩、最多动效 |
| `primary` | 7–12 岁 / 小学 | **默认基线**，即上文所有 Token 的原始值 |
| `middle-school` | 13–15 岁 / 初中 | 字号回归标准、圆角收紧、去卡通字体、动效减半 |
| `teen` | 16+ / 高中 | 接近成人产品：中性色偏冷、无卡通字体、动效仅功能性 |

### 8.3 实现方式

```ts
export type AgeStage = 'early-childhood' | 'primary' | 'middle-school' | 'teen';

/** 只允许覆盖这些 token，其余一律继承基线，避免主题变成第二套设计系统 */
export interface ThemeTokenOverride {
  fontScale?: number;                    // 字号整体缩放，作用于 6 个层级
  radiusScale?: number;                  // 圆角缩放
  motionScale?: number;                  // 动效时长缩放（0 = 关闭装饰动效）
  displayFontFamily?: 'display' | 'sans';// 是否使用卡通字体
  colorOverrides?: Partial<Record<
    'brand' | 'brandStrong' | 'brandSoft' | 'background', string
  >>;
  decorations?: 'rich' | 'standard' | 'minimal'; // 撒花/弹跳等装饰强度
}

export const AGE_THEME_OVERRIDES: Record<AgeStage, ThemeTokenOverride> = {
  'early-childhood': { fontScale: 1.125, radiusScale: 1.25, motionScale: 1.2,  displayFontFamily: 'display', decorations: 'rich' },
  'primary':         {},  // 基线，不覆盖
  'middle-school':   { fontScale: 1,     radiusScale: 0.75, motionScale: 0.75, displayFontFamily: 'sans',    decorations: 'standard' },
  'teen':            { fontScale: 1,     radiusScale: 0.5,  motionScale: 0.5,  displayFontFamily: 'sans',    decorations: 'minimal' }
};
```

运行时：根据 `currentProfile.gradeLevel` 推导 `AgeStage`，
在 `<html>` 上设置 `data-age-stage="primary"`，CSS 侧用
`[data-age-stage='teen'] { --radius-lg: 8px; ... }` 覆盖变量。

### 8.4 本阶段边界

Phase 3 只需交付：Token 变量文件、`AgeStage` 类型、推导函数、`data-age-stage` 挂载点，
以及 `primary` 基线的完整实现。**其余三档留空实现**（override 表存在但值可为空），
等有真实用户覆盖到那些学段时再填。

---

## 9. Tailwind 映射约定

```js
// tailwind.config.js（示意）
theme: {
  extend: {
    colors: {
      background: 'var(--color-background)',
      surface: { DEFAULT: 'var(--color-surface)', sunken: 'var(--color-surface-sunken)' },
      brand:   { DEFAULT: 'var(--color-brand)', strong: 'var(--color-brand-strong)', soft: 'var(--color-brand-soft)' },
      // …其余同 §1
    },
    borderRadius: { sm: 'var(--radius-sm)', md: 'var(--radius-md)', lg: 'var(--radius-lg)', xl: 'var(--radius-xl)' },
    boxShadow: { e1: 'var(--elevation-1)', e2: 'var(--elevation-2)', e3: 'var(--elevation-3)', e4: 'var(--elevation-4)' },
    transitionDuration: { fast: '120ms', normal: '200ms', slow: '320ms', emphasis: '480ms' }
  }
}
```

排版层级用 `@layer components` 里的 `.text-display` / `.text-heading` / … 六个类，
不用 Tailwind 的 `text-2xl` 之类尺寸类（那样又变回字面量）。
