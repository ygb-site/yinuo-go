import type { RewardSpec } from '../learning/types';

export const REWARD_SPECS: Record<string, RewardSpec> = {
  lesson: {
    first: { coins: 20, exp: 50, stars: 3 },
    repeat: { coins: 0, exp: 5 },
    rewardDomain: 'lesson'
  },
  tsumego: {
    first: { coins: 30, exp: 80 },
    rewardDomain: 'tsumego'
  },
  drill: {
    first: { coins: 10, exp: 20 },
    rewardDomain: 'drill',
    dailyCap: { capId: 'drill', limit: 10 }
  },
  'match-win': {
    first: { coins: 50, exp: 150 },
    rewardDomain: 'go-match'
  },
  'match-lose': {
    first: { coins: 10, exp: 40 },
    rewardDomain: 'go-match'
  },
  exam: {
    first: { coins: 100, exp: 300 },
    rewardDomain: 'exam'
  },
  mistake: {
    first: { coins: 30, exp: 40 },
    rewardDomain: 'mistake'
  },
  'daily-task': {
    first: { coins: 10, exp: 10 },
    rewardDomain: 'study-task',
    dailyCap: { capId: 'study-task', limit: 5 }
  },
  'ai-variation': {
    first: { coins: 10, exp: 10 },
    rewardDomain: 'ai-variation',
    dailyCap: { capId: 'ai-variation', limit: 10 }
  },
  'check-in': {
    first: { coins: 15, exp: 0 },
    rewardDomain: 'check-in'
  },
  'daily-quest': {
    first: { coins: 50, exp: 100 },
    rewardDomain: 'daily-quest'
  }
};

