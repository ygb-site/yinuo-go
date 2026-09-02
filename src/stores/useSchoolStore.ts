import { defineStore } from 'pinia';
import { useUserStore } from './useUserStore';
import { resolveGrowthTracks, resolveGradeLevel } from '../domain/growth/tracks';
import { localDateKey } from '../domain/today/dayPhase';
import {
  applySleepShrink,
  buildDualTrackView,
  buildSchoolTasks,
  childVisibleTasks,
  clampBedtimeMinutes,
  clampTaskMinutes,
  computeSleepBudget,
  emptyHomeworkRecord,
  isTextbookSubjectId,
  notStartedLabel,
  primaryChildTask,
  resolveHomeworkRecord,
  resolveSchoolLayer,
  type DailyHomeworkItem,
  type DualTrackViewModel,
  type SchoolLayerState,
  type TextbookSubjectId
} from '../domain/school';
import { findChapterById } from '../data/school/textbookCatalog';

function newHomeworkId(): string {
  return `hw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function cloneLayer(layer: SchoolLayerState): SchoolLayerState {
  return resolveSchoolLayer(JSON.parse(JSON.stringify(layer)) as SchoolLayerState);
}

export const useSchoolStore = defineStore('school', {
  state: () => ({
    layer: resolveSchoolLayer() as SchoolLayerState,
    hydratedProfileId: '' as string
  }),
  getters: {
    todayKey(): string {
      return localDateKey();
    },
    todayHomework(): DailyHomeworkItem[] {
      return resolveHomeworkRecord(this.layer.homeworkByDate[this.todayKey], this.todayKey).items;
    },
    todayDoneIds(): string[] {
      return this.layer.taskDoneByDate[this.todayKey] || [];
    },
    dualTrack(): DualTrackViewModel {
      const userStore = useUserStore();
      const tracks = resolveGrowthTracks(userStore.currentProfile);
      return buildDualTrackView(
        this.layer.schoolTrack,
        this.layer.hometownTrack,
        tracks,
        userStore.currentProfile.gradeLevel
      );
    },
    generatedTasks() {
      const userStore = useUserStore();
      const tracks = resolveGrowthTracks(userStore.currentProfile);
      const raw = buildSchoolTasks({
        date: this.todayKey,
        homeworkItems: this.todayHomework,
        schoolTrack: this.layer.schoolTrack,
        doneIds: this.todayDoneIds,
        tracks,
        gradeLevel: userStore.currentProfile.gradeLevel
      });
      return applySleepShrink(raw, computeSleepBudget(this.layer.bedtimeMinutes));
    },
    childTasks() {
      return childVisibleTasks(this.generatedTasks);
    },
    primaryTask() {
      return primaryChildTask(this.generatedTasks);
    },
    hasStarted(): boolean {
      return this.dualTrack.schoolStarted || this.todayHomework.length > 0;
    },
    emptyLabel(): '尚未开始' {
      return notStartedLabel();
    }
  },
  actions: {
    hydrateFromProfile() {
      const userStore = useUserStore();
      if (!userStore.hasProfile) {
        this.layer = resolveSchoolLayer();
        this.hydratedProfileId = '';
        return;
      }
      const profile = userStore.currentProfile;
      const tracks = resolveGrowthTracks(profile);
      this.layer = resolveSchoolLayer(
        profile.schoolLayer,
        tracks.schoolTrack,
        tracks.hometownTrack,
        resolveGradeLevel(profile.gradeLevel)
      );
      this.hydratedProfileId = profile.id;
    },

    persistToProfile() {
      const userStore = useUserStore();
      if (!userStore.hasProfile) return;
      const snapshot = cloneLayer(this.layer);
      const prof = userStore.profiles.find((item) => item.id === userStore.currentProfileId);
      if (!prof) return;
      prof.schoolLayer = snapshot;
      userStore.touchSave();
    },

    setBedtimeMinutes(value: number) {
      this.layer.bedtimeMinutes = clampBedtimeMinutes(value);
      this.persistToProfile();
    },

    addHomework(input: {
      subjectId: TextbookSubjectId;
      parentNote: string;
      linkedLessonId?: string;
      estimatedMinutes?: number;
    }) {
      if (!isTextbookSubjectId(input.subjectId)) return;
      const date = this.todayKey;
      const current = resolveHomeworkRecord(this.layer.homeworkByDate[date], date);
      const item: DailyHomeworkItem = {
        id: newHomeworkId(),
        subjectId: input.subjectId,
        parentNote: (input.parentNote || '').trim().slice(0, 200),
        linkedLessonId: input.linkedLessonId,
        estimatedMinutes: clampTaskMinutes(input.estimatedMinutes, 15),
        createdAt: Date.now()
      };
      this.layer.homeworkByDate = {
        ...this.layer.homeworkByDate,
        [date]: {
          date,
          items: [...current.items, item],
          updatedAt: Date.now()
        }
      };
      this.persistToProfile();
    },

    removeHomework(itemId: string) {
      const date = this.todayKey;
      const current = resolveHomeworkRecord(this.layer.homeworkByDate[date], date);
      this.layer.homeworkByDate = {
        ...this.layer.homeworkByDate,
        [date]: {
          ...current,
          items: current.items.filter((item) => item.id !== itemId),
          updatedAt: Date.now()
        }
      };
      this.persistToProfile();
    },

    setActiveChapter(role: 'school' | 'hometown', chapterId: string | null) {
      if (chapterId) {
        const chapter = findChapterById(chapterId);
        if (!chapter) return;
      }
      const now = Date.now();
      if (role === 'school') {
        this.layer.schoolTrack = {
          ...this.layer.schoolTrack,
          activeChapterId: chapterId,
          updatedAt: now
        };
      } else {
        this.layer.hometownTrack = {
          ...this.layer.hometownTrack,
          activeChapterId: chapterId,
          updatedAt: now
        };
      }
      this.persistToProfile();
    },

    markLessonComplete(role: 'school' | 'hometown', lessonId: string) {
      if (!lessonId) return;
      const now = Date.now();
      const track = role === 'school' ? this.layer.schoolTrack : this.layer.hometownTrack;
      if (track.completedLessonIds.includes(lessonId)) return;
      const next = {
        ...track,
        completedLessonIds: [...track.completedLessonIds, lessonId],
        updatedAt: now
      };
      if (role === 'school') this.layer.schoolTrack = next;
      else this.layer.hometownTrack = next;
      this.persistToProfile();
    },

    toggleTaskDone(taskId: string) {
      const date = this.todayKey;
      const current = [...(this.layer.taskDoneByDate[date] || [])];
      const idx = current.indexOf(taskId);
      if (idx >= 0) current.splice(idx, 1);
      else current.push(taskId);
      this.layer.taskDoneByDate = {
        ...this.layer.taskDoneByDate,
        [date]: current
      };
      this.persistToProfile();
    }
  }
});

export { emptyHomeworkRecord };
