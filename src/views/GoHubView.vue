<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/useUserStore';
import { useUnlockStore } from '../stores/unlockStore';
import { sound } from '../utils/sound';
import { showConfirm } from '../utils/alert';
import { getLocalGameRecords } from '../services/gameRecordsService';
import {
  ArrowRight,
  Sparkles,
  History,
  Play
} from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();
const unlockStore = useUnlockStore();

// Go Specific Categories
const goCategories = computed(() => [
  {
    title: '🧭 围棋启蒙学堂 (Learn)',
    desc: '术语图解与棋理口诀，随时翻看巩固',
    items: [
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
    desc: '针对性强化死活、做眼与对杀练习',
    items: [
      {
        id: 'tsumego',
        name: '死活题训练营 (46题)',
        nameEn: 'Tsumego Camp',
        icon: '🎯',
        desc: '精选吃子、做眼、对杀必修题，AI分步拆解',
        route: '/tsumego',
        badge: '46道必修',
        isUnlocked: unlockStore.isFeatureUnlocked('tsumego')
      }
    ]
  }
]);

// Go History Records
const goRecords = ref(getLocalGameRecords('go'));


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
</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FAF8F5] py-4 md:py-8 px-3.5 sm:px-6 lg:px-8 select-none font-sans">
    <div class="max-w-6xl mx-auto space-y-6 sm:space-y-8">

      <!-- Top Grand Banner -->
      <div class="gohub-banner relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-6 sm:p-8 shadow-md border-2 border-white/80">
        <div class="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div class="absolute right-8 top-3 text-3xl sm:text-5xl opacity-20 pointer-events-none">♟️</div>

        <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
          <div class="space-y-2 text-center md:text-left w-full md:w-auto">
            <div class="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
              <Sparkles class="w-3.5 h-3.5 text-amber-300" />
              <span>少儿围棋天地 · 启蒙与进阶</span>
            </div>
            
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-wide drop-shadow-sm">
              少儿围棋天地 ♟️
            </h1>
            
            <p class="text-white/95 text-xs sm:text-sm font-medium max-w-xl leading-relaxed">
              你好，{{ userStore.hasProfile ? userStore.nickname : '小棋手' }}！从吃子魔法到死活城堡，22节启蒙微课、46道必修死活题与5只阶梯AI萌宠伴学，助你快速成长为围棋小高手！
            </p>
          </div>

          <!-- Quick Gold & Stars Stat -->
          <div class="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 text-center border-2 border-white shadow-sm shrink-0 flex items-center gap-4">
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

      <!-- Hero Action Portal Card -->
      <div class="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl p-5 sm:p-7 border-2 border-emerald-300/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5">
        <div class="space-y-2 text-center md:text-left">
          <div class="flex items-center justify-center md:justify-start gap-2">
            <span class="text-3xl">🧭</span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white">
              故事闯关 · 循序渐进
            </span>
          </div>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900">启蒙主线动画地图 (22关)</h2>
          <p class="text-xs sm:text-sm text-slate-600 font-medium max-w-lg leading-relaxed">
            跟随着小诺一起探险围棋王国！从气的奥秘、吃子技巧到做眼死活与整盘实战！
          </p>
        </div>

        <button
          @click="navigate('/adventure')"
          class="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow-md transform transition hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Play class="w-5 h-5 fill-white" />
          <span>进入主线闯关</span>
          <ArrowRight class="w-5 h-5" />
        </button>
      </div>

      <!-- Go Categories Grid -->
      <div v-for="cat in goCategories" :key="cat.title" class="space-y-3.5">
        <div class="px-1">
          <h3 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>{{ cat.title }}</span>
          </h3>
          <p class="text-xs text-slate-500 font-medium">{{ cat.desc }}</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5">
          <div
            v-for="item in cat.items"
            :key="item.id"
            @click="handleGoFeatureClick(item)"
            class="relative rounded-2xl sm:rounded-3xl p-5 border-2 transition-all duration-200 flex flex-col justify-between cursor-pointer group"
            :class="item.isUnlocked ? 'bg-white border-slate-200/90 hover:border-emerald-400 shadow-2xs hover:shadow-md transform hover:-translate-y-0.5' : 'bg-slate-50 border-slate-200 opacity-70'"
          >
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-3xl">{{ item.icon }}</span>
                <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {{ item.badge }}
                </span>
              </div>
              <div>
                <h4 class="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {{ item.name }}
                </h4>
                <p class="text-xs text-slate-500 leading-relaxed mt-1 line-clamp-2">
                  {{ item.desc }}
                </p>
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>{{ item.isUnlocked ? '立即进入' : '🔒 待解锁' }}</span>
              <ArrowRight class="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      <!-- Go Records / Review Hub Section -->
      <div v-if="goRecords.length > 0" class="space-y-3.5 pt-2">
        <div class="flex items-center justify-between px-1">
          <h3 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <History class="w-5 h-5 text-emerald-600" />
            <span>围棋历史对局与复盘</span>
          </h3>
          <span class="text-xs font-bold text-slate-400">共 {{ goRecords.length }} 局</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div
            v-for="rec in goRecords.slice(0, 4)"
            :key="rec.id"
            class="bg-white rounded-2xl p-4 border border-slate-200/90 hover:border-emerald-300 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between gap-3"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xl shrink-0">
                ♟️
              </div>
              <div class="min-w-0">
                <div class="text-xs font-black text-slate-800 truncate">
                  {{ rec.modeName }}
                </div>
                <div class="text-[11px] text-slate-400 mt-0.5">
                  胜者: {{ rec.winnerAvatar }} {{ rec.winnerName }} · {{ rec.playedAt }}
                </div>
              </div>
            </div>

            <button
              @click="navigate('/two-player')"
              class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shrink-0 active:scale-95 transition-all cursor-pointer"
            >
              <Play class="w-3.5 h-3.5 fill-white" />
              <span>复盘</span>
            </button>
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
