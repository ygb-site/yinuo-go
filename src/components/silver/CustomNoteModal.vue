<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useSilverStore, NOTE_THEME_PRESETS } from '../../stores/useSilverStore';
import type { FamilyMember, MemberNoteCustomization, SilverDenominationValue, SilverThemePreset } from '../../types/silver';
import SilverNoteCard from './SilverNoteCard.vue';
import { showAlert } from '../../utils/alert';
import confetti from 'canvas-confetti';
import { sound } from '../../utils/sound';
import {
  X,
  Sparkles,
  Printer,
  Check,
  RotateCcw,
  Palette,
  Stamp,
  Scroll,
  Tag
} from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
  member: FamilyMember | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved', memberId: string): void;
  (e: 'print', member: FamilyMember): void;
}>();

const silverStore = useSilverStore();

// 预览面额
const previewDenom = ref<SilverDenominationValue>(10);
const denominations: SilverDenominationValue[] = [1, 5, 10, 50, 100];

// 表单字段
const bankName = ref('');
const holderLabel = ref('持票人');
const sealText = ref('');
const motto = ref('');
const leftSlogan = ref('日进有功');
const rightSlogan = ref('童叟无欺');
const themePreset = ref<SilverThemePreset>('classic');

// 快捷预设灵感
const holderLabelPresets = ['持票人', '持票少侠', '大掌柜', '总账房', '自律官', '探花郎', '小格格', '大王'];

const sloganPairPresets = [
  { left: '日进有功', right: '童叟无欺', label: '家规通宝' },
  { left: '棋道精进', right: '自律自强', label: '弈学修身' },
  { left: '好好学习', right: '天天向上', label: '求知励志' },
  { left: '书山有路', right: '学海无涯', label: '勤学好问' },
  { left: '立信践诺', right: '知书达礼', label: '君子笃行' },
  { left: '胜不骄躁', right: '败不馁怯', label: '坚毅从容' }
];

const mottoPresets = [
  '日进有功，学海无涯苦作舟',
  '积跬步以至千里，积小流以成江海',
  '静心专注，下好人生的每一手棋',
  '有诺必践，做诚实自律的好少年',
  '自己的事情自己做，每天进步一点点',
  '百善孝为先，家和万事兴'
];

// 初始化数据
watch(
  () => [props.show, props.member],
  () => {
    if (props.show && props.member) {
      const c = props.member.customNote;
      bankName.value = c?.bankName || (props.member.name + '宝库');
      holderLabel.value = c?.holderLabel || (props.member.role === '长子' ? '持票少侠' : '持票人');
      sealText.value = c?.sealText || props.member.name;
      motto.value = c?.motto || '日进有功，学海无涯';
      leftSlogan.value = c?.leftSlogan || '日进有功';
      rightSlogan.value = c?.rightSlogan || '童叟无欺';
      themePreset.value = c?.themePreset || 'classic';
      previewDenom.value = 10;
    }
  },
  { immediate: true }
);

// 构造当前编辑中的实时定制配置对象
const currentCustomNote = computed<MemberNoteCustomization>(() => {
  return {
    enabled: true,
    bankName: bankName.value.trim() || ((props.member?.name || '一诺') + '宝库'),
    holderLabel: holderLabel.value.trim() || '持票人',
    sealText: sealText.value.trim() || props.member?.name || '通宝',
    motto: motto.value.trim() || '积跬步以至千里',
    leftSlogan: leftSlogan.value.trim() || '日进有功',
    rightSlogan: rightSlogan.value.trim() || '童叟无欺',
    themePreset: themePreset.value
  };
});

// 快捷设置招牌灵感
function applyBankNamePreset(suffix: string) {
  if (!props.member) return;
  bankName.value = props.member.name + suffix;
}

// 快捷设置印章灵感
function applySealPreset(type: string) {
  if (!props.member) return;
  if (type === 'name') {
    sealText.value = props.member.name;
  } else if (type === 'seal') {
    sealText.value = props.member.name + '印';
  } else if (type === 'king') {
    sealText.value = '大王之印';
  } else if (type === 'smart') {
    sealText.value = '自律之印';
  } else if (type === 'diligent') {
    sealText.value = '勤勉之印';
  }
}

// 快捷应用对联
function applySloganPair(pair: { left: string; right: string }) {
  leftSlogan.value = pair.left;
  rightSlogan.value = pair.right;
}

// 恢复默认设置
function handleResetDefault() {
  if (!props.member) return;
  bankName.value = props.member.name + '宝库';
  holderLabel.value = '持票人';
  sealText.value = props.member.name;
  motto.value = '积跬步以至千里';
  leftSlogan.value = '日进有功';
  rightSlogan.value = '童叟无欺';
  themePreset.value = 'classic';
}

// 保存定制
function handleSave() {
  if (!props.member) return;

  const finalBank = bankName.value.trim();
  if (!finalBank) {
    showAlert({ title: '温馨提示', message: '请给你的专属钱庄起个名字吧！', type: 'warning' });
    return;
  }

  silverStore.updateMemberCustomNote(props.member.id, currentCustomNote.value);
  sound.playVictorySound();

  confetti({
    particleCount: 60,
    spread: 60,
    origin: { y: 0.6 }
  });

  showAlert({
    title: '专属银票定制成功！',
    message: '已为【' + props.member.name + '】成功盖印定制！票面与印章已更新。',
    type: 'success'
  });

  emit('saved', props.member.id);
  emit('close');
}

// 打开打印工坊
function handleOpenPrint() {
  if (!props.member) return;
  silverStore.updateMemberCustomNote(props.member.id, currentCustomNote.value);
  emit('print', props.member);
}
</script>

<template>
  <div
    v-if="show && member"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
  >
    <div
      class="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-gradient-to-b from-[#FFFDF8] to-[#FAF5E8] border-2 border-[#8C6D46] shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
    >
      <!-- 顶部标题横幅 -->
      <div
        class="flex items-center justify-between px-5 py-3.5 border-b border-[#E3D3B5] bg-[#F4ECDC]/90 shrink-0"
      >
        <div class="flex items-center gap-2.5">
          <div
            class="flex items-center justify-center w-9 h-9 rounded-xl border border-amber-700 bg-amber-100 text-amber-900 shadow-inner text-xl"
          >
            {{ member.avatar }}
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-serif font-bold text-[#4A3319] flex items-center gap-2">
              <span>专属银票工坊 · 【{{ member.name }}】的定制票样</span>
              <span class="text-xs px-2 py-0.5 rounded-full font-sans font-bold bg-amber-200 text-amber-900 border border-amber-300">
                专属镌印
              </span>
            </h3>
            <p class="text-[11px] text-[#8C6B3E] font-sans">
              定制属于自己的银票钱庄、朱砂官印与自律誓言，见票即赏！
            </p>
          </div>
        </div>

        <button
          type="button"
          class="p-1.5 rounded-full text-[#7A5A30] hover:bg-[#E6D7B8] transition-colors cursor-pointer"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- 主体内容区：左侧所见即所得大预览 + 右侧多维配置选项 -->
      <div class="p-4 sm:p-5 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-5">
        <!-- 左侧：实时大票样预览 (占 5 列) -->
        <div class="lg:col-span-5 flex flex-col items-center justify-start space-y-4 bg-[#F4ECDC]/60 p-4 rounded-2xl border border-[#D9C6A3]">
          <div class="w-full flex items-center justify-between">
            <span class="text-xs font-serif font-bold text-[#5C3F1B] flex items-center gap-1.5">
              <Stamp class="w-4 h-4 text-amber-800" />
              <span>实时仿真票样（所见即所得）</span>
            </span>
            <span class="text-[10px] text-[#8C6D46]">点选面额试样</span>
          </div>

          <!-- 面额切换预览胶囊 -->
          <div class="flex items-center gap-1 bg-[#EFE5CE] p-1 rounded-xl border border-[#D9C6A3] w-full justify-around">
            <button
              v-for="val in denominations"
              :key="val"
              type="button"
              class="px-2 py-1 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer"
              :class="
                previewDenom === val
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-[#6D4C1D] hover:bg-amber-200/60'
              "
              @click="previewDenom = val"
            >
              {{ val }}两
            </button>
          </div>

          <!-- 银票主体卡片 -->
          <div class="w-full flex justify-center py-2">
            <SilverNoteCard
              :value="previewDenom"
              :member-name="member.name"
              :member-role="member.role"
              :member-avatar="member.avatar"
              :custom-note="currentCustomNote"
              size="lg"
              class="w-full max-w-[320px]"
            />
          </div>

          <!-- 贴心小建议 -->
          <div class="w-full p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-left text-[11px] text-[#7A5A30] space-y-1">
            <div class="font-bold text-amber-900 flex items-center gap-1">
              <Sparkles class="w-3.5 h-3.5 text-amber-700" />
              <span>银票防伪说明：</span>
            </div>
            <div>• 票面正中刻有持票人专属铭牌。</div>
            <div>• 右下角加盖私人朱砂印泥宝印，权威有效！</div>
            <div>• 支持一键排版打印，裁剪后可当做真实实体银票使用！</div>
          </div>
        </div>

        <!-- 右侧：个性化定制配置表单 (占 7 列) -->
        <div class="lg:col-span-7 space-y-4">
          <!-- 1. 票纸古典主题色选择 -->
          <div>
            <label class="block text-xs font-serif font-bold text-[#5C3F1B] mb-1.5 flex items-center gap-1.5">
              <Palette class="w-4 h-4 text-amber-800" />
              <span>第一步：选择专属票纸古风色调</span>
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                v-for="preset in NOTE_THEME_PRESETS"
                :key="preset.id"
                type="button"
                class="p-2 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center gap-2"
                :class="
                  themePreset === preset.id
                    ? 'border-amber-700 bg-amber-100/90 shadow-sm ring-1 ring-amber-600'
                    : 'border-[#D9C6A3] bg-white hover:bg-amber-50/60'
                "
                @click="themePreset = preset.id"
              >
                <span
                  class="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-xs"
                  :style="{ backgroundColor: preset.tagColor }"
                />
                <div class="min-w-0">
                  <div class="text-xs font-bold text-[#4A3319] truncate">{{ preset.name }}</div>
                  <div class="text-[9px] text-[#8C6D46] truncate">{{ preset.desc.split(' ')[0] }}</div>
                </div>
              </button>
            </div>
          </div>

          <!-- 2. 钱庄招牌与称谓 -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-serif font-bold text-[#5C3F1B] mb-1">
                钱庄招牌 / 牌匾堂号
              </label>
              <input
                v-model="bankName"
                type="text"
                maxlength="10"
                placeholder="如：诺宝宝库、诺宝钱庄"
                class="w-full px-3 py-1.5 text-xs rounded-xl border border-[#D9C6A3] bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#4A3319] font-bold"
              />
              <div class="flex flex-wrap gap-1 mt-1.5">
                <button
                  type="button"
                  class="text-[10px] px-2 py-0.5 rounded bg-white text-[#7A5A30] border border-[#D9C6A3] hover:bg-amber-100 cursor-pointer"
                  @click="applyBankNamePreset('宝库')"
                >
                  +宝库
                </button>
                <button
                  type="button"
                  class="text-[10px] px-2 py-0.5 rounded bg-white text-[#7A5A30] border border-[#D9C6A3] hover:bg-amber-100 cursor-pointer"
                  @click="applyBankNamePreset('钱庄')"
                >
                  +钱庄
                </button>
                <button
                  type="button"
                  class="text-[10px] px-2 py-0.5 rounded bg-white text-[#7A5A30] border border-[#D9C6A3] hover:bg-amber-100 cursor-pointer"
                  @click="applyBankNamePreset('银号')"
                >
                  +银号
                </button>
                <button
                  type="button"
                  class="text-[10px] px-2 py-0.5 rounded bg-white text-[#7A5A30] border border-[#D9C6A3] hover:bg-amber-100 cursor-pointer"
                  @click="bankName = '状元通宝'"
                >
                  状元通宝
                </button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-serif font-bold text-[#5C3F1B] mb-1">
                持票称谓 / 身份头衔
              </label>
              <input
                v-model="holderLabel"
                type="text"
                maxlength="8"
                placeholder="如：持票人、持票少侠"
                class="w-full px-3 py-1.5 text-xs rounded-xl border border-[#D9C6A3] bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#4A3319]"
              />
              <div class="flex flex-wrap gap-1 mt-1.5">
                <button
                  v-for="lbl in holderLabelPresets.slice(0, 4)"
                  :key="lbl"
                  type="button"
                  class="text-[10px] px-2 py-0.5 rounded bg-white text-[#7A5A30] border border-[#D9C6A3] hover:bg-amber-100 cursor-pointer"
                  @click="holderLabel = lbl"
                >
                  {{ lbl }}
                </button>
              </div>
            </div>
          </div>

          <!-- 3. 朱砂官印铭文 (孩子最爱！) -->
          <div>
            <label class="block text-xs font-serif font-bold text-[#5C3F1B] mb-1 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <Stamp class="w-4 h-4 text-red-700" />
                <span>专属私人朱砂红印（2~4字）</span>
              </span>
              <span class="text-[10px] text-red-700 font-sans font-bold">
                印文预览：{{ currentCustomNote.sealText }}
              </span>
            </label>
            <input
              v-model="sealText"
              type="text"
              maxlength="6"
              placeholder="如：诺宝（自动刻成“诺宝之印”）、大掌柜印"
              class="w-full px-3 py-1.5 text-xs rounded-xl border border-[#D9C6A3] bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-red-800 font-bold"
            />
            <div class="flex flex-wrap gap-1.5 mt-1.5">
              <button
                type="button"
                class="text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 cursor-pointer"
                @click="applySealPreset('name')"
              >
                {{ member.name }}之印
              </button>
              <button
                type="button"
                class="text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 cursor-pointer"
                @click="applySealPreset('king')"
              >
                大王之印
              </button>
              <button
                type="button"
                class="text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 cursor-pointer"
                @click="applySealPreset('smart')"
              >
                自律之印
              </button>
              <button
                type="button"
                class="text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 cursor-pointer"
                @click="applySealPreset('diligent')"
              >
                勤勉之印
              </button>
            </div>
          </div>

          <!-- 4. 左右竖排律令对联 -->
          <div>
            <label class="block text-xs font-serif font-bold text-[#5C3F1B] mb-1 flex items-center gap-1.5">
              <Scroll class="w-4 h-4 text-amber-800" />
              <span>左右票面律令对联</span>
            </label>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <span class="text-[10px] text-[#7A5A30] block mb-0.5">左侧对联（竖排）：</span>
                <input
                  v-model="leftSlogan"
                  type="text"
                  maxlength="6"
                  class="w-full px-2.5 py-1 text-xs rounded-lg border border-[#D9C6A3] bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-center text-[#4A3319]"
                />
              </div>
              <div>
                <span class="text-[10px] text-[#7A5A30] block mb-0.5">右侧对联（竖排）：</span>
                <input
                  v-model="rightSlogan"
                  type="text"
                  maxlength="6"
                  class="w-full px-2.5 py-1 text-xs rounded-lg border border-[#D9C6A3] bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-center text-[#4A3319]"
                />
              </div>
            </div>
            <!-- 预设成对对联 -->
            <div class="flex flex-wrap gap-1 mt-1.5">
              <button
                v-for="pair in sloganPairPresets"
                :key="pair.label"
                type="button"
                class="text-[10px] px-2 py-0.5 rounded bg-white text-[#7A5A30] border border-[#D9C6A3] hover:bg-amber-100 transition-colors cursor-pointer"
                @click="applySloganPair(pair)"
              >
                {{ pair.left }} / {{ pair.right }}
              </button>
            </div>
          </div>

          <!-- 5. 励志誓言 / 座右铭 (票底题跋) -->
          <div>
            <label class="block text-xs font-serif font-bold text-[#5C3F1B] mb-1 flex items-center gap-1.5">
              <Tag class="w-4 h-4 text-amber-800" />
              <span>专属自律誓言 / 座右铭寄语</span>
            </label>
            <input
              v-model="motto"
              type="text"
              maxlength="24"
              placeholder="如：日进有功，学海无涯苦作舟"
              class="w-full px-3 py-1.5 text-xs rounded-xl border border-[#D9C6A3] bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#4A3319]"
            />
            <div class="flex flex-wrap gap-1 mt-1.5">
              <button
                v-for="(m, idx) in mottoPresets"
                :key="idx"
                type="button"
                class="text-[10px] px-2 py-0.5 rounded bg-white text-[#7A5A30] border border-[#D9C6A3] hover:bg-amber-100 truncate max-w-[210px] cursor-pointer"
                :title="m"
                @click="motto = m"
              >
                {{ m }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作按钮栏 -->
      <div
        class="flex flex-col sm:flex-row items-center justify-between gap-2.5 px-5 py-3 border-t border-[#E3D3B5] bg-[#F4ECDC]/90 shrink-0"
      >
        <div class="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            type="button"
            class="px-3 py-1.5 rounded-xl text-xs font-serif text-[#7A5A30] hover:bg-[#E6D7B8] flex items-center gap-1 cursor-pointer transition-colors"
            @click="handleResetDefault"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            <span>恢复默认</span>
          </button>

          <button
            type="button"
            class="px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold text-amber-900 bg-amber-200/90 hover:bg-amber-300/90 border border-amber-300 flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
            @click="handleOpenPrint"
          >
            <Printer class="w-3.5 h-3.5 text-amber-800" />
            <span>排版打印纸币</span>
          </button>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-xs font-serif text-[#6D4C1D] hover:bg-[#E6D7B8] transition-colors cursor-pointer"
            @click="emit('close')"
          >
            取消
          </button>

          <button
            type="button"
            class="px-5 py-2 rounded-xl text-xs font-serif font-bold text-white bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 shadow-md cursor-pointer flex items-center gap-1.5 transition-all transform active:scale-95"
            @click="handleSave"
          >
            <Check class="w-4 h-4" />
            <span>大印盖定 · 保存专属银票</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
