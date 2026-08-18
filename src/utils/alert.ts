import { ref } from 'vue';
import { playButtonSound, playCoinSound, playErrorSound, playVictorySound } from '../lib/audio';

export type AlertType = 'warning' | 'success' | 'info' | 'coin' | 'error' | 'delete';

export interface AlertOptions {
  title?: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export const alertState = ref({
  isOpen: false,
  title: '提示',
  message: '',
  type: 'info' as AlertType,
  confirmText: '我知道啦',
  cancelText: '取消',
  showCancel: false,
  resolvePromise: null as ((val: boolean) => void) | null
});

/**
 * 弹出少儿卡通萌趣提示弹窗 (替换浏览器原生丑陋的 alert)
 */
export function showAlert(options: string | AlertOptions): Promise<boolean> {
  return new Promise((resolve) => {
    let opts: AlertOptions;
    if (typeof options === 'string') {
      opts = { message: options, type: 'info' };
    } else {
      opts = options;
    }

    const type = opts.type || 'info';

    // Play appropriate sound
    if (type === 'coin') playCoinSound();
    else if (type === 'success') playVictorySound();
    else if (type === 'warning' || type === 'error') playErrorSound();
    else playButtonSound();

    alertState.value = {
      isOpen: true,
      title: opts.title || (type === 'coin' ? '金币小提示' : type === 'warning' || type === 'error' ? '温馨提示' : type === 'success' ? '太棒啦' : '导师提醒'),
      message: opts.message,
      type,
      confirmText: opts.confirmText || '我知道啦 🌟',
      cancelText: '取消',
      showCancel: false,
      resolvePromise: resolve
    };
  });
}

/**
 * 弹出少儿卡通萌趣确认弹窗 (替换浏览器原生 confirm)
 */
export function showConfirm(options: AlertOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const type = options.type || 'warning';
    playButtonSound();

    alertState.value = {
      isOpen: true,
      title: options.title || '确认提示',
      message: options.message,
      type,
      confirmText: options.confirmText || '确定',
      cancelText: options.cancelText || '再想想',
      showCancel: true,
      resolvePromise: resolve
    };
  });
}

export function handleAlertConfirm() {
  playButtonSound();
  alertState.value.isOpen = false;
  if (alertState.value.resolvePromise) {
    alertState.value.resolvePromise(true);
    alertState.value.resolvePromise = null;
  }
}

export function handleAlertCancel() {
  playButtonSound();
  alertState.value.isOpen = false;
  if (alertState.value.resolvePromise) {
    alertState.value.resolvePromise(false);
    alertState.value.resolvePromise = null;
  }
}

