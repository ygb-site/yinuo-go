import { createRouter, createWebHistory } from 'vue-router';
import { stopSpeech } from '../utils/speech';
import { useUnlockStore } from '../stores/unlockStore';
import { useUserStore } from '../stores/useUserStore';
import { UNLOCK_FEATURES } from '../data/unlockRules';
import { CHAPTERS_DATA, type Lesson } from '../data/chapters';
import { sound } from '../utils/sound';
import { showAlert } from '../utils/alert';

// 🌟 Core Views (Lazy Loaded)
const HomeView = () => import('../views/HomeView.vue');
const ProfileView = () => import('../views/ProfileView.vue');
const ParentDashboardView = () => import('../views/ParentDashboardView.vue');
const AdminView = () => import('../views/AdminView.vue');
const ShopView = () => import('../views/ShopView.vue');
const MistakesView = () => import('../views/MistakesView.vue');

// 📸 K12 Academic Core (Homework & Exam Generator)
const HomeworkAssistantView = () => import('../views/HomeworkAssistantView.vue');
const ExamGeneratorView = () => import('../views/ExamGeneratorView.vue');

// ♟️ Go & Strategy Games (棋艺馆保留)
const GoHubView = () => import('../views/GoHubView.vue');
const AdventureView = () => import('../views/AdventureView.vue');
const LessonPlayView = () => import('../views/LessonPlayView.vue');
const PracticeView = () => import('../views/PracticeView.vue');
const BattleView = () => import('../views/BattleView.vue');
const TsumegoView = () => import('../views/TsumegoView.vue');
const AiMatchView = () => import('../views/AiMatchView.vue');
const FreeBoardView = () => import('../views/FreeBoardView.vue');
const DictionaryView = () => import('../views/DictionaryView.vue');
const ArcadeView = () => import('../views/ArcadeView.vue');
const CaptureGoView = () => import('../views/CaptureGoView.vue');
const TwoPlayerView = () => import('../views/TwoPlayerView.vue');
const RhymesView = () => import('../views/RhymesView.vue');
const RankExamView = () => import('../views/RankExamView.vue');
const WorksheetView = () => import('../views/WorksheetView.vue');
const ChineseCheckersView = () => import('../views/ChineseCheckersView.vue');
const GomokuView = () => import('../views/GomokuView.vue');

// 🧰 Selected Essential Subject Tools (精选保留工具)
const MathDrillView = () => import('../views/math/MathDrillView.vue');
const ChineseHanziView = () => import('../views/chinese/ChineseHanziView.vue');
const EnglishPhonicsView = () => import('../views/english/EnglishPhonicsView.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 🌟 1. Campus Central Hub (学堂首页)
    { path: '/', name: 'home', component: HomeView },

    // 📸 2. K12 Daily Homework & Exam Center
    { path: '/homework', name: 'homework', component: HomeworkAssistantView },
    { path: '/exam', name: 'exam', component: ExamGeneratorView },
    { path: '/mistakes', name: 'mistakes', component: MistakesView },

    // 🧰 3. Preserved Essential Subject Tools
    { path: '/subject/math/drill', name: 'math-drill', component: MathDrillView },
    { path: '/subject/chinese/hanzi', name: 'chinese-hanzi', component: ChineseHanziView },
    { path: '/subject/english/phonics', name: 'english-phonics', component: EnglishPhonicsView },

    // ♟️ 4. Go & Board Games Dedicated Routes (棋艺馆完好保留)
    { path: '/learn', name: 'learn', component: GoHubView },
    { path: '/subject/go', redirect: '/learn' },
    { path: '/adventure', name: 'adventure', component: AdventureView },
    { path: '/lesson/:id', name: 'lesson-play', component: LessonPlayView },
    { path: '/adventure/:id', redirect: to => `/lesson/${to.params.id}` },
    { path: '/practice', name: 'practice', component: PracticeView },
    { path: '/battle', name: 'battle', component: BattleView },
    { path: '/tsumego', name: 'tsumego', component: TsumegoView },
    { path: '/arcade', name: 'arcade', component: ArcadeView },
    { path: '/checkers', name: 'checkers', component: ChineseCheckersView },
    { path: '/gomoku', name: 'gomoku', component: GomokuView },
    { path: '/capture-go', name: 'capture-go', component: CaptureGoView },
    { path: '/two-player', name: 'two-player', component: TwoPlayerView },
    { path: '/rhymes', name: 'rhymes', component: RhymesView },
    { path: '/rank-exam', name: 'rank-exam', component: RankExamView },
    { path: '/worksheet', name: 'worksheet', component: WorksheetView },
    { path: '/ai-match', name: 'ai-match', component: AiMatchView },
    { path: '/free-board', name: 'free-board', component: FreeBoardView },
    { path: '/dictionary', name: 'dictionary', component: DictionaryView },

    // 👑 5. User Center & Parent Analytics
    { path: '/shop', name: 'shop', component: ShopView },
    { path: '/profile', name: 'profile', component: ProfileView },
    { path: '/parent-dashboard', name: 'parent-dashboard', component: ParentDashboardView },
    { path: '/dashboard', redirect: '/parent-dashboard' },
    { path: '/admin', name: 'admin', component: AdminView },

    // Legacy Fallback Redirects (无缝重定向到新中枢，避免死链)
    { path: '/subject/math', redirect: '/subject/math/drill' },
    { path: '/subject/chinese', redirect: '/subject/chinese/hanzi' },
    { path: '/subject/english', redirect: '/subject/english/phonics' },
    { path: '/subject/:id', redirect: '/homework' },
    { path: '/subject/:subjectId/learn', redirect: '/homework' },
    { path: '/subject/:subjectId/lesson/:lessonId', redirect: '/homework' },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior() {
    return { top: 0 };
  }
});

router.beforeEach((to) => {
  stopSpeech();

  // 1. Check Admin Route Access
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

  // 2. Check feature unlock rules for Go features
  const matchedFeature = UNLOCK_FEATURES.find(f => f.route === to.path);
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

  // 3. Check progressive lesson unlock for Go
  if (to.name === 'lesson-play' || to.path.startsWith('/lesson/')) {
    const lessonId = to.params.id as string;
    if (lessonId && lessonId !== 'lesson_1_1' && lessonId !== 'c1_l1') {
      const userStore = useUserStore();
      const allLessons: Lesson[] = [];
      for (const c of CHAPTERS_DATA) {
        allLessons.push(...c.lessons);
      }
      const idx = allLessons.findIndex(l => l.id === lessonId);
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

export default router;

// 🚀 High Performance Route Preloaders
export const routePreloaders: Record<string, () => Promise<unknown>> = {
  "/": HomeView,
  "/homework": HomeworkAssistantView,
  "/exam": ExamGeneratorView,
  "/learn": GoHubView,
  "/mistakes": MistakesView,
  "/profile": ProfileView,
  "/checkers": ChineseCheckersView,
  "/gomoku": GomokuView,
  "/adventure": AdventureView,
  "/battle": BattleView,
  "/tsumego": TsumegoView
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
    HomeworkAssistantView().catch(() => {});
    ExamGeneratorView().catch(() => {});
    GoHubView().catch(() => {});
    ProfileView().catch(() => {});
    MistakesView().catch(() => {});
  };

  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(trigger, { timeout: 3000 });
  } else {
    setTimeout(trigger, 1200);
  }
}

