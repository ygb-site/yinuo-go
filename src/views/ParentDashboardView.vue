<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore, type ChildProfile } from '../stores/useUserStore';
import { sound } from '../utils/sound';
import { createSafeProfileArchive, validateAndSanitizeArchive } from '../services/dataArchiveService';
import { showAlert } from '../utils/alert';
import {
  AppCard,
  AppButton,
  AppBadge,
  AppProgress,
  AppAvatar,
  AppSection,
  AppEmptyState
} from '../design-system';
import { buildAbilityProfile } from '../domain/ability/abilityEngine';
import type { AbilityEvent, AbilityDimensionId } from '../domain/ability/types';
import {
  ShieldCheck,
  Clock,
  Download,
  Upload,
  Sparkles
} from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();

// 1. Parental Gate
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

// Current student profile
const profile = computed<ChildProfile>(() => userStore.currentProfile);

// Overall Learning Metrics
const completedLessonsCount = computed(() => {
  const p = profile.value.progress || {};
  return Object.values(p).filter((v) => v.completed).length;
});

const totalStudyMinutes = computed(() => {
  return profile.value.stats?.totalStudyMinutes || Math.max(12, completedLessonsCount.value * 6);
});

const totalQuestionsCount = computed(() => {
  return (
    profile.value.stats?.totalQuestionsAnswered ||
    completedLessonsCount.value * 8 + (profile.value.mistakeRecords?.length || 0)
  );
});

const mistakeStats = computed(() => {
  const list = profile.value.mistakeRecords || [];
  const total = list.length;
  const resolved = list.filter((m) => m.resolved).length;
  const rate = total > 0 ? Math.round((resolved / total) * 100) : 100;
  return { total, resolved, pending: total - resolved, rate };
});

// Ability Analysis derived from real learning records
const abilityProfile = computed(() => {
  const events: AbilityEvent[] = [];
  const now = Date.now();

  // Convert solved mistakes to positive ability signals
  const mistakes = profile.value.mistakeRecords || [];
  for (const m of mistakes) {
    const dim: AbilityDimensionId =
      m.topic?.includes('气') ? 'calculation' :
      m.topic?.includes('眼') ? 'spatial' : 'logic';

    events.push({
      id: 'm_' + m.id,
      profileId: profile.value.id,
      at: m.createdAt || now,
      dimensionId: dim,
      skillId: 'go.topic.' + (m.topic || 'basic'),
      performance: m.resolved ? 1.0 : 0.4,
      difficulty: (m.difficulty || 2) as 1 | 2 | 3 | 4 | 5,
      weight: 1.0
    });
  }

  // Convert completed lessons to spatial and logic signals
  const progress = profile.value.progress || {};
  for (const [k, v] of Object.entries(progress)) {
    if (v.completed) {
      events.push({
        id: 'p_sp_' + k,
        profileId: profile.value.id,
        at: v.completedAt ? new Date(v.completedAt).getTime() : now,
        dimensionId: 'spatial',
        skillId: 'go.lesson.' + k,
        performance: v.stars ? v.stars / 3 : 1.0,
        difficulty: 2,
        weight: 1.0
      });
      events.push({
        id: 'p_log_' + k,
        profileId: profile.value.id,
        at: v.completedAt ? new Date(v.completedAt).getTime() : now,
        dimensionId: 'logic',
        skillId: 'go.lesson.' + k,
        performance: v.stars ? v.stars / 3 : 1.0,
        difficulty: 2,
        weight: 1.0
      });
    }
  }

  return buildAbilityProfile(profile.value.id, events, [], now);
});

// Weekly Diagnostic Story & Advice
const weeklyStory = computed(() => {
  const name = profile.value.nickname || '孩子';
  const mins = totalStudyMinutes.value;
  const lessons = completedLessonsCount.value;

  return [
    `本周 ${name} 累计专注学习 ${mins} 分钟，已通关 ${lessons} 个启蒙主线关卡。`,
    `在空间棋形与死活识别上展现出良好的思考习惯，遇到困难时能主动通过小诺启发式点拨进行订正。`,
    `建议家长周末可陪伴进行 1 局面对面对弈，鼓励孩子复述“真假眼”或“气的连接”要领，巩固思维成长！`
  ];
});

// Archive Export / Import
const exportArchive = () => {
  sound.playButtonSound();
  const archive = createSafeProfileArchive(profile.value);
  const jsonStr = JSON.stringify(archive, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `yinuo_profile_${profile.value.nickname}_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const handleImportArchive = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const rawText = event.target?.result as string;
      const result = validateAndSanitizeArchive(rawText);
      if (result.valid && result.profile) {
        const current = userStore.currentProfile;
        if (current && current.id) {
          Object.assign(current, result.profile);
          userStore.touchSave();
        }
        sound.playWinSound();
        showAlert({
          title: '档案导入成功',
          message: `已成功恢复 ${result.profile.nickname} 的全部成长记录！`,
          type: 'success'
        });
      } else {
        throw new Error(result.error || '档案格式验证未通过');
      }
    } catch (err: any) {
      sound.playErrorSound();
      showAlert({
        title: '档案解析失败',
        message: err?.message || '请选择正确的合法 JSON 档案备份文件！',
        type: 'error'
      });
    }
  };
  reader.readAsText(file);
};
</script>

<template>
  <div class="space-y-6 md:space-y-8 select-none">
    <!-- 🔒 1. Parental Gate Screen -->
    <div
      v-if="!isUnlocked"
      class="max-w-md mx-auto my-12 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-5"
    >
      <div class="w-14 h-14 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
        <ShieldCheck class="w-8 h-8" />
      </div>

      <div class="space-y-1">
        <h2 class="text-xl font-bold text-slate-900">家长验证安全锁</h2>
        <p class="text-sm text-slate-500">
          为了保护孩子的自主学习环境，进入学情空间请先回答下面的数学题：
        </p>
      </div>

      <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 text-2xl font-bold text-slate-800">
        {{ gateNum1 }} × {{ gateNum2 }} = ?
      </div>

      <div class="space-y-3">
        <input
          v-model="gateAnswer"
          type="number"
          placeholder="请输入计算结果"
          class="w-full h-11 text-center text-lg font-bold border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          @keyup.enter="verifyParentGate"
        />

        <div v-if="gateError" class="text-xs text-rose-500 font-bold">
          计算答案有误，请重新计算新的题目哦！
        </div>

        <AppButton variant="primary" size="lg" block @click="verifyParentGate">
          验证并进入家长空间
        </AppButton>
      </div>
    </div>

    <!-- 📊 2. Parent Learning Dashboard (Unlocked) -->
    <div v-else class="space-y-8">
      <!-- Top Title & Child Info -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div class="flex items-center gap-3">
          <AppAvatar :emoji="profile.avatar || '🐼'" size="lg" ring="brand" />
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-2xl font-bold text-slate-900">{{ profile.nickname }}</h2>
              <AppBadge variant="brand" size="sm">少儿学员</AppBadge>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              档案创建于 {{ new Date(profile.createdAt || Date.now()).toLocaleDateString() }} · 围棋启蒙主线阶段
            </p>
          </div>
        </div>

        <!-- Action Tools: Export / Import -->
        <div class="flex items-center gap-2">
          <AppButton variant="secondary" size="sm" @click="exportArchive">
            <template #icon><Download class="w-4 h-4" /></template>
            导出学情档案
          </AppButton>

          <label class="cursor-pointer">
            <input type="file" accept=".json" class="hidden" @change="handleImportArchive" />
            <div class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-bold transition">
              <Upload class="w-4 h-4" />
              <span>导入备份</span>
            </div>
          </label>
        </div>
      </div>

      <!-- Section 1: Weekly Story & Growth Highlights (结论先行) -->
      <AppSection title="本周学情结论与陪伴建议" icon="book-open" tone="learning">
        <AppCard variant="outlined" padding="lg" class="bg-blue-50/40 border-blue-100 space-y-3">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles class="w-4 h-4" />
            </div>
            <div class="space-y-2 text-sm text-slate-700 leading-relaxed font-medium">
              <p v-for="(line, idx) in weeklyStory" :key="idx">
                {{ line }}
              </p>
            </div>
          </div>
        </AppCard>
      </AppSection>

      <!-- Section 2: Core Learning Metrics (四大核心指标) -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AppCard variant="outlined" padding="md" class="bg-white">
          <div class="text-caption text-slate-400 font-bold uppercase">累计专注时长</div>
          <div class="text-2xl font-bold text-slate-900 mt-1">
            {{ totalStudyMinutes }} <span class="text-xs text-slate-400 font-normal">分钟</span>
          </div>
          <div class="text-[11px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
            <Clock class="w-3 h-3" />
            <span>自律学习习惯持续养成</span>
          </div>
        </AppCard>

        <AppCard variant="outlined" padding="md" class="bg-white">
          <div class="text-caption text-slate-400 font-bold uppercase">主线关卡通关</div>
          <div class="text-2xl font-bold text-slate-900 mt-1">
            {{ completedLessonsCount }} <span class="text-xs text-slate-400 font-normal">/ 22 关</span>
          </div>
          <div class="text-[11px] text-blue-600 font-bold mt-2">
            通关进度 {{ Math.round((completedLessonsCount / 22) * 100) }}%
          </div>
        </AppCard>

        <AppCard variant="outlined" padding="md" class="bg-white">
          <div class="text-caption text-slate-400 font-bold uppercase">累计解答手筋</div>
          <div class="text-2xl font-bold text-slate-900 mt-1">
            {{ totalQuestionsCount }} <span class="text-xs text-slate-400 font-normal">道</span>
          </div>
          <div class="text-[11px] text-amber-600 font-bold mt-2">
            含死活训练与关卡实战
          </div>
        </AppCard>

        <AppCard variant="outlined" padding="md" class="bg-white">
          <div class="text-caption text-slate-400 font-bold uppercase">弱点攻克率</div>
          <div class="text-2xl font-bold text-slate-900 mt-1">
            {{ mistakeStats.rate }}%
          </div>
          <div class="text-[11px] text-emerald-600 font-bold mt-2">
            已攻克 {{ mistakeStats.resolved }} / {{ mistakeStats.total }} 处
          </div>
        </AppCard>
      </div>

      <!-- Section 3: Six-Dimension Ability Analysis (六维能力评估与降级展示) -->
      <AppSection title="六维思维能力评估与发展" icon="target" tone="growth">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AppCard
            v-for="(st, dimKey) in abilityProfile.dimensions"
            :key="dimKey"
            variant="outlined"
            padding="md"
            class="bg-white flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-base font-bold text-slate-900">{{ st.name }}</h4>
                <AppBadge
                  :variant="st.confidence === 'high' ? 'success' : st.confidence === 'medium' ? 'brand' : 'neutral'"
                  size="sm"
                >
                  {{ st.confidence === 'high' ? '高置信' : st.confidence === 'medium' ? '参考值' : '积累中' }}
                </AppBadge>
              </div>

              <!-- Case A: Sufficient Samples -> Show Score & Bar -->
              <div v-if="st.score !== null" class="space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-500">评估得分</span>
                  <span class="text-lg font-bold text-slate-900">{{ st.score }} 分</span>
                </div>
                <AppProgress :value="st.score" tone="growth" size="sm" />
                <p class="text-xs text-slate-500 mt-2">
                  基于 {{ st.sampleCount }} 次实战与手筋作答表现评估得出
                </p>
              </div>

              <!-- Case B: Insufficient Samples -> Honest Degradation -->
              <div v-else class="py-4 text-center space-y-1">
                <div class="text-sm font-bold text-slate-400">正在积累样本</div>
                <p class="text-xs text-slate-400">
                  {{ dimKey === 'language' ? '当前围棋阶段暂无语言测评数据' : `已累计 ${st.sampleCount}/5 次练习，暂不展示估分` }}
                </p>
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>状态：{{ st.trend === 'up' ? '稳步提升 ↑' : st.trend === 'down' ? '建议强化 ↓' : '平稳发展' }}</span>
              <span v-if="st.lastUpdatedAt">更新于 {{ new Date(st.lastUpdatedAt).toLocaleDateString() }}</span>
            </div>
          </AppCard>
        </div>
      </AppSection>

      <!-- Section 4: Weakness & Mistakes Evidence (薄弱点与错题证据) -->
      <AppSection title="近期待消灭弱点与错题" icon="sparkle" tone="challenge">
        <AppCard v-if="(profile.mistakeRecords?.length || 0) === 0" variant="outlined" padding="lg" class="bg-white">
          <AppEmptyState
            variant="empty"
            title="当前没有未消灭的错题"
            description="学员在做题与对弈中表现非常专注，状态极佳！"
          />
        </AppCard>

        <div v-else class="space-y-3">
          <AppCard
            v-for="m in (profile.mistakeRecords || []).slice(0, 3)"
            :key="m.id"
            variant="outlined"
            padding="md"
            class="bg-white"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-slate-900">{{ m.topic || '死活手筋' }}</span>
                  <AppBadge :variant="m.resolved ? 'success' : 'danger'" size="sm">
                    {{ m.resolved ? '已攻克' : '待复习' }}
                  </AppBadge>
                </div>
                <p class="text-xs text-slate-500">{{ m.questionPrompt }}</p>
                <div class="text-xs text-slate-400 pt-1">
                  误选：<span class="text-rose-500 font-bold">{{ m.userAnswer }}</span> ·
                  正解：<span class="text-emerald-600 font-bold">{{ m.correctAnswer }}</span>
                </div>
              </div>

              <AppButton
                v-if="!m.resolved"
                variant="brandSoft"
                size="sm"
                @click="router.push('/mistakes')"
              >
                去错题本攻克
              </AppButton>
            </div>
          </AppCard>
        </div>
      </AppSection>
    </div>
  </div>
</template>


