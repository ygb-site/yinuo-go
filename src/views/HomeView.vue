<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/useUserStore';
import { CHAPTERS_DATA, type Lesson } from '../data/chapters';
import {
  AppButton,
  AppIcon,
  AppEmptyState
} from '../design-system';
import { sound } from '../utils/sound';
import {
  Calendar
} from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();

// Flatten all lessons in order
const allLessons = computed<Lesson[]>(() => {
  const list: Lesson[] = [];
  for (const c of CHAPTERS_DATA) {
    list.push(...c.lessons);
  }
  return list;
});

// Calculate current active / next lesson to continue
const currentContinueLesson = computed(() => {
  if (!userStore.hasProfile) return null;
  for (const les of allLessons.value) {
    const isCompleted = !!userStore.progress[les.id]?.completed;
    if (!isCompleted) {
      return les;
    }
  }
  return allLessons.value[allLessons.value.length - 1] || null;
});

const totalLessonsCount = computed(() => allLessons.value.length);
const completedLessonsCount = computed(() => {
  return allLessons.value.filter((l) => !!userStore.progress[l.id]?.completed).length;
});

const isAllCompleted = computed(() => {
  return completedLessonsCount.value >= totalLessonsCount.value && totalLessonsCount.value > 0;
});

const overallProgressPercent = computed(() => {
  if (totalLessonsCount.value === 0) return 0;
  return Math.min(100, Math.round((completedLessonsCount.value / totalLessonsCount.value) * 100));
});

const startOrContinueLesson = () => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  sound.playButtonSound();
  if (currentContinueLesson.value) {
    router.push('/lesson/' + currentContinueLesson.value.id);
  } else {
    router.push('/adventure');
  }
};

const navigateTo = (path: string) => {
  sound.playButtonSound();
  router.push(path);
};

const createProfile = () => {
  userStore.openProfileModal();
};

// 4 Sleek Exploration Game Tiles
const quickExplorations = [
  {
    title: '六角跳棋',
    subtitle: '搭桥连跳',
    icon: '⭐',
    iconBg: 'bg-amber-100 text-amber-800 border-amber-200',
    route: '/checkers'
  },
  {
    title: '欢乐五子棋',
    subtitle: '五子连珠',
    icon: '⚪',
    iconBg: 'bg-teal-100 text-teal-800 border-teal-200',
    route: '/gomoku'
  },
  {
    title: '亲子围棋',
    subtitle: '同屏对弈',
    icon: '👥',
    iconBg: 'bg-blue-100 text-blue-800 border-blue-200',
    route: '/two-player'
  },
  {
    title: '智能错题本',
    subtitle: '弱点消灭',
    icon: '📕',
    iconBg: 'bg-rose-100 text-rose-800 border-rose-200',
    route: '/mistakes'
  }
];
</script>

<template>
  <div class="min-h-full bg-[#F6F3EB] py-4 md:py-6 lg:py-8 px-4 md:px-6 lg:px-8 select-none relative overflow-hidden">
    <!-- Atmospheric subtle top glow -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[320px] bg-gradient-to-b from-amber-200/25 via-orange-100/20 to-transparent blur-3xl pointer-events-none" />

    <div class="max-w-5xl mx-auto space-y-5 md:space-y-6 lg:space-y-8 relative z-10">

      <!-- 1. Top Greeting -->
      <div>
        <div class="flex flex-wrap items-center gap-2 mb-1.5">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300/60 rounded-full text-xs font-bold shadow-2xs">
            <Calendar class="w-3.5 h-3.5 text-amber-700" />
            <span>学习第 {{ Math.max(1, userStore.checkInStreak || 1) }} 天</span>
          </span>

          <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300/60 rounded-full text-xs font-bold shadow-2xs">
            <span>🌟</span>
            <span>{{ userStore.currentRank.title }}</span>
          </span>
        </div>

        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-slate-900 tracking-tight">
          早上好，{{ userStore.hasProfile ? userStore.nickname : '小棋手' }}！🌱
        </h1>
        <p class="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
          今天也来完成一点点思维成长吧，每下一颗棋子都在变聪明！
        </p>
      </div>

      <!-- 2. Primary Cockpit Action (Responsive Tablet 2-Col / 3-Col Grid) -->
      <!-- Case A: No Profile -> First Time State -->
      <div v-if="!userStore.hasProfile" class="bg-white rounded-3xl p-8 border-2 border-amber-300 shadow-md">
        <AppEmptyState
          variant="first-time"
          title="创建你的专属学员档案"
          description="小诺准备好陪你一起探索围棋主线故事、益智博弈与思维挑战啦！"
        >
          <template #action>
            <AppButton variant="primary" size="lg" @click="createProfile">
              <template #icon><AppIcon name="user" /></template>
              立即创建档案
            </AppButton>
          </template>
        </AppEmptyState>
      </div>

      <!-- Case B: Main Learning Cockpit Primary Continue Card -->
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        <!-- Main Continue Stage (Left 2 cols on tablet & desktop) -->
        <div
          class="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#FFFDF8] via-[#FFF8EE] to-[#FEEED6] rounded-3xl p-5 sm:p-6 lg:p-7 border-2 border-amber-200/90 shadow-xs flex flex-col justify-between"
        >
          <div class="absolute -right-8 -bottom-8 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
          <div class="absolute right-6 top-6 text-5xl opacity-15 pointer-events-none">🧭</div>

          <div class="space-y-3 relative z-10">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-200/80 text-amber-950 border border-amber-300">
                  {{ isAllCompleted ? '全部通关' : '主线核心' }}
                </span>
                <span class="text-xs text-amber-900 font-bold">
                  第 {{ completedLessonsCount + 1 }} 关 · 围棋启蒙主线
                </span>
              </div>

              <span class="text-xs font-bold text-amber-950 bg-white/80 px-2.5 py-0.5 rounded-full border border-amber-200">
                {{ completedLessonsCount }} / {{ totalLessonsCount }} 关
              </span>
            </div>

            <div>
              <h2 class="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-wide">
                {{ isAllCompleted ? '🎉 恭喜通关全部启蒙篇章！' : currentContinueLesson?.title || '开始第一课' }}
              </h2>
              <p class="text-xs sm:text-sm text-slate-700 font-medium mt-1 leading-relaxed line-clamp-2">
                {{ isAllCompleted ? '你已经掌握了全部基础数气、吃子与死活要领！可以前往对弈场切磋升级！' : currentContinueLesson?.description || '认识棋盘与黑白小精灵' }}
              </p>
            </div>

            <!-- Overall Progress Bar with warm gradient -->
            <div class="space-y-1 pt-1">
              <div class="flex items-center justify-between text-xs font-bold text-slate-600">
                <span>主线通关进度</span>
                <span>{{ overallProgressPercent }}%</span>
              </div>
              <div class="w-full bg-amber-200/50 h-3 rounded-full overflow-hidden p-0.5 border border-amber-300/60">
                <div
                  class="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 h-full rounded-full transition-all duration-300"
                  :style="{ width: overallProgressPercent + '%' }"
                />
              </div>
            </div>
          </div>

          <div class="mt-5 pt-3.5 border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
            <div class="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <span>⏱️</span>
              <span>预计 5~8 分钟 · 趣味沉浸互动</span>
            </div>

            <button
              type="button"
              class="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              @click="startOrContinueLesson"
            >
              <AppIcon name="play-action" size="sm" />
              <span>{{ isAllCompleted ? '复习精彩关卡' : '继续今天的一课' }}</span>
              <span>▶</span>
            </button>
          </div>
        </div>

        <!-- Right 1 col: Today Growth Summary -->
        <div class="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div class="space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 class="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <span>✨</span>
                <span>成长概览</span>
              </h3>
              <button
                type="button"
                class="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                @click="navigateTo('/profile')"
              >
                查看档案 →
              </button>
            </div>

            <div class="space-y-2">
              <button
                type="button"
                class="w-full flex items-center justify-between p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 hover:border-blue-300 hover:bg-blue-50 transition cursor-pointer"
                @click="navigateTo('/tsumego')"
              >
                <span class="text-xs font-bold text-slate-600">累计攻克死活</span>
                <span class="text-xs sm:text-sm font-bold text-blue-900">{{ userStore.solvedPuzzles?.length || 0 }} 题</span>
              </button>
              <button
                type="button"
                class="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-50/70 border border-rose-100 hover:border-rose-300 hover:bg-rose-50 transition cursor-pointer"
                @click="navigateTo('/mistakes')"
              >
                <span class="text-xs font-bold text-slate-600">待消灭错题</span>
                <span class="text-xs sm:text-sm font-bold" :class="(userStore.mistakes?.length || 0) > 0 ? 'text-rose-600' : 'text-emerald-700'">
                  {{ (userStore.mistakes?.length || 0) > 0 ? (userStore.mistakes?.length + ' 处') : '0 (无弱点 ✓)' }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Smart Companion Recommendation -->
      <div v-if="userStore.hasProfile" class="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-5 sm:p-6 border-2 border-blue-200/80 shadow-2xs">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-white text-2xl flex items-center justify-center shadow-xs shrink-0 border border-blue-200">
              🐼
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base sm:text-lg font-bold text-slate-900">小诺助教的今日点播</h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-200 text-blue-900">智能推荐</span>
              </div>
              <p class="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                小诺发现多做死活手筋能迅速提升大局观！今天我们来挑战一道“做眼与破眼”必修题吧！
              </p>
            </div>
          </div>

          <button
            type="button"
            class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition active:scale-95 shrink-0 w-full sm:w-auto cursor-pointer"
            @click="navigateTo('/tsumego')"
          >
            开始死活挑战 →
          </button>
        </div>
      </div>

      <!-- 5. Quick Arenas (2x2 on Mobile, 4-col on Tablet/Desktop) -->
      <div v-if="userStore.hasProfile" class="space-y-3">
        <div class="flex items-center justify-between px-1">
          <h2 class="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>🎲</span>
            <span>棋艺与益智探索</span>
          </h2>
          <span class="text-xs font-bold text-slate-400">
            跳棋 · 五子棋 · AI对弈 · 错题本
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            v-for="item in quickExplorations"
            :key="item.title"
            class="bg-white rounded-2xl p-3.5 border-2 border-slate-200/90 hover:border-amber-300 hover:shadow-md transition cursor-pointer flex items-center gap-3 transform hover:-translate-y-0.5 active:scale-95"
            @click="navigateTo(item.route)"
          >
            <div
              class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border"
              :class="item.iconBg"
            >
              {{ item.icon }}
            </div>
            <div class="min-w-0">
              <div class="text-xs sm:text-sm font-bold text-slate-900 truncate">{{ item.title }}</div>
              <div class="text-[11px] text-slate-400 font-semibold truncate">{{ item.subtitle }}</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

