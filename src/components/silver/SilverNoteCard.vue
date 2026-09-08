<script setup lang="ts">
import { computed } from 'vue';
import { SILVER_DENOMINATIONS } from '../../stores/useSilverStore';
import type { SilverDenominationValue, MemberNoteCustomization, SilverThemePreset } from '../../types/silver';

const props = withDefaults(
  defineProps<{
    value: SilverDenominationValue | number;
    count?: number; // 持有张数（若作为金库展示）
    selected?: boolean;
    interactive?: boolean;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'printable';
    showDetails?: boolean;
    memberName?: string; // 归属成员名字，如 "诺宝"
    memberRole?: string; // 成员角色，如 "长子"
    memberAvatar?: string; // 成员头像 Emoji
    customNote?: MemberNoteCustomization | null; // 专属定制信息
    printable?: boolean; // 打印模式（带剪裁虚线）
  }>(),
  {
    count: undefined,
    selected: false,
    interactive: false,
    size: 'md',
    showDetails: true,
    memberName: undefined,
    memberRole: undefined,
    memberAvatar: undefined,
    customNote: null,
    printable: false
  }
);

const emit = defineEmits<{
  (e: 'click', value: number): void;
}>();

const config = computed(() => {
  const v = props.value as SilverDenominationValue;
  return SILVER_DENOMINATIONS[v] || {
    value: props.value,
    label: props.value + '两',
    name: props.value + '两银票',
    color: '#92400E',
    borderColor: '#B45309',
    bgColor: '#FFFBEB',
    badge: '特设赏格',
    sealText: '通宝',
    poem: '功德无量福泽长'
  };
});

// 大写汉字转译
const chineseNumeral = computed(() => {
  const map: Record<number, string> = {
    1: '壹两整',
    5: '伍两整',
    10: '拾两整',
    50: '伍拾两整',
    100: '壹百两整'
  };
  return map[props.value] || (props.value + '两整');
});

// 主题色配置
const themePreset = computed<SilverThemePreset>(() => {
  return props.customNote?.themePreset || 'classic';
});

// 主题样式
const themeStyles = computed(() => {
  const map: Record<SilverThemePreset, {
    paperBg: string;
    outerBorder: string;
    innerBorder: string;
    frameStroke: string;
    plaqueBg: string;
    plaqueBorder: string;
    plaqueText: string;
    mainInk: string;
    subInk: string;
    centerBg: string;
    centerBorder: string;
    valueColor: string;
    sealBg: string;
    sealBorder: string;
    sealText: string;
  }> = {
    classic: {
      paperBg: 'linear-gradient(175deg, #FCF8EE 0%, #F5ECDA 100%)',
      outerBorder: '#5C3A1E',
      innerBorder: '#8A5D33',
      frameStroke: '#8A5D33',
      plaqueBg: 'linear-gradient(180deg, #6B3F1B 0%, #4D2B10 100%)',
      plaqueBorder: '#C89B58',
      plaqueText: '#FFF4D6',
      mainInk: '#2D1B0B',
      subInk: '#5A381B',
      centerBg: 'rgba(255, 253, 247, 0.95)',
      centerBorder: '#BA8D53',
      valueColor: config.value.value === 10 ? '#B45309' : config.value.value === 1 ? '#1D4ED8' : config.value.value === 5 ? '#047857' : config.value.value === 50 ? '#6D28D9' : '#B91C1C',
      sealBg: '#FEF2F2',
      sealBorder: '#B91C1C',
      sealText: '#B91C1C'
    },
    gold: {
      paperBg: 'linear-gradient(175deg, #FFFDF0 0%, #FDF3CD 100%)',
      outerBorder: '#854D0E',
      innerBorder: '#B45309',
      frameStroke: '#B45309',
      plaqueBg: 'linear-gradient(180deg, #854D0E 0%, #713F12 100%)',
      plaqueBorder: '#FBBF24',
      plaqueText: '#FEF9C3',
      mainInk: '#451A03',
      subInk: '#78350F',
      centerBg: 'rgba(255, 254, 245, 0.95)',
      centerBorder: '#D97706',
      valueColor: '#B45309',
      sealBg: '#FEF2F2',
      sealBorder: '#B91C1C',
      sealText: '#B91C1C'
    },
    emerald: {
      paperBg: 'linear-gradient(175deg, #F5FBF7 0%, #E3F4EA 100%)',
      outerBorder: '#14532D',
      innerBorder: '#15803D',
      frameStroke: '#15803D',
      plaqueBg: 'linear-gradient(180deg, #14532D 0%, #0F3E22 100%)',
      plaqueBorder: '#4ADE80',
      plaqueText: '#DCFCE7',
      mainInk: '#052E16',
      subInk: '#166534',
      centerBg: 'rgba(255, 255, 255, 0.95)',
      centerBorder: '#16A34A',
      valueColor: '#047857',
      sealBg: '#FEF2F2',
      sealBorder: '#B91C1C',
      sealText: '#B91C1C'
    },
    purple: {
      paperBg: 'linear-gradient(175deg, #FAF7FD 0%, #F0E8FA 100%)',
      outerBorder: '#581C87',
      innerBorder: '#7E22CE',
      frameStroke: '#7E22CE',
      plaqueBg: 'linear-gradient(180deg, #581C87 0%, #3B0764 100%)',
      plaqueBorder: '#C084FC',
      plaqueText: '#F3E8FF',
      mainInk: '#2E1065',
      subInk: '#6B21A8',
      centerBg: 'rgba(255, 255, 255, 0.95)',
      centerBorder: '#9333EA',
      valueColor: '#6D28D9',
      sealBg: '#FEF2F2',
      sealBorder: '#B91C1C',
      sealText: '#B91C1C'
    },
    azure: {
      paperBg: 'linear-gradient(175deg, #F4F9FD 0%, #E2F0FA 100%)',
      outerBorder: '#0C4A6E',
      innerBorder: '#0369A1',
      frameStroke: '#0369A1',
      plaqueBg: 'linear-gradient(180deg, #0C4A6E 0%, #082F49 100%)',
      plaqueBorder: '#38BDF8',
      plaqueText: '#E0F2FE',
      mainInk: '#082F49',
      subInk: '#0369A1',
      centerBg: 'rgba(255, 255, 255, 0.95)',
      centerBorder: '#0284C7',
      valueColor: '#0284C7',
      sealBg: '#FEF2F2',
      sealBorder: '#B91C1C',
      sealText: '#B91C1C'
    },
    ruby: {
      paperBg: 'linear-gradient(175deg, #FDF5F5 0%, #FCE7E7 100%)',
      outerBorder: '#881337',
      innerBorder: '#BE123C',
      frameStroke: '#BE123C',
      plaqueBg: 'linear-gradient(180deg, #881337 0%, #4C0519 100%)',
      plaqueBorder: '#FB7185',
      plaqueText: '#FFE4E6',
      mainInk: '#4C0519',
      subInk: '#9F1239',
      centerBg: 'rgba(255, 255, 255, 0.95)',
      centerBorder: '#E11D48',
      valueColor: '#B91C1C',
      sealBg: '#FEF2F2',
      sealBorder: '#9F1239',
      sealText: '#9F1239'
    },
    pink: {
      paperBg: 'linear-gradient(175deg, #FDF6F9 0%, #FAE8F0 100%)',
      outerBorder: '#831843',
      innerBorder: '#BE185D',
      frameStroke: '#BE185D',
      plaqueBg: 'linear-gradient(180deg, #831843 0%, #500724 100%)',
      plaqueBorder: '#F472B6',
      plaqueText: '#FCE7F3',
      mainInk: '#500724',
      subInk: '#9D174D',
      centerBg: 'rgba(255, 255, 255, 0.95)',
      centerBorder: '#DB2777',
      valueColor: '#BE185D',
      sealBg: '#FEF2F2',
      sealBorder: '#9D174D',
      sealText: '#9D174D'
    }
  };
  return map[themePreset.value] || map.classic;
});

// 计算个性化钱庄招牌
const effectiveBankName = computed(() => {
  if (props.customNote?.bankName) return props.customNote.bankName;
  if (props.memberName) return props.memberName + '宝库';
  return '一诺钱庄';
});

// 称谓标签
const effectiveHolderLabel = computed(() => {
  return props.customNote?.holderLabel || '持票人';
});

// 左右对联
const effectiveLeftSlogan = computed(() => {
  return props.customNote?.leftSlogan || '日进有功';
});

const effectiveRightSlogan = computed(() => {
  return props.customNote?.rightSlogan || '童叟无欺';
});

// 诗文 / 座右铭
const effectiveMotto = computed(() => {
  return props.customNote?.motto || config.value.poem;
});

// 印章铭文两行拆解
const sealLines = computed<[string, string]>(() => {
  const raw = (props.customNote?.sealText || props.memberName || config.value.sealText || '通宝').trim();
  if (!raw) return ['通宝', '之印'];
  if (raw.length === 4) {
    return [raw.slice(0, 2), raw.slice(2)];
  }
  if (raw.endsWith('之印') || raw.endsWith('私印') || raw.endsWith('之宝') || raw.endsWith('信印')) {
    const stem = raw.slice(0, -2);
    return [stem.length > 2 ? stem.slice(0, 2) : stem, raw.slice(-2)];
  }
  if (raw.length === 2) {
    return [raw, '之印'];
  }
  if (raw.length === 3) {
    return [raw.slice(0, 2), raw.charAt(2) + '印'];
  }
  if (raw.length === 1) {
    return [raw + '氏', '之印'];
  }
  return [raw.slice(0, 2), '之印'];
});

// 序列号
const serialNumber = computed(() => {
  const prefix = props.memberName ? (props.memberName.slice(0, 1).charCodeAt(0) % 90 + 10) : 20;
  return '№.' + prefix + '26' + String(props.value).padStart(2, '0');
});
</script>

<template>
  <div
    class="relative select-none font-serif transition-all duration-300 group"
    :class="[
      interactive ? 'cursor-pointer hover:-translate-y-1.5 hover:shadow-2xl active:scale-[0.98]' : '',
      selected ? 'ring-3 ring-amber-600 ring-offset-2 scale-[1.02] shadow-xl' : 'shadow-md',
      printable ? 'p-1' : ''
    ]"
    @click="emit('click', props.value)"
  >
    <!-- 打印模式下外围裁剪辅助线 -->
    <div
      v-if="printable"
      class="absolute -inset-1 border-2 border-dashed border-gray-400 pointer-events-none rounded flex items-center justify-between px-1.5"
    >
      <span class="text-[9px] text-gray-500 font-mono font-bold whitespace-nowrap">✂ - - - - - - -</span>
      <span class="text-[9px] text-gray-500 font-mono font-bold whitespace-nowrap">- - - - - - - ✂</span>
    </div>

    <!-- 景区仿真复古传统银票主体 -->
    <div
      class="relative overflow-hidden rounded-xl border-2 transition-colors flex flex-col justify-between"
      :style="{
        background: themeStyles.paperBg,
        borderColor: themeStyles.outerBorder,
        color: themeStyles.mainInk,
        boxShadow: selected
          ? '0 0 0 2px #b45309, 0 12px 28px -4px rgba(133, 77, 14, 0.35)'
          : printable
            ? 'none'
            : '0 6px 16px -2px rgba(69, 26, 3, 0.16)'
      }"
      :class="[
        size === 'xs' ? 'w-44 p-2 text-xs' : '',
        size === 'sm' ? 'w-full max-w-[260px] p-2 sm:p-2.5 text-xs' : '',
        size === 'md' ? 'w-full max-w-[300px] p-3 text-sm' : '',
        size === 'lg' ? 'w-full max-w-[370px] p-4 text-base' : '',
        size === 'printable' ? 'w-full p-2.5 text-xs print:break-inside-avoid' : ''
      ]"
    >
      <!-- 雕版外边框 -->
      <div
        class="relative rounded-lg border-2 p-2 flex flex-col justify-between"
        :style="{ borderColor: themeStyles.innerBorder }"
      >
        <!-- 四角古典如意雷纹花角 -->
        <svg class="absolute -top-1 -left-1 w-3.5 h-3.5 pointer-events-none" viewBox="0 0 24 24" fill="none" :stroke="themeStyles.frameStroke" stroke-width="2.5">
          <path d="M2 2h8v4H6v4H2V2zm0 0v8M2 2h8" />
        </svg>
        <svg class="absolute -top-1 -right-1 w-3.5 h-3.5 pointer-events-none" viewBox="0 0 24 24" fill="none" :stroke="themeStyles.frameStroke" stroke-width="2.5">
          <path d="M22 2h-8v4h4v4h4V2zm0 0v8M22 2h-8" />
        </svg>
        <svg class="absolute -bottom-1 -left-1 w-3.5 h-3.5 pointer-events-none" viewBox="0 0 24 24" fill="none" :stroke="themeStyles.frameStroke" stroke-width="2.5">
          <path d="M2 22h8v-4H6v-4H2v8zm0 0v-8M2 22h8" />
        </svg>
        <svg class="absolute -bottom-1 -right-1 w-3.5 h-3.5 pointer-events-none" viewBox="0 0 24 24" fill="none" :stroke="themeStyles.frameStroke" stroke-width="2.5">
          <path d="M22 22h-8v-4h4v-4h4v8zm0 0v-8M22 22h-8" />
        </svg>

        <!-- 1. 银票顶额：华丽传统金丝红底招牌匾额 -->
        <div class="mb-1.5">
          <!-- 钱庄主招牌堂号 -->
          <div
            class="rounded-md border py-1 px-2 flex items-center justify-between shadow-xs"
            :style="{
              background: themeStyles.plaqueBg,
              borderColor: themeStyles.plaqueBorder,
              color: themeStyles.plaqueText
            }"
          >
            <span class="text-[9px] font-serif font-black opacity-80 select-none">❖</span>
            <div class="font-serif font-black tracking-[0.2em] text-xs sm:text-sm drop-shadow-xs whitespace-nowrap truncate px-1">
              {{ effectiveBankName }}
            </div>
            <span class="text-[9px] font-serif font-black opacity-80 select-none">❖</span>
          </div>

          <!-- 票号与持票归属副栏（绝不折行！） -->
          <div
            class="flex items-center justify-between pt-1 text-[10px] font-sans font-medium border-b pb-1 gap-1"
            :style="{ borderColor: themeStyles.innerBorder, color: themeStyles.subInk }"
          >
            <!-- 专属人姓名标识 -->
            <div
              v-if="memberName"
              class="inline-flex items-center gap-1 font-bold bg-white/95 px-1.5 py-0.5 rounded border shadow-2xs shrink-0 whitespace-nowrap"
              :style="{ borderColor: themeStyles.innerBorder, color: themeStyles.mainInk }"
            >
              <span v-if="memberAvatar" class="text-xs leading-none">{{ memberAvatar }}</span>
              <span>{{ effectiveHolderLabel }}：<b class="text-amber-950 font-black">{{ memberName }}</b></span>
            </div>
            <div v-else class="text-[10px] font-serif font-bold tracking-widest whitespace-nowrap shrink-0">
              齐家信物
            </div>

            <!-- 银票官造编号（单行紧凑，永不折行） -->
            <div class="font-mono tracking-tight font-bold text-[9px] opacity-85 shrink-0 whitespace-nowrap pl-1">
              {{ serialNumber }}
            </div>
          </div>
        </div>

        <!-- 2. 主体票芯：左右对联石柱 + 中间大写面额 -->
        <div class="flex items-stretch justify-between gap-1 my-1">
          <!-- 左侧律令立柱（工整楷书竖排，深墨色） -->
          <div
            class="w-4.5 sm:w-5 shrink-0 flex items-center justify-center rounded border py-1 bg-white/80 shadow-2xs"
            :style="{ borderColor: themeStyles.innerBorder }"
          >
            <span
              class="writing-vertical text-[10px] font-serif font-bold tracking-widest leading-none select-none"
              :style="{ color: themeStyles.mainInk }"
            >
              {{ effectiveLeftSlogan }}
            </span>
          </div>

          <!-- 中间主票芯（宽阔大气，字体弹性缩放，绝不折行！） -->
          <div
            class="flex-1 min-w-0 flex flex-col items-center justify-center py-1.5 px-1.5 sm:px-2 rounded-lg border-2 shadow-inner"
            :style="{
              backgroundColor: themeStyles.centerBg,
              borderColor: themeStyles.centerBorder
            }"
          >
            <!-- 规制说明 -->
            <div
              class="text-[9px] sm:text-[10px] font-serif font-bold tracking-wider mb-0.5 opacity-90 whitespace-nowrap"
              :style="{ color: themeStyles.subInk }"
            >
              【 见票即付 · 凭票立赏 】
            </div>

            <!-- 面额大写字样（粗大、清晰、浓墨重彩、单行不折行！） -->
            <div
              class="my-0.5 font-serif font-black tracking-wider drop-shadow-sm flex items-baseline justify-center whitespace-nowrap"
              :style="{ color: themeStyles.valueColor }"
              :class="[
                chineseNumeral.length >= 4
                  ? (size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-lg sm:text-xl')
                  : (size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-3xl' : 'text-xl sm:text-2xl')
              ]"
            >
              <span>{{ chineseNumeral }}</span>
            </div>

            <!-- 折银两数与专属金标（纵向排布，不挤占宽度，永不折行！） -->
            <div class="flex flex-col items-center gap-0.5 mt-0.5">
              <span
                class="text-[11px] sm:text-xs font-serif font-black tracking-wider whitespace-nowrap"
                :style="{ color: themeStyles.mainInk }"
              >
                折银 {{ props.value }} 两整
              </span>

              <span
                v-if="memberName"
                class="text-[8px] sm:text-[9px] font-serif font-bold px-1.5 py-0.2 rounded bg-amber-100/90 text-amber-900 border border-amber-300 shadow-2xs whitespace-nowrap"
              >
                {{ memberName }}专享
              </span>
            </div>
          </div>

          <!-- 右侧律令立柱（工整楷书竖排，深墨色） -->
          <div
            class="w-4.5 sm:w-5 shrink-0 flex items-center justify-center rounded border py-1 bg-white/80 shadow-2xs"
            :style="{ borderColor: themeStyles.innerBorder }"
          >
            <span
              class="writing-vertical text-[10px] font-serif font-bold tracking-widest leading-none select-none"
              :style="{ color: themeStyles.mainInk }"
            >
              {{ effectiveRightSlogan }}
            </span>
          </div>
        </div>

        <!-- 3. 底部签押：专属座右铭与朱砂方印大章 -->
        <div
          class="relative mt-1 pt-1 border-t-2 flex items-center justify-between gap-1.5"
          :style="{ borderColor: themeStyles.innerBorder }"
        >
          <!-- 底部座右铭 / 赏格誓言（清晰工整） -->
          <div class="flex-1 min-w-0 pr-1">
            <div class="text-[8px] sm:text-[9px] text-[#8C6D46] font-serif font-bold mb-0.5 whitespace-nowrap">
              【 奉公自律 · 箴言 】
            </div>
            <div
              class="text-[9px] sm:text-[10px] font-serif font-bold truncate leading-tight"
              :style="{ color: themeStyles.mainInk }"
              :title="effectiveMotto"
            >
              「{{ effectiveMotto }}」
            </div>
          </div>

          <!-- 朱砂大红古法方印（双边框、高饱和朱红、清晰两行篆隶印文） -->
          <div
            class="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded border-2 shadow-xs shrink-0 select-none rotate-[-4deg] transition-transform group-hover:rotate-0"
            :style="{
              borderColor: themeStyles.sealBorder,
              backgroundColor: themeStyles.sealBg,
              color: themeStyles.sealText
            }"
            :title="'印文：' + sealLines[0] + sealLines[1]"
          >
            <!-- 印章内细线边框 -->
            <div class="w-full h-full p-0.5 border border-dashed rounded-xs flex items-center justify-center" :style="{ borderColor: themeStyles.sealBorder }">
              <div class="text-center leading-none font-serif font-black text-[8px] sm:text-[9px] tracking-tight whitespace-nowrap">
                <div>{{ sealLines[0] }}</div>
                <div>{{ sealLines[1] }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 选中标识角标 -->
      <div
        v-if="selected"
        class="absolute top-0 right-0 bg-amber-700 text-white text-[10px] font-sans font-bold px-2 py-0.5 rounded-bl-lg shadow-md flex items-center gap-1 whitespace-nowrap z-10"
      >
        <span>✓</span>
        <span>已选定</span>
      </div>

      <!-- 持有张数角标（在资产拆解时用） -->
      <div
        v-if="count !== undefined"
        class="absolute -top-2 -right-2 bg-gradient-to-r from-amber-700 to-red-700 text-white text-xs font-sans font-black px-2 py-0.5 rounded-full shadow-md border-2 border-white flex items-center gap-0.5 whitespace-nowrap z-10"
      >
        <span>×</span>
        <span>{{ count }}</span>
        <span class="text-[10px] font-normal">张</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.writing-vertical {
  writing-mode: vertical-rl;
  text-orientation: upright;
}
</style>

