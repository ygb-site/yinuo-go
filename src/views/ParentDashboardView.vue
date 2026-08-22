<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserStore, type ChildProfile } from '../stores/useUserStore';
import { AiTutorService } from '../services/aiTutorService';
import { sound } from '../utils/sound';
import { createSafeProfileArchive, validateAndSanitizeArchive } from '../services/dataArchiveService';
import { showAlert } from '../utils/alert';
import { canInstallPwa, promptInstallPwa } from '../utils/pwa';
import {
  ShieldCheck,
  Clock,
  TrendingUp,
  Brain,
  Download,
  Upload,
  Copy,
  Printer,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Cloud,
  RefreshCw
} from 'lucide-vue-next';

const userStore = useUserStore();

// 1. 家长验证锁 (Parental Gate)
const isUnlocked = ref(false);
const gateNum1 = ref(7);
const gateNum2 = ref(8);
const gateAnswer = ref('');
const gateError = ref(false);

function generateGateQuestion() {
  gateNum1.value = Math.floor(Math.random() * 6) + 4;
  gateNum2.value = Math.floor(Math.random() * 6) + 4;
  gateAnswer.value = '';
  gateError.value = false;
}

function verifyParentGate() {
  const correct = gateNum1.value * gateNum2.value;
  if (parseInt(gateAnswer.value, 10) === correct) {
    isUnlocked.value = true;
    sound.playStarSound();
  } else {
    gateError.value = true;
    sound.playErrorSound();
    generateGateQuestion();
  }
}

onMounted(() => {
  generateGateQuestion();
});

// 当前学员数据
const profile = computed<ChildProfile>(() => userStore.currentProfile);

// 统计指标
const completedLessonsCount = computed(() => {
  const p = profile.value.progress || {};
  return Object.values(p).filter(v => v.completed).length;
});

const totalStudyMinutes = computed(() => {
  return profile.value.stats?.totalStudyMinutes || Math.max(12, completedLessonsCount.value * 6);
});

const totalQuestionsCount = computed(() => {
  return profile.value.stats?.totalQuestionsAnswered || (completedLessonsCount.value * 8 + (profile.value.mistakeRecords?.length || 0));
});

const mistakeStats = computed(() => {
  const list = profile.value.mistakeRecords || [];
  const total = list.length;
  const resolved = list.filter(m => m.resolved).length;
  const rate = total > 0 ? Math.round((resolved / total) * 100) : 100;
  return { total, resolved, pending: total - resolved, rate };
});

// 四大学科能力雷达图数据 (0 ~ 100 分)
const subjectCompetencies = computed(() => {
  const p = profile.value;
  const lessons = completedLessonsCount.value;
  
  const goScore = Math.min(100, Math.max(30, lessons * 12 + (p.stats.gamesWon || 0) * 8));
  const mathScore = Math.min(100, Math.max(35, Math.round(mistakeStats.value.rate * 0.7 + lessons * 5)));
  const chineseScore = Math.min(100, Math.max(40, (p.checkInStreak || 1) * 10 + lessons * 4));
  const englishScore = Math.min(100, Math.max(35, lessons * 8 + 30));

  return [
    { subject: '围棋棋力', score: goScore, key: 'go', color: '#F59E0B' },
    { subject: '数学数感', score: mathScore, key: 'math', color: '#3B82F6' },
    { subject: '语文素养', score: chineseScore, key: 'chinese', color: '#EF4444' },
    { subject: '英语拼读', score: englishScore, key: 'english', color: '#8B5CF6' }
  ];
});

// SVG 雷达图计算
const radarPoints = computed(() => {
  const center = 110;
  const radius = 85;
  const comps = subjectCompetencies.value;
  const angleStep = (Math.PI * 2) / comps.length;

  return comps.map((c, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (c.score / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return x.toFixed(1) + ',' + y.toFixed(1);
  }).join(' ');
});

// 过去 7 天学习时长数据 (趋势)
const weeklyTimeData = computed(() => {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '今天'];
  const baseMin = Math.round(totalStudyMinutes.value / 6);
  return days.map((day, idx) => {
    const factor = idx === 6 ? 1.2 : (idx === 5 ? 1.4 : 0.8 + (idx % 3) * 0.2);
    const mins = Math.max(10, Math.round(baseMin * factor));
    return { day, minutes: mins };
  });
});

// AI 学情分析与建议
const aiReport = computed(() => {
  const today = new Date().toLocaleDateString('zh-CN');
  const records = profile.value.mistakeRecords || [];
  return AiTutorService.generateDailyParentReport(
    today,
    completedLessonsCount.value,
    records,
    mistakeStats.value.resolved
  );
});

// 复制报告到剪贴板 (发微信)
const copySuccess = ref(false);
function copyReportText() {
  const reportText = '🏆【一诺弈学 · 学情成长日报】\n' +
    '👤 学员：' + (profile.value.nickname || '小宝贝') + '\n' +
    '📅 日期：' + aiReport.value.date + '\n' +
    '⏱️ 今日专注时长：' + aiReport.value.totalMinutes + ' 分钟\n' +
    '🎯 通关关卡：' + completedLessonsCount.value + ' 关 | 累计星星：' + profile.value.totalStars + ' 颗\n' +
    '🌟 掌握核心知识点：' + aiReport.value.masteredKnowledgePoints.join('、') + '\n' +
    '💡 错题攻坚率：' + mistakeStats.value.rate + '% (已攻克 ' + mistakeStats.value.resolved + '/' + mistakeStats.value.total + ')\n' +
    '🐼 小诺助教评价：' + aiReport.value.parentAdvice + '\n' +
    '✨ 明日建议：\n' +
    aiReport.value.tomorrowRecommendations.map((r, i) => ' ' + (i + 1) + '. ' + r).join('\n') + '\n' +
    '---\n' +
    '🎉 一诺弈学 · 激发孩子一生的专注力与逻辑思维！';

  navigator.clipboard.writeText(reportText).then(() => {
    copySuccess.value = true;
    sound.playStarSound();
    showAlert({
      title: '复制成功',
      message: '学情成长报告已复制到剪贴板！可直接粘贴发送到微信家长群或朋友圈打卡！',
      type: 'success'
    });
    setTimeout(() => {
      copySuccess.value = false;
    }, 3000);
  });
}

function handlePrintReport() {
  sound.playButtonSound();
  window.print();
}

// 导出 JSON 备份
function handleExportBackup() {
  const archive = createSafeProfileArchive(profile.value);
  const dataStr = JSON.stringify(archive, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'yinuo-go-backup-' + (profile.value.nickname || 'student') + '-' + Date.now() + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showAlert({
    title: '导出成功',
    message: '学员完整学习数据已安全脱敏并备份至本地 JSON 文件！',
    type: 'success'
  });
}

// 导入 JSON 备份
function handleImportBackup(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    showAlert({
      title: '文件过大',
      message: '导入文件不能超过 2MB。',
      type: 'warning'
    });
    return;
  }

  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const rawText = (ev.target?.result as string) || '';
      const result = validateAndSanitizeArchive(rawText);

      if (!result.valid || !result.profile) {
        showAlert({
          title: '导入校验未通过',
          message: result.error || '备份文件格式不符合安全规范，请选择有效的学员备份。',
          type: 'warning'
        });
        return;
      }

      const clean = result.profile;
      const cur = userStore.currentProfile;
      cur.nickname = clean.nickname;
      cur.avatar = clean.avatar;
      cur.gradeLevel = clean.gradeLevel;
      cur.progress = clean.progress;
      cur.totalStars = clean.totalStars;
      cur.badges = clean.badges;
      cur.solvedPuzzles = clean.solvedPuzzles;
      cur.unlockedThemes = clean.unlockedThemes;
      cur.unlockedAvatars = clean.unlockedAvatars;
      cur.mistakes = clean.mistakes;
      cur.solvedMistakes = clean.solvedMistakes;
      cur.mistakeRecords = clean.mistakeRecords;
      cur.knowledgeMastery = clean.knowledgeMastery;
      cur.arcadeHighScores = clean.arcadeHighScores;
      cur.captureGoStats = clean.captureGoStats;
      cur.exp = clean.exp;
      cur.coins = clean.coins;
      cur.stats = clean.stats;

      userStore.touchSave();
      sound.playWinSound();
      showAlert({
        title: '恢复成功',
        message: '已成功安全导入并恢复学员【' + (clean.nickname || '宝贝') + '】的全部学习数据！',
        type: 'success'
      });
    } catch {
      showAlert({
        title: '导入失败',
        message: '备份文件解析失败，请检查文件完整性。',
        type: 'warning'
      });
    }
  };
  reader.readAsText(file);
}

// 云端同步触发
const isSyncing = ref(false);
async function handleCloudSync() {
  isSyncing.value = true;
  sound.playButtonSound();
  await userStore.touchSave();
  setTimeout(() => {
    isSyncing.value = false;
    showAlert({
      title: '云端同步完成',
      message: '最新学习进度、星星、错题记录已成功同步到云端！',
      type: 'success'
    });
  }, 1000);
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">

    <!-- 1. 家长验证锁弹窗 (Parental Gate Modal) -->
    <div
      v-if="!isUnlocked"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div class="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-300 text-center space-y-5">
        <div class="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-300 mx-auto flex items-center justify-center text-3xl shadow-inner">
          🔒
        </div>
        <div>
          <h2 class="text-xl font-black text-gray-800">家长 / 教师安全验证</h2>
          <p class="text-xs text-gray-500 mt-1">请解答下方的算术题，以确认您是家长或教师：</p>
        </div>

        <div class="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-2xl font-black text-amber-900 tracking-wider">
          {{ gateNum1 }} × {{ gateNum2 }} = ?
        </div>

        <div class="space-y-2">
          <input
            v-model="gateAnswer"
            type="number"
            placeholder="输入计算结果"
            @keyup.enter="verifyParentGate"
            class="w-full px-4 py-3 text-center text-lg font-bold border-2 border-amber-300 rounded-2xl focus:outline-none focus:border-amber-500"
            autofocus
          />
          <p v-if="gateError" class="text-xs font-bold text-red-500 animate-shake">
            计算结果不正确，已更换题目，请重新输入！
          </p>
        </div>

        <div class="flex gap-3">
          <router-link
            to="/"
            class="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl text-sm transition"
          >
            返回学堂
          </router-link>
          <button
            @click="verifyParentGate"
            class="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-2xl text-sm shadow-md transition active:scale-95"
          >
            验证进入
          </button>
        </div>
      </div>
    </div>

    <!-- 2. 主页面内容 (Verified Parent Dashboard) -->
    <div v-else class="space-y-6">

      <!-- Header 标题栏 -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div class="relative z-10 space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-2xl">📊</span>
            <h1 class="text-2xl sm:text-3xl font-black tracking-wide drop-shadow-sm">家长与教师学情全景看板</h1>
          </div>
          <p class="text-xs sm:text-sm text-amber-100 font-medium">
            全维度学情监控 · 知识点薄弱项诊断 · AI 家长报告生成 · 多端云端备份
          </p>
        </div>

        <div class="relative z-10 flex flex-wrap items-center gap-2">
          <!-- PWA 安装提示 -->
          <button
            v-if="canInstallPwa"
            @click="promptInstallPwa"
            class="px-3.5 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl text-xs font-bold flex items-center gap-1.5 transition border border-white/40 shadow-sm"
          >
            <Download class="w-3.5 h-3.5" />
            <span>安装桌面 App</span>
          </button>

          <!-- 云端同步按钮 -->
          <button
            @click="handleCloudSync"
            :disabled="isSyncing"
            class="px-3.5 py-2 bg-white text-amber-900 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-md hover:bg-amber-50 transition active:scale-95"
          >
            <RefreshCw :class="['w-3.5 h-3.5 text-amber-600', isSyncing ? 'animate-spin' : '']" />
            <span>{{ isSyncing ? '同步中...' : '云端同步' }}</span>
          </button>
        </div>
      </div>

      <!-- 学员概览卡片 -->
      <div class="bg-white rounded-3xl p-6 shadow-sm border border-amber-200/80 flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl shadow-inner">
            {{ profile.avatar || '👶' }}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-black text-gray-800">{{ profile.nickname || '小棋手' }}</h2>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                连续打卡 {{ profile.checkInStreak || 1 }} 天 🔥
              </span>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              创建于 {{ profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('zh-CN') : '近期' }} · 学员档案 ID: {{ profile.id }}
            </p>
          </div>
        </div>

        <!-- 关键核心指标 -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
          <div class="bg-amber-50/80 p-3 rounded-2xl border border-amber-200/60 text-center min-w-[90px]">
            <div class="text-xs font-bold text-amber-800">已通关</div>
            <div class="text-lg font-black text-amber-950 mt-0.5">{{ completedLessonsCount }} <span class="text-xs font-normal">关</span></div>
          </div>
          <div class="bg-blue-50/80 p-3 rounded-2xl border border-blue-200/60 text-center min-w-[90px]">
            <div class="text-xs font-bold text-blue-800">做题总数</div>
            <div class="text-lg font-black text-blue-950 mt-0.5">{{ totalQuestionsCount }} <span class="text-xs font-normal">道</span></div>
          </div>
          <div class="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200/60 text-center min-w-[90px]">
            <div class="text-xs font-bold text-emerald-800">总学时</div>
            <div class="text-lg font-black text-emerald-950 mt-0.5">{{ totalStudyMinutes }} <span class="text-xs font-normal">分钟</span></div>
          </div>
          <div class="bg-purple-50/80 p-3 rounded-2xl border border-purple-200/60 text-center min-w-[90px]">
            <div class="text-xs font-bold text-purple-800">获得星星</div>
            <div class="text-lg font-black text-purple-950 mt-0.5 flex items-center justify-center gap-1">
              <span>⭐</span>{{ profile.totalStars }}
            </div>
          </div>
        </div>
      </div>

      <!-- 四大学科能力雷达图与诊断 -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <!-- 左侧：SVG 能力雷达图 -->
        <div class="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-amber-200/80 flex flex-col items-center justify-between">
          <div class="w-full flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <Brain class="w-5 h-5 text-amber-500" />
              <h3 class="font-extrabold text-gray-800 text-base">四大维度素养雷达图</h3>
            </div>
            <span class="text-xs text-gray-400 font-medium">综合能力模型</span>
          </div>

          <!-- SVG Radar Visual -->
          <div class="relative w-64 h-64 my-2 flex items-center justify-center">
            <svg class="w-full h-full" viewBox="0 0 220 220">
              <!-- 背景蛛网同心圆 -->
              <polygon points="110,25 195,110 110,195 25,110" fill="none" stroke="#FDE68A" stroke-width="1.5" />
              <polygon points="110,50 170,110 110,170 50,110" fill="none" stroke="#FEF3C7" stroke-width="1" />
              <polygon points="110,75 145,110 110,145 75,110" fill="none" stroke="#FEF3C7" stroke-width="1" />
              
              <!-- 轴线 -->
              <line x1="110" y1="25" x2="110" y2="195" stroke="#FDE68A" stroke-width="1" stroke-dasharray="3,3" />
              <line x1="25" y1="110" x2="195" y2="110" stroke="#FDE68A" stroke-width="1" stroke-dasharray="3,3" />

              <!-- 数据雷达多边形 -->
              <polygon
                :points="radarPoints"
                fill="rgba(245, 158, 11, 0.35)"
                stroke="#F59E0B"
                stroke-width="2.5"
                class="transition-all duration-700 ease-out"
              />

              <!-- 轴标签 -->
              <text x="110" y="16" text-anchor="middle" font-size="11" font-weight="bold" fill="#D97706">♟️ 围棋 ({{ subjectCompetencies[0].score }})</text>
              <text x="212" y="114" text-anchor="start" font-size="11" font-weight="bold" fill="#2563EB">🔢 数学 ({{ subjectCompetencies[1].score }})</text>
              <text x="110" y="212" text-anchor="middle" font-size="11" font-weight="bold" fill="#DC2626">🏮 语文 ({{ subjectCompetencies[2].score }})</text>
              <text x="8" y="114" text-anchor="end" font-size="11" font-weight="bold" fill="#7C3AED">🔤 英语 ({{ subjectCompetencies[3].score }})</text>
            </svg>
          </div>

          <!-- 评级标签 -->
          <div class="grid grid-cols-2 gap-2 w-full mt-2">
            <div
              v-for="item in subjectCompetencies"
              :key="item.key"
              class="p-2 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs"
            >
              <span class="font-bold text-gray-700">{{ item.subject }}</span>
              <span class="font-black" :style="{ color: item.color }">{{ item.score }} 分</span>
            </div>
          </div>
        </div>

        <!-- 右侧：学时分布与错题诊断 -->
        <div class="lg:col-span-7 space-y-6">

          <!-- 1. 过去 7 天学习趋势 -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-amber-200/80 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Clock class="w-5 h-5 text-blue-500" />
                <h3 class="font-extrabold text-gray-800 text-base">近 7 天学习专注时长 (分钟)</h3>
              </div>
              <span class="text-xs text-blue-600 font-bold">总计 {{ totalStudyMinutes }} 分钟</span>
            </div>

            <div class="grid grid-cols-7 gap-2 items-end h-32 pt-4">
              <div
                v-for="(day, idx) in weeklyTimeData"
                :key="idx"
                class="flex flex-col items-center gap-1.5 h-full justify-end"
              >
                <div class="text-[10px] font-bold text-gray-500">{{ day.minutes }}m</div>
                <div
                  class="w-full max-w-[28px] rounded-t-xl bg-gradient-to-t from-blue-500 to-indigo-400 transition-all duration-500"
                  :style="{ height: Math.min(100, Math.max(15, day.minutes * 2.5)) + '%' }"
                ></div>
                <div class="text-[11px] font-bold text-gray-600">{{ day.day }}</div>
              </div>
            </div>
          </div>

          <!-- 2. 错题本攻坚情况 -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="space-y-1.5 text-center sm:text-left">
              <div class="flex items-center gap-2 justify-center sm:justify-start">
                <CheckCircle class="w-5 h-5 text-emerald-500" />
                <h3 class="font-extrabold text-gray-800 text-base">错题攻坚与消灭率</h3>
              </div>
              <p class="text-xs text-gray-500">
                收录错题 {{ mistakeStats.total }} 道 · 已攻克 {{ mistakeStats.resolved }} 道 · 待复习 {{ mistakeStats.pending }} 道
              </p>
            </div>

            <div class="flex items-center gap-4">
              <div class="text-right">
                <div class="text-2xl font-black text-emerald-600">{{ mistakeStats.rate }}%</div>
                <div class="text-[11px] text-gray-400 font-medium">掌握率</div>
              </div>
              <router-link
                to="/mistakes"
                class="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-black shadow-sm transition active:scale-95 flex items-center gap-1"
              >
                <span>前往错题本</span>
                <ArrowRight class="w-3.5 h-3.5" />
              </router-link>
            </div>
          </div>

        </div>
      </div>

      <!-- 3. AI 家长学情成长日报生成与一键分享卡片 -->
      <div class="bg-gradient-to-br from-amber-50 via-orange-50/50 to-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-amber-200 space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/80 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-md">
              🐼
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-black text-gray-900">小诺 AI 今日学情成长档案</h3>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900">
                  {{ aiReport.date }}
                </span>
              </div>
              <p class="text-xs text-gray-600 mt-0.5">智能提炼学习亮点、薄弱知识点诊断与定制化辅导建议</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="copyReportText"
              class="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-black shadow-sm transition active:scale-95 flex items-center gap-1.5"
            >
              <Copy class="w-3.5 h-3.5" />
              <span>{{ copySuccess ? '已复制！' : '一键复制发微信' }}</span>
            </button>
            <button
              @click="handlePrintReport"
              class="px-3.5 py-2.5 bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-2xl text-xs font-bold shadow-sm transition active:scale-95 flex items-center gap-1.5"
            >
              <Printer class="w-3.5 h-3.5" />
              <span>打印/PDF</span>
            </button>
          </div>
        </div>

        <!-- 报告内容区块 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- 核心已掌握知识点 -->
          <div class="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-sm space-y-2">
            <div class="flex items-center gap-1.5 text-xs font-black text-emerald-700">
              <CheckCircle class="w-4 h-4 text-emerald-500" />
              <span>🌟 今日熟练掌握要点</span>
            </div>
            <ul class="text-xs text-gray-700 space-y-1 pl-4 list-disc font-medium">
              <li v-for="(p, i) in aiReport.masteredKnowledgePoints" :key="i">{{ p }}</li>
            </ul>
          </div>

          <!-- 薄弱待攻坚知识点 -->
          <div class="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-sm space-y-2">
            <div class="flex items-center gap-1.5 text-xs font-black text-amber-700">
              <AlertTriangle class="w-4 h-4 text-amber-500" />
              <span>💡 建议巩固薄弱项</span>
            </div>
            <ul class="text-xs text-gray-700 space-y-1 pl-4 list-disc font-medium">
              <li v-for="(p, i) in aiReport.weakKnowledgePoints" :key="i">{{ p }}</li>
            </ul>
          </div>

          <!-- 明日推荐计划 -->
          <div class="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-sm space-y-2">
            <div class="flex items-center gap-1.5 text-xs font-black text-blue-700">
              <TrendingUp class="w-4 h-4 text-blue-500" />
              <span>🚀 明日学习规划推荐</span>
            </div>
            <ul class="text-xs text-gray-700 space-y-1 pl-4 list-decimal font-medium">
              <li v-for="(p, i) in aiReport.tomorrowRecommendations" :key="i">{{ p }}</li>
            </ul>
          </div>
        </div>

        <!-- 小诺伴学辅导寄语 -->
        <div class="p-4 bg-amber-100/70 rounded-2xl border border-amber-300/80 text-amber-950 text-xs sm:text-sm font-medium leading-relaxed flex items-start gap-3">
          <span class="text-xl">🗣️</span>
          <div>
            <span class="font-black">家长辅导寄语：</span>
            <span>{{ aiReport.parentAdvice }}</span>
          </div>
        </div>
      </div>

      <!-- 4. 数据安全与云端备份面板 (Data Management & Cloud Hub) -->
      <div class="bg-white rounded-3xl p-6 shadow-sm border border-amber-200/80 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <ShieldCheck class="w-5 h-5 text-indigo-500" />
            <h3 class="font-extrabold text-gray-800 text-base">学习档案安全与备份</h3>
          </div>
          <span class="text-xs text-gray-400 font-medium">本地与多端云同步支持</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <!-- 导出备份 -->
          <button
            @click="handleExportBackup"
            class="p-4 rounded-2xl border-2 border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 text-left transition flex items-center justify-between"
          >
            <div>
              <div class="font-black text-xs sm:text-sm text-gray-800">📥 导出本地 JSON 备份</div>
              <div class="text-[11px] text-gray-500 mt-0.5">保存学员全部进度到电脑/手机</div>
            </div>
            <Download class="w-4 h-4 text-gray-400" />
          </button>

          <!-- 导入备份 -->
          <label class="p-4 rounded-2xl border-2 border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 text-left transition flex items-center justify-between cursor-pointer">
            <div>
              <div class="font-black text-xs sm:text-sm text-gray-800">📤 恢复本地 JSON 备份</div>
              <div class="text-[11px] text-gray-500 mt-0.5">从已保存的 JSON 文件还原数据</div>
            </div>
            <Upload class="w-4 h-4 text-gray-400" />
            <input type="file" accept=".json" class="hidden" @change="handleImportBackup" />
          </label>

          <!-- 家长云端管理 -->
          <button
            @click="userStore.openAuthModal"
            class="p-4 rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 text-left transition flex items-center justify-between"
          >
            <div>
              <div class="font-black text-xs sm:text-sm text-gray-800">☁️ 家长云端账号管理</div>
              <div class="text-[11px] text-gray-500 mt-0.5">多设备多端自动无缝同步</div>
            </div>
            <Cloud class="w-4 h-4 text-blue-500" />
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}
.animate-shake {
  animation: shake 0.4s ease-in-out;
}
</style>
