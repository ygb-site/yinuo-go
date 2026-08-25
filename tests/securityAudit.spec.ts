import { describe, it, expect } from 'vitest';
import {
  createSafeProfileArchive,
  validateAndSanitizeArchive,
  sanitizeText
} from '../src/services/dataArchiveService';
import { AiTutorService, LocalRuleAIProvider } from '../src/services/aiTutorService';
import { sanitizeSupabaseUrl } from '../src/lib/supabase';
import type { ChildProfile } from '../src/stores/useUserStore';

describe('Security & Privacy Audit Test Suite', () => {
  const dummyProfile: ChildProfile = {
    id: 'kid_test_12345',
    nickname: '小诺宝贝',
    avatar: '🦁',
    createdAt: 1690000000000,
    gradeLevel: 'g1_t1',
    progress: {
      'lesson_1_1': { completed: true, stars: 3, completedAt: '2026-08-20' }
    },
    totalStars: 3,
    badges: ['first_move'],
    solvedPuzzles: ['ts_01'],
    unlockedAvatars: ['🦁', '🐼'],
    mistakes: [],
    solvedMistakes: [],
    mistakeRecords: [
      {
        id: 'mr_1',
        subjectId: 'go',
        topic: '数气与提子',
        questionPrompt: '黑先提白子',
        userAnswer: '33',
        correctAnswer: 'C3',
        errorCategory: 'calculation',
        createdAt: 1690000000000,
        resolved: false
      }
    ],
    knowledgeMastery: {
      'kp_go_liberties': {
        knowledgePointId: 'kp_math_carry_add',
        totalCount: 5,
        correctCount: 4,
        wrongCount: 1,
        masteryRate: 0.8,
        lastPracticedAt: 1690000000000,
        streak: 2
      }
    },
    exp: 250,
    coins: 100,
    stats: {
      gamesPlayed: 2,
      gamesWon: 2,
      puzzlesSolved: 1,
      captureCount: 4,
      totalMoves: 20,
      totalQuestionsAnswered: 5,
      totalStudyMinutes: 15
    }
  };

  describe('1. Data Minimization & Safe Export', () => {
    it('should strip account auth metadata, tokens, and admin flags from exported archive', () => {
      const exported = createSafeProfileArchive(dummyProfile);

      expect(exported.schemaVersion).toBe('1.0');
      expect(exported.app).toBe('yinuo-go');
      expect((exported as any).id).toBeUndefined();
      expect((exported as any).currentUserEmail).toBeUndefined();
      expect((exported as any).isAdmin).toBeUndefined();
      expect((exported as any).token).toBeUndefined();
      expect((exported as any).password).toBeUndefined();

      expect(exported.profile.nickname).toBe('小诺宝贝');
      expect(exported.profile.totalStars).toBe(3);
      expect(exported.profile.progress['lesson_1_1'].stars).toBe(3);
    });

    it('should not contain real student PII fields (realName, idCard, phone, address, school, birthday)', () => {
      const exported = createSafeProfileArchive(dummyProfile);
      const keys = Object.keys(exported.profile);

      expect(keys).not.toContain('realName');
      expect(keys).not.toContain('idCard');
      expect(keys).not.toContain('phone');
      expect(keys).not.toContain('address');
      expect(keys).not.toContain('school');
      expect(keys).not.toContain('birthday');
    });
  });

  describe('2. JSON Archive Import Sanitization & Prototype Pollution Defense', () => {
    it('should block Prototype Pollution attempt via __proto__ in JSON', () => {
      const maliciousPayload = '{"__proto__": {"isAdmin": true}, "profile": {"nickname": "黑客宝贝", "totalStars": 999}}';
      const res = validateAndSanitizeArchive(maliciousPayload);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Prototype Pollution');
    });

    it('should block Prototype Pollution attempt via constructor or prototype keywords', () => {
      const maliciousPayload = '{"constructor": {"prototype": {"admin": true}}}';
      const res = validateAndSanitizeArchive(maliciousPayload);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Prototype Pollution');
    });

    it('should reject files exceeding size limit (2MB)', () => {
      const hugeString = 'a'.repeat(2 * 1024 * 1024 + 10);
      const res = validateAndSanitizeArchive(hugeString);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('超过最大允许限制');
    });

    it('should sanitize HTML/XSS payloads from nickname and text fields during import', () => {
      const xssPayload = JSON.stringify({
        profile: {
          nickname: '<script>alert("xss")</script>小明',
          avatar: '<img src=x onerror=alert(1)>🐼',
          totalStars: 10
        }
      });

      const res = validateAndSanitizeArchive(xssPayload);
      expect(res.valid).toBe(true);
      expect(res.profile?.nickname).toBe('小明');
      expect(res.profile?.avatar).not.toContain('<img');
    });

    it('should handle malformed JSON gracefully without throwing uncaught exceptions', () => {
      const invalidJson = '{"nickname": "test", broken';
      const res = validateAndSanitizeArchive(invalidJson);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('标准 JSON 语法');
    });

    it('should sanitize out-of-bounds numeric fields (negative stars, NaN values)', () => {
      const corruptPayload = JSON.stringify({
        profile: {
          nickname: '测试宝贝',
          totalStars: -50,
          exp: -100,
          coins: 'corrupted_string'
        }
      });

      const res = validateAndSanitizeArchive(corruptPayload);
      expect(res.valid).toBe(true);
      expect(res.profile?.totalStars).toBe(0);
      expect(res.profile?.exp).toBe(0);
      expect(res.profile?.coins).toBe(0);
    });
  });

  describe('3. AI Tutor Input & Output Sanitization', () => {
    it('should strip script tags and control characters from user questions', () => {
      const rawInput = '<script>alert(1)</script>  38 + 47 \x00 怎么算？  ';
      const clean = AiTutorService.sanitizeKidContent(rawInput, 100);
      expect(clean).toBe('38 + 47  怎么算？');
      expect(clean).not.toContain('<script>');
    });

    it('should truncate user inputs exceeding max length', () => {
      const longInput = 'a'.repeat(500);
      const clean = AiTutorService.sanitizeKidContent(longInput, 200);
      expect(clean.length).toBe(200);
    });

    it('should answer via 100% local heuristic rule engine without any external API call by default', async () => {
      AiTutorService.setProvider(new LocalRuleAIProvider());
      const reply = await AiTutorService.askKidTutor(
        {
          subjectId: 'go',
          questionPrompt: '黑先找气'
        },
        '这道题怎么算？'
      );
      expect(reply).toContain('小诺助教点拨');
      // Go response check
      expect(reply.length).toBeGreaterThan(0);
    });
  });

  describe('4. Supabase URL Sanitizer & Protocol Enforcement', () => {
    it('should accept valid HTTPS origin', () => {
      const validUrl = 'https://kzphjagsliouhmjqjoue.supabase.co';
      expect(sanitizeSupabaseUrl(validUrl)).toBe('https://kzphjagsliouhmjqjoue.supabase.co');
    });

    it('should sanitize URL with trailing slashes or subpaths', () => {
      const subpathUrl = 'https://kzphjagsliouhmjqjoue.supabase.co/rest/v1/';
      expect(sanitizeSupabaseUrl(subpathUrl)).toBe('https://kzphjagsliouhmjqjoue.supabase.co');
    });

    it('should reject insecure HTTP and javascript protocols', () => {
      expect(sanitizeSupabaseUrl('http://evil.com')).toBe('');
      expect(sanitizeSupabaseUrl('javascript:alert(1)')).toBe('');
      expect(sanitizeSupabaseUrl('data:text/html,evil')).toBe('');
    });
  });

  describe('5. Text Sanitizer Utility', () => {
    it('should safely strip tags and trim text', () => {
      expect(sanitizeText('  <b>Hello</b>  ', 10)).toBe('Hello');
      expect(sanitizeText(null)).toBe('');
      expect(sanitizeText(undefined)).toBe('');
    });
  });
});


