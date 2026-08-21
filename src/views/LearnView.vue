<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useUnlockStore } from "../stores/unlockStore";
import { sound } from "../utils/sound";
import { showConfirm } from "../utils/alert";
import {
  Compass,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles
} from "lucide-vue-next";

const router = useRouter();
const unlockStore = useUnlockStore();

const learnFeatures = computed(() => {
  return unlockStore.allFeatures.filter(f => f.category === "learn");
});

const completedCount = computed(() => unlockStore.completedLessonsCount);

const getFeatureStats = (id: string) => {
  if (id === "adventure") {
    return "已通关 " + completedCount.value + " / 22 关 (" + Math.min(100, Math.round((completedCount.value / 22) * 100)) + "%)";
  }
  if (id === "dictionary") {
    return "收录 52 个中英双语围棋术语与图解";
  }
  if (id === "rhymes") {
    return "收录 8 首经典围棋儿歌与棋盘演练";
  }
  return "启蒙天地";
};

const getActionButtonText = (feat: any) => {
  if (!unlockStore.isFeatureUnlocked(feat.id)) return "去解锁";
  if (feat.id === "adventure") return "进入闯关";
  if (feat.id === "dictionary") return "查阅词典";
  if (feat.id === "rhymes") return "朗读口诀";
  return "进入";
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
      title: "暂未解锁该学堂功能",
      message: "小棋手别着急！【" + feature.name + "】需要" + feature.unlockTip + "才能开启哦！快去继续主线闯关吧！",
      type: "warning",
      confirmText: "前往主线闯关",
      cancelText: "知道了"
    }).then(confirmed => {
      if (confirmed) {
        router.push("/adventure");
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
          <span class="text-slate-800 font-black">启蒙学堂</span>
        </div>
      </div>

      <!-- Header Hero Card -->
      <div class="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-5 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div class="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div class="space-y-2 text-center md:text-left">
            <div class="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-black">
              <Compass class="w-3.5 h-3.5" />
              <span>少儿启蒙与趣味学堂 (Learning Hub)</span>
            </div>
            <h1 class="text-2xl sm:text-4xl font-cartoon font-bold tracking-wide drop-shadow-sm">
              启蒙闯关学堂
            </h1>
            <p class="text-xs sm:text-sm text-white/90 font-medium max-w-xl">
              从零基础趣味主线闯关、随身双语小词典到经典棋理口诀儿歌，轻松踏入围棋艺术殿堂！
            </p>
          </div>

          <!-- Learn stats pill -->
          <div class="flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/25">
            <div class="text-center">
              <div class="text-[10px] font-black text-white/80">已开启功能</div>
              <div class="text-xl sm:text-2xl font-black text-white">
                {{ learnFeatures.filter(f => unlockStore.isFeatureUnlocked(f.id)).length }} / {{ learnFeatures.length }}
              </div>
            </div>
            <div class="w-px h-7 bg-white/30"></div>
            <div class="text-center">
              <div class="text-[10px] font-black text-white/80">主线通关</div>
              <div class="text-xs sm:text-sm font-black text-amber-200">
                {{ completedCount }} / 22 关
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Learn Features Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div
          v-for="feat in learnFeatures"
          :key="feat.id"
          @click="handleCardClick(feat)"
          class="relative rounded-3xl p-5 sm:p-6 border-2 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          :class="
            unlockStore.isFeatureUnlocked(feat.id)
              ? 'bg-white border-gray-100 hover:border-emerald-300 shadow-sm hover:shadow-xl transform hover:-translate-y-1 active:scale-98'
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
                  class="w-4 h-4 text-emerald-600"
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
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs hover:from-emerald-600'
                  : 'bg-amber-50 text-amber-900 border border-amber-200'
              "
            >
              <span>{{ getActionButtonText(feat) }}</span>
              <ArrowRight class="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

