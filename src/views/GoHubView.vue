<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../stores/useUserStore';
import { useUnlockStore } from '../stores/unlockStore';
import { sound } from '../utils/sound';
import { showConfirm } from '../utils/alert';
import { getLocalGameRecords } from '../services/gameRecordsService';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  History,
  Play
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const unlockStore = useUnlockStore();

// Active Game Pavilion Tab: 'checkers' | 'gomoku' | 'go' | 'records'
type GameTab = 'checkers' | 'gomoku' | 'go' | 'records';
const activeTab = ref<GameTab>('checkers');

// Check URL query param for default tab
onMounted(() => {
  const queryTab = route.query.tab as GameTab;
  if (queryTab && ['checkers', 'gomoku', 'go', 'records'].includes(queryTab)) {
    activeTab.value = queryTab;
  }
});


// Go Specific Categories
const goCategories = computed(() => [
  {
    title: '🧭 围棋启蒙学堂 (Learn)',
    desc: '趣味小故事由浅入深，从数气、吃子到做活手筋',
    items: [
      {
        id: 'adventure',
        name: '趣味主线地图 (22关)',
        nameEn: 'Adventure Map',
        icon: '🧭',
        desc: '故事启发动画演示，循序渐进闯关升级',
        route: '/adventure',
        badge: '主线核心',
        isUnlocked: true
      },
      {
        id: 'dictionary',
        name: '中英双语小词典',
        nameEn: 'Go Dictionary',
        icon: '📚',
        desc: '图文解析气、断、长、立、征吃等术语',
        route: '/dictionary',
        badge: '随身宝典',
        isUnlocked: true
      },
      {
        id: 'rhymes',
        name: '经典棋理口诀卡',
        nameEn: 'Go Rhyme Cards',
        icon: '🎵',
        desc: '金角银边草肚皮、棋逢断处生动态演示',
        route: '/rhymes',
        badge: '随时学唱',
        isUnlocked: true
      }
    ]
  },
  {
    title: '🔥 专项做题与训练 (Practice)',
    desc: '针对性强化死活、反应手筋与错题复习',
    items: [
      {
        id: 'tsumego',
        name: '每日死活题训练营 (46题)',
        nameEn: 'Daily Tsumego Camp',
        icon: '🎯',
        desc: '精选吃子、做眼、对杀必修题，AI分步拆解',
        route: '/tsumego',
        badge: '46道必修',
        isUnlocked: unlockStore.isFeatureUnlocked('tsumego')
      },
      {
        id: "sudoku",
        name: "智趣数独王国 (4/6/9宫格)",
        nameEn: "Sudoku Logic",
        icon: "🧩",
        desc: "数字与水果萌宠四宫格、六宫格、九宫格逻辑大挑战",
        route: "/sudoku",
        badge: "思维探险",
        isUnlocked: true
      },
      {
        id: 'arcade',
        name: '极速反应乐园 (60s)',
        nameEn: 'Speed Arcade',
        icon: '🕹️',
        desc: '闪电提子、数气大作战、连断速判限时冲榜',
        route: '/arcade',
        badge: '极速连击',
        isUnlocked: unlockStore.isFeatureUnlocked('arcade')
      },
      {
        id: 'free-board',
        name: '自由打谱与摆谱台',
        nameEn: 'Free Board & SGF',
        icon: '📐',
        desc: '自由摆设死活局与多分支复盘',
        route: '/free-board',
        badge: '打谱工具',
        isUnlocked: unlockStore.isFeatureUnlocked('free-board')
      },
      {
        id: 'worksheet',
        name: 'A4高清打印习题纸',
        nameEn: 'Printable Worksheets',
        icon: '🖨️',
        desc: '保护视力，一键生成线下纸质围棋作业',
        route: '/worksheet',
        badge: '线下纸质',
        isUnlocked: unlockStore.isFeatureUnlocked('worksheet')
      }
    ]
  },
  {
    title: '⚔️ 实战博弈与考级 (Battle)',
    desc: '从吃子快棋到萌宠AI对弈与模拟定级考',
    items: [
      {
        id: 'capture-go',
        name: '极速吃子对弈场',
        nameEn: 'Capture Go',
        icon: '⚡',
        desc: '先吃1子或3子获胜，零基础孩子最爱对决',
        route: '/capture-go',
        badge: '先吃即胜',
        isUnlocked: unlockStore.isFeatureUnlocked('capture-go')
      },
      {
        id: 'ai-match',
        name: '5只萌宠AI对弈大师',
        nameEn: 'Mascot AI Match',
        icon: '🤖',
        desc: '小贝、喵喵、阿福多段位伴学对弈',
        route: '/ai-match',
        badge: 'AI伴学',
        isUnlocked: unlockStore.isFeatureUnlocked('ai-match')
      },
      {
        id: 'two-player',
        name: '亲子面对面同屏对弈',
        nameEn: 'Pass & Play',
        icon: '👥',
        desc: '平板平放两人对弈，带计时钟与气数辅助',
        route: '/two-player',
        badge: '双人同屏',
        isUnlocked: unlockStore.isFeatureUnlocked('two-player')
      },
      {
        id: 'rank-exam',
        name: '少儿段级位模拟考',
        nameEn: 'Rank Exam',
        icon: '🏆',
        desc: '模拟正规少儿定级考，考取专属荣誉证书',
        route: '/rank-exam',
        badge: '考取证书',
        isUnlocked: unlockStore.isFeatureUnlocked('rank-exam')
      }
    ]
  }
]);

// All Recent Game Records for Replay (Optimized on-demand loading)
const recentRecords = ref(getLocalGameRecords('all'));
const refreshRecords = () => {
  recentRecords.value = getLocalGameRecords('all');
};

const navigate = (path: string) => {
  sound.playButtonSound();
  router.push(path);
};

const handleGoFeatureClick = (item: any) => {
  if (!item.isUnlocked) {
    sound.playErrorSound();
    showConfirm({
      title: '暂未解锁该玩法',
      message: '小棋手别着急！该玩法需要先通过前置主线关卡开启哦！快去继续闯关吧！',
      type: 'warning',
      confirmText: '前往闯关',
      cancelText: '知道了'
    }).then(confirmed => {
      if (confirmed) router.push('/adventure');
    });
    return;
  }
  navigate(item.route);
};

const goCampus = () => {
  sound.playButtonSound();
  router.push('/');
};
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-3 sm:py-6 lg:py-8 px-2.5 sm:px-6 lg:px-8 select-none font-sans">
    <div class="max-w-6xl mx-auto space-y-4 sm:space-y-6">

      <!-- Breadcrumb Bar -->
      <div class="flex items-center justify-between gap-2">
        <button
          @click="goCampus"
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-amber-100/80 hover:bg-amber-200 text-amber-900 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-all active:scale-95 border border-amber-300 shadow-2xs cursor-pointer shrink-0"
        >
          <ArrowLeft class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>返回学堂大厅</span>
        </button>

        <div class="flex items-center gap-1.5 min-w-0">
          <span class="text-xs font-black text-emerald-900 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-300">
            ♟️⭐⚪ 一诺奕学 · 智趣棋艺馆
          </span>
        </div>
      </div>
      
      <!-- Top Grand Banner -->
      <div class="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-4 sm:p-6 lg:p-7 shadow-lg border-2 sm:border-4 border-white">
        <div class="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div class="absolute right-8 top-3 text-3xl sm:text-5xl opacity-20 pointer-events-none">✨</div>

        <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="space-y-2 text-center md:text-left w-full md:w-auto">
            <div class="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black">
              <Sparkles class="w-3.5 h-3.5 text-amber-300" />
              <span>少儿智趣博弈大厅 · 棋类天地</span>
            </div>
            
            <h1 class="text-xl sm:text-3xl lg:text-4xl font-cartoon font-bold text-white tracking-wider drop-shadow-md">
              一诺奕学 · 智趣棋艺馆
            </h1>
            
            <p class="text-white/95 text-xs sm:text-sm font-semibold max-w-xl leading-relaxed">
              你好，{{ userStore.hasProfile ? userStore.nickname : '小棋手' }}！跳棋、五子棋、围棋三大核心棋馆已为你准备就绪，选择你喜爱的棋类开启博弈探险吧！
            </p>
          </div>

          <!-- Quick Gold & Stars Stat -->
          <div class="bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 text-center border-2 border-white shadow-md shrink-0 flex items-center gap-4">
            <div class="text-center">
              <div class="text-[10px] text-gray-500 font-bold">棋力段位</div>
              <div class="text-emerald-800 font-black text-sm">{{ userStore.currentRank.title }}</div>
            </div>
            <div class="w-px h-8 bg-gray-200"></div>
            <div class="text-center">
              <div class="text-[10px] text-gray-500 font-bold">金币 / 星星</div>
              <div class="text-amber-600 font-black text-sm">🪙 {{ userStore.coins }} · ⭐ {{ userStore.totalStars }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 🌟 Navigation Tabs for 3 Equal-Level Games + Review Hub -->
      <div class="bg-white rounded-2xl p-1 sm:p-2 border-2 border-gray-200 shadow-xs flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
        <button
          @click="activeTab = 'checkers'"
          class="flex-1 shrink-0 py-2 sm:py-3 px-2 sm:px-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap"
          :class="activeTab === 'checkers' ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 shadow-md transform scale-[1.02]' : 'text-gray-600 hover:bg-gray-100'"
        >
          <span class="text-sm sm:text-base">⭐</span>
          <span class="sm:hidden">六角跳棋</span>
          <span class="hidden sm:inline">快乐跳棋馆</span>
          <span class="hidden md:inline text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950 text-amber-300 font-bold">推荐</span>
        </button>

        <button
          @click="activeTab = 'gomoku'"
          class="flex-1 shrink-0 py-2 sm:py-3 px-2 sm:px-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap"
          :class="activeTab === 'gomoku' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md transform scale-[1.02]' : 'text-gray-600 hover:bg-gray-100'"
        >
          <span class="text-sm sm:text-base">⚪</span>
          <span class="sm:hidden">经典五子棋</span>
          <span class="hidden sm:inline">经典五子棋</span>
        </button>

        <button
          @click="activeTab = 'go'"
          class="flex-1 shrink-0 py-2 sm:py-3 px-2 sm:px-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap"
          :class="activeTab === 'go' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md transform scale-[1.02]' : 'text-gray-600 hover:bg-gray-100'"
        >
          <span class="text-sm sm:text-base">♟️</span>
          <span class="sm:hidden">少儿围棋</span>
          <span class="hidden sm:inline">少儿围棋馆</span>
        </button>

        <button
          @click="activeTab = 'records'; refreshRecords()"
          class="flex-1 shrink-0 py-2 sm:py-3 px-2 sm:px-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap"
          :class="activeTab === 'records' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md transform scale-[1.02]' : 'text-gray-600 hover:bg-gray-100'"
        >
          <History class="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span class="sm:hidden">对局复盘</span>
          <span class="hidden sm:inline">全棋类复盘</span>
        </button>
      </div>

      <!-- ========================================== -->
      <!-- TAB 1: 快乐跳棋专区 (Chinese Checkers)      -->
      <!-- ========================================== -->
      <div v-if="activeTab === 'checkers'" class="space-y-4 animate-fade-in">
        <!-- Big Hero Portal Card -->
        <div class="bg-gradient-to-br from-amber-50 via-rose-50 to-amber-100 rounded-3xl p-5 sm:p-7 border-3 border-amber-300 shadow-md flex flex-col md:flex-row items-center justify-between gap-5">
          <div class="space-y-2 text-center md:text-left">
            <div class="flex items-center justify-center md:justify-start gap-2">
              <span class="text-3xl">⭐</span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950">
                亲子最爱 · 连跳搭桥
              </span>
            </div>
            <h2 class="text-xl sm:text-3xl font-cartoon font-bold text-gray-900">快乐六角跳棋 (少儿益智版)</h2>
            <p class="text-xs sm:text-sm text-gray-600 font-medium max-w-lg leading-relaxed">
              专为少儿优化的一键连跳飞跃！点选弹珠自动高亮连跳路线，支持萌宠AI、亲子同屏、7大连跳解密关卡与分步复盘！
            </p>
          </div>

          <button
            @click="navigate('/checkers')"
            class="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-amber-500/30 transform transition hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Play class="w-5 h-5 fill-slate-950" />
            <span>进入跳棋对战主页</span>
            <ArrowRight class="w-5 h-5" />
          </button>
        </div>

        <!-- 4 Sub-mode Tiles -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div
            @click="navigate('/checkers')"
            class="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border-2 border-gray-200 hover:border-amber-400 shadow-xs hover:shadow-lg transition-all transform hover:-translate-y-1 active:scale-98 cursor-pointer flex flex-col justify-between"
          >
            <div class="space-y-2">
              <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">
                🤖
              </div>
              <h3 class="font-bold text-base text-gray-900">萌宠人机对战</h3>
              <p class="text-xs text-gray-500 leading-relaxed">
                🐼 萌宝(简单)、🦊 小狐(中等)、🐉 龙龙(大师)，自由选择AI对手练习！
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-gray-100 text-xs font-bold text-amber-600 flex items-center justify-between">
              <span>立即对战</span>
              <ArrowRight class="w-4 h-4" />
            </div>
          </div>

          <div
            @click="navigate('/checkers')"
            class="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border-2 border-gray-200 hover:border-purple-400 shadow-xs hover:shadow-lg transition-all transform hover:-translate-y-1 active:scale-98 cursor-pointer flex flex-col justify-between"
          >
            <div class="space-y-2">
              <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl">
                👥
              </div>
              <h3 class="font-bold text-base text-gray-900">亲子双人同屏</h3>
              <p class="text-xs text-gray-500 leading-relaxed">
                平板或电脑平放，红蓝双方轮流执子，家庭亲子益智互动首选！
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-gray-100 text-xs font-bold text-purple-600 flex items-center justify-between">
              <span>面对面对局</span>
              <ArrowRight class="w-4 h-4" />
            </div>
          </div>

          <div
            @click="navigate('/checkers')"
            class="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border-2 border-gray-200 hover:border-emerald-400 shadow-xs hover:shadow-lg transition-all transform hover:-translate-y-1 active:scale-98 cursor-pointer flex flex-col justify-between"
          >
            <div class="space-y-2">
              <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl">
                🧩
              </div>
              <h3 class="font-bold text-base text-gray-900">连跳解密闯关 (7关)</h3>
              <p class="text-xs text-gray-500 leading-relaxed">
                轻盈一跃、双重连跳、五星连珠超级跳！分步训练搭桥跳跃技巧！
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-gray-100 text-xs font-bold text-emerald-600 flex items-center justify-between">
              <span>关卡挑战</span>
              <ArrowRight class="w-4 h-4" />
            </div>
          </div>

          <div
            @click="navigate('/checkers')"
            class="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border-2 border-gray-200 hover:border-cyan-400 shadow-xs hover:shadow-lg transition-all transform hover:-translate-y-1 active:scale-98 cursor-pointer flex flex-col justify-between"
          >
            <div class="space-y-2">
              <div class="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-2xl">
                📜
              </div>
              <h3 class="font-bold text-base text-gray-900">棋谱记录与复盘</h3>
              <p class="text-xs text-gray-500 leading-relaxed">
                每局棋谱自动记录，分步滑动推演，随时从任意步接盘探索！
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-gray-100 text-xs font-bold text-cyan-600 flex items-center justify-between">
              <span>查看复盘</span>
              <ArrowRight class="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 2: 经典五子棋专区 (Gomoku)             -->
      <!-- ========================================== -->
      <div v-if="activeTab === 'gomoku'" class="space-y-4 animate-fade-in">
        <!-- Big Hero Portal Card -->
        <div class="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-5 sm:p-7 border-3 border-blue-300 shadow-md flex flex-col md:flex-row items-center justify-between gap-5">
          <div class="space-y-2 text-center md:text-left">
            <div class="flex items-center justify-center md:justify-start gap-2">
              <span class="text-3xl">⚪</span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-500 text-white">
                黑白连珠 · 攻防兼备
              </span>
            </div>
            <h2 class="text-xl sm:text-3xl font-cartoon font-bold text-gray-900">经典五子棋 (AI胜率分析版)</h2>
            <p class="text-xs sm:text-sm text-gray-600 font-medium max-w-lg leading-relaxed">
              15×15 经典榧木五子棋盘！AI实时胜率走势图、绝杀妙手标注、冲四活三杀法残局与智能复盘！
            </p>
          </div>

          <button
            @click="navigate('/gomoku')"
            class="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base shadow-lg shadow-blue-500/30 transform transition hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Play class="w-5 h-5 fill-white" />
            <span>进入五子棋对战主页</span>
            <ArrowRight class="w-5 h-5" />
          </button>
        </div>

        <!-- 4 Sub-mode Tiles -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div
            @click="navigate('/gomoku')"
            class="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border-2 border-gray-200 hover:border-blue-400 shadow-xs hover:shadow-lg transition-all transform hover:-translate-y-1 active:scale-98 cursor-pointer flex flex-col justify-between"
          >
            <div class="space-y-2">
              <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">
                🤖
              </div>
              <h3 class="font-bold text-base text-gray-900">萌宠人机对战</h3>
              <p class="text-xs text-gray-500 leading-relaxed">
                3种AI难度，AI攻防严密，体验精彩黑白攻防较量！
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-gray-100 text-xs font-bold text-blue-600 flex items-center justify-between">
              <span>立即对局</span>
              <ArrowRight class="w-4 h-4" />
            </div>
          </div>

          <div
            @click="navigate('/gomoku')"
            class="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border-2 border-gray-200 hover:border-purple-400 shadow-xs hover:shadow-lg transition-all transform hover:-translate-y-1 active:scale-98 cursor-pointer flex flex-col justify-between"
          >
            <div class="space-y-2">
              <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl">
                👥
              </div>
              <h3 class="font-bold text-base text-gray-900">亲子双人对战</h3>
              <p class="text-xs text-gray-500 leading-relaxed">
                黑先白后面对面对弈，带落子声音与悔棋功能！
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-gray-100 text-xs font-bold text-purple-600 flex items-center justify-between">
              <span>同屏下棋</span>
              <ArrowRight class="w-4 h-4" />
            </div>
          </div>

          <div
            @click="navigate('/gomoku')"
            class="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border-2 border-gray-200 hover:border-amber-400 shadow-xs hover:shadow-lg transition-all transform hover:-translate-y-1 active:scale-98 cursor-pointer flex flex-col justify-between"
          >
            <div class="space-y-2">
              <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl">
                🧩
              </div>
              <h3 class="font-bold text-base text-gray-900">杀法闯关 (4关)</h3>
              <p class="text-xs text-gray-500 leading-relaxed">
                一步连五、冲四活三、双活三做杀、绝地反击等经典死活题！
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-gray-100 text-xs font-bold text-amber-600 flex items-center justify-between">
              <span>残局破阵</span>
              <ArrowRight class="w-4 h-4" />
            </div>
          </div>

          <div
            @click="navigate('/gomoku')"
            class="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border-2 border-gray-200 hover:border-cyan-400 shadow-xs hover:shadow-lg transition-all transform hover:-translate-y-1 active:scale-98 cursor-pointer flex flex-col justify-between"
          >
            <div class="space-y-2">
              <div class="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-2xl">
                📊
              </div>
              <h3 class="font-bold text-base text-gray-900">AI胜率图与复盘</h3>
              <p class="text-xs text-gray-500 leading-relaxed">
                全程胜率波动走势曲线，妙手与败着标注，分步复盘！
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-gray-100 text-xs font-bold text-cyan-600 flex items-center justify-between">
              <span>复盘分析</span>
              <ArrowRight class="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 3: 少儿围棋馆 (Classic Go / Weiqi)     -->
      <!-- ========================================== -->
      <div v-if="activeTab === 'go'" class="space-y-5 animate-fade-in">
        <!-- Big Hero Portal Card -->
        <div class="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl p-5 sm:p-7 border-3 border-emerald-300 shadow-md flex flex-col md:flex-row items-center justify-between gap-5">
          <div class="space-y-2 text-center md:text-left">
            <div class="flex items-center justify-center md:justify-start gap-2">
              <span class="text-3xl">♟️</span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-white">
                大局思维 · 循序渐进
              </span>
            </div>
            <h2 class="text-xl sm:text-3xl font-cartoon font-bold text-gray-900">少儿经典围棋馆 (22关主线)</h2>
            <p class="text-xs sm:text-sm text-gray-600 font-medium max-w-lg leading-relaxed">
              从吃子魔法到死活城堡！包含22节启蒙微课、46道必修死活、吃子快棋、5只AI萌宠与少儿定级考！
            </p>
          </div>

          <button
            @click="navigate('/adventure')"
            class="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-500/30 transform transition hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Play class="w-5 h-5 fill-white" />
            <span>进入围棋主线闯关</span>
            <ArrowRight class="w-5 h-5" />
          </button>
        </div>

        <!-- 3 Neat Sub-Categories for Go -->
        <div v-for="cat in goCategories" :key="cat.title" class="space-y-3">
          <div class="px-1">
            <h3 class="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <span>{{ cat.title }}</span>
            </h3>
            <p class="text-xs text-gray-400 font-medium">{{ cat.desc }}</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div
              v-for="item in cat.items"
              :key="item.id"
              @click="handleGoFeatureClick(item)"
              class="relative rounded-2xl p-4 border-2 transition-all duration-200 flex flex-col justify-between cursor-pointer group"
              :class="item.isUnlocked ? 'bg-white border-gray-200 hover:border-emerald-400 shadow-xs hover:shadow-lg transform hover:-translate-y-0.5' : 'bg-gray-50 border-gray-200 opacity-70'"
            >
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-2xl">{{ item.icon }}</span>
                  <span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {{ item.badge }}
                  </span>
                </div>
                <h4 class="font-bold text-sm sm:text-base text-gray-900 group-hover:text-emerald-600 transition-colors">
                  {{ item.name }}
                </h4>
                <p class="text-xs text-gray-500 leading-relaxed line-clamp-2">
                  {{ item.desc }}
                </p>
              </div>

              <div class="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-emerald-600">
                <span>{{ item.isUnlocked ? '立即进入' : '🔒 待解锁' }}</span>
                <ArrowRight class="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 4: 全棋类对局记录与复盘中心            -->
      <!-- ========================================== -->
      <div v-if="activeTab === 'records'" class="space-y-4 animate-fade-in">
        <div class="bg-white rounded-3xl p-5 sm:p-7 border-2 border-gray-200 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 class="text-lg sm:text-xl font-cartoon font-bold text-gray-900 flex items-center gap-2">
                <History class="w-5 h-5 text-indigo-600" />
                <span>全棋类对局记录与智能复盘中心</span>
              </h2>
              <p class="text-xs text-gray-400 mt-0.5">
                自动收录跳棋、五子棋与围棋历史棋谱，支持每局分步复盘与AI胜率曲线！
              </p>
            </div>
            <span class="text-xs font-bold text-gray-500">
              共保存 {{ recentRecords.length }} 局棋谱
            </span>
          </div>

          <div class="space-y-2.5">
            <div
              v-for="rec in recentRecords"
              :key="rec.id"
              class="bg-gray-50 hover:bg-amber-50/50 rounded-2xl p-3.5 border border-gray-200 hover:border-amber-300 flex items-center justify-between gap-3 transition-all"
            >
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0 bg-white border border-gray-200 shadow-2xs">
                  {{ rec.gameType === 'checkers' ? '⭐' : rec.gameType === 'gomoku' ? '⚪' : '♟️' }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      {{ rec.gameTypeName }} · {{ rec.modeName }}
                    </span>
                    <span class="text-xs font-bold text-gray-800">
                      胜者: {{ rec.winnerAvatar }} {{ rec.winnerName }}
                    </span>
                  </div>
                  <div class="text-[11px] text-gray-400 mt-1 flex items-center gap-2">
                    <span>总步数: {{ rec.totalMoves }} 步</span>
                    <span>•</span>
                    <span>{{ rec.playedAt }}</span>
                  </div>
                </div>
              </div>

              <button
                @click="navigate(rec.gameType === 'checkers' ? '/checkers' : rec.gameType === 'gomoku' ? '/gomoku' : '/ai-match')"
                class="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95 transition-all"
              >
                <Play class="w-3.5 h-3.5 fill-white" />
                <span>进入复盘</span>
              </button>
            </div>

            <div v-if="recentRecords.length === 0" class="text-center py-12 text-gray-400 text-sm">
              <span class="text-4xl block mb-2">📭</span>
              <span>暂无历史对局棋谱，快去下一盘棋吧！</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>

