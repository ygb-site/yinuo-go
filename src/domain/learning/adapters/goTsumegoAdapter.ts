import { TSUMEGO_PUZZLES, type TsumegoPuzzle } from '../../../data/tsumegoLibrary';
import type { LearningNode } from '../types';

let cachedTsumegoNodes: LearningNode[] | null = null;

export function getGoTsumegoNodes(): LearningNode[] {
  if (cachedTsumegoNodes) {
    return cachedTsumegoNodes;
  }

  const nodes: LearningNode[] = TSUMEGO_PUZZLES.map((puzzle: TsumegoPuzzle, idx: number) => {
    return {
      id: `go:drill:tsumego:${puzzle.id}`,
      domainId: 'go',
      kind: 'drill' as const,
      title: puzzle.title,
      subtitle: puzzle.category || '死活实战',
      description: puzzle.explanation || '黑先正解手筋',
      order: idx + 1,
      knowledgePointIds: [puzzle.category || '死活'],
      skillIds: ['go.tsumego.basic'],
      unlock: { type: 'always' },
      reward: {
        first: { coins: 30, exp: 80 },
        repeat: { coins: 0, exp: 0 },
        rewardDomain: 'tsumego'
      },
      route: '/tsumego',
      estimatedMinutes: 3,
      legacyIds: [puzzle.id],
      payload: puzzle
    };
  });

  cachedTsumegoNodes = Object.freeze(nodes) as LearningNode[];
  return cachedTsumegoNodes;
}

