/**
 * 对局奖励政策
 *
 * 人机对弈、双人对弈、吃子棋共用同一套「能不能发奖」与「幂等键长什么样」的判断，
 * 避免每个棋盘页面各写一套导致某一页漏判就能刷奖。
 */

import { buildRewardKey } from './rewardKey';

/** 奖励门槛：低于该手数视为无效对局（开局即点目、开局即认输等），只记谱不发奖励 */
export const MIN_REWARDED_MOVES = 20;

/** 奖励域：区分同一盘 matchId 在不同玩法下的归属 */
export type MatchRewardScope = 'ai' | 'local' | 'capture-go';

/**
 * 对局结算是否够资格发正常奖励。
 *
 * 「是否已经结算过」不在这里判断，交由 grantRewardOnce 的幂等账本统一负责。
 */
export function isRewardableMatch(totalMoves: number, resigned = false): boolean {
  if (resigned) return false;
  return totalMoves >= MIN_REWARDED_MOVES;
}

/** 对局奖励幂等键：`reward:go-match:<scope>:<matchId>:<outcome>` */
export function buildMatchRewardKey(
  scope: MatchRewardScope,
  matchId: string,
  outcome: 'win' | 'lose'
): string {
  return buildRewardKey('go-match', scope, matchId, outcome);
}
