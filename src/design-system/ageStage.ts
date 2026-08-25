import type { GradeLevel } from '../types/curriculum';

export type AgeStage = 'early-childhood' | 'primary' | 'middle-school' | 'teen';

export interface ThemeTokenOverride {
  fontScale?: number;
  radiusScale?: number;
  motionScale?: number;
  displayFontFamily?: 'display' | 'sans';
  colorOverrides?: Partial<
    Record<'brand' | 'brandStrong' | 'brandSoft' | 'background', string>
  >;
  decorations?: 'rich' | 'standard' | 'minimal';
}

export const AGE_THEME_OVERRIDES: Record<AgeStage, ThemeTokenOverride> = {
  'early-childhood': {
    fontScale: 1.125,
    radiusScale: 1.25,
    motionScale: 1.2,
    displayFontFamily: 'display',
    decorations: 'rich'
  },
  primary: {},
  'middle-school': {
    fontScale: 1,
    radiusScale: 0.75,
    motionScale: 0.75,
    displayFontFamily: 'sans',
    decorations: 'standard'
  },
  teen: {
    fontScale: 1,
    radiusScale: 0.5,
    motionScale: 0.5,
    displayFontFamily: 'sans',
    decorations: 'minimal'
  }
};

export function deriveAgeStage(gradeLevel?: GradeLevel | string): AgeStage {
  if (!gradeLevel) return 'primary';
  const gl = gradeLevel.toLowerCase();
  if (gl.includes('k') || gl.includes('preschool') || gl.includes('early')) {
    return 'early-childhood';
  }
  if (gl.includes('junior') || gl.includes('g7') || gl.includes('g8') || gl.includes('g9')) {
    return 'middle-school';
  }
  if (gl.includes('senior') || gl.includes('high') || gl.includes('g10') || gl.includes('g11') || gl.includes('g12')) {
    return 'teen';
  }
  return 'primary';
}

export function applyAgeStage(stage: AgeStage): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-age-stage', stage);
}

