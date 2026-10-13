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
      id: 'xiangqi:match:play',
      domainId: 'xiangqi',
      kind: 'match',
      title: '中国象棋 · Xiangqi',
      subtitle: '学堂教程 · 残局将死',
      description: '象棋走法启蒙与将死残局（Chinese Chess）',
      order: 2,
      knowledgePointIds: ['象棋走法'],
      skillIds: ['xiangqi.move'],
      unlock: { type: 'always' },
      reward: {
        first: { coins: 30, exp: 60 },
        repeat: { coins: 5, exp: 10 },
        rewardDomain: 'xiangqi-match',
        dailyCap: { capId: 'xiangqi', limit: 10 }
      },
      route: '/xiangqi',
      estimatedMinutes: 10,
      legacyIds: ['xiangqi_play']
    }
  ];
}

