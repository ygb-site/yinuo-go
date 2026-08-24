<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/useUserStore';
import { useUnlockStore } from '../../stores/unlockStore';
import { useTsumegoStore } from '../../stores/tsumegoStore';
import { UNLOCK_FEATURES } from '../../data/unlockRules';
import { playButtonSound, playCoinSound, triggerConfetti } from '../../lib/audio';
import { sound } from '../../utils/sound';
import { showAlert, showConfirm } from '../../utils/alert';
import {
  CheckCircle2,
  Gift,
  Zap,
  Puzzle,
  Swords,
  X,
  Flame,
  Gamepad2,
  BookOpen,
  Bot,
  ScrollText,
  ShoppingBag,
  Sparkles
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const router = useRouter();
const userStore = useUserStore();
const unlockStore = useUnlockStore();
const tsumegoStore = useTsumegoStore();

// Consecutive Streak Days (Real Date-based Continuous Check-In)
const streakDays = computed(() => {
  return userStore.checkInStreak;
});

onMounted(() => {
  if (userStore.hasProfile) {
    const res = userStore.performDailyCheckIn();
    if (res.isNewCheckIn) {
      playCoinSound();
      triggerConfetti();
    }
  }
});

const completedLessons = computed(() => unlockStore.completedLessonsCount);

/**
 * 🎓 根据学员当前真实学习进度，自适应动态生成 3 项今日目标
 * 绝不会出现“未解锁却要求完成”的挫败感！
 */
interface DynamicQuest {
  id: string;
  title: string;
  desc: string;
  icon: any;
  rewardCoins: number;
  rewardExp: number;
  completed: boolean;
  actionPath: string;
  stageName: string;
}

const dynamicQuests = computed<DynamicQuest[]>(() => {
  const count = completedLessons.value;

  // -------------------------------------------------------------
  // 阶段 1：零基础启蒙期 (关卡 0 ~ 3 关，正在学气与下子)
  // -------------------------------------------------------------
  if (count < 4) {
    return [
      {
        id: 'main_lesson_stage1',
        title: '🌟 今日主线新突破',
        desc: '完成 1 个新的启蒙闯关关卡，收集金色星星',
        icon: Gamepad2,
        rewardCoins: 20,
        rewardExp: 40,
        completed: count >= 1,
        actionPath: '/adventure',
        stageName: '启蒙阶段'
      },
      {
        id: 'breath_review_stage1',
        title: '🌬️ 棋子呼吸温习',
        desc: '在闯关地图中复习 1 次棋子的4口气',
        icon: Sparkles,
        rewardCoins: 15,
        rewardExp: 30,
        completed: count >= 2,
        actionPath: '/adventure',
        stageName: '启蒙阶段'
      },
      {
        id: 'dictionary_stage1',
        title: '📚 围棋百科初探',
        desc: '在小词典中探索 1 个双语围棋术语概念',
        icon: BookOpen,
        rewardCoins: 15,
        rewardExp: 30,
        completed: count >= 1,
        actionPath: '/dictionary',
        stageName: '启蒙阶段'
      }
    ];
  }

  // -------------------------------------------------------------
  // 阶段 2：捕鱼小达人期 (关卡 4 ~ 7 关，已解锁【吃子对弈】和【装扮商城】)
  // -------------------------------------------------------------
  if (count < 8) {
    return [
      {
        id: 'main_lesson_stage2',
        title: '🌟 经典吃子手筋闯关',
        desc: '攻克 1 个新的双叫吃、抱吃或门吃关卡',
        icon: Gamepad2,
        rewardCoins: 25,
        rewardExp: 50,
        completed: count >= 5,
        actionPath: '/adventure',
        stageName: '捕鱼手筋'
      },
      {
        id: 'capture_go_stage2',
        title: '⚡ 吃子对弈小试身手',
        desc: '在 5路极速吃子棋中吃掉 1 颗白子获胜',
        icon: Swords,
        rewardCoins: 25,
        rewardExp: 50,
        completed: (userStore.captureGoStats?.wins || 0) > 0,
        actionPath: '/capture-go',
        stageName: '吃子实战'
      },
      {
        id: 'shop_stage2',
        title: '🛍️ 装扮商城挑皮肤',
        desc: '用闯关金币在装扮商城探索棋盘与萌宠头像',
        icon: ShoppingBag,
        rewardCoins: 15,
        rewardExp: 30,
        completed: userStore.unlockedThemes.length > 1 || userStore.coins >= 50,
        actionPath: '/shop',
        stageName: '装扮商城'
      }
    ];
  }

  // -------------------------------------------------------------
  // 阶段 3：城堡建造师期 (关卡 8 ~ 11 关，已解锁【反应乐园】和【双人同屏】)
  // -------------------------------------------------------------
  if (count < 12) {
    return [
      {
        id: 'main_lesson_stage3',
        title: '🌟 死活城堡主线突破',
        desc: '攻克 1 个真眼假眼或两眼做活关卡',
        icon: Gamepad2,
        rewardCoins: 30,
        rewardExp: 60,
        completed: count >= 9,
        actionPath: '/adventure',
        stageName: '死活活棋'
      },
      {
        id: 'arcade_stage3',
        title: '🔥 60秒极速反应特训',
        desc: '在反应乐园中完成 1 局闪电提子或数气对决',
        icon: Zap,
        rewardCoins: 25,
        rewardExp: 50,
        completed: (userStore.arcadeHighScores?.speedCapture || 0) > 0,
        actionPath: '/arcade',
        stageName: '反应训练'
      },
      {
        id: 'capture_win_stage3',
        title: '⚔️ 吃子棋大显身手',
        desc: '在吃子对弈场中击败对手赢得胜利',
        icon: Swords,
        rewardCoins: 25,
        rewardExp: 50,
        completed: (userStore.captureGoStats?.wins || 0) >= 2,
        actionPath: '/capture-go',
        stageName: '实战对局'
      }
    ];
  }

  // -------------------------------------------------------------
  // 阶段 4：领地大局期 (关卡 12 ~ 19 关，已解锁【死活题库】和【错题本】)
  // -------------------------------------------------------------
  if (count < 20) {
    return [
      {
        id: 'tsumego_stage4',
        title: '🧩 每日死活必修修行',
        desc: '在每日死活题库中成功攻克 1 道死活实战题',
        icon: Puzzle,
        rewardCoins: 30,
        rewardExp: 60,
        completed: (tsumegoStore.totalSolvedCount || 0) > 0,
        actionPath: '/tsumego',
        stageName: '死活修行'
      },
      {
        id: 'arcade_combo_stage4',
        title: '🔥 反应乐园突破极限',
        desc: '在极速反应乐园中斩获 50 分以上好成绩',
        icon: Zap,
        rewardCoins: 25,
        rewardExp: 50,
        completed: (userStore.arcadeHighScores?.speedCapture || 0) >= 30,
        actionPath: '/arcade',
        stageName: '反应特训'
      },
      {
        id: 'mistake_or_battle_stage4',
        title: '📖 弱点突破或实战对局',
        desc: '在错题本中消灭 1 处弱点或完成 1 场对弈',
        icon: Swords,
        rewardCoins: 25,
        rewardExp: 50,
        completed: (userStore.solvedMistakes?.length || 0) > 0 || (userStore.stats?.gamesPlayed || 0) > 0,
        actionPath: '/mistakes',
        stageName: '专项复习'
      }
    ];
  }

  // -------------------------------------------------------------
  // 阶段 5：大师挑战期 (关卡 17 ~ 21 关，已解锁【AI对弈】与【打印题卡】)
  // -------------------------------------------------------------
  if (count < 22) {
    return [
      {
        id: 'tsumego_stage5',
        title: '🧩 每日死活大师修罗场',
        desc: '在每日死活题库中攻克 2 道死活题',
        icon: Puzzle,
        rewardCoins: 35,
        rewardExp: 70,
        completed: (tsumegoStore.totalSolvedCount || 0) >= 2,
        actionPath: '/tsumego',
        stageName: '死活进阶'
      },
      {
        id: 'ai_arena_stage5',
        title: '🤖 萌宠大师九路切磋',
        desc: '与小狗贝贝或小猫喵喵大师完成 1 局对弈',
        icon: Bot,
        rewardCoins: 35,
        rewardExp: 70,
        completed: (userStore.stats?.gamesPlayed || 0) > 0,
        actionPath: '/ai-match',
        stageName: 'AI对局'
      },
      {
        id: 'worksheet_stage5',
        title: '🖨️ 打印题单线下练',
        desc: '生成 A4 高清死活题单进行护眼离线练习',
        icon: ScrollText,
        rewardCoins: 30,
        rewardExp: 60,
        completed: count >= 18,
        actionPath: '/worksheet',
        stageName: '打印题卡'
      }
    ];
  }

  // -------------------------------------------------------------
  // 阶段 6：小棋圣进阶期 (关卡 22 关全部通关，解锁【定段升级考】)
  // -------------------------------------------------------------
  return [
    {
      id: 'tsumego_stage6',
      title: '🧩 每日死活大师修罗场',
      desc: '在每日死活题库中连续攻克 2 道死活题',
      icon: Puzzle,
      rewardCoins: 35,
      rewardExp: 70,
      completed: (tsumegoStore.totalSolvedCount || 0) >= 2,
      actionPath: '/tsumego',
      stageName: '死活进阶'
    },
    {
      id: 'ai_arena_stage6',
      title: '🤖 萌宠大师九路切磋',
      desc: '与小狗贝贝或小猫喵喵大师完成 1 局对弈',
      icon: Bot,
      rewardCoins: 35,
      rewardExp: 70,
      completed: (userStore.stats?.gamesPlayed || 0) > 0,
      actionPath: '/ai-match',
      stageName: 'AI对局'
    },
    {
      id: 'rank_exam_stage6',
      title: '📜 定段升级考大检阅',
      desc: '参与少儿定段测试，冲击围棋小棋圣证书',
      icon: ScrollText,
      rewardCoins: 40,
      rewardExp: 80,
      completed: userStore.currentRank.rankLevel >= 2,
      actionPath: '/rank-exam',
      stageName: '等级证书'
    }
  ];
});

const completedQuestsCount = computed(() => {
  return dynamicQuests.value.filter(q => q.completed).length;
});

const isAllQuestsCompleted = computed(() => completedQuestsCount.value === 3);

const handleGoQuest = (path: string) => {
  const matchedFeature = UNLOCK_FEATURES.find(f => f.route === path);
  if (matchedFeature && !unlockStore.isFeatureUnlocked(matchedFeature.id)) {
    sound.playErrorSound();
    showConfirm({
      title: '暂未解锁该玩法',
      message: `小棋手别着急！【${matchedFeature.name}】需要${matchedFeature.unlockTip}才能开启哦！快去继续主线闯关吧！`,
      type: 'warning',
      confirmText: '前往闯关',
      cancelText: '知道了'
    }).then(confirmed => {
      if (confirmed) {
        emit('close');
        router.push('/learn');
      }
    });
    return;
  }
  playButtonSound();
  emit('close');
  router.push(path);
};

const isClaimedToday = computed(() => {
  if (!userStore.hasProfile) return false;
  const today = new Date().toLocaleDateString("en-CA");
  return userStore.currentProfile.lastDailyQuestsClaimDate === today;
});

const handleClaimAll = () => {
  if (isClaimedToday.value) {
    showAlert({
      message: "今日全勤通关大奖已经领取过啦！明天继续加油哦！",
      type: "info",
      title: "今日已领取"
    });
    return;
  }

  const res = userStore.claimDailyQuestsReward();
  if (!res.success) {
    showAlert({
      message: "今日全勤通关大奖已经领取过啦！明天继续加油哦！",
      type: "info",
      title: "今日已领取"
    });
    return;
  }

  playCoinSound();
  triggerConfetti();
  showAlert({
    message: "🎉 太棒啦！你完成了当前学习阶段的全部 3 项成长目标！额外获得 50 金币与 100 棋力经验全勤大礼包！",
    type: "success",
    title: "🏆 全勤大奖达成"
  });
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[9999] overflow-hidden bg-black/65 no-scrollbar modal-overlay backdrop-blur-md select-none animate-fade-in flex items-center justify-center p-3 sm:p-4"
      @click.self="emit('close')"
    >
      <div class="relative w-full max-w-lg rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border-4 border-amber-300 text-left space-y-4 sm:space-y-5 animate-pop-in">
        
        <!-- Close Button -->
        <button
          @click="emit('close')"
          class="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>

        <!-- Header -->
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-sm text-white flex-shrink-0">
            📅
          </div>
          <div>
            <div class="inline-flex items-center gap-1.5 text-xs font-black text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">
              <Flame class="w-3.5 h-3.5 fill-current text-orange-500" />
              <span>已连续打卡 {{ streakDays }} 天</span>
            </div>
            <h2 class="text-lg sm:text-xl font-cartoon font-bold text-gray-900 mt-0.5">每日成长任务与打卡日历</h2>
          </div>
        </div>

        <!-- 7-Day Stamp Card -->
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-3.5 sm:p-4 border border-orange-200 space-y-2">
          <div class="text-[11px] font-black text-amber-900 flex items-center justify-between">
            <span>7天连续打卡小红花：</span>
            <span class="text-orange-600 font-bold">第 7 天赠神秘宝箱 🎁</span>
          </div>

          <div class="grid grid-cols-7 gap-1 sm:gap-1.5">
            <div
              v-for="d in 7"
              :key="d"
              class="p-1.5 sm:p-2 rounded-xl text-center border transition"
              :class="
                d <= streakDays
                  ? 'bg-gradient-to-tr from-orange-400 to-rose-500 text-white border-transparent shadow-2xs font-black'
                  : 'bg-white/80 border-orange-100 text-gray-400'
              "
            >
              <div class="text-[9px] sm:text-[10px] font-bold">第{{ d }}天</div>
              <div class="text-sm sm:text-base my-0.5">{{ d <= streakDays ? '🌸' : '⚪' }}</div>
              <div class="text-[8px] sm:text-[9px] font-black opacity-90 truncate">{{ d === 7 ? '宝箱' : '+15币' }}</div>
            </div>
          </div>
        </div>

        <!-- Adaptive Learning Progress Daily 3 Tasks -->
        <div class="space-y-2.5">
          <div class="text-xs font-black text-gray-500 uppercase tracking-wide flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <Sparkles class="w-3.5 h-3.5 text-orange-500" />
              <span>今日专属学习目标（根据当前进度自适应）</span>
            </span>
            <span class="text-orange-600 font-black">{{ completedQuestsCount }} / 3 完成</span>
          </div>

          <div
            v-for="q in dynamicQuests"
            :key="q.id"
            class="p-3 sm:p-3.5 rounded-2xl border-2 transition flex items-center justify-between gap-2.5 sm:gap-3"
            :class="q.completed ? 'bg-emerald-50/70 border-emerald-300' : 'bg-white border-gray-100 hover:border-orange-200'"
          >
            <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                :class="q.completed ? 'bg-emerald-500 text-white' : 'bg-orange-50 text-orange-600 border border-orange-200'"
              >
                <component :is="q.icon" class="w-5 h-5" />
              </div>
              <div class="min-w-0">
                <div class="font-black text-xs sm:text-sm text-gray-900 flex items-center gap-1.5 truncate">
                  <span class="truncate">{{ q.title }}</span>
                  <span class="text-[9px] sm:text-[10px] font-black text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded-full flex-shrink-0">
                    +{{ q.rewardCoins }} 币
                  </span>
                </div>
                <div class="text-[11px] sm:text-xs text-gray-500 font-medium line-clamp-1 mt-0.5">{{ q.desc }}</div>
              </div>
            </div>

            <button
              v-if="!q.completed"
              @click="handleGoQuest(q.actionPath)"
              class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white text-xs font-black transition active:scale-95 whitespace-nowrap cursor-pointer shadow-2xs flex-shrink-0"
            >
              去完成 →
            </button>
            <span v-else class="text-emerald-700 font-black text-xs flex items-center gap-1 flex-shrink-0 whitespace-nowrap">
              <CheckCircle2 class="w-4 h-4 text-emerald-600" /> 已达成
            </span>
          </div>
        </div>

        <!-- Claim All Bonus Button / Claimed Status -->
        <div v-if="isAllQuestsCompleted" class="pt-1">
          <button
            v-if="!isClaimedToday"
            @click="handleClaimAll"
            class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 text-white font-black text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer animate-bounce-subtle"
          >
            <Gift class="w-4 h-4" />
            <span>领取今日全勤通关大奖 (+50金币 & +100经验) 🎁</span>
          </button>
          <div
            v-else
            class="w-full py-3 sm:py-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-800 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs"
          >
            <CheckCircle2 class="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            <span>今日全勤通关大奖已领取 (+50金币 & +100经验) ✨ 明日继续！</span>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>
