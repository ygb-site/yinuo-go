<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUnlockStore } from '../../stores/unlockStore';
import { Sparkles, ArrowRight, X, Play } from 'lucide-vue-next';
import { sound } from '../../utils/sound';

const router = useRouter();
const unlockStore = useUnlockStore();

const isOpen = computed(() => unlockStore.showCelebrationModal && !!unlockStore.currentCelebrationFeature);
const feature = computed(() => unlockStore.currentCelebrationFeature);

const handleGoToFeature = () => {
  if (!feature.value) return;
  const route = feature.value.route;
  unlockStore.closeCelebrationModal();
  sound.playButtonSound();
  router.push(route);
};

const handleClose = () => {
  unlockStore.closeCelebrationModal();
  sound.playButtonSound();
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && feature"
      class="fixed inset-0 z-[10000] overflow-hidden bg-black no-scrollbar modal-overlay/70 backdrop-blur-md select-none animate-fade-in flex items-center justify-center p-3 sm:p-4"
      @click.self="handleClose"
    >
      <div
        class="relative w-full max-w-md max-h-[96vh] overflow-y-auto no-scrollbar modal-card transform rounded-3xl bg-white p-6 sm:p-7 text-center shadow-2xl border-4 border-amber-300 transition-all animate-pop-in z-[10001] my-auto"
      >
        <!-- Close Button -->
        <button
          type="button"
          @click="handleClose"
          class="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition cursor-pointer z-10"
          title="关闭"
        >
          <X class="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <!-- Top Mascot & Badge -->
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black mb-3 shadow-md">
          <Sparkles class="w-3.5 h-3.5" />
          <span>里程碑达成 · 新功能解锁</span>
        </div>

        <!-- Big Feature Icon -->
        <div class="relative w-20 h-20 mx-auto my-2 rounded-3xl bg-gradient-to-tr p-1 shadow-lg flex items-center justify-center border-4 border-white" :class="feature.gradient">
          <span class="text-4xl sm:text-5xl animate-bounce">{{ feature.icon }}</span>
        </div>

        <h2 class="text-2xl sm:text-3xl font-cartoon font-bold text-gray-900 tracking-wide mt-2">
          解锁【{{ feature.name }}】！
        </h2>

        <p class="text-xs sm:text-sm font-bold text-orange-600 mt-1">
          {{ feature.nameEn }}
        </p>

        <!-- Feature Description Box -->
        <div class="bg-amber-50/90 rounded-2xl p-3.5 border border-amber-200 text-xs sm:text-sm text-gray-700 font-medium my-4 leading-relaxed text-left space-y-2">
          <p class="font-bold text-amber-950 flex items-center gap-1.5">
            <span>✨</span>
            <span>玩法亮点：</span>
          </p>
          <p class="text-xs text-gray-600 leading-relaxed">
            {{ feature.desc }}
          </p>
        </div>

        <!-- Mascot Quote -->
        <div class="flex items-center gap-2.5 bg-orange-50/80 rounded-2xl p-2.5 border border-orange-100 text-left mb-5">
          <img src="/logo/logo-avatar-circle-144.png" alt="小诺" class="w-8 h-8 rounded-full flex-shrink-0" />
          <p class="text-[11px] sm:text-xs text-orange-950 font-bold leading-tight">
            小诺：“你已经掌握了足够的本领，快来新的天地大显身手吧！”
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-2.5">
          <button
            @click="handleGoToFeature"
            class="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 hover:from-orange-600 text-white font-black shadow-lg shadow-orange-500/25 flex items-center justify-center gap-1.5 transition active:scale-95 text-xs sm:text-sm cursor-pointer"
          >
            <Play class="w-4 h-4 fill-current" />
            <span>立即前往体验</span>
            <ArrowRight class="w-4 h-4" />
          </button>

          <button
            @click="handleClose"
            class="py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition active:scale-95 text-xs sm:text-sm cursor-pointer"
          >
            <span>稍后再玩</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

