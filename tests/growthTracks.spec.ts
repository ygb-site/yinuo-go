import { describe, it, expect } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { GRADE_LEVEL_IDS, gradeYearLabel, isGradeLevel } from '../src/types/curriculum';
import { useUserStore } from '../src/stores/useUserStore';
import {
  resolveGrowthTracks,
  resolveTogetherWeek,
  hometownShadowIsTight,
  hometownShadowLiteEnabled,
  currentTogetherWeekKey,
  DEFAULT_SCHOOL_TRACK,
  DEFAULT_HOMETOWN_TRACK,
  DEFAULT_RETURN_WINDOW
} from '../src/domain/growth/tracks';

describe('家庭双轨与年级', () => {
  it('学段 id 覆盖一到六年级上下册', () => {
    expect(GRADE_LEVEL_IDS).toContain('g1_t1');
    expect(GRADE_LEVEL_IDS).toContain('g6_t2');
    expect(GRADE_LEVEL_IDS).toHaveLength(12);
    expect(isGradeLevel('g4_t1')).toBe(true);
    expect(isGradeLevel('g7_t1')).toBe(false);
  });

  it('课表年级名跟学段走', () => {
    expect(gradeYearLabel('g1_t1')).toBe('一年级');
    expect(gradeYearLabel('g4_t2')).toBe('四年级');
    expect(gradeYearLabel(undefined)).toBe('一年级');
  });

  it('缺省轨道是北京现在、衡水以后、四到六年级再回', () => {
    const tracks = resolveGrowthTracks(undefined);
    expect(tracks.schoolTrack).toBe(DEFAULT_SCHOOL_TRACK);
    expect(tracks.hometownTrack).toBe(DEFAULT_HOMETOWN_TRACK);
    expect(tracks.returnWindow).toBe(DEFAULT_RETURN_WINDOW);
    expect(tracks.trackRole).toBe('current');
  });

  it('非法轨道值回落到默认，不写进档案', () => {
    const tracks = resolveGrowthTracks({
      schoolTrack: 'shanghai' as never,
      hometownTrack: 'hengshui',
      returnWindow: 'soon' as never
    });
    expect(tracks.schoolTrack).toBe('beijing');
    expect(tracks.hometownTrack).toBe('hengshui');
    expect(tracks.returnWindow).toBe('g4_g6');
  });

  it('g4_g6 窗口下一年级不收紧衡水对照，四年级才收紧', () => {
    const tracks = resolveGrowthTracks({ returnWindow: 'g4_g6' });
    expect(hometownShadowIsTight(tracks, 'g1_t1')).toBe(false);
    expect(hometownShadowIsTight(tracks, 'g3_t2')).toBe(false);
    expect(hometownShadowIsTight(tracks, 'g4_t1')).toBe(true);
  });

  it('一年级起老家衡水就开启儿童端影子轻练', () => {
    const tracks = resolveGrowthTracks({ hometownTrack: 'hengshui', schoolTrack: 'beijing' });
    expect(hometownShadowLiteEnabled(tracks)).toBe(true);
    expect(hometownShadowLiteEnabled(resolveGrowthTracks({ hometownTrack: 'beijing', schoolTrack: 'beijing' }))).toBe(false);
  });

  it('亲子一起做跨周会重置，不算进新的一周', () => {
    const lastWeek = {
      weekKey: '1999-01-04',
      done: { go: true, read: true, outdoor: true, chore: true }
    };
    const resolved = resolveTogetherWeek(lastWeek);
    expect(resolved.weekKey).toBe(currentTogetherWeekKey());
    expect(resolved.done.go).toBe(false);
    expect(resolved.done.read).toBe(false);
  });

  it('新建档案默认写上北京/衡水/g4_g6', () => {
    setActivePinia(createPinia());
    const userStore = useUserStore();
    userStore.isLoggedIn = true;
    const profile = userStore.createProfile('测试宝贝', '🐼', 'g1_t1');
    expect(profile).not.toBeNull();
    expect(profile?.schoolTrack).toBe('beijing');
    expect(profile?.hometownTrack).toBe('hengshui');
    expect(profile?.returnWindow).toBe('g4_g6');
    expect(profile?.trackRole).toBe('current');
  });
});
