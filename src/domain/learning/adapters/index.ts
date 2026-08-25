export * from './goAdventureAdapter';
export * from './goTsumegoAdapter';
export * from './puzzleAdapter';

import { getGoAdventureNodes } from './goAdventureAdapter';
import { getGoTsumegoNodes } from './goTsumegoAdapter';
import { getPuzzleNodes } from './puzzleAdapter';
import type { LearningNode } from '../types';

export function getAllLearningNodes(): LearningNode[] {
  return [
    ...getGoAdventureNodes(),
    ...getGoTsumegoNodes(),
    ...getPuzzleNodes()
  ];
}

export function findLearningNodeById(id: string): LearningNode | undefined {
  return getAllLearningNodes().find(
    (n) => n.id === id || n.legacyIds.includes(id)
  );
}

