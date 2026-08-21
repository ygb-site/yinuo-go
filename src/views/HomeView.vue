<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import DailyQuestModal from '../components/common/DailyQuestModal.vue';
import { useUserStore } from '../stores/useUserStore';
import { ALL_SUBJECTS } from '../data/subjectsData';
import { getAllLessonsBySubject } from '../data/academicCurriculum';
import type { SubjectId, UniversalLesson } from '../types/curriculum';
import { playButtonSound } from '../lib/audio';
import {
  Calendar,
  ArrowRight,
  Sparkles,
  Star,
  Flame
} from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();
const showQuestModal = ref(false);

const subjects = computed(() => {
  return ALL_SUBJECTS.map(s => {
    const lessons = getAllLessonsBySubject(s.id);
    const completed = lessons.filter((l: UniversalLesson) => !!userStore.progress[l.id]?.completed).length;
    const stars = lessons.reduce((acc: number, l: UniversalLesson) => acc + (userStore.progress[l.id]?.stars || 0), 0);
    const progress = lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;

    return {
      ...s,
      totalLessons: lessons.length,
      completedLessons: completed,
      starsEarned: stars,
      progressPercent: progress
    };
  });
});

const totalGlobalLessons = computed(() => {
  return subjects.value.reduce((acc: number, s) => acc + s.totalLessons, 0);
});

const totalGlobalCompleted = computed(() => {
  return subjects.value.reduce((acc: number, s) => acc + s.completedLessons, 0);
});

const globalProgressPercent = computed(() => {
  if (totalGlobalLessons.value === 0) return 0;
  return Math.min(100, Math.round((totalGlobalCompleted.value / totalGlobalLessons.value) * 100));
});

const navigateToSubject = (subjectId: SubjectId) => {
  playButtonSound();
  userStore.setActiveSubject(subjectId);
  if (subjectId === 'go') {
    router.push('/learn');
  } else {
    router.push(`/subject/${subjectId}`);
  }
};

const navigateTo = (path: string) => {
  playButtonSound();
  router.push(path);
};

const quickPracticeHubs = [
  {
    title: '口算天天练',
    subject: '数学',
    icon: '🧮',
    tag: '一二年级数学',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    route: '/subject/math/drill'
  },
  {
    title: '生字笔顺演练',
    subject: '语文',
    icon: '✍️',
    tag: '部编版语文',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    route: '/subject/chinese/hanzi'
  },
  {
    title: '古诗点读背诵',
    subject: '语文',
    icon: '📜',
    tag: '必背古诗',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    route: '/subject/chinese/poetry'
  },
  {
    title: '自然拼读发音板',
    subject: '英语',
    icon: '🔊',
    tag: 'Phonics',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    route: '/subject/english/phonics'
  },
  {
    title: '死活专项训练',
    subject: '围棋',
    icon: '🎯',
    tag: '围棋死活',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    route: '/tsumego'
  },
  {
    title: '速算冲天竞技场',
    subject: '数学',
    icon: '🚀',
    tag: '限时口算',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    route: '/subject/math/speed'
  }
];
</script>

<template>
  <div class="min-h-screen bg-[#FDFBF7] py-4 sm:py-8 px-3 sm:px-6 lg:px-8 select-none">
    <div class="max-w-6xl mx-auto space-y-8">
      
      <!-- Top Welcome Hero Banner -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 p-5 sm:p-8 lg:p-9 shadow-xl border-4 border-white">
        <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-white/15 rounded-full blur-2xl pointer-events-none"></div>
        <div class="absolute right-8 top-4 text-4xl sm:text-6xl opacity-20 pointer-events-none">🌟</div>

        <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="space-y-3 text-center md:text-left w-full md:w-auto">
            <div class="inline-flex items-center gap-1.5 bg-white/30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-black shadow-sm">
              <Sparkles class="w-3.5 h-3.5" />
              <span>一诺未来学堂 · 多元互动启蒙</span>
            </div>

            <div class="text-2xl sm:text-4xl lg:text-5xl font-cartoon font-bold text-white tracking-wider drop-shadow-md flex items-center justify-center md:justify-start gap-2">
              <span>嗨，{{ userStore.nickname }}！</span>
              <span class="animate-bounce inline-block">🚀</span>
            </div>

            <p class="text-sm sm:text-base text-white/95 font-bold max-w-xl leading-relaxed">
              围棋博弈、数理思维、国学语文、趣味英语！选择你喜爱的学科馆，开启今天的智慧探险吧！
            </p>

            <!-- Daily Action Pills -->
            <div class="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <button
                @click="showQuestModal = true"
                class="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all active:scale-95 shadow-sm border border-white/30"
              >
                <Calendar class="w-4 h-4 text-amber-200" />
                <span>每日任务</span>
                <span class="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
              </button>

              <div class="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-black text-xs sm:text-sm flex items-center gap-1.5 border border-white/30">
                <Flame class="w-4 h-4 text-orange-200" />
                <span>连续打卡 {{ userStore.checkInStreak }} 天</span>
              </div>
            </div>
          </div>

          <!-- Quick Global Stats Card -->
          <div class="bg-white/95 rounded-3xl p-5 sm:p-6 text-slate-800 min-w-[260px] shadow-xl text-center border-3 border-amber-200">
            <div class="text-xs font-black text-amber-600 uppercase tracking-wide mb-1">
              全科通关总进度
            </div>
            <div class="text-3xl font-black text-slate-900 flex items-center justify-center gap-1">
              <span>{{ totalGlobalCompleted }}</span>
              <span class="text-base text-slate-400 font-bold">/ {{ totalGlobalLessons }} 关</span>
            </div>

            <!-- Global Progress Bar -->
            <div class="w-full bg-slate-100 h-3 rounded-full mt-3 overflow-hidden p-0.5 border border-slate-200">
              <div
                class="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-500"
                :style="{ width: globalProgressPercent + '%' }"
              ></div>
            </div>

            <div class="mt-3 flex items-center justify-center gap-3 text-xs font-black text-slate-600">
              <span class="flex items-center gap-1">
                <Star class="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                {{ userStore.totalStars }} 颗星
              </span>
              <span>•</span>
              <span class="flex items-center gap-1 text-amber-600">
                🪙 {{ userStore.coins }} 金币
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 4 Core Subject Academies Grid -->
      <div>
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg sm:text-2xl font-cartoon font-bold text-slate-800 flex items-center gap-2.5">
            <span>🏫</span>
            <span>四大核心学科馆</span>
          </h2>
          <span class="text-xs sm:text-sm font-bold text-slate-400">
            涵盖思维逻辑与语言素养
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="sub in subjects"
            :key="sub.id"
            @click="navigateToSubject(sub.id)"
            class="group bg-white rounded-3xl p-6 sm:p-7 border-3 border-slate-200 hover:border-amber-400 shadow-md hover:shadow-2xl transition-all transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between relative overflow-hidden"
          >
            <div>
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                    {{ sub.icon }}
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800">
                        {{ sub.badge }}
                      </span>
                      <span class="text-xs text-slate-400 font-bold">{{ sub.ageRange }}</span>
                    </div>
                    <h3 class="text-xl sm:text-2xl font-cartoon font-bold text-slate-900 mt-1 group-hover:text-amber-600 transition-colors tracking-wide">
                      {{ sub.title }}
                    </h3>
                  </div>
                </div>
              </div>

              <p class="text-xs sm:text-sm font-bold text-slate-500 leading-relaxed">
                {{ sub.slogan }}
              </p>
            </div>

            <div class="mt-6 pt-4 border-t border-slate-100">
              <div class="flex items-center justify-between text-xs font-black text-slate-600 mb-2">
                <span>关卡进度 ({{ sub.completedLessons }}/{{ sub.totalLessons }})</span>
                <span class="text-amber-600">{{ sub.progressPercent }}%</span>
              </div>

              <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-4">
                <div
                  :class="['h-full rounded-full transition-all duration-500 bg-gradient-to-r', sub.bgGradient]"
                  :style="{ width: sub.progressPercent + '%' }"
                ></div>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-xs font-black text-slate-400 flex items-center gap-1">
                  <Star class="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  已得 {{ sub.starsEarned }} 星
                </span>

                <button class="px-4 py-2 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-sm flex items-center gap-1.5 shadow-sm group-hover:scale-105 transition-transform">
                  <span>进入馆区</span>
                  <ArrowRight class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Training Arena Hub -->
      <div>
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg sm:text-2xl font-cartoon font-bold text-slate-800 flex items-center gap-2.5">
            <span>⚡</span>
            <span>多学科极速训练擂台</span>
          </h2>
          <span class="text-xs sm:text-sm font-bold text-slate-400">
            特色专项训练与益智竞技
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div
            v-for="hub in quickPracticeHubs"
            :key="hub.title"
            @click="navigateTo(hub.route)"
            class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 cursor-pointer text-center flex flex-col items-center justify-between group"
          >
            <div class="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform">
              {{ hub.icon }}
            </div>
            
            <div>
              <span :class="['inline-block px-2 py-0.5 rounded-full text-[10px] font-black border mb-1.5', hub.color]">
                {{ hub.tag }}
              </span>
              <h4 class="text-xs sm:text-sm font-black text-slate-800 group-hover:text-amber-600 transition-colors line-clamp-1">
                {{ hub.title }}
              </h4>
            </div>

            <div class="mt-3 text-[11px] font-black text-amber-600 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>立即挑战</span>
              <ArrowRight class="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Daily Quest Modal -->
    <DailyQuestModal
      :is-open="showQuestModal"
      @close="showQuestModal = false"
    />
  </div>
</template>


