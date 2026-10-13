<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import StaffCanvas from './StaffCanvas.vue';
import VirtualKeyboard from './VirtualKeyboard.vue';
import {
  TREBLE_STAFF_NOTES,
  BASS_STAFF_NOTES,
  type StaffNoteItem,
} from '../../data/pianoStaffData';
import { pianoAudio } from '../../utils/pianoAudio';
import { sound } from '../../utils/sound';
import { useUserStore } from '../../stores/useUserStore';
import {
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trophy,
  ArrowRight,
  X
} from 'lucide-vue-next';

const userStore = useUserStore();

// Quiz Range Scope
type QuizScope = 'thompson1' | 'thompson2' | 'beyer' | 'treble' | 'bass';
const selectedScope = ref<QuizScope>('thompson1');

// Current Question state
const currentQuestionIndex = ref<number>(1);
const totalQuestions = ref<number>(10);
const currentTargetNote = ref<StaffNoteItem>(TREBLE_STAFF_NOTES[2]); // Default C4
const currentOptions = ref<{ key: 'A' | 'B' | 'C' | 'D'; note: StaffNoteItem }[]>([]);

// Selection & feedback state
const selectedKey = ref<'A' | 'B' | 'C' | 'D' | null>(null);
const isAnswered = ref<boolean>(false);
const isCorrect = ref<boolean>(false);
const streakCount = ref<number>(0);
const maxStreak = ref<number>(0);
const score = ref<number>(0);
const correctCount = ref<number>(0);
const showHint = ref<boolean>(true);
const isMuted = ref<boolean>(false);

// Game Finished State
const isFinished = ref<boolean>(false);

// Pool of notes according to scope
const availableNotesPool = computed(() => {
  if (selectedScope.value === 'thompson1') {
    // 小汤1：中央C五指位置 (右手C4-G4, 左手F3-C4)
    const t1 = [
      ...TREBLE_STAFF_NOTES.filter(n => ['C4', 'D4', 'E4', 'F4', 'G4'].includes(n.pitch)),
      ...BASS_STAFF_NOTES.filter(n => ['F3', 'G3', 'A3', 'B3', 'C4'].includes(n.pitch))
    ];
    return t1;
  }
  if (selectedScope.value === 'thompson2') {
    // 小汤2：低音C位(C3-G3) + 高音C位(C5-G5) + 中央C
    const t2 = [
      ...BASS_STAFF_NOTES.filter(n => ['C3', 'D3', 'E3', 'F3', 'G3', 'C4'].includes(n.pitch)),
      ...TREBLE_STAFF_NOTES.filter(n => ['C4', 'D4', 'E4', 'F4', 'G4', 'C5', 'D5', 'E5'].includes(n.pitch))
    ];
    return t2;
  }
  if (selectedScope.value === 'beyer') {
    // 拜厄：全谱表快速音程变奏视奏
    return [...TREBLE_STAFF_NOTES, ...BASS_STAFF_NOTES];
  }
  if (selectedScope.value === 'treble') {
    return TREBLE_STAFF_NOTES.filter(n => n.difficulty !== 'advanced');
  }
  return BASS_STAFF_NOTES.filter(n => n.difficulty !== 'advanced');
});

// Generate next question
const generateQuestion = () => {
  isAnswered.value = false;
  selectedKey.value = null;

  const pool = availableNotesPool.value;
  // Pick random target
  const target = pool[Math.floor(Math.random() * pool.length)];
  currentTargetNote.value = target;

  // Pick 3 distractors from same or similar clef
  const distractorsPool = pool.filter(n => n.pitch !== target.pitch);
  const shuffledDistractors = [...distractorsPool].sort(() => 0.5 - Math.random()).slice(0, 3);

  // Combine target + 3 distractors and shuffle
  const rawChoices = [target, ...shuffledDistractors].sort(() => 0.5 - Math.random());
  const keys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

  currentOptions.value = rawChoices.map((note, idx) => ({
    key: keys[idx],
    note
  }));
};

const handleSelectOption = (opt: { key: 'A' | 'B' | 'C' | 'D'; note: StaffNoteItem }) => {
  if (isAnswered.value) return;

  selectedKey.value = opt.key;
  isAnswered.value = true;

  // Play target note audio so ear connects with score
  pianoAudio.playNote(currentTargetNote.value.pitch);

  if (opt.note.pitch === currentTargetNote.value.pitch) {
    // Correct!
    isCorrect.value = true;
    correctCount.value += 1;
    streakCount.value += 1;
    if (streakCount.value > maxStreak.value) {
      maxStreak.value = streakCount.value;
    }
    score.value += 10 + streakCount.value * 2;
    sound.fireMiniSparkles();
  } else {
    // Wrong
    isCorrect.value = false;
    streakCount.value = 0;
    pianoAudio.playWrongChime();
  }
};

const handleNextQuestion = () => {
  if (currentQuestionIndex.value >= totalQuestions.value) {
    // Finish Game
    isFinished.value = true;
    sound.fireCelebrationConfetti();
    userStore.addExp(score.value);
    userStore.addCoins(Math.floor(score.value / 2));
    return;
  }
  currentQuestionIndex.value += 1;
  generateQuestion();
};

const closeResultModal = () => {
  sound.playButtonSound();
  isFinished.value = false;
};

const restartGame = () => {
  currentQuestionIndex.value = 1;
  score.value = 0;
  correctCount.value = 0;
  streakCount.value = 0;
  maxStreak.value = 0;
  isFinished.value = false;
  generateQuestion();
};

const changeScope = (scope: QuizScope) => {
  selectedScope.value = scope;
  restartGame();
};

// Keyboard Hotkey Support (A, B, C, D or 1, 2, 3, 4)
const onKeyDown = (e: KeyboardEvent) => {
  if (isFinished.value && (e.key === 'Escape' || e.key === 'Enter')) {
    e.preventDefault();
    if (e.key === 'Enter') {
      restartGame();
    } else {
      closeResultModal();
    }
    return;
  }
  if (isAnswered.value) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNextQuestion();
    }
    return;
  }
  const keyMap: Record<string, 'A' | 'B' | 'C' | 'D'> = {
    a: 'A', A: 'A', '1': 'A',
    b: 'B', B: 'B', '2': 'B',
    c: 'C', C: 'C', '3': 'C',
    d: 'D', D: 'D', '4': 'D'
  };
  const matchedKey = keyMap[e.key];
  if (matchedKey) {
    const opt = currentOptions.value.find(o => o.key === matchedKey);
    if (opt) {
      handleSelectOption(opt);
    }
  }
};

onMounted(() => {
  generateQuestion();
  window.addEventListener('keydown', onKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
});
</script>

<template>
  <div class="w-full max-w-3xl mx-auto space-y-5">
    <!-- Header Controls: Mode Selector & Score Dashboard -->
    <div class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3.5">
      <!-- Scope Pill Tabs (Curriculum aligned with Thompson 1, 2, and Beyer) -->
      <div class="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 p-1 bg-slate-100 rounded-2xl w-full md:w-auto">
        <button
          type="button"
          class="px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap"
          :class="selectedScope === 'thompson1' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
          @click="changeScope('thompson1')"
        >
          🐣 小汤 1
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap"
          :class="selectedScope === 'thompson2' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
          @click="changeScope('thompson2')"
        >
          🌱 小汤 2
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap"
          :class="selectedScope === 'beyer' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
          @click="changeScope('beyer')"
        >
          🦅 拜厄
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap"
          :class="selectedScope === 'treble' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
          @click="changeScope('treble')"
        >
          𝄞 高音谱
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap"
          :class="selectedScope === 'bass' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
          @click="changeScope('bass')"
        >
          𝄢 低音谱
        </button>
      </div>

      <!-- Stats Counters -->
      <div class="flex items-center justify-center gap-2.5 text-xs font-black shrink-0 w-full md:w-auto">
        <div class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
          <Sparkles class="w-4 h-4 text-amber-500" />
          <span>{{ streakCount }} 连击</span>
        </div>
        <div class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
          <span>得分: {{ score }}</span>
        </div>
        <button
          type="button"
          class="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          :title="isMuted ? '开启声音' : '静音'"
          @click="isMuted = !isMuted; pianoAudio.isMuted = isMuted;"
        >
          <Volume2 v-if="!isMuted" class="w-4 h-4" />
          <VolumeX v-else class="w-4 h-4 text-rose-500" />
        </button>
      </div>
    </div>

    <!-- Main Card Container -->
    <div class="bg-white rounded-3xl p-5 sm:p-7 border-2 border-slate-200/90 shadow-lg space-y-6">
      <!-- Question Progress Bar & Hint Toggle -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xs font-black px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            第 {{ currentQuestionIndex }} / {{ totalQuestions }} 题
          </span>
          <span class="text-xs text-slate-400 font-bold">
            ({{ currentTargetNote.clef === 'treble' ? '高音谱表 𝄞' : '低音谱表 𝄢' }})
          </span>
        </div>

        <button
          type="button"
          class="flex items-center gap-1 text-xs font-bold cursor-pointer transition-colors"
          :class="showHint ? 'text-indigo-600 hover:text-indigo-700' : 'text-slate-400 hover:text-slate-600'"
          @click="showHint = !showHint"
        >
          <HelpCircle class="w-3.5 h-3.5" />
          <span>{{ showHint ? '线间提示：已开启' : '线间提示：已隐藏' }}</span>
        </button>
      </div>

      <!-- Staff Canvas View (Displays Target Note on Staff) -->
      <div class="p-3 bg-amber-50/20 rounded-2xl border border-amber-100 flex flex-col items-center">
        <StaffCanvas
          :clef="currentTargetNote.clef"
          :active-note="currentTargetNote"
          :show-note-name="isAnswered"
          :show-position-badge="showHint || isAnswered"
          :height="160"
        />
      </div>

      <!-- Question Title / Prompt -->
      <div class="text-center space-y-1">
        <h3 class="text-base sm:text-lg font-black text-slate-900">
          👀 瞧一瞧上面的音符，猜猜它读什么音？
        </h3>
        <p class="text-xs text-slate-500 font-medium">
          点击下方 ABCD 选项作答，也可以直接按键盘 A / B / C / D
        </p>
      </div>

      <!-- 4 ABCD Options (Matched Directly to User Image Request) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <button
          v-for="opt in currentOptions"
          :key="opt.key"
          type="button"
          :disabled="isAnswered"
          class="p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between text-left group relative overflow-hidden"
          :class="[
            !isAnswered
              ? 'bg-slate-50/70 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 hover:shadow-md active:scale-98'
              : opt.note.pitch === currentTargetNote.pitch
              ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-2 ring-emerald-300'
              : selectedKey === opt.key
              ? 'bg-rose-50 border-rose-400 shadow-sm'
              : 'bg-slate-50 border-slate-200 opacity-60'
          ]"
          @click="handleSelectOption(opt)"
        >
          <div class="flex items-center gap-3">
            <!-- Key Badge (A, B, C, D) -->
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-colors"
              :class="[
                !isAnswered
                  ? 'bg-white border border-slate-200 text-slate-800 group-hover:bg-indigo-600 group-hover:text-white'
                  : opt.note.pitch === currentTargetNote.pitch
                  ? 'bg-emerald-500 text-white'
                  : selectedKey === opt.key
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-200 text-slate-500'
              ]"
            >
              {{ opt.key }}
            </div>

            <!-- Note Content -->
            <div>
              <div class="text-base font-black text-slate-900 flex items-center gap-1.5">
                <span>{{ opt.note.pitchClass }}</span>
                <span class="text-xs text-indigo-700 font-bold">({{ opt.note.syllable }} / {{ opt.note.syllableZh }})</span>
              </div>
              <div class="text-[11px] text-slate-400 font-medium">
                {{ opt.note.positionName }}
              </div>
            </div>
          </div>

          <!-- Answer Icon Indicator -->
          <div v-if="isAnswered" class="shrink-0">
            <CheckCircle2
              v-if="opt.note.pitch === currentTargetNote.pitch"
              class="w-6 h-6 text-emerald-600 animate-bounce"
            />
            <XCircle
              v-else-if="selectedKey === opt.key"
              class="w-6 h-6 text-rose-500 animate-pulse"
            />
          </div>
        </button>
      </div>

      <!-- Feedback Explanation Banner -->
      <div
        v-if="isAnswered"
        class="p-4 rounded-2xl animate-fade-in transition-all flex flex-col sm:flex-row items-center justify-between gap-3"
        :class="isCorrect ? 'bg-emerald-50/80 border border-emerald-200' : 'bg-amber-50 border border-amber-200'"
      >
        <div class="space-y-0.5 text-center sm:text-left">
          <div class="flex items-center gap-2 justify-center sm:justify-start">
            <span class="text-sm font-black" :class="isCorrect ? 'text-emerald-800' : 'text-amber-900'">
              {{ isCorrect ? '🎉 太棒了，完全正确！' : '💡 小诺助教点拨：' }}
            </span>
            <span class="text-xs font-bold text-slate-600">
              这是【{{ currentTargetNote.positionName }}】的 {{ currentTargetNote.pitchClass }} ({{ currentTargetNote.syllable }})
            </span>
          </div>
          <p class="text-xs text-slate-600 font-medium">
            口诀：{{ currentTargetNote.mnemonic }}
          </p>
        </div>

        <button
          type="button"
          class="px-5 py-2.5 rounded-xl font-black text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm cursor-pointer flex items-center gap-1.5 shrink-0 transition"
          @click="handleNextQuestion"
        >
          <span>{{ currentQuestionIndex >= totalQuestions ? '查看成绩 🏆' : '下一题' }}</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>

      <!-- Integrated Mini Keyboard for Audio-Visual Anchor -->
      <div class="pt-2 border-t border-slate-100">
        <VirtualKeyboard :highlight-pitch="currentTargetNote.pitch" />
      </div>
    </div>

    <!-- Final Result Modal -->
    <div
      v-if="isFinished"
      class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      @click.self="closeResultModal"
    >
      <div class="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-amber-200 text-center space-y-5">
        <!-- Close 'X' Button on Top Right -->
        <button
          type="button"
          class="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
          title="关闭"
          @click="closeResultModal"
        >
          <X class="w-5 h-5" />
        </button>

        <div class="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center text-3xl shadow-inner">
          <Trophy class="w-8 h-8" />
        </div>

        <div>
          <h3 class="text-xl font-black text-slate-900">识谱大闯关圆满完成！</h3>
          <p class="text-xs text-slate-500 mt-1">恭喜你完成 10 题识谱小测验</p>
        </div>

        <div class="grid grid-cols-3 gap-2 text-center p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200">
          <div>
            <div class="text-[10px] text-slate-500 font-bold">最终得分</div>
            <div class="text-xl font-black text-indigo-700">{{ score }}</div>
          </div>
          <div>
            <div class="text-[10px] text-slate-500 font-bold">正确率</div>
            <div class="text-xl font-black text-emerald-600">
              {{ Math.round((correctCount / totalQuestions) * 100) }}%
            </div>
          </div>
          <div>
            <div class="text-[10px] text-slate-500 font-bold">最大连击</div>
            <div class="text-xl font-black text-amber-600">{{ maxStreak }} 🔥</div>
          </div>
        </div>

        <p class="text-xs text-slate-600 font-medium">
          已奖励 <span class="font-bold text-amber-600">+{{ Math.floor(score / 2) }} 金币</span> 与 <span class="font-bold text-indigo-600">+{{ score }} 经验</span>！
        </p>

        <!-- Two Action Buttons: Close vs Play Again -->
        <div class="flex items-center gap-3 pt-1">
          <button
            type="button"
            class="flex-1 py-3 rounded-2xl font-black text-xs sm:text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 cursor-pointer transition"
            @click="closeResultModal"
          >
            关闭
          </button>
          <button
            type="button"
            class="flex-1 py-3 rounded-2xl font-black text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md cursor-pointer transition"
            @click="restartGame"
          >
            再玩一局 🎵
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

