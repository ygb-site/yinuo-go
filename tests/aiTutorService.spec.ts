import { describe, it, expect } from 'vitest';
import { AiTutorService } from '../src/services/aiTutorService';
import type { MistakeRecord } from '../types/curriculum';

describe('AiTutorService Unit Tests', () => {
  it('should generate 3 progressive hints for math mistakes', () => {
    const mistake: MistakeRecord = {
      id: 'm1',
      subjectId: 'math',
      topic: '两位数进位加法',
      questionPrompt: '38 + 47',
      userAnswer: '75',
      correctAnswer: '85',
      errorCategory: 'calculation',
      errorReason: '个位相加满十向十位进一遗漏',
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
    expect(hints[2].content).toContain('85');
  });

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
    expect(hints[0].speechText).toContain('数一数');
  });

  it('should generate variation quiz for math', () => {
    const mistake: MistakeRecord = {
      id: 'm2',
      subjectId: 'math',
      topic: '加法',
      questionPrompt: '25 + 17',
      userAnswer: '32',
      correctAnswer: '42',
      errorCategory: 'calculation',
      createdAt: Date.now(),
      resolved: false
    };

    const quiz = AiTutorService.generateVariationQuiz(mistake);
    expect(quiz.subjectId).toBe('math');
    expect(quiz.options.length).toBe(4);
    expect(quiz.prompt).toContain('+');
    expect(quiz.correctId).toBeDefined();
  });

  it('should generate comprehensive daily parent report', () => {
    const sampleMistakes: MistakeRecord[] = [
      {
        id: 'm1',
        subjectId: 'math',
        topic: '两位数进位加法',
        knowledgePointTitle: '两位数进位加法',
        questionPrompt: '28 + 19',
        correctAnswer: '47',
        errorCategory: 'calculation',
        createdAt: Date.now(),
        resolved: false
      },
      {
        id: 'm2',
        subjectId: 'math',
        topic: '退位减法',
        knowledgePointTitle: '退位减法',
        questionPrompt: '52 - 18',
        correctAnswer: '34',
        errorCategory: 'calculation',
        createdAt: Date.now(),
        resolved: true
      }
    ];

    const report = AiTutorService.generateDailyParentReport('2026-08-22', 4, sampleMistakes, 1);
    expect(report.date).toBe('2026-08-22');
    expect(report.totalMinutes).toBeGreaterThan(0);
    expect(report.completedLessons).toBe(4);
    expect(report.weakKnowledgePoints.length).toBeGreaterThan(0);
    expect(report.parentAdvice).toContain('AI 渐进式提示');
    expect(report.tomorrowRecommendations.length).toBeGreaterThan(0);
  });
});
