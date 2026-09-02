import type { AbilityDimensionId } from '../ability/types';
import type { SchoolAbilityBridge, TextbookLessonMeta, TextbookSubjectId } from './types';

const SUBJECT_DEFAULT_BRIDGES: Record<TextbookSubjectId, SchoolAbilityBridge[]> = {
  chinese: [
    {
      knowledgeTag: 'observe-form',
      dimensionId: 'spatial',
      goSkillHint: '看清字形再动笔，和围棋里先看棋形再落子是同一件事。'
    },
    {
      knowledgeTag: 'sequence',
      dimensionId: 'logic',
      goSkillHint: '课文先发生什么、后发生什么，练的是「先想后下」。'
    }
  ],
  math: [
    {
      knowledgeTag: 'count-compare',
      dimensionId: 'calculation',
      goSkillHint: '数一数、比一比，和数气、比气用的是同一种仔细。'
    },
    {
      knowledgeTag: 'reason',
      dimensionId: 'logic',
      goSkillHint: '想清楚再算，和死活题里先想结果再动手一样。'
    }
  ]
};

export function bridgesForLesson(lesson?: TextbookLessonMeta | null): SchoolAbilityBridge[] {
  if (!lesson) return [];
  if (lesson.abilityBridges.length > 0) return lesson.abilityBridges;
  return SUBJECT_DEFAULT_BRIDGES[lesson.subjectId];
}

export function parentAbilityBridgeText(lesson?: TextbookLessonMeta | null): string | undefined {
  const bridges = bridgesForLesson(lesson);
  if (bridges.length === 0) return undefined;
  return bridges.map((item) => item.goSkillHint).join(' ');
}

export function mappedDimensions(lesson?: TextbookLessonMeta | null): AbilityDimensionId[] {
  const seen = new Set<AbilityDimensionId>();
  const ids: AbilityDimensionId[] = [];
  for (const item of bridgesForLesson(lesson)) {
    if (seen.has(item.dimensionId)) continue;
    seen.add(item.dimensionId);
    ids.push(item.dimensionId);
  }
  return ids;
}
