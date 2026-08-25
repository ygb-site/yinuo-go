import { describe, it, expect } from 'vitest';
import { CHAPTERS_DATA } from '../../src/data/chapters';
import {
  getGoAdventureNodes,
  getGoTsumegoNodes,
  getPuzzleNodes,
  getAllLearningNodes,
  findLearningNodeById
} from '../../src/domain/learning/adapters';
import { readProgress } from '../../src/domain/learning/progress';

describe('Domain: Learning Adapters', () => {
  it('maps all chapters and lessons from CHAPTERS_DATA deterministically', () => {
    const nodes = getGoAdventureNodes();
    const totalChapters = CHAPTERS_DATA.length;
    const totalLessons = CHAPTERS_DATA.reduce((acc, c) => acc + c.lessons.length, 0);

    const chapterNodes = nodes.filter((n) => n.kind === 'chapter');
    const lessonNodes = nodes.filter((n) => n.kind === 'lesson');

    expect(chapterNodes).toHaveLength(totalChapters);
    expect(lessonNodes).toHaveLength(totalLessons);
    expect(nodes).toHaveLength(totalChapters + totalLessons);
  });

  it('includes dual legacyIds for backwards compatibility (c1_l1 and lesson_1_1)', () => {
    const nodes = getGoAdventureNodes();
    const firstLesson = nodes.find((n) => n.id === 'go:lesson:c1/l1');

    expect(firstLesson).toBeDefined();
    expect(firstLesson?.legacyIds).toContain('c1_l1');
    expect(firstLesson?.legacyIds).toContain('lesson_1_1');
  });

  it('reads merged progress correctly across new id and legacy ids', () => {
    const nodes = getGoAdventureNodes();
    const targetNode = nodes.find((n) => n.id === 'go:lesson:c1/l2')!;

    // Case 1: user has historical progress saved under 'lesson_1_2'
    const rawProgress1 = {
      lesson_1_2: { completed: true, stars: 2, completedAt: '2026-08-01' }
    };
    const p1 = readProgress(targetNode, rawProgress1);
    expect(p1.status).toBe('completed');
    expect(p1.stars).toBe(2);

    // Case 2: user has progress saved under 'c1_l2' with 3 stars
    const rawProgress2 = {
      c1_l2: { completed: true, stars: 3, completedAt: '2026-08-10' }
    };
    const p2 = readProgress(targetNode, rawProgress2);
    expect(p2.status).toBe('completed');
    expect(p2.stars).toBe(3);
  });

  it('finds node by id or legacy id', () => {
    const byNewId = findLearningNodeById('go:lesson:c1/l1');
    expect(byNewId).toBeDefined();
    expect(byNewId?.title).toBe('1-1 棋盘与黑白小精灵');

    const byLegacyId = findLearningNodeById('c1_l1');
    expect(byLegacyId).toBeDefined();
    expect(byLegacyId?.id).toBe('go:lesson:c1/l1');
  });
});


