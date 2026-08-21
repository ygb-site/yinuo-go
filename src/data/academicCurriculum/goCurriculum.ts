import { CHAPTERS_DATA, type Lesson as LegacyLesson } from '../chapters';
import type { UniversalChapter, UniversalLesson, GoBoardQuestionStep } from '../../types/curriculum';

export const GO_UNIVERSAL_CHAPTERS: UniversalChapter[] = CHAPTERS_DATA.map((ch) => {
  const lessons: UniversalLesson[] = ch.lessons.map((l: LegacyLesson) => {
    const subPuzzles = l.subPuzzles && l.subPuzzles.length > 0
      ? l.subPuzzles
      : [
          {
            stepIndex: 1,
            title: l.title,
            subtitle: l.subtitle,
            goalText: l.goalText,
            goalTextEn: l.goalTextEn,
            storyDialogues: l.storyDialogues,
            boardSize: l.boardSize,
            initialStones: l.initialStones,
            playerColor: l.playerColor,
            targetHighlight: l.targetHighlight,
            puzzleRoot: l.puzzleRoot,
            hint: l.hint,
            explanation: l.explanation
          }
        ];

    const steps: GoBoardQuestionStep[] = subPuzzles.map((sub, idx) => {
      return {
        id: `${l.id}_s${idx + 1}`,
        type: 'go_board',
        title: sub.title || `第 ${idx + 1} 题`,
        subtitle: sub.subtitle,
        promptText: sub.goalText,
        promptVoice: sub.goalText,
        dialogues: sub.storyDialogues,
        boardSize: sub.boardSize,
        initialStones: sub.initialStones,
        playerColor: sub.playerColor,
        targetHighlight: sub.targetHighlight,
        puzzleRoot: sub.puzzleRoot,
        stepIndex: sub.stepIndex,
        goalText: sub.goalText,
        goalTextEn: sub.goalTextEn,
        hint: sub.hint,
        explanation: sub.explanation
      };
    });

    return {
      id: l.id,
      subjectId: 'go',
      chapterId: ch.id,
      chapterTitle: ch.title,
      chapterIcon: ch.icon,
      title: l.title,
      subtitle: l.subtitle,
      icon: ch.icon || '♟️',
      badge: l.bilingualTerm?.chinese || '围棋',
      summary: l.description,
      rewards: l.rewards,
      steps
    };
  });

  return {
    id: ch.id,
    subjectId: 'go',
    title: ch.title,
    subtitle: ch.titleEn || '',
    icon: ch.icon,
    themeGradient: ch.themeColor,
    description: ch.description,
    badge: '弈林启蒙',
    lessons
  };
});

