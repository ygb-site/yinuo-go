import type { Domain } from './types';

export const DOMAINS_REGISTRY: Record<string, Domain> = {
  go: {
    id: 'go',
    name: '围棋',
    shortName: '棋',
    isPrimary: true,
    hasContent: true,
    accent: 'learning',
    primaryAbilities: ['spatial', 'logic', 'calculation', 'concentration']
  },
  gomoku: {
    id: 'gomoku',
    name: '五子棋',
    shortName: '连珠',
    isPrimary: false,
    hasContent: true,
    accent: 'challenge',
    primaryAbilities: ['spatial', 'calculation', 'logic']
  },
  checkers: {
    id: 'checkers',
    name: '六角跳棋',
    shortName: '跳棋',
    isPrimary: false,
    hasContent: true,
    accent: 'growth',
    primaryAbilities: ['spatial', 'logic']
  }
};

export function getActiveDomains(): Domain[] {
  return Object.values(DOMAINS_REGISTRY).filter((d) => d.hasContent);
}

