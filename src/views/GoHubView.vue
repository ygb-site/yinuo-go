<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import DailyQuestModal from '../components/common/DailyQuestModal.vue';
import { useUserStore } from '../stores/useUserStore';
import { useUnlockStore } from '../stores/unlockStore';
import { CHAPTERS_DATA, type Lesson } from '../data/chapters';
import { sound } from '../utils/sound';
import { showConfirm } from '../utils/alert';
import {
  Calendar,
  Gamepad2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lock,
  CheckCircle2,
  Trophy,
  Play,
} from 'lucide-vue-next';

const router = useRouter();
const showQuestModal = ref(false);
const userStore = useUserStore();
const unlockStore = useUnlockStore();
const selectedCategory = ref<'all' | 'learn' | 'practice' | 'battle' | 'profile'>('all');

const categoryTabs = computed(() => [
  { id: 'all', name: '全部', count: unlockStore.allFeatures.length },
  { id: 'learn', name: '🧭 启蒙', count: unlockStore.featuresByCategory.learn.length },
  { id: 'practice', name: '🔥 训练', count: unlockStore.featuresByCategory.practice.length },
  { id: 'battle', name: '⚔️ 对弈', count: unlockStore.featuresByCategory.battle.length },
  { id: 'profile', name: '👑 成长', count: unlockStore.featuresByCategory.profile.length }
]);

const displayedFeatures = computed(() => {
  if (selectedCategory.value === 'all') {
    return unlockStore.allFeatures;
  }
  return unlockStore.allFeatures.filter(f => f.category === selectedCategory.value);
});

const getCategoryMeta = (cat: string) => {
  switch (cat) {
    case 'learn':
      return { label: '启蒙', tagClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'practice':
      return { label: '训练', tagClass: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'battle':
      return { label: '对弈', tagClass: 'bg-orange-50 text-orange-700 border-orange-200' };
    case 'profile':
    default:
      return { label: '成长', tagClass: 'bg-pink-50 text-pink-700 border-pink-200' };
  }
};

// Flatten all lessons
const allLessons = computed<Lesson[]>(() => {
  const list: Lesson[] = [];
  for (const c of CHAPTERS_DATA) {
    list.push(...c.lessons);
  }
  return list;
});

// Find the current active lesson the kid should continue
const currentNextLesson = computed<Lesson>(() => {
  const prog = userStore.progress;
  for (const lesson of allLessons.value) {
    if (!prog[lesson.id]?.completed) {
      return lesson;
    }
  }
  return allLessons.value[0];
});

const completedCount = computed(() => unlockStore.completedLessonsCount);
const totalLessonsCount = computed(() => allLessons.value.length);
const progressPercent = computed(() => {
  if (totalLessonsCount.value === 0) return 0;
  return Math.min(100, Math.round((completedCount.value / totalLessonsCount.value) * 100));
});

const nextLocked = computed(() => unlockStore.nextLockedFeature);

const navigate = (path: string) => {
  sound.playButtonSound();
  router.push(path);
};

const handleStartNextLesson = () => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  sound.playButtonSound();
  router.push('/lesson/' + currentNextLesson.value.id);
};

// 4 Core Master Portals (学、练、战、我的)
const corePortals = computed(() => [
  {
    path: '/adventure',
    title: '启蒙主线地图',
    titleEn: 'Adventure Map (22 Lessons)',
    icon: '🧭',
    badge: '已解锁 ' + unlockStore.featuresByCategory.learn.filter(f => unlockStore.isFeatureUnlocked(f.id)).length + ' 项',
    badgeColor: 'bg-emerald-500',
    desc: '趣味主线闯关、双语围棋小词典与经典棋理口诀儿歌！',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
    stats: '主线 · 词典 · 口诀'
  },
  {
    path: '/practice',
    title: '练习训练营',
    titleEn: 'Practice Hub',
    icon: '⚡',
    badge: '已解锁 ' + unlockStore.featuresByCategory.practice.filter(f => unlockStore.isFeatureUnlocked(f.id)).length + ' 项',
    badgeColor: 'bg-purple-500',
    desc: '极速反应乐园、46道死活题、错题突破、打印题卡与自由打谱台！',
    gradient: 'from-purple-400 via-indigo-500 to-rose-500',
    stats: '死活 · 反应 · 错题 · 打谱'
  },
  {
    path: '/battle',
    title: '对弈竞技场',
    titleEn: 'Battle Arena',
    icon: '⚔️',
    badge: '已解锁 ' + unlockStore.featuresByCategory.battle.filter(f => unlockStore.isFeatureUnlocked(f.id)).length + ' 项',
    badgeColor: 'bg-orange-500',
    desc: '先吃1子吃子棋、5只萌宠AI对弈大师、亲子同屏与定段升级考！',
    gradient: 'from-orange-400 via-amber-500 to-yellow-500',
    stats: '吃子 · AI · 双人 · 定段'
  },
  {
    path: '/profile',
    title: '成长中心与商城',
    titleEn: 'Profile & Shop',
    icon: '👑',
    badge: '装扮与成就',
    badgeColor: 'bg-pink-500',
    desc: '用金币兑换专属棋盘皮肤与头像，查看段位荣誉证书与棋力雷达！',
    gradient: 'from-pink-400 via-rose-500 to-purple-500',
    stats: '金币 ' + userStore.coins + ' · 星星 ' + userStore.totalStars
  }
]);

const handleFeatureClick = (feat: any) => {
  const isUnlocked = unlockStore.isFeatureUnlocked(feat.id);
  if (!isUnlocked) {
    sound.playErrorSound();
    showConfirm({
      title: '暂未解锁该玩法',
      message: '小棋手别着急！【' + feat.name + '】需要' + feat.unlockTip + '才能开启哦！快去继续主线闯关吧！',
      type: 'warning',
      confirmText: '前往闯关',
      cancelText: '知道了'
    }).then(confirmed => {
      if (confirmed) {
        router.push('/adventure');
      }
    });
    return;
  }
  sound.playButtonSound();
  router.push(feat.route);
};

const goCampus = () => {
  sound.playButtonSound();
  router.push('/');
};
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-3 sm:py-8 lg:py-10 px-2.5 sm:px-6 lg:px-8 select-none">
    <div class="max-w-6xl mx-auto space-y-4 sm:space-y-8">

      <!-- Navigation breadcrumb / Back to Campus button -->
      <div class="flex items-center justify-between gap-2">
        <button
          @click="goCampus"
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-amber-100/80 hover:bg-amber-200 text-amber-900 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-all active:scale-95 border border-amber-300 shadow-2xs cursor-pointer shrink-0"
        >
          <ArrowLeft class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>返回大厅</span>
        </button>

        <div class="flex items-center gap-1.5 min-w-0">
          <span class="text-[11px] sm:text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 sm:px-3 py-1 rounded-full border border-emerald-200 truncate">
            ♟️ 围棋博弈总馆
          </span>
        </div>
      </div>
      
      <!-- Top Welcome Hero Banner with Focused Lesson CTA -->
      <div class="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 p-4 sm:p-8 lg:p-9 shadow-lg sm:shadow-xl border-2 sm:border-4 border-white">
        <div class="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div class="absolute right-8 top-3 text-3xl sm:text-5xl opacity-20 pointer-events-none">✨</div>

        <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div class="space-y-2 sm:space-y-3 text-center md:text-left w-full md:w-auto">
            <div class="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black shadow-2xs">
              <Sparkles class="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>少儿围棋启蒙世界 · 开启聪明大脑</span>
            </div>
            
            <h1 class="text-xl sm:text-4xl lg:text-5xl font-cartoon font-bold text-white tracking-wider drop-shadow-md">
              一诺奕学 · 围棋博弈馆
            </h1>
            
            <p class="text-white/95 text-xs sm:text-base font-semibold max-w-xl line-clamp-2 leading-relaxed">
              你好，{{ userStore.hasProfile ? userStore.nickname : '小棋手' }}！黑白子就像神奇的精灵，跟着小诺一步一步探索棋盘奥秘吧！
            </p>

            <!-- Primary Task Big Card -->
            <div class="bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 border-2 border-white/90 shadow-md text-left mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="space-y-0.5 min-w-0">
                <div class="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black text-emerald-700">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>今日推荐主线任务</span>
                </div>
                <div class="text-sm sm:text-base font-black text-gray-900 truncate">
                  {{ currentNextLesson.title }}
                </div>
                <div class="text-[10px] sm:text-[11px] text-gray-500 font-bold truncate">
                  {{ currentNextLesson.subtitle }}
                </div>
              </div>

              <button
                @click="handleStartNextLesson"
                class="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-500/25 transform transition hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shrink-0"
              >
                <Play class="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                <span>{{ completedCount > 0 ? '继续闯关' : '开启第一课' }}</span>
                <ArrowRight class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <!-- Quick Action Links -->
            <div class="flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-3 pt-1">
              <button
                @click="showQuestModal = true"
                class="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-black text-[11px] sm:text-xs backdrop-blur-sm border border-white/40 transform transition hover:scale-105 active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
              >
                <Calendar class="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>每日任务</span>
              </button>
              <button
                @click="navigate('/adventure')"
                class="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-black text-[11px] sm:text-xs backdrop-blur-sm border border-white/40 transform transition hover:scale-105 active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
              >
                <Gamepad2 class="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>关卡地图</span>
              </button>
              <button
                @click="navigate('/tsumego')"
                class="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-black text-[11px] sm:text-xs backdrop-blur-sm border border-white/40 transform transition hover:scale-105 active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>🧩 死活题</span>
              </button>
              <button
                @click="navigate('/ai-match')"
                class="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-black text-[11px] sm:text-xs backdrop-blur-sm border border-white/40 transform transition hover:scale-105 active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>🤖 人机对弈</span>
              </button>
            </div>
          </div>

          <!-- Mascot Card -->
          <div class="hidden md:flex flex-shrink-0 justify-center">
            <div class="bg-white/95 backdrop-blur-md rounded-3xl p-5 border-2 border-white shadow-xl max-w-xs text-center">
              <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-300 to-teal-400 p-1 mb-2 shadow-md flex items-center justify-center overflow-hidden border-2 border-white">
                <img src="/logo/logo-avatar-circle-256.png" alt="导师 · 小诺" class="w-full h-full object-contain" />
              </div>
              <div class="font-black text-sm sm:text-base text-gray-800">导师 · 小诺</div>
              <p class="text-xs text-emerald-600 font-bold mb-3">“今天准备好学一个新吃子妙招了吗？”</p>

              <div class="grid grid-cols-2 gap-2 text-center text-xs font-bold bg-emerald-50/80 rounded-xl p-2 border border-emerald-100">
                <div>
                  <div class="text-gray-500 text-[10px]">棋力段位</div>
                  <div class="text-emerald-800 font-black">{{ userStore.currentRank.title }}</div>
                </div>
                <div>
                  <div class="text-gray-500 text-[10px]">金币余额</div>
                  <div class="text-amber-600 font-black">🪙 {{ userStore.coins }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Growth Milestone Bar -->
      <div class="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border-2 border-emerald-100 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        <div class="flex-1 w-full space-y-1 sm:space-y-1.5">
          <div class="flex items-center justify-between text-[11px] sm:text-xs font-black text-gray-700">
            <span class="flex items-center gap-1 sm:gap-1.5 text-gray-800">
              <Trophy class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
              <span>启蒙闯关总进度</span>
            </span>
            <span class="text-emerald-600 font-black">
              已完成 {{ completedCount }}/{{ totalLessonsCount }} 关 ({{ progressPercent }}%)
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="w-full h-2.5 sm:h-3 bg-gray-100 rounded-full overflow-hidden p-0.5">
            <div
              class="h-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 rounded-full transition-all duration-500 shadow-xs"
              :style="{ width: progressPercent + '%' }"
            ></div>
          </div>
        </div>

        <!-- Next Unlock Goal Pill -->
        <div class="w-full md:w-auto flex-shrink-0">
          <div
            v-if="nextLocked"
            class="bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl px-3 py-1.5 sm:px-3.5 sm:py-2 flex items-center gap-2 text-xs font-bold text-amber-900 shadow-2xs min-w-0"
          >
            <Sparkles class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0 animate-spin" />
            <div class="truncate">
              <span class="text-[10px] text-amber-700 block">下一个解锁目标：</span>
              <span class="font-black text-amber-950 text-[11px] sm:text-xs truncate">
                通关第 {{ nextLocked.lessonsRequired }} 关解锁【{{ nextLocked.name }}】
              </span>
            </div>
          </div>
          <div
            v-else
            class="bg-emerald-50 border border-emerald-200 rounded-xl sm:rounded-2xl px-3 py-1.5 sm:px-3.5 sm:py-2 flex items-center gap-2 text-xs font-black text-emerald-900"
          >
            <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
            <span>🎉 太厉害啦！已解锁全部玩法！</span>
          </div>
        </div>
      </div>

      <!-- 4 Core Master Portals -->
      <div class="space-y-2.5 sm:space-y-4">
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <span class="text-lg sm:text-2xl">🏛️</span>
            <h2 class="text-base sm:text-2xl font-cartoon font-bold text-gray-800 tracking-wide">围棋四大核心天地</h2>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div
            v-for="portal in corePortals"
            :key="portal.path"
            @click="navigate(portal.path)"
            class="group bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border-2 border-gray-100 shadow-2xs hover:shadow-xl hover:border-emerald-300 transition-all duration-200 transform hover:-translate-y-1 active:scale-98 cursor-pointer flex flex-col justify-between min-w-0"
          >
            <div class="space-y-2.5 sm:space-y-3">
              <div class="flex items-center justify-between">
                <div
                  class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr p-2 text-white shadow-sm group-hover:rotate-6 transition-transform flex items-center justify-center text-xl sm:text-2xl shrink-0"
                  :class="portal.gradient"
                >
                  <span>{{ portal.icon }}</span>
                </div>
                <span
                  class="text-[9px] sm:text-[10px] font-black text-white px-2 py-0.5 rounded-full shadow-2xs whitespace-nowrap"
                  :class="portal.badgeColor"
                >
                  {{ portal.badge }}
                </span>
              </div>

              <div>
                <h3 class="text-sm sm:text-base font-cartoon font-bold text-gray-900 group-hover:text-emerald-600 transition-colors flex items-center justify-between tracking-wide truncate">
                  <span>{{ portal.title }}</span>
                  <ArrowRight class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <span class="text-[9px] sm:text-[10px] font-bold text-gray-400 truncate block">{{ portal.titleEn }}</span>
              </div>

              <p class="text-xs text-gray-600 font-medium leading-snug line-clamp-2">
                {{ portal.desc }}
              </p>
            </div>

            <div class="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500">
              <span class="truncate text-[10px] sm:text-[11px]">{{ portal.stats }}</span>
              <span class="text-emerald-600 font-black group-hover:underline shrink-0 text-xs">进入 →</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Progressive Feature Showcase Matrix -->
      <div class="space-y-2.5 sm:space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div class="flex items-center gap-2">
            <span class="text-lg sm:text-2xl">🚀</span>
            <div>
              <h2 class="text-base sm:text-2xl font-cartoon font-bold text-gray-800 tracking-wide">围棋全功能阶梯</h2>
              <p class="text-[10px] sm:text-[11px] text-gray-400 font-bold hidden sm:block">包含启蒙、死活、吃子对弈、AI对战、打印习题等全部模式</p>
            </div>
          </div>

          <!-- Category Filter Pills -->
          <div class="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              v-for="tab in categoryTabs"
              :key="tab.id"
              @click="selectedCategory = tab.id as any"
              class="px-2.5 sm:px-3 py-1 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer flex items-center gap-1 shrink-0"
              :class="
                selectedCategory === tab.id
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              "
            >
              <span>{{ tab.name }}</span>
              <span
                class="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 rounded-full"
                :class="selectedCategory === tab.id ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-500'"
              >
                {{ tab.count }}
              </span>
            </button>
          </div>
        </div>

        <!-- 3-Column Responsive Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          <div
            v-for="feat in displayedFeatures"
            :key="feat.id"
            @click="handleFeatureClick(feat)"
            class="relative rounded-2xl sm:rounded-3xl p-4 sm:p-5 border-2 transition-all duration-200 flex flex-col justify-between cursor-pointer group min-w-0"
            :class="
              unlockStore.isFeatureUnlocked(feat.id)
                ? 'bg-white border-gray-100 hover:border-emerald-300 shadow-2xs hover:shadow-xl transform hover:-translate-y-1 active:scale-98'
                : 'bg-gray-50/80 border-gray-200/90 shadow-2xs opacity-80'
            "
          >
            <!-- Top Row: Icon + Category Tag + Badge + Lock Status -->
            <div class="space-y-2.5 sm:space-y-3">
              <div class="flex items-center justify-between gap-2">
                <div
                  class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr p-2 text-white shadow-sm flex items-center justify-center text-xl sm:text-2xl shrink-0 group-hover:rotate-6 transition-transform"
                  :class="feat.gradient"
                >
                  <span>{{ feat.icon }}</span>
                </div>

                <div class="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-end">
                  <span
                    class="text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full border shadow-2xs"
                    :class="getCategoryMeta(feat.category).tagClass"
                  >
                    {{ getCategoryMeta(feat.category).label }}
                  </span>

                  <span
                    class="text-[9px] sm:text-[10px] font-black text-white px-1.5 sm:px-2 py-0.5 rounded-full shadow-2xs"
                    :class="feat.badgeColor"
                  >
                    {{ feat.badge }}
                  </span>

                  <div
                    v-if="!unlockStore.isFeatureUnlocked(feat.id)"
                    class="flex items-center gap-0.5 sm:gap-1 bg-amber-100 text-amber-900 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black border border-amber-300"
                  >
                    <Lock class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-700" />
                    <span>未解锁</span>
                  </div>
                  <div
                    v-else
                    class="flex items-center gap-0.5 sm:gap-1 bg-emerald-100 text-emerald-800 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black"
                  >
                    <CheckCircle2 class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600" />
                    <span>已开启</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="text-sm sm:text-base font-cartoon font-bold text-gray-900 flex items-center justify-between group-hover:text-emerald-600 transition-colors tracking-wide truncate">
                  <span>{{ feat.name }}</span>
                  <ArrowRight
                    v-if="unlockStore.isFeatureUnlocked(feat.id)"
                    class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </h3>
                <div class="text-[10px] sm:text-[11px] font-bold text-gray-400 truncate">{{ feat.nameEn }}</div>
              </div>

              <p class="text-xs text-gray-600 font-medium leading-relaxed line-clamp-2">
                {{ feat.desc }}
              </p>
            </div>

            <!-- Bottom Row: Unlock Rule & CTA -->
            <div class="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold">
              <span
                v-if="!unlockStore.isFeatureUnlocked(feat.id)"
                class="text-amber-700 text-[10px] sm:text-[11px] truncate"
              >
                🔒 {{ feat.unlockTip }}
              </span>
              <span
                v-else
                class="text-emerald-600 text-[10px] sm:text-[11px] truncate"
              >
                ✨ 点击立即畅玩
              </span>

              <span class="text-gray-400 group-hover:text-emerald-600 font-black shrink-0 text-xs ml-1">
                {{ unlockStore.isFeatureUnlocked(feat.id) ? '进入' : '解锁' }} →
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Daily Quest Modal -->
    <DailyQuestModal
      :is-open="showQuestModal"
      @close="showQuestModal = false"
    />
  </div>
</template>

