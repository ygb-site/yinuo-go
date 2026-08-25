import { describe, it, expect } from 'vitest';
import { AiTutorService } from '../src/services/aiTutorService';
import type { MistakeRecord } from '../src/types/curriculum';

describe('AiTutorService Unit Tests', () => {
  it('should generate 3 progressive hints for Go mistakes', () => {
    const mistake: MistakeRecord = {
      id: 'm_go',
      subjectId: 'go',
      topic: '两眼做活',
      questionPrompt: '黑先如何做活',
      userAnswer: 'D4',
      correctAnswer: 'C3',
      errorCategory: 'concept',
      createdAt: Date.now(),
      resolved: false
    };

    const hints = AiTutorService.getProgressiveHints(mistake);
    expect(hints.length).toBe(3);
    expect(hints[0].step).toBe(1);
    expect(hints[0].type).toBe('concept_reminder');
    expect(hints[1].step).toBe(2);
    expect(hints[1].type).toBe('key_operation');
    expect(hints[2].step).toBe(3);
    expect(hints[2].type).toBe('solution_breakdown');
    expect(hints[0].speechText).toContain('数一数');
  });

  it('should generate variation quiz for Go', () => {
    const mistake: MistakeRecord = {
      id: 'm2',
      subjectId: 'go',
      topic: '做眼活棋',
      questionPrompt: '黑先如何占领真眼',
      userAnswer: 'B2',
      correctAnswer: 'C3',
      errorCategory: 'concept',
      createdAt: Date.now(),
      resolved: false
    };

    const quiz = AiTutorService.generateVariationQuiz(mistake);
    expect(quiz.subjectId).toBe('go');
    expect(quiz.options.length).toBe(4);
    expect(quiz.correctId).toBeDefined();
  });

  it('should generate comprehensive daily parent report for Go & Strategy', () => {
    const sampleMistakes: MistakeRecord[] = [
      {
        id: 'm1',
        subjectId: 'go',
        topic: '真假眼辨析',
        knowledgePointTitle: '两眼活棋',
        questionPrompt: '黑先做活',
        correctAnswer: 'C3',
        errorCategory: 'concept',
        createdAt: Date.now(),
        resolved: false
      },
      {
        id: 'm2',
        subjectId: 'go',
        topic: '倒扑手筋',
        knowledgePointTitle: '倒扑手筋',
        questionPrompt: '黑先提子',
        correctAnswer: 'D4',
        errorCategory: 'concept',
        createdAt: Date.now(),
        resolved: true
      }
    ];

    const report = AiTutorService.generateDailyParentReport('2026-08-25', 4, sampleMistakes, 1);
    expect(report.date).toBe('2026-08-25');
    expect(report.totalMinutes).toBeGreaterThan(0);
    expect(report.completedLessons).toBe(4);
    expect(report.weakKnowledgePoints.length).toBeGreaterThan(0);
    expect(report.parentAdvice).toContain('AI 渐进式提示');
    expect(report.tomorrowRecommendations.length).toBeGreaterThan(0);
  });
});

