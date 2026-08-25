import type { KnowledgePoint, SubjectId, GradeLevel } from '../types/curriculum';

export const KNOWLEDGE_POINTS_REPOSITORY: KnowledgePoint[] = [
  // =========================================================================
  // ♟️ 围棋与棋艺知识点 (Go & Strategy Knowledge Points)
  // =========================================================================
  {
    id: 'go.rules.liberties',
    subjectId: 'go',
    gradeLevel: 'g1_t1',
    unitNumber: 1,
    title: '棋子的“气”与交叉点直线连接',
    category: '基础规则',
    importance: 'core',
    description: '理解棋子只有通过横线和竖线直接相连的空交叉点才算作“气”，斜线不算气。',
    abilityDimension: 'spatial',
    tags: ['气的概念', '直线相连', '围棋第一课']
  },
  {
    id: 'go.rules.capture',
    subjectId: 'go',
    gradeLevel: 'g1_t1',
    unitNumber: 1,
    title: '提子规则（紧紧包围没气即可拿走）',
    category: '基础规则',
    importance: 'core',
    description: '当对方棋子的所有气都被堵住（气数归零）时，立即将死子提出棋盘。',
    abilityDimension: 'spatial',
    prerequisites: ['go.rules.liberties'],
    tags: ['提子', '吃子规则']
  },
  {
    id: 'go.tactics.atari',
    subjectId: 'go',
    gradeLevel: 'g1_t1',
    unitNumber: 2,
    title: '“叫吃”（打吃）与逃跑连接',
    category: '吃子技巧',
    importance: 'core',
    description: '识别只剩最后 1 口气的危险状态，学会主动叫吃对方与及时为己方长气逃跑。',
    abilityDimension: 'logical',
    prerequisites: ['go.rules.capture'],
    tags: ['叫吃', '打吃', '长气逃跑']
  },
  {
    id: 'go.tactics.connect_cut',
    subjectId: 'go',
    gradeLevel: 'g1_t1',
    unitNumber: 3,
    title: '连接与分断（虎口、断点与分头）',
    category: '行棋手筋',
    importance: 'core',
    description: '掌握“棋从断处生”的战略思想，保护己方断点，切断对方联络形成以多打少。',
    abilityDimension: 'spatial',
    tags: ['连接', '分断', '断点']
  },
  {
    id: 'go.life_death.two_eyes',
    subjectId: 'go',
    gradeLevel: 'g1_t2',
    unitNumber: 1,
    title: '两眼活棋与真假眼辨析',
    category: '死活基础',
    importance: 'core',
    description: '理解禁入点规则，掌握做成两只独立真眼实现绝对活棋的死活基本定理。',
    abilityDimension: 'logical',
    prerequisites: ['go.tactics.connect_cut'],
    tags: ['两眼活棋', '真眼假眼', '死活']
  },
  {
    id: 'go.tactics.snapback',
    subjectId: 'go',
    gradeLevel: 'g2_t1',
    unitNumber: 1,
    title: '倒扑手筋（弃子引诱反提多子）',
    category: '中级战术',
    importance: 'extended',
    description: '主动将一子送入对方虎口被吃，随即利用对方气紧反提对方整块大棋。',
    abilityDimension: 'logical',
    prerequisites: ['go.tactics.atari'],
    tags: ['倒扑', '弃子手筋']
  }
];

export function getKnowledgePointById(id: string): KnowledgePoint | undefined {
  return KNOWLEDGE_POINTS_REPOSITORY.find(kp => kp.id === id);
}

export function getKnowledgePointsBySubject(subjectId: SubjectId): KnowledgePoint[] {
  return KNOWLEDGE_POINTS_REPOSITORY.filter(kp => kp.subjectId === subjectId);
}

export function getKnowledgePointsByGrade(gradeLevel: GradeLevel): KnowledgePoint[] {
  return KNOWLEDGE_POINTS_REPOSITORY.filter(kp => kp.gradeLevel === gradeLevel);
}

