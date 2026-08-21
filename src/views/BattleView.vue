<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUnlockStore } from '../stores/unlockStore';
import { useUserStore } from '../stores/useUserStore';
import { sound } from '../utils/sound';
import { showConfirm } from '../utils/alert';
import {
  Swords,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles
} from 'lucide-vue-next';

const router = useRouter();
const unlockStore = useUnlockStore();
const userStore = useUserStore();

const battleFeatures = computed(() => {
  return unlockStore.allFeatures.filter(f => f.category === 'battle');
});

const getFeatureStats = (id: string) => {
  if (id === 'capture-go') {
    return '已获胜 ' + (userStore.captureGoStats?.wins || 0) + ' 场 / 总对局 ' + (userStore.captureGoStats?.matches || 0) + ' 场';
  }
  if (id === 'ai-match') {
    return 'AI胜率 ' + (userStore.stats?.gamesWon || 0) + ' 胜 / ' + (userStore.stats?.gamesPlayed || 0) + ' 局';
  }
  if (id === 'two-player') {
    return '支持 5x5 到 13x13 盘面';
  }
  if (id === 'rank-exam') {
    return '10题综合定段测评';
  }
  return '对局模式';
};

const goBack = () => {
  sound.playButtonSound();
  router.push('/learn');
};

const handleCardClick = (feature: any) => {
  const isUnlocked = unlockStore.isFeatureUnlocked(feature.id);
  if (!isUnlocked) {
    sound.playErrorSound();
    showConfirm({
      title: '暂未解锁该对弈模式',
      message: '小棋手别着急！【' + feature.name + '】需要' + feature.unlockTip + '才能开启哦！快去继续主线闯关吧！',
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
  router.push(feature.route);
};
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-4 sm:py-8 lg:py-10 px-3 sm:px-6 lg:px-8 select-none">
    <div class="max-w-6xl mx-auto space-y-5 sm:space-y-8">

      <!-- Breadcrumb & Back to Go Hub -->
      <div class="flex items-center justify-between">
        <button
          @click="goBack"
          class="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-100/80 hover:bg-amber-200 text-amber-900 rounded-2xl text-xs sm:text-sm font-black transition-all active:scale-95 border border-amber-300 shadow-2xs cursor-pointer"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>返回围棋馆</span>
        </button>

        <div class="flex items-center gap-2 text-xs font-bold text-slate-500">
          <button @click="router.push('/')" class="hover:text-amber-600 hover:underline">学堂大厅</button>
          <span>/</span>
          <button @click="router.push('/learn')" class="hover:text-amber-600 hover:underline">围棋馆</button>
          <span>/</span>
          <span class="text-slate-800 font-black">对弈竞技场</span>
        </div>
      </div>

      <!-- Header Hero Card -->
      <div class="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-5 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div class="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div class="space-y-2 text-center md:text-left">
            <div class="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-black">
              <Swords class="w-3.5 h-3.5" />
              <span>实战对抗与等级考 (Battle Arena)</span>
            </div>
            <h1 class="text-2xl sm:text-4xl font-cartoon font-bold tracking-wide drop-shadow-sm">
              对弈实战竞技场
            </h1>
            <p class="text-xs sm:text-sm text-white/90 font-medium max-w-xl">
              从极简吃子棋破冰、5只萌宠AI大师到亲子面对面与少儿定级考，在实战对局中检验棋艺！
            </p>
          </div>

          <!-- Battle stats pill -->
          <div class="flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/25">
            <div class="text-center">
              <div class="text-[10px] font-black text-white/80">已解锁模式</div>
              <div class="text-xl sm:text-2xl font-black text-white">
                {{ battleFeatures.filter(f => unlockStore.isFeatureUnlocked(f.id)).length }} / {{ battleFeatures.length }}
              </div>
            </div>
            <div class="w-px h-7 bg-white/30"></div>
            <div class="text-center">
              <div class="text-[10px] font-black text-white/80">当前段位</div>
              <div class="text-xs sm:text-sm font-black text-amber-200">
                {{ userStore.currentRank.title }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Battle Modes Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
        <div
          v-for="feat in battleFeatures"
          :key="feat.id"
          @click="handleCardClick(feat)"
          class="relative rounded-3xl p-5 sm:p-6 border-2 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          :class="
            unlockStore.isFeatureUnlocked(feat.id)
              ? 'bg-white border-gray-100 hover:border-orange-300 shadow-sm hover:shadow-xl transform hover:-translate-y-1 active:scale-98'
              : 'bg-gray-50/80 border-gray-200/90 shadow-2xs opacity-80'
          "
        >
          <!-- Top Row: Icon + Badge + Lock Status -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div
                class="w-12 h-12 rounded-2xl bg-gradient-to-tr p-2 text-white shadow-sm flex items-center justify-center text-2xl flex-shrink-0"
                :class="feat.gradient"
              >
                <span>{{ feat.icon }}</span>
              </div>

              <div class="flex items-center gap-1.5">
                <span
                  class="text-[10px] font-black text-white px-2.5 py-0.5 rounded-full shadow-2xs"
                  :class="feat.badgeColor"
                >
                  {{ feat.badge }}
                </span>

                <div
                  v-if="!unlockStore.isFeatureUnlocked(feat.id)"
                  class="flex items-center gap-1 bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-[10px] font-black border border-amber-300"
                >
                  <Lock class="w-3 h-3 text-amber-700" />
                  <span>未解锁</span>
                </div>
                <div
                  v-else
                  class="flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-black"
                >
                  <CheckCircle2 class="w-3 h-3 text-emerald-600" />
                  <span>已开启</span>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-base sm:text-lg font-black text-gray-900 flex items-center justify-between">
                <span>{{ feat.name }}</span>
                <ArrowRight
                  v-if="unlockStore.isFeatureUnlocked(feat.id)"
                  class="w-4 h-4 text-orange-500"
                />
              </h3>
              <div class="text-[11px] font-bold text-gray-400">{{ feat.nameEn }}</div>
            </div>

            <p class="text-xs text-gray-600 font-medium leading-relaxed">
              {{ feat.desc }}
            </p>
          </div>

          <!-- Bottom Unlock Condition / Action Bar -->
          <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold">
            <div v-if="!unlockStore.isFeatureUnlocked(feat.id)" class="text-amber-800 font-black flex items-center gap-1 text-[11px]">
              <Sparkles class="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span>解锁条件：{{ feat.unlockTip }}</span>
            </div>
            <div v-else class="text-gray-500 font-bold truncate text-[11px]">
              {{ getFeatureStats(feat.id) }}
            </div>

            <button
              class="px-3.5 py-1.5 rounded-xl font-black text-xs transition active:scale-95 flex items-center gap-1 flex-shrink-0 cursor-pointer"
              :class="
                unlockStore.isFeatureUnlocked(feat.id)
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs hover:from-orange-600'
                  : 'bg-amber-50 text-amber-900 border border-amber-200'
              "
            >
              <span>{{ unlockStore.isFeatureUnlocked(feat.id) ? '进入对弈' : '去解锁' }}</span>
              <ArrowRight class="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

