import { GoGame } from "./GoGame";
import type { Point, StoneColor } from "./types";

export type GoAiDifficulty = "easy" | "medium" | "hard";

export interface ScoredGoMove {
  point: Point;
  score: number;
}

function getLineNumber(r: number, c: number, size: number): number {
  return Math.min(r, c, size - 1 - r, size - 1 - c) + 1;
}

function isStrategicOpeningPoint(r: number, c: number, size: number): boolean {
  const mid = Math.floor(size / 2);
  if (r === mid && c === mid) return true;

  if (size === 7) {
    return (r === 2 || r === 4) && (c === 2 || c === 4);
  }
  if (size === 9) {
    return (r === 2 || r === 6) && (c === 2 || c === 6);
  }
  if (size === 13) {
    return (r === 3 || r === 9) && (c === 3 || c === 9);
  }
  if (size === 19) {
    const starCoords = [3, 9, 15];
    return starCoords.includes(r) && starCoords.includes(c);
  }
  return false;
}

function evaluateCandidateMove(
  game: GoGame,
  pt: Point,
  aiColor: StoneColor
): number {
  const oppColor: StoneColor = aiColor === "B" ? "W" : "B";
  const size = game.size;

  const eye = game.evaluateEye(pt.r, pt.c, aiColor);
  if (eye.status === 'REAL') {
    return -9999;
  }

  const sim = game.clone();
  const res = sim.playMove(pt.r, pt.c, aiColor);
  if (!res.success) {
    return -99999;
  }

  let score = 0;

  const captureCount = res.capturedStones.length;
  if (captureCount > 0) {
    score += 260 + captureCount * 70;
  }

  const myGroup = sim.getGroup(pt.r, pt.c);
  const myLiberties = myGroup ? myGroup.liberties.length : 0;
  const myGroupSize = myGroup ? myGroup.stones.length : 1;

  if (myLiberties === 1) {
    if (captureCount === 0) {
      score -= 450 * myGroupSize;
    } else {
      score -= 60;
    }
  } else if (myLiberties === 2) {
    score += 5;
  } else if (myLiberties >= 3) {
    score += 30 + myLiberties * 4;
  }

  const priorAtaris = game.checkAtari();
  for (const alert of priorAtaris) {
    if (alert.color === aiColor) {
      const sampleStone = alert.group.stones[0];
      const groupInSim = sampleStone ? sim.getGroup(sampleStone.r, sampleStone.c) : null;
      if (groupInSim && groupInSim.liberties.length > 1) {
        score += 220 + alert.group.stones.length * 60;
      }
    }
  }

  const simAtaris = sim.checkAtari();
  for (const alert of simAtaris) {
    if (alert.color === oppColor) {
      score += 90 + alert.group.stones.length * 35;
    }
  }

  const moveNumber = game.history.length;
  const line = getLineNumber(pt.r, pt.c, size);

  if (moveNumber < size * 1.5) {
    if (line === 1) {
      score -= captureCount > 0 ? 0 : 90;
    } else if (line === 2) {
      score += 10;
    } else if (line === 3) {
      score += 50;
    } else if (line === 4) {
      score += 45;
    } else {
      score += 25;
    }

    if (isStrategicOpeningPoint(pt.r, pt.c, size)) {
      score += 55;
    }
  } else {
    if (line === 1 && captureCount === 0 && myLiberties <= 2) {
      score -= 40;
    }
  }

  const ortho = game.getOrthogonalNeighbors(pt.r, pt.c);
  let friendlyNeighbors = 0;
  let opponentNeighbors = 0;

  for (const n of ortho) {
    const cell = game.getCell(n.r, n.c);
    if (cell === aiColor) friendlyNeighbors++;
    else if (cell === oppColor) opponentNeighbors++;
  }

  if (friendlyNeighbors >= 2) {
    score += 30;
  } else if (friendlyNeighbors === 1) {
    score += 15;
  }

  if (opponentNeighbors > 0) {
    score += 10 * opponentNeighbors;
  }

  try {
    const origScore = game.calculateScore();
    const newScore = sim.calculateScore();
    const origMargin = aiColor === "B" ? origScore.blackTotal - origScore.whiteTotal : origScore.whiteTotal - origScore.blackTotal;
    const newMargin = aiColor === "B" ? newScore.blackTotal - newScore.whiteTotal : newScore.whiteTotal - newScore.blackTotal;
    score += (newMargin - origMargin) * 8;
  } catch {}

  return score;
}

export function chooseGoAiMove(
  game: GoGame,
  aiColor: StoneColor = game.turn,
  difficulty: GoAiDifficulty = "medium"
): Point | null {
  const legalMoves = game.getLegalMoves(aiColor);
  if (legalMoves.length === 0) {
    return null;
  }

  const candidateMoves = legalMoves.filter((pt) => {
    const eye = game.evaluateEye(pt.r, pt.c, aiColor);
    return eye.status !== 'REAL';
  });

  if (candidateMoves.length === 0) {
    return null;
  }

  const scored: ScoredGoMove[] = [];
  for (const pt of candidateMoves) {
    const score = evaluateCandidateMove(game, pt, aiColor);
    scored.push({ point: pt, score });
  }

  scored.sort((a, b) => b.score - a.score);

  if (scored.length > 0 && scored[0].score < -150) {
    return null;
  }

  if (difficulty === "easy") {
    const viable = scored.filter((m) => m.score > -60);
    const pool = viable.length > 0 ? viable.slice(0, Math.min(6, viable.length)) : scored.slice(0, 3);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    return pick ? pick.point : scored[0].point;
  }

  if (difficulty === "medium") {
    const viable = scored.filter((m) => m.score > -80);
    const topMoves = viable.length > 0 ? viable.slice(0, Math.min(3, viable.length)) : scored.slice(0, 1);
    if (Math.random() < 0.8 || topMoves.length === 1) {
      return topMoves[0].point;
    }
    const pick = topMoves[Math.floor(Math.random() * topMoves.length)];
    return pick.point;
  }

  return scored[0].point;
}
