<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/useUserStore';
import { useUnlockStore } from '../stores/unlockStore';
import { useTsumegoStore } from '../stores/tsumegoStore';
import { TSUMEGO_PUZZLES } from '../data/tsumegoLibrary';
import { BADGES_DATA, type AchievementBadge } from '../data/achievementsData';
import CertificateModal from '../components/common/CertificateModal.vue';
import { showAlert, showConfirm } from '../utils/alert';
import { playButtonSound, playWinSound, playErrorSound, triggerConfetti } from '../lib/audio';
import { sound } from '../utils/sound';
import { createSafeProfileArchive } from '../services/dataArchiveService';
import {
  Trophy,
  Star,
  Coins,
  CheckCircle2,
  Users,
  RotateCcw,
  Download,
  Lock,
  Edit2,
  UserPlus,
  Heart,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  LogIn,
  LogOut,
  User,
  Brain,
  Sparkles,
  BookMarked,
  Flame
} from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();
const tsumegoStore = useTsumegoStore();
const unlockStore = useUnlockStore();

const isEditingName = ref(false);
const newNickname = ref(userStore.nickname);
const showCertModal = ref(false);

const formatLogTime = (at: number) => {
  const d = new Date(at);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return mm + '-' + dd + ' ' + hh + ':' + mi;
};

// 6-Dimension Universal Multi-Subject Radar Chart (Symmetrical Hexagon)
const RADAR_CX = 100;
const RADAR_CY = 105;
const RADAR_MAX_R = 62;
const RADAR_ANGLES = [
  -Math.PI / 2,
  -Math.PI / 2 + (Math.PI / 3),
  -Math.PI / 2 + (2 * Math.PI / 3),
  -Math.PI / 2 + Math.PI,
  -Math.PI / 2 + (4 * Math.PI / 3),
  -Math.PI / 2 + (5 * Math.PI / 3)
];

const studentProfile = computed(() => userStore.studentLearningProfile);

const hexRingPoints = (fraction: number) => {
  const r = RADAR_MAX_R * fraction;
  return RADAR_ANGLES.map(a => {
    const x = Number((RADAR_CX + r * Math.cos(a)).toFixed(1));
    const y = Number((RADAR_CY + r * Math.sin(a)).toFixed(1));
    return `${x},${y}`;
  }).join(' ');
};

const radarStats = computed(() => {
  const dims = studentProfile.value.abilityDimensions;
  const values = [
    dims.calculation || 0,
    dims.spatial || 0,
    dims.language || 0,
    dims.memory || 0,
    dims.logical || 0,
    dims.concentration || 0
  ];
  const labels = ['数学算力', '空间感知', '语言表达', '长效记忆', '逻辑推理', '专注自律'];

  return values.map((val, i) => {
    const angle = RADAR_ANGLES[i];
    const r = RADAR_MAX_R * Math.min(1, Math.max(0, val / 100));
    return {
      label: labels[i],
      value: Math.round(val),
      x: Number((RADAR_CX + r * Math.cos(angle)).toFixed(1)),
      y: Number((RADAR_CY + r * Math.sin(angle)).toFixed(1))
    };
  });
});

const profileAdvice = computed(() => {
  const p = studentProfile.value;
  const name = userStore.nickname || '宝贝';
  if (p.totalQuestionsAnswered <= 0) {
    return `宝贝 ${name} 还没有学科练习记录。雷达图现在是空白的，去学堂大厅做几道题后，掌握度会按真实对错更新，不会再用星星或金币估分。`;
  }
  const dimLabels: Record<string, string> = {
    calculation: '数理计算',
    spatial: '空间感知',
    language: '语言表达',
    memory: '长效记忆',
    logical: '逻辑推理',
    concentration: '专注自律'
  };
  const ranked = Object.entries(p.abilityDimensions).sort((a, b) => b[1] - a[1]);
  const top = ranked[0];
  const weak = ranked[ranked.length - 1];
  const topName = dimLabels[top[0]] || top[0];
  if (weak[1] < 60 && weak[0] !== top[0]) {
    return `宝贝 ${name} 已完成 ${p.totalQuestionsAnswered} 题，综合准确率 ${p.accuracy}%。${topName} 较突出；建议多练错题本里的变式题，把薄弱项补上来。`;
  }
  return `宝贝 ${name} 已完成 ${p.totalQuestionsAnswered} 题，综合准确率 ${p.accuracy}%，${topName} 表现较好。继续保持复习节奏就能稳住画像。`;
});

const radarPolygonPoints = computed(() => {
  return radarStats.value.map(p => `${p.x},${p.y}`).join(' ');
});

const favoritePuzzlesList = computed(() => {
  return TSUMEGO_PUZZLES.filter(p => tsumegoStore.isFavorite(p.id));
});

const handleManualSync = async () => {
  if (!userStore.isLoggedIn) {
    userStore.openAuthModal();
    return;
  }
  playButtonSound();
  const ok = await userStore.syncToCloudNow();
  if (ok) {
    playWinSound();
    triggerConfetti();
    showAlert({
      title: '云端同步成功',
      message: '所有宝贝档案、通关星星与勋章已成功保存在云端数据库！',
      type: 'info'
    });
  } else {
    playErrorSound();
    showAlert({
      title: '同步失败',
      message: userStore.cloudSyncError || '请检查网络连接',
      type: 'warning'
    });
  }
};

const goToTsumego = (puzzleId?: string) => {
  const isUnlocked = unlockStore.isFeatureUnlocked('tsumego');
  if (!isUnlocked) {
    sound.playErrorSound();
    const feat = unlockStore.getFeature('tsumego');
    showConfirm({
      title: '暂未解锁死活题库',
      message: `小棋手别着急！【每日死活题】需要${feat?.unlockTip || '通关第3章【死活城堡】'}才能开启哦！快去继续主线闯关吧！`,
      type: 'warning',
      confirmText: '前往闯关',
      cancelText: '知道了'
    }).then(confirmed => {
      if (confirmed) {
        router.push('/learn');
      }
    });
    return;
  }
  playButtonSound();
  if (puzzleId) {
    router.push({ path: '/tsumego', query: { id: puzzleId, cat: 'favorite' } });
  } else {
    router.push('/tsumego');
  }
};

const avatarList = ['🦁', '👶', '🐱', '🐼', '🐯', '🐰', '🦊', '🦄', '🐲', '🚀'];

const saveNickname = () => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  const trimmed = newNickname.value.trim();
  if (!trimmed) {
    showAlert({ message: '宝贝昵称不能为空哦！', type: 'warning' });
    return;
  }
  if (userStore.isNicknameTaken(trimmed, userStore.currentProfileId)) {
    showAlert({
      title: '昵称重复啦',
      message: `已经存在名为「${trimmed}」的宝贝档案啦，换一个更独特的可爱昵称吧！`,
      type: 'warning'
    });
    return;
  }
  userStore.currentProfile.nickname = trimmed;
  userStore.touchSave();
  isEditingName.value = false;
  playButtonSound();
};

const selectAvatar = (av: string) => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  userStore.currentProfile.avatar = av;
  playButtonSound();
};

const isBadgeUnlocked = (badgeId: string): boolean => {
  return userStore.unlockedBadges.includes(badgeId);
};

const getRarityBadgeClass = (rarity: AchievementBadge['rarity']) => {
  switch (rarity) {
    case 'legendary':
      return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 border-amber-300';
    case 'epic':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'rare':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'common':
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const exportData = () => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  playButtonSound();
  const archive = createSafeProfileArchive(userStore.currentProfile);
  const blob = new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'yinuo-go-backup-' + (userStore.nickname || 'kids') + '.json';
  a.click();
  URL.revokeObjectURL(url);
};


const pendingMistakes = computed(() => {
  return (userStore.mistakeRecords || []).filter(m => !m.resolved);
});

const resolvedMistakesCount = computed(() => {
  return (userStore.mistakeRecords || []).filter(m => m.resolved).length;
});

const mistakeMasteryPercent = computed(() => {
  const total = (userStore.mistakeRecords || []).length;
  if (total === 0) return 100;
  return Math.round((resolvedMistakesCount.value / total) * 100);
});

const mistakesBySubject = computed(() => {
  const go = pendingMistakes.value.filter(m => m.subjectId === 'go').length;
  const checkers = pendingMistakes.value.filter(m => m.subjectId === 'checkers').length;
  const gomoku = pendingMistakes.value.filter(m => m.subjectId === 'gomoku').length;
  return { go, checkers, gomoku };
});

const goToMistakes = (subject?: string, autoQuiz = false) => {
  playButtonSound();
  const query: Record<string, string> = {};
  if (subject) query.subject = subject;
  if (autoQuiz) query.quiz = 'true';
  router.push({ path: '/mistakes', query });
};

const confirmReset = async () => {
  if (!userStore.hasProfile) {
    userStore.openProfileModal();
    return;
  }
  const ok = await showConfirm({
    title: '重置当前宝贝进度',
    message: '确定要重置当前宝贝的所有闯关记录、星星与经验吗？此操作无法恢复！',
    type: 'delete',
    confirmText: '确定重置'
  });
  if (ok) {
    userStore.resetCurrentProfileProgress();
    showAlert({ message: '已成功重置当前宝贝的数据。', type: 'info' });
  }
};

</script>

<template>
  <div class="min-h-[calc(100vh-5rem)] bg-[#FAF8F5] py-3 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 select-none">
    <div class="max-w-6xl mx-auto space-y-4 sm:space-y-8">

      <!-- Case A: Logged In & Has Child Profile -->
      <div v-if="userStore.hasProfile" class="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border-2 border-orange-100 shadow-2xs relative overflow-hidden">
        <div class="absolute -right-12 -top-12 w-64 h-64 bg-orange-100/60 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <!-- Avatar & Name -->
          <div class="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div class="relative">
              <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-300 via-orange-400 to-rose-400 p-1.5 shadow-xl border-4 border-white flex items-center justify-center text-5xl sm:text-6xl animate-bounce-subtle">
                {{ userStore.avatar }}
              </div>
              <span class="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full border-2 border-white shadow">
                {{ userStore.currentRank.badge }}
              </span>
            </div>

            <div class="space-y-1.5">
              <div class="inline-flex items-center gap-1.5 bg-purple-100 text-purple-800 px-3 py-0.5 rounded-full text-xs font-black mb-1">
                <span>🏆 宝贝个人成长成就中心</span>
              </div>
              <div class="flex items-center gap-2 justify-center sm:justify-start">
                <div v-if="!isEditingName" class="flex items-center gap-2">
                  <h1 class="text-2xl sm:text-3xl font-cartoon font-bold text-gray-900 tracking-wide">{{ userStore.nickname }}</h1>
                  <button @click="isEditingName = true; newNickname = userStore.nickname" class="p-1 text-gray-400 hover:text-orange-500 cursor-pointer" title="修改昵称">
                    <Edit2 class="w-4 h-4" />
                  </button>
                </div>
                <div v-else class="flex items-center gap-2">
                  <input
                    v-model="newNickname"
                    type="text"
                    maxlength="10"
                    class="px-3 py-1 rounded-xl border border-orange-300 text-sm font-bold text-gray-800 focus:outline-none"
                    @keyup.enter="saveNickname"
                  />
                  <button @click="saveNickname" class="px-3 py-1 bg-orange-500 text-white text-xs font-black rounded-xl cursor-pointer">
                    保存
                  </button>
                  <button @click="isEditingName = false" class="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-xl cursor-pointer">
                    取消
                  </button>
                </div>
              </div>

              <div class="flex items-center gap-2 text-xs sm:text-sm font-bold text-orange-600 justify-center sm:justify-start">
                <span>{{ userStore.currentRank.title }}</span>
                <span>•</span>
                <span>{{ userStore.currentRank.titleEn }}</span>
              </div>

              <!-- Quick Switch Profile Button -->
              <div class="flex items-center gap-2 pt-1 justify-center sm:justify-start">
                <button
                  @click="userStore.openProfileModal()"
                  class="px-3 py-1.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-900 text-xs font-black flex items-center gap-1.5 transition active:scale-95 shadow-2xs cursor-pointer"
                >
                  <Users class="w-3.5 h-3.5" />
                  <span>切换宝贝 (共 {{ userStore.profiles.length }} 位)</span>
                </button>
              </div>

              <!-- Avatar Quick Selector -->
              <div class="flex flex-wrap items-center gap-1.5 pt-1.5 justify-center sm:justify-start">
                <button
                  v-for="av in avatarList.slice(0, 8)"
                  :key="av"
                  @click="selectAvatar(av)"
                  class="w-8 h-8 rounded-xl border text-base flex items-center justify-center transition transform hover:scale-110 active:scale-95 cursor-pointer shadow-2xs"
                  :class="userStore.avatar === av ? 'bg-orange-100 border-orange-500 ring-2 ring-orange-400/40' : 'bg-gray-50 border-gray-200 hover:bg-orange-50/50'"
                >
                  {{ av }}
                </button>
              </div>
            </div>
          </div>

          <!-- Currency & Rank Progress Panel -->
          <div class="flex flex-col gap-3 min-w-[240px] w-full sm:w-auto">
            <div class="flex items-center justify-around bg-orange-50/80 rounded-2xl p-4 border border-orange-200 shadow-2xs">
              <div class="text-center">
                <div class="text-[10px] font-extrabold text-amber-700">金币余额</div>
                <div class="text-xl font-black text-amber-900 flex items-center justify-center gap-1">
                  <Coins class="w-4 h-4 text-amber-500" />
                  <span>{{ userStore.coins }}</span>
                </div>
              </div>
              <div class="w-px h-8 bg-orange-200"></div>
              <div class="text-center">
                <div class="text-[10px] font-extrabold text-rose-700">闯关星星</div>
                <div class="text-xl font-black text-rose-900 flex items-center justify-center gap-1">
                  <Star class="w-4 h-4 text-rose-500 fill-current" />
                  <span>{{ userStore.totalStars }}</span>
                </div>
              </div>
            </div>

            <!-- EXP Bar & Rank Exam CTA -->
            <div class="bg-gray-50 rounded-2xl p-3 border border-gray-200 space-y-2">
              <div class="flex items-center justify-between text-xs font-bold">
                <span class="text-gray-600">段位棋力 (XP)</span>
                <span class="text-orange-600 font-black">
                  {{ userStore.exp }} <span v-if="userStore.nextRank">/ {{ userStore.nextRank.minExp }}</span> XP
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  class="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all"
                  :style="{ width: userStore.rankProgressPercent + '%' }"
                ></div>
              </div>
              <div class="flex items-center gap-1.5 pt-1">
                <button
                  @click="showCertModal = true"
                  class="flex-1 py-1.5 px-2 bg-white hover:bg-orange-50 text-orange-700 border border-orange-200 rounded-xl text-[11px] font-black shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>荣誉证书 📜</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 📊 家长/教师学情看板快捷入口 -->
      <div v-if="userStore.hasProfile" class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3.5 text-center sm:text-left">
          <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl flex-shrink-0">📊</div>
          <div>
            <div class="font-black text-base sm:text-lg flex items-center gap-2 justify-center sm:justify-start">
              <span>家长与教师学情全景看板</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] bg-white/20 border border-white/30 font-bold">AI 每日成长档案</span>
            </div>
            <div class="text-xs text-indigo-100 mt-0.5">查看四大学科能力雷达图、错题诊断、AI 家长日报与多端云备份</div>
          </div>
        </div>
        <router-link to="/parent-dashboard" class="px-5 py-2.5 bg-white hover:bg-indigo-50 text-indigo-900 rounded-2xl text-xs font-black shadow transition active:scale-95 flex items-center gap-1.5 flex-shrink-0">
          <span>进入学情看板</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </router-link>
      </div>

      <!-- 🧠 宝贝多学科知识点与能力画像图谱 (Student Learning Profile) -->
      <div v-if="userStore.hasProfile" class="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border-2 border-indigo-100 shadow-2xs space-y-4 sm:space-y-5">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="space-y-0.5 min-w-0">
            <div class="text-[10px] sm:text-[11px] font-black text-indigo-600 uppercase tracking-wide flex items-center gap-1">
              <Brain class="w-3.5 h-3.5 shrink-0" />
              <span class="truncate">全科能力画像与学情分析</span>
            </div>
            <h2 class="text-base sm:text-xl font-black text-gray-900 flex items-center gap-1.5 truncate">
              <span class="font-cartoon font-bold truncate">🧠 宝贝多学科素养与学情图谱</span>
            </h2>
          </div>
          <span class="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
            综合准确率 {{ studentProfile.totalQuestionsAnswered > 0 ? studentProfile.accuracy + '%' : '暂无' }} · 连续打卡 {{ studentProfile.streak }} 天
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <!-- 6-Dimension Radar Chart (Symmetrical Hexagon) -->
          <div class="md:col-span-6 flex justify-center">
            <div class="relative w-64 h-64">
              <svg viewBox="0 0 200 200" class="w-full h-full transform overflow-visible">
                <!-- 5 Concentric Hexagon Webs (20%, 40%, 60%, 80%, 100%) -->
                <polygon
                  v-for="frac in [0.2, 0.4, 0.6, 0.8, 1.0]"
                  :key="frac"
                  :points="hexRingPoints(frac)"
                  fill="none"
                  stroke="#FDE68A"
                  :stroke-width="frac === 1 ? 1.4 : 1"
                  :stroke-dasharray="frac === 1 ? '' : '2,2'"
                />

                <!-- 6 Symmetrical Radial Axes -->
                <line
                  v-for="(_, i) in radarStats"
                  :key="'axis-' + i"
                  :x1="RADAR_CX"
                  :y1="RADAR_CY"
                  :x2="Number((RADAR_CX + RADAR_MAX_R * Math.cos(RADAR_ANGLES[i])).toFixed(1))"
                  :y2="Number((RADAR_CY + RADAR_MAX_R * Math.sin(RADAR_ANGLES[i])).toFixed(1))"
                  stroke="#F59E0B"
                  stroke-width="1"
                  opacity="0.6"
                />

                <!-- Dynamic Data Area Polygon -->
                <polygon :points="radarPolygonPoints" fill="rgba(249, 115, 22, 0.28)" stroke="#EA580C" stroke-width="2.5" />
                <circle v-for="pt in radarStats" :key="pt.label" :cx="pt.x" :cy="pt.y" r="4" fill="#EA580C" stroke="#FFFFFF" stroke-width="2" />

                <!-- Dynamic Axis Labels -->
                <text
                  v-for="(pt, i) in radarStats"
                  :key="'label-' + i"
                  :x="Number((RADAR_CX + (RADAR_MAX_R + 18) * Math.cos(RADAR_ANGLES[i])).toFixed(1))"
                  :y="Number((RADAR_CY + (RADAR_MAX_R + 14) * Math.sin(RADAR_ANGLES[i]) + 4).toFixed(1))"
                  text-anchor="middle"
                  font-size="10"
                  font-weight="900"
                  fill="#9A3412"
                >
                  {{ pt.label }} ({{ pt.value }})
                </text>
              </svg>
            </div>
          </div>

          <!-- Subject Mastery & Advice -->
          <div class="md:col-span-6 space-y-3">
            <div class="bg-indigo-50/80 rounded-2xl p-4 border border-indigo-200 space-y-2">
              <div class="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                <Sparkles class="w-4 h-4 text-indigo-600" />
                <span>AI Tutor 专属学情诊断建议：</span>
              </div>
              <p class="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                {{ profileAdvice }}
              </p>
            </div>

            <!-- Subject Progress Bars -->
            <div class="grid grid-cols-3 gap-2 text-xs font-bold">
              <div class="bg-emerald-50/60 rounded-xl p-2.5 border border-emerald-200">
                <div class="flex justify-between text-[11px] text-emerald-900 font-black mb-1">
                  <span>♟️ 围棋死活度</span>
                  <span>{{ studentProfile.subjectMastery.go }}%</span>
                </div>
                <div class="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-emerald-500 h-full rounded-full" :style="{ width: studentProfile.subjectMastery.go + '%' }"></div>
                </div>
              </div>

              <div class="bg-amber-50/60 rounded-xl p-2.5 border border-amber-200">
                <div class="flex justify-between text-[11px] text-amber-900 font-black mb-1">
                  <span>⭐ 六角跳棋度</span>
                  <span>{{ studentProfile.subjectMastery.checkers }}%</span>
                </div>
                <div class="w-full bg-amber-200 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-amber-500 h-full rounded-full" :style="{ width: studentProfile.subjectMastery.checkers + '%' }"></div>
                </div>
              </div>

              <div class="bg-teal-50/60 rounded-xl p-2.5 border border-teal-200">
                <div class="flex justify-between text-[11px] text-teal-900 font-black mb-1">
                  <span>⚪ 五子连珠度</span>
                  <span>{{ studentProfile.subjectMastery.gomoku }}%</span>
                </div>
                <div class="w-full bg-teal-200 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-teal-500 h-full rounded-full" :style="{ width: studentProfile.subjectMastery.gomoku + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 📕 语数外错题攻坚大本营 (Mistake Notebook Growth Center Portal) -->
      <div v-if="userStore.hasProfile" class="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border-2 border-rose-100 shadow-2xs space-y-4 sm:space-y-5">
        <div class="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 text-white flex items-center justify-center text-2xl shadow-md">
              📕
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-xl font-cartoon font-bold text-gray-900 tracking-wide">全学科智能错题本中心</h2>
                <span class="text-xs font-black text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  错题自动收录 · 随机出题 · 答对即移出
                </span>
              </div>
              <p class="text-xs text-gray-500 font-medium mt-0.5">
                做题做错自动归纳，一键随机出题练习，答对自动从错题本移出并领双倍金币！
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button
              @click="goToMistakes(undefined, true)"
              :disabled="pendingMistakes.length === 0"
              class="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-900 font-black rounded-2xl text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Flame class="w-4 h-4 text-rose-600 fill-current animate-bounce" />
              <span>🎲 错题随机出题练</span>
            </button>

            <button
              @click="goToMistakes()"
              class="px-4 py-2 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 text-white rounded-2xl text-xs sm:text-sm font-black shadow-sm transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <BookMarked class="w-4 h-4" />
              <span>进入错题本 ({{ pendingMistakes.length }} 待消灭)</span>
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- 3 Games Quick Filter Badges & Summary -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            @click="goToMistakes('go')"
            class="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50 transition cursor-pointer flex items-center justify-between group"
          >
            <div class="flex items-center gap-2">
              <span class="text-xl group-hover:scale-110 transition-transform">♟️</span>
              <div>
                <div class="text-xs font-black text-emerald-900">围棋死活</div>
                <div class="text-[10px] text-emerald-600 font-bold">做活与手筋弱点</div>
              </div>
            </div>
            <span class="text-base font-black text-emerald-700">{{ mistakesBySubject.go }} 道</span>
          </div>

          <div
            @click="goToMistakes('checkers')"
            class="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 hover:border-amber-300 hover:bg-amber-50 transition cursor-pointer flex items-center justify-between group"
          >
            <div class="flex items-center gap-2">
              <span class="text-xl group-hover:scale-110 transition-transform">⭐</span>
              <div>
                <div class="text-xs font-black text-amber-900">跳棋对决</div>
                <div class="text-[10px] text-amber-600 font-bold">连环跳步法</div>
              </div>
            </div>
            <span class="text-base font-black text-amber-700">{{ mistakesBySubject.checkers }} 道</span>
          </div>

          <div
            @click="goToMistakes('gomoku')"
            class="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-100 hover:border-teal-300 hover:bg-teal-50 transition cursor-pointer flex items-center justify-between group"
          >
            <div class="flex items-center gap-2">
              <span class="text-xl group-hover:scale-110 transition-transform">⚪</span>
              <div>
                <div class="text-xs font-black text-teal-900">五子连珠</div>
                <div class="text-[10px] text-teal-600 font-bold">攻防关键点</div>
              </div>
            </div>
            <span class="text-base font-black text-teal-700">{{ mistakesBySubject.gomoku }} 道</span>
          </div>
        </div>

        <!-- Recent Pending Mistakes Preview -->
        <div v-if="pendingMistakes.length > 0" class="space-y-2.5 pt-1">
          <div class="text-xs font-black text-slate-500 flex items-center justify-between px-1">
            <span>待攻坚错题预览（点击卡片可直接前往错题本攻克）：</span>
            <span class="text-rose-600 font-bold">待消灭 {{ pendingMistakes.length }} 道 · 已攻克 {{ resolvedMistakesCount }} 道 (攻克率 {{ mistakeMasteryPercent }}%)</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="m in pendingMistakes.slice(0, 4)"
              :key="m.id"
              @click="goToMistakes(m.subjectId)"
              class="p-4 rounded-2xl bg-slate-50 hover:bg-rose-50/50 border border-slate-200 hover:border-rose-300 transition cursor-pointer flex flex-col justify-between space-y-2 shadow-2xs"
            >
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                  {{ m.knowledgePointTitle }}
                </span>
                <span class="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Brain class="w-3 h-3" />
                  <span>待消灭</span>
                </span>
              </div>

              <div class="text-sm font-black text-slate-900 line-clamp-1">
                {{ m.questionPrompt }}
              </div>

              <div class="text-[11px] text-slate-500 font-bold flex items-center justify-between pt-1 border-t border-slate-200/60">
                <span class="text-rose-600">❌ 错答: {{ m.userAnswer }}</span>
                <span class="text-emerald-700 font-black">✅ 标准: {{ m.correctAnswer }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="py-6 text-center rounded-2xl bg-emerald-50/60 border border-dashed border-emerald-200 space-y-1.5">
          <div class="text-2xl">🎉</div>
          <div class="text-xs font-black text-emerald-800">当前没有待消灭的错题！做题弱点已全部扫清！</div>
          <p class="text-[11px] text-slate-500 font-medium">在闯关做题做错时会自动收录，随时可来错题本随机抽题练！</p>
        </div>
      </div>

      <!-- 金币与星星流水：有档案才展示 -->
      <div
        v-if="userStore.hasProfile"
        class="bg-white rounded-3xl p-5 sm:p-6 border-2 border-orange-100 shadow-sm"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
            <span>📜</span>
            <span class="font-cartoon font-bold">金币与星星记录</span>
          </h2>
          <span class="text-[10px] font-bold text-gray-400">最近 40 条</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="rounded-2xl border border-amber-100 bg-amber-50/40 p-3.5 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-amber-900 flex items-center gap-1.5">
                <Coins class="w-3.5 h-3.5 text-amber-500" />
                金币流水
              </span>
              <span class="text-[11px] font-black text-amber-800">余额 {{ userStore.coins }}</span>
            </div>
            <div v-if="userStore.coinLog.length === 0" class="text-[11px] font-bold text-amber-800/70 py-6 text-center">
              还没有明细。通关、打卡或对弈赢到金币后，就会出现在这里。
            </div>
            <div v-else class="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
              <div
                v-for="item in userStore.coinLog"
                :key="item.id"
                class="flex items-center justify-between gap-2 bg-white/80 rounded-xl px-2.5 py-2 border border-amber-100"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-base flex-shrink-0">{{ item.icon }}</span>
                  <div class="min-w-0">
                    <div class="text-[11px] font-black text-gray-800 truncate">{{ item.reason }}</div>
                    <div class="text-[10px] font-bold text-gray-400">{{ formatLogTime(item.at) }}</div>
                  </div>
                </div>
                <div class="text-right flex-shrink-0">
                  <div
                    class="text-xs font-black"
                    :class="item.amount >= 0 ? 'text-emerald-600' : 'text-rose-500'"
                  >
                    {{ item.amount >= 0 ? '+' : '' }}{{ item.amount }}
                  </div>
                  <div class="text-[10px] font-bold text-gray-400">余 {{ item.balance }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-rose-100 bg-rose-50/40 p-3.5 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-rose-900 flex items-center gap-1.5">
                <Star class="w-3.5 h-3.5 text-rose-500 fill-current" />
                星星流水
              </span>
              <span class="text-[11px] font-black text-rose-800">累计 {{ userStore.totalStars }}</span>
            </div>
            <div v-if="userStore.starLog.length === 0" class="text-[11px] font-bold text-rose-800/70 py-6 text-center">
              还没有明细。闯关拿到新星星后，就会出现在这里。
            </div>
            <div v-else class="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
              <div
                v-for="item in userStore.starLog"
                :key="item.id"
                class="flex items-center justify-between gap-2 bg-white/80 rounded-xl px-2.5 py-2 border border-rose-100"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-base flex-shrink-0">{{ item.icon }}</span>
                  <div class="min-w-0">
                    <div class="text-[11px] font-black text-gray-800 truncate">{{ item.reason }}</div>
                    <div class="text-[10px] font-bold text-gray-400">{{ formatLogTime(item.at) }}</div>
                  </div>
                </div>
                <div class="text-right flex-shrink-0">
                  <div class="text-xs font-black text-rose-600">+{{ item.amount }}</div>
                  <div class="text-[10px] font-bold text-gray-400">共 {{ item.balance }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Case B: Not Logged In or No Profile -> Action Prompt -->
      <div v-else class="bg-white rounded-3xl p-8 sm:p-12 border-2 border-orange-100 shadow-sm text-center space-y-4">
        <div class="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-300 via-orange-400 to-rose-400 p-1 shadow-md flex items-center justify-center text-4xl">
          👶
        </div>
        <div class="space-y-1">
          <h2 class="text-2xl font-black text-gray-900">
            {{ userStore.isLoggedIn ? '请创建您的第一个宝贝档案' : '登录开启宝贝成长中心' }}
          </h2>
          <p class="text-xs sm:text-sm text-gray-500 font-bold max-w-md mx-auto">
            {{ userStore.isLoggedIn ? '创建宝贝档案后，即可为孩子记录闯关星星、成就勋章与段位棋力！' : '登录家长账号后，孩子的所有学习进度与勋章都将安全保存在云端，多设备自动打通！' }}
          </p>
        </div>
        <button
          v-if="!userStore.isLoggedIn"
          @click="userStore.openAuthModal()"
          class="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-md transition active:scale-95 inline-flex items-center gap-2 cursor-pointer"
        >
          <LogIn class="w-4 h-4" />
          <span>立即登录 / 注册账号 🚀</span>
        </button>
        <button
          v-else
          @click="userStore.openProfileModal()"
          class="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm shadow-md transition active:scale-95 inline-flex items-center gap-2 cursor-pointer"
        >
          <UserPlus class="w-4 h-4" />
          <span>创建宝贝档案 👶</span>
        </button>
      </div>

      <!-- Parent Account Card (家长账号与多端同步中心) -->
      <div class="bg-white rounded-3xl p-4 sm:p-6 border-2 border-orange-100 shadow-sm space-y-3.5 select-none">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 p-0.5 shadow-2xs flex items-center justify-center border border-white flex-shrink-0">
              <div class="w-full h-full bg-white/20 rounded-xl flex items-center justify-center text-white">
                <ShieldCheck v-if="userStore.isLoggedIn" class="w-5 h-5" />
                <User v-else class="w-5 h-5" />
              </div>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <h2 class="text-sm sm:text-base font-black text-gray-900 leading-tight">家长账号与云端同步</h2>
                <span
                  class="text-[10px] font-black px-1.5 py-0.2 rounded-full inline-flex items-center gap-1 whitespace-nowrap"
                  :class="userStore.isLoggedIn ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600 border border-gray-200'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="userStore.isLoggedIn ? 'bg-emerald-500' : 'bg-gray-400'"></span>
                  {{ userStore.isLoggedIn ? '云端已连接' : '未登录 (本地模式)' }}
                </span>
                <span
                  v-if="userStore.isLoggedIn && userStore.isAdmin"
                  class="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-purple-50 text-purple-700 border border-purple-200"
                >
                  系统管理员
                </span>
              </div>
              <p class="text-xs text-gray-500 font-bold truncate mt-0.5">
                {{ userStore.isLoggedIn ? userStore.currentUserEmail : '登录后可在手机、平板、电脑间实时无缝同步孩子的所有学习进度与勋章！' }}
              </p>
            </div>
          </div>

          <div v-if="userStore.isLoggedIn" class="flex items-center gap-1.5 flex-shrink-0">
            <button
              @click="handleManualSync"
              :disabled="userStore.isSyncingToCloud"
              class="py-1.5 px-2.5 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-xl text-xs font-black flex items-center gap-1 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              title="立即同步当前所有档案至 Supabase 云数据库"
            >
              <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': userStore.isSyncingToCloud }" />
              <span class="hidden sm:inline">{{ userStore.isSyncingToCloud ? '同步中...' : '立即同步' }}</span>
            </button>

            <button
              @click="userStore.openAuthModal()"
              class="hidden sm:flex py-1.5 px-2.5 bg-gray-50 hover:bg-rose-50 text-gray-600 hover:text-rose-600 border border-gray-200 rounded-xl text-xs font-bold transition active:scale-95 items-center gap-1 cursor-pointer"
            >
              <LogOut class="w-3.5 h-3.5" />
              <span>切换 / 退出</span>
            </button>
          </div>
        </div>

        <!-- Logged In Extra Actions -->
        <div v-if="userStore.isLoggedIn" class="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
          <div class="text-[11px] font-bold text-gray-400 flex items-center gap-2">
            <span>最后同步时间：{{ userStore.lastCloudSyncedAt ? formatLogTime(userStore.lastCloudSyncedAt) : '刚刚' }}</span>
            <span v-if="userStore.cloudSyncError" class="text-rose-600 font-black">
              (⚠️ {{ userStore.cloudSyncError }})
            </span>
          </div>

          <button
            v-if="userStore.isAdmin"
            @click="router.push('/admin')"
            class="py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-2xl text-xs font-black transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <ShieldAlert class="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
            <span>进入管理后台 👑</span>
          </button>

          <button
            @click="userStore.openAuthModal()"
            class="sm:hidden py-2 px-3 bg-gray-50 hover:bg-rose-50 text-gray-600 hover:text-rose-600 border border-gray-200 rounded-2xl text-xs font-bold transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <LogOut class="w-3.5 h-3.5" />
            <span>切换账号 / 退出登录</span>
          </button>
        </div>

        <!-- Not Logged In CTA -->
        <div v-else class="pt-1 border-t border-gray-100">
          <button
            @click="userStore.openAuthModal()"
            class="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white rounded-2xl text-xs sm:text-sm font-black shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogIn class="w-4 h-4" />
            <span>登录家长账号开启多端云同步 🚀</span>
          </button>
        </div>
      </div>

      <!-- Favorite Puzzles Showcase -->
      <div v-if="userStore.hasProfile" class="bg-white rounded-3xl p-6 sm:p-8 border-2 border-rose-100 shadow-sm space-y-5">
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
              <Heart class="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 class="text-xl font-cartoon font-bold text-gray-900 tracking-wide">死活题专属收藏本 (Favorite Puzzles)</h2>
              <p class="text-xs text-gray-500 font-medium">收集重点难题与经典手筋，方便随时集中练习与巩固</p>
            </div>
          </div>
          <button
            @click="goToTsumego()"
            class="text-xs font-black px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            :class="
              unlockStore.isFeatureUnlocked('tsumego')
                ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200'
                : 'text-gray-500 bg-gray-50 hover:bg-gray-100 border-gray-200'
            "
          >
            <span>{{ unlockStore.isFeatureUnlocked('tsumego') ? '去死活题大本营' : '死活大本营 🔒' }}</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Favorites List -->
        <div v-if="favoritePuzzlesList.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="p in favoritePuzzlesList"
            :key="p.id"
            @click="goToTsumego(p.id)"
            class="rounded-3xl p-4 border-2 border-rose-100 hover:border-rose-300 bg-gradient-to-br from-white to-rose-50/30 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-3"
          >
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-black text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
                  {{ p.categoryLabel }}
                </span>
                <div class="flex items-center gap-1">
                  <div class="flex items-center text-amber-400 mr-1">
                    <Star v-for="s in p.difficultyStars" :key="s" class="w-3 h-3 fill-current" />
                  </div>
                </div>
              </div>

              <div>
                <h4 class="text-sm font-black text-gray-900 group-hover:text-rose-600 transition flex items-center gap-1.5">
                  <span>{{ p.title }}</span>
                  <CheckCircle2 v-if="tsumegoStore.isSolved(p.id)" class="w-4 h-4 text-emerald-500" />
                </h4>
                <p class="text-xs text-gray-500 font-medium line-clamp-2 mt-1">
                  {{ p.prompt }}
                </p>
              </div>
            </div>

            <div class="pt-2 border-t border-rose-100 flex items-center justify-between text-[11px] font-bold text-gray-500">
              <span class="text-rose-600 flex items-center gap-1">
                <span>{{ tsumegoStore.isSolved(p.id) ? '已攻克 🌟' : '待练习 🎯' }}</span>
              </span>
              <span class="text-orange-500 font-black flex items-center gap-1 group-hover:translate-x-0.5 transition">
                <span>立即做题</span>
                <ArrowRight class="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        <!-- Empty Favorites -->
        <div v-else class="py-8 px-4 text-center rounded-3xl bg-rose-50/40 border border-dashed border-rose-200 space-y-3">
          <div class="text-3xl">💖</div>
          <div class="space-y-1">
            <h4 class="text-sm font-black text-gray-800">还没有收藏任何死活题哦</h4>
            <p class="text-xs text-gray-500 font-medium max-w-md mx-auto">
              在「每日死活」模块做题时，点击棋盘左下方的【❤️ 收藏】按钮，即可把易错题、重点妙手题一键收入此处！
            </p>
          </div>
          <button
            @click="goToTsumego()"
            class="px-4 py-2 rounded-2xl text-white font-black text-xs shadow-sm transition active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
            :class="
              unlockStore.isFeatureUnlocked('tsumego')
                ? 'bg-rose-500 hover:bg-rose-600'
                : 'bg-gray-400 hover:bg-gray-500'
            "
          >
            <span>{{ unlockStore.isFeatureUnlocked('tsumego') ? '去死活题库挑一挑 🎯' : '去死活题库挑一挑 (通关第3章解锁 🔒)' }}</span>
          </button>
        </div>
      </div>

      <!-- Badge Showcase -->
      <div v-if="userStore.hasProfile" class="bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-100 shadow-sm space-y-5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Trophy class="w-6 h-6 text-amber-500" />
            <h2 class="text-xl font-cartoon font-bold text-gray-900 tracking-wide">徽章陈列室 (Badge Showcase)</h2>
          </div>
          <span class="text-xs font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            已收集 {{ userStore.unlockedBadges.length }} / {{ BADGES_DATA.length }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="badge in BADGES_DATA"
            :key="badge.id"
            class="rounded-3xl p-4 border-2 transition-all flex flex-col justify-between cursor-pointer"
            :class="
              isBadgeUnlocked(badge.id)
                ? 'bg-white border-amber-300 shadow-sm hover:shadow-md'
                : 'bg-gray-50 border-gray-200 opacity-50 grayscale hover:opacity-75'
            "
          >
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-3xl">{{ badge.icon }}</span>
                <span
                  class="text-[10px] font-black px-2 py-0.5 rounded-full border"
                  :class="getRarityBadgeClass(badge.rarity)"
                >
                  {{ badge.rarity }}
                </span>
              </div>

              <div>
                <h4 class="text-sm font-black text-gray-900 flex items-center gap-1.5">
                  <span>{{ badge.title }}</span>
                  <CheckCircle2 v-if="isBadgeUnlocked(badge.id)" class="w-4 h-4 text-emerald-500" />
                  <Lock v-else class="w-3.5 h-3.5 text-gray-400" />
                </h4>
                <div class="text-[10px] text-gray-400 font-bold">{{ badge.titleEn }}</div>
                <p class="text-xs text-gray-600 font-medium mt-1 leading-relaxed">
                  {{ badge.description }}
                </p>
              </div>
            </div>

            <div class="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-gray-500">
              <span class="text-indigo-600">+{{ badge.expReward }} XP</span>
              <span class="text-amber-600">+{{ badge.coinReward }} 金币</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Theme & Profile Settings -->
      <div v-if="userStore.hasProfile" class="bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-100 shadow-sm space-y-6">
        <h2 class="text-xl font-cartoon font-bold text-gray-900 tracking-wide">个性化设置与多档案管理</h2>

        <!-- Data Export & Reset -->
        <div class="flex flex-wrap gap-3">
          <button
            @click="exportData"
            class="px-4 py-2.5 rounded-2xl border text-xs font-black flex items-center gap-2 transition active:scale-95 cursor-pointer bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900"
          >
            <Download class="w-4 h-4" />
            <span>导出学习档案备份 (JSON)</span>
          </button>

          <button
            @click="confirmReset"
            class="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <RotateCcw class="w-4 h-4" />
            <span>重置当前宝贝进度</span>
          </button>
        </div>

      </div>

    </div>
    <!-- Certificate Modal -->
    <CertificateModal
      :isOpen="showCertModal"
      :rankTitle="userStore.currentRank.title"
      :rankLevel="userStore.currentRank.rankLevel"
      @close="showCertModal = false"
    />
  </div>
</template>










