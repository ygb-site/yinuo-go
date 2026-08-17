<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { useTsumegoStore } from '../stores/tsumegoStore';
import { sound } from '../utils/sound';
import {
  Gamepad2,
  Puzzle,
  Bot,
  Grid,
  BookMarked,
  UserCheck,
  ArrowRight,
  Sparkles
} from 'lucide-vue-next';

const router = useRouter();
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
    path: '/tsumego',
    title: '每日死活题',
    titleEn: 'Daily Tsumego',
    badge: '每日必练',
    badgeColor: 'bg-rose-500',
    desc: '精选吃子、做眼、杀棋、对杀经典题库，AI陪你智能互动走子拆解！',
    icon: Puzzle,
    gradient: 'from-rose-400 via-orange-500 to-amber-500',
    stats: () => `已攻克 ${tsumegoStore.totalSolvedCount} 道死活题`
  },
  {
    path: '/ai-match',
    title: '人机对弈场',
    titleEn: 'AI Arena',
    badge: '5只萌宠大师',
    badgeColor: 'bg-indigo-500',
    desc: '小狗贝贝、小猫喵喵、狐狸阿福、熊猫师傅等你来挑战，支持实时辅助！',
    icon: Bot,
    gradient: 'from-indigo-400 via-purple-500 to-pink-500',
    stats: () => '支持 5x5 到 19x19 棋盘'
  },
  {
    path: '/free-board',
    title: '自由打谱台',
    titleEn: 'Sandbox & SGF',
    badge: '自由演练',
    badgeColor: 'bg-blue-500',
    desc: '双人面对面下棋、自由摆设死活局、SGF棋谱导入导出与多分支复盘！',
    icon: Grid,
    gradient: 'from-blue-400 via-sky-500 to-teal-500',
    stats: () => '支持 SGF 导入导出'
  },
  {
    path: '/dictionary',
    title: '术语小字典',
    titleEn: 'Go Dictionary',
    badge: '中英双解',
    badgeColor: 'bg-amber-500',
    desc: '“气、叫吃、倒扑、真眼假眼、金角银边”图解速查与趣味小黑板试玩！',
    icon: BookMarked,
    gradient: 'from-amber-400 via-orange-500 to-yellow-500',
    stats: () => '24 个精编图文知识点'
  },
  {
    path: '/profile',
    title: '成长成就馆',
    titleEn: 'Kid Profile & Badges',
    badge: '荣誉殿堂',
    badgeColor: 'bg-violet-500',
    desc: '查看你的棋力段位进阶之路、点亮闪亮成就勋章、切换糖果/翡翠个性皮肤！',
    icon: UserCheck,
    gradient: 'from-violet-400 via-purple-500 to-indigo-500',
    stats: () => `已解锁 ${userStore.unlockedBadges.length} 枚成就`
  }
];
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FDFBF7] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 select-none">
    <div class="max-w-7xl mx-auto space-y-8">
      
      <!-- Top Welcome Banner & Mascot -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 p-6 sm:p-10 shadow-xl border-4 border-white">
        <!-- Floating background sparkles -->
        <div class="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div class="absolute right-20 top-4 text-5xl opacity-20 pointer-events-none">✨</div>

        <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="space-y-3 text-center md:text-left">
            <div class="inline-flex items-center gap-2 bg-white/30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-black shadow-sm">
              <Sparkles class="w-3.5 h-3.5" />
              <span>少儿围棋启蒙世界 · 开启聪明大脑</span>
            </div>
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-wide drop-shadow-md">
              欢迎来到 一诺围棋！
            </h1>
            <p class="text-white/90 text-sm sm:text-base font-semibold max-w-xl">
              你好，{{ userStore.hasProfile ? userStore.nickname : '小棋手' }}！黑白子就像神奇的黑白精灵，在小小的棋盘上筑造属于你的智慧城堡吧！
            </p>

            <!-- Quick Action Buttons -->
            <div class="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <button
                @click="navigate('/learn')"
                class="px-6 py-3.5 rounded-2xl bg-white text-orange-600 font-black shadow-lg shadow-orange-700/20 hover:bg-orange-50 transform transition hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <span>开启闯关大冒险</span>
                <ArrowRight class="w-5 h-5" />
              </button>
              <button
                @click="navigate('/ai-match')"
                class="px-6 py-3.5 rounded-2xl bg-orange-600/30 hover:bg-orange-600/40 text-white font-black backdrop-blur-sm border-2 border-white/50 transform transition hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <span>挑战萌宠 AI</span>
                <span>🐶</span>
              </button>
            </div>
          </div>

          <!-- Mascot Portrait -->
          <div class="w-full md:w-auto flex justify-center">
            <div class="bg-white/85 backdrop-blur-md rounded-3xl p-5 border-2 border-white shadow-2xl max-w-xs text-center">
              <div class="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-amber-300 to-orange-400 p-1 mb-2 shadow flex items-center justify-center">
                <span class="text-5xl">🐼</span>
              </div>
              <div class="font-black text-base text-gray-800">导师 · 小诺</div>
              <p class="text-xs text-orange-600 font-bold mb-3">“今天准备好学一个新吃子妙招了吗？”</p>

              <div class="grid grid-cols-2 gap-2 text-center text-xs font-bold bg-orange-50/80 rounded-xl p-2 border border-orange-100">
                <div>
                  <div class="text-gray-500 text-[10px]">棋力段位</div>
                  <div class="text-amber-800 font-black">{{ userStore.currentRank.title }}</div>
                </div>
                <div>
                  <div class="text-gray-500 text-[10px]">闯关星星</div>
                  <div class="text-rose-600 font-black">⭐ {{ userStore.totalStars }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature Modes Grid -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🚀</span>
            <h2 class="text-xl sm:text-2xl font-black text-gray-800">精彩学习模块</h2>
          </div>

        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="card in featureCards"
            :key="card.path"
            @click="navigate(card.path)"
            class="group bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-200 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div class="space-y-4">
              <!-- Top Row: Icon & Badge -->
              <div class="flex items-center justify-between">
                <div
                  class="w-14 h-14 rounded-2xl bg-gradient-to-tr p-3 text-white shadow-md group-hover:rotate-6 transition-transform flex items-center justify-center"
                  :class="card.gradient"
                >
                  <component :is="card.icon" class="w-8 h-8" />
                </div>
                <span
                  class="text-[11px] font-black text-white px-2.5 py-1 rounded-full shadow-sm"
                  :class="card.badgeColor"
                >
                  {{ card.badge }}
                </span>
              </div>

              <!-- Title & Bilingual Subtitle -->
              <div>
                <h3 class="text-lg font-black text-gray-900 group-hover:text-orange-600 transition-colors flex items-center gap-2">
                  <span>{{ card.title }}</span>
                  <ArrowRight class="w-4 h-4 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all text-orange-500" />
                </h3>
                <span class="text-xs font-bold text-gray-400">{{ card.titleEn }}</span>
              </div>

              <!-- Description -->
              <p class="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
                {{ card.desc }}
              </p>
            </div>

            <!-- Footer Stats -->
            <div class="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500">
              <span>{{ card.stats() }}</span>
              <span class="text-orange-500 font-extrabold group-hover:underline">进入 →</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

