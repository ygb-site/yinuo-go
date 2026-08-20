import { ref } from 'vue';

export const isSpeaking = ref(false);
/** 页面喇叭开关。只控制朗读，不影响落子音效。 */
export const speechPlaybackEnabled = ref(true);

const MAX_CHUNK_LEN = 80;

/**
 * 伴读语音合成引擎 (小诺萌宠童声)
 * 采用 Web Speech API 结合高频甜美音调调校 (Pitch 1.38 / Rate 0.98)，
 * 智能挑选最优质的中文童声与自然语音 (如云希/晓晓/晓伊/康康/婷婷/MeiJia等)，
 * 在不支持或异常时无缝降级，提供生动、活泼、充满童趣的伴读体验。
 */
export class SpeechCompanion {
  private static player: HTMLAudioElement | null = null;
  private static speakToken = 0;
  private static cachedVoices: SpeechSynthesisVoice[] = [];
  private static isInitialized = false;

  public static init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        try {
          this.cachedVoices = window.speechSynthesis.getVoices() || [];
        } catch {
          this.cachedVoices = [];
        }
      };
      loadVoices();
      if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }

  public static formatSpokenText(text: string): string {
    return text
      .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      .replace(/【|】|📖|🎯|⭐|🐼|🦁|🚀|⚔️|🏰|⚡|🔄|❤️|🛡️|🪙|🏆|🌸|🎉|✨|🐶|🐱|🦊|🦄/g, '')
      .replace(/\([a-zA-Z\s\-']+\)/g, '')
      .replace(/([A-Ta-t])([1-9]|1[0-9])/g, '$1 $2 ')
      .replace(/！+/g, '！ ')
      .replace(/，+/g, '， ')
      .replace(/~+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  public static setPlaybackEnabled(enabled: boolean) {
    speechPlaybackEnabled.value = enabled;
    if (!enabled) this.stop();
  }

  /** 获取最适合小诺萌宠角色的可爱童声/自然中文发音人 */
  private static pickCuteChineseVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

    if (this.cachedVoices.length === 0) {
      try {
        this.cachedVoices = window.speechSynthesis.getVoices() || [];
      } catch {
        this.cachedVoices = [];
      }
    }

    const voices = this.cachedVoices;
    if (!voices || voices.length === 0) return null;

    // 优先级 1: 可爱/童声/自然中文发音人 (如微软云希、晓晓、晓伊、康康，苹果婷婷、美嘉，Google等)
    const cuteKeywords = [
      'yunxi',     // 微软云希 (极萌男童声)
      'xiaoxiao',  // 微软晓晓 (活泼自然少女)
      'xiaoyi',    // 微软晓伊 (甜美童音)
      'kangkang',  // 微软康康 (阳光男童)
      'yaoyao',    // 微软瑶瑶
      'tingting',  // 苹果婷婷 (清脆甜美)
      'sin-ji',    // 苹果粤/中
      'meijia',    // 苹果美嘉
      'natural',   // 各种自然语音
      'cmn-hans-cn'
    ];

    for (const kw of cuteKeywords) {
      const matched = voices.find(
        (v) =>
          (v.lang.includes('zh') || v.lang.includes('cmn')) &&
          v.name.toLowerCase().includes(kw)
      );
      if (matched) return matched;
    }

    // 优先级 2: 任意 zh-CN / cmn 优先发音人
    const zhVoice = voices.find(
      (v) =>
        v.lang === 'zh-CN' ||
        v.lang === 'zh_CN' ||
        v.lang === 'cmn-Hans-CN' ||
        v.lang.startsWith('zh') ||
        v.lang.startsWith('cmn')
    );
    if (zhVoice) return zhVoice;

    return null;
  }

  public static speak(text: string, onEnd?: () => void) {
    if (!speechPlaybackEnabled.value) return;
    this.init();

    const spokenText = this.formatSpokenText(text);
    if (!spokenText) return;

    this.stop();
    const token = ++this.speakToken;
    isSpeaking.value = true;

    // 方案 A: 优先使用 Web Speech API 调校出超可爱的萌宠童声
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const chunks = this.splitIntoChunks(spokenText);
        this.speakWithSpeechSynthesis(chunks, 0, token, onEnd);
        return;
      } catch (err) {
        console.warn('SpeechSynthesis failed, falling back to audio stream', err);
      }
    }

    // 方案 B: 降级走音频流播放
    this.playAudioChunks(this.splitIntoChunks(spokenText), 0, token, onEnd);
  }

  /** 使用 Web Speech API 朗读小诺萌音 */
  private static speakWithSpeechSynthesis(
    chunks: string[],
    index: number,
    token: number,
    onEnd?: () => void
  ) {
    if (token !== this.speakToken || !speechPlaybackEnabled.value) {
      this.finish(token, onEnd);
      return;
    }

    if (index >= chunks.length) {
      this.finish(token, onEnd);
      return;
    }

    const chunk = chunks[index];
    const utterance = new SpeechSynthesisUtterance(chunk);

    // 关键萌宠参数调校：提升音调至 1.38 (萌系童音)，语速 0.98 (清晰活泼)
    utterance.pitch = 1.38;
    utterance.rate = 0.98;
    utterance.volume = 1.0;

    const voice = this.pickCuteChineseVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || 'zh-CN';
    } else {
      utterance.lang = 'zh-CN';
    }

    utterance.onend = () => {
      if (token === this.speakToken) {
        this.speakWithSpeechSynthesis(chunks, index + 1, token, onEnd);
      }
    };

    utterance.onerror = () => {
      // 若遇到错误降级到音频播放
      if (token === this.speakToken) {
        this.playAudioChunks(chunks, index, token, onEnd);
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  /** 本地开发走 Vite 同源代理；线上走百度 TTS 降级 */
  private static buildTtsUrl(text: string): string {
    const encoded = encodeURIComponent(text);
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        return '/api/tts?text=' + encoded;
      }
    }
    // 语速 5，清脆轻快
    return 'https://fanyi.baidu.com/gettts?lan=zh&spd=5&source=web&text=' + encoded;
  }

  /** 音频降级分段播放 */
  private static playAudioChunks(chunks: string[], index: number, token: number, onEnd?: () => void) {
    if (token !== this.speakToken || !speechPlaybackEnabled.value) {
      this.finish(token, onEnd);
      return;
    }
    if (index >= chunks.length) {
      this.finish(token, onEnd);
      return;
    }

    const audio = document.createElement('audio');
    audio.setAttribute('referrerpolicy', 'no-referrer');
    audio.preload = 'auto';
    // 调快音频播放速率，使声音更欢快活泼
    audio.playbackRate = 1.12;
    audio.src = this.buildTtsUrl(chunks[index]);
    this.player = audio;

    audio.onended = () => this.playAudioChunks(chunks, index + 1, token, onEnd);
    audio.onerror = () => this.finish(token, onEnd);

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => this.finish(token, onEnd));
    }
  }

  private static splitIntoChunks(text: string): string[] {
    const strongBreaks = '。！？；!?;';
    const weakBreaks = '，,、 ';
    const chunks: string[] = [];
    let buffer = '';

    const flush = () => {
      const trimmed = buffer.trim();
      if (trimmed) chunks.push(trimmed);
      buffer = '';
    };

    for (const char of text) {
      buffer += char;
      if (buffer.length >= MAX_CHUNK_LEN) {
        flush();
        continue;
      }
      if (buffer.length >= 35 && weakBreaks.includes(char)) {
        flush();
        continue;
      }
      if (buffer.length >= 14 && strongBreaks.includes(char)) {
        flush();
      }
    }
    flush();
    return chunks.length > 0 ? chunks : [text];
  }

  private static finish(token: number, onEnd?: () => void) {
    if (token !== this.speakToken) return;
    isSpeaking.value = false;
    this.player = null;
    if (onEnd) onEnd();
  }

  private static haltPlayback() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    if (!this.player) return;
    this.player.onended = null;
    this.player.onerror = null;
    try {
      this.player.pause();
      this.player.removeAttribute('src');
      this.player.load();
    } catch {
      // ignore
    }
    this.player = null;
  }

  public static stop() {
    this.speakToken++;
    this.haltPlayback();
    isSpeaking.value = false;
  }

  public static toggle(text: string) {
    if (!speechPlaybackEnabled.value) return;
    if (isSpeaking.value) {
      this.stop();
      return;
    }
    this.speak(text);
  }
}

export const speakText = (text: string) => SpeechCompanion.speak(text);
export const stopSpeech = () => SpeechCompanion.stop();
export const toggleSpeech = (text: string) => SpeechCompanion.toggle(text);
