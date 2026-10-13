import { describe, it, expect } from 'vitest';
import {
  TREBLE_STAFF_NOTES,
  BASS_STAFF_NOTES,
  PIANO_TUTORIAL_CHAPTERS
} from '../src/data/pianoStaffData';
import { COMPREHENSIVE_MUSIC_THEORY } from '../src/data/musicTheoryData';
import { pianoAudio } from '../src/utils/pianoAudio';

describe('Piano Staff & Music Theory Tests', () => {
  it('verifies Treble staff notes definitions and landmarks', () => {
    expect(TREBLE_STAFF_NOTES.length).toBeGreaterThanOrEqual(10);
    const middleC = TREBLE_STAFF_NOTES.find(n => n.pitch === 'C4');
    expect(middleC).toBeDefined();
    expect(middleC?.positionName).toContain('下加一线');
    expect(middleC?.isLandmark).toBe(true);

    const sol = TREBLE_STAFF_NOTES.find(n => n.pitch === 'G4');
    expect(sol).toBeDefined();
    expect(sol?.positionName).toBe('第二线');
    expect(sol?.isLandmark).toBe(true);
  });

  it('verifies Bass staff notes definitions and landmarks', () => {
    expect(BASS_STAFF_NOTES.length).toBeGreaterThanOrEqual(10);
    const bassFa = BASS_STAFF_NOTES.find(n => n.pitch === 'F3');
    expect(bassFa).toBeDefined();
    expect(bassFa?.positionName).toBe('第四线');
    expect(bassFa?.isLandmark).toBe(true);

    const middleCInBass = BASS_STAFF_NOTES.find(n => n.pitch === 'C4');
    expect(middleCInBass).toBeDefined();
    expect(middleCInBass?.positionName).toContain('上加一线');
  });

  it('verifies piano audio note to frequency conversions', () => {
    expect(Math.round(pianoAudio.noteToFreq('A4'))).toBe(440);
    expect(Math.round(pianoAudio.noteToFreq('C4'))).toBe(262);
    expect(Math.round(pianoAudio.noteToFreq('C5'))).toBe(523);
  });

  it('verifies comprehensive music theory sections', () => {
    expect(COMPREHENSIVE_MUSIC_THEORY.length).toBeGreaterThanOrEqual(8);

    // Stem direction section
    const stemSec = COMPREHENSIVE_MUSIC_THEORY.find(s => s.id === 'stem_direction');
    expect(stemSec).toBeDefined();
    expect(stemSec?.title).toContain('符干朝向');
    expect(stemSec?.cards.length).toBeGreaterThan(0);
    expect(stemSec?.rhyme).toBeDefined();

    // Staff skeleton section
    const skeletonSec = COMPREHENSIVE_MUSIC_THEORY.find(s => s.id === 'staff_skeleton');
    expect(skeletonSec).toBeDefined();

    // Note values section
    const valuesSec = COMPREHENSIVE_MUSIC_THEORY.find(s => s.id === 'note_values_rests');
    expect(valuesSec).toBeDefined();

    // Time signatures section
    const timeSec = COMPREHENSIVE_MUSIC_THEORY.find(s => s.id === 'time_signatures');
    expect(timeSec).toBeDefined();

    // Accidentals section
    const accidentalsSec = COMPREHENSIVE_MUSIC_THEORY.find(s => s.id === 'accidentals_tones');
    expect(accidentalsSec).toBeDefined();

    // Pitch names and 88 keys
    const pitchNamesSec = COMPREHENSIVE_MUSIC_THEORY.find(s => s.id === 'pitch_names_groups');
    expect(pitchNamesSec).toBeDefined();

    // Articulations & dynamics
    const artSec = COMPREHENSIVE_MUSIC_THEORY.find(s => s.id === 'articulations_dynamics');
    expect(artSec).toBeDefined();

    // Mnemonics
    const mnemonicsSec = COMPREHENSIVE_MUSIC_THEORY.find(s => s.id === 'mnemonics_treasury');
    expect(mnemonicsSec).toBeDefined();
  });
});

