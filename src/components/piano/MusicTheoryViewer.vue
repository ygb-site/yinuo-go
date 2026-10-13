<script setup lang="ts">
import { ref, computed } from 'vue';
import { COMPREHENSIVE_MUSIC_THEORY, type TheorySection } from '../../data/musicTheoryData';
import StaffCanvas from './StaffCanvas.vue';
import { TREBLE_STAFF_NOTES } from '../../data/pianoStaffData';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Music2,
  ChevronRight
} from 'lucide-vue-next';

const sections = COMPREHENSIVE_MUSIC_THEORY;
const activeSectionId = ref<string>('stem_direction'); // Default directly to stem direction or staff skeleton!

const currentSection = computed<TheorySection>(() => {
  return sections.find(s => s.id === activeSectionId.value) || sections[0];
});

// Interactive visual demo for stem direction
const stemDemoType = ref<'below' | 'above' | 'on'>('above');
const stemDemoNote = computed(() => {
  if (stemDemoType.value === 'below') {
    // Note on 1st line (E4, stepOffset = -4) -> stem up
    return TREBLE_STAFF_NOTES.find(n => n.pitch === 'E4') || TREBLE_STAFF_NOTES[4];
  }
  if (stemDemoType.value === 'above') {
    // Note on 4th line (D5, stepOffset = +2) -> stem down
    return TREBLE_STAFF_NOTES.find(n => n.pitch === 'D5') || TREBLE_STAFF_NOTES[10];
  }
  // Note on 3rd line (B4, stepOffset = 0) -> stem down/up
  return TREBLE_STAFF_NOTES.find(n => n.pitch === 'B4') || TREBLE_STAFF_NOTES[8];
});
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <!-- Category Navigation Bar (Horizontally scrollable with clear badges) -->
    <div class="bg-white rounded-3xl p-3 sm:p-4 border-2 border-slate-200/90 shadow-sm">
      <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        <button
          v-for="sec in sections"
          :key="sec.id"
          type="button"
          class="px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 border"
          :class="[
            activeSectionId === sec.id
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm scale-102 font-extrabold'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
          ]"
          @click="activeSectionId = sec.id"
        >
          <span>{{ sec.icon }}</span>
          <span>{{ sec.shortTitle }}</span>
          <span
            v-if="sec.badge"
            class="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
            :class="activeSectionId === sec.id ? 'bg-indigo-500 text-white' : 'bg-slate-200/80 text-slate-600'"
          >
            {{ sec.badge }}
          </span>
        </button>
      </div>
    </div>

    <!-- Main Content Area for Active Theory Topic -->
    <div class="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200/90 shadow-sm space-y-7 animate-fade-in">
      <!-- Section Title & Lead -->
      <div class="border-b border-slate-100 pb-5 space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2.5">
            <span class="text-3xl">{{ currentSection.icon }}</span>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-lg sm:text-xl font-black text-slate-900">{{ currentSection.title }}</h3>
                <span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  {{ currentSection.category }}
                </span>
              </div>
              <p class="text-xs text-slate-400 font-bold mt-0.5">小汤 1 · 小汤 2 · 拜厄 · 音基核心通识</p>
            </div>
          </div>
        </div>

        <p class="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed bg-amber-50/60 p-4 rounded-2xl border border-amber-200/70">
          💡 {{ currentSection.lead }}
        </p>
      </div>

      <!-- Specialized Interactive Visualization for Stem Direction (符干朝向规律专区) -->
      <div
        v-if="currentSection.id === 'stem_direction'"
        class="p-5 sm:p-6 rounded-3xl bg-indigo-50/60 border-2 border-indigo-200/80 space-y-4"
      >
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span class="text-xl">📍</span>
            <h4 class="text-sm sm:text-base font-black text-indigo-950">符干朝向互动图解（第三线黄金分水岭）</h4>
          </div>
          <div class="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-indigo-200">
            <button
              type="button"
              class="px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer"
              :class="stemDemoType === 'below' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'"
              @click="stemDemoType = 'below'"
            >
              三线以下 (朝上 像 d)
            </button>
            <button
              type="button"
              class="px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer"
              :class="stemDemoType === 'above' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'"
              @click="stemDemoType = 'above'"
            >
              三线以上 (朝下 像 p)
            </button>
            <button
              type="button"
              class="px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer"
              :class="stemDemoType === 'on' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'"
              @click="stemDemoType = 'on'"
            >
              正踩三线 (两皆可)
            </button>
          </div>
        </div>

        <!-- Live Staff Render -->
        <div class="p-3 bg-white rounded-2xl border border-indigo-100 flex flex-col items-center shadow-xs">
          <StaffCanvas
            clef="treble"
            :active-note="stemDemoNote"
            :show-note-name="true"
            :show-position-badge="true"
            :height="160"
          />
        </div>

        <!-- Explanation for Stem Demo -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
          <div class="p-3.5 rounded-2xl bg-white border border-indigo-200/90 space-y-1">
            <div class="text-indigo-900 font-black">
              {{ stemDemoType === 'below' ? 'd 型：向上伸' : stemDemoType === 'above' ? 'p 型：向下垂' : '随邻居走向' }}
            </div>
            <p class="text-slate-600 font-medium">
              {{
                stemDemoType === 'below'
                  ? '当前音在第一线 (E4)，低于第三线。符干长在符头右边，笔直向上伸展，像小写字母 d。'
                  : stemDemoType === 'above'
                  ? '当前音在第四线 (D5)，高于第三线。符干长在符头左边，笔直向下垂挂，像小写字母 p。'
                  : '当前音在第三线 (B4)，刚好在正中线。朝上朝下均可，通常跟着前后音符的走向走。'
              }}
            </p>
          </div>
          <div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
            <div class="text-amber-900 font-black">为什么不反过来？</div>
            <p class="text-slate-600 font-medium">
              如果高音还往上画，小棍就会飞出五线谱外面戳穿行距；低音往上拢、高音往下收，整个乐谱才整洁美观不打架。
            </p>
          </div>
        </div>
      </div>

      <!-- Theory Knowledge Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="(card, cIdx) in currentSection.cards"
          :key="cIdx"
          class="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3 flex flex-col justify-between"
        >
          <div class="space-y-2">
            <h4 class="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">
                {{ cIdx + 1 }}
              </span>
              <span>{{ card.heading }}</span>
            </h4>

            <p class="text-xs text-indigo-900 font-bold bg-white p-2.5 rounded-xl border border-indigo-100">
              📌 {{ card.summary }}
            </p>

            <ul class="space-y-1.5 text-xs text-slate-600 font-medium pl-1 leading-relaxed">
              <li
                v-for="(det, dIdx) in card.details"
                :key="dIdx"
                class="flex items-start gap-1.5"
              >
                <ChevronRight class="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <span>{{ det }}</span>
              </li>
            </ul>
          </div>

          <!-- Key terms if any -->
          <div v-if="card.keyTerms?.length" class="pt-2 border-t border-slate-200/60 flex flex-wrap gap-1.5">
            <span
              v-for="(kt, kIdx) in card.keyTerms"
              :key="kIdx"
              class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200/80 text-slate-700"
              :title="kt.explanation"
            >
              {{ kt.term }}
            </span>
          </div>
        </div>
      </div>

      <!-- Pitfalls / Mistakes to Avoid (避坑指南) -->
      <div
        v-if="currentSection.pitfalls?.length"
        class="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3"
      >
        <div class="flex items-center gap-2 text-rose-900 font-black text-sm">
          <AlertCircle class="w-4 h-4 text-rose-600" />
          <span>新手最容易踩的坑（避坑防错）</span>
        </div>

        <div
          v-for="(pf, pIdx) in currentSection.pitfalls"
          :key="pIdx"
          class="space-y-2 text-xs"
        >
          <div class="flex items-start gap-2 text-rose-700 font-bold">
            <XCircle class="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>常见误区：{{ pf.wrong }}</span>
          </div>
          <div class="flex items-start gap-2 text-emerald-800 font-bold">
            <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>正确认识：{{ pf.right }}</span>
          </div>
          <p class="text-[11px] text-slate-500 font-medium pl-6">
            💡 记法点拨：{{ pf.tip }}
          </p>
        </div>
      </div>

      <!-- Mnemonic Rhymes (速记顺口溜歌谣) -->
      <div
        v-if="currentSection.rhyme"
        class="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 space-y-2.5"
      >
        <div class="flex items-center gap-2 text-amber-900 font-black text-sm">
          <Music2 class="w-4 h-4 text-amber-600" />
          <span>{{ currentSection.rhyme.title }}</span>
        </div>
        <div class="space-y-1.5 pl-2 font-bold text-xs sm:text-sm text-amber-950">
          <p
            v-for="(line, lIdx) in currentSection.rhyme.lines"
            :key="lIdx"
            class="flex items-center gap-2"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>{{ line }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

