import { describe, expect, it } from 'vitest';
import {
  applyXiangqiMove,
  boardFromPieces,
  generateLegalMovesFrom,
  getPositionStatus
} from '../src/engine/xiangqi/xiangqiEngine';
import { XIANGQI_ENDGAMES, XIANGQI_LESSONS } from '../src/data/xiangqiCurriculum';

describe('象棋教程与残局', () => {
  it('每节走子课的目标步都是合法着法', () => {
    for (const lesson of XIANGQI_LESSONS) {
      for (const step of lesson.steps) {
        if (step.action !== 'move' || !step.selectAt) continue;
        const board = boardFromPieces(step.pieces);
        const legal = generateLegalMovesFrom(board, step.selectAt.r, step.selectAt.c);
        expect(legal.some((m) => m.toR === step.target.r && m.toC === step.target.c), `${lesson.id} ${step.title}`).toBe(true);
      }
    }
  });

  it('塞眼和蹩马实例在堵死后没有可飞可跳的绿点', () => {
    const stuck = [
      { id: 'xq_l4', title: '找出象眼' },
      { id: 'xq_l4', title: '塞眼飞不过' },
      { id: 'xq_l4', title: '相不能过河' },
      { id: 'xq_l5', title: '找出马腿' },
      { id: 'xq_l5', title: '蹩住就跳不过' }
    ];
    for (const item of stuck) {
      const lesson = XIANGQI_LESSONS.find((row) => row.id === item.id);
      const step = lesson?.steps.find((row) => row.title === item.title);
      expect(step?.selectAt, item.title).toBeTruthy();
      const board = boardFromPieces(step!.pieces);
      const legal = generateLegalMovesFrom(board, step!.selectAt!.r, step!.selectAt!.c);
      expect(legal, `${item.id} ${item.title} 应被完全憋住`).toEqual([]);
    }
  });

  it('蹩马脚和塞象眼的红圈都是不合法着法', () => {
    for (const lesson of XIANGQI_LESSONS) {
      for (const step of lesson.steps) {
        if (!step.selectAt || !step.blockedTargets?.length) continue;
        const board = boardFromPieces(step.pieces);
        const legal = generateLegalMovesFrom(board, step.selectAt.r, step.selectAt.c);
        for (const blocked of step.blockedTargets) {
          expect(
            legal.some((m) => m.toR === blocked.r && m.toC === blocked.c),
            `${lesson.id} ${step.title} 不该能走到 ${blocked.r},${blocked.c}`
          ).toBe(false);
        }
      }
    }
  });

  it('每道残局的正解一步将死', () => {
    for (const puzzle of XIANGQI_ENDGAMES) {
      const start = boardFromPieces(puzzle.pieces);
      expect(getPositionStatus(start, puzzle.side), `${puzzle.id} 开局应能走`).not.toBe('checkmate');

      const applied = applyXiangqiMove(
        start,
        puzzle.solution.fromR,
        puzzle.solution.fromC,
        puzzle.solution.toR,
        puzzle.solution.toC
      );
      expect(applied, `${puzzle.id} 正解必须合法`).not.toBeNull();
      const opp = puzzle.side === 'red' ? 'black' : 'red';
      expect(getPositionStatus(applied!.board, opp), `${puzzle.id} 应被将死`).toBe('checkmate');
    }
  });
});
