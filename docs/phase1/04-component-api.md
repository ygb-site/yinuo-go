# 04 · 组件 API

## 0. 分层与目录

```
src/design-system/          通用、与业务无关。不 import 任何 store / data
├── AppButton.vue
├── AppCard.vue
├── AppBadge.vue
├── AppProgress.vue
├── AppIcon.vue
├── AppAvatar.vue
├── AppModal.vue
├── AppEmptyState.vue
├── AppSkeleton.vue
├── AppTabs.vue
└── AppSection.vue

src/features/<domain>/components/   语义组件，可以 import store / 领域类型
├── today/     ContinueCard, DailyTaskCard, RecommendationCard, StreakCard
├── learn/     LessonCard, ChallengeCard, TrainingCard
├── growth/    GrowthCard, AbilityCard, AchievementCard, RewardCard
└── parent/    WeeklyReportCard, AbilityTrendCard, WeakSkillCard, RecommendedActionCard
```

**判定规则：组件里出现任何领域名词（lesson、ability、coin、streak）就不属于 design-system。**
这是防止 design-system 膨胀成"什么都往里塞"的唯一标准。

## 1. 组件应控制什么

由组件控制（页面**不得**自己拼 Tailwind class）：

- 所有颜色、字号、圆角、阴影、间距的选择
- 交互态：hover / press / focus-visible / disabled / loading
- 可访问性：`role`、`aria-*`、键盘操作、焦点管理
- 触控目标最小尺寸（≥ 44×44px）
- 骨架屏与空态

由页面控制：

- 内容与文案
- 布局（用 `AppSection` 与 grid 工具类）
- 数据获取与事件处理

---

## 2. 原子组件

### 2.1 AppButton

```ts
interface AppButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'brandSoft';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;          // 占满宽度
  loading?: boolean;        // 显示 spinner，自动禁用点击
  disabled?: boolean;
  iconOnly?: boolean;       // 正方形按钮，必须同时提供 ariaLabel
  ariaLabel?: string;
  as?: 'button' | 'a' | 'router-link';
  to?: string;              // as 为 router-link 时
  type?: 'button' | 'submit';
}
```

| | 说明 |
|---|---|
| emits | `click(event: MouseEvent)` |
| slots | `default`（文字）、`icon`（前置图标）、`suffix`（后置图标/角标） |
| variant | `primary` = brandStrong 底 + 白字；`secondary` = surface 底 + border；`ghost` = 无底无边；`danger` = danger 底 + 白字；`brandSoft` = brandSoft 底 + brandStrong 字 |
| size | `sm` 32px / `md` 40px / `lg` 48px 高。触控目标不足 44px 时由组件补透明外扩 |
| state | default / hover / press(scale .97) / focus-visible(2px brand 外环) / disabled(40% 透明 + 禁 press) / loading |

约定：`loading` 时按钮宽度**不变**（文字换成 spinner 而非追加），避免布局跳动。

### 2.2 AppCard

```ts
interface AppCardProps {
  variant?: 'plain' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';   // md = space-4/6 响应式
  accent?: 'none' | 'learning' | 'growth' | 'challenge';  // 左侧 3px 色条
  interactive?: boolean;   // 整卡可点：加 hover/press 与 role=button
  as?: 'div' | 'article' | 'section';
}
```

| | 说明 |
|---|---|
| emits | `click`（仅 `interactive` 为 true 时） |
| slots | `default`、`header`、`footer`、`media` |
| state | default / hover(elevation+1) / press / focus-visible |

**不提供** `gradient`、`glass` 之类的 prop。这是刻意的：卡片底色只能是纯色。

### 2.3 AppBadge

```ts
interface AppBadgeProps {
  variant?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info'
          | 'learning' | 'growth' | 'challenge';
  size?: 'sm' | 'md';
  shape?: 'pill' | 'square';   // square 用于数字角标
  dot?: boolean;               // 纯圆点，无文字
}
```
slots：`default`、`icon`。无 emits。
用 soft 底 + 主色字，不用实心底（实心徽章会与按钮混淆）。

### 2.4 AppProgress

```ts
interface AppProgressProps {
  value: number;                // 0–100，组件内 clamp
  variant?: 'linear' | 'ring' | 'segmented';
  size?: 'sm' | 'md' | 'lg';
  tone?: 'brand' | 'learning' | 'growth' | 'challenge';
  segments?: number;            // variant=segmented 时的段数（如 3 星）
  label?: string;               // 无障碍标签，必填其一：label 或 ariaLabel
  showValue?: boolean;
  animated?: boolean;           // 值变化时走 emphasis 动画
}
```
无 emits。slots：`label`。
`role="progressbar"` + `aria-valuenow/min/max` 由组件负责。

### 2.5 AppIcon

```ts
interface AppIconProps {
  name: IconName;               // 来自集中注册表，禁止在页面里直接 import lucide 图标
  size?: 'xs' | 'sm' | 'md' | 'lg';   // 16 / 20 / 24 / 32
  tone?: 'inherit' | 'brand' | 'muted' | 'success' | 'warning' | 'danger' | 'info';
  ariaLabel?: string;           // 缺省 aria-hidden
}
```

集中注册表 `src/design-system/icons.ts` 的价值：
1. 图标语义统一（"返回"全站同一个图标）；
2. 按需引入可控（当前 `vendor-lucide` 打包 85.9 kB）；
3. **Emoji 治理**：现存页面用 emoji 当图标（`📝`、`🏫`、`🪙`）。
   规则是 **emoji 只允许作为内容**（如儿童头像、奖励物品形象），
   **不允许作为 UI 图标**（导航、按钮、状态）。注册表让这条规则可检查。

### 2.6 AppAvatar

```ts
interface AppAvatarProps {
  emoji?: string;               // 儿童档案头像就是 emoji，属于内容
  src?: string;
  name?: string;                // 无 emoji/src 时取首字
  size?: 'sm' | 'md' | 'lg' | 'xl';   // 32 / 40 / 56 / 80
  ring?: 'none' | 'brand' | 'rank';   // rank = 按段位取色
  badge?: 'none' | 'online' | 'count';
  badgeCount?: number;
}
```
emits：`click`。

### 2.7 AppModal

```ts
interface AppModalProps {
  open: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  presentation?: 'auto' | 'center' | 'sheet';  // auto = 移动端 sheet / 桌面 center
  dismissible?: boolean;        // 默认 true：遮罩点击 + Esc 可关
  hideClose?: boolean;
  scrollBehavior?: 'body' | 'content';
}
```

| | 说明 |
|---|---|
| emits | `update:open(boolean)`、`close`、`opened`、`closed` |
| slots | `default`、`header`、`footer`、`media` |

组件必须负责（现有各 Modal 各自实现且不一致的部分）：
body 滚动锁 + 滚动位置还原、focus trap、Esc 关闭、
`visualViewport` 键盘避让、同时只允许一个全屏 Modal（内部排队）。

### 2.8 AppEmptyState

```ts
interface AppEmptyStateProps {
  variant?: 'empty' | 'locked' | 'error' | 'first-time';
  title: string;
  description?: string;
  illustration?: 'none' | 'mascot' | 'board' | 'chart';
}
```
slots：`action`（放 AppButton）、`illustration`。

`locked` 变体是重点：当前解锁失败走的是全局 alert 弹窗打断，
应改为在目标位置**原地展示**锁定态 + 说明 + "去闯关"按钮。

### 2.9 AppSkeleton

```ts
interface AppSkeletonProps {
  variant?: 'text' | 'title' | 'card' | 'avatar' | 'board' | 'chart';
  lines?: number;      // variant=text
  width?: string;
  height?: string;
}
```
无 emits，无 slots。所有异步区块**必须**用它而不是全局 loading 条覆盖整页。

### 2.10 AppTabs

```ts
interface AppTabsProps {
  modelValue: string;
  items: Array<{ id: string; label: string; icon?: IconName; badge?: string | number; disabled?: boolean }>;
  variant?: 'underline' | 'pill' | 'segmented';
  size?: 'sm' | 'md';
  scrollable?: boolean;   // 溢出时横滚并带渐隐边缘
}
```
emits：`update:modelValue(id)`、`change(id)`。
键盘：左右方向键切换、Home/End 跳首尾，`role="tablist"`。

### 2.11 AppSection

页面级排版容器，**取代各页面手写的 `space-y-*` + 标题 div 组合**。

```ts
interface AppSectionProps {
  title?: string;
  description?: string;
  icon?: IconName;
  tone?: 'none' | 'learning' | 'growth' | 'challenge';  // 影响标题图标底色
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  density?: 'compact' | 'default' | 'spacious';
}
```
emits：`toggle(collapsed: boolean)`。slots：`default`、`action`（右上角操作）、`footer`。

---

## 3. 语义组件

均建立在原子组件之上，**不允许**跳过原子层直接写样式。

| 组件 | 归属 | props（要点） | 说明 |
|---|---|---|---|
| `ContinueCard` | feature/today | `node: LearningNode`、`progress: Progress` | Today 首屏唯一主行动。展示"继续第 3 章第 2 关"+ 进度条 + 大号主按钮 |
| `DailyTaskCard` | feature/today | `task: DailyTask`、`rewardGranted: boolean` | 今日任务项。完成态必须反映奖励幂等结果（P0 已建立），不能只反映勾选态 |
| `RecommendationCard` | feature/today | `reason: string`、`node: LearningNode` | 小诺推荐。**必须显示推荐理由**（"上次'打二还一'错了 2 次"），无理由的推荐不展示 |
| `StreakCard` | feature/today | `streak: number`、`checkedInToday: boolean` | 连续天数 + 打卡 |
| `LessonCard` | feature/learn | `node: LearningNode`、`progress`、`locked: boolean` | 关卡卡片。锁定态用 `AppEmptyState variant=locked` 的内联形态 |
| `ChallengeCard` | feature/learn | `kind: 'ai' \| 'local' \| 'capture' \| 'rank'`、`opponent?` | 对局入口 |
| `TrainingCard` | feature/learn | `kind: 'tsumego' \| 'practice' \| 'arcade'`、`todayCount` | 专项训练入口 |
| `GrowthCard` | feature/growth | `summary: GrowthSummary` | 儿童端成长总览 |
| `AbilityCard` | feature/growth | `dimension: AbilityDimension`、`score`、`delta`、`variant: 'child' \| 'parent'` | 单个能力维度。**儿童版只讲优势和"正在变强"，家长版可显示薄弱** |
| `RewardCard` | feature/growth | `entry: CoinLogEntry` | 金币/星星流水项 |
| `AchievementCard` | feature/growth | `badge: AchievementBadge`、`unlocked: boolean`、`progress?` | 勋章 |
| `WeeklyReportCard` | feature/parent | `report: WeeklySummary` | 家长周报。结论先行 |
| `AbilityTrendCard` | feature/parent | `dimension`、`series: AbilityPoint[]`、`hasData: boolean` | **`hasData: false` 时显示"尚未开始"，禁止画占位曲线** |
| `WeakSkillCard` | feature/parent | `skill: Skill`、`evidence: MistakeRecord[]` | 薄弱项 + 证据 |
| `RecommendedActionCard` | feature/parent | `action: RecommendedAction` | 家长可执行动作 |

### 3.1 通用/feature 归属结论

- **通用（design-system）**：11 个原子组件。
- **feature**：全部 15 个语义组件。
- 有一个边界例外值得说明：`AbilityCard` 同时服务儿童端与家长端，
  但它依赖 `AbilityDimension` 领域类型，因此**仍属 feature/growth**，
  由 `variant` 区分两种表达，而不是拆成两个组件或塞进 design-system。

---

## 4. 使用示例

```vue
<AppSection title="今天该做什么" icon="target" tone="learning">
  <ContinueCard :node="continueNode" :progress="continueProgress" />

  <div class="grid gap-4 md:grid-cols-2">
    <DailyTaskCard
      v-for="task in todayTasks"
      :key="task.id"
      :task="task"
      :reward-granted="isRewardGranted(task.rewardKey)"
      @complete="onCompleteTask(task)"
    />
  </div>

  <template #action>
    <AppButton variant="ghost" size="sm" @click="goAllTasks">全部任务</AppButton>
  </template>
</AppSection>

<AppButton variant="primary" size="lg" block :loading="isEntering" @click="startLesson">
  <template #icon><AppIcon name="play" /></template>
  开始学习
</AppButton>
```

---

## 5. 交付与验收（Phase 3）

1. 11 个原子组件全部实现，含 default / hover / press / focus-visible / disabled / loading / empty 全状态。
2. 每个组件配一份 `*.stories` 形式的演示页（可以是一个内部路由 `/dev/design-system`，
   `import.meta.env.DEV` 下才注册），用于人工回归。
3. 至少 3 个真实页面完成迁移作为样板（建议 Today、Me、Mistakes）。
4. 加一条 grep 检查：`src/design-system/` 下不得出现 `stores/` 或 `data/` 的 import。
5. 加一条 grep 检查：`src/views/` 与 `src/features/` 下不得出现
   `bg-gradient-to-`、`font-black`、`text-[1` 三类字面量（例外需在文件头显式注释理由）。
