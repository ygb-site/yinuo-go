import { CHAPTERS_DATA, type Chapter, type Lesson } from '../../../data/chapters';
import type { LearningNode } from '../types';

let cachedGoAdventureNodes: LearningNode[] | null = null;

export function getGoAdventureNodes(): LearningNode[] {
  if (cachedGoAdventureNodes) {
    return cachedGoAdventureNodes;
  }

  const nodes: LearningNode[] = [];
  let globalLessonIndex = 0;

  for (let cIdx = 0; cIdx < CHAPTERS_DATA.length; cIdx++) {
    const ch: Chapter = CHAPTERS_DATA[cIdx];
    const chapterNodeId = `go:chapter:c${ch.id}`;

    // 1. Chapter Node
    nodes.push({
      id: chapterNodeId,
      domainId: 'go',
      kind: 'chapter',
      title: ch.title,
      subtitle: ch.titleEn,
      description: ch.description,
      order: ch.id,
      knowledgePointIds: [],
      skillIds: [],
      unlock: ch.id === 1 ? { type: 'always' } : { type: 'lesson-count', count: (ch.id - 1) * 4 },
      reward: {
        first: { coins: 50, exp: 100 },
        rewardDomain: 'chapter'
      },
      route: '/adventure',
      estimatedMinutes: 30,
      legacyIds: [`chapter_${ch.id}`, `c${ch.id}`],
      payload: ch
    });

    // 2. Lesson Nodes
    for (let lIdx = 0; lIdx < ch.lessons.length; lIdx++) {
      const les: Lesson = ch.lessons[lIdx];
      const lessonNumber = lIdx + 1;
      const lessonNodeId = `go:lesson:c${ch.id}/l${lessonNumber}`;
      const legacyChapterForm = `c${ch.id}_l${lessonNumber}`;
      const legacyLessonForm = `lesson_${ch.id}_${lessonNumber}`;

      const prevLessonNodeId =
        globalLessonIndex > 0 ? nodes[nodes.length - 1]?.id : undefined;

      nodes.push({
        id: lessonNodeId,
        domainId: 'go',
        kind: 'lesson',
        title: les.title,
        subtitle: les.subtitle || les.titleEn,
        description: les.description,
        parentId: chapterNodeId,
        order: globalLessonIndex + 1,
        knowledgePointIds: [les.title],
        skillIds: [`go.skill.c${ch.id}.l${lessonNumber}`],
        unlock:
          globalLessonIndex === 0
            ? { type: 'always' }
            : prevLessonNodeId
            ? { type: 'node-completed', nodeId: prevLessonNodeId }
            : { type: 'always' },
        reward: {
          first: { coins: 20, exp: 50, stars: 3 },
          repeat: { coins: 0, exp: 5 },
          rewardDomain: 'lesson'
        },
        route: `/lesson/${les.id}`,
        estimatedMinutes: 5,
        legacyIds: [les.id, legacyChapterForm, legacyLessonForm],
        payload: les
      });

      globalLessonIndex++;
    }
  }

  cachedGoAdventureNodes = Object.freeze(nodes) as LearningNode[];
  return cachedGoAdventureNodes;
}


