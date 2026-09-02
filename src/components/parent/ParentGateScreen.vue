<script setup lang="ts">
import { AppButton } from '../../design-system';
import { useParentGate } from '../../composables/useParentGate';
import { ShieldCheck } from 'lucide-vue-next';

const { isUnlocked, gateNum1, gateNum2, gateAnswer, gateError, verifyParentGate } = useParentGate();
</script>

<template>
  <div
    v-if="!isUnlocked"
    class="max-w-md mx-auto my-12 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-5"
  >
    <div class="w-14 h-14 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
      <ShieldCheck class="w-8 h-8" />
    </div>

    <div class="space-y-1">
      <h2 class="text-xl font-bold text-slate-900">家长验证安全锁</h2>
      <p class="text-sm text-slate-500">
        为了保护孩子的自主学习环境，进入家长空间请先回答下面的数学题：
      </p>
    </div>

    <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 text-2xl font-bold text-slate-800">
      {{ gateNum1 }} × {{ gateNum2 }} = ?
    </div>

    <div class="space-y-3">
      <input
        v-model="gateAnswer"
        type="number"
        placeholder="请输入计算结果"
        class="w-full h-11 text-center text-lg font-bold border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        @keyup.enter="verifyParentGate"
      />

      <div v-if="gateError" class="text-xs text-rose-500 font-bold">
        计算答案有误，请重新计算新的题目哦！
      </div>

      <AppButton variant="primary" size="lg" block @click="verifyParentGate">
        验证并进入家长空间
      </AppButton>
    </div>
  </div>

  <slot v-else />
</template>
