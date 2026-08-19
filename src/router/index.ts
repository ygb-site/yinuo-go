import { createRouter, createWebHistory } from 'vue-router';
import { stopSpeech } from '../utils/speech';
import { useUnlockStore } from '../stores/unlockStore';
import { useUserStore } from '../stores/useUserStore';
import { UNLOCK_FEATURES } from '../data/unlockRules';
import { CHAPTERS_DATA, type Lesson } from '../data/chapters';
import { sound } from '../utils/sound';
import { showAlert } from '../utils/alert';
import HomeView from '../views/HomeView.vue';
import LearnView from '../views/LearnView.vue';
import AdventureView from '../views/AdventureView.vue';
import LessonPlayView from '../views/LessonPlayView.vue';
import PracticeView from '../views/PracticeView.vue';
import BattleView from '../views/BattleView.vue';
import TsumegoView from '../views/TsumegoView.vue';
import AiMatchView from '../views/AiMatchView.vue';
import FreeBoardView from '../views/FreeBoardView.vue';
import DictionaryView from '../views/DictionaryView.vue';
import ProfileView from '../views/ProfileView.vue';

// Engaging Game Modes & Features
import ArcadeView from '../views/ArcadeView.vue';
import CaptureGoView from '../views/CaptureGoView.vue';
import MistakesView from '../views/MistakesView.vue';
import ShopView from '../views/ShopView.vue';
import TwoPlayerView from '../views/TwoPlayerView.vue';
import RhymesView from '../views/RhymesView.vue';
import RankExamView from '../views/RankExamView.vue';
import WorksheetView from '../views/WorksheetView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/learn', name: 'learn', component: LearnView },
    { path: '/adventure', name: 'adventure', component: AdventureView },
    { path: '/lesson/:id', name: 'lesson-play', component: LessonPlayView },
    { path: '/adventure/:id', redirect: to => `/lesson/${to.params.id}` },
    { path: '/practice', name: 'practice', component: PracticeView },
    { path: '/battle', name: 'battle', component: BattleView },
    { path: '/tsumego', name: 'tsumego', component: TsumegoView },
    { path: '/arcade', name: 'arcade', component: ArcadeView },
    { path: '/capture-go', name: 'capture-go', component: CaptureGoView },
    { path: '/mistakes', name: 'mistakes', component: MistakesView },
    { path: '/shop', name: 'shop', component: ShopView },
    { path: '/two-player', name: 'two-player', component: TwoPlayerView },
    { path: '/rhymes', name: 'rhymes', component: RhymesView },
    { path: '/rank-exam', name: 'rank-exam', component: RankExamView },
    { path: '/worksheet', name: 'worksheet', component: WorksheetView },
    { path: '/ai-match', name: 'ai-match', component: AiMatchView },
    { path: '/free-board', name: 'free-board', component: FreeBoardView },
    { path: '/dictionary', name: 'dictionary', component: DictionaryView },
    { path: '/profile', name: 'profile', component: ProfileView },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior() {
    return { top: 0 };
  }
});

router.beforeEach((to) => {
  stopSpeech();
  // 1. Check feature unlock rules
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

  // 2. Check progressive lesson unlock
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
