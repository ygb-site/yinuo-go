// Web Audio Realistic Synthesized Acoustic Piano Engine
// Zero external mp3/wav files required, 100% offline resilient and instant response!

class PianoSoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public volume: number = 0.85;

  private initCtx() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Convert note name (e.g. 'C4', 'F#4', 'Bb3') to Frequency in Hz
  public noteToFreq(note: string): number {
    const noteNames: Record<string, number> = {
      C: 0, 'C#': 1, Db: 1,
      D: 2, 'D#': 3, Eb: 3,
      E: 4,
      F: 5, 'F#': 6, Gb: 6,
      G: 7, 'G#': 8, Ab: 8,
      A: 9, 'A#': 10, Bb: 10,
      B: 11
    };

    const match = note.match(/^([A-G][b#]?)([0-8])$/);
    if (!match) return 440;

    const pitchClass = match[1];
    const octave = parseInt(match[2], 10);
    const semitone = noteNames[pitchClass] ?? 0;
    // MIDI number: C4 = 60
    const midi = (octave + 1) * 12 + semitone;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /**
   * Play an authentic acoustic piano note using physical modeling harmonics & hammer attack
   */
  public playNote(noteOrFreq: string | number, duration: number = 1.2) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const freq = typeof noteOrFreq === 'number' ? noteOrFreq : this.noteToFreq(noteOrFreq);
    const now = this.ctx.currentTime;

    // Master note gain
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    // Instant attack like a piano hammer striking the string
    masterGain.gain.exponentialRampToValueAtTime(0.7 * this.volume, now + 0.008);
    // Natural acoustic decay
    masterGain.gain.exponentialRampToValueAtTime(0.35 * this.volume, now + 0.18);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Warm piano low-pass acoustic resonance filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(freq * 5.5, 7500), now);
    filter.frequency.exponentialRampToValueAtTime(Math.min(freq * 2.2, 3500), now + duration);

    masterGain.connect(filter);
    filter.connect(this.ctx.destination);

    // Harmonics spectrum of a grand piano string:
    // [harmonic multiplier, relative gain, decay modifier]
    const harmonics = [
      { mult: 1.0, gain: 0.7, decay: 1.0 },      // Fundamental
      { mult: 2.001, gain: 0.42, decay: 0.85 },   // 2nd harmonic (octave)
      { mult: 3.003, gain: 0.22, decay: 0.7 },    // 3rd harmonic (fifth)
      { mult: 4.006, gain: 0.12, decay: 0.55 },   // 4th harmonic
      { mult: 5.01, gain: 0.06, decay: 0.4 }      // 5th harmonic
    ];

    harmonics.forEach(({ mult, gain: hGainRatio }) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const hGain = this.ctx.createGain();

      osc.type = mult === 1.0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq * mult, now);

      hGain.gain.setValueAtTime(hGainRatio, now);
      hGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(hGain);
      hGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    });

    // Felt hammer percussive transient (short high-frequency click)
    const hammerOsc = this.ctx.createOscillator();
    const hammerGain = this.ctx.createGain();
    hammerOsc.type = 'sine';
    hammerOsc.frequency.setValueAtTime(freq * 1.5, now);
    hammerOsc.frequency.exponentialRampToValueAtTime(100, now + 0.025);
    hammerGain.gain.setValueAtTime(0.25 * this.volume, now);
    hammerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    hammerOsc.connect(hammerGain);
    hammerGain.connect(this.ctx.destination);
    hammerOsc.start(now);
    hammerOsc.stop(now + 0.035);
  }

  // Play ascending celebration arpeggio: C4 -> E4 -> G4 -> C5
  public playArpeggio(notes: string[] = ['C4', 'E4', 'G4', 'C5']) {
    notes.forEach((n, idx) => {
      setTimeout(() => {
        this.playNote(n, 1.4);
      }, idx * 110);
    });
  }

  // Play gentle error chord
  public playWrongChime() {
    this.playNote('Eb3', 0.4);
    setTimeout(() => {
      this.playNote('D3', 0.5);
    }, 90);
  }
}

export const pianoAudio = new PianoSoundEngine();

