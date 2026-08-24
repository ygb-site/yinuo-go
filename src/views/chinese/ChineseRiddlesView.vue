<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  RIDDLES_DATA,
  RIDDLE_CATEGORIES,
  type RiddleItem,
  type RiddleCategory
} from '../../data/riddlesData';
import { useUserStore } from '../../stores/useUserStore';
import { useAiTutorStore } from '../../stores/useAiTutorStore';
import { sound } from '../../utils/sound';
import { speakText, stopSpeech } from '../../utils/speech';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Lightbulb,
  RotateCw,
  Volume2,
  Dices,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Coins
} from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();
const tutorStore = useAiTutorStore();

// 玩法模式: 'card' (卡片翻翻乐) | 'quiz' (10题闯关赛) | 'daily' (每日一谜)
const playMode = ref<'card' | 'quiz' | 'daily'>('card');

// 过滤筛选
const selectedCategory = ref<RiddleCategory | 'all'>('all');
const selectedDifficulty = ref<'all' | 'easy' | 'medium' | 'hard'>('all');
const searchQuery = ref('');

// 过滤后的题库列表
const filteredRiddles = computed(() => {
  return RIDDLES_DATA.filter((r) => {
    const matchCat = selectedCategory.value === 'all' || r.category === selectedCategory.value;
    const matchDiff = selectedDifficulty.value === 'all' || r.difficulty === selectedDifficulty.value;
    const matchQuery =
      !searchQuery.value.trim() ||
      r.question.includes(searchQuery.value.trim()) ||
      r.answer.includes(searchQuery.value.trim()) ||
      r.categoryName.includes(searchQuery.value.trim());
    return matchCat && matchDiff && matchQuery;
  });
});

// ==========================================
// 🎴 卡片翻翻乐模式状态 (Card Flip Mode)
// ==========================================
const currentCardIdx = ref(0);
const isFlipped = ref(false);
const showHint = ref(false);

const currentCard = computed<RiddleItem>(() => {
  const list = filteredRiddles.value;
  if (list.length === 0) return RIDDLES_DATA[0];
  return list[currentCardIdx.value % list.length] || list[0];
});

function flipCard() {
  sound.playButtonSound();
  isFlipped.value = !isFlipped.value;
  if (isFlipped.value) {
    userStore.addCoins(2, '探索谜语答案', '🪙');
  }
}

function nextCard() {
  sound.playButtonSound();
  stopSpeech();
  isFlipped.value = false;
  showHint.value = false;
  if (filteredRiddles.value.length > 0) {
    currentCardIdx.value = (currentCardIdx.value + 1) % filteredRiddles.value.length;
  }
  syncTutorContext();
}

function prevCard() {
  sound.playButtonSound();
  stopSpeech();
  isFlipped.value = false;
  showHint.value = false;
  if (filteredRiddles.value.length > 0) {
    currentCardIdx.value =
      (currentCardIdx.value - 1 + filteredRiddles.value.length) % filteredRiddles.value.length;
  }
  syncTutorContext();
}

function randomCard() {
  sound.playButtonSound();
  stopSpeech();
  isFlipped.value = false;
  showHint.value = false;
  if (filteredRiddles.value.length > 0) {
    currentCardIdx.value = Math.floor(Math.random() * filteredRiddles.value.length);
  }
  syncTutorContext();
}

function toggleHint() {
  sound.playButtonSound();
  showHint.value = !showHint.value;
}

function readQuestion() {
  sound.playButtonSound();
  speakText(currentCard.value.question);
}

function readAnswer() {
  sound.playButtonSound();
  speakText('谜底是：' + currentCard.value.answer + '。' + currentCard.value.explanation);
}

// 同步上下文到 AI 助教
function syncTutorContext() {
  if (currentCard.value) {
    tutorStore.setContext({
      subjectId: 'chinese',
      questionPrompt: currentCard.value.question,
      correctAnswer: currentCard.value.answer,
      knowledgePointTitle: '智趣谜语 · ' + currentCard.value.categoryName,
      lessonTitle: currentCard.value.categoryName
    });
  }
}

// ==========================================
// 🏆 10 题冲关答题模式状态 (Quiz Mode)
// ==========================================
const quizQuestions = ref<RiddleItem[]>([]);
const quizIdx = ref(0);
const quizScore = ref(0);
const quizSelectedOption = ref<string | null>(null);
const isQuizSubmitted = ref(false);
const isQuizFinished = ref(false);

function startQuiz() {
  sound.playButtonSound();
  playMode.value = 'quiz';
  const shuffled = [...RIDDLES_DATA].sort(() => Math.random() - 0.5);
  quizQuestions.value = shuffled.slice(0, 10);
  quizIdx.value = 0;
  quizScore.value = 0;
  quizSelectedOption.value = null;
  isQuizSubmitted.value = false;
  isQuizFinished.value = false;
}

const currentQuizItem = computed<RiddleItem | null>(() => {
  return quizQuestions.value[quizIdx.value] || null;
});

function handleSelectQuizOption(opt: string) {
  if (isQuizSubmitted.value || !currentQuizItem.value) return;
  quizSelectedOption.value = opt;
  isQuizSubmitted.value = true;

  if (opt === currentQuizItem.value.answer) {
    quizScore.value += 10;
    sound.playWinSound();
    userStore.addCoins(10, '谜语闯关答对', '🌟');
    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    } catch {}
  } else {
    sound.playErrorSound();
    // 自动收录到错题本
    userStore.recordSubjectMistake({
      subjectId: 'chinese',
      topic: '智趣谜语',
      knowledgePointTitle: currentQuizItem.value.categoryName,
      questionPrompt: currentQuizItem.value.question,
      userAnswer: opt,
      correctAnswer: currentQuizItem.value.answer,
      errorCategory: 'concept',
      errorReason: currentQuizItem.value.explanation
    });
  }
}

function nextQuizQuestion() {
  sound.playButtonSound();
  stopSpeech();
  if (quizIdx.value >= quizQuestions.value.length - 1) {
    isQuizFinished.value = true;
    sound.playVictorySound();
    userStore.addCoins(30, '谜语挑战大获全胜', '🏆');
    userStore.addExp(50);
    try {
      confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
    } catch {}
  } else {
    quizIdx.value++;
    quizSelectedOption.value = null;
    isQuizSubmitted.value = false;
  }
}

// ==========================================
// 📅 每日一谜状态 (Daily Riddle)
// ==========================================
const isDailyChecked = computed(() => {
  if (!userStore.hasProfile) return false;
  const today = new Date().toLocaleDateString("en-CA");
  return userStore.currentProfile.lastDailyRiddleDate === today;
});

const dailyRiddle = computed<RiddleItem>(() => {
  const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return RIDDLES_DATA[dayOfYear % RIDDLES_DATA.length] || RIDDLES_DATA[0];
});

function handleClaimDaily() {
  if (isDailyChecked.value) return;
  const res = userStore.claimDailyRiddleReward();
  if (res.success) {
    sound.playWinSound();
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch {}
  }
}

onMounted(() => {
  syncTutorContext();
});
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-5 sm:py-7 space-y-6">

    <!-- Header 标题栏 -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-5 sm:p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
      <div class="relative z-10 flex items-center gap-3">
        <button
          @click="router.push('/subject/chinese')"
          class="w-10 h-10 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition active:scale-95 flex-shrink-0"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">🧩</span>
            <h1 class="text-xl sm:text-2xl font-black tracking-wide">智趣谜语与脑筋急转弯</h1>
          </div>
          <p class="text-xs text-amber-100 font-medium mt-0.5">
            汉字拆字谜 · 动植物童谣物谜 · 搞笑幽默急转弯 · 趣味灯谜大冲关
          </p>
        </div>
      </div>

      <!-- 模式切换 Tabs -->
      <div class="relative z-10 flex items-center gap-1.5 bg-black/20 p-1 rounded-2xl backdrop-blur-md self-start sm:self-auto">
        <button
          @click="playMode = 'card'; sound.playButtonSound();"
          :class="[
            'px-3.5 py-1.5 rounded-xl text-xs font-black transition',
            playMode === 'card' ? 'bg-white text-amber-900 shadow-sm' : 'text-white/80 hover:text-white'
          ]"
        >
          🎴 卡片翻翻乐
        </button>
        <button
          @click="startQuiz()"
          :class="[
            'px-3.5 py-1.5 rounded-xl text-xs font-black transition',
            playMode === 'quiz' ? 'bg-white text-amber-900 shadow-sm' : 'text-white/80 hover:text-white'
          ]"
        >
          🏆 冲关答题
        </button>
        <button
          @click="playMode = 'daily'; sound.playButtonSound();"
          :class="[
            'px-3.5 py-1.5 rounded-xl text-xs font-black transition',
            playMode === 'daily' ? 'bg-white text-amber-900 shadow-sm' : 'text-white/80 hover:text-white'
          ]"
        >
          📅 每日一谜
        </button>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 模式 1: 🎴 趣味卡片翻翻乐 (Card Flip Mode) -->
    <!-- ========================================== -->
    <div v-if="playMode === 'card'" class="space-y-5">
      <!-- 类别筛选标签 -->
      <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
        <button
          v-for="cat in RIDDLE_CATEGORIES"
          :key="cat.id"
          @click="selectedCategory = cat.id; currentCardIdx = 0; sound.playButtonSound(); syncTutorContext();"
          :class="[
            'px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 whitespace-nowrap transition border-2 shadow-2xs flex-shrink-0',
            selectedCategory === cat.id
              ? 'bg-amber-500 text-white border-amber-600 shadow-sm scale-102'
              : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300'
          ]"
        >
          <span>{{ cat.icon }}</span>
          <span>{{ cat.name }}</span>
        </button>
      </div>

      <!-- 3D 翻转卡片主体容器 -->
      <div class="perspective-container py-2 flex justify-center">
        <div
          :class="['flip-card w-full max-w-xl min-h-[340px] cursor-pointer transition-transform duration-500', isFlipped ? 'flipped' : '']"
          @click="flipCard()"
        >
          <!-- 卡片正面 (谜面) -->
          <div class="card-face card-front bg-white border-4 border-amber-300 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between select-none">
            <!-- 卡片头部标签 -->
            <div class="flex items-center justify-between">
              <span class="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-black border border-amber-200">
                {{ currentCard.categoryName }} · {{ currentCard.difficultyName }}
              </span>
              <div class="flex items-center gap-1">
                <button
                  @click.stop="readQuestion()"
                  class="w-9 h-9 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 flex items-center justify-center transition active:scale-95 shadow-2xs"
                  title="普通话朗读谜面"
                >
                  <Volume2 class="w-4 h-4 text-amber-700" />
                </button>
              </div>
            </div>

            <!-- 谜面文本 -->
            <div class="text-center my-6 space-y-3">
              <div class="text-4xl">🤔</div>
              <h2 class="text-lg sm:text-2xl font-black text-gray-900 leading-relaxed drop-shadow-2xs">
                {{ currentCard.question }}
              </h2>
            </div>

            <!-- 提示区域与翻转提示 -->
            <div class="space-y-3">
              <!-- 提示内容 -->
              <div v-if="showHint" class="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs font-bold text-amber-900 text-center animate-fade-in">
                💡 线索提示：{{ currentCard.hint }}
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                <button
                  @click.stop="toggleHint()"
                  class="flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-900 py-1 px-2.5 rounded-xl hover:bg-amber-50 transition"
                >
                  <Lightbulb class="w-4 h-4 text-amber-500" />
                  <span>{{ showHint ? '收起提示' : '看点提示 💡' }}</span>
                </button>

                <div class="text-xs font-black text-amber-600 flex items-center gap-1 animate-bounce">
                  <span>点击卡片揭晓答案</span>
                  <RotateCw class="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          <!-- 卡片背面 (谜底与解析) -->
          <div class="card-face card-back bg-gradient-to-br from-amber-400 via-orange-400 to-amber-300 border-4 border-amber-200 rounded-3xl p-6 sm:p-8 shadow-xl text-white flex flex-col justify-between select-none">
            <div class="flex items-center justify-between">
              <span class="px-3 py-1 bg-white/90 text-amber-900 rounded-full text-xs font-black shadow-xs">
                🎉 谜底揭晓
              </span>
              <button
                @click.stop="readAnswer()"
                class="w-9 h-9 rounded-full bg-white/30 hover:bg-white/50 text-white flex items-center justify-center transition active:scale-95"
                title="朗读答案与解析"
              >
                <Volume2 class="w-4 h-4" />
              </button>
            </div>

            <div class="text-center my-6 space-y-3">
              <div class="text-xs text-amber-100 font-bold">答案是：</div>
              <div class="text-3xl sm:text-4xl font-black text-white drop-shadow-md tracking-wider">
                {{ currentCard.answer }}
              </div>
              <p class="text-xs sm:text-sm text-amber-50 font-medium leading-relaxed max-w-md mx-auto pt-2">
                {{ currentCard.explanation }}
              </p>
            </div>

            <div class="text-center text-xs text-amber-100 font-bold border-t border-white/30 pt-3">
              点击卡片可翻回正面 🔄
            </div>
          </div>
        </div>
      </div>

      <!-- 底部卡片切换控制器 -->
      <div class="flex items-center justify-center gap-3">
        <button
          @click="prevCard()"
          class="px-4 py-2.5 bg-white hover:bg-amber-50 border-2 border-amber-200 text-amber-900 rounded-2xl text-xs font-black shadow-sm transition active:scale-95 flex items-center gap-1"
        >
          <ChevronLeft class="w-4 h-4" />
          <span>上一题</span>
        </button>

        <button
          @click="randomCard()"
          class="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl text-xs font-black shadow-md transition active:scale-95 flex items-center gap-1.5"
        >
          <Dices class="w-4 h-4" />
          <span>随机抽一题 🎲</span>
        </button>

        <button
          @click="nextCard()"
          class="px-4 py-2.5 bg-white hover:bg-amber-50 border-2 border-amber-200 text-amber-900 rounded-2xl text-xs font-black shadow-sm transition active:scale-95 flex items-center gap-1"
        >
          <span>下一题</span>
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 模式 2: 🏆 10 题冲关答题模式 (Quiz Game) -->
    <!-- ========================================== -->
    <div v-else-if="playMode === 'quiz'" class="max-w-xl mx-auto space-y-5">
      <!-- 答题进行中 -->
      <div v-if="!isQuizFinished && currentQuizItem" class="bg-white border-4 border-amber-300 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
        <!-- 进度条与得分 -->
        <div class="flex items-center justify-between text-xs font-black text-gray-700">
          <span>第 {{ quizIdx + 1 }} / {{ quizQuestions.length }} 题</span>
          <span class="text-amber-600 flex items-center gap-1">
            <Coins class="w-4 h-4 text-amber-500" />
            <span>得分: {{ quizScore }}</span>
          </span>
        </div>

        <!-- 进度条 -->
        <div class="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
            :style="{ width: ((quizIdx + 1) / quizQuestions.length) * 100 + '%' }"
          ></div>
        </div>

        <!-- 题干 -->
        <div class="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 text-center space-y-2">
          <div class="text-xs font-bold text-amber-800">{{ currentQuizItem.categoryName }}</div>
          <div class="text-base sm:text-xl font-black text-gray-900 leading-relaxed">
            {{ currentQuizItem.question }}
          </div>
        </div>

        <!-- 4 选 1 选项卡片 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            v-for="(opt, idx) in currentQuizItem.options"
            :key="idx"
            @click="handleSelectQuizOption(opt)"
            :disabled="isQuizSubmitted"
            :class="[
              'p-4 rounded-2xl font-black text-sm border-2 transition-all flex items-center justify-between text-left shadow-2xs',
              isQuizSubmitted
                ? opt === currentQuizItem.answer
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-md'
                  : quizSelectedOption === opt
                  ? 'bg-rose-500 text-white border-rose-600'
                  : 'bg-gray-50 text-gray-400 border-gray-200 opacity-60'
                : 'bg-white hover:bg-amber-50/60 text-gray-800 border-gray-200 hover:border-amber-300'
            ]"
          >
            <span>{{ opt }}</span>
            <span v-if="isQuizSubmitted && opt === currentQuizItem.answer" class="text-xs font-black">
              ✅ 正确
            </span>
          </button>
        </div>

        <!-- 提交后的解析与下一题按钮 -->
        <div v-if="isQuizSubmitted" class="space-y-4 pt-2 border-t border-gray-100 animate-fade-in">
          <div
            :class="[
              'p-3.5 rounded-2xl text-xs sm:text-sm font-bold leading-relaxed',
              quizSelectedOption === currentQuizItem.answer
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            ]"
          >
            <div>{{ quizSelectedOption === currentQuizItem.answer ? '🎉 太聪明啦！完全正确！' : '❌ 别灰心，记住正解哦！' }}</div>
            <div class="text-xs font-medium mt-1">{{ currentQuizItem.explanation }}</div>
          </div>

          <button
            @click="nextQuizQuestion()"
            class="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-2xl text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-1"
          >
            <span>{{ quizIdx >= quizQuestions.length - 1 ? '查看通关成绩 🏆' : '下一题 ➡️' }}</span>
          </button>
        </div>
      </div>

      <!-- 闯关结算页面 -->
      <div v-else-if="isQuizFinished" class="bg-white border-4 border-amber-300 rounded-3xl p-8 shadow-xl text-center space-y-5">
        <div class="w-20 h-20 rounded-full bg-amber-100 border-2 border-amber-300 mx-auto flex items-center justify-center text-4xl shadow-inner animate-bounce">
          🏆
        </div>
        <div class="space-y-1">
          <h2 class="text-2xl font-black text-gray-900">恭喜完成谜语闯关挑战！</h2>
          <p class="text-xs text-gray-500 font-bold">思维敏捷 · 智慧过人</p>
        </div>

        <div class="bg-amber-50 p-5 rounded-2xl border border-amber-200 flex justify-around items-center">
          <div>
            <div class="text-xs text-gray-500 font-bold">最终得分</div>
            <div class="text-3xl font-black text-amber-600 mt-0.5">{{ quizScore }} <span class="text-xs">分</span></div>
          </div>
          <div class="h-8 w-px bg-amber-200"></div>
          <div>
            <div class="text-xs text-gray-500 font-bold">奖励金币与经验</div>
            <div class="text-2xl font-black text-amber-600 mt-0.5 flex items-center gap-1">
              <span>🪙 +30</span><span>✨ +50</span>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="playMode = 'card'"
            class="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl text-xs transition"
          >
            返回卡片乐园
          </button>
          <button
            @click="startQuiz()"
            class="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-2xl text-xs shadow-md transition active:scale-95"
          >
            再来一轮 🚀
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 模式 3: 📅 每日一谜打卡 (Daily Riddle) -->
    <!-- ========================================== -->
    <div v-else-if="playMode === 'daily'" class="max-w-xl mx-auto bg-white border-4 border-orange-300 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
      <div class="flex items-center justify-between border-b border-orange-100 pb-3">
        <span class="px-3 py-1 bg-orange-100 text-orange-900 rounded-full text-xs font-black">
          📅 今日精选挑战
        </span>
        <span class="text-xs font-bold text-gray-500">每日更新 · 打卡奖励 30 🪙</span>
      </div>

      <div class="space-y-4">
        <div class="text-4xl">🌟</div>
        <h2 class="text-lg sm:text-2xl font-black text-gray-900 leading-relaxed">
          {{ dailyRiddle.question }}
        </h2>
      </div>

      <div v-if="isDailyChecked" class="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-sm font-black space-y-1 animate-fade-in">
        <div>🎉 谜底：{{ dailyRiddle.answer }}</div>
        <div class="text-xs font-medium text-emerald-700">{{ dailyRiddle.explanation }}</div>
      </div>

      <button
        v-if="!isDailyChecked"
        @click="handleClaimDaily()"
        class="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black rounded-2xl text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
      >
        <Sparkles class="w-4 h-4" />
        <span>揭晓答案并打卡领取 30 金币 🪙</span>
      </button>

      <div v-else class="text-xs font-bold text-gray-400">
        今日已完成打卡，明天记得再来探索新谜题哦！
      </div>
    </div>

  </div>
</template>

<style scoped>
.perspective-container {
  perspective: 1000px;
}
.flip-card {
  position: relative;
  transform-style: preserve-3d;
}
.flip-card.flipped {
  transform: rotateY(180deg);
}
.card-face {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.card-back {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transform: rotateY(180deg);
}
.scale-102 {
  transform: scale(1.02);
}
.animate-fade-in {
  animation: fadeIn 0.25s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
