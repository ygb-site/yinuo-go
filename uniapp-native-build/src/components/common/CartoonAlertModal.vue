<script setup lang="ts">
import { computed } from 'vue';
import { alertState, handleAlertConfirm, handleAlertCancel } from '../../utils/alert';
import {
  AlertTriangle,
  CheckCircle2,
  Coins,
  Sparkles,
  Trash2
} from 'lucide-vue-next';

const iconInfo = computed(() => {
  switch (alertState.value.type) {
    case 'coin':
      return { emoji: '🪙', icon: Coins, color: 'text-amber-500', bg: 'bg-amber-100 border-amber-300' };
    case 'success':
      return { emoji: '🎉', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100 border-emerald-300' };
    case 'warning':
    case 'error':
      return { emoji: '⚠️', icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-100 border-rose-300' };
    case 'delete':
      return { emoji: '🗑️', icon: Trash2, color: 'text-rose-500', bg: 'bg-rose-100 border-rose-300' };
    default:
      return { emoji: '🐼', icon: Sparkles, color: 'text-orange-500', bg: 'bg-orange-100 border-orange-300' };
  }
});
</script>

<template>
  
    <div
      v-if="alertState.isOpen"
      class="fixed inset-0 z-[10000] overflow-y-auto bg-black/60 backdrop-blur-md select-none animate-fade-in flex items-center justify-center p-4"
      @click.self="handleAlertCancel"
    >
      <div
        class="relative w-full max-w-sm transform rounded-3xl bg-white p-6 text-center shadow-2xl border-4 border-amber-300 transition-all animate-pop-in space-y-4"
      >
        <!-- Top Animated Emoji Badge -->
        <div class="relative -mt-12 mb-1 flex justify-center">
          <div
            class="w-16 h-16 rounded-2xl p-1 shadow-lg border-2 border-white flex items-center justify-center text-3xl animate-bounce-subtle"
            :class="iconInfo.bg"
          >
            <span>{{ iconInfo.emoji }}</span>
          </div>
        </div>

        <!-- Title -->
        <div class="space-y-1">
          <h3 class="text-lg font-black text-gray-900 font-cartoon tracking-wide">
            {{ alertState.title }}
          </h3>
          <p class="text-xs sm:text-sm text-gray-600 font-bold leading-relaxed px-2">
            {{ alertState.message }}
          </p>
        </div>

        <!-- Buttons -->
        <div class="flex gap-2.5 pt-2">
          <!-- Cancel Button if showCancel is true -->
          <button
            v-if="alertState.showCancel"
            type="button"
            @click="handleAlertCancel"
            class="flex-1 py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs sm:text-sm transition active:scale-95 cursor-pointer"
          >
            {{ alertState.cancelText }}
          </button>

          <!-- Confirm Button -->
          <button
            type="button"
            @click="handleAlertConfirm"
            class="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>{{ alertState.confirmText }}</span>
          </button>
        </div>

      </div>
    </div>
  
</template>


