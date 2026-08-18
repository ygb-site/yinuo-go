<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '../../stores/userStore';
import { sound } from '../../utils/sound';
import { Calendar, CheckCircle2, Circle, Sparkles, X, Swords, BookOpen, Puzzle, Zap } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const userStore = useUserStore();
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[9999] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 select-none"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full border-4 border-amber-300 shadow-2xl space-y-4">
      <div class="flex items-center justify-between border-b border-gray-100 pb-3">
        <div class="flex items-center gap-2">
          <Calendar class="w-5 h-5 text-orange-600" />
          <h3 class="text-lg font-black text-gray-900">每日打卡任务</h3>
        </div>
        <button @click="emit('close')" class="p-1.5 rounded-full text-gray-400 hover:bg-gray-100">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="space-y-2.5">
        <div class="bg-orange-50 rounded-2xl p-3 border border-orange-200 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <BookOpen class="w-5 h-5 text-orange-600" />
            <div>
              <div class="text-xs font-black text-gray-900">完成 1 节启蒙闯关</div>
              <div class="text-[10px] text-orange-600 font-bold">奖励: 🪙 +20 / ⭐ +1</div>
            </div>
          </div>
          <span class="text-xs font-bold text-orange-600">进行中</span>
        </div>

        <div class="bg-purple-50 rounded-2xl p-3 border border-purple-200 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Puzzle class="w-5 h-5 text-purple-600" />
            <div>
              <div class="text-xs font-black text-gray-900">解答 2 道死活题</div>
              <div class="text-[10px] text-purple-600 font-bold">奖励: 🪙 +30 / ⚡ +40XP</div>
            </div>
          </div>
          <span class="text-xs font-bold text-purple-600">进行中</span>
        </div>

        <div class="bg-emerald-50 rounded-2xl p-3 border border-emerald-200 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Swords class="w-5 h-5 text-emerald-600" />
            <div>
              <div class="text-xs font-black text-gray-900">进行 1 局对弈</div>
              <div class="text-[10px] text-emerald-600 font-bold">奖励: 🪙 +50 / ⚡ +80XP</div>
            </div>
          </div>
          <span class="text-xs font-bold text-emerald-600">进行中</span>
        </div>
      </div>

      <button
        @click="emit('close')"
        class="w-full py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs shadow-md active:scale-95 cursor-pointer"
      >
        知道了，去完成！
      </button>
    </div>
  </div>
</template>

