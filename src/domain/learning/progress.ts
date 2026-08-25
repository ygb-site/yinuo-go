import type { LearningNode, Progress } from './types';

/**
 * Reads merged progress across new nodeId and all historical legacyIds
 */
export function readProgress(
  node: LearningNode,
  rawProgress: Record<string, { completed?: boolean; stars?: number; highscore?: number; completedAt?: string }>
): Progress {
  const candidateKeys = [node.id, ...node.legacyIds];
  let isCompleted = false;
  let maxStars: 0 | 1 | 2 | 3 = 0;
  let bestScore: number | undefined = undefined;
  let firstCompletedAt: number | undefined = undefined;

  for (const k of candidateKeys) {
    const rec = rawProgress[k];
    if (rec) {
      if (rec.completed) isCompleted = true;
      if (rec.stars && rec.stars > maxStars) {
        maxStars = Math.min(3, Math.max(0, rec.stars)) as 0 | 1 | 2 | 3;
      }
      if (rec.highscore !== undefined && (bestScore === undefined || rec.highscore > bestScore)) {
        bestScore = rec.highscore;
      }
      if (rec.completedAt) {
        const ts = new Date(rec.completedAt).getTime();
        if (!isNaN(ts) && (firstCompletedAt === undefined || ts < firstCompletedAt)) {
          firstCompletedAt = ts;
        }
      }
    }
  }

  return {
    nodeId: node.id,
    status: isCompleted ? 'completed' : 'available',
    stars: maxStars,
    bestScore,
    attempts: isCompleted ? 1 : 0,
    firstCompletedAt,
    totalSeconds: isCompleted ? 300 : 0
  };
}

