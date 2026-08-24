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

// ♟️ Go Dedicated Views (Lazy Loaded)
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
const MistakesView = () => import('../views/MistakesView.vue');
const TwoPlayerView = () => import('../views/TwoPlayerView.vue');
const RhymesView = () => import('../views/RhymesView.vue');
const RankExamView = () => import('../views/RankExamView.vue');
const WorksheetView = () => import('../views/WorksheetView.vue');
const ChineseCheckersView = () => import('../views/ChineseCheckersView.vue');
const GomokuView = () => import('../views/GomokuView.vue');

// 📚 Universal Multi-Subject Views (Lazy Loaded)
const SubjectHubView = () => import('../views/SubjectHubView.vue');
const SubjectLearnView = () => import('../views/SubjectLearnView.vue');
const UniversalLessonPlayView = () => import('../views/UniversalLessonPlayView.vue');

// 🔢 Math Specialized Features (Lazy Loaded)
const MathDrillView = () => import('../views/math/MathDrillView.vue');
const MathSpeedView = () => import('../views/math/MathSpeedView.vue');
const TwentyFourView = () => import('../views/math/TwentyFourView.vue');
const SudokuView = () => import('../views/SudokuView.vue');

// 🏮 Chinese Specialized Features (Lazy Loaded)
const ChinesePinyinView = () => import('../views/chinese/ChinesePinyinView.vue');
const ChineseHanziView = () => import('../views/chinese/ChineseHanziView.vue');
const ChinesePoetryView = () => import('../views/chinese/ChinesePoetryView.vue');
const ChineseIdiomView = () => import('../views/chinese/ChineseIdiomView.vue');
const ChineseRiddlesView = () => import('../views/chinese/ChineseRiddlesView.vue');

// 🔤 English Specialized Features (Lazy Loaded)
const EnglishPhonicsView = () => import('../views/english/EnglishPhonicsView.vue');
const EnglishFlashcardsView = () => import('../views/english/EnglishFlashcardsView.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 🌟 Campus Central Hub (学堂大厅)
    { path: '/', name: 'home', component: HomeView },

    // ♟️ Go Dedicated Routes
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
    { path: '/mistakes', name: 'mistakes', component: MistakesView },
    { path: '/two-player', name: 'two-player', component: TwoPlayerView },
    { path: '/rhymes', name: 'rhymes', component: RhymesView },
    { path: '/rank-exam', name: 'rank-exam', component: RankExamView },
    { path: '/worksheet', name: 'worksheet', component: WorksheetView },
    { path: '/ai-match', name: 'ai-match', component: AiMatchView },
    { path: '/free-board', name: 'free-board', component: FreeBoardView },
    { path: '/dictionary', name: 'dictionary', component: DictionaryView },

    // 📚 Multi-Subject Academy Portals
    { path: '/subject/:id', name: 'subject-hub', component: SubjectHubView },
    { path: '/subject/:subjectId/learn', name: 'subject-learn', component: SubjectLearnView },
    { path: '/subject/:subjectId/lesson/:lessonId', name: 'universal-lesson-play', component: UniversalLessonPlayView },

    // 🔢 Math Specialized Features
    { path: '/subject/math/drill', name: 'math-drill', component: MathDrillView },
    { path: '/subject/math/speed', name: 'math-speed', component: MathSpeedView },
    { path: '/subject/math/twenty-four', name: 'math-twenty-four', component: TwentyFourView },
    { path: '/sudoku', name: 'sudoku', component: SudokuView },
    { path: '/subject/math/sudoku', redirect: '/sudoku' },

    // 🏮 Chinese Specialized Features
    { path: '/subject/chinese/pinyin', name: 'chinese-pinyin', component: ChinesePinyinView },
    { path: '/subject/chinese/hanzi', name: 'chinese-hanzi', component: ChineseHanziView },
    { path: '/subject/chinese/poetry', name: 'chinese-poetry', component: ChinesePoetryView },
    { path: '/subject/chinese/idiom', name: 'chinese-idiom', component: ChineseIdiomView },
    { path: '/subject/chinese/riddles', name: 'chinese-riddles', component: ChineseRiddlesView },
    { path: '/riddles', redirect: '/subject/chinese/riddles' },

    // 🔤 English Specialized Features
    { path: '/subject/english/phonics', name: 'english-phonics', component: EnglishPhonicsView },
    { path: '/subject/english/flashcards', name: 'english-flashcards', component: EnglishFlashcardsView },

    // 👑 User Center & Parent Analytics
    { path: '/shop', name: 'shop', component: ShopView },
    { path: '/profile', name: 'profile', component: ProfileView },
    { path: '/parent-dashboard', name: 'parent-dashboard', component: ParentDashboardView },
    { path: '/dashboard', redirect: '/parent-dashboard' },
    { path: '/admin', name: 'admin', component: AdminView },

    // Fallback
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


// 🚀 High Performance Route Preloaders (消除网络延迟，点击秒开)
export const routePreloaders: Record<string, () => Promise<unknown>> = {
  "/": HomeView,
  "/learn": GoHubView,
  "/subject/math": SubjectHubView,
  "/subject/chinese": SubjectHubView,
  "/subject/english": SubjectHubView,
  "/profile": ProfileView,
  "/checkers": ChineseCheckersView,
  "/gomoku": GomokuView,
  "/sudoku": SudokuView,
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
    GoHubView().catch(() => {});
    SubjectHubView().catch(() => {});
    ProfileView().catch(() => {});
    ChineseCheckersView().catch(() => {});
    GomokuView().catch(() => {});
  };

  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(trigger, { timeout: 3000 });
  } else {
    setTimeout(trigger, 1200);
  }
}
