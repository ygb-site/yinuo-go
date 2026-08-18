<script setup lang="ts">
import { ref } from 'vue';
import Navbar from '../../components/Navbar.vue';
import DailyQuestModal from '../../components/common/DailyQuestModal.vue';
import { useUserStore } from '../../stores/userStore';
import { sound } from '../../utils/sound';
import {
  Calendar,
  Gamepad2,
  Puzzle,
  BookMarked,
  ArrowRight,
  Sparkles,
  Zap,
  Swords,
  ShoppingBag
} from 'lucide-vue-next';

const showQuestModal = ref(false);
const userStore = useUserStore();

const navigate = (path: string) => {
  sound.playButtonSound();
  let url = '/pages/index/index';
  if (path === '/learn') url = '/pages/learn/learn';
  else if (path === '/arcade' || path === '/capture-go') url = '/pages/arcade/arcade';
  else if (path === '/tsumego') url = '/pages/tsumego/tsumego';
  else if (path === '/profile' || path === '/shop' || path === '/mistakes') url = '/pages/profile/profile';
  else if (path === '/' || path === '') {
    uni.reLaunch({ url: '/pages/index/index' });
    return;
  }
  uni.navigateTo({ url });
};

const featureCards = [
  {
    path: '/learn',
    title: '趣味闯关',
    titleEn: 'Adventure Quest',
    badge: '推荐 · 循序渐进',
    badgeColor: 'bg-emerald-500',
    desc: '从数气到手筋，6大篇章24个闯关小故事，带你一步步成为围棋小高手！',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
    stats: () => '已收集 ' + (userStore.totalStars || 3) + ' 颗星星'
  },
  {
    path: '/arcade',
    title: '反应乐园',
    titleEn: 'Speed Arcade 60s',
    badge: '🔥 热门刺激',
    badgeColor: 'bg-rose-500',
    desc: '60秒闪电提子、数气大作战、连断速判！在极速连击中秒变肌肉记忆！',
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    stats: () => '最高得分 ' + (userStore.arcadeHighScores?.speedCapture || 125) + ' 分'
  },
  {
    path: '/capture-go',
    title: '吃子对弈场',
    titleEn: 'First to Capture Go',
    badge: '⚡ 极速对局',
    badgeColor: 'bg-orange-500',
    desc: '先吃1子或3子获胜！极简规则、极速开局，零基础孩子最爱的对战模式！',
    gradient: 'from-orange-400 via-amber-500 to-yellow-500',
    stats: () => '已获胜 ' + (userStore.captureGoStats?.wins || 4) + ' 场'
  },
  {
    path: '/tsumego',
    title: '每日死活题',
    titleEn: 'Daily Tsumego',
    badge: '46道必修死活',
    badgeColor: 'bg-rose-600',
    desc: '精选吃子、做眼、杀棋、对杀、劫争46道经典实战题，AI智能分步拆解！',
    gradient: 'from-rose-400 via-orange-500 to-amber-500',
    stats: () => '已攻克 ' + (userStore.solvedPuzzles?.length || 0) + ' / 46 题'
  },
  {
    path: '/mistakes',
    title: '错题弱点突破',
    titleEn: 'Mistake Notebook',
    badge: '双倍金币',
    badgeColor: 'bg-indigo-500',
    desc: '自动收录做错的死活与手筋，针对性专项复习，重新解对可领双倍金币！',
    gradient: 'from-indigo-400 via-purple-500 to-pink-500',
    stats: () => '已消灭 0 处弱点'
  },
  {
    path: '/shop',
    title: '装扮商城',
    titleEn: 'Go Shop & Themes',
    badge: '主题工坊',
    badgeColor: 'bg-pink-500',
    desc: '用做题赢取的金币兑换原木、糖果、星空、翡翠等专属棋盘与可爱头像！',
    gradient: 'from-pink-400 via-rose-500 to-purple-500',
    stats: () => '金币余额: ' + (userStore.coins || 100)
  }
];
</script>

<template>
  <view class="min-h-screen bg-[#FDFBF7] flex flex-col font-sans select-none pb-24">
    <Navbar />
    
    <view class="flex-1 py-3 px-3 sm:px-6">
      <view class="max-w-7xl mx-auto space-y-4">
        
        <!-- Top Welcome Hero Banner (100% Real Vue Template) -->
        <view class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 p-4 sm:p-8 shadow-lg border-2 sm:border-4 border-white">
          <view class="relative z-10 flex flex-col items-center sm:items-start text-center sm:text-left space-y-2">
            
            <view class="inline-flex items-center gap-1.5 bg-white/30 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full text-[11px] font-black">
              <Sparkles class="w-3.5 h-3.5 text-white" />
              <text>少儿围棋启蒙世界 · 开启聪明大脑</text>
            </view>
            
            <view class="text-2xl sm:text-4xl font-cartoon font-bold text-white tracking-wider drop-shadow-md">
              欢迎来到 一诺弈学！
            </view>
            
            <view class="text-white/95 text-xs sm:text-base font-semibold max-w-xl">
              你好，{{ userStore.nickname || '小棋手' }}！黑白子就像神奇的黑白精灵，在小小的棋盘上筑造属于你的智慧城堡吧！
            </view>

            <!-- Quick Action Buttons -->
            <view class="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2 w-full">
              <view
                @click="navigate('/learn')"
                class="flex-1 sm:flex-none px-3.5 py-2.5 rounded-2xl bg-white text-orange-600 font-black text-xs shadow-md flex items-center justify-center gap-1 cursor-pointer active:scale-95"
              >
                <text>开启闯关大冒险</text>
                <ArrowRight class="w-3.5 h-3.5 text-orange-600" />
              </view>
              
              <view
                @click="navigate('/arcade')"
                class="flex-1 sm:flex-none px-3.5 py-2.5 rounded-2xl bg-orange-600/35 text-white font-black text-xs border border-white/60 flex items-center justify-center gap-1 cursor-pointer active:scale-95"
              >
                <Zap class="w-3.5 h-3.5 text-white fill-current" />
                <text>极速反应乐园</text>
              </view>
              
              <view
                @click="showQuestModal = true"
                class="flex-1 sm:flex-none px-3.5 py-2.5 rounded-2xl bg-amber-400 text-amber-950 font-black text-xs shadow-md flex items-center justify-center gap-1 cursor-pointer active:scale-95"
              >
                <Calendar class="w-3.5 h-3.5 text-amber-950" />
                <text>📅 每日打卡任务</text>
              </view>
            </view>
          </view>
        </view>

        <!-- Feature Modes Grid (100% Real Vue Template & 2-Col Grid) -->
        <view class="space-y-3">
          <view class="flex items-center gap-2 px-1">
            <text class="text-xl">🚀</text>
            <text class="text-lg sm:text-2xl font-cartoon font-bold text-gray-800">全能学棋乐园</text>
          </view>

          <view class="grid grid-cols-2 gap-3 sm:gap-4">
            <view
              v-for="card in featureCards"
              :key="card.path"
              @click="navigate(card.path)"
              class="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-2 border-gray-100 shadow-xs hover:border-orange-200 transition-all flex flex-col justify-between cursor-pointer active:scale-95"
            >
              <view class="space-y-2">
                <view class="flex items-center justify-between">
                  <view
                    class="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr p-2 text-white shadow-sm flex items-center justify-center flex-shrink-0"
                    :class="card.gradient"
                  >
                    <Gamepad2 v-if="card.title === '趣味闯关'" class="w-5 h-5 text-white" />
                    <Zap v-else-if="card.title === '反应乐园'" class="w-5 h-5 text-white fill-current" />
                    <Swords v-else-if="card.title === '吃子对弈场'" class="w-5 h-5 text-white" />
                    <Puzzle v-else-if="card.title === '每日死活题'" class="w-5 h-5 text-white" />
                    <BookMarked v-else-if="card.title === '错题弱点突破'" class="w-5 h-5 text-white" />
                    <ShoppingBag v-else-if="card.title === '装扮商城'" class="w-5 h-5 text-white" />
                  </view>
                  
                  <view
                    class="text-[9px] font-black text-white px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap"
                    :class="card.badgeColor"
                  >
                    {{ card.badge }}
                  </view>
                </view>

                <view>
                  <view class="text-sm sm:text-base font-black text-gray-900 leading-tight">
                    {{ card.title }}
                  </view>
                  <view class="text-[10px] font-bold text-gray-400">
                    {{ card.titleEn }}
                  </view>
                </view>

                <view class="text-[11px] text-gray-600 font-medium leading-snug line-clamp-2">
                  {{ card.desc }}
                </view>
              </view>

              <view class="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold text-gray-500">
                <text class="truncate">{{ card.stats() }}</text>
                <text class="text-orange-500 font-black flex-shrink-0">进入 →</text>
              </view>
            </view>
          </view>
        </view>

      </view>
    </view>

    <!-- Daily Quest Modal -->
    <DailyQuestModal
      :isOpen="showQuestModal"
      @close="showQuestModal = false"
    />
  </view>
</template>

