import { ref } from 'vue';

export const isSpeaking = ref(false);
/** 页面喇叭开关。只控制朗读，不影响落子音效。 */
export const speechPlaybackEnabled = ref(true);

const MAX_CHUNK_LEN = 80;

/**
 * 伴读：开发走 Vite 同源代理；线上 GitHub Pages 没有 /api/tts，改为直连百度 TTS。
 * 百度见到页面 Referer 会返回空页，所以页面和 audio 都声明 no-referrer。
 */
export class SpeechCompanion {
  private static player: HTMLAudioElement | null = null;
  private static speakToken = 0;

  public static init() {
    // 播放器按点击创建
  }

  public static formatSpokenText(text: string): string {
    return text
      .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      .replace(/【|】|📖|🎯|⭐|🐼|🦁|🚀|⚔️|🏰|⚡|🔄|❤️|🛡️|🪙|🏆|🌸|🎉|✨|🐶|🐱|🦊/g, '')
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

  public static speak(text: string, onEnd?: () => void) {
    if (!speechPlaybackEnabled.value) return;

    const spokenText = this.formatSpokenText(text);
    if (!spokenText) return;

    this.haltPlayback();
    const token = ++this.speakToken;
    isSpeaking.value = true;
    this.playAt(this.splitIntoChunks(spokenText), 0, token, onEnd);
  }

  /** 本地有代理走代理；线上静态站直连百度 */
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

  private static playAt(chunks: string[], index: number, token: number, onEnd?: () => void) {
    if (token !== this.speakToken) return;
    if (index >= chunks.length) {
      this.finish(token, onEnd);
      return;
    }

    const audio = document.createElement('audio');
    audio.setAttribute('referrerpolicy', 'no-referrer');
    audio.preload = 'auto';
    audio.src = this.buildTtsUrl(chunks[index]);
    this.player = audio;

    audio.onended = () => this.playAt(chunks, index + 1, token, onEnd);
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
      if (buffer.length >= 40 && weakBreaks.includes(char)) {
        flush();
        continue;
      }
      if (buffer.length >= 16 && strongBreaks.includes(char)) {
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
