import { describe, it, expect } from 'vitest';
import { generateDrillQuestions } from '../src/services/mathDrillEngine';

describe('MathDrillEngine Algorithm Tests', () => {
  describe('100以内进退位加减法 (Carry & Borrow Drill)', () => {
    it('should generate the exact requested number of questions', () => {
      const questions = generateDrillQuestions({ type: 'add_sub_100_carry', count: 30 });
      expect(questions.length).toBe(30);
    });

    it('should guarantee mathematical correctness for all generated questions', () => {
      const questions = generateDrillQuestions({ type: 'add_sub_100_carry', count: 50 });
      for (const q of questions) {
        if (q.op === '+') {
          expect(q.num1 + q.num2).toBe(q.correctAnswer);
          expect(q.isCarryOrBorrow).toBe(true);
        } else if (q.op === '-') {
          expect(q.num1 - q.num2).toBe(q.correctAnswer);
          expect(q.isCarryOrBorrow).toBe(true);
        }
      }
    });

    it('should have isCarryOrBorrow flag set to true for all carry_sub questions', () => {
      const questions = generateDrillQuestions({ type: 'add_sub_100_carry', count: 20 });
      for (const q of questions) {
        expect(q.isCarryOrBorrow).toBe(true);
      }
    });
  });

  describe('20以内凑十法与破十法 (add_sub_20)', () => {
    it('should generate questions within 20 range with correct carry/borrow', () => {
      const questions = generateDrillQuestions({ type: 'add_sub_20', count: 20 });
      expect(questions.length).toBe(20);
      for (const q of questions) {
        expect(q.num1).toBeGreaterThanOrEqual(1);
        expect(q.num2).toBeGreaterThanOrEqual(1);
        if (q.op === '+') {
          expect(q.num1 + q.num2).toBe(q.correctAnswer);
          expect(q.correctAnswer).toBeGreaterThanOrEqual(10);
          expect(q.correctAnswer).toBeLessThanOrEqual(20);
        } else {
          expect(q.num1 - q.num2).toBe(q.correctAnswer);
          expect(q.num1).toBeGreaterThanOrEqual(10);
          expect(q.num1).toBeLessThanOrEqual(20);
        }
      }
    });
  });

  describe('100以内三数连加连减与混合运算 (add_sub_100_mixed)', () => {
    it('should generate 3-number expressions with proper operations', () => {
      const questions = generateDrillQuestions({ type: 'add_sub_100_mixed', count: 15 });
      expect(questions.length).toBe(15);
      for (const q of questions) {
        expect(q.num3).toBeDefined();
        expect(q.op2).toBeDefined();
        let step1 = q.op === '+' ? q.num1 + q.num2 : q.num1 - q.num2;
        let expected = q.op2 === '+' ? step1 + (q.num3 || 0) : step1 - (q.num3 || 0);
        expect(q.correctAnswer).toBe(expected);
      }
    });
  });

  describe('九九乘除法 (multi_div_99)', () => {
    it('should generate valid 9x9 multiplication and exact division', () => {
      const questions = generateDrillQuestions({ type: 'multi_div_99', count: 25 });
      expect(questions.length).toBe(25);
      for (const q of questions) {
        if (q.op === '×') {
          expect(q.num1 * q.num2).toBe(q.correctAnswer);
        } else if (q.op === '÷') {
          expect(q.num1 % q.num2).toBe(0);
          expect(q.num1 / q.num2).toBe(q.correctAnswer);
        }
      }
    });
  });
});
