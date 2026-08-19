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
  Sparkles,
  Lock,
  CheckCircle2,
  Trophy,
  Play
} from 'lucide-vue-next';

const router = useRouter();
const showQuestModal = ref(false);
const userStore = useUserStore();
const unlockStore = useUnlockStore();

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

// 4 Core Master Portals
const corePortals = computed(() => [
  {
    path: '/learn',
    title: '启蒙主线闯关',
    titleEn: 'Adventure Map',
    icon: '🗺️',
    badge: '推荐 · 循序渐进',
    badgeColor: 'bg-emerald-500',
    desc: '从数气到手筋，5大篇章25关趣味小故事，带你一步步成为围棋小高手！',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
    stats: '已通关 ' + completedCount.value + ' / ' + totalLessonsCount.value + ' 关'
  },
  {
    path: '/practice',
    title: '练习训练营',
    titleEn: 'Practice Hub',
    icon: '⚡',
    badge: '已解锁 ' + unlockStore.featuresByCategory.practice.filter(f => unlockStore.isFeatureUnlocked(f.id)).length + ' 项',
    badgeColor: 'bg-purple-500',
    desc: '极速反应乐园、46道经典死活题、错题弱点突破与打印题卡！',
    gradient: 'from-purple-400 via-indigo-500 to-rose-500',
    stats: '死活 · 反应 · 错题'
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
    desc: '用金币兑换专属棋盘皮肤与头像，查看段位荣誉证书与棋理口诀！',
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
        router.push('/learn');
      }
    });
    return;
  }
  sound.playButtonSound();
  router.push(feat.route);
};
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-4 sm:py-8 lg:py-10 px-3 sm:px-6 lg:px-8 select-none">
    <div class="max-w-6xl mx-auto space-y-5 sm:space-y-8">
      
      <!-- Top Welcome Hero Banner with Focused Lesson CTA -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 p-4 sm:p-8 lg:p-9 shadow-lg border-2 sm:border-4 border-white">
        <div class="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div class="absolute right-12 top-4 text-3xl sm:text-5xl opacity-20 pointer-events-none">✨</div>

        <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div class="space-y-2 sm:space-y-3 text-center md:text-left w-full md:w-auto">
            <div class="inline-flex items-center gap-1.5 bg-white/30 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full text-[11px] font-black shadow-2xs">
              <Sparkles class="w-3.5 h-3.5" />
              <span>少儿围棋启蒙世界 · 开启聪明大脑</span>
            </div>
            
            <h1 class="text-2xl sm:text-4xl lg:text-5xl font-cartoon font-bold text-white tracking-wider drop-shadow-md">
              欢迎来到 一诺弈学！
            </h1>
            
            <p class="text-white/95 text-xs sm:text-base font-semibold max-w-xl line-clamp-2 sm:line-clamp-none">
              你好，{{ userStore.hasProfile ? userStore.nickname : '小棋手' }}！黑白子就像神奇的精灵，跟着小诺一步一步探索棋盘奥秘吧！
            </p>

            <!-- Primary Task Big Card (Focused & Zero Confusion) -->
            <div class="bg-white/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 border-2 border-white/90 shadow-md text-left mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="space-y-0.5">
                <div class="flex items-center gap-1.5 text-[11px] font-black text-orange-700">
                  <span class="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                  <span>今日推荐主线任务</span>
                </div>
                <div class="text-sm sm:text-base font-black text-gray-900 line-clamp-1">
                  {{ currentNextLesson.title }}
                </div>
                <div class="text-[11px] text-gray-500 font-bold line-clamp-1">
                  {{ currentNextLesson.subtitle }}
                </div>
              </div>

              <button
                @click="handleStartNextLesson"
                class="px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 hover:from-orange-600 text-white font-black text-xs sm:text-sm shadow-md shadow-orange-500/25 transform transition hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
              >
                <Play class="w-4 h-4 fill-current" />
                <span>{{ completedCount > 0 ? '继续闯关' : '开启第一课' }}</span>
                <ArrowRight class="w-4 h-4" />
              </button>
            </div>

            <!-- Quick Action Links -->
            <div class="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 pt-1">
              <button
                @click="showQuestModal = true"
                class="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-black text-xs backdrop-blur-sm border border-white/40 transform transition hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Calendar class="w-3.5 h-3.5" />
                <span>📅 每日打卡任务</span>
              </button>
              <button
                @click="navigate('/learn')"
                class="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-black text-xs backdrop-blur-sm border border-white/40 transform transition hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Gamepad2 class="w-3.5 h-3.5" />
                <span>🗺️ 查看完整关卡地图</span>
              </button>
            </div>
          </div>

          <!-- Mascot Card -->
          <div class="hidden md:flex flex-shrink-0 justify-center">
            <div class="bg-white/90 backdrop-blur-md rounded-3xl p-5 border-2 border-white shadow-xl max-w-xs text-center">
              <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-gradient-to-tr from-amber-300 to-orange-400 p-1 mb-2 shadow flex items-center justify-center">
                <span class="text-4xl sm:text-5xl">🐼</span>
              </div>
              <div class="font-black text-sm sm:text-base text-gray-800">导师 · 小诺</div>
              <p class="text-xs text-orange-600 font-bold mb-3">“今天准备好学一个新吃子妙招了吗？”</p>

              <div class="grid grid-cols-2 gap-2 text-center text-xs font-bold bg-orange-50/80 rounded-xl p-2 border border-orange-100">
                <div>
                  <div class="text-gray-500 text-[10px]">棋力段位</div>
                  <div class="text-amber-800 font-black">{{ userStore.currentRank.title }}</div>
                </div>
                <div>
                  <div class="text-gray-500 text-[10px]">金币余额</div>
                  <div class="text-rose-600 font-black">🪙 {{ userStore.coins }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Growth Milestone Bar (Progressive Lock Indicator) -->
      <div class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-orange-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex-1 w-full space-y-1.5">
          <div class="flex items-center justify-between text-xs font-black text-gray-700">
            <span class="flex items-center gap-1.5 text-gray-800">
              <Trophy class="w-4 h-4 text-amber-500" />
              <span>启蒙闯关总进度</span>
            </span>
            <span class="text-orange-600 font-black">
              已完成 {{ completedCount }} / {{ totalLessonsCount }} 关 ({{ progressPercent }}%)
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5">
            <div
              class="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-full transition-all duration-500 shadow-xs"
              :style="{ width: progressPercent + '%' }"
            ></div>
          </div>
        </div>

        <!-- Next Unlock Goal Pill -->
        <div class="w-full md:w-auto flex-shrink-0">
          <div
            v-if="nextLocked"
            class="bg-amber-50 border border-amber-200 rounded-2xl px-3.5 py-2 flex items-center gap-2 text-xs font-bold text-amber-900 shadow-2xs"
          >
            <Sparkles class="w-4 h-4 text-amber-600 flex-shrink-0 animate-spin" />
            <div class="truncate">
              <span class="text-[10px] text-amber-700 block">下一个解锁目标：</span>
              <span class="font-black text-amber-950">
                通关第 {{ nextLocked.lessonsRequired }} 关解锁【{{ nextLocked.name }}】
              </span>
            </div>
          </div>
          <div
            v-else
            class="bg-emerald-50 border border-emerald-200 rounded-2xl px-3.5 py-2 flex items-center gap-2 text-xs font-black text-emerald-900"
          >
            <CheckCircle2 class="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>🎉 太厉害啦！已解锁全部玩法！</span>
          </div>
        </div>
      </div>

      <!-- 4 Core Master Portals (学、练、战、我的) -->
      <div class="space-y-3 sm:space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl sm:text-2xl">🏛️</span>
            <h2 class="text-lg sm:text-2xl font-cartoon font-bold text-gray-800 tracking-wide">四大核心天地</h2>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div
            v-for="portal in corePortals"
            :key="portal.path"
            @click="navigate(portal.path)"
            class="group bg-white rounded-3xl p-5 border-2 border-gray-100 shadow-xs hover:shadow-xl hover:border-orange-300 transition-all duration-200 transform hover:-translate-y-1 active:scale-95 cursor-pointer flex flex-col justify-between"
          >
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div
                  class="w-12 h-12 rounded-2xl bg-gradient-to-tr p-2 text-white shadow-sm group-hover:rotate-6 transition-transform flex items-center justify-center text-2xl flex-shrink-0"
                  :class="portal.gradient"
                >
                  <span>{{ portal.icon }}</span>
                </div>
                <span
                  class="text-[10px] font-black text-white px-2 py-0.5 rounded-full shadow-2xs whitespace-nowrap"
                  :class="portal.badgeColor"
                >
                  {{ portal.badge }}
                </span>
              </div>

              <div>
                <h3 class="text-base font-black text-gray-900 group-hover:text-orange-600 transition-colors flex items-center justify-between">
                  <span>{{ portal.title }}</span>
                  <ArrowRight class="w-4 h-4 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <span class="text-[10px] font-bold text-gray-400">{{ portal.titleEn }}</span>
              </div>

              <p class="text-xs text-gray-600 font-medium leading-snug line-clamp-2">
                {{ portal.desc }}
              </p>
            </div>

            <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500">
              <span class="truncate text-[11px]">{{ portal.stats }}</span>
              <span class="text-orange-500 font-black group-hover:underline flex-shrink-0">进入 →</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Progressive Feature Showcase Matrix (带上锁与解锁提示) -->
      <div class="space-y-3 sm:space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl sm:text-2xl">🚀</span>
            <h2 class="text-lg sm:text-2xl font-cartoon font-bold text-gray-800 tracking-wide">全功能渐进阶梯</h2>
          </div>
          <span class="text-xs text-gray-500 font-bold">
            解锁进度：{{ unlockStore.unlockedCount }} / {{ unlockStore.allFeatures.length }}
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <div
            v-for="feat in unlockStore.allFeatures"
            :key="feat.id"
            @click="handleFeatureClick(feat)"
            class="relative rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border-2 transition-all duration-200 flex flex-col justify-between cursor-pointer"
            :class="
              unlockStore.isFeatureUnlocked(feat.id)
                ? 'bg-white border-gray-100 hover:border-orange-300 shadow-xs hover:shadow-md transform hover:-translate-y-0.5 active:scale-95'
                : 'bg-gray-50/80 border-gray-200/90 shadow-2xs opacity-75'
            "
          >
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <div
                  class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr p-1 text-white shadow-2xs flex items-center justify-center text-lg flex-shrink-0"
                  :class="feat.gradient"
                >
                  <span>{{ feat.icon }}</span>
                </div>

                <div
                  v-if="!unlockStore.isFeatureUnlocked(feat.id)"
                  class="flex items-center gap-0.5 text-amber-800 text-[10px] font-black bg-amber-100 px-1.5 py-0.5 rounded-full border border-amber-300"
                >
                  <Lock class="w-2.5 h-2.5" />
                  <span>未解锁</span>
                </div>
                <div
                  v-else
                  class="flex items-center gap-0.5 text-emerald-800 text-[10px] font-black bg-emerald-100 px-1.5 py-0.5 rounded-full"
                >
                  <CheckCircle2 class="w-2.5 h-2.5" />
                  <span>开启</span>
                </div>
              </div>

              <div>
                <h4 class="text-xs sm:text-sm font-black text-gray-900 truncate">
                  {{ feat.name }}
                </h4>
                <p class="text-[10px] text-gray-500 font-medium line-clamp-2 mt-0.5">
                  {{ feat.desc }}
                </p>
              </div>
            </div>

            <div class="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold">
              <span v-if="!unlockStore.isFeatureUnlocked(feat.id)" class="text-amber-800 font-black truncate">
                🔒 {{ feat.unlockTip }}
              </span>
              <span v-else class="text-orange-500 font-black truncate">
                立即前往 →
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Daily Quest Modal -->
    <DailyQuestModal
      :isOpen="showQuestModal"
      @close="showQuestModal = false"
    />
  </div>
</template>

