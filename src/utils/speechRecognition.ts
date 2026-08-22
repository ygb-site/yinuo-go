import { ref } from 'vue';

export const isSpeechRecognitionSupported = ref(
  typeof window !== 'undefined' &&
  Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
);

export const isListening = ref(false);
export const transcriptText = ref('');
export const recognitionError = ref('');

let recognitionInstance: any = null;

export function startSpeechRecognition(
  onResult: (text: string, isFinal: boolean) => void,
  onEnd?: () => void,
  onError?: (err: string) => void
) {
  if (typeof window === 'undefined') return;

  const SpeechRecognitionClass =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognitionClass) {
    recognitionError.value = '当前浏览器暂不支持语音识别，请直接点击下方的快捷提问标签哦！';
    if (onError) onError(recognitionError.value);
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
      if (event.error === 'not-allowed') {
        recognitionError.value = '请允许麦克风权限，以便小诺听到你的声音哦！';
      } else if (event.error === 'no-speech') {
        recognitionError.value = '没有听到声音，请离麦克风近一点再试一次哦！';
      } else {
        recognitionError.value = '语音识别暂不可用，你可以直接点击常用提问标签！';
      }
      isListening.value = false;
      if (onError) onError(recognitionError.value);
    };

    recognitionInstance.onend = () => {
      isListening.value = false;
      if (onEnd) onEnd();
    };

    recognitionInstance.start();
  } catch (err: any) {
    console.error('[STT] Failed to start recognition:', err);
    isListening.value = false;
    recognitionError.value = '麦克风启动失败，请直接点击下方常用问题！';
    if (onError) onError(recognitionError.value);
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
