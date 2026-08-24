import { defineStore } from 'pinia';
import type {
  SchoolStage,
  ExamRegion,
  ExamQuestion
} from '../types/curriculum';
import {
  SAMPLE_TEXTBOOK_CHAPTERS,
  K12_SUBJECTS
} from '../data/k12Curriculum';

export interface CustomChapter {
  id: string;
  unitName: string;
  lessonTitle: string;
  pageRange: string;
  coreKnowledge: string[];
  createdAt: number;
}

export interface TextbookInfo {
  subjectKey: string;
  subjectName: string;
  icon: string;
  textbookName: string;
  chapters: CustomChapter[];
}

export interface DaySubjectTask {
  id: string;
  subjectKey: string; // 'math', 'chinese', 'english', 'physics', or custom
  subjectName: string;
  subjectIcon: string;
  chapterTitle: string;
  pageRange: string;
  homeworkPrompt: string;
  imageUrl?: string;
  isCompleted: boolean;
  score?: number;
  generatedQuestions: ExamQuestion[];
  createdAt: number;
}

export interface CustomDayRecord {
  id: string;
  dateStr: string; // '2026-08-24'
  dayTitle: string; // '第 1 天 (8月24日 周一)'
  dayNote?: string;
  tasks: DaySubjectTask[]; // 语数外等学科任务
  createdAt: number;
}

export interface CustomGradeItem {
  id: string; // 'g1_t1', 'grade_123', etc.
  stage: SchoolStage;
  name: string; // '一年级上册'
  shortName: string;
  region: ExamRegion; // 'beijing' | 'hengshui'
  textbooks: TextbookInfo[]; // 本学期课本库
  days: CustomDayRecord[]; // 下面建天！
  createdAt: number;
}

const STORAGE_KEY = 'yinuo_custom_curriculum_v2';

function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDayTitle(dateStr: string, dayIndex: number): string {
  try {
    const d = new Date(dateStr);
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const w = weekdays[d.getDay()] || '';
    const m = d.getMonth() + 1;
    const date = d.getDate();
    return `第 ${dayIndex} 天 · ${m}月${date}日 ${w}`;
  } catch {
    return `第 ${dayIndex} 天 · ${dateStr}`;
  }
}

export const useCustomCurriculumStore = defineStore('customCurriculum', {
  state: () => {
    let initialGrades: CustomGradeItem[] = [];
    let initialActiveGradeId = '';
    let initialActiveDayId = '';

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.grades) && parsed.grades.length > 0) {
            initialGrades = parsed.grades;
            initialActiveGradeId = parsed.activeGradeId || parsed.grades[0].id;
            initialActiveDayId = parsed.activeDayId || (initialGrades[0].days[0]?.id || '');
          }
        }
      } catch (e) {
        console.error('Failed to load custom curriculum from storage', e);
      }
    }

    return {
      grades: initialGrades as CustomGradeItem[],
      activeGradeId: initialActiveGradeId as string,
      activeDayId: initialActiveDayId as string
    };
  },

  getters: {
    hasGrades(state): boolean {
      return state.grades.length > 0;
    },

    activeGrade(state): CustomGradeItem | null {
      if (state.grades.length === 0) return null;
      const found = state.grades.find(g => g.id === state.activeGradeId);
      return found || state.grades[0];
    },

    activeDays(): CustomDayRecord[] {
      return this.activeGrade ? this.activeGrade.days : [];
    },

    activeDay(state): CustomDayRecord | null {
      if (!this.activeGrade || this.activeGrade.days.length === 0) return null;
      const found = this.activeGrade.days.find(d => d.id === state.activeDayId);
      return found || this.activeGrade.days[0];
    },

    activeTextbooks(): TextbookInfo[] {
      return this.activeGrade ? this.activeGrade.textbooks : [];
    }
  },

  actions: {
    saveToStorage() {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            grades: this.grades,
            activeGradeId: this.activeGradeId,
            activeDayId: this.activeDayId
          })
        );
      }
    },

    setActiveGrade(gradeId: string) {
      this.activeGradeId = gradeId;
      const grade = this.grades.find(g => g.id === gradeId);
      if (grade && grade.days.length > 0) {
        this.activeDayId = grade.days[0].id;
      } else {
        this.activeDayId = '';
      }
      this.saveToStorage();
    },

    setActiveDay(dayId: string) {
      this.activeDayId = dayId;
      this.saveToStorage();
    },

    // 1. Create a Grade (e.g. 一年级上册)
    createGrade(options: {
      id?: string;
      stage: SchoolStage;
      name: string;
      region?: ExamRegion;
      initDefaultTextbooks?: boolean;
      createFirstDay?: boolean;
    }): CustomGradeItem {
      const gradeId = options.id || ('grade_' + Date.now());
      const region = options.region || 'hengshui';

      const defaultTextbooks: TextbookInfo[] = options.initDefaultTextbooks !== false ? [
        this.buildDefaultTextbook('math', options.name, region),
        this.buildDefaultTextbook('chinese', options.name, region),
        this.buildDefaultTextbook('english', options.name, region)
      ] : [];

      const newGrade: CustomGradeItem = {
        id: gradeId,
        stage: options.stage,
        name: options.name,
        shortName: options.name.slice(0, 2),
        region,
        textbooks: defaultTextbooks,
        days: [],
        createdAt: Date.now()
      };

      // Automatically create Day 1 if requested
      if (options.createFirstDay !== false) {
        const today = getTodayDateStr();
        const dayId = 'day_' + Date.now();
        const firstDay: CustomDayRecord = {
          id: dayId,
          dateStr: today,
          dayTitle: getDayTitle(today, 1),
          dayNote: '新学期伴学起航',
          tasks: [
            {
              id: 'task_math_' + Date.now(),
              subjectKey: 'math',
              subjectName: '数学',
              subjectIcon: '🔢',
              chapterTitle: defaultTextbooks[0]?.chapters[0] ? `${defaultTextbooks[0].chapters[0].unitName} - ${defaultTextbooks[0].chapters[0].lessonTitle}` : '随堂要点',
              pageRange: defaultTextbooks[0]?.chapters[0]?.pageRange || '第1-5页',
              homeworkPrompt: '',
              isCompleted: false,
              generatedQuestions: [],
              createdAt: Date.now()
            },
            {
              id: 'task_chinese_' + Date.now(),
              subjectKey: 'chinese',
              subjectName: '语文',
              subjectIcon: '🏮',
              chapterTitle: defaultTextbooks[1]?.chapters[0] ? `${defaultTextbooks[1].chapters[0].unitName} - ${defaultTextbooks[1].chapters[0].lessonTitle}` : '随堂要点',
              pageRange: defaultTextbooks[1]?.chapters[0]?.pageRange || '第1-5页',
              homeworkPrompt: '',
              isCompleted: false,
              generatedQuestions: [],
              createdAt: Date.now()
            },
            {
              id: 'task_english_' + Date.now(),
              subjectKey: 'english',
              subjectName: '英语',
              subjectIcon: '🔤',
              chapterTitle: defaultTextbooks[2]?.chapters[0] ? `${defaultTextbooks[2].chapters[0].unitName} - ${defaultTextbooks[2].chapters[0].lessonTitle}` : 'Unit 1',
              pageRange: defaultTextbooks[2]?.chapters[0]?.pageRange || 'Page 1-5',
              homeworkPrompt: '',
              isCompleted: false,
              generatedQuestions: [],
              createdAt: Date.now()
            }
          ],
          createdAt: Date.now()
        };
        newGrade.days.push(firstDay);
        this.activeDayId = dayId;
      }

      this.grades.push(newGrade);
      this.activeGradeId = gradeId;
      this.saveToStorage();
      return newGrade;
    },

    buildDefaultTextbook(subjectKey: string, gradeName: string, region: ExamRegion): TextbookInfo {
      const meta = K12_SUBJECTS.find(s => s.id === subjectKey) || K12_SUBJECTS[0];
      const versionLabel = region === 'beijing' ? '北京课改版' : '人教版';
      const textbookName = `${versionLabel}${gradeName}${meta.name}`;

      const matching = SAMPLE_TEXTBOOK_CHAPTERS.filter(
        c => c.subjectId === subjectKey && (gradeName.includes('一年级') ? c.gradeLevel.startsWith('g1') : true)
      ).slice(0, 6);

      const chapters: CustomChapter[] = matching.map((m, idx) => ({
        id: `ch_${subjectKey}_${idx + 1}_${Date.now()}`,
        unitName: m.unitName,
        lessonTitle: m.lessonTitle,
        pageRange: m.pageRange,
        coreKnowledge: m.coreKnowledge,
        createdAt: Date.now()
      }));

      return {
        subjectKey,
        subjectName: meta.name,
        icon: meta.icon,
        textbookName,
        chapters
      };
    },

    deleteGrade(gradeId: string) {
      const idx = this.grades.findIndex(g => g.id === gradeId);
      if (idx >= 0) {
        this.grades.splice(idx, 1);
        if (this.activeGradeId === gradeId) {
          this.activeGradeId = this.grades.length > 0 ? this.grades[0].id : '';
          this.activeDayId = this.grades.length > 0 && this.grades[0].days.length > 0 ? this.grades[0].days[0].id : '';
        }
        this.saveToStorage();
      }
    },

    // 2. Day Management (在年级下建天)
    createDay(gradeId: string, customDateStr?: string, customDayTitle?: string): CustomDayRecord | null {
      const grade = this.grades.find(g => g.id === gradeId);
      if (!grade) return null;

      const dateStr = customDateStr || getTodayDateStr();
      const dayIndex = grade.days.length + 1;
      const dayTitle = customDayTitle || getDayTitle(dateStr, dayIndex);
      const dayId = 'day_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5);

      // Preload available subjects from textbooks
      const defaultTasks: DaySubjectTask[] = (grade.textbooks.length > 0 ? grade.textbooks : [
        { subjectKey: 'math', subjectName: '数学', icon: '🔢', textbookName: '', chapters: [] },
        { subjectKey: 'chinese', subjectName: '语文', icon: '🏮', textbookName: '', chapters: [] },
        { subjectKey: 'english', subjectName: '英语', icon: '🔤', textbookName: '', chapters: [] }
      ]).map(tb => ({
        id: `task_${tb.subjectKey}_${Date.now()}_${Math.random().toString(36).slice(2, 4)}`,
        subjectKey: tb.subjectKey,
        subjectName: tb.subjectName,
        subjectIcon: tb.icon,
        chapterTitle: tb.chapters[0] ? `${tb.chapters[0].unitName} - ${tb.chapters[0].lessonTitle}` : '随堂练习',
        pageRange: tb.chapters[0]?.pageRange || '',
        homeworkPrompt: '',
        isCompleted: false,
        generatedQuestions: [],
        createdAt: Date.now()
      }));

      const newDay: CustomDayRecord = {
        id: dayId,
        dateStr,
        dayTitle,
        tasks: defaultTasks,
        createdAt: Date.now()
      };

      // Unshift to put newest day on top
      grade.days.unshift(newDay);
      this.activeDayId = dayId;
      this.saveToStorage();
      return newDay;
    },

    deleteDay(gradeId: string, dayId: string) {
      const grade = this.grades.find(g => g.id === gradeId);
      if (!grade) return;
      const idx = grade.days.findIndex(d => d.id === dayId);
      if (idx >= 0) {
        grade.days.splice(idx, 1);
        if (this.activeDayId === dayId) {
          this.activeDayId = grade.days.length > 0 ? grade.days[0].id : '';
        }
        this.saveToStorage();
      }
    },

    // 3. Subject Task in a Day (在当天里选语数外等学科)
    addTaskToDay(gradeId: string, dayId: string, subject: { key: string; name: string; icon: string }) {
      const grade = this.grades.find(g => g.id === gradeId);
      if (!grade) return;
      const day = grade.days.find(d => d.id === dayId);
      if (!day) return;

      const tb = grade.textbooks.find(t => t.subjectKey === subject.key);
      const newTask: DaySubjectTask = {
        id: `task_${subject.key}_${Date.now()}`,
        subjectKey: subject.key,
        subjectName: subject.name,
        subjectIcon: subject.icon,
        chapterTitle: tb?.chapters[0] ? `${tb.chapters[0].unitName} - ${tb.chapters[0].lessonTitle}` : '随堂练习',
        pageRange: tb?.chapters[0]?.pageRange || '',
        homeworkPrompt: '',
        isCompleted: false,
        generatedQuestions: [],
        createdAt: Date.now()
      };

      day.tasks.push(newTask);
      this.saveToStorage();
    },

    removeTaskFromDay(gradeId: string, dayId: string, taskId: string) {
      const grade = this.grades.find(g => g.id === gradeId);
      if (!grade) return;
      const day = grade.days.find(d => d.id === dayId);
      if (!day) return;
      const idx = day.tasks.findIndex(t => t.id === taskId);
      if (idx >= 0) {
        day.tasks.splice(idx, 1);
        this.saveToStorage();
      }
    },

    updateTaskHomework(gradeId: string, dayId: string, taskId: string, data: {
      chapterTitle?: string;
      pageRange?: string;
      homeworkPrompt?: string;
      imageUrl?: string;
      isCompleted?: boolean;
      score?: number;
      generatedQuestions?: ExamQuestion[];
    }) {
      const grade = this.grades.find(g => g.id === gradeId);
      if (!grade) return;
      const day = grade.days.find(d => d.id === dayId);
      if (!day) return;
      const task = day.tasks.find(t => t.id === taskId);
      if (!task) return;

      Object.assign(task, data);
      this.saveToStorage();
    },

    // 4. Textbook Library CRUD
    addTextbook(gradeId: string, textbook: TextbookInfo) {
      const grade = this.grades.find(g => g.id === gradeId);
      if (!grade) return;
      grade.textbooks.push(textbook);
      this.saveToStorage();
    },

    addChapterToTextbook(gradeId: string, subjectKey: string, chapter: Omit<CustomChapter, 'id' | 'createdAt'>) {
      const grade = this.grades.find(g => g.id === gradeId);
      if (!grade) return;
      const tb = grade.textbooks.find(t => t.subjectKey === subjectKey);
      if (!tb) return;

      tb.chapters.push({
        id: 'ch_' + Date.now(),
        ...chapter,
        createdAt: Date.now()
      });
      this.saveToStorage();
    },

    deleteChapterFromTextbook(gradeId: string, subjectKey: string, chapterId: string) {
      const grade = this.grades.find(g => g.id === gradeId);
      if (!grade) return;
      const tb = grade.textbooks.find(t => t.subjectKey === subjectKey);
      if (!tb) return;
      const idx = tb.chapters.findIndex(c => c.id === chapterId);
      if (idx >= 0) {
        tb.chapters.splice(idx, 1);
        this.saveToStorage();
      }
    }
  }
});

