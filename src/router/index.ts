import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LearnView from '../views/LearnView.vue';
import LessonPlayView from '../views/LessonPlayView.vue';
import AdventureView from '../views/AdventureView.vue';
import LevelPlayView from '../views/LevelPlayView.vue';
import TsumegoView from '../views/TsumegoView.vue';
import AiMatchView from '../views/AiMatchView.vue';
import FreeBoardView from '../views/FreeBoardView.vue';
import DictionaryView from '../views/DictionaryView.vue';
import ProfileView from '../views/ProfileView.vue';

// 6 New Engaging Modules
import ArcadeView from '../views/ArcadeView.vue';
import CaptureGoView from '../views/CaptureGoView.vue';
import MistakesView from '../views/MistakesView.vue';
import ShopView from '../views/ShopView.vue';
import TwoPlayerView from '../views/TwoPlayerView.vue';
import RhymesView from '../views/RhymesView.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/learn', name: 'learn', component: LearnView },
    { path: '/lesson/:id', name: 'lesson-play', component: LessonPlayView },
    { path: '/adventure', name: 'adventure', component: AdventureView },
    { path: '/adventure/:id', name: 'level-play', component: LevelPlayView },
    { path: '/tsumego', name: 'tsumego', component: TsumegoView },
    { path: '/arcade', name: 'arcade', component: ArcadeView },
    { path: '/capture-go', name: 'capture-go', component: CaptureGoView },
    { path: '/mistakes', name: 'mistakes', component: MistakesView },
    { path: '/shop', name: 'shop', component: ShopView },
    { path: '/two-player', name: 'two-player', component: TwoPlayerView },
    { path: '/rhymes', name: 'rhymes', component: RhymesView },
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

export default router;

