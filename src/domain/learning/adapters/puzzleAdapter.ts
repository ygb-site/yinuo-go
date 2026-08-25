import type { LearningNode } from '../types';

export function getPuzzleNodes(): LearningNode[] {
  return [
    {
      id: 'gomoku:match:ai',
      domainId: 'gomoku',
      kind: 'match',
      title: '欢乐五子连珠 · 亲子同屏',
      subtitle: '五子连线 · 先手攻防',
      description: '五子棋核心连珠对决与亲子同屏对局',
      order: 1,
      knowledgePointIds: ['五子棋连珠'],
      skillIds: ['gomoku.line5'],
      unlock: { type: 'always' },
      reward: {
        first: { coins: 30, exp: 60 },
        repeat: { coins: 5, exp: 10 },
        rewardDomain: 'gomoku-match',
        dailyCap: { capId: 'gomoku', limit: 10 }
      },
      route: '/gomoku',
      estimatedMinutes: 5,
      legacyIds: ['gomoku_ai']
    },
    {
      id: 'checkers:match:ai',
      domainId: 'checkers',
      kind: 'match',
      title: '快乐六角跳棋 · 亲子畅玩',
      subtitle: '搭桥连跳 · 空间规划',
      description: '经典六角星跳棋，搭桥连续大跳跃',
      order: 2,
      knowledgePointIds: ['跳棋连续跳跃'],
      skillIds: ['checkers.hop'],
      unlock: { type: 'always' },
      reward: {
        first: { coins: 30, exp: 60 },
        repeat: { coins: 5, exp: 10 },
        rewardDomain: 'checkers-match',
        dailyCap: { capId: 'checkers', limit: 10 }
      },
      route: '/checkers',
      estimatedMinutes: 8,
      legacyIds: ['checkers_ai']
    }
  ];
}

