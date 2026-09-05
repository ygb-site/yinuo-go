<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/useUserStore';
import { useScheduleStore, SUBJECT_DOT_CLASS } from '../stores/useScheduleStore';
import { CHAPTERS_DATA, type Lesson } from '../data/chapters';
import { pickShadowDrillForDate, shadowKindLabel } from '../data/hengshuiShadowDrills';
import { resolveDayPhase, localDateKey } from '../domain/today/dayPhase';
import { buildPackList, packHighlight } from '../domain/today/packList';
import { buildHomeworkHints } from '../domain/today/homeworkHints';
import { resolveDayPlan } from '../domain/today/dayPlan';
import {
  resolveGrowthTracks,
  hometownShadowLiteEnabled
} from '../domain/growth/tracks';
import {
  AppButton,
  AppIcon,
  AppEmptyState
} from '../design-system';
import { sound } from '../utils/sound';
import { Calendar, Backpack, Moon, Sun, Sunset, Sparkles } from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();
const scheduleStore = useScheduleStore();

const nowTick = ref(Date.now());
let tickTimer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  scheduleStore.hydrateFromProfile();
  tickTimer = setInterval(() => {
    nowTick.value = Date.now();
  }, 60_000);
});

onUnmounted(() => {
  if (tickTimer) clearInterval(tickTimer);
});

const phase = computed(() => resolveDayPhase(new Date(nowTick.value)));
const dateKey = computed(() => localDateKey(new Date(nowTick.value)));

const dayPlan = computed(() => resolveDayPlan(userStore.currentProfile.dayPlan, new Date(nowTick.value)));

const growthTracks = computed(() => resolveGrowthTracks(userStore.currentProfile));
const shadowLiteOn = computed(() => hometownShadowLiteEnabled(growthTracks.value));

const todayCourses = computed(() => scheduleStore.todayCourses);
const nextSchoolDay = computed(() => scheduleStore.nextSchoolDayCourses);
const packItems = computed(() => buildPackList(todayCourses.value));
const tomorrowPackItems = computed(() => {
  if (!nextSchoolDay.value) return [];
  return buildPackList(nextSchoolDay.value.courses);
});
const homeworkHints = computed(() => buildHomeworkHints(todayCourses.value));
const shadowDrill = computed(() => pickShadowDrillForDate(dateKey.value));

const selectedChoice = ref<number | null>(null);
const shadowFeedback = ref<'idle' | 'correct' | 'wrong'>('idle');

const allLessons = computed<Lesson[]>(() => {
  const list: Lesson[] = [];
  for (const c of CHAPTERS_DATA) {
    list.push(...c.lessons);
  }
  return list;
});

const currentContinueLesson = computed(() => {
  if (!userStore.hasProfile) return null;
  for (const les of allLessons.value) {
    if (!userStore.progress[les.id]?.completed) return les;
  }
  return allLessons.value[allLessons.value.length - 1] || null;
});

const totalLessonsCount = computed(() => allLessons.value.length);
const completedLessonsCount = computed(() =>
  allLessons.value.filter((l) => !!userStore.progress[l.id]?.completed).length
);
const isAllCompleted = computed(
  () => completedLessonsCount.value >= totalLessonsCount.value && totalLessonsCount.value > 0
);

const phaseIcon = computed(() => {
  if (phase.value.id === 'morning') return Sun;
  if (phase.value.id === 'noon') return Sparkles;
  if (phase.value.id === 'evening') return Sunset;
  return Moon;
});

const phaseBadge = computed(() => {
  if (phase.value.isWeekend) return '周末';
  if (phase.value.id === 'morning') return '早晨 · 出门准备';
  if (phase.value.id === 'noon') return '午休 · 轻练一刻';
  if (phase.value.id === 'evening') return '放学后 · 收口明天';
  return '夜里 · 该休息了';
});

const homeworkDoneCount = computed(() =>
  homeworkHints.value.filter((h) => dayPlan.value.homeworkDoneIds.includes(h.id)).length
);

const startOrContinueLesson = () => {
  if (!userStore.requireLogin()) return;
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  sound.playButtonSound();
  if (currentContinueLesson.value) {
    router.push('/lesson/' + currentContinueLesson.value.id);
  } else {
    router.push('/adventure');
  }
};

const navigateTo = (path: string) => {
  sound.playButtonSound();
  if (path !== '/' && !userStore.requireLogin()) return;
  router.push(path);
};

const scrollToShadow = () => {
  sound.playButtonSound();
  document.getElementById('shadow')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

const createProfile = () => {
  userStore.openProfileModal();
};

const markPackChecked = () => {
  if (!userStore.requireLogin()) return;
  userStore.patchDayPlan({ packChecked: !dayPlan.value.packChecked });
  sound.playButtonSound();
};

const toggleHomework = (id: string) => {
  if (!userStore.requireLogin()) return;
  userStore.toggleDayHomework(id);
  sound.playButtonSound();
};

const markNoonGoDone = () => {
  if (!userStore.requireLogin()) return;
  userStore.patchDayPlan({ noonGoDone: true });
  startOrContinueLesson();
};

const answerShadow = (index: number) => {
  if (!userStore.requireLogin()) return;
  if (dayPlan.value.shadowDone) return;
  selectedChoice.value = index;
  const ok = index === shadowDrill.value.answerIndex;
  shadowFeedback.value = ok ? 'correct' : 'wrong';
  if (ok) {
    userStore.patchDayPlan({ shadowDone: true });
    sound.playWinSound();
  } else {
    sound.playButtonSound();
  }
};

const weekendExplorations = [
  {
    title: '亲子围棋',
    subtitle: '同屏下一盘',
    icon: '👥',
    iconBg: 'bg-blue-100 text-blue-800 border-blue-200',
    route: '/two-player'
  },
  {
    title: '六角跳棋',
    subtitle: '搭桥连跳',
    icon: '⭐',
    iconBg: 'bg-amber-100 text-amber-800 border-amber-200',
    route: '/checkers'
  },
  {
    title: '欢乐五子棋',
    subtitle: '五子连珠',
    icon: '⚪',
    iconBg: 'bg-teal-100 text-teal-800 border-teal-200',
    route: '/gomoku'
  },
  {
    title: '象棋学堂',
    subtitle: 'Xiangqi · 教程与残局',
    icon: '🐴',
    iconBg: 'bg-orange-100 text-orange-800 border-orange-200',
    route: '/xiangqi'
  },
  {
    title: '死活轻练',
    subtitle: '一道就好',
    icon: '🧩',
    iconBg: 'bg-rose-100 text-rose-800 border-rose-200',
    route: '/tsumego'
  }
];
</script>

<template>
  <div class="min-h-full bg-[#F6F3EB] py-4 md:py-6 lg:py-8 px-4 md:px-6 lg:px-8 select-none relative overflow-hidden">
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[320px] bg-gradient-to-b from-amber-200/25 via-orange-100/20 to-transparent blur-3xl pointer-events-none" />

    <div class="max-w-5xl mx-auto space-y-5 md:space-y-6 relative z-10">
      <!-- 问候 -->
      <div>
        <div class="flex flex-wrap items-center gap-2 mb-1.5">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300/60 rounded-full text-xs font-bold shadow-2xs">
            <Calendar class="w-3.5 h-3.5 text-amber-700" />
            <span>学习第 {{ Math.max(1, userStore.checkInStreak || 1) }} 天</span>
          </span>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100 text-sky-900 border border-sky-300/60 rounded-full text-xs font-bold shadow-2xs">
            <component :is="phaseIcon" class="w-3.5 h-3.5" />
            <span>{{ phaseBadge }}</span>
          </span>
        </div>

        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-slate-900 tracking-tight">
          {{ phase.greeting }}，{{ userStore.hasProfile ? userStore.nickname : '小棋手' }}！
        </h1>
        <p class="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
          {{ phase.focus }}
        </p>
      </div>

      <!-- 无档案 -->
      <div v-if="!userStore.hasProfile" class="bg-white rounded-3xl p-8 border-2 border-amber-300 shadow-md">
        <AppEmptyState
          variant="first-time"
          title="创建你的专属学员档案"
          description="建好档案后，小诺会按早中晚告诉你今天该带什么、做什么。"
        >
          <template #action>
            <AppButton variant="primary" size="lg" @click="createProfile">
              <template #icon><AppIcon name="user" /></template>
              立即创建档案
            </AppButton>
          </template>
        </AppEmptyState>
      </div>

      <template v-else>
        <!-- ========== 周末 ========== -->
        <template v-if="phase.isWeekend && phase.id !== 'night'">
          <div class="bg-gradient-to-br from-[#FFFDF8] via-[#FFF8EE] to-[#FEEED6] rounded-3xl p-5 sm:p-6 border-2 border-amber-200/90 shadow-xs space-y-4">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-200/80 text-amber-950 border border-amber-300">周末</span>
              <span class="text-xs font-bold text-amber-900">不赶课表，选一件轻松的事</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-display font-bold text-slate-900">和家人一起玩，或做一道影子轻练</h2>
            <p class="text-sm text-slate-600">围棋主线随时可继续；衡水影子题每天一道，做完就收工。</p>
            <div class="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                class="flex-1 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow-xs active:scale-95 cursor-pointer"
                @click="startOrContinueLesson"
              >
                {{ isAllCompleted ? '复习一关围棋' : '继续围棋主线 ▶' }}
              </button>
              <button
                v-if="shadowLiteOn"
                type="button"
                class="flex-1 px-5 py-2.5 rounded-2xl bg-white border-2 border-rose-200 text-rose-800 font-bold text-sm active:scale-95 cursor-pointer"
                @click="scrollToShadow"
              >
                {{ dayPlan.shadowDone ? '影子题已完成 ✓' : '做今天影子一题' }}
              </button>
            </div>
          </div>

          <div class="space-y-3">
            <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2 px-1">
              <span>🎲</span>
              <span>周末探索</span>
            </h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <button
                v-for="item in weekendExplorations"
                :key="item.title"
                type="button"
                class="bg-white rounded-2xl p-3.5 border-2 border-slate-200/90 hover:border-amber-300 hover:shadow-md transition cursor-pointer flex items-center gap-3 text-left"
                @click="navigateTo(item.route)"
              >
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border" :class="item.iconBg">
                  {{ item.icon }}
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-bold text-slate-900 truncate">{{ item.title }}</div>
                  <div class="text-[11px] text-slate-400 font-semibold truncate">{{ item.subtitle }}</div>
                </div>
              </button>
            </div>
          </div>
        </template>

        <!-- ========== 工作日 · 早晨 ========== -->
        <template v-else-if="!phase.isWeekend && phase.id === 'morning'">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <div class="md:col-span-2 bg-gradient-to-br from-[#FFFDF8] via-[#FFF8EE] to-[#E8F4FF] rounded-3xl p-5 sm:p-6 border-2 border-sky-200/80 shadow-xs space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-200 text-sky-950 border border-sky-300">今日课表</span>
                  <span class="text-xs font-bold text-sky-900">{{ todayCourses.length }} 节课</span>
                </div>
                <button type="button" class="text-xs font-bold text-sky-700 hover:underline cursor-pointer" @click="navigateTo('/schedule')">
                  看完整课表 →
                </button>
              </div>

              <div v-if="todayCourses.length === 0" class="text-sm text-slate-600 py-4">今天没有排课，好好休息。</div>
              <ul v-else class="space-y-2">
                <li
                  v-for="row in todayCourses"
                  :key="row.period.id"
                  class="flex items-center gap-3 rounded-2xl bg-white/80 border border-sky-100 px-3 py-2.5"
                >
                  <span class="w-2 h-2 rounded-full shrink-0" :class="SUBJECT_DOT_CLASS[row.subject.tone]" />
                  <span class="text-xs font-bold text-slate-400 w-14 shrink-0">{{ row.period.time }}</span>
                  <span class="text-sm font-bold text-slate-900">{{ row.subject.emoji }} {{ row.subject.name }}</span>
                  <span class="ml-auto text-[11px] text-slate-400 font-semibold">{{ row.period.label }}</span>
                </li>
              </ul>
            </div>

            <div class="bg-white rounded-3xl p-5 border-2 border-amber-200/90 shadow-xs flex flex-col gap-3">
              <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Backpack class="w-4 h-4 text-amber-700" />
                <h3 class="text-base font-bold text-slate-900">书包带什么</h3>
              </div>
              <p class="text-xs text-amber-900 font-medium leading-relaxed">{{ packHighlight(packItems) }}</p>
              <ul class="space-y-1.5 flex-1">
                <li v-for="item in packItems" :key="item.id" class="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>{{ item.label }}</span>
                  <span v-if="item.fromSubject" class="text-slate-400 font-medium">· {{ item.fromSubject }}</span>
                </li>
              </ul>
              <button
                type="button"
                class="w-full py-2.5 rounded-2xl text-sm font-bold transition active:scale-95 cursor-pointer"
                :class="dayPlan.packChecked ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-500 text-white'"
                @click="markPackChecked"
              >
                {{ dayPlan.packChecked ? '已装好书包 ✓' : '装好了，出发！' }}
              </button>
            </div>
          </div>
        </template>

        <!-- ========== 工作日 · 午休 ========== -->
        <template v-else-if="!phase.isWeekend && phase.id === 'noon'">
          <div class="bg-gradient-to-br from-[#FFFDF8] via-[#F0F7FF] to-[#EEF2FF] rounded-3xl p-5 sm:p-6 border-2 border-indigo-200/80 shadow-xs space-y-4">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-200 text-indigo-950 border border-indigo-300">午休轻练</span>
              <span class="text-xs font-bold text-indigo-900">只做一件，做完就歇</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-display font-bold text-slate-900">二选一，别贪多</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                class="text-left rounded-2xl border-2 p-4 transition cursor-pointer"
                :class="dayPlan.noonGoDone ? 'border-emerald-300 bg-emerald-50' : 'border-amber-200 bg-amber-50/50 hover:border-amber-400'"
                @click="markNoonGoDone"
              >
                <div class="text-2xl mb-1">🧭</div>
                <div class="text-sm font-bold text-slate-900">{{ dayPlan.noonGoDone ? '围棋轻练已做 ✓' : '围棋主线一关' }}</div>
                <p class="text-xs text-slate-500 mt-1">{{ currentContinueLesson?.title || '开始第一课' }} · 约 5 分钟</p>
              </button>
              <button
                v-if="shadowLiteOn"
                type="button"
                class="text-left rounded-2xl border-2 p-4 transition cursor-pointer"
                :class="dayPlan.shadowDone ? 'border-emerald-300 bg-emerald-50' : 'border-rose-200 bg-rose-50/50 hover:border-rose-400'"
                @click="scrollToShadow"
              >
                <div class="text-2xl mb-1">📝</div>
                <div class="text-sm font-bold text-slate-900">{{ dayPlan.shadowDone ? '影子题已做 ✓' : '衡水影子一题' }}</div>
                <p class="text-xs text-slate-500 mt-1">{{ shadowKindLabel(shadowDrill.kind) }} · {{ shadowDrill.title }}</p>
              </button>
            </div>
          </div>
        </template>

        <!-- ========== 工作日 · 晚间 / 夜 ========== -->
        <template v-else-if="!phase.isWeekend && (phase.id === 'evening' || phase.id === 'night')">
          <div v-if="phase.id === 'night'" class="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border-2 border-slate-700 shadow-xs space-y-2">
            <div class="flex items-center gap-2">
              <Moon class="w-4 h-4 text-amber-300" />
              <span class="text-xs font-bold text-amber-200">该睡觉了</span>
            </div>
            <h2 class="text-xl font-display font-bold">明天的准备已经备好</h2>
            <p class="text-sm text-slate-300">作业没收完也别熬夜，站睡眠。醒了再继续。</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div class="bg-white rounded-3xl p-5 sm:p-6 border-2 border-violet-200/80 shadow-xs space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <span>📒</span>
                  <span>作业收口</span>
                </h3>
                <span class="text-xs font-bold text-violet-700">{{ homeworkDoneCount }}/{{ homeworkHints.length }}</span>
              </div>
              <p class="text-xs text-slate-500">按今天上过的课提醒，勾完就收工。没有学校布置时只当习惯清单。</p>
              <ul class="space-y-2">
                <li v-for="hint in homeworkHints" :key="hint.id">
                  <button
                    type="button"
                    class="w-full text-left rounded-2xl border px-3 py-2.5 transition cursor-pointer"
                    :class="dayPlan.homeworkDoneIds.includes(hint.id) ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-violet-300'"
                    @click="toggleHomework(hint.id)"
                  >
                    <div class="text-sm font-bold text-slate-900">
                      {{ dayPlan.homeworkDoneIds.includes(hint.id) ? '✓' : '○' }}
                      {{ hint.emoji }} {{ hint.title }}
                    </div>
                    <p class="text-xs text-slate-500 mt-0.5">{{ hint.detail }}</p>
                  </button>
                </li>
              </ul>
            </div>

            <div class="bg-gradient-to-br from-[#FFFDF8] to-[#E8F4FF] rounded-3xl p-5 sm:p-6 border-2 border-sky-200/80 shadow-xs space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="text-base font-bold text-slate-900">
                  {{ nextSchoolDay ? `${nextSchoolDay.weekdayName}要上什么` : '下一上课日' }}
                </h3>
                <button type="button" class="text-xs font-bold text-sky-700 hover:underline cursor-pointer" @click="navigateTo('/schedule')">
                  课表 →
                </button>
              </div>
              <ul v-if="nextSchoolDay" class="space-y-1.5">
                <li
                  v-for="row in nextSchoolDay.courses"
                  :key="'n-' + row.period.id"
                  class="flex items-center gap-2 text-xs font-bold text-slate-700"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="SUBJECT_DOT_CLASS[row.subject.tone]" />
                  <span>{{ row.subject.emoji }} {{ row.subject.name }}</span>
                </li>
              </ul>
              <div class="pt-2 border-t border-sky-100 space-y-1.5">
                <div class="text-xs font-bold text-sky-900 flex items-center gap-1">
                  <Backpack class="w-3.5 h-3.5" />
                  <span>明天书包</span>
                </div>
                <p class="text-xs text-slate-600 leading-relaxed">{{ packHighlight(tomorrowPackItems) }}</p>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="item in tomorrowPackItems.slice(0, 8)"
                    :key="'tp-' + item.id"
                    class="px-2 py-0.5 rounded-full bg-white border border-sky-200 text-[11px] font-bold text-slate-700"
                  >
                    {{ item.label }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ========== 衡水影子轻练（午/晚/周末可见） ========== -->
        <div
          v-if="shadowLiteOn && (phase.isWeekend || phase.id === 'noon' || phase.id === 'evening')"
          id="shadow"
          class="bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 rounded-3xl p-5 sm:p-6 border-2 border-rose-200/80 shadow-2xs space-y-3"
        >
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-200 text-rose-950 border border-rose-300">双轨 · 衡水影子</span>
            <span class="text-xs font-bold text-rose-800">{{ shadowKindLabel(shadowDrill.kind) }} · 每天一道</span>
            <span v-if="dayPlan.shadowDone" class="text-xs font-bold text-emerald-700">已完成 ✓</span>
          </div>
          <h3 class="text-lg font-bold text-slate-900">{{ shadowDrill.title }}：{{ shadowDrill.prompt }}</h3>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="(choice, idx) in shadowDrill.choices"
              :key="choice"
              type="button"
              class="px-3 py-2.5 rounded-2xl border-2 text-sm font-bold transition cursor-pointer"
              :disabled="dayPlan.shadowDone"
              :class="{
                'border-emerald-400 bg-emerald-100 text-emerald-900': dayPlan.shadowDone && idx === shadowDrill.answerIndex,
                'border-rose-400 bg-rose-100 text-rose-900': shadowFeedback === 'wrong' && selectedChoice === idx,
                'border-slate-200 bg-white text-slate-800 hover:border-rose-300': !dayPlan.shadowDone && selectedChoice !== idx,
                'border-amber-400 bg-amber-50': !dayPlan.shadowDone && selectedChoice === idx && shadowFeedback !== 'wrong'
              }"
              @click="answerShadow(idx)"
            >
              {{ choice }}
            </button>
          </div>
          <p v-if="shadowFeedback === 'wrong'" class="text-xs font-bold text-rose-700">再想一想：{{ shadowDrill.tip }}</p>
          <p v-else-if="dayPlan.shadowDone" class="text-xs font-bold text-emerald-700">答对了！{{ shadowDrill.tip }}</p>
          <p v-else class="text-xs text-slate-500">一年级起双轨轻练：北京课表是主轴，这里只补一道衡水量级的小题。</p>
        </div>

        <!-- ========== 围棋主线（早/夜作次要；午晚周末已有入口时仍保留紧凑卡） ========== -->
        <div
          v-if="phase.id === 'morning' || phase.id === 'night' || (!phase.isWeekend && phase.id === 'evening')"
          class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-amber-200/70 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div class="min-w-0">
            <div class="text-xs font-bold text-amber-800 mb-0.5">能力层 · 围棋主线</div>
            <div class="text-sm font-bold text-slate-900 truncate">
              {{ isAllCompleted ? '启蒙篇章已通关' : (currentContinueLesson?.title || '开始第一课') }}
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              {{ completedLessonsCount }} / {{ totalLessonsCount }} 关
            </p>
          </div>
          <button
            type="button"
            class="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs sm:text-sm shadow-xs active:scale-95 cursor-pointer shrink-0"
            @click="startOrContinueLesson"
          >
            {{ isAllCompleted ? '复习关卡' : '继续一课 ▶' }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
