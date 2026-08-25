import { describe, it, expect } from 'vitest';
import {
  AppButton,
  AppCard,
  AppBadge,
  AppProgress,
  AppIcon,
  AppAvatar,
  AppModal,
  AppEmptyState,
  AppSkeleton,
  AppTabs,
  AppSection,
  AppSelect,
  deriveAgeStage,
  applyAgeStage,
  ICON_MAP,
  ICON_TONE_CLASS_MAP,
  AGE_THEME_OVERRIDES
} from '../../src/design-system';

describe('Design System: Atomic Components & Tokens', () => {
  it('exports all atomic components properly', () => {
    expect(AppButton).toBeDefined();
    expect(AppCard).toBeDefined();
    expect(AppBadge).toBeDefined();
    expect(AppProgress).toBeDefined();
    expect(AppIcon).toBeDefined();
    expect(AppAvatar).toBeDefined();
    expect(AppModal).toBeDefined();
    expect(AppEmptyState).toBeDefined();
    expect(AppSkeleton).toBeDefined();
    expect(AppTabs).toBeDefined();
    expect(AppSection).toBeDefined();
    expect(AppSelect).toBeDefined();
  });

  describe('Icon System & Semantic Tones', () => {
    it('contains all essential icon keys for navigation, actions, and domains', () => {
      const requiredIcons = [
        'home',
        'compass',
        'learn',
        'play',
        'growth',
        'parent',
        'star',
        'coins',
        'trophy',
        'flame',
        'sparkles',
        'bot',
        'target',
        'lock',
        'unlock',
        'settings',
        'back',
        'close'
      ];
      for (const icon of requiredIcons) {
        expect(ICON_MAP[icon], `Icon ${icon} should be registered`).toBeDefined();
      }
    });

    it('maps all semantic icon tones to corresponding token classes', () => {
      expect(ICON_TONE_CLASS_MAP['brand']).toBe('text-brand-strong');
      expect(ICON_TONE_CLASS_MAP['success']).toBe('text-success');
      expect(ICON_TONE_CLASS_MAP['warning']).toBe('text-warning');
      expect(ICON_TONE_CLASS_MAP['danger']).toBe('text-danger');
      expect(ICON_TONE_CLASS_MAP['info']).toBe('text-info');
      expect(ICON_TONE_CLASS_MAP['learning']).toBe('text-learning');
      expect(ICON_TONE_CLASS_MAP['growth']).toBe('text-growth');
      expect(ICON_TONE_CLASS_MAP['challenge']).toBe('text-challenge');
      expect(ICON_TONE_CLASS_MAP['muted']).toBe('text-text-muted');
      expect(ICON_TONE_CLASS_MAP['inherit']).toBe('text-current');
    });
  });

  describe('Age Adaptive Theme Engine', () => {
    it('derives correct age stages across K12 grade levels', () => {
      expect(deriveAgeStage('g1_t1')).toBe('primary');
      expect(deriveAgeStage('g3_t2')).toBe('primary');
      expect(deriveAgeStage('junior')).toBe('middle-school');
      expect(deriveAgeStage('g8')).toBe('middle-school');
      expect(deriveAgeStage('senior')).toBe('teen');
      expect(deriveAgeStage('g11')).toBe('teen');
      expect(deriveAgeStage('preschool_k1')).toBe('early-childhood');
      expect(deriveAgeStage('early')).toBe('early-childhood');
      expect(deriveAgeStage('')).toBe('primary');
      expect(deriveAgeStage(undefined)).toBe('primary');
    });

    it('defines theme override scales for all age stages', () => {
      expect(AGE_THEME_OVERRIDES['early-childhood'].radiusScale).toBe(1.25);
      expect(AGE_THEME_OVERRIDES['middle-school'].radiusScale).toBe(0.75);
      expect(AGE_THEME_OVERRIDES['teen'].radiusScale).toBe(0.5);
      expect(AGE_THEME_OVERRIDES['primary']).toEqual({});
    });

    it('applies age stage to DOM root safely', () => {
      expect(() => applyAgeStage('early-childhood')).not.toThrow();
      expect(() => applyAgeStage('primary')).not.toThrow();
      expect(() => applyAgeStage('middle-school')).not.toThrow();
      expect(() => applyAgeStage('teen')).not.toThrow();
    });
  });
});

