export interface PronunciationEvaluationResult {
  score: number;        // 0 ~ 100
  isPassed: boolean;    // >= 70
  feedback: string;
  matchedText: string;
}

export interface SpeechRecognitionOptions {
  lang?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export interface SpeechProvider {
  speak(text: string, options?: { lang?: string; rate?: number; pitch?: number }): Promise<void>;
  stop(): void;
  isRecognitionSupported(): boolean;
  startRecognition(options: SpeechRecognitionOptions): { stop: () => void };
}

export class WebSpeechProvider implements SpeechProvider {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentRecognition: any = null;

  public speak(text: string, options: { lang?: string; rate?: number; pitch?: number } = {}): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        console.warn('[WebSpeechProvider] speechSynthesis not supported in this browser.');
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang || (/[a-zA-Z]/.test(text) && !/[\u4e00-\u9fa5]/.test(text) ? 'en-US' : 'zh-CN');
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 1.05;

      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (err) => {
        console.warn('[WebSpeechProvider] Speak Error:', err);
        this.currentUtterance = null;
        resolve();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    });
  }

  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (this.currentUtterance) {
        this.currentUtterance = null;
      }
      window.speechSynthesis.cancel();
    }
    if (this.currentRecognition) {
      try {
        this.currentRecognition.stop();
      } catch (err) {
        // ignore
      }
      this.currentRecognition = null;
    }
  }

  public isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public startRecognition(options: SpeechRecognitionOptions): { stop: () => void } {
    if (!this.isRecognitionSupported()) {
      if (options.onError) options.onError('当前浏览器环境不支持麦克风语音识别，请使用 Chrome 或 Edge 浏览器体验。');
      return { stop: () => {} };
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRec();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = options.lang || 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const text = (finalTranscript || interimTranscript).trim();
      if (options.onResult && text) {
        options.onResult(text, Boolean(finalTranscript));
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('[SpeechRecognition] Error:', event.error);
      if (options.onError) {
        options.onError(event.error === 'not-allowed' ? '请允许麦克风录音权限哦！' : '识别遇到了一点小问题，请再试一次');
      }
    };

    recognition.onend = () => {
      this.currentRecognition = null;
      if (options.onEnd) options.onEnd();
    };

    try {
      recognition.start();
      this.currentRecognition = recognition;
    } catch (err: any) {
      if (options.onError) options.onError(err?.message || '无法启动录音麦克风');
    }

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }
}

export function calculateKidWordSimilarity(spoken: string, target: string): number {
  const s = spoken.toLowerCase().replace(/[^a-z0-9]/g, '');
  const t = target.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (!s || !t) return 0;
  if (s === t) return 100;
  if (s.includes(t) || t.includes(s)) {
    return Math.round((Math.min(s.length, t.length) / Math.max(s.length, t.length)) * 95);
  }

  const m = s.length;
  const n = t.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s[i - 1] === t[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + 1);
      }
    }
  }

  const dist = dp[m][n];
  const maxLen = Math.max(m, n);
  const similarity = Math.max(0, Math.round(((maxLen - dist) / maxLen) * 100));
  return similarity;
}

export class SpeechService {
  private static provider: SpeechProvider = new WebSpeechProvider();

  public static setProvider(customProvider: SpeechProvider) {
    this.provider = customProvider;
  }

  public static speak(text: string, options?: { lang?: string; rate?: number; pitch?: number }): Promise<void> {
    return this.provider.speak(text, options);
  }

  public static stop(): void {
    this.provider.stop();
  }

  public static isRecognitionSupported(): boolean {
    return this.provider.isRecognitionSupported();
  }

  public static startRecognition(options: SpeechRecognitionOptions): { stop: () => void } {
    return this.provider.startRecognition(options);
  }

  public static evaluatePronunciation(spokenText: string, targetWord: string): PronunciationEvaluationResult {
    const score = calculateKidWordSimilarity(spokenText, targetWord);
    const isPassed = score >= 70;

    let feedback = '';
    if (score >= 90) {
      feedback = '🌟 发音非常地道标准！棒极啦！';
    } else if (score >= 70) {
      feedback = '👍 读得不错！继续大声练习！';
    } else if (score >= 40) {
      feedback = '💪 很接近了，注意听听标准发音再读一遍！';
    } else {
      feedback = '👂 没有听清楚哦，张大嘴巴再读一次吧！';
    }

    return {
      score,
      isPassed,
      feedback,
      matchedText: spokenText
    };
  }
}

