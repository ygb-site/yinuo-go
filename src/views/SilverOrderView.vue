<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSilverStore, SILVER_DENOMINATIONS } from '../stores/useSilverStore';
import { showAlert, showConfirm } from '../utils/alert';
import type {
  RankingPeriod,
  OrderType,
  FamilyOrder,
  FamilyMember,
  SilverDenominationValue
} from '../types/silver';
import SilverNoteCard from '../components/silver/SilverNoteCard.vue';
import IssueOrderModal from '../components/silver/IssueOrderModal.vue';
import OrderFormModal from '../components/silver/OrderFormModal.vue';
import MemberModal from '../components/silver/MemberModal.vue';
import CustomNoteModal from '../components/silver/CustomNoteModal.vue';
import PrintNotesModal from '../components/silver/PrintNotesModal.vue';
import {
  Coins,
  Trophy,
  BookOpen,
  AlertTriangle,
  Sparkles,
  Plus,
  Stamp,
  UserPlus,
  Trash2,
  Edit2,
  Search,
  History,
  RotateCcw,
  Palette,
  Printer
} from 'lucide-vue-next';

const silverStore = useSilverStore();

// 标签页切换
type ActiveTab = 'bank' | 'rules' | 'ranking' | 'ledger';
const activeTab = ref<ActiveTab>('bank');

// 弹窗状态
const showIssueModal = ref(false);
const issueDefaultType = ref<OrderType>('reward');
const issueTargetMemberId = ref<string>('');
const issueTargetOrder = ref<FamilyOrder | null>(null);

const showOrderFormModal = ref(false);
const editingOrder = ref<FamilyOrder | null>(null);
const orderFormDefaultType = ref<OrderType>('reward');

const showMemberModal = ref(false);
const editingMember = ref<FamilyMember | null>(null);
// 专属银票定制与打印弹窗
const showCustomNoteModal = ref(false);
const customNoteTargetMember = ref<FamilyMember | null>(null);

const showPrintModal = ref(false);
const printTargetMember = ref<FamilyMember | null>(null);

// 展柜当前选定的成员（默认孩子诺宝）
const showcaseMemberId = ref<string>('m_nuobao');
const showcaseMember = computed(() => {
  if (!showcaseMemberId.value) return null;
  return silverStore.members.find(m => m.id === showcaseMemberId.value) || null;
});

function openCustomNoteModal(member?: FamilyMember | null) {
  customNoteTargetMember.value = member || showcaseMember.value || silverStore.selectedMember || silverStore.members[0] || null;
  showCustomNoteModal.value = true;
}

function openPrintModal(member?: FamilyMember | null) {
  printTargetMember.value = member || showcaseMember.value || silverStore.selectedMember || silverStore.members[0] || null;
  showPrintModal.value = true;
}


// 榜单周期切换
const rankingPeriod = computed({
  get: () => silverStore.currentRankingPeriod,
  set: (p: RankingPeriod) => silverStore.setRankingPeriod(p)
});

// 令库筛选
const orderTabType = ref<OrderType | 'all'>('all');
const orderCategoryFilter = ref<string>('all');
const orderSearchText = ref<string>('');

// 流水账簿筛选
const ledgerMemberFilter = ref<string>('all');

// 银票面额鉴赏卡选定
const inspectedDenom = ref<SilverDenominationValue>(10);

// 打开颁令弹窗
function openIssueModal(type: OrderType = 'reward', memberId?: string, order?: FamilyOrder) {
  issueDefaultType.value = type;
  issueTargetMemberId.value = memberId || silverStore.selectedMemberId;
  issueTargetOrder.value = order || null;
  showIssueModal.value = true;
}

// 打开添加/编辑令弹窗
function openOrderModal(order?: FamilyOrder, defaultType: OrderType = 'reward') {
  editingOrder.value = order || null;
  orderFormDefaultType.value = defaultType;
  showOrderFormModal.value = true;
}

// 打开添加/编辑成员弹窗
function openMemberModal(member?: FamilyMember) {
  editingMember.value = member || null;
  showMemberModal.value = true;
}

// 快速执行已有令
function quickExecuteOrder(order: FamilyOrder) {
  openIssueModal(order.type, silverStore.selectedMemberId, order);
}

// 过滤令列表
const filteredOrders = computed(() => {
  return silverStore.orders.filter(o => {
    if (orderTabType.value !== 'all' && o.type !== orderTabType.value) return false;
    if (orderCategoryFilter.value !== 'all' && o.category !== orderCategoryFilter.value) return false;
    if (orderSearchText.value.trim()) {
      const q = orderSearchText.value.trim().toLowerCase();
      return o.title.toLowerCase().includes(q) || (o.description || '').toLowerCase().includes(q);
    }
    return true;
  });
});

// 过滤流水列表
const filteredTransactions = computed(() => {
  return silverStore.transactions.filter(t => {
    if (ledgerMemberFilter.value !== 'all' && t.memberId !== ledgerMemberFilter.value) return false;
    return true;
  });
});

// 当前周期的榜单数据
const currentRankings = computed(() => {
  return silverStore.getRankingsByPeriod(rankingPeriod.value);
});

// 榜单周期名称映射
const periodLabels: Record<RankingPeriod, string> = {
  day: '今日日榜',
  week: '本周周榜',
  month: '本月月榜',
  year: '本年年榜',
  total: '总库功勋榜'
};

// 重置确认
async function handleResetDefault() {
  const confirmed = await showConfirm({
    title: '恢复默认数据',
    message: '确认恢复默认演示数据吗？将重置全家成员、赏罚令及演示流水账簿。',
    confirmText: '确认恢复',
    cancelText: '再想想'
  });
  if (confirmed) {
    silverStore.resetToDefault();
    await showAlert({
      title: '已重置',
      message: '已成功恢复为初始示范数据。',
      type: 'info'
    });
  }
}

// 格式化时间
function formatTime(isoStr: string) {
  const d = new Date(isoStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const pad = (n: number) => (n < 10 ? '0' + n : n);

  const month = d.getMonth() + 1;
  const date = d.getDate();
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  if (isToday) {
    return `今日 ${hours}:${minutes}`;
  }
  return `${month}月${date}日 ${hours}:${minutes}`;
}
</script>

<template>
  <div class="min-h-screen bg-[#F7F2E6] text-[#4A3319] pb-24 lg:pb-12">
    <!-- 顶部古风殿堂大横幅 -->
    <header class="relative overflow-hidden bg-gradient-to-r from-[#503117] via-[#6D451F] to-[#462810] text-[#FFF6E3] shadow-lg border-b-4 border-[#C79C5E]">
      <!-- 祥云与木纹印花背景 -->
      <div
        class="absolute inset-0 opacity-15 bg-repeat"
        style="background-image: radial-gradient(#F7E0B5 1.5px, transparent 0); background-size: 16px 16px;"
      />

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <!-- 钱庄与令名门匾 -->
          <div class="flex items-center gap-3.5">
            <div class="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-[#43230A] shadow-md border-2 border-[#FFE8B8] shrink-0">
              <Stamp class="w-8 h-8" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 text-[10px] font-sans font-black bg-amber-500/30 text-amber-200 border border-amber-400/40 rounded">
                  景区银票制 · 赏罚公约
                </span>
                <span class="text-xs text-amber-200/80 font-serif tracking-widest">齐家治要</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-serif font-black tracking-wider text-amber-100 flex items-center gap-2 mt-0.5">
                <span>家庭赏罚令 · 银票钱庄</span>
              </h1>
              <p class="text-xs sm:text-sm text-amber-200/90 font-serif mt-0.5">
                「赏善励勤 · 规过立诫 · 见票即兑 · 令行禁止」
              </p>
            </div>
          </div>

          <!-- 全家总库藏与快速出票按钮 -->
          <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <!-- 银票总库余额金匣 -->
            <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/25 border border-amber-400/30 backdrop-blur-xs">
              <div class="text-amber-400">
                <Coins class="w-6 h-6" />
              </div>
              <div>
                <div class="text-[10px] text-amber-200/80 font-serif">全家银票总存量</div>
                <div class="text-xl font-serif font-black text-amber-300">
                  {{ silverStore.totalFamilyBalance }} <span class="text-xs font-normal text-amber-200">两</span>
                </div>
              </div>
            </div>

            <!-- 快捷执行主按钮 -->
            <button
              type="button"
              class="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-serif font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              @click="openIssueModal('reward')"
            >
              <Sparkles class="w-4 h-4" />
              <span>【赏】颁发奖赏令</span>
            </button>

            <button
              type="button"
              class="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-600 hover:to-rose-700 text-white font-serif font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              @click="openIssueModal('penalty')"
            >
              <AlertTriangle class="w-4 h-4" />
              <span>【罚】奉行规诫令</span>
            </button>

            <!-- 数据演示重置 -->
            <button
              type="button"
              title="重置为默认演示数据"
              class="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 text-xs transition-colors cursor-pointer"
              @click="handleResetDefault"
            >
              <RotateCcw class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- 页面主模块二级导航 Tab -->
        <nav class="mt-6 flex flex-wrap gap-2 pt-2 border-t border-amber-400/20">
          <button
            type="button"
            class="px-4 py-2 rounded-t-xl font-serif font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 border-b-2"
            :class="
              activeTab === 'bank'
                ? 'bg-[#FAF5E8] text-[#5C3F1B] border-amber-500 shadow-sm'
                : 'text-amber-200/80 hover:text-white border-transparent hover:bg-white/5'
            "
            @click="activeTab = 'bank'"
          >
            <Coins class="w-4 h-4 text-amber-600" />
            <span>🪙 银票大堂 · 道具陈列</span>
          </button>

          <button
            type="button"
            class="px-4 py-2 rounded-t-xl font-serif font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 border-b-2"
            :class="
              activeTab === 'rules'
                ? 'bg-[#FAF5E8] text-[#5C3F1B] border-amber-500 shadow-sm'
                : 'text-amber-200/80 hover:text-white border-transparent hover:bg-white/5'
            "
            @click="activeTab = 'rules'"
          >
            <BookOpen class="w-4 h-4 text-amber-600" />
            <span>📜 家庭令库 · 赏罚公约</span>
          </button>

          <button
            type="button"
            class="px-4 py-2 rounded-t-xl font-serif font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 border-b-2"
            :class="
              activeTab === 'ranking'
                ? 'bg-[#FAF5E8] text-[#5C3F1B] border-amber-500 shadow-sm'
                : 'text-amber-200/80 hover:text-white border-transparent hover:bg-white/5'
            "
            @click="activeTab = 'ranking'"
          >
            <Trophy class="w-4 h-4 text-amber-600" />
            <span>🏆 金榜题名 · 日周月年</span>
          </button>

          <button
            type="button"
            class="px-4 py-2 rounded-t-xl font-serif font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 border-b-2"
            :class="
              activeTab === 'ledger'
                ? 'bg-[#FAF5E8] text-[#5C3F1B] border-amber-500 shadow-sm'
                : 'text-amber-200/80 hover:text-white border-transparent hover:bg-white/5'
            "
            @click="activeTab = 'ledger'"
          >
            <History class="w-4 h-4 text-amber-600" />
            <span>📖 流水账簿 · 查验追溯</span>
          </button>
        </nav>
      </div>
    </header>

    <!-- 主体区域内容 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <!-- ═════════════════════════════════════════════════════════════════ -->
      <!-- TAB 1: 银票大堂 & 道具陈列（1两、5两、10两、50两、100两实体票样 + 成员钱庄） -->
      <!-- ═════════════════════════════════════════════════════════════════ -->
      <section v-if="activeTab === 'bank'" class="space-y-6">
        <!-- 景区五色银票道具珍品展柜（支持全家每个人定制专属银票） -->
        <div class="bg-gradient-to-b from-[#FFFDF8] to-[#FAF5E8] rounded-2xl p-5 border-2 border-[#D9C6A3] shadow-md">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 border-b border-[#E3D3B5] pb-3">
            <div>
              <h2 class="text-lg font-serif font-bold text-[#4A3319] flex items-center gap-2">
                <Stamp class="w-5 h-5 text-amber-700" />
                <span v-if="showcaseMember">【{{ showcaseMember.name }}】专属古风银票 · 五品面额道具展柜</span>
                <span v-else>景区仿真古风银票 · 五品面额道具展柜</span>
              </h2>
              <p class="text-xs text-[#7A5A30] font-serif mt-0.5">
                <span v-if="showcaseMember">
                  当前展示【{{ showcaseMember.name }}】专属银票（堂号：{{ showcaseMember.customNote?.bankName || showcaseMember.name + '宝库' }} · 官印：{{ showcaseMember.customNote?.sealText || showcaseMember.name }}之印）。全家皆可定制名字、堂号与誓言！
                </span>
                <span v-else>
                  遵古法宣纸木版拓印，涵盖【壹两、伍两、拾两、伍拾两、壹百两】五种面额。可点击鉴赏或用作快速赏罚！
                </span>
              </p>
            </div>

            <!-- 快捷按钮：定制专属银票 & 打印纸币 -->
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="text-xs font-serif text-amber-900 bg-amber-200/90 hover:bg-amber-300/90 px-3 py-1.5 rounded-xl border border-amber-300 flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                @click="openCustomNoteModal(showcaseMember)"
              >
                <Palette class="w-3.5 h-3.5 text-amber-800" />
                <span>{{ showcaseMember ? '定制【' + showcaseMember.name + '】专属银票' : '自定义银票' }}</span>
              </button>
              <button
                type="button"
                class="text-xs font-serif text-[#6D4C1D] bg-[#EFE5CE] hover:bg-[#E6DAC0] px-3 py-1.5 rounded-xl border border-[#D9C6A3] flex items-center gap-1.5 cursor-pointer transition-colors"
                @click="openPrintModal(showcaseMember)"
              >
                <Printer class="w-3.5 h-3.5 text-amber-800" />
                <span>🖨️ 排版打印纸币</span>
              </button>
            </div>
          </div>

          <!-- 展柜归属人切换胶囊栏 -->
          <div class="flex items-center gap-2 mb-4 p-1.5 bg-[#EFE5CE]/60 rounded-xl border border-[#D9C6A3] overflow-x-auto">
            <span class="text-[11px] font-serif font-bold text-[#6D4C1D] px-2 whitespace-nowrap">
              展柜票样切换：
            </span>
            <button
              v-for="m in silverStore.members"
              :key="m.id"
              type="button"
              class="px-3 py-1 rounded-lg text-xs font-serif flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer"
              :class="
                showcaseMemberId === m.id
                  ? 'bg-amber-700 text-white font-bold shadow-xs'
                  : 'bg-white/80 text-[#5C3F1B] hover:bg-amber-100/70 border border-[#D9C6A3]'
              "
              @click="showcaseMemberId = m.id"
            >
              <span>{{ m.avatar }}</span>
              <span>{{ m.name }}的专属票样</span>
            </button>
            <button
              type="button"
              class="px-3 py-1 rounded-lg text-xs font-serif flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer"
              :class="
                showcaseMemberId === ''
                  ? 'bg-amber-700 text-white font-bold shadow-xs'
                  : 'bg-white/80 text-[#5C3F1B] hover:bg-amber-100/70 border border-[#D9C6A3]'
              "
              @click="showcaseMemberId = ''"
            >
              <span>🏛️</span>
              <span>通用官造票样</span>
            </button>
          </div>

          <!-- 当前已选面额轻量操作条 -->
          <div class="mb-3.5 p-2.5 bg-amber-50/80 rounded-xl border border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs font-serif">
            <div class="flex items-center gap-2">
              <span class="text-amber-900 font-bold">
                当前检视：【{{ SILVER_DENOMINATIONS[inspectedDenom]?.label }}银票】（折银 {{ inspectedDenom }} 两）
              </span>
              <span class="text-[11px] text-[#8C6D46]">
                赏格：{{ SILVER_DENOMINATIONS[inspectedDenom]?.badge }} · 寓意：「{{ showcaseMember?.customNote?.motto || SILVER_DENOMINATIONS[inspectedDenom]?.poem }}」
              </span>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="px-3 py-1 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                @click="openIssueModal('reward', showcaseMember?.id || undefined, undefined)"
              >
                <Sparkles class="w-3.5 h-3.5" />
                <span>以此 {{ inspectedDenom }} 两行赏</span>
              </button>
              <button
                type="button"
                class="px-3 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                @click="openIssueModal('penalty', showcaseMember?.id || undefined, undefined)"
              >
                <AlertTriangle class="w-3.5 h-3.5 text-rose-700" />
                <span>扣罚 {{ inspectedDenom }} 两</span>
              </button>
            </div>
          </div>

          <!-- 5 张银票道具横向/网格陈列 (清晰宽敞，零折行) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4">
            <div
              v-for="v in ([1, 5, 10, 50, 100] as SilverDenominationValue[])"
              :key="v"
              class="flex flex-col items-center justify-between"
            >
              <SilverNoteCard
                :value="v"
                :member-name="showcaseMember?.name"
                :member-role="showcaseMember?.role"
                :member-avatar="showcaseMember?.avatar"
                :custom-note="showcaseMember?.customNote"
                size="md"
                interactive
                :selected="inspectedDenom === v"
                @click="inspectedDenom = v"
              />
              <button
                type="button"
                class="mt-2 text-xs font-serif transition-colors cursor-pointer flex items-center gap-1"
                :class="inspectedDenom === v ? 'text-amber-900 font-bold underline' : 'text-[#6D4C1D] hover:text-amber-800'"
                @click="inspectedDenom = v"
              >
                <span>{{ inspectedDenom === v ? '● 当前选定' : '点击选定' }}</span>
                <span class="text-[10px] opacity-75">({{ v }}两)</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 家庭各成员银票钱包金库卡片 -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-serif font-bold text-[#4A3319] flex items-center gap-2">
              <Coins class="w-5 h-5 text-amber-700" />
              <span>家庭各席银票私房金库（单账号全景）</span>
            </h2>
            <button
              type="button"
              class="text-xs font-serif text-amber-800 hover:text-amber-900 bg-amber-100/80 hover:bg-amber-200/80 px-3 py-1.5 rounded-xl border border-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
              @click="openMemberModal()"
            >
              <UserPlus class="w-3.5 h-3.5" />
              <span>延请新家庭成员</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              v-for="m in silverStore.members"
              :key="m.id"
              class="relative rounded-2xl bg-gradient-to-b from-[#FFFDF8] to-[#FAF5E8] border-2 border-[#D9C6A3] p-5 shadow-md flex flex-col justify-between transition-all hover:shadow-lg"
              :class="silverStore.selectedMemberId === m.id ? 'ring-2 ring-amber-600' : ''"
            >
              <!-- 顶部成员信息 -->
              <div>
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-3">
                    <span class="text-4xl p-2 rounded-2xl bg-[#F5EEDD] border border-[#D9C6A3] shadow-inner">
                      {{ m.avatar }}
                    </span>
                    <div>
                      <div class="flex items-center gap-1.5">
                        <h3 class="font-serif font-bold text-base text-[#4A3319]">{{ m.name }}</h3>
                        <span class="px-2 py-0.2 text-[10px] font-sans font-bold bg-[#EFE5CE] text-[#6D4C1D] rounded-full">
                          {{ m.role }}
                        </span>
                      </div>
                      <p class="text-xs text-[#8C6D46] font-serif mt-0.5">
                        {{ m.title || '家庭自律使者' }}
                      </p>
                      <div class="mt-1 flex items-center gap-1 text-[10px] text-amber-800 font-serif">
                        <span class="px-1.5 py-0.2 rounded bg-amber-100 border border-amber-200">
                          票号：{{ m.customNote?.bankName || m.name + '宝库' }}
                        </span>
                        <span class="text-[#8C6D46]">印：{{ m.customNote?.sealText || m.name }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-1">
                    <button
                      type="button"
                      class="p-1.5 text-amber-800 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                      title="定制专属银票"
                      @click="openCustomNoteModal(m)"
                    >
                      <Palette class="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      class="p-1.5 text-[#8C6D46] hover:text-[#4A3319] hover:bg-[#EAE0CA] rounded-lg transition-colors cursor-pointer"
                      title="修改成员资料"
                      @click="openMemberModal(m)"
                    >
                      <Edit2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <!-- 银票存量大字 -->
                <div class="my-4 p-3 bg-[#F4ECDC]/70 rounded-xl border border-[#E0D2BA] flex items-baseline justify-between">
                  <span class="text-xs font-serif text-[#7A5A30]">当前银票储备：</span>
                  <div class="text-3xl font-serif font-black text-amber-900 tracking-tight">
                    {{ m.balance }} <span class="text-sm font-normal text-[#7A5A30]">两</span>
                  </div>
                </div>

                <!-- 智能面额折算票据明细 (100两、50两、10两、5两、1两 各几张) -->
                <div>
                  <div class="text-[11px] font-serif text-[#7A5A30] mb-1.5 flex items-center justify-between">
                    <span>道具票券折算（金匣抽屉）：</span>
                    <span class="text-[10px] text-[#8C6D46]">按景区规制兑付</span>
                  </div>
                  <div class="flex flex-wrap gap-1.5">
                    <div
                      v-for="d in silverStore.getDenominationBreakdown(m.balance)"
                      :key="d.value"
                      class="px-2 py-1 rounded-lg border text-[11px] font-mono flex items-center gap-1"
                      :class="
                        d.count > 0
                          ? 'bg-white text-[#4A3319] border-amber-300 shadow-2xs font-bold'
                          : 'bg-[#EAE0CA]/40 text-[#9C8263] border-transparent opacity-60'
                      "
                    >
                      <span>{{ SILVER_DENOMINATIONS[d.value].label }}:</span>
                      <span :class="d.count > 0 ? 'text-amber-800' : ''">{{ d.count }}张</span>
                    </div>
                  </div>
                </div>

                <!-- 累计功过对比 -->
                <div class="mt-4 pt-3 border-t border-[#E3D3B5] grid grid-cols-2 gap-2 text-center text-xs">
                  <div class="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                    <span class="text-[10px] text-emerald-700 font-serif">累计受赏</span>
                    <div class="font-bold text-emerald-800">+{{ m.totalReward }}两</div>
                  </div>
                  <div class="p-1.5 rounded-lg bg-rose-50 border border-rose-200">
                    <span class="text-[10px] text-rose-700 font-serif">累计受罚</span>
                    <div class="font-bold text-rose-800">-{{ m.totalPenalty }}两</div>
                  </div>
                </div>
              </div>

              <!-- 底部专属操作 -->
              <div class="mt-4 pt-3 border-t border-[#E3D3B5] flex items-center gap-2">
                <button
                  type="button"
                  class="flex-1 py-1.5 px-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-serif font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  @click="openIssueModal('reward', m.id)"
                >
                  <Sparkles class="w-3.5 h-3.5" />
                  <span>赐赏</span>
                </button>
                <button
                  type="button"
                  class="flex-1 py-1.5 px-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-serif font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  @click="openIssueModal('penalty', m.id)"
                >
                  <AlertTriangle class="w-3.5 h-3.5" />
                  <span>罚奉</span>
                </button>
                <button
                  type="button"
                  class="py-1.5 px-2.5 rounded-lg border border-[#D9C6A3] bg-white hover:bg-[#FAF5E8] text-[#6D4C1D] text-xs font-serif cursor-pointer"
                  @click="
                    silverStore.selectMember(m.id);
                    ledgerMemberFilter = m.id;
                    activeTab = 'ledger';
                  "
                >
                  看流水
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═════════════════════════════════════════════════════════════════ -->
      <!-- TAB 2: 家庭令库 · 赏罚公约（为什么不叫任务？因为有赏亦有罚，立家规） -->
      <!-- ═════════════════════════════════════════════════════════════════ -->
      <section v-if="activeTab === 'rules'" class="space-y-5">
        <!-- 命名解读与公约文化导语 -->
        <div class="p-4 rounded-2xl bg-[#FAF5E8] border-2 border-[#D9C6A3] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-100 border border-amber-400 text-amber-800 flex items-center justify-center shrink-0">
              <BookOpen class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-serif font-bold text-sm sm:text-base text-[#4A3319]">
                为何定名为【家庭令 · 赏罚公约】？
              </h3>
              <p class="text-xs text-[#7A5A30] font-serif mt-0.5">
                任务多偏向单方派工，而家风在于「有赏有罚、亲子平等、立信践诺」。好习惯赐银票为【奖赏令】，违规逾矩削银票为【规诫令】。
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-serif font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
              @click="openOrderModal(undefined, 'reward')"
            >
              <Plus class="w-4 h-4" />
              <span>新拟奖赏令（+两）</span>
            </button>
            <button
              type="button"
              class="px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-serif font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
              @click="openOrderModal(undefined, 'penalty')"
            >
              <Plus class="w-4 h-4" />
              <span>新立规诫令（-两）</span>
            </button>
          </div>
        </div>

        <!-- 过滤与搜索栏 -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-[#FAF5E8] rounded-2xl border border-[#D9C6A3]">
          <!-- 赏/罚 类别过滤 -->
          <div class="flex items-center gap-1 p-1 bg-[#EFE5CE] rounded-xl">
            <button
              type="button"
              class="px-3 py-1 rounded-lg text-xs font-serif transition-all cursor-pointer"
              :class="orderTabType === 'all' ? 'bg-amber-700 text-white font-bold' : 'text-[#6D4C1D] hover:bg-[#E5D8BE]'"
              @click="orderTabType = 'all'"
            >
              全部令项
            </button>
            <button
              type="button"
              class="px-3 py-1 rounded-lg text-xs font-serif transition-all cursor-pointer flex items-center gap-1"
              :class="orderTabType === 'reward' ? 'bg-emerald-700 text-white font-bold' : 'text-[#6D4C1D] hover:bg-[#E5D8BE]'"
              @click="orderTabType = 'reward'"
            >
              <Sparkles class="w-3.5 h-3.5" />
              <span>【赏】奖赏令</span>
            </button>
            <button
              type="button"
              class="px-3 py-1 rounded-lg text-xs font-serif transition-all cursor-pointer flex items-center gap-1"
              :class="orderTabType === 'penalty' ? 'bg-rose-700 text-white font-bold' : 'text-[#6D4C1D] hover:bg-[#E5D8BE]'"
              @click="orderTabType = 'penalty'"
            >
              <AlertTriangle class="w-3.5 h-3.5" />
              <span>【罚】规诫令</span>
            </button>
          </div>

          <!-- 搜索输入框 -->
          <div class="relative min-w-[220px]">
            <Search class="w-4 h-4 text-[#8C6D46] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              v-model="orderSearchText"
              type="text"
              placeholder="搜索令名、习惯或规矩..."
              class="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#D9C6A3] bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#4A3319]"
            />
          </div>
        </div>

        <!-- 令项卡片网格 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <div
            v-for="ord in filteredOrders"
            :key="ord.id"
            class="group relative rounded-2xl bg-gradient-to-b from-[#FFFDF8] to-[#FAF5E8] border-2 p-4 shadow-sm flex flex-col justify-between transition-all hover:shadow-md hover:-translate-y-0.5"
            :class="ord.type === 'reward' ? 'border-[#C8D9B8]' : 'border-[#E8C2B5]'"
          >
            <div>
              <!-- 顶部标签与类型 -->
              <div class="flex items-center justify-between gap-2 mb-2">
                <div class="flex items-center gap-1.5">
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-serif font-bold flex items-center gap-1"
                    :class="
                      ord.type === 'reward'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    "
                  >
                    <Sparkles v-if="ord.type === 'reward'" class="w-3 h-3" />
                    <AlertTriangle v-else class="w-3 h-3" />
                    <span>{{ ord.type === 'reward' ? '奖赏令' : '规诫令' }}</span>
                  </span>
                  <span class="text-[10px] text-[#8C6D46] font-serif">
                    {{ ord.category === 'study' ? '学习功课' : ord.category === 'habit' ? '起居自律' : ord.category === 'chore' ? '家务劳动' : '言行修养' }}
                  </span>
                </div>

                <!-- 银票面额印标 -->
                <div
                  class="font-serif font-black text-sm px-2 py-0.5 rounded-lg border flex items-center gap-0.5"
                  :class="
                    ord.type === 'reward'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-rose-50 text-rose-900 border-rose-300'
                  "
                >
                  <span>{{ ord.type === 'reward' ? '+' : '-' }}{{ ord.amount }}</span>
                  <span class="text-[10px] font-normal">两</span>
                </div>
              </div>

              <!-- 令名与说明 -->
              <h4 class="font-serif font-bold text-sm text-[#4A3319] leading-snug mb-1">
                {{ ord.title }}
              </h4>
              <p class="text-xs text-[#7A5A30] font-serif line-clamp-2">
                {{ ord.description || '遵令执行，见票行赏惩。' }}
              </p>
            </div>

            <!-- 底部操作按钮 -->
            <div class="mt-4 pt-3 border-t border-[#E3D3B5] flex items-center justify-between">
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="p-1 text-[#8C6D46] hover:text-[#4A3319] hover:bg-[#EAE0CA] rounded transition-colors cursor-pointer"
                  title="修改此令"
                  @click="openOrderModal(ord)"
                >
                  <Edit2 class="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  class="p-1 text-[#8C6D46] hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                  title="废止此令"
                  @click="silverStore.deleteOrder(ord.id)"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                class="px-3 py-1.5 rounded-xl font-serif font-bold text-xs shadow-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                :class="
                  ord.type === 'reward'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-700 hover:bg-rose-800 text-white'
                "
                @click="quickExecuteOrder(ord)"
              >
                <Stamp class="w-3.5 h-3.5" />
                <span>立即奉行出票</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ═════════════════════════════════════════════════════════════════ -->
      <!-- TAB 3: 金榜题名（日·周·月·年·总库榜） -->
      <!-- ═════════════════════════════════════════════════════════════════ -->
      <section v-if="activeTab === 'ranking'" class="space-y-5">
        <!-- 榜单周期切换栏（日、周、月、年、总） -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-[#FAF5E8] rounded-2xl border-2 border-[#D9C6A3] shadow-xs">
          <div class="flex items-center gap-2">
            <div class="p-2 rounded-xl bg-amber-100 border border-amber-300 text-amber-800">
              <Trophy class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-serif font-bold text-base text-[#4A3319]">
                家庭银票荣誉金榜（{{ periodLabels[rankingPeriod] }}）
              </h3>
              <p class="text-[11px] text-[#7A5A30] font-serif">
                以银票净增益与立行公约频次为律，论功行赏！
              </p>
            </div>
          </div>

          <!-- 周期按钮群 -->
          <div class="flex items-center gap-1 p-1 bg-[#EFE5CE] rounded-xl border border-[#D9C6A3]">
            <button
              v-for="p in (['day', 'week', 'month', 'year', 'total'] as RankingPeriod[])"
              :key="p"
              type="button"
              class="px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer"
              :class="
                rankingPeriod === p
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-[#6D4C1D] hover:bg-[#E5D8BE]'
              "
              @click="rankingPeriod = p"
            >
              {{ p === 'day' ? '今日榜' : p === 'week' ? '本周榜' : p === 'month' ? '本月榜' : p === 'year' ? '本年榜' : '总库榜' }}
            </button>
          </div>
        </div>

        <!-- 状元、榜眼、探花 前三甲颁奖台 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div
            v-for="(stat, idx) in currentRankings.slice(0, 3)"
            :key="stat.memberId"
            class="relative rounded-2xl border-2 p-5 flex flex-col items-center justify-between text-center transition-all shadow-md"
            :class="[
              idx === 0
                ? 'bg-gradient-to-b from-[#FFF9E6] via-[#FFF5D6] to-[#FAF0C8] border-[#E5A93C] md:-translate-y-2 md:shadow-xl ring-2 ring-amber-400'
                : '',
              idx === 1
                ? 'bg-gradient-to-b from-[#F5F7FA] to-[#EAEFF5] border-[#A8B4C4]'
                : '',
              idx === 2
                ? 'bg-gradient-to-b from-[#FFF6F0] to-[#FAECE2] border-[#D9A888]'
                : ''
            ]"
          >
            <!-- 冠亚季军荣誉冠冕 -->
            <div
              class="absolute -top-3.5 px-3 py-0.5 rounded-full text-xs font-serif font-black shadow-sm border flex items-center gap-1"
              :class="[
                idx === 0 ? 'bg-amber-500 text-amber-950 border-amber-300' : '',
                idx === 1 ? 'bg-slate-400 text-white border-slate-300' : '',
                idx === 2 ? 'bg-amber-800 text-amber-100 border-amber-600' : ''
              ]"
            >
              <span>{{ idx === 0 ? '👑 状元魁首' : idx === 1 ? '🥈 榜眼及第' : '🥉 探花荣登' }}</span>
            </div>

            <!-- 头像与称呼 -->
            <div class="mt-3 flex flex-col items-center">
              <span class="text-5xl my-1 drop-shadow-sm">{{ stat.avatar }}</span>
              <h4 class="font-serif font-black text-lg text-[#4A3319]">{{ stat.name }}</h4>
              <span class="text-xs text-[#7A5A30] font-serif">{{ stat.role }}</span>
            </div>

            <!-- 净增银票数 -->
            <div class="my-4 py-2 px-4 rounded-xl bg-white/70 border border-black/5 w-full">
              <div class="text-[11px] text-[#7A5A30] font-serif">
                {{ rankingPeriod === 'total' ? '当前银票藏量' : '本期净得银票' }}
              </div>
              <div
                class="text-3xl font-serif font-black tracking-tight"
                :class="stat.netScore >= 0 ? 'text-amber-800' : 'text-rose-700'"
              >
                {{ stat.netScore >= 0 ? '+' : '' }}{{ stat.netScore }}
                <span class="text-xs font-normal text-[#7A5A30]">两</span>
              </div>
            </div>

            <!-- 赏罚明细指标拆解 -->
            <div class="grid grid-cols-2 gap-2 w-full text-xs">
              <div class="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                <div class="text-[10px] text-emerald-600 font-serif">奖赏所获</div>
                <div class="font-bold">+{{ stat.periodReward }}两</div>
              </div>
              <div class="p-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200">
                <div class="text-[10px] text-rose-600 font-serif">规诫扣除</div>
                <div class="font-bold">-{{ stat.periodPenalty }}两</div>
              </div>
            </div>

            <!-- 奉令次数 -->
            <div class="mt-3 text-[11px] text-[#8C6D46] font-serif">
              共履令 <b class="text-[#4A3319]">{{ stat.actionCount }}</b> 次
            </div>
          </div>
        </div>

        <!-- 详细排行列表 -->
        <div class="bg-[#FAF5E8] rounded-2xl border-2 border-[#D9C6A3] p-4 shadow-sm">
          <h4 class="font-serif font-bold text-sm text-[#4A3319] mb-3">全家排名通览册</h4>
          <div class="space-y-2">
            <div
              v-for="stat in currentRankings"
              :key="stat.memberId"
              class="flex items-center justify-between p-3 rounded-xl bg-white/70 border border-[#E0D2BA] transition-all hover:bg-white"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-7 h-7 rounded-lg flex items-center justify-center font-serif font-black text-sm"
                  :class="
                    stat.rank === 1
                      ? 'bg-amber-500 text-amber-950 shadow-xs'
                      : stat.rank === 2
                      ? 'bg-slate-300 text-slate-800'
                      : stat.rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-[#EAE0CA] text-[#6D4C1D]'
                  "
                >
                  {{ stat.rank }}
                </div>
                <span class="text-2xl">{{ stat.avatar }}</span>
                <div>
                  <div class="text-xs font-bold text-[#4A3319]">{{ stat.name }} ({{ stat.role }})</div>
                  <div class="text-[10px] text-[#8C6D46]">
                    存银: {{ stat.currentBalance }}两 · 履令{{ stat.actionCount }}次
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-4 text-right">
                <div class="hidden sm:block text-xs">
                  <span class="text-emerald-700 font-bold">+{{ stat.periodReward }}两</span>
                  <span class="text-[#8C6D46] mx-1">/</span>
                  <span class="text-rose-700 font-bold">-{{ stat.periodPenalty }}两</span>
                </div>
                <div
                  class="text-base font-serif font-black"
                  :class="stat.netScore >= 0 ? 'text-amber-800' : 'text-rose-700'"
                >
                  {{ stat.netScore >= 0 ? '+' : '' }}{{ stat.netScore }} 两
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═════════════════════════════════════════════════════════════════ -->
      <!-- TAB 4: 钱庄流水账簿（每人独立流水，单账号全家查对） -->
      <!-- ═════════════════════════════════════════════════════════════════ -->
      <section v-if="activeTab === 'ledger'" class="space-y-4">
        <!-- 账簿顶栏 -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-[#FAF5E8] rounded-2xl border-2 border-[#D9C6A3] shadow-xs">
          <div>
            <h3 class="font-serif font-bold text-base text-[#4A3319] flex items-center gap-2">
              <History class="w-5 h-5 text-amber-700" />
              <span>钱庄流水账房（逐笔存底对账）</span>
            </h3>
            <p class="text-xs text-[#7A5A30] font-serif mt-0.5">
              单账号下全家成员每笔赏罚银票明细皆历历在目，见票出账，童叟无欺。
            </p>
          </div>

          <!-- 成员对账筛选器 -->
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <span class="text-xs font-serif text-[#6D4C1D] shrink-0">对账成员:</span>
            <select
              v-model="ledgerMemberFilter"
              class="px-3 py-1.5 text-xs rounded-xl border border-[#D9C6A3] bg-white text-[#4A3319] focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="all">全家汇编总账本</option>
              <option
                v-for="m in silverStore.members"
                :key="m.id"
                :value="m.id"
              >
                {{ m.name }} 的专属金库账本 (当前结存: {{ m.balance }}两)
              </option>
            </select>
          </div>
        </div>

        <!-- 账簿列表 -->
        <div class="bg-[#FAF5E8] rounded-2xl border-2 border-[#D9C6A3] p-4 shadow-sm overflow-hidden">
          <div v-if="filteredTransactions.length === 0" class="py-12 text-center">
            <p class="font-serif text-[#8C6D46] text-sm">暂无此账本收支流水记录</p>
          </div>

          <div v-else class="divide-y divide-[#E3D3B5]">
            <div
              v-for="tx in filteredTransactions"
              :key="tx.id"
              class="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 transition-colors hover:bg-white/50 px-2 rounded-lg"
            >
              <!-- 左侧：图标、令名、原因、时间 -->
              <div class="flex items-start gap-3">
                <div
                  class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 shadow-2xs"
                  :class="
                    tx.type === 'reward'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  "
                >
                  <Sparkles v-if="tx.type === 'reward'" class="w-4 h-4" />
                  <AlertTriangle v-else class="w-4 h-4" />
                </div>

                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-serif font-bold text-xs sm:text-sm text-[#4A3319]">
                      {{ tx.orderTitle }}
                    </span>
                    <span class="px-2 py-0.2 text-[10px] font-sans font-bold rounded-full bg-[#EFE5CE] text-[#6D4C1D]">
                      {{ tx.memberName }}
                    </span>
                    <span
                      class="px-1.5 py-0.2 text-[9px] font-serif rounded"
                      :class="tx.type === 'reward' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'"
                    >
                      {{ tx.type === 'reward' ? '受赏入库' : '罚奉出库' }}
                    </span>
                  </div>

                  <div class="text-xs text-[#7A5A30] font-serif mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span v-if="tx.note" class="italic">「{{ tx.note }}」</span>
                    <span class="text-[10px] text-[#8C6D46]">经手: {{ tx.operator || '当值掌柜' }}</span>
                    <span class="text-[10px] text-[#8C6D46] font-mono">{{ formatTime(tx.timestamp) }}</span>
                  </div>
                </div>
              </div>

              <!-- 右侧：收支变动两数 & 当时结存 & 撤销操作 -->
              <div class="flex items-center gap-3 self-end sm:self-center">
                <div class="text-right">
                  <div
                    class="font-serif font-black text-base"
                    :class="tx.type === 'reward' ? 'text-emerald-700' : 'text-rose-700'"
                  >
                    {{ tx.type === 'reward' ? '+' : '-' }}{{ tx.amount }} 两
                  </div>
                  <div class="text-[10px] text-[#8C6D46] font-mono">
                    结余: {{ tx.balanceAfter }}两
                  </div>
                </div>

                <button
                  type="button"
                  title="撤销此笔流水（回退金额）"
                  class="p-1.5 text-[#8C6D46] hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  @click="silverStore.deleteTransaction(tx.id)"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 弹窗组件挂载 -->
    <IssueOrderModal
      :show="showIssueModal"
      :default-type="issueDefaultType"
      :initial-member-id="issueTargetMemberId"
      :initial-order="issueTargetOrder"
      @close="showIssueModal = false"
    />

    <OrderFormModal
      :show="showOrderFormModal"
      :order="editingOrder"
      :default-type="orderFormDefaultType"
      @close="showOrderFormModal = false"
    />

    <MemberModal
      :show="showMemberModal"
      :member="editingMember"
      @close="showMemberModal = false"
    />

    <CustomNoteModal
      :show="showCustomNoteModal"
      :member="customNoteTargetMember"
      @close="showCustomNoteModal = false"
      @print="(m) => { showCustomNoteModal = false; openPrintModal(m); }"
    />

    <PrintNotesModal
      :show="showPrintModal"
      :member="printTargetMember"
      @close="showPrintModal = false"
    />
  </div>
</template>

<style scoped>
/* 祥云回纹及古风微光动效 */
</style>

