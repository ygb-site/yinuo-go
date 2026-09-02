<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
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
  AppEmptyState,
  AppSelect
} from '../design-system';
import { GRADE_LEVELS, gradeYearLabel, type GradeLevel } from '../types/curriculum';
import {
  EDUCATION_TRACK_OPTIONS,
  RETURN_WINDOW_OPTIONS,
  TRACK_ROLE_OPTIONS,
  TOGETHER_ITEMS,
  hometownShadowIsTight,
  resolveGrowthTracks,
  type EducationTrackId,
  type ReturnWindowId,
  type TogetherItemId,
  type TrackRole
} from '../domain/growth/tracks';
import { buildAbilityProfile } from '../domain/ability/abilityEngine';
import type { AbilityEvent, AbilityDimensionId } from '../domain/ability/types';
import ParentGateScreen from '../components/parent/ParentGateScreen.vue';
import SchoolHomeworkComposer from '../components/parent/SchoolHomeworkComposer.vue';
import SchoolDualTrackPanel from '../components/parent/SchoolDualTrackPanel.vue';
import SchoolSleepSettings from '../components/parent/SchoolSleepSettings.vue';
import { useSchoolStore } from '../stores/useSchoolStore';
import {
  Clock,
  Download,
  Upload,
  Sparkles
} from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();
const schoolStore = useSchoolStore();

onMounted(() => {
  schoolStore.hydrateFromProfile();
});

watch(
  () => userStore.currentProfileId,
  () => {
    schoolStore.hydrateFromProfile();
  }
);

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

const growthTracks = computed(() => resolveGrowthTracks(profile.value));
const togetherDone = computed(() => profile.value.togetherWeek?.done || {
  go: false,
  read: false,
  outdoor: false,
  chore: false
});
const togetherDoneCount = computed(() => Object.values(togetherDone.value).filter(Boolean).length);
const shadowTight = computed(() => hometownShadowIsTight(growthTracks.value, profile.value.gradeLevel));
const gradeOptions = GRADE_LEVELS.map((item) => ({ value: item.id, label: item.name }));
const schoolTrackOptions = EDUCATION_TRACK_OPTIONS.map((item) => ({ value: item.id, label: item.label }));
const hometownTrackOptions = EDUCATION_TRACK_OPTIONS.map((item) => ({ value: item.id, label: `${item.label}（老家）` }));
const returnWindowOptions = RETURN_WINDOW_OPTIONS.map((item) => ({ value: item.id, label: item.label }));
const trackRoleOptions = TRACK_ROLE_OPTIONS.map((item) => ({ value: item.id, label: item.label }));

const onToggleTogether = (id: TogetherItemId) => {
  userStore.toggleTogetherItem(id);
};

const onGradeChange = (value: string) => {
  userStore.updateGrowthTracks({ gradeLevel: value as GradeLevel });
};

const onSchoolTrackChange = (value: string) => {
  userStore.updateGrowthTracks({ schoolTrack: value as EducationTrackId });
};

const onHometownTrackChange = (value: string) => {
  userStore.updateGrowthTracks({ hometownTrack: value as EducationTrackId });
};

const onReturnWindowChange = (value: string) => {
  userStore.updateGrowthTracks({ returnWindow: value as ReturnWindowId });
};

const onTrackRoleChange = (value: string) => {
  userStore.updateGrowthTracks({ trackRole: value as TrackRole });
};

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
    <ParentGateScreen>
    <div class="space-y-8">
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
              {{ gradeYearLabel(profile.gradeLevel) }} · 学校轴 {{ growthTracks.schoolTrack === 'beijing' ? '北京' : '衡水' }} · 老家 {{ growthTracks.hometownTrack === 'beijing' ? '北京' : '衡水' }}
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

      <AppSection title="本周一起做的一件事" icon="sparkles" tone="growth">
        <AppCard variant="outlined" padding="lg" class="bg-white space-y-3">
          <p class="text-sm text-slate-600">
            关系在前，分数在后。完成不算能力分，也不进儿童首页。本周已记下 {{ togetherDoneCount }}/4 件。
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              v-for="item in TOGETHER_ITEMS"
              :key="item.id"
              type="button"
              class="text-left rounded-xl border px-3 py-3 transition"
              :class="togetherDone[item.id] ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'"
              @click="onToggleTogether(item.id)"
            >
              <div class="text-sm font-bold text-slate-900">{{ togetherDone[item.id] ? '已一起做过' : '还未做' }} · {{ item.title }}</div>
              <p class="text-xs text-slate-500 mt-1">{{ item.detail }}</p>
              <AppButton
                v-if="item.route"
                variant="brandSoft"
                size="sm"
                class="mt-2"
                @click.stop="router.push(item.route)"
              >
                去对弈
              </AppButton>
            </button>
          </div>
        </AppCard>
      </AppSection>

      <AppSection title="年级与双轨（只给家长看）" icon="settings" tone="learning">
        <AppCard variant="outlined" padding="lg" class="bg-white space-y-4">
          <p class="text-sm text-slate-600">
            一年级起儿童「今天」里就有一道衡水影子轻练（口算/识字量级），不是预习包，也不堆第二套作业。
            北京课表仍是学校主轴；{{ shadowTight ? '当前已进入收紧窗口，家长端可以开始看同龄熟练度对照。' : '收紧窗口前家长端先盯习惯：独立写完、口算不拖、字写完能认。' }}
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label class="space-y-1 text-xs font-bold text-slate-600">
              年级
              <AppSelect :model-value="profile.gradeLevel || 'g1_t1'" :options="gradeOptions" size="sm" aria-label="年级" @update:model-value="onGradeChange" />
            </label>
            <label class="space-y-1 text-xs font-bold text-slate-600">
              是否已回老家上学
              <AppSelect :model-value="growthTracks.trackRole" :options="trackRoleOptions" size="sm" aria-label="在读位置" @update:model-value="onTrackRoleChange" />
            </label>
            <label class="space-y-1 text-xs font-bold text-slate-600">
              当前学校轴
              <AppSelect :model-value="growthTracks.schoolTrack" :options="schoolTrackOptions" size="sm" aria-label="当前学校轴" @update:model-value="onSchoolTrackChange" />
            </label>
            <label class="space-y-1 text-xs font-bold text-slate-600">
              老家对齐轴
              <AppSelect :model-value="growthTracks.hometownTrack" :options="hometownTrackOptions" size="sm" aria-label="老家对齐轴" @update:model-value="onHometownTrackChange" />
            </label>
            <label class="space-y-1 text-xs font-bold text-slate-600 sm:col-span-2">
              预计回老家窗口
              <AppSelect :model-value="growthTracks.returnWindow" :options="returnWindowOptions" size="sm" aria-label="回老家窗口" @update:model-value="onReturnWindowChange" />
            </label>
          </div>
        </AppCard>
      </AppSection>

      <SchoolSleepSettings />
      <SchoolHomeworkComposer />
      <SchoolDualTrackPanel />

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
    </ParentGateScreen>
  </div>
</template>


