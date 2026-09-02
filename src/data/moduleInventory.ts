export type ModuleKind = 'page' | 'overlay' | 'file' | 'alias';

export interface ModuleInventoryItem {
  id: string;
  name: string;
  kind: ModuleKind;
  path?: string;
  file: string;
  reachable: boolean;
  entries: string[];
  note: string;
  suggestDelete: boolean;
  hiddenEntry?: boolean;
}

export const MODULE_INVENTORY: ModuleInventoryItem[] = [
  {
    id: 'today',
    name: '今天',
    kind: 'page',
    path: '/',
    file: 'src/views/HomeView.vue',
    reachable: true,
    entries: ['桌面侧栏', '手机/平板底栏'],
    note: '日课驾驶舱：按时段显示课表/带物、午休轻练、作业与明日准备、衡水影子一题。',
    suggestDelete: false
  },
  {
    id: 'schedule',
    name: '课程表',
    kind: 'page',
    path: '/schedule',
    file: 'src/views/ScheduleView.vue',
    reachable: true,
    entries: ['桌面侧栏', '手机/平板底栏'],
    note: '课表：点格子自选科目，本地保存。标题跟档案年级走。',
    suggestDelete: false
  },
  {
    id: 'learn',
    name: '少儿围棋',
    kind: 'page',
    path: '/learn',
    file: 'src/views/GoHubView.vue',
    reachable: true,
    entries: ['桌面侧栏', '手机/平板底栏'],
    note: '围棋大厅：主线、词典、口诀、死活。',
    suggestDelete: false
  },
  {
    id: 'match',
    name: '创建对局',
    kind: 'page',
    path: '/match',
    file: 'src/views/MatchCreateView.vue',
    reachable: true,
    entries: ['桌面侧栏', '手机/平板底栏'],
    note: '跳棋 / 五子棋 / 围棋亲子同屏开局。',
    suggestDelete: false
  },
  {
    id: 'profile',
    name: '成长档案',
    kind: 'page',
    path: '/profile',
    file: 'src/views/ProfileView.vue',
    reachable: true,
    entries: ['桌面侧栏', '手机/平板底栏'],
    note: '成长中心：段位、错题、商城、家长入口。',
    suggestDelete: false
  },
  {
    id: 'modules',
    name: '模块清单',
    kind: 'page',
    path: '/modules',
    file: 'src/views/ModuleInventoryView.vue',
    reachable: true,
    entries: ['桌面侧栏（成长档案下方）'],
    note: '开发整理页，不进手机底栏。',
    suggestDelete: false
  },
  {
    id: 'adventure',
    name: '主线地图',
    kind: 'page',
    path: '/adventure',
    file: 'src/views/AdventureView.vue',
    reachable: true,
    entries: ['少儿围棋大厅', '今天·继续学'],
    note: '围棋启蒙闯关地图。',
    suggestDelete: false
  },
  {
    id: 'lesson-play',
    name: '关卡实战',
    kind: 'page',
    path: '/lesson/:id',
    file: 'src/views/LessonPlayView.vue',
    reachable: true,
    entries: ['主线地图点关卡', '今天·继续学'],
    note: '单关沉浸对局，无独立 Tab。',
    suggestDelete: false
  },
  {
    id: 'checkers',
    name: '六角跳棋',
    kind: 'page',
    path: '/checkers',
    file: 'src/views/ChineseCheckersView.vue',
    reachable: true,
    entries: ['创建对局', '今天·快捷入口'],
    note: '2–6 人亲子同屏跳棋。',
    suggestDelete: false
  },
  {
    id: 'gomoku',
    name: '欢乐五子棋',
    kind: 'page',
    path: '/gomoku',
    file: 'src/views/GomokuView.vue',
    reachable: true,
    entries: ['创建对局', '今天·快捷入口'],
    note: '五子棋亲子同屏。',
    suggestDelete: false
  },
  {
    id: 'two-player',
    name: '亲子同屏围棋',
    kind: 'page',
    path: '/two-player',
    file: 'src/views/TwoPlayerView.vue',
    reachable: true,
    entries: ['创建对局', '今天·快捷入口'],
    note: '围棋双人同屏。',
    suggestDelete: false
  },
  {
    id: 'tsumego',
    name: '每日死活题',
    kind: 'page',
    path: '/tsumego',
    file: 'src/views/TsumegoView.vue',
    reachable: true,
    entries: ['少儿围棋大厅', '今天·小诺点播', '成长档案'],
    note: '死活训练营。',
    suggestDelete: false
  },
  {
    id: 'dictionary',
    name: '围棋小词典',
    kind: 'page',
    path: '/dictionary',
    file: 'src/views/DictionaryView.vue',
    reachable: true,
    entries: ['少儿围棋大厅'],
    note: '中英双语术语。',
    suggestDelete: false
  },
  {
    id: 'rhymes',
    name: '棋理口诀歌',
    kind: 'page',
    path: '/rhymes',
    file: 'src/views/RhymesView.vue',
    reachable: true,
    entries: ['少儿围棋大厅'],
    note: '口诀卡片与演示。',
    suggestDelete: false
  },
  {
    id: 'mistakes',
    name: '智能错题本',
    kind: 'page',
    path: '/mistakes',
    file: 'src/views/MistakesView.vue',
    reachable: true,
    entries: ['今天·快捷入口', '成长档案', '家长学情空间'],
    note: '错题复习。',
    suggestDelete: false
  },
  {
    id: 'shop',
    name: '装扮商城',
    kind: 'page',
    path: '/shop',
    file: 'src/views/ShopView.vue',
    reachable: true,
    entries: ['成长档案'],
    note: '头像装扮兑换。',
    suggestDelete: false
  },
  {
    id: 'parent-dashboard',
    name: '家长学情空间',
    kind: 'page',
    path: '/parent-dashboard',
    file: 'src/views/ParentDashboardView.vue',
    reachable: true,
    entries: ['桌面侧栏底部', '成长档案横幅'],
    note: '家长看板：亲子一起做、年级双轨、学情摘要。',
    suggestDelete: false
  },
  {
    id: 'admin',
    name: '系统管理后台',
    kind: 'page',
    path: '/admin',
    file: 'src/views/AdminView.vue',
    reachable: true,
    entries: ['成长档案（仅管理员账号）'],
    note: '需登录且 isAdmin。查看家庭数据，不发放新账号。',
    suggestDelete: false
  },
  {
    id: 'ai-tutor',
    name: 'AI 小诺伴学',
    kind: 'overlay',
    file: 'src/components/common/AiTutorFloatModal.vue',
    reachable: true,
    entries: ['全局浮层（多数页面右下角）'],
    note: '全局伴学气泡。',
    suggestDelete: false
  }
];

export function getReachableModules(): ModuleInventoryItem[] {
  return MODULE_INVENTORY.filter((item) => item.reachable);
}

export function getOrphanModules(): ModuleInventoryItem[] {
  return MODULE_INVENTORY.filter((item) => !item.reachable);
}
