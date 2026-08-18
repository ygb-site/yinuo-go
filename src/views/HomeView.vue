<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import DailyQuestModal from '../components/common/DailyQuestModal.vue';
import { useUserStore } from '../stores/userStore';
import { useTsumegoStore } from '../stores/tsumegoStore';
import { sound } from '../utils/sound';
import {
  Calendar,
  Gamepad2,
  Puzzle,
  Bot,
  Grid,
  BookMarked,
  ArrowRight,
  Sparkles,
  Zap,
  Swords,
  ShoppingBag,
  Users,
  Music
} from 'lucide-vue-next';

const router = useRouter();
const showQuestModal = ref(false);
const userStore = useUserStore();
const tsumegoStore = useTsumegoStore();

const navigate = (path: string) => {
  sound.playButtonSound();
  router.push(path);
};

const featureCards = [
  {
    path: '/learn',
    title: '趣味闯关',
    titleEn: 'Adventure Quest',
    badge: '推荐 · 循序渐进',
    badgeColor: 'bg-emerald-500',
    desc: '从数气到手筋，6大篇章24个闯关小故事，带你一步步成为围棋小高手！',
    icon: Gamepad2,
    gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
    stats: () => `已收集 ${userStore.totalStars} 颗星星`
  },
  {
    path: '/arcade',
    title: '反应乐园',
    titleEn: 'Speed Arcade 60s',
    badge: '🔥 热门刺激',
    badgeColor: 'bg-rose-500',
    desc: '60秒闪电提子、数气大作战、连断速判！在极速连击中秒变肌肉记忆！',
    icon: Zap,
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    stats: () => `最高得分 ${userStore.arcadeHighScores.speedCapture || 0} 分`
  },
  {
    path: '/capture-go',
    title: '吃子对弈场',
    titleEn: 'First to Capture Go',
    badge: '⚡ 极速对局',
    badgeColor: 'bg-orange-500',
    desc: '先吃1子或3子获胜！极简规则、极速开局，零基础孩子最爱的对战模式！',
    icon: Swords,
    gradient: 'from-orange-400 via-amber-500 to-yellow-500',
    stats: () => `已获胜 ${userStore.captureGoStats.wins} 场`
  },
  {
    path: '/tsumego',
    title: '每日死活题',
    titleEn: 'Daily Tsumego',
    badge: '46道必修死活',
    badgeColor: 'bg-rose-600',
    desc: '精选吃子、做眼、杀棋、对杀、劫争46道经典实战题，AI智能分步拆解！',
    icon: Puzzle,
    gradient: 'from-rose-400 via-orange-500 to-amber-500',
    stats: () => `已攻克 ${tsumegoStore.totalSolvedCount} / ${tsumegoStore.totalPuzzlesCount} 题`
  },
  {
    path: '/mistakes',
    title: '错题弱点突破',
    titleEn: 'Mistake Notebook',
    badge: '双倍金币',
    badgeColor: 'bg-indigo-500',
    desc: '自动收录做错的死活与手筋，针对性专项复习，重新解对可领双倍金币！',
    icon: BookMarked,
    gradient: 'from-indigo-400 via-purple-500 to-pink-500',
    stats: () => `已消灭 ${userStore.solvedMistakes.length} 处弱点`
  },
  {
    path: '/shop',
    title: '装扮商城',
    titleEn: 'Go Shop & Themes',
    badge: '主题工坊',
    badgeColor: 'bg-pink-500',
    desc: '用做题赢取的金币兑换原木、糖果、星空、翡翠等专属棋盘与可爱头像！',
    icon: ShoppingBag,
    gradient: 'from-pink-400 via-rose-500 to-purple-500',
    stats: () => `金币余额: ${userStore.coins}`
  },
  {
    path: '/two-player',
    title: '亲子面对面',
    titleEn: 'Pass & Play Local',
    badge: '双人同屏',
    badgeColor: 'bg-purple-500',
    desc: '平板或电脑平放两人对局，带计时钟、气数辅助、叫吃预警与一键悔棋！',
    icon: Users,
    gradient: 'from-purple-400 via-indigo-500 to-blue-500',
    stats: () => '5x5 到 13x13 盘面'
  },
  {
    path: '/rhymes',
    title: '棋理口诀卡',
    titleEn: 'Go Rhyme Cards',
    badge: '朗朗上口',
    badgeColor: 'bg-amber-600',
    desc: '金角银边草肚皮、棋逢断处生、有打有吃莫慌张，点击卡片即时动态演示！',
    icon: Music,
    gradient: 'from-yellow-400 via-amber-500 to-orange-500',
    stats: () => '6 套精选经典儿歌'
  },
  {
    path: '/ai-match',
    title: '人机对弈场',
    titleEn: 'AI Arena',
    badge: '5只萌宠大师',
    badgeColor: 'bg-blue-500',
    desc: '小狗贝贝、小猫喵喵、狐狸阿福、小诺师傅等你来挑战，支持实时辅助！',
    icon: Bot,
    gradient: 'from-blue-400 via-sky-500 to-indigo-500',
    stats: () => '5x5 到 19x19 棋盘'
  },
  {
    path: '/free-board',
    title: '自由打谱台',
    titleEn: 'Sandbox & SGF',
    badge: '自由演练',
    badgeColor: 'bg-teal-500',
    desc: '自由摆设死活局、SGF棋谱导入导出与多分支复盘！',
    icon: Grid,
    gradient: 'from-teal-400 via-emerald-500 to-cyan-500',
    stats: () => 'SGF 导入导出'
  }
];
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-4 sm:py-8 lg:py-10 px-3 sm:px-6 lg:px-8 select-none">
    <div class="max-w-7xl mx-auto space-y-5 sm:space-y-8">
      
      <!-- Top Welcome Hero Banner -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 p-4 sm:p-8 lg:p-10 shadow-lg border-2 sm:border-4 border-white">
        <div class="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div class="absolute right-12 top-4 text-3xl sm:text-5xl opacity-20 pointer-events-none">✨</div>

        <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div class="space-y-2 sm:space-y-3 text-center md:text-left w-full md:w-auto">
            <div class="inline-flex items-center gap-1.5 bg-white/30 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full text-[11px] font-black shadow-xs">
              <Sparkles class="w-3.5 h-3.5" />
              <span>少儿围棋启蒙世界 · 开启聪明大脑</span>
            </div>
            
            <h1 class="text-2xl sm:text-4xl lg:text-5xl font-cartoon font-bold text-white tracking-wider drop-shadow-md">
              欢迎来到 一诺围棋！
            </h1>
            
            <p class="text-white/95 text-xs sm:text-base font-semibold max-w-xl line-clamp-2 sm:line-clamp-none">
              你好，{{ userStore.hasProfile ? userStore.nickname : '小棋手' }}！黑白子就像神奇的黑白精灵，在小小的棋盘上筑造属于你的智慧城堡吧！
            </p>

            <!-- Quick Action Buttons -->
            <div class="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 pt-1">
              <button
                @click="navigate('/learn')"
                class="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-white text-orange-600 font-black text-xs sm:text-sm shadow-md hover:bg-orange-50 transform transition hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>开启闯关大冒险</span>
                <ArrowRight class="w-4 h-4" />
              </button>
              <button
                @click="navigate('/arcade')"
                class="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-orange-600/30 hover:bg-orange-600/40 text-white font-black text-xs sm:text-sm backdrop-blur-sm border border-white/50 transform transition hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap class="w-4 h-4 fill-current" />
                <span>极速反应乐园</span>
              </button>
              <button
                @click="showQuestModal = true"
                class="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs sm:text-sm shadow-md transform transition hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Calendar class="w-4 h-4" />
                <span>📅 每日打卡任务</span>
              </button>
            </div>
          </div>

          <!-- Mascot Card -->
          <div class="hidden md:flex flex-shrink-0 justify-center">
            <div class="bg-white/85 backdrop-blur-md rounded-3xl p-5 border-2 border-white shadow-xl max-w-xs text-center">
              <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-gradient-to-tr from-amber-300 to-orange-400 p-1 mb-2 shadow flex items-center justify-center">
                <span class="text-4xl sm:text-5xl">🐼</span>
              </div>
              <div class="font-black text-sm sm:text-base text-gray-800">导师 · 小诺</div>
              <p class="text-xs text-orange-600 font-bold mb-3">“今天准备好学一个新吃子妙招了吗？”</p>

              <div class="grid grid-cols-2 gap-2 text-center text-xs font-bold bg-orange-50/80 rounded-xl p-2 border border-orange-100">
                <div>
                  <div class="text-gray-500 text-[10px]">棋力段位</div>
                  <div class="text-amber-800 font-black">{{ userStore.currentRank.title }}</div>
                </div>
                <div>
                  <div class="text-gray-500 text-[10px]">金币余额</div>
                  <div class="text-rose-600 font-black">🪙 {{ userStore.coins }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature Modes Grid -->
      <div class="space-y-3 sm:space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl sm:text-2xl">🚀</span>
            <h2 class="text-lg sm:text-2xl font-cartoon font-bold text-gray-800 tracking-wide">全能学棋乐园</h2>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          <div
            v-for="card in featureCards"
            :key="card.path"
            @click="navigate(card.path)"
            class="group bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border-2 border-gray-100 shadow-xs hover:shadow-lg hover:border-orange-200 transition-all duration-200 transform hover:-translate-y-1 active:scale-95 cursor-pointer flex flex-col justify-between"
          >
            <div class="space-y-2 sm:space-y-3">
              <div class="flex items-center justify-between">
                <div
                  class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr p-2 text-white shadow-sm group-hover:rotate-6 transition-transform flex items-center justify-center flex-shrink-0"
                  :class="card.gradient"
                >
                  <component :is="card.icon" class="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span
                  class="text-[9px] sm:text-[10px] font-black text-white px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap"
                  :class="card.badgeColor"
                >
                  {{ card.badge }}
                </span>
              </div>

              <div>
                <h3 class="text-sm sm:text-base font-black text-gray-900 group-hover:text-orange-600 transition-colors flex items-center justify-between">
                  <span>{{ card.title }}</span>
                  <ArrowRight class="w-3.5 h-3.5 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline" />
                </h3>
                <span class="text-[10px] font-bold text-gray-400">{{ card.titleEn }}</span>
              </div>

              <p class="text-[11px] text-gray-600 font-medium leading-snug line-clamp-2">
                {{ card.desc }}
              </p>
            </div>

            <div class="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold text-gray-500">
              <span class="truncate">{{ card.stats() }}</span>
              <span class="text-orange-500 font-black group-hover:underline flex-shrink-0">进入 →</span>
            </div>
          </div>
        </div>
      </div>

    </div>
    <!-- Daily Quest Modal -->
    <DailyQuestModal
      :isOpen="showQuestModal"
      @close="showQuestModal = false"
    />
  </div>
</template>

