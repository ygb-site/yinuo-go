import { ref } from 'vue';

export const isSpeaking = ref(false);
/** 页面喇叭开关。只控制朗读，不影响落子音效。 */
export const speechPlaybackEnabled = ref(true);

const MAX_NATURAL_CHUNK_LEN = 160;

/**
 * 伴读高保真自然人声语音引擎
 * 采用原生 Web Speech API 神经网络/自然声发音人，
 * 保持原生音高（Pitch 1.0，防止失真变电音）与自然舒缓语速（Rate 0.95），
 * 完整句子连贯朗读，杜绝短句机械顿挫感与粤语混淆。
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
      .replace(/[🌀-🧿]|[☀-⛿]|[✀-➿]/gu, '')
      .replace(/【|】|📖|🎯|⭐|🐼|🦁|🚀|⚔️|🏰|⚡|🔄|❤️|🛡️|🪙|🏆|🌸|🎉|✨|🐶|🐱|🦊|🦄|👧|👦|🎓|🌟|🧚|🐰/g, '')
      .replace(/\([a-zA-Z\s\-']+\)/g, '')
      .replace(/([A-Ta-t])([1-9]|1[0-9])/g, '$1 $2 ')
      .replace(/！+/g, '！')
      .replace(/，+/g, '，')
      .replace(/~+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  public static setPlaybackEnabled(enabled: boolean) {
    speechPlaybackEnabled.value = enabled;
    if (!enabled) this.stop();
  }

  /**
   * 判断是否为粤语或非普通话方言（严格过滤）
   */
  private static isDialectOrCantonese(voice: SpeechSynthesisVoice): boolean {
    const lang = (voice.lang || '').toLowerCase();
    const name = (voice.name || '').toLowerCase();

    // 严禁任何粤语 (zh-HK, zh-MO, yue, cantonese, sin-ji 善芝, hiu-mou, cheung)
    if (
      lang.includes('hk') ||
      lang.includes('mo') ||
      lang.includes('yue') ||
      name.includes('hk') ||
      name.includes('hong kong') ||
      name.includes('cantonese') ||
      name.includes('sin-ji') ||
      name.includes('sinji') ||
      name.includes('hiugaai') ||
      name.includes('hiumou') ||
      name.includes('cheung')
    ) {
      return true;
    }

    // 过滤台湾腔 (zh-TW, meijia, hanhan, zhiwei)
    if (lang.includes('tw') || name.includes('taiwan') || name.includes('meijia') || name.includes('hanhan')) {
      return true;
    }

    return false;
  }

  /** 优先锁定高质量自然人声/神经声音 (如苹果 Siri普通话/婷婷/玉舒、微软云希/晓晓/康康等) */
  private static pickNaturalVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

    if (this.cachedVoices.length === 0) {
      try {
        this.cachedVoices = window.speechSynthesis.getVoices() || [];
      } catch {
        this.cachedVoices = [];
      }
    }

    const allVoices = this.cachedVoices;
    if (!allVoices || allVoices.length === 0) return null;

    // 1. 严格筛选出大陆普通话发音人
    const mandarinVoices = allVoices.filter((v) => {
      if (this.isDialectOrCantonese(v)) return false;
      const lang = (v.lang || '').toLowerCase();
      return (
        lang === 'zh-cn' ||
        lang === 'zh_cn' ||
        lang === 'cmn-hans-cn' ||
        lang === 'cmn-cn' ||
        lang === 'cmn-hans' ||
        lang === 'zh'
      );
    });

    if (mandarinVoices.length === 0) {
      const anyMandarin = allVoices.find(v => !this.isDialectOrCantonese(v) && v.lang.toLowerCase().startsWith('zh'));
      return anyMandarin || null;
    }

    // 2. 优先锁定自然度最高的高保真 Enhanced / Premium / Neural 人声
    const highQualityKeywords = [
      'enhanced',    // Apple Enhanced 高保真自然人声
      'premium',     // Apple Premium 旗舰人声
      'neural',      // 微软/各大平台 Neural 神经网络自然人声
      'online (natural)', // Edge 在线自然音
      'yunxi',       // 微软云希 (阳光少年男声 · 最优)
      'xiaoxiao',    // 微软晓晓 (自然甜美)
      'kangkang',    // 微软康康 (阳光男童)
      'yunjian',     // 微软云健 (朝气少年)
      'tingting',    // 苹果婷婷 (iOS 普通话标准音)
      'yushu',       // 苹果玉舒 (iOS 普通话标准音)
      'siri',        // 苹果 Siri 普通话
      'lili',        // 苹果莉莉
      'cmn-hans-cn'  // Google/Android 官方普通话
    ];

    for (const kw of highQualityKeywords) {
      const matched = mandarinVoices.find((v) => v.name.toLowerCase().includes(kw));
      if (matched) return matched;
    }

    return mandarinVoices[0] || null;
  }

  public static speak(text: string, onEnd?: () => void) {
    if (!speechPlaybackEnabled.value) return;
    this.init();

    const spokenText = this.formatSpokenText(text);
    if (!spokenText) return;

    this.stop();
    const token = ++this.speakToken;
    isSpeaking.value = true;

    // 方案 A: 优先使用系统原生 Web Speech API（自然音调与语速）
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const chunks = this.splitIntoNaturalChunks(spokenText);
        this.speakWithSpeechSynthesis(chunks, 0, token, onEnd);
        return;
      } catch (err) {
        console.warn('SpeechSynthesis failed, falling back to audio stream', err);
      }
    }

    // 方案 B: 降级走普通话音频流播放
    this.playAudioChunks(this.splitIntoNaturalChunks(spokenText), 0, token, onEnd);
  }

  /** 使用 Web Speech API 进行自然流畅朗读 */
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

    // 自然人声参数：保持原生音高 1.0 (防止电音失真)，语速 0.95 (亲切自然)
    utterance.pitch = 1.0;
    utterance.rate = 0.95;
    utterance.volume = 1.0;
    utterance.lang = 'zh-CN';

    const voice = this.pickNaturalVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || 'zh-CN';
    }

    utterance.onend = () => {
      if (token === this.speakToken) {
        this.speakWithSpeechSynthesis(chunks, index + 1, token, onEnd);
      }
    };

    utterance.onerror = () => {
      if (token === this.speakToken) {
        this.playAudioChunks(chunks, index, token, onEnd);
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  /** 本地开发走 Vite 同源代理；线上走百度 TTS 降级 (普通话) */
  private static buildTtsUrl(text: string): string {
    const encoded = encodeURIComponent(text);
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        return '/api/tts?text=' + encoded;
      }
    }
    return 'https://fanyi.baidu.com/gettts?lan=zh&spd=4&source=web&text=' + encoded;
  }

  /** 音频降级分段播放 */
  private static playAudioChunks(
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

    const audio = document.createElement('audio');
    audio.setAttribute('referrerpolicy', 'no-referrer');
    audio.preload = 'auto';
    audio.playbackRate = 1.0;
    audio.src = this.buildTtsUrl(chunks[index]);
    this.player = audio;

    audio.onended = () => this.playAudioChunks(chunks, index + 1, token, onEnd);
    audio.onerror = () => this.finish(token, onEnd);

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => this.finish(token, onEnd));
    }
  }

  /**
   * 按完整段落/长句自然切分（保留逗号和句号的自然呼吸停顿，避免机械断句）
   */
  private static splitIntoNaturalChunks(text: string): string[] {
    if (text.length <= MAX_NATURAL_CHUNK_LEN) {
      return [text];
    }

    const strongBreaks = '。！？；\n';
    const chunks: string[] = [];
    let buffer = '';

    const flush = () => {
      const trimmed = buffer.trim();
      if (trimmed) chunks.push(trimmed);
      buffer = '';
    };

    for (const char of text) {
      buffer += char;
      if (buffer.length >= MAX_NATURAL_CHUNK_LEN) {
        flush();
        continue;
      }
      if (buffer.length >= 60 && strongBreaks.includes(char)) {
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
