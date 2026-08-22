
import { ref } from 'vue';

export const isSpeechRecognitionSupported = ref(
  typeof window !== 'undefined' &&
  Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
);

export const isListening = ref(false);
export const transcriptText = ref('');
export const recognitionError = ref('');

let recognitionInstance: any = null;
let startTimestamp = 0;

/**
 * 主动拉取浏览器/系统麦克风原生授权弹窗 (Active Microphone Permission Request)
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return false;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // 成功获取权限后立即释放音频流轨道
    stream.getTracks().forEach(track => {
      try {
        track.stop();
      } catch {}
    });
    return true;
  } catch (err: any) {
    console.warn('[STT] getUserMedia permission request error:', err);
    return false;
  }
}

/**
 * 启动语音识别（若权限受限会自动尝试主动拉起授权）
 */
export async function startSpeechRecognition(
  onResult: (text: string, isFinal: boolean) => void,
  onEnd?: () => void,
  onError?: (err: string) => void
) {
  if (typeof window === 'undefined') return;

  const SpeechRecognitionClass =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognitionClass) {
    const err = '当前手机浏览器暂不支持网页直连语音识别，建议直接点击常用提问卡片，或使用手机键盘自带的麦克风语音输入哦！';
    recognitionError.value = err;
    if (onError) onError(err);
    return;
  }

  // 1. 主动检查/拉起麦克风授权 (唤起浏览器系统级权限弹窗)
  try {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      const hasPerm = await requestMicrophonePermission();
      if (!hasPerm) {
        // 如果拉取失败或被用户点击拒绝
        const msg = '麦克风权限未开启。请在弹出的系统对话框中点击“允许”，或在浏览器设置中开启麦克风权限！';
        recognitionError.value = msg;
        if (onError) onError(msg);
        return;
      }
    }
  } catch (e) {
    console.warn('[STT] Pre-permission check skipped:', e);
  }

  try {
    if (recognitionInstance) {
      try {
        recognitionInstance.abort();
      } catch {}
    }

    recognitionInstance = new SpeechRecognitionClass();
    recognitionInstance.lang = 'zh-CN';
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = true;
    recognitionInstance.maxAlternatives = 1;

    recognitionError.value = '';
    transcriptText.value = '';
    isListening.value = true;
    startTimestamp = Date.now();

    recognitionInstance.onstart = () => {
      isListening.value = true;
    };

    recognitionInstance.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i];
        if (res.isFinal) {
          final += res[0].transcript;
        } else {
          interim += res[0].transcript;
        }
      }

      const current = final || interim;
      transcriptText.value = current;
      onResult(current, Boolean(final));
    };

    recognitionInstance.onerror = async (event: any) => {
      console.warn('[STT] Speech recognition error:', event.error);
      const elapsed = Date.now() - startTimestamp;
      isListening.value = false;

      let msg = '';
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        // 权限受限时，再次尝试主动拉取授权
        msg = '麦克风权限受限。请在浏览器弹窗中点击“允许”，或在地址栏权限设置中开启麦克风！';
      } else if (event.error === 'network') {
        msg = '手机浏览器语音云通道受限，建议直接点击下方快捷提问卡片，或使用手机输入法键盘自带的麦克风语音转文字！';
      } else if (event.error === 'no-speech') {
        if (elapsed < 800) {
          msg = '未检测到声音，建议离麦克风近一点再试一次，或点击下方快捷问题卡片！';
        } else {
          msg = '小诺刚才没听清楚，请再试一次哦！';
        }
      } else {
        msg = '语音识别暂不可用，请使用键盘输入或点击下方快捷提问卡片！';
      }

      recognitionError.value = msg;
      if (onError) onError(msg);
    };

    recognitionInstance.onend = () => {
      isListening.value = false;
      if (onEnd) onEnd();
    };

    recognitionInstance.start();
  } catch (err: any) {
    console.error('[STT] Failed to start recognition:', err);
    isListening.value = false;
    const msg = '麦克风启动失败，请点击下方快捷卡片提问！';
    recognitionError.value = msg;
    if (onError) onError(msg);
  }
}

export function stopSpeechRecognition() {
  if (recognitionInstance) {
    try {
      recognitionInstance.stop();
    } catch {}
  }
  isListening.value = false;
}

