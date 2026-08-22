<script setup lang="ts">
import { computed } from 'vue';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const props = withDefaults(
  defineProps<{
    formula: string;
    displayMode?: boolean;
    errorColor?: string;
  }>(),
  {
    displayMode: false,
    errorColor: '#dc2626'
  }
);

const renderedHtml = computed(() => {
  if (!props.formula) return '';
  try {
    // Strip external delimiters like $$...$$ or $...$ if passed
    let clean = props.formula.trim();
    if (clean.startsWith('$$') && clean.endsWith('$$')) {
      clean = clean.slice(2, -2).trim();
    } else if (clean.startsWith('$') && clean.endsWith('$')) {
      clean = clean.slice(1, -1).trim();
    }
    return katex.renderToString(clean, {
      displayMode: props.displayMode,
      throwOnError: false,
      errorColor: props.errorColor
    });
  } catch (err) {
    console.warn('[MathFormula] KaTeX Render Error:', err);
    return `<span class="text-red-500 font-mono text-sm">${props.formula}</span>`;
  }
});
</script>

<template>
  <span
    v-if="!displayMode"
    class="inline-flex items-center mx-1 font-serif text-slate-800"
    v-html="renderedHtml"
  ></span>
  <div
    v-else
    class="w-full flex justify-center items-center my-3 py-3 px-4 bg-amber-50/50 rounded-2xl border border-amber-200/60 overflow-x-auto"
    v-html="renderedHtml"
  ></div>
</template>

<style>
/* Enhance KaTeX font sizing and line integration for primary kids */
.katex {
  font-size: 1.18em !important;
  text-rendering: optimizeLegibility;
}
.katex-display {
  margin: 0.5em 0 !important;
}
</style>

