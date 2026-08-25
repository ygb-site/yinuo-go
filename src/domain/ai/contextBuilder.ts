import type { TutorContext } from './types';

export function buildTutorContext(input: Partial<TutorContext>): TutorContext {
  return {
    domain: input.domain || { id: 'go', name: '围棋' },
    currentNode: input.currentNode,
    currentQuestion: input.currentQuestion,
    currentKnowledgePoints: input.currentKnowledgePoints || [],
    recentMistakes: (input.recentMistakes || []).slice(0, 3),
    learnerStage: input.learnerStage || 'primary',
    learnerNickname: (input.learnerNickname || '小棋手').slice(0, 20),
    recentHistory: input.recentHistory || {
      lessonsCompletedLast7d: 0,
      accuracyLast7d: null,
      streak: 1
    },
    currentAbility: input.currentAbility || [],
    chatHistory: (input.chatHistory || []).slice(-6)
  };
}
