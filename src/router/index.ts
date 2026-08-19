import { createRouter, createWebHashHistory } from 'vue-router';
import { stopSpeech } from '../utils/speech';
import HomeView from '../views/HomeView.vue';
import LearnView from '../views/LearnView.vue';
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
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/learn', name: 'learn', component: LearnView },
    { path: '/lesson/:id', name: 'lesson-play', component: LessonPlayView },
    { path: '/adventure', redirect: '/learn' },
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

router.beforeEach(() => {
  stopSpeech();
});

export default router;

