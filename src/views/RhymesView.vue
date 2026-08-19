<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { GO_RHYMES_DATA, type GoRhymeCard } from '../data/rhymesData';
import { GoGame } from '../engine/GoGame';
import { useUserStore } from '../stores/useUserStore';
import { playButtonSound } from '../lib/audio';
import GoBoard from '../components/board/GoBoard.vue';
import SpeechBubble from '../components/common/SpeechBubble.vue';
import {
  Sparkles,
  ChevronRight,
  Music,
  ArrowLeft
} from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();

const goBack = () => {
  playButtonSound();
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/learn');
  }
};

const activeCardId = ref<string>(GO_RHYMES_DATA[0].id);

const currentCard = computed<GoRhymeCard>(() => {
  return GO_RHYMES_DATA.find(c => c.id === activeCardId.value) || GO_RHYMES_DATA[0];
});

const game = computed(() => {
  const c = currentCard.value;
  const g = new GoGame(c.boardSize);
  for (const st of c.stones) {
    g.setCell(st.r, st.c, st.color);
  }
  return g;
});

const selectCard = (card: GoRhymeCard) => {
  activeCardId.value = card.id;
  playButtonSound();
};
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-4 sm:py-8 px-3 sm:px-6 lg:px-8 select-none">
    <div class="max-w-6xl mx-auto space-y-6">

      <!-- Header Banner -->
      <div class="bg-white rounded-3xl p-5 sm:p-7 border-2 border-orange-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="space-y-1.5 text-center md:text-left">
          <div class="flex items-center gap-2 flex-wrap justify-center md:justify-start">
            <button
              @click="goBack"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-black transition active:scale-95 cursor-pointer shadow-2xs"
              title="返回上一页"
            >
              <ArrowLeft class="w-3.5 h-3.5" />
              <span>返回</span>
            </button>
            <div class="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-black">
              <Music class="w-3.5 h-3.5 text-amber-700" />
              <span>朗朗上口 · 围棋经典口诀与儿歌</span>
            </div>
          </div>
          <h1 class="text-2xl sm:text-3xl font-cartoon font-bold text-gray-900 tracking-wide">
            棋理口诀小卡片
          </h1>
          <p class="text-xs sm:text-sm text-gray-600 font-medium max-w-xl">
            把深奥的围棋大局观与战术精髓变成好读好记的儿歌口诀，点击卡片即时动态演示！
          </p>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Left: Rhyme Cards List (5 cols) -->
        <div class="lg:col-span-5 space-y-3">
          <div
            v-for="card in GO_RHYMES_DATA"
            :key="card.id"
            @click="selectCard(card)"
            class="bg-white rounded-3xl p-5 border-2 transition-all cursor-pointer relative group flex flex-col justify-between"
            :class="
              activeCardId === card.id
                ? 'border-orange-500 ring-2 ring-orange-300 shadow-md bg-orange-50/20'
                : 'border-gray-100 hover:border-orange-200 hover:shadow-sm'
            "
          >
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] font-black bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                  {{ card.categoryLabel }}
                </span>
                <span class="text-xs font-bold text-gray-400">
                  {{ card.titleEn }}
                </span>
              </div>

              <h3 class="font-cartoon font-bold text-base text-gray-900 flex items-center gap-1.5">
                <span>{{ card.title }}</span>
              </h3>

              <div class="mt-2 p-3 bg-amber-50/80 rounded-2xl border border-orange-100 space-y-1">
                <div class="text-[10px] font-semibold text-orange-600">{{ card.rhymePinyin }}</div>
                <div class="text-xs font-black text-gray-900 leading-relaxed">{{ card.rhyme }}</div>
              </div>
            </div>

            <div class="pt-2 mt-2 flex items-center justify-between text-xs font-bold text-gray-500">
              <span class="line-clamp-1">{{ card.meaning }}</span>
              <ChevronRight class="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </div>
          </div>
        </div>

        <!-- Right: Dynamic Board Presentation & Tutor (7 cols) -->
        <div class="lg:col-span-7 space-y-4">
          <SpeechBubble
            :text="currentCard.explanation"
            :mood="'excited'"
            :speaker="'小诺导师'"
            :subtext="currentCard.audioKeyLine"
          />

          <!-- Board Demonstration -->
          <div class="bg-white rounded-3xl p-5 sm:p-6 border-2 border-orange-100 shadow-sm flex flex-col items-center justify-center space-y-4">
            <div class="w-full flex items-center justify-between pb-2 border-b border-gray-100">
              <span class="font-black text-sm text-gray-900">
                📖 口诀棋形实战动态图解
              </span>
              <span class="text-xs font-bold text-orange-600">
                闪烁点为口诀核心急所
              </span>
            </div>

            <GoBoard
              :game="game"
              :readonly="true"
              :showLiberties="true"
              :showAtari="true"
              :theme="userStore.theme"
              :highlightPoints="currentCard.highlight"
              :sizePx="460"
            />
          </div>

          <!-- Deep Dive Card -->
          <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-5 border-2 border-orange-200 space-y-2">
            <div class="flex items-center gap-2 text-xs font-black text-orange-950">
              <Sparkles class="w-4 h-4 text-orange-600" />
              <span>口诀精要总结：</span>
            </div>
            <p class="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
              {{ currentCard.meaning }}
            </p>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

