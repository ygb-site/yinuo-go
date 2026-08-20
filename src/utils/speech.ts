import { ref } from 'vue';

export const isSpeaking = ref(false);
/** 页面喇叭开关。只控制朗读，不影响落子音效。 */
export const speechPlaybackEnabled = ref(true);

export type VoiceStyle = 'cute_mascot' | 'baby_moe' | 'sweet_girl' | 'sunny_boy' | 'mentor';

export interface VoiceProfile {
  id: VoiceStyle;
  name: string;
  avatar: string;
  tag: string;
  desc: string;
  sampleText: string;
  pitch: number;
  rate: number;
  audioPlaybackRate: number;
}

export const VOICE_PROFILES: Record<VoiceStyle, VoiceProfile> = {
  cute_mascot: {
    id: 'cute_mascot',
    name: '萌宠小诺',
    avatar: '🐼',
    tag: '默认超萌',
    desc: '活泼机灵的元气小熊猫，萌感十足',
    sampleText: '你好呀！我是小诺，我们一起在棋盘上快乐学围棋吧！',
    pitch: 1.48,
    rate: 1.02,
    audioPlaybackRate: 1.18
  },
  baby_moe: {
    id: 'baby_moe',
    name: '软萌奶音',
    avatar: '🌸',
    tag: '极萌幼童',
    desc: '极甜极萌的幼童萌音，娇憨可爱',
    sampleText: '哇！黑棋和白棋就像神奇的小精灵，太好玩啦！',
    pitch: 1.62,
    rate: 1.05,
    audioPlaybackRate: 1.25
  },
  sweet_girl: {
    id: 'sweet_girl',
    name: '甜美小雅',
    avatar: '👧',
    tag: '清脆女童',
    desc: '亲切温柔的小朋友童音，生动清亮',
    sampleText: '小朋友你好！今天这道题的要点是占领中心天元哦！',
    pitch: 1.28,
    rate: 0.98,
    audioPlaybackRate: 1.12
  },
  sunny_boy: {
    id: 'sunny_boy',
    name: '阳光小宇',
    avatar: '👦',
    tag: '朝气正太',
    desc: '阳光自信的小少年童音，元气满满',
    sampleText: '冲呀！看我的叫吃绝招，白棋逃不掉啦！',
    pitch: 1.16,
    rate: 1.02,
    audioPlaybackRate: 1.08
  },
  mentor: {
    id: 'mentor',
    name: '温和导师',
    avatar: '🎓',
    tag: '专业耐听',
    desc: '沉稳和蔼的专业围棋名师讲解音',
    sampleText: '围棋棋盘由纵横交叉线构成，落子要深思熟虑。',
    pitch: 1.0,
    rate: 0.95,
    audioPlaybackRate: 1.0
  }
};

export const currentVoiceStyle = ref<VoiceStyle>('cute_mascot');

const MAX_CHUNK_LEN = 80;

/**
 * 伴读语音合成引擎 (支持多种萌趣少儿音色切换)
 */
export class SpeechCompanion {
  private static player: HTMLAudioElement | null = null;
  private static speakToken = 0;
  private static cachedVoices: SpeechSynthesisVoice[] = [];
  private static isInitialized = false;

  public static init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // 尝试从本地持久化加载用户选择的音色
    try {
      const saved = localStorage.getItem('yinuo_voice_style') as VoiceStyle;
      if (saved && VOICE_PROFILES[saved]) {
        currentVoiceStyle.value = saved;
      }
    } catch {
      // ignore
    }

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

  public static setVoiceStyle(style: VoiceStyle) {
    if (VOICE_PROFILES[style]) {
      currentVoiceStyle.value = style;
      try {
        localStorage.setItem('yinuo_voice_style', style);
      } catch {
        // ignore
      }
    }
  }

  public static getVoiceStyle(): VoiceStyle {
    return currentVoiceStyle.value;
  }

  public static formatSpokenText(text: string): string {
    return text
      .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      .replace(/【|】|📖|🎯|⭐|🐼|🦁|🚀|⚔️|🏰|⚡|🔄|❤️|🛡️|🪙|🏆|🌸|🎉|✨|🐶|🐱|🦊|🦄|👧|👦|🎓/g, '')
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

  /** 根据当前选定的音色风格挑选最佳匹配发音人 */
  private static pickChineseVoice(style: VoiceStyle): SpeechSynthesisVoice | null {
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

    let preferredKeywords: string[] = [];
    if (style === 'cute_mascot' || style === 'baby_moe') {
      preferredKeywords = ['yunxi', 'xiaoyi', 'xiaoxiao', 'kangkang', 'yaoyao', 'tingting', 'meijia', 'sin-ji', 'cmn-hans-cn'];
    } else if (style === 'sweet_girl') {
      preferredKeywords = ['xiaoxiao', 'xiaoyi', 'tingting', 'meijia', 'sin-ji', 'cmn-hans-cn'];
    } else if (style === 'sunny_boy') {
      preferredKeywords = ['yunxi', 'kangkang', 'yunjian', 'cmn-hans-cn'];
    } else {
      preferredKeywords = ['huihui', 'yaoyao', 'lili', 'zh-cn'];
    }

    for (const kw of preferredKeywords) {
      const matched = voices.find(
        (v) =>
          (v.lang.includes('zh') || v.lang.includes('cmn')) &&
          v.name.toLowerCase().includes(kw)
      );
      if (matched) return matched;
    }

    // 默认 zh-CN
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

  public static speak(text: string, onEnd?: () => void, customStyle?: VoiceStyle) {
    if (!speechPlaybackEnabled.value) return;
    this.init();

    const spokenText = this.formatSpokenText(text);
    if (!spokenText) return;

    this.stop();
    const token = ++this.speakToken;
    isSpeaking.value = true;

    const style = customStyle || currentVoiceStyle.value;
    const profile = VOICE_PROFILES[style] || VOICE_PROFILES.cute_mascot;

    // 方案 A: 优先使用 Web Speech API 调校音调与音色
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const chunks = this.splitIntoChunks(spokenText);
        this.speakWithSpeechSynthesis(chunks, 0, token, profile, onEnd);
        return;
      } catch (err) {
        console.warn('SpeechSynthesis failed, falling back to audio stream', err);
      }
    }

    // 方案 B: 降级走音频流播放
    this.playAudioChunks(this.splitIntoChunks(spokenText), 0, token, profile, onEnd);
  }

  /** 使用 Web Speech API 朗读 */
  private static speakWithSpeechSynthesis(
    chunks: string[],
    index: number,
    token: number,
    profile: VoiceProfile,
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

    // 根据选定的角色配置音调与语速
    utterance.pitch = profile.pitch;
    utterance.rate = profile.rate;
    utterance.volume = 1.0;

    const voice = this.pickChineseVoice(profile.id);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || 'zh-CN';
    } else {
      utterance.lang = 'zh-CN';
    }

    utterance.onend = () => {
      if (token === this.speakToken) {
        this.speakWithSpeechSynthesis(chunks, index + 1, token, profile, onEnd);
      }
    };

    utterance.onerror = () => {
      if (token === this.speakToken) {
        this.playAudioChunks(chunks, index, token, profile, onEnd);
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
    return 'https://fanyi.baidu.com/gettts?lan=zh&spd=5&source=web&text=' + encoded;
  }

  /** 音频降级分段播放（结合角色调速） */
  private static playAudioChunks(
    chunks: string[],
    index: number,
    token: number,
    profile: VoiceProfile,
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
    audio.playbackRate = profile.audioPlaybackRate || 1.15;
    audio.src = this.buildTtsUrl(chunks[index]);
    this.player = audio;

    audio.onended = () => this.playAudioChunks(chunks, index + 1, token, profile, onEnd);
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

  /** 播放指定音色的试听语音 */
  public static previewVoice(style: VoiceStyle) {
    const profile = VOICE_PROFILES[style];
    if (profile) {
      this.speak(profile.sampleText, undefined, style);
    }
  }
}

export const speakText = (text: string) => SpeechCompanion.speak(text);
export const stopSpeech = () => SpeechCompanion.stop();
export const toggleSpeech = (text: string) => SpeechCompanion.toggle(text);
export const previewVoice = (style: VoiceStyle) => SpeechCompanion.previewVoice(style);
