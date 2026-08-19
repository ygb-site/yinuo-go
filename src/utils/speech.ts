import { ref } from 'vue';

export const isSpeaking = ref(false);

/**
 * 🐼 少儿拟真温暖伴学语音引擎 (Kid-Friendly Speech Companion Engine)
 * 采用稳定健壮的 Web Speech API 驱动，深度修复 Chrome/Safari/Edge 声音中断与假死问题。
 */
export class SpeechCompanion {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static cachedVoice: SpeechSynthesisVoice | null = null;
  private static isInitialized = false;

  public static init() {
    if (this.isInitialized || !this.synth) return;
    this.isInitialized = true;

    // 1. 监听语音列表就绪事件
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => {
        this.selectBestVoice();
      };
    }
    this.selectBestVoice();

    // 2. 页面可见性监听（切后台静音）
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

    const preferredNames = [
      'Xiaoxiao', // 微软晓晓
      'Yunxi',    // 微软云希
      'Xiaoyi',   // 微软晓伊
      'Tingting', // 苹果婷婷
      'Mei-Jia',  // 苹果美佳
      'Sin-Ji',   // 苹果善怡
      'Google 普通话',
      'Natural',
      'Chinese',
      'zh-CN',
      'zh_CN'
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

    const fallback = voices.find(v => v.lang.startsWith('zh') || v.lang.startsWith('cmn'));
    this.cachedVoice = fallback || voices[0] || null;
    return this.cachedVoice;
  }

  /**
   * 语意自然清洗与分词断句处理
   */
  public static formatSpokenText(text: string): string {
    return text
      // 移除 Emoji 和特殊图标符号
      .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      // 移除特殊标签括号与符号
      .replace(/【|】|📖|🎯|⭐|🐼|🦁|🚀|⚔️|🏰|⚡|🔄|❤️|🛡️|🪙|🏆|🌸|🎉|✨|🐶|🐱|🦊/g, '')
      // 将英文括号术语移除，保留中文发音
      .replace(/\([a-zA-Z\s\-']+\)/g, '')
      // 将棋盘坐标如 C3、B4 分词为 "C 3"、"B 4"
      .replace(/([A-Ta-t])([1-9]|1[0-9])/g, '$1 $2 ')
      // 适度增加呼吸停顿
      .replace(/！+/g, '！ ')
      .replace(/，+/g, '， ')
      .replace(/~+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * 播放小诺伴学语音朗读（确保点击 100% 发声）
   */
  public static speak(text: string, onEnd?: () => void) {
    if (!this.synth) return;

    this.init();

    const spokenText = this.formatSpokenText(text);
    if (!spokenText) return;

    try {
      // 1. 如果当前正在说话，先安全取消
      if (this.synth.speaking || this.synth.pending) {
        this.synth.cancel();
      }

      // 2. 唤醒浏览器音频通道
      if (this.synth.paused) {
        this.synth.resume();
      }

      const utter = new SpeechSynthesisUtterance(spokenText);
      utter.lang = 'zh-CN';
      utter.rate = 1.0;
      utter.pitch = 1.08;
      utter.volume = 1.0;

      const voice = this.cachedVoice || this.selectBestVoice();
      if (voice) {
        utter.voice = voice;
      }

      // 🔴 关键防丢帧：全局强引用防止 Chrome 垃圾回收机制回收 utterance
      if (typeof window !== 'undefined') {
        (window as any)._activeSpeechUtterance = utter;
      }

      // 🔴 只有在真正开始说话时才置为 true，绝不提前假死
      utter.onstart = () => {
        isSpeaking.value = true;
      };

      utter.onend = () => {
        isSpeaking.value = false;
        if (typeof window !== 'undefined') {
          (window as any)._activeSpeechUtterance = null;
        }
        if (onEnd) onEnd();
      };

      utter.onerror = () => {
        isSpeaking.value = false;
        if (typeof window !== 'undefined') {
          (window as any)._activeSpeechUtterance = null;
        }
      };

      // 🔴 关键修复：Chrome 在 cancel 后需要微小间隔（10ms）再 speak，否则 Chrome 内核会吞掉刚投递的 utterance
      setTimeout(() => {
        if (this.synth) {
          this.synth.resume();
          this.synth.speak(utter);
        }
      }, 10);
    } catch (e) {
      isSpeaking.value = false;
    }
  }

  /**
   * 停止当前朗读
   */
  public static stop() {
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

