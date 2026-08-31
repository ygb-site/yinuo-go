import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { stopSpeech } from '../utils/speech';
import { useUnlockStore } from '../stores/unlockStore';
import { useUserStore } from '../stores/useUserStore';
import { useLoadingStore } from '../stores/useLoadingStore';
import { UNLOCK_FEATURES } from '../data/unlockRules';
import { CHAPTERS_DATA, type Lesson } from '../data/chapters';
import { sound } from '../utils/sound';
import { showAlert } from '../utils/alert';

const HomeView = () => import('../views/HomeView.vue');
const ScheduleView = () => import('../views/ScheduleView.vue');
const GoHubView = () => import('../views/GoHubView.vue');
const MatchCreateView = () => import('../views/MatchCreateView.vue');
const ProfileView = () => import('../views/ProfileView.vue');
const ModuleInventoryView = () => import('../views/ModuleInventoryView.vue');

const AdventureView = () => import('../views/AdventureView.vue');
const LessonPlayView = () => import('../views/LessonPlayView.vue');
const TsumegoView = () => import('../views/TsumegoView.vue');
const DictionaryView = () => import('../views/DictionaryView.vue');
const TwoPlayerView = () => import('../views/TwoPlayerView.vue');
const RhymesView = () => import('../views/RhymesView.vue');
const ChineseCheckersView = () => import('../views/ChineseCheckersView.vue');
const GomokuView = () => import('../views/GomokuView.vue');

const MistakesView = () => import('../views/MistakesView.vue');
const ShopView = () => import('../views/ShopView.vue');
const ParentDashboardView = () => import('../views/ParentDashboardView.vue');
const AdminView = () => import('../views/AdminView.vue');

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { mode: 'child', section: 'today', title: '今天', label: '一诺未来学堂' }
  },
  {
    path: '/schedule',
    name: 'schedule',
    component: ScheduleView,
    meta: { mode: 'child', section: 'schedule', title: '课程表', label: '一年级课程表' }
  },
  {
    path: '/learn',
    name: 'learn',
    component: GoHubView,
    meta: { mode: 'child', section: 'learn', title: '少儿围棋', label: '少儿围棋天地' }
  },
  {
    path: '/match',
    name: 'match',
    component: MatchCreateView,
    meta: { mode: 'child', section: 'play', title: '创建对局', label: '创建对局中心' }
  },
  {
    path: '/puzzle',
    redirect: '/match'
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { mode: 'child', section: 'me', title: '成长中心', label: '成长中心' }
  },
  {
    path: '/modules',
    name: 'modules',
    component: ModuleInventoryView,
    meta: { mode: 'child', section: 'lab', title: '模块清单', label: '项目模块清单' }
  },

  {
    path: '/adventure',
    name: 'adventure',
    component: AdventureView,
    meta: { mode: 'child', section: 'learn', title: '主线地图', label: '围棋主线地图' }
  },
  {
    path: '/lesson/:id',
    name: 'lesson-play',
    component: LessonPlayView,
    meta: { mode: 'immersive', section: 'learn', title: '关卡实战', miniStatus: '关卡学习中' }
  },
  {
    path: '/adventure/:id',
    redirect: (to) => `/lesson/${to.params.id}`
  },

  {
    path: '/checkers',
    name: 'checkers',
    component: ChineseCheckersView,
    meta: { mode: 'child', section: 'play', title: '六角跳棋', label: '跳棋对局' }
  },
  {
    path: '/gomoku',
    name: 'gomoku',
    component: GomokuView,
    meta: { mode: 'child', section: 'play', title: '欢乐五子棋', label: '五子棋对局' }
  },
  {
    path: '/two-player',
    name: 'two-player',
    component: TwoPlayerView,
    meta: { mode: 'child', section: 'play', title: '亲子双人对弈', label: '少儿围棋对局' }
  },
  {
    path: '/tsumego',
    name: 'tsumego',
    component: TsumegoView,
    meta: { mode: 'child', section: 'learn', title: '每日死活题', label: '每日死活训练营' }
  },
  { path: '/practice', redirect: '/tsumego' },
  { path: '/battle', redirect: '/learn' },
  {
    path: '/dictionary',
    name: 'dictionary',
    component: DictionaryView,
    meta: { mode: 'child', section: 'learn', title: '围棋小词典', label: '双语围棋词典' }
  },
  {
    path: '/rhymes',
    name: 'rhymes',
    component: RhymesView,
    meta: { mode: 'child', section: 'learn', title: '棋理口诀歌', label: '经典口诀歌' }
  },
  {
    path: '/mistakes',
    name: 'mistakes',
    component: MistakesView,
    meta: { mode: 'child', section: 'me', title: '智能错题本', label: '全科智能错题本' }
  },
  {
    path: '/shop',
    name: 'shop',
    component: ShopView,
    meta: { mode: 'child', section: 'me', title: '装扮商城', label: '装扮商城' }
  },

  {
    path: '/parent-dashboard',
    name: 'parent-dashboard',
    component: ParentDashboardView,
    meta: { mode: 'parent', section: 'parent', title: '家长学情空间', label: '学情看板' }
  },
  {
    path: '/dashboard',
    redirect: '/parent-dashboard'
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    meta: { mode: 'parent', section: 'parent', title: '系统管理', label: '系统管理后台' }
  },

  { path: '/subject/:pathMatch(.*)*', redirect: '/learn' },
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

router.beforeEach((to) => {
  stopSpeech();
  try {
    const loadingStore = useLoadingStore();
    loadingStore.startLoading('小诺正在加载精彩页面...');
  } catch {}

  if (to.path === '/admin') {
    const userStore = useUserStore();
    if (!userStore.isLoggedIn || !userStore.isAdmin) {
      sound.playErrorSound();
      showAlert({
        title: '权限不足',
        message: '管理后台仅限系统管理员账号访问！',
        type: 'warning'
      });
      return '/';
    }
  }

  const matchedFeature = UNLOCK_FEATURES.find((f) => f.route === to.path);
  if (matchedFeature && matchedFeature.lessonsRequired > 0) {
    const unlockStore = useUnlockStore();
    if (!unlockStore.isFeatureUnlocked(matchedFeature.id)) {
      sound.playErrorSound();
      showAlert({
        title: '暂未解锁该玩法',
        message: `小棋手别着急！【${matchedFeature.name}】需要${matchedFeature.unlockTip}才能开启哦！快去继续启蒙主线闯关吧！`,
        type: 'warning'
      });
      return '/learn';
    }
  }

  if (to.name === 'lesson-play' || to.path.startsWith('/lesson/')) {
    const lessonId = to.params.id as string;
    if (lessonId && lessonId !== 'lesson_1_1' && lessonId !== 'c1_l1') {
      const userStore = useUserStore();
      const allLessons: Lesson[] = [];
      for (const c of CHAPTERS_DATA) {
        allLessons.push(...c.lessons);
      }
      const idx = allLessons.findIndex((l) => l.id === lessonId);
      if (idx > 0) {
        const prev = allLessons[idx - 1];
        const isPrevCompleted = !!userStore.progress[prev.id]?.completed;
        if (!isPrevCompleted) {
          sound.playErrorSound();
          showAlert({
            title: '关卡尚未解锁',
            message: `小棋手需要先通关【${prev.title}】才能解锁并挑战这一关哦！`,
            type: 'warning'
          });
          return '/learn';
        }
      }
    }
  }
});

router.afterEach((to) => {
  const title = (to.meta.title as string) || '一诺未来学堂';
  document.title = `${title} · 一诺未来学堂`;
  try {
    const loadingStore = useLoadingStore();
    loadingStore.finishLoading();
  } catch {}
});

export default router;

export const routePreloaders: Record<string, () => Promise<unknown>> = {
  "/": HomeView,
  "/learn": GoHubView,
  "/match": MatchCreateView,
  "/puzzle": MatchCreateView,
  "/profile": ProfileView,
  "/adventure": AdventureView,
  "/tsumego": TsumegoView,
  "/checkers": ChineseCheckersView,
  "/gomoku": GomokuView,
  "/mistakes": MistakesView,
  "/two-player": TwoPlayerView
};

export function preloadRoute(path: string) {
  const cleanPath = path.split("?")[0];
  const loader = routePreloaders[cleanPath];
  if (loader) {
    loader().catch(() => {});
  }
}

export function preloadCoreRoutes() {
  if (typeof window === "undefined") return;
  const trigger = () => {
    GoHubView().catch(() => {});
    ProfileView().catch(() => {});
    ChineseCheckersView().catch(() => {});
    GomokuView().catch(() => {});
    MistakesView().catch(() => {});
  };

  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(trigger, { timeout: 3000 });
  } else {
    setTimeout(trigger, 1200);
  }
}
