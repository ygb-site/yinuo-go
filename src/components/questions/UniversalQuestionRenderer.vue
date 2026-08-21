<script setup lang="ts">
import type { UniversalQuestionStep, SubjectId } from "../../types/curriculum";
import SingleChoiceWidget from "./SingleChoiceWidget.vue";
import DragMatchWidget from "./DragMatchWidget.vue";
import FillBlankWidget from "./FillBlankWidget.vue";
import OrderingWidget from "./OrderingWidget.vue";
import HanziCanvasWidget from "./HanziCanvasWidget.vue";
import MathCounterWidget from "./MathCounterWidget.vue";
import GoBoardWidget from "./GoBoardWidget.vue";
import FormulaWidget from "./FormulaWidget.vue";

defineProps<{
  step: UniversalQuestionStep;
  subjectId?: SubjectId;
}>();

const emit = defineEmits<{
  (e: "pass"): void;
  (e: "fail", message?: string, detail?: any): void;
}>();

const handleFail = (msg?: string, detail?: any) => {
  emit("fail", msg, detail);
};
</script>

<template>
  <div class="w-full flex flex-col items-center">
    <SingleChoiceWidget
      v-if="step.type === 'single_choice' || step.type === 'multi_choice'"
      :step="step"
      @pass="emit('pass')"
      @fail="handleFail"
    />

    <FormulaWidget
      v-else-if="step.type === 'math_formula' || step.type === 'formula'"
      :step="step"
      @pass="emit('pass')"
      @fail="handleFail"
    />

    <DragMatchWidget
      v-else-if="step.type === 'drag_match'"
      :step="step"
      @pass="emit('pass')"
      @fail="handleFail"
    />

    <FillBlankWidget
      v-else-if="step.type === 'fill_blank'"
      :step="step"
      @pass="emit('pass')"
      @fail="handleFail"
    />

    <OrderingWidget
      v-else-if="step.type === 'ordering'"
      :step="step"
      @pass="emit('pass')"
      @fail="handleFail"
    />

    <HanziCanvasWidget
      v-else-if="step.type === 'hanzi_canvas'"
      :step="step"
      @pass="emit('pass')"
    />

    <MathCounterWidget
      v-else-if="step.type === 'math_counter'"
      :step="step"
      @pass="emit('pass')"
      @fail="handleFail"
    />

    <GoBoardWidget
      v-else-if="step.type === 'go_board'"
      :step="step"
      @pass="emit('pass')"
      @fail="handleFail"
    />

    <div v-else class="p-8 text-center bg-white rounded-3xl border-2 border-slate-200">
      <p class="text-lg font-bold text-slate-600">正在加载该题型组件...</p>
    </div>
  </div>
</template>