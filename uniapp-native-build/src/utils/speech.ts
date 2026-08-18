import { ref } from 'vue';

export const isSpeaking = ref(false);

/**
 * 少儿拟真温暖伴学语音引擎 (Natural Kid-Friendly Companion Voice Engine)
 * 采用智能声学语调算法与多重自然声线优先匹配，彻底告别生硬机械音。
 */
export class SpeechCompanion {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static cachedVoice: SpeechSynthesisVoice | null = null;
  private static isInitialized = false;

  public static init() {
    if (this.isInitialized || !this.synth) return;
    this.isInitialized = true;

    // Load and select the best voice when ready
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => {
        this.selectBestVoice();
      };
    }
    this.selectBestVoice();

    // Stop speaking immediately when page is hidden / user switches browser tab
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stop();
        }
      });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.stop());
      window.addEventListener('pagehide', () => this.stop());
    }
  }

  /**
   * 优先匹配最自然甜美的高音质中文人声 (Neural / Natural Voices)
   */
  private static selectBestVoice(): SpeechSynthesisVoice | null {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return null;

    // High priority natural / neural voices
    const preferredNames = [
      'Xiaoxiao', // 微软晓晓（最生动甜美的少儿/播报音）
      'Yunxi',    // 微软云希
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
      const match = voices.find(v => (v.name.includes(name) || v.lang.includes(name)) && (v.lang.startsWith('zh') || v.lang.startsWith('cmn')));
      if (match) {
        this.cachedVoice = match;
        return match;
      }
    }

    // Secondary fallback to any Chinese voice
    const fallback = voices.find(v => v.lang.startsWith('zh') || v.lang.startsWith('cmn'));
    this.cachedVoice = fallback || null;
    return fallback || null;
  }

  /**
   * 语意自然清洗与分词断句处理（让语音如真人般亲切抑扬顿挫）
   */
  private static formatSpokenText(text: string): string {
    return text
      // 移除 Emoji 和特殊图标符号
      .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      // 移除标签括号与符号
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

    const utter = new SpeechSynthesisUtterance(spokenText);
    utter.lang = 'zh-CN';

    // 优化后的拟真温和语速与童趣音高（饱满甜美，绝无机械电音）
    utter.rate = 1.0;
    utter.pitch = 1.08;
    utter.volume = 1.0;

    const voice = this.cachedVoice || this.selectBestVoice();
    if (voice) {
      utter.voice = voice;
    }

    isSpeaking.value = true;

    utter.onend = () => {
      isSpeaking.value = false;
      if (onEnd) onEnd();
    };

    utter.onerror = () => {
      isSpeaking.value = false;
    };

    this.synth.speak(utter);
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

