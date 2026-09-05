<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ArrowRight, BookOpen, Puzzle, Users } from 'lucide-vue-next';
import { XIANGQI_ENDGAMES, XIANGQI_LESSONS } from '../data/xiangqiCurriculum';
import { useXiangqiLearnStore } from '../stores/xiangqiLearnStore';
import { sound } from '../utils/sound';

const router = useRouter();
const learnStore = useXiangqiLearnStore();

const go = (path: string) => {
  sound.playButtonSound();
  router.push(path);
};

const startLesson = (id: string) => {
  if (!learnStore.isLessonUnlocked(id)) {
    sound.playErrorSound();
    return;
  }
  go('/xiangqi/lesson/' + id);
};
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-4 md:py-8 px-3.5 sm:px-6 lg:px-8 select-none font-sans">
    <div class="max-w-6xl mx-auto space-y-6 sm:space-y-8">
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 p-6 sm:p-8 shadow-md border-2 border-white/80">
        <div class="absolute right-8 top-3 text-5xl opacity-20 pointer-events-none">🐴</div>
        <div class="relative z-10 space-y-2">
          <div class="inline-flex items-center gap-1.5 bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold">
            象棋学堂 · Xiangqi Academy
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-white">中国象棋学堂</h1>
          <p class="text-white/80 text-[11px] font-bold tracking-wide">Chinese Chess · Lessons & Endgames</p>
          <p class="text-white/95 text-xs sm:text-sm font-medium max-w-xl">
            先学会车马炮兵怎么走，再闯几道将死残局。想对弈时，再去亲子同屏下一盘。
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <button
          type="button"
          class="bg-white rounded-3xl p-5 border-2 border-rose-200 text-left hover:border-rose-400 hover:shadow-md transition cursor-pointer"
          @click="go('/xiangqi/lesson/' + XIANGQI_LESSONS[0].id)"
        >
          <BookOpen class="w-6 h-6 text-rose-600 mb-2" />
          <div class="text-base font-black text-slate-900">启蒙教程 <span class="text-xs font-bold text-slate-400">Learn</span></div>
          <p class="text-xs text-slate-500 mt-1">{{ learnStore.completedCount }} / {{ XIANGQI_LESSONS.length }} 关已完成</p>
        </button>
        <button
          type="button"
          class="bg-white rounded-3xl p-5 border-2 border-amber-200 text-left hover:border-amber-400 hover:shadow-md transition cursor-pointer"
          @click="go('/xiangqi/endgame')"
        >
          <Puzzle class="w-6 h-6 text-amber-600 mb-2" />
          <div class="text-base font-black text-slate-900">残局训练 <span class="text-xs font-bold text-slate-400">Endgames</span></div>
          <p class="text-xs text-slate-500 mt-1">{{ learnStore.solvedEndgameCount }} / {{ XIANGQI_ENDGAMES.length }} 道已攻克</p>
        </button>
        <button
          type="button"
          class="bg-white rounded-3xl p-5 border-2 border-purple-200 text-left hover:border-purple-400 hover:shadow-md transition cursor-pointer"
          @click="go('/xiangqi/play')"
        >
          <Users class="w-6 h-6 text-purple-600 mb-2" />
          <div class="text-base font-black text-slate-900">亲子同屏 <span class="text-xs font-bold text-slate-400">Pass & Play</span></div>
          <p class="text-xs text-slate-500 mt-1">红先黑后，两人轮流走子</p>
        </button>
      </div>

      <section class="space-y-3.5">
        <div>
          <h2 class="text-lg font-black text-slate-900">第一章：棋盘与棋子 <span class="text-xs font-bold text-slate-400">Board & Pieces</span></h2>
          <p class="text-xs text-slate-500">按顺序闯关，学会每一种棋子的走法。</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            v-for="lesson in XIANGQI_LESSONS"
            :key="lesson.id"
            type="button"
            class="rounded-3xl p-5 border-2 text-left transition cursor-pointer"
            :class="learnStore.isLessonUnlocked(lesson.id)
              ? 'bg-white border-slate-200 hover:border-rose-400 hover:shadow-md'
              : 'bg-slate-50 border-slate-200 opacity-70 cursor-not-allowed'"
            @click="startLesson(lesson.id)"
          >
            <div class="flex items-center justify-between gap-3">
              <span class="text-2xl">{{ lesson.icon }}</span>
              <span
                class="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                :class="learnStore.isLessonCompleted(lesson.id) ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-50 text-rose-800'"
              >
                {{ learnStore.isLessonCompleted(lesson.id) ? '已完成' : (learnStore.isLessonUnlocked(lesson.id) ? '可闯关' : '待解锁') }}
              </span>
            </div>
            <h3 class="mt-3 font-black text-slate-900">{{ lesson.title }}</h3>
            <p class="text-xs text-slate-500 mt-1">{{ lesson.description }}</p>
            <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-700">
              <span>{{ learnStore.isLessonUnlocked(lesson.id) ? '开始学习' : '先完成上一关' }}</span>
              <ArrowRight class="w-4 h-4" />
            </div>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
