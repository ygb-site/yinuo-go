<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSilverStore } from '../../stores/useSilverStore';
import type { FamilyMember, SilverDenominationValue } from '../../types/silver';
import SilverNoteCard from './SilverNoteCard.vue';
import { X, Printer, Scissors } from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
  member: FamilyMember | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const silverStore = useSilverStore();

const selectedMemberId = ref<string>(props.member?.id || silverStore.members[0]?.id || '');

// 若切换 props.member
watchMember();
function watchMember() {
  if (props.member) {
    selectedMemberId.value = props.member.id;
  }
}

const activeMember = computed<FamilyMember | undefined>(() => {
  return silverStore.members.find(m => m.id === selectedMemberId.value) || props.member || undefined;
});

// 版面预设模式
type LayoutPreset = 'standard' | 'pocket' | 'large';
const layoutPreset = ref<LayoutPreset>('standard');

// 依据版面预设生成的面额数组
const sheetItems = computed<SilverDenominationValue[]>(() => {
  if (layoutPreset.value === 'pocket') {
    // 零钞版：1两 x 4, 5两 x 2, 10两 x 2
    return [1, 1, 1, 1, 5, 5, 10, 10];
  } else if (layoutPreset.value === 'large') {
    // 大额庄票版：10两 x 2, 50两 x 2, 100两 x 2
    return [10, 10, 50, 50, 100, 100];
  }
  // 标准综合版 (8张)：1两 x 2, 5两 x 2, 10两 x 2, 50两 x 1, 100两 x 1
  return [1, 1, 5, 5, 10, 10, 50, 100];
});

// 执行打印
function handlePrint() {
  window.print();
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
  >
    <div
      class="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-[#FFFDF8] border-2 border-[#8C6D46] shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]"
    >
      <!-- 顶栏（打印时隐藏） -->
      <div
        class="flex items-center justify-between px-5 py-3 border-b border-[#E3D3B5] bg-[#F4ECDC]/90 shrink-0 print:hidden"
      >
        <div class="flex items-center gap-2.5">
          <div
            class="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-200 border border-amber-400 text-amber-900 shadow-inner"
          >
            <Printer class="w-4 h-4 text-amber-800" />
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-serif font-bold text-[#4A3319] flex items-center gap-2">
              <span>实体银票排版印刷工坊（A4裁剪版）</span>
            </h3>
            <p class="text-[11px] text-[#8C6B3E] font-sans">
              支持导出或直接调用打印机，沿裁剪虚线裁开即可当做真实家庭激励道具！
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

      <!-- 控制面板（打印时隐藏） -->
      <div class="p-4 bg-[#FAF5E8] border-b border-[#E3D3B5] space-y-3 shrink-0 print:hidden">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <!-- 切换成员 -->
          <div class="flex items-center gap-2">
            <span class="text-xs font-serif font-bold text-[#5C3F1B]">印制归属成员：</span>
            <div class="flex items-center gap-1.5">
              <button
                v-for="m in silverStore.members"
                :key="m.id"
                type="button"
                class="px-2.5 py-1 rounded-xl text-xs font-serif border transition-all flex items-center gap-1 cursor-pointer"
                :class="
                  selectedMemberId === m.id
                    ? 'bg-amber-700 text-white border-amber-800 shadow-xs'
                    : 'bg-white text-[#6D4C1D] border-[#D9C6A3] hover:bg-amber-100'
                "
                @click="selectedMemberId = m.id"
              >
                <span>{{ m.avatar }}</span>
                <span>{{ m.name }}</span>
              </button>
            </div>
          </div>

          <!-- 版面规格预设 -->
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-serif font-bold text-[#5C3F1B]">版式预设：</span>
            <button
              type="button"
              class="px-2.5 py-1 rounded-lg text-xs font-serif border cursor-pointer transition-all"
              :class="
                layoutPreset === 'standard'
                  ? 'bg-amber-700 text-white border-amber-800 shadow-xs'
                  : 'bg-white text-[#6D4C1D] border-[#D9C6A3] hover:bg-amber-100'
              "
              @click="layoutPreset = 'standard'"
            >
              标准综合版 (8张)
            </button>
            <button
              type="button"
              class="px-2.5 py-1 rounded-lg text-xs font-serif border cursor-pointer transition-all"
              :class="
                layoutPreset === 'pocket'
                  ? 'bg-amber-700 text-white border-amber-800 shadow-xs'
                  : 'bg-white text-[#6D4C1D] border-[#D9C6A3] hover:bg-amber-100'
              "
              @click="layoutPreset = 'pocket'"
            >
              常用零钞版 (8张)
            </button>
            <button
              type="button"
              class="px-2.5 py-1 rounded-lg text-xs font-serif border cursor-pointer transition-all"
              :class="
                layoutPreset === 'large'
                  ? 'bg-amber-700 text-white border-amber-800 shadow-xs'
                  : 'bg-white text-[#6D4C1D] border-[#D9C6A3] hover:bg-amber-100'
              "
              @click="layoutPreset = 'large'"
            >
              大额庄票版 (6张)
            </button>
          </div>
        </div>

        <!-- 亲子温馨指导 -->
        <div class="flex items-center gap-2 text-[11px] text-[#7A5A30] bg-white/80 p-2.5 rounded-xl border border-[#E0D2BA]">
          <Scissors class="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <b>裁剪小指引：</b>点击下方【唤起打印】即可直接打印或保存为 PDF。纸张四周带有裁切虚线 ✂，使用安全剪刀剪开即可！
          </span>
        </div>
      </div>

      <!-- 可打印内容主体区域（添加 print-sheet 类） -->
      <div class="print-sheet p-4 sm:p-6 overflow-y-auto flex-1 bg-white">
        <!-- 打印页眉小标号 -->
        <div class="flex items-center justify-between pb-2 mb-3 border-b border-dashed border-gray-300 text-[10px] text-gray-500 font-serif">
          <div>一诺钱庄 · 齐家公约专属银票纸币【{{ activeMember?.name || '全家' }}专版】</div>
          <div>见票即付 · 凭票立赏 · 童叟无欺</div>
        </div>

        <!-- 银票纸币网格 (2 列排版，极适合 A4 纸打印) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
          <div
            v-for="(val, idx) in sheetItems"
            :key="idx"
            class="relative p-1 print:break-inside-avoid"
          >
            <SilverNoteCard
              :value="val"
              :member-name="activeMember?.name"
              :member-role="activeMember?.role"
              :member-avatar="activeMember?.avatar"
              :custom-note="activeMember?.customNote"
              size="printable"
              printable
            />
          </div>
        </div>

        <!-- 打印页脚小说明 -->
        <div class="mt-4 pt-2 border-t border-dashed border-gray-300 text-center text-[9px] text-gray-400 font-serif">
          ※ 遵循亲子公约 · 奖善惩怠 · 一诺千金 ※
        </div>
      </div>

      <!-- 底部操作按钮（打印时隐藏） -->
      <div
        class="flex items-center justify-between px-5 py-3 border-t border-[#E3D3B5] bg-[#F4ECDC]/90 shrink-0 print:hidden"
      >
        <div class="text-xs text-[#7A5A30]">
          当前印制：<b class="text-amber-900">{{ activeMember?.name }}</b> 专属银票
          （共 <b class="text-amber-900">{{ sheetItems.length }}</b> 张）
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-xs font-serif text-[#6D4C1D] hover:bg-[#E6D7B8] transition-colors cursor-pointer"
            @click="emit('close')"
          >
            关闭
          </button>

          <button
            type="button"
            class="px-5 py-2 rounded-xl text-xs font-serif font-bold text-white bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 shadow-md cursor-pointer flex items-center gap-1.5 transition-all transform active:scale-95"
            @click="handlePrint"
          >
            <Printer class="w-4 h-4" />
            <span>🖨️ 立即打印 / 存为PDF</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  .print-sheet,
  .print-sheet * {
    visibility: visible;
  }
  .print-sheet {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 10mm;
    background: white !important;
  }
}
</style>
