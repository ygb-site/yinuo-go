import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLoadingStore = defineStore('loadingStore', () => {
  const isLoading = ref(false);
  const loadingProgress = ref(0);
  const loadingText = ref('小诺正在准备棋盘中...');
  let timer: any = null;

  const startLoading = (text = '小诺正在准备精彩关卡中...') => {
    loadingText.value = text;
    isLoading.value = true;
    loadingProgress.value = 15;
    if (timer) clearInterval(timer);

    timer = setInterval(() => {
      if (loadingProgress.value < 85) {
        loadingProgress.value += Math.floor(Math.random() * 15) + 5;
      }
    }, 100);
  };

  const finishLoading = () => {
    loadingProgress.value = 100;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    setTimeout(() => {
      isLoading.value = false;
      loadingProgress.value = 0;
    }, 250);
  };

  return {
    isLoading,
    loadingProgress,
    loadingText,
    startLoading,
    finishLoading
  };
});

