import { ref } from 'vue';

export const isSpeaking = ref(false);

/**
 * 🐼 少儿高拟真伴学语音引擎 (Kid-Friendly Speech Companion Engine)
 * 深度兼容 Chrome、Safari、Edge、iOS Webview 及各类安卓浏览器的自动播放策略与垃圾回收机制。
 */
export class SpeechCompanion {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static cachedVoice: SpeechSynthesisVoice | null = null;
  private static isInitialized = false;
  private static keepAliveTimer: ReturnType<typeof setInterval> | null = null;

  public static init() {
    if (this.isInitialized || !this.synth) return;
    this.isInitialized = true;

    // 1. 用户首次交互（点击/触摸）自动激活唤醒浏览器语音上下文
    const unlockAudio = () => {
      if (this.synth) {
        try {
          this.synth.resume();
        } catch (e) {
          // ignore
        }
      }
      if (typeof document !== 'undefined') {
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('pointerdown', unlockAudio);
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('click', unlockAudio, { passive: true });
      document.addEventListener('touchstart', unlockAudio, { passive: true });
      document.addEventListener('pointerdown', unlockAudio, { passive: true });
    }

    // 2. 异步监听语音列表就绪事件
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => {
        this.selectBestVoice();
      };
    }
    this.selectBestVoice();

    // 3. 页面隐藏或切后台时立即静音，保护用户体验
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stop();
        }
      });
    }
  }

  /**
   * 优先匹配最自然甜美的高音质中文人声
   */
  public static selectBestVoice(): SpeechSynthesisVoice | null {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return null;

    // 优先匹配少儿最喜爱的甜美/童趣/亲切中文人声
    const preferredNames = [
      'Xiaoxiao', // 微软晓晓（最甜美的少儿/播报人声）
      'Yunxi',    // 微软云希（少年音）
      'Xiaoyi',   // 微软晓伊
      'Tingting', // 苹果婷婷
      'Mei-Jia',  // 苹果美佳
      'Sin-Ji',   // 苹果善怡
      'Google 普通话',
      'Natural',
      'Chinese',
      'zh-CN'
    ];

    for (const name of preferredNames) {
      const match = voices.find(
        v =>
          (v.name.includes(name) || v.lang.includes(name)) &&
          (v.lang.startsWith('zh') || v.lang.startsWith('cmn'))
      );
      if (match) {
        this.cachedVoice = match;
        return match;
      }
    }

    // 降级匹配任意中文人声
    const fallback = voices.find(v => v.lang.startsWith('zh') || v.lang.startsWith('cmn'));
    this.cachedVoice = fallback || voices[0] || null;
    return this.cachedVoice;
  }

  /**
   * 语意自然清洗与分词断句处理（让语音如真人般亲切抑扬顿挫）
   */
  private static formatSpokenText(text: string): string {
    return text
      // 移除 Emoji 和特殊图标符号
      .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      // 移除特殊标签括号
      .replace(/【|】|📖|🎯|⭐|🐼|🦁|🚀|⚔️|🏰|⚡|🔄|❤️|🛡️|🪙|🏆|🌸|🎉|✨|🐶|🐱|🦊/g, '')
      // 将英文括号术语如 (Hoshi) 移除，保留纯正中文语音流
      .replace(/\([a-zA-Z\s\-']+\)/g, '')
      // 将棋盘坐标如 C3、B4、D1 分词为 "C 3"、"B 4"，防止读成英文单词
      .replace(/([A-Ta-t])([1-9]|1[0-9])/g, '$1 $2 ')
      // 适度增加呼吸停顿
      .replace(/！+/g, '！ ')
      .replace(/，+/g, '， ')
      .replace(/~+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * 播放小诺伴学语音朗读
   */
  public static speak(text: string, onEnd?: () => void) {
    if (!this.synth) return;

    this.init();
    this.stop();

    const spokenText = this.formatSpokenText(text);
    if (!spokenText) return;

    try {
      const utter = new SpeechSynthesisUtterance(spokenText);
      utter.lang = 'zh-CN';

      // 优化后的拟真温和语速与童趣音高（饱满甜美，绝无机械电音）
      utter.rate = 1.02;
      utter.pitch = 1.1;
      utter.volume = 1.0;

      const voice = this.cachedVoice || this.selectBestVoice();
      if (voice) {
        utter.voice = voice;
      }

      // 🔴 挂载到全局强引用，彻底杜绝 Chrome V8 垃圾回收导致的“播放一半无声音” Bug
      if (typeof window !== 'undefined') {
        (window as any)._activeSpeechUtterance = utter;
      }

      utter.onstart = () => {
        isSpeaking.value = true;
      };

      utter.onend = () => {
        isSpeaking.value = false;
        this.clearKeepAlive();
        if (typeof window !== 'undefined') {
          (window as any)._activeSpeechUtterance = null;
        }
        if (onEnd) onEnd();
      };

      utter.onerror = () => {
        isSpeaking.value = false;
        this.clearKeepAlive();
        if (typeof window !== 'undefined') {
          (window as any)._activeSpeechUtterance = null;
        }
      };

      // 🔴 Chrome 唤醒与防丢帧延迟调用
      this.synth.resume();

      setTimeout(() => {
        if (this.synth) {
          this.synth.resume();
          this.synth.speak(utter);
          this.startKeepAlive();
        }
      }, 30);
    } catch (e) {
      isSpeaking.value = false;
    }
  }

  /**
   * 🔴 Chrome 长句 15 秒保活机制
   */
  private static startKeepAlive() {
    this.clearKeepAlive();
    this.keepAliveTimer = setInterval(() => {
      if (this.synth && isSpeaking.value) {
        this.synth.pause();
        this.synth.resume();
      }
    }, 8000);
  }

  private static clearKeepAlive() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  /**
   * 停止当前朗读
   */
  public static stop() {
    this.clearKeepAlive();
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        // ignore
      }
      isSpeaking.value = false;
      if (typeof window !== 'undefined') {
        (window as any)._activeSpeechUtterance = null;
      }
    }
  }

  /**
   * 切换播放/停止
   */
  public static toggle(text: string) {
    if (isSpeaking.value) {
      this.stop();
    } else {
      this.speak(text);
    }
  }
}

// Global hook
if (typeof window !== 'undefined') {
  SpeechCompanion.init();
}

export const speakText = (text: string) => SpeechCompanion.speak(text);
export const stopSpeech = () => SpeechCompanion.stop();
export const toggleSpeech = (text: string) => SpeechCompanion.toggle(text);

