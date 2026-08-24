import { GoGame } from '../engine/GoGame';
import type { BoardSize, MoveRecord, Point, ScoreBreakdown, StoneColor } from '../engine/types';

export type MoveQuality = 'god_move' | 'great_move' | 'normal_move' | 'slow_move' | 'blunder';

export interface StepReviewInfo {
  stepIndex: number;
  color: StoneColor;
  point: Point | null;
  coordLabel: string;
  blackWinRate: number;
  whiteWinRate: number;
  winRateDelta: number;
  leadScore: number;
  quality: MoveQuality;
  qualityBadge: string;
  qualityDesc: string;
  comment: string;
  isKeyTurningPoint: boolean;
  turningType?: 'advantage' | 'disadvantage' | 'turning' | 'winning';
  isFatalDefeatPoint?: boolean;
  isDecisiveWinPoint?: boolean;
}

export interface WinRateSnapshot {
  blackWinRate: number;
  whiteWinRate: number;
  leadScore: number;
  leadDesc: string;
  status: 'equal' | 'black_slight' | 'black_lead' | 'black_win' | 'white_slight' | 'white_lead' | 'white_win';
  statusText: string;
}

export interface GameReviewReport {
  boardSize: BoardSize;
  komi: number;
  totalSteps: number;
  finalScore: ScoreBreakdown;
  steps: StepReviewInfo[];
  blackGodMoves: number;
  blackBlunders: number;
  whiteGodMoves: number;
  whiteBlunders: number;
  keyTurningSteps: StepReviewInfo[];
  advantageMoveBlack?: StepReviewInfo;
  advantageMoveWhite?: StepReviewInfo;
  disadvantageMoveBlack?: StepReviewInfo;
  disadvantageMoveWhite?: StepReviewInfo;
  decisiveWinMove?: StepReviewInfo;
  fatalDefeatMove?: StepReviewInfo;
  summaryHeadline: string;
  summaryCommentary: string;
}

export interface LiveMoveEvaluation {
  stepIndex: number;
  color: StoneColor;
  point: Point | null;
  coordLabel: string;
  termBadge: string;
  termName: string;
  quality: MoveQuality;
  winRate: number;
  winRateDelta: number;
  commentary: string;
  themeColor: 'purple' | 'emerald' | 'blue' | 'amber' | 'rose';
}

export function formatGoCoordinate(point: Point | null, boardSize: BoardSize = 9): string {
  if (!point) return '停一手 (Pass)';
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
  const colLetter = letters[point.c] || String(point.c + 1);
  const rowNumber = boardSize - point.r;
  const raw = `${colLetter}${rowNumber}`;

  const s = boardSize;
  const mid = Math.floor(s / 2);
  if (point.r === mid && point.c === mid) {
    return `${raw} (天元)`;
  }

  if (s === 9) {
    if ((point.r === 2 || point.r === 6) && (point.c === 2 || point.c === 6)) {
      return `${raw} (星位)`;
    }
  } else if (s === 19) {
    if ((point.r === 3 || point.r === 15) && (point.c === 3 || point.c === 15)) {
      return `${raw} (星位)`;
    }
  } else if (s === 13) {
    if ((point.r === 3 || point.r === 9) && (point.c === 3 || point.c === 9)) {
      return `${raw} (星位)`;
    }
  }

  return raw;
}

export function calculateWinRate(game: GoGame): WinRateSnapshot {
  const score = game.calculateScore();
  const s = game.size;

  const rawMargin = score.blackTotal - score.whiteTotal;

  const ataris = game.checkAtari();
  let blackAtariStones = 0;
  let whiteAtariStones = 0;

  for (const at of ataris) {
    if (at.color === 'B') {
      blackAtariStones += at.group.stones.length;
    } else {
      whiteAtariStones += at.group.stones.length;
    }
  }

  const adjustedMargin = rawMargin + (whiteAtariStones * 1.5) - (blackAtariStones * 1.5);
  const k = s <= 7 ? 2.5 : s <= 9 ? 3.6 : s <= 13 ? 5.5 : 8.0;

  const bProb = 1 / (1 + Math.exp(-adjustedMargin / k));
  let blackWinRate = Math.round(bProb * 1000) / 10;

  if (game.history.length === 0) {
    blackWinRate = 50.0;
  } else if (game.isGameFinished()) {
    blackWinRate = score.winner === 'B' ? 100.0 : score.winner === 'W' ? 0.0 : 50.0;
  } else {
    blackWinRate = Math.max(1.0, Math.min(99.0, blackWinRate));
  }

  const whiteWinRate = Math.round((100.0 - blackWinRate) * 10) / 10;
  const leadScore = Math.round(adjustedMargin * 10) / 10;

  let status: WinRateSnapshot['status'] = 'equal';
  let statusText = '⚖️ 双方均势';
  let leadDesc = '局势焦灼，势均力敌';

  if (blackWinRate >= 80.0) {
    status = 'black_win';
    statusText = `⚫ 黑方胜势 (领先约 ${Math.abs(leadScore)} 目)`;
    leadDesc = '黑棋已确立压倒性胜势！';
  } else if (blackWinRate >= 65.0) {
    status = 'black_lead';
    statusText = `⚫ 黑方优势 (领先约 ${Math.abs(leadScore)} 目)`;
    leadDesc = '黑棋占据主导权，局势占优';
  } else if (blackWinRate >= 55.0) {
    status = 'black_slight';
    statusText = `⚫ 黑方微优 (领先约 ${Math.abs(leadScore)} 目)`;
    leadDesc = '黑棋略占先手，白棋需寻机反扑';
  } else if (whiteWinRate >= 80.0) {
    status = 'white_win';
    statusText = `⚪ 白方胜势 (领先约 ${Math.abs(leadScore)} 目)`;
    leadDesc = '白棋已确立压倒性胜势！';
  } else if (whiteWinRate >= 65.0) {
    status = 'white_lead';
    statusText = `⚪ 白方优势 (领先约 ${Math.abs(leadScore)} 目)`;
    leadDesc = '白棋占据主动，局势明显占优';
  } else if (whiteWinRate >= 55.0) {
    status = 'white_slight';
    statusText = `⚪ 白方微优 (领先约 ${Math.abs(leadScore)} 目)`;
    leadDesc = '白棋略占上风，黑棋积极周旋中';
  }

  return {
    blackWinRate,
    whiteWinRate,
    leadScore,
    leadDesc,
    status,
    statusText
  };
}

export function generateGameReview(
  history: MoveRecord[],
  boardSize: BoardSize = 9,
  komi: number = 3.5
): GameReviewReport {
  const steps: StepReviewInfo[] = [];
  const replayGame = new GoGame(boardSize, komi);

  let prevBlackWinRate = 50.0;
  let blackGodMoves = 0;
  let blackBlunders = 0;
  let whiteGodMoves = 0;
  let whiteBlunders = 0;

  let advantageMoveBlack: StepReviewInfo | undefined = undefined;
  let advantageMoveWhite: StepReviewInfo | undefined = undefined;
  let disadvantageMoveBlack: StepReviewInfo | undefined = undefined;
  let disadvantageMoveWhite: StepReviewInfo | undefined = undefined;

  for (let i = 0; i < history.length; i++) {
    const rec = history[i];
    const stepIndex = i + 1;
    const isBlack = rec.color === 'B';

    if (rec.point === null) {
      replayGame.pass(rec.color);
    } else {
      replayGame.playMove(rec.point.r, rec.point.c, rec.color);
    }

    const snapshot = calculateWinRate(replayGame);
    const curBlackWinRate = snapshot.blackWinRate;
    const curWhiteWinRate = snapshot.whiteWinRate;

    const activeWinRate = isBlack ? curBlackWinRate : curWhiteWinRate;
    const prevActiveWinRate = isBlack ? prevBlackWinRate : (100.0 - prevBlackWinRate);
    const winRateDelta = Math.round((activeWinRate - prevActiveWinRate) * 10) / 10;

    let quality: MoveQuality = 'normal_move';
    let qualityBadge = '🔵 本手';
    let qualityDesc = '正着稳健，局势平稳';
    let isKeyTurningPoint = false;
    let turningType: StepReviewInfo['turningType'] = undefined;

    const capCount = rec.capturedStones ? rec.capturedStones.length : 0;

    if (winRateDelta >= 12.0 || capCount >= 3) {
      quality = 'god_move';
      qualityBadge = '🌟 妙手';
      qualityDesc = '精准手筋，大幅扩大优势';
      isKeyTurningPoint = true;
      turningType = activeWinRate >= 70.0 ? 'winning' : 'turning';
      if (isBlack) blackGodMoves++; else whiteGodMoves++;
    } else if (winRateDelta >= 5.0 || capCount >= 1) {
      quality = 'great_move';
      qualityBadge = '🟢 好棋';
      qualityDesc = '积极主动，确立先手机会';
      if (activeWinRate >= 60.0 && !isKeyTurningPoint) {
        isKeyTurningPoint = true;
        turningType = 'advantage';
      }
    } else if (winRateDelta <= -12.0) {
      quality = 'blunder';
      qualityBadge = '🔴 恶手';
      qualityDesc = '严重失误，让对手抓住胜机';
      isKeyTurningPoint = true;
      turningType = 'disadvantage';
      if (isBlack) blackBlunders++; else whiteBlunders++;
    } else if (winRateDelta <= -5.0) {
      quality = 'slow_move';
      qualityBadge = '🟡 缓手';
      qualityDesc = '落子偏缓，稍失进攻良机';
    }

    const pName = isBlack ? '黑棋' : '白棋';
    const oppName = isBlack ? '白棋' : '黑棋';
    const cLabel = formatGoCoordinate(rec.point, boardSize);

    const stepObj: StepReviewInfo = {
      stepIndex,
      color: rec.color,
      point: rec.point,
      coordLabel: cLabel,
      blackWinRate: curBlackWinRate,
      whiteWinRate: curWhiteWinRate,
      winRateDelta,
      leadScore: snapshot.leadScore,
      quality,
      qualityBadge,
      qualityDesc,
      comment: '',
      isKeyTurningPoint,
      turningType
    };

    if (isBlack && curBlackWinRate >= 65.0 && !advantageMoveBlack) {
      advantageMoveBlack = stepObj;
      stepObj.isKeyTurningPoint = true;
      stepObj.turningType = 'advantage';
    } else if (!isBlack && curWhiteWinRate >= 65.0 && !advantageMoveWhite) {
      advantageMoveWhite = stepObj;
      stepObj.isKeyTurningPoint = true;
      stepObj.turningType = 'advantage';
    }

    if (isBlack && curBlackWinRate <= 35.0 && !disadvantageMoveBlack) {
      disadvantageMoveBlack = stepObj;
      stepObj.isKeyTurningPoint = true;
      stepObj.turningType = 'disadvantage';
    } else if (!isBlack && curWhiteWinRate <= 35.0 && !disadvantageMoveWhite) {
      disadvantageMoveWhite = stepObj;
      stepObj.isKeyTurningPoint = true;
      stepObj.turningType = 'disadvantage';
    }

    let comment = '';
    if (rec.point === null) {
      comment = `${pName}选择停一手 (Pass)，当前胜率约为 ${activeWinRate}%。`;
    } else if (capCount > 0) {
      comment = `${pName}落子在 ${cLabel} 成功提吃敌方 ${capCount} 颗子！胜率${winRateDelta >= 0 ? '上涨' : '变动'}至 ${activeWinRate}%。`;
    } else if (quality === 'god_move') {
      comment = `【★关键胜负手】${pName}弈出妙手 ${cLabel}！胜率飙升 +${winRateDelta}%，一举确立胜势局面！`;
    } else if (quality === 'great_move') {
      comment = `${pName}落子在 ${cLabel} 占住要害，行棋扎实，胜率提升至 ${activeWinRate}%。`;
    } else if (quality === 'blunder') {
      comment = `【⚠️劣势转折点】${pName}在此处下出失误手，自身气数受损或阵型被破，胜率暴跌 ${winRateDelta}%，从此陷入落败劣势！`;
    } else if (quality === 'slow_move') {
      comment = `${pName}在 ${cLabel} 走棋偏慢，未能及时抢占大场，让${oppName}获得了反超良机。`;
    } else {
      comment = `${pName}落子在 ${cLabel}，双方局势平稳发展，胜率维持在 ${activeWinRate}%。`;
    }

    stepObj.comment = comment;
    steps.push(stepObj);
    prevBlackWinRate = curBlackWinRate;
  }

  const finalScore = replayGame.calculateScore();
  const keyTurningSteps = steps.filter(s => s.isKeyTurningPoint);

  const winner = finalScore.winner;
  let decisiveWinMove: StepReviewInfo | undefined = undefined;
  let fatalDefeatMove: StepReviewInfo | undefined = undefined;

  if (winner === 'B') {
    decisiveWinMove = advantageMoveBlack || steps.find(s => s.quality === 'god_move' && s.color === 'B');
    fatalDefeatMove = disadvantageMoveWhite || steps.find(s => s.quality === 'blunder' && s.color === 'W');
  } else if (winner === 'W') {
    decisiveWinMove = advantageMoveWhite || steps.find(s => s.quality === 'god_move' && s.color === 'W');
    fatalDefeatMove = disadvantageMoveBlack || steps.find(s => s.quality === 'blunder' && s.color === 'B');
  }

  if (fatalDefeatMove) fatalDefeatMove.isFatalDefeatPoint = true;
  if (decisiveWinMove) decisiveWinMove.isDecisiveWinPoint = true;

  const winnerName = winner === 'B' ? '黑棋' : winner === 'W' ? '白棋' : '双方';
  let summaryHeadline = '';
  let summaryCommentary = '';

  if (winner === 'TIE') {
    summaryHeadline = '势均力敌 · 精彩和棋';
    summaryCommentary = '整盘对局跌宕起伏，双方互有攻守，最终目数精准打平，展现了极高水平的抗衡！';
  } else {
    summaryHeadline = `${winnerName}稳扎稳打 · 赢得最终胜利`;
    if (fatalDefeatMove && decisiveWinMove) {
      const loserName = winner === 'B' ? '白棋' : '黑棋';
      summaryCommentary = `关键转折：${winnerName}在第 ${decisiveWinMove.stepIndex} 手 (${decisiveWinMove.coordLabel}) 确立胜势，而${loserName}在第 ${fatalDefeatMove.stepIndex} 手 (${fatalDefeatMove.coordLabel}) 出现破绽，自此开始走向落败。`;
    } else if (decisiveWinMove) {
      summaryCommentary = `${winnerName}在第 ${decisiveWinMove.stepIndex} 手 (${decisiveWinMove.coordLabel}) 牢牢把握住了先机，提子与围地效率更高，最终以 ${finalScore.margin} 目优势取胜！`;
    } else {
      summaryCommentary = `${winnerName}在关键中盘阶段发挥出色，最终以 ${finalScore.margin} 目优势取胜！`;
    }
  }

  return {
    boardSize,
    komi,
    totalSteps: history.length,
    finalScore,
    steps,
    blackGodMoves,
    blackBlunders,
    whiteGodMoves,
    whiteBlunders,
    keyTurningSteps,
    advantageMoveBlack,
    advantageMoveWhite,
    disadvantageMoveBlack,
    disadvantageMoveWhite,
    decisiveWinMove,
    fatalDefeatMove,
    summaryHeadline,
    summaryCommentary
  };
}

export function evaluateLiveMove(
  game: GoGame,
  point: Point | null,
  color: StoneColor,
  capturedStones: Point[] = []
): LiveMoveEvaluation {
  const stepIndex = game.history.length;
  const s = game.size;
  const mid = Math.floor(s / 2);
  const snapshot = calculateWinRate(game);
  const winRate = color === 'B' ? snapshot.blackWinRate : snapshot.whiteWinRate;
  const pName = color === 'B' ? '黑棋' : '白棋';
  const oppName = color === 'B' ? '白棋' : '黑棋';
  const cLabel = formatGoCoordinate(point, s);

  if (point === null) {
    return {
      stepIndex,
      color,
      point: null,
      coordLabel: '停一手 (Pass)',
      termBadge: '🏳️ 停一手',
      termName: '停一手 (Pass)',
      quality: 'normal_move',
      winRate,
      winRateDelta: 0,
      commentary: `${pName}选择停一手，棋局正在定型。`,
      themeColor: 'blue'
    };
  }

  const { r, c } = point;
  const capCount = capturedStones.length;

  const ataris = game.checkAtari();
  const oppAtaris = ataris.filter(a => a.color !== color);
  const ownGroup = game.getGroup(r, c);
  const ownLiberties = ownGroup ? ownGroup.libertyCount : 0;

  if (capCount >= 3) {
    return {
      stepIndex,
      color,
      point,
      coordLabel: cLabel,
      termBadge: '🌟 妙手 · 大龙拔花',
      termName: '大龙拔花',
      quality: 'god_move',
      winRate,
      winRateDelta: +18.5,
      commentary: `【妙手】${pName}一举提吃敌方 ${capCount} 颗大子，中腹厚势拔地而起！`,
      themeColor: 'purple'
    };
  }

  if (oppAtaris.length >= 2) {
    return {
      stepIndex,
      color,
      point,
      coordLabel: cLabel,
      termBadge: '🌟 妙手 · 双叫吃',
      termName: '双叫吃',
      quality: 'god_move',
      winRate,
      winRateDelta: +14.0,
      commentary: `【妙手】一子双叫吃！同时锁定${oppName}两块要害，对方顾此失彼！`,
      themeColor: 'purple'
    };
  }

  if (capCount > 0) {
    return {
      stepIndex,
      color,
      point,
      coordLabel: cLabel,
      termBadge: '🟢 佳着 · 提吃筋子',
      termName: '提吃筋子',
      quality: 'great_move',
      winRate,
      winRateDelta: +8.0,
      commentary: `精准紧气提吃敌方 ${capCount} 子，自身棋形更加通畅！`,
      themeColor: 'emerald'
    };
  }

  if (ownLiberties === 1 && capCount === 0) {
    return {
      stepIndex,
      color,
      point,
      coordLabel: cLabel,
      termBadge: '🔴 恶手 · 自撞气紧',
      termName: '自撞气紧',
      quality: 'blunder',
      winRate,
      winRateDelta: -15.0,
      commentary: `【危险】${pName}落子后自身仅剩 1 气，已进入被叫吃险境！`,
      themeColor: 'rose'
    };
  }

  if (r === mid && c === mid && stepIndex <= 15) {
    return {
      stepIndex,
      color,
      point,
      coordLabel: cLabel,
      termBadge: '👑 佳着 · 抢占天元',
      termName: '抢占天元',
      quality: 'great_move',
      winRate,
      winRateDelta: +6.5,
      commentary: `【大局】占据棋盘中心天元，辐射四野，中腹控制力大增！`,
      themeColor: 'emerald'
    };
  }

  const isStarPoint = (s === 9 && (r === 2 || r === 6) && (c === 2 || c === 6)) ||
                      (s === 19 && (r === 3 || r === 15) && (c === 3 || c === 15)) ||
                      (s === 13 && (r === 3 || r === 9) && (c === 3 || c === 9));
  if (isStarPoint && stepIndex <= 12) {
    return {
      stepIndex,
      color,
      point,
      coordLabel: cLabel,
      termBadge: '📐 占位 · 抢占星位',
      termName: '抢占星位',
      quality: 'great_move',
      winRate,
      winRateDelta: +5.0,
      commentary: `金角银边草肚皮，开局抢占星位，筑牢角部根据地！`,
      themeColor: 'emerald'
    };
  }

  const isSanSan = (s === 9 && (r === 2 || r === 6) && (c === 2 || c === 6)) ||
                   (s === 19 && (r === 2 || r === 16) && (c === 2 || c === 16));
  if (isSanSan && stepIndex <= 20) {
    return {
      stepIndex,
      color,
      point,
      coordLabel: cLabel,
      termBadge: '🎯 战术 · 点入三三',
      termName: '点入三三',
      quality: 'great_move',
      winRate,
      winRateDelta: +6.0,
      commentary: `直接点入三三搜刮角部实地，手段刁钻锐利！`,
      themeColor: 'emerald'
    };
  }

  if (oppAtaris.length === 1) {
    return {
      stepIndex,
      color,
      point,
      coordLabel: cLabel,
      termBadge: '⚡ 锐利 · 紧气叫吃',
      termName: '紧气叫吃',
      quality: 'great_move',
      winRate,
      winRateDelta: +7.0,
      commentary: `紧逼对手气门发动叫吃，抢占进攻主动权！`,
      themeColor: 'emerald'
    };
  }

  const isSide = (r === 2 || r === s - 3 || c === 2 || c === s - 3) && stepIndex <= 25;
  if (isSide) {
    return {
      stepIndex,
      color,
      point,
      coordLabel: cLabel,
      termBadge: '🏰 布局 · 安定拆边',
      termName: '安定拆边',
      quality: 'normal_move',
      winRate,
      winRateDelta: +3.0,
      commentary: `两翼张开安定拆边，配合角部形成良好呼应！`,
      themeColor: 'blue'
    };
  }

  if (ownLiberties >= 3) {
    return {
      stepIndex,
      color,
      point,
      coordLabel: cLabel,
      termBadge: '🔵 本手 · 稳固扎实',
      termName: '稳固本手',
      quality: 'normal_move',
      winRate,
      winRateDelta: +1.5,
      commentary: `正着本手，自固防守，不给对手留借用破绽。`,
      themeColor: 'blue'
    };
  }

  return {
    stepIndex,
    color,
    point,
    coordLabel: cLabel,
    termBadge: '🔵 行棋 · 稳健占位',
    termName: '稳健占位',
    quality: 'normal_move',
    winRate,
    winRateDelta: 0,
    commentary: `${pName}落子在 ${cLabel}，局势稳步展开。`,
    themeColor: 'blue'
  };
}
