<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/useUserStore';
import { playButtonSound, playCoinSound, triggerConfetti } from '../../lib/audio';
import { showAlert } from '../../utils/alert';
import {
  CheckCircle2,
  Gift,
  Zap,
  Puzzle,
  Swords,
  X,
  Flame
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const router = useRouter();
const userStore = useUserStore();

// Today date string (YYYY-MM-DD)
const streakDays = computed(() => {
  return ((userStore.currentProfile.stats.gamesPlayed + userStore.solvedPuzzles.length) % 7) + 1;
});

const quests = computed(() => [
  {
    id: 'tsumego',
    title: '每日死活修行',
    desc: '在每日死活中成功攻克 1 道死活题',
    icon: Puzzle,
    reward: 15,
    completed: userStore.solvedPuzzles.length > 0,
    actionPath: '/tsumego'
  },
  {
    id: 'arcade',
    title: '极速反应特训',
    desc: '在反应乐园中完成 1 局 60 秒限时挑战',
    icon: Zap,
    reward: 15,
    completed: (userStore.arcadeHighScores.speedCapture || 0) > 0,
    actionPath: '/arcade'
  },
  {
    id: 'match',
    title: '实战切磋对弈',
    desc: '完成 1 局吃子棋或人机对战',
    icon: Swords,
    reward: 20,
    completed: (userStore.captureGoStats.matches || 0) > 0 || userStore.stats.gamesPlayed > 0,
    actionPath: '/capture-go'
  }
]);

const completedQuestsCount = computed(() => {
  return quests.value.filter(q => q.completed).length;
});

const isAllQuestsCompleted = computed(() => completedQuestsCount.value === 3);

const handleGoQuest = (path: string) => {
  playButtonSound();
  emit('close');
  router.push(path);
};

const handleClaimAll = () => {
  userStore.addCoins(50);
  userStore.addExp(80);
  playCoinSound();
  triggerConfetti();
  showAlert({ message: '恭喜完成今日全部任务！获得额外 50 金币与 80 经验全勤大礼包！', type: 'success', title: '🎉 全勤大奖达成' });
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[9999] overflow-y-auto bg-black/65 backdrop-blur-md select-none animate-fade-in flex items-center justify-center p-4"
      @click.self="emit('close')"
    >
      <div class="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border-4 border-amber-300 text-left space-y-5 animate-pop-in">
        
        <!-- Close Button -->
        <button
          @click="emit('close')"
          class="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
        >
          <X class="w-5 h-5" />
        </button>

        <!-- Header -->
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-sm text-white flex-shrink-0">
            📅
          </div>
          <div>
            <div class="inline-flex items-center gap-1.5 text-xs font-black text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">
              <Flame class="w-3.5 h-3.5 fill-current text-orange-500" />
              <span>已连续打卡 {{ streakDays }} 天</span>
            </div>
            <h2 class="text-xl font-black text-gray-900 mt-0.5">每日成长任务与打卡日历</h2>
          </div>
        </div>

        <!-- 7-Day Stamp Card -->
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-orange-200 space-y-2">
          <div class="text-[11px] font-black text-amber-900 flex items-center justify-between">
            <span>7天连续打卡小红花：</span>
            <span class="text-orange-600">第 7 天赠神秘宝箱 🎁</span>
          </div>

          <div class="grid grid-cols-7 gap-1.5">
            <div
              v-for="d in 7"
              :key="d"
              class="p-2 rounded-xl text-center border transition"
              :class="
                d <= streakDays
                  ? 'bg-gradient-to-tr from-orange-400 to-rose-500 text-white border-transparent shadow-xs font-black'
                  : 'bg-white/80 border-orange-100 text-gray-400'
              "
            >
              <div class="text-[10px] font-bold">第{{ d }}天</div>
              <div class="text-base my-0.5">{{ d <= streakDays ? '🌸' : '⚪' }}</div>
              <div class="text-[9px] font-black opacity-90">{{ d === 7 ? '宝箱' : '+15币' }}</div>
            </div>
          </div>
        </div>

        <!-- Daily 3 Tasks -->
        <div class="space-y-2.5">
          <div class="text-xs font-black text-gray-500 uppercase tracking-wide flex items-center justify-between">
            <span>今日每日目标</span>
            <span class="text-orange-600 font-bold">{{ completedQuestsCount }} / 3 完成</span>
          </div>

          <div
            v-for="q in quests"
            :key="q.id"
            class="p-3.5 rounded-2xl border-2 transition flex items-center justify-between gap-3"
            :class="q.completed ? 'bg-emerald-50/70 border-emerald-300' : 'bg-white border-gray-100'"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                :class="q.completed ? 'bg-emerald-500 text-white' : 'bg-orange-50 text-orange-600 border border-orange-200'"
              >
                <component :is="q.icon" class="w-5 h-5" />
              </div>
              <div>
                <div class="font-black text-sm text-gray-900 flex items-center gap-1.5">
                  <span>{{ q.title }}</span>
                  <span class="text-[10px] font-black text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded-full">
                    +{{ q.reward }} 币
                  </span>
                </div>
                <div class="text-xs text-gray-500 font-medium">{{ q.desc }}</div>
              </div>
            </div>

            <button
              v-if="!q.completed"
              @click="handleGoQuest(q.actionPath)"
              class="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black transition active:scale-95 whitespace-nowrap cursor-pointer shadow-xs"
            >
              去完成 →
            </button>
            <span v-else class="text-emerald-700 font-black text-xs flex items-center gap-1 flex-shrink-0">
              <CheckCircle2 class="w-4 h-4 text-emerald-600" /> 已达成
            </span>
          </div>
        </div>

        <!-- Claim All Bonus Button -->
        <button
          v-if="isAllQuestsCompleted"
          @click="handleClaimAll"
          class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 text-white font-black text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer animate-bounce-subtle"
        >
          <Gift class="w-4 h-4" />
          <span>领取今日全勤通关大奖 (+50金币) 🎁</span>
        </button>

      </div>
    </div>
  </Teleport>
</template>

