
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

export function startSpeechRecognition(
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

    recognitionInstance.onerror = (event: any) => {
      console.warn('[STT] Speech recognition error:', event.error);
      const elapsed = Date.now() - startTimestamp;
      isListening.value = false;

      let msg = '';
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        msg = '麦克风权限未开启。请在浏览器设置中允许麦克风权限，或使用手机键盘自带的语音输入！';
      } else if (event.error === 'network') {
        msg = '手机浏览器语音服务连接受限，建议直接点击下方提问卡片，或使用手机输入法键盘自带的麦克风！';
      } else if (event.error === 'no-speech') {
        // 如果极短时间就报 no-speech，通常是移动端没有真正采集到声音
        if (elapsed < 800) {
          msg = '未检测到声音，建议离麦克风近一点，或点击下方快捷问题卡片！';
        } else {
          msg = '小诺刚才没听清楚，请再试一次哦！';
        }
      } else {
        msg = '语音识别通道受限，请使用键盘输入或点击下方快捷提问卡片！';
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

