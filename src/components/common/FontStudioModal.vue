<script setup lang="ts">
import { ref, computed } from 'vue';
import { useFontStore, type FontTheme, type FontSizeScale, type LetterSpacing } from '../../stores/useFontStore';
import { sound } from '../../utils/sound';
import {
  X,
  Check,
  Sparkles,
  ZoomIn,
  Space
} from 'lucide-vue-next';

const fontStore = useFontStore();
const activeCategory = ref<'all' | 'kids' | 'calligraphy' | 'reading'>('all');

const filteredFonts = computed(() => {
  if (activeCategory.value === 'all') return fontStore.fontOptions;
  return fontStore.fontOptions.filter((f) => f.category === activeCategory.value);
});

const selectFont = (theme: FontTheme) => {
  sound.playButtonSound();
  fontStore.setFontTheme(theme);
};

const selectScale = (scale: FontSizeScale) => {
  sound.playButtonSound();
  fontStore.setFontSizeScale(scale);
};

const selectSpacing = (spacing: LetterSpacing) => {
  sound.playButtonSound();
  fontStore.setLetterSpacing(spacing);
};

const handleClose = () => {
  sound.playButtonSound();
  fontStore.closeModal();
};

const categories = [
  { id: 'all', label: '全部字体 (12款)' },
  { id: 'kids', label: '🧸 少儿萌趣' },
  { id: 'calligraphy', label: '📜 国学书法' },
  { id: 'reading', label: '📖 现代阅读' }
];

const scaleOptions: { id: FontSizeScale; label: string; desc: string }[] = [
  { id: 'compact', label: '紧凑 (95%)', desc: '信息密度高' },
  { id: 'normal', label: '标准 (100%)', desc: '默认适中' },
  { id: 'large', label: '舒适 (110%)', desc: '推荐大屏/平板' },
  { id: 'xl', label: '超大 (120%)', desc: '清晰醒目' }
];

const spacingOptions: { id: LetterSpacing; label: string; desc: string }[] = [
  { id: 'normal', label: '标准间距', desc: '贴合' },
  { id: 'wide', label: '开阔透气', desc: '推荐 · 护眼' },
  { id: 'wider', label: '大幅舒展', desc: '字字分明' }
];
</script>

<template>
  <div
    v-if="fontStore.isModalOpen"
    class="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 select-none"
    @click.self="handleClose"
  >
    <div
      class="bg-[#FDFBF7] w-full max-w-3xl rounded-3xl border-2 border-amber-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
    >
      <!-- Modal Header -->
      <div class="px-5 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-between shrink-0 shadow-sm">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">
            🔤
          </div>
          <div>
            <h2 class="text-base sm:text-xl font-bold tracking-wide">学堂字体与排版中心 (12款字体)</h2>
            <p class="text-xs text-white/90 font-medium">即时切换全站字体风格与字号呼吸感</p>
          </div>
        </div>

        <button
          type="button"
          class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
          @click="handleClose"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Modal Body (Scrollable) -->
      <div class="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">

        <!-- 1. Live Preview Sandbox Box -->
        <div class="p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-amber-200 shadow-xs space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Sparkles class="w-3.5 h-3.5 text-amber-600" />
              <span>实时效果预览 (当前全站实时同步)</span>
            </span>
            <span class="text-[11px] font-semibold text-slate-400">无需刷新 · 即点即换</span>
          </div>

          <!-- Preview Content with current font -->
          <div class="p-3.5 sm:p-4 rounded-xl bg-[#F6F3EB] border border-amber-100 space-y-1.5">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200/80 text-amber-950">
                主线第 5 关
              </span>
              <span class="text-xs text-amber-900 font-bold">围棋启蒙 · 认识黑白棋子</span>
            </div>

            <div class="text-lg sm:text-2xl font-bold text-slate-900">
              早上好，小彩虹！🌱 恭喜通关全部启蒙篇章！
            </div>

            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              今天也来完成一点点思维成长吧，每下一颗棋子都在变聪明！气数与吃子法则已为你备好。
            </p>

            <div class="pt-1 flex items-center gap-2">
              <button class="px-3.5 py-1 rounded-xl bg-orange-500 text-white text-xs font-bold shadow-xs">
                开始挑战 ▶
              </button>
              <span class="text-xs font-semibold text-slate-400">🪙 奖励 +20 金币</span>
            </div>
          </div>
        </div>

        <!-- 2. Font Category Tabs -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            v-for="cat in categories"
            :key="cat.id"
            type="button"
            class="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border"
            :class="[
              activeCategory === cat.id
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'
            ]"
            @click="activeCategory = cat.id as any"
          >
            {{ cat.label }}
          </button>
        </div>

        <!-- 3. Font Family Grid (12 choices with live preview styling) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          <div
            v-for="font in filteredFonts"
            :key="font.id"
            class="p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between"
            :class="[
              fontStore.currentFont === font.id
                ? 'bg-amber-50/90 border-amber-500 shadow-xs'
                : 'bg-white border-slate-200/90 hover:border-amber-300'
            ]"
            @click="selectFont(font.id)"
          >
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <div
                  class="font-bold text-sm text-slate-900 truncate"
                  :style="{ fontFamily: font.fontFamily }"
                >
                  {{ font.name }}
                </div>
                <span
                  class="text-[10px] font-bold px-1.5 py-0.2 rounded-md shrink-0"
                  :class="fontStore.currentFont === font.id ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'"
                >
                  {{ font.badge }}
                </span>
              </div>

              <p class="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                {{ font.desc }}
              </p>
            </div>

            <div class="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span
                class="text-slate-700 font-semibold truncate text-xs"
                :style="{ fontFamily: font.fontFamily }"
              >
                {{ font.sample }}
              </span>
              <span v-if="fontStore.currentFont === font.id" class="text-emerald-600 font-bold shrink-0 ml-1">
                <Check class="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>

        <!-- 4. Size & Scale Slider -->
        <div class="space-y-2 pt-1">
          <label class="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <ZoomIn class="w-4 h-4 text-amber-600" />
            <span>字号大小缩放 (解决字号偏小)</span>
          </label>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              v-for="scale in scaleOptions"
              :key="scale.id"
              type="button"
              class="p-2 rounded-xl border-2 text-center transition-all cursor-pointer"
              :class="[
                fontStore.fontSizeScale === scale.id
                  ? 'bg-amber-100 text-amber-950 border-amber-500 font-bold shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 font-medium'
              ]"
              @click="selectScale(scale.id)"
            >
              <div class="text-xs font-bold">{{ scale.label }}</div>
              <div class="text-[10px] text-slate-400 mt-0.5">{{ scale.desc }}</div>
            </button>
          </div>
        </div>

        <!-- 5. Letter Spacing -->
        <div class="space-y-2 pt-1">
          <label class="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Space class="w-4 h-4 text-amber-600" />
            <span>字间距与呼吸感 (解决挤在一起)</span>
          </label>

          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="spacing in spacingOptions"
              :key="spacing.id"
              type="button"
              class="p-2 rounded-xl border-2 text-center transition-all cursor-pointer"
              :class="[
                fontStore.letterSpacing === spacing.id
                  ? 'bg-amber-100 text-amber-950 border-amber-500 font-bold shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 font-medium'
              ]"
              @click="selectSpacing(spacing.id)"
            >
              <div class="text-xs font-bold">{{ spacing.label }}</div>
              <div class="text-[10px] text-slate-400 mt-0.5">{{ spacing.desc }}</div>
            </button>
          </div>
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="px-5 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
        <span class="text-[11px] sm:text-xs text-slate-500 font-medium">
          配置已自动保存到本地，下次打开仍然生效
        </span>

        <button
          type="button"
          class="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition cursor-pointer active:scale-95"
          @click="handleClose"
        >
          完成并关闭
        </button>
      </div>
    </div>
  </div>
</template>


