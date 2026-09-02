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
  type DailyStudyTask,
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

/** 从 state 纯函数派生任务，避免 getter 里 this 互相引用被 vue-tsc -b 推错类型 */
function buildTasksFromLayer(layer: SchoolLayerState): DailyStudyTask[] {
  const userStore = useUserStore();
  const tracks = resolveGrowthTracks(userStore.currentProfile);
  const date = localDateKey();
  const homeworkItems = resolveHomeworkRecord(layer.homeworkByDate[date], date).items;
  const doneIds = layer.taskDoneByDate[date] || [];
  const raw = buildSchoolTasks({
    date,
    homeworkItems,
    schoolTrack: layer.schoolTrack,
    doneIds,
    tracks,
    gradeLevel: userStore.currentProfile.gradeLevel
  });
  return applySleepShrink(raw, computeSleepBudget(layer.bedtimeMinutes));
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
    todayHomework(state): DailyHomeworkItem[] {
      const date = localDateKey();
      return resolveHomeworkRecord(state.layer.homeworkByDate[date], date).items;
    },
    todayDoneIds(state): string[] {
      return state.layer.taskDoneByDate[localDateKey()] || [];
    },
    dualTrack(state): DualTrackViewModel {
      const userStore = useUserStore();
      const tracks = resolveGrowthTracks(userStore.currentProfile);
      return buildDualTrackView(
        state.layer.schoolTrack,
        state.layer.hometownTrack,
        tracks,
        userStore.currentProfile.gradeLevel
      );
    },
    generatedTasks(state): DailyStudyTask[] {
      return buildTasksFromLayer(state.layer);
    },
    childTasks(state): DailyStudyTask[] {
      return childVisibleTasks(buildTasksFromLayer(state.layer));
    },
    primaryTask(state): DailyStudyTask | null {
      return primaryChildTask(buildTasksFromLayer(state.layer));
    },
    hasStarted(state): boolean {
      const userStore = useUserStore();
      const tracks = resolveGrowthTracks(userStore.currentProfile);
      const view = buildDualTrackView(
        state.layer.schoolTrack,
        state.layer.hometownTrack,
        tracks,
        userStore.currentProfile.gradeLevel
      );
      const date = localDateKey();
      const homeworkCount = resolveHomeworkRecord(state.layer.homeworkByDate[date], date).items.length;
      return view.schoolStarted || homeworkCount > 0;
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
      const date = localDateKey();
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
      const date = localDateKey();
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
      if (role === 'school') {
        const track = this.layer.schoolTrack;
        if (track.completedLessonIds.includes(lessonId)) return;
        this.layer.schoolTrack = {
          role: 'school',
          city: track.city,
          editionId: track.editionId,
          gradeLevel: track.gradeLevel,
          completedLessonIds: [...track.completedLessonIds, lessonId],
          activeChapterId: track.activeChapterId,
          updatedAt: now
        };
        this.persistToProfile();
        return;
      }
      const track = this.layer.hometownTrack;
      if (track.completedLessonIds.includes(lessonId)) return;
      this.layer.hometownTrack = {
        role: 'hometown',
        city: track.city,
        editionId: track.editionId,
        gradeLevel: track.gradeLevel,
        completedLessonIds: [...track.completedLessonIds, lessonId],
        activeChapterId: track.activeChapterId,
        updatedAt: now
      };
      this.persistToProfile();
    },

    toggleTaskDone(taskId: string) {
      const date = localDateKey();
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
