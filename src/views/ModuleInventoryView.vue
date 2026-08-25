<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  AppBadge,
  AppButton,
  AppCard,
  AppSection
} from '../design-system';
import {
  getOrphanModules,
  getReachableModules,
  type ModuleInventoryItem
} from '../data/moduleInventory';
import { sound } from '../utils/sound';

const router = useRouter();

const reachableModules = computed(() => getReachableModules());
const orphanModules = computed(() => getOrphanModules());
const suggestDeleteCount = computed(
  () => orphanModules.value.filter((item) => item.suggestDelete).length
);

const canOpen = (item: ModuleInventoryItem) => {
  if (!item.path) return false;
  if (item.path.includes(':')) return false;
  if (item.id === 'puzzle-hub') return false;
  return true;
};

const openModule = (item: ModuleInventoryItem) => {
  if (!canOpen(item) || !item.path) return;
  sound.playButtonSound();
  router.push(item.path);
};

const kindLabel = (item: ModuleInventoryItem) => {
  if (item.kind === 'overlay') return '弹层';
  if (item.kind === 'file') return '文件';
  if (item.kind === 'alias') return '别名';
  return '页面';
};
</script>

<template>
  <div class="min-h-full bg-[#F6F3EB] py-4 md:py-6 lg:py-8 px-4 md:px-6 lg:px-8">
    <div class="max-w-5xl mx-auto space-y-6 md:space-y-8">
      <header class="space-y-2">
        <h1 class="text-2xl md:text-3xl font-display font-bold text-slate-900 tracking-tight">
          项目模块清单
        </h1>
        <p class="text-sm text-slate-600 font-medium leading-relaxed">
          用来整理仓库：上面是孩子或家长现在能点进去的功能；下面是已经没有入口、但代码还在的残留。
          这页只列清单，不会自动删除。
        </p>
        <div class="flex flex-wrap gap-2 pt-1">
          <AppBadge variant="success" size="sm">可触达 {{ reachableModules.length }}</AppBadge>
          <AppBadge variant="warning" size="sm">无入口 {{ orphanModules.length }}</AppBadge>
          <AppBadge variant="danger" size="sm">建议删除 {{ suggestDeleteCount }}</AppBadge>
        </div>
      </header>

      <AppSection
        title="可以从页面触达"
        description="侧栏、大厅卡片、档案、弹窗等任意入口能点进去。"
        icon="check-circle"
        tone="growth"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AppCard
            v-for="item in reachableModules"
            :key="item.id"
            variant="outlined"
            padding="sm"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 space-y-1.5">
                <div class="flex flex-wrap items-center gap-1.5">
                  <h2 class="text-sm font-bold text-slate-900">{{ item.name }}</h2>
                  <AppBadge variant="neutral" size="sm">{{ kindLabel(item) }}</AppBadge>
                  <AppBadge v-if="item.hiddenEntry" variant="warning" size="sm">入口偏隐</AppBadge>
                </div>
                <p v-if="item.path" class="text-[11px] font-mono text-slate-500 truncate">
                  {{ item.path }}
                </p>
                <p class="text-xs text-slate-600 leading-relaxed">{{ item.note }}</p>
                <p class="text-[11px] text-slate-500">
                  入口：{{ item.entries.join(' · ') }}
                </p>
                <p class="text-[11px] font-mono text-slate-400 truncate">{{ item.file }}</p>
              </div>
              <AppButton
                v-if="canOpen(item)"
                size="sm"
                variant="secondary"
                @click="openModule(item)"
              >
                打开
              </AppButton>
            </div>
          </AppCard>
        </div>
      </AppSection>

      <AppSection
        title="没有入口，但代码还在"
        description="当前产品导航点不到。整理时优先看「建议删除」。"
        icon="trash"
        tone="challenge"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AppCard
            v-for="item in orphanModules"
            :key="item.id"
            variant="outlined"
            padding="sm"
            accent="challenge"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 space-y-1.5">
                <div class="flex flex-wrap items-center gap-1.5">
                  <h2 class="text-sm font-bold text-slate-900">{{ item.name }}</h2>
                  <AppBadge variant="neutral" size="sm">{{ kindLabel(item) }}</AppBadge>
                  <AppBadge v-if="item.suggestDelete" variant="danger" size="sm">建议删除</AppBadge>
                  <AppBadge v-else variant="info" size="sm">可保留</AppBadge>
                </div>
                <p v-if="item.path" class="text-[11px] font-mono text-slate-500 truncate">
                  {{ item.path }}
                </p>
                <p class="text-xs text-slate-600 leading-relaxed">{{ item.note }}</p>
                <p class="text-[11px] font-mono text-slate-400 truncate">{{ item.file }}</p>
              </div>
              <AppButton
                v-if="canOpen(item)"
                size="sm"
                variant="ghost"
                @click="openModule(item)"
              >
                打开看看
              </AppButton>
            </div>
          </AppCard>
        </div>
      </AppSection>
    </div>
  </div>
</template>
