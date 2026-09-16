import { describe, it, expect } from "vitest";
import { GoGame } from "../src/engine/GoGame";
import { chooseGoAiMove } from "../src/engine/goAi";

describe("Go AI Engine (chooseGoAiMove)", () => {
  it("should choose a valid legal move in the opening", () => {
    const game = new GoGame(9, 3.5);
    const move = chooseGoAiMove(game, "B", "hard");
    expect(move).not.toBeNull();
    if (move) {
      expect(game.isValidCoord(move.r, move.c)).toBe(true);
      expect(game.getCell(move.r, move.c)).toBeNull();
      // Should not play on the edge line 1 in the opening
      const onEdge = move.r === 0 || move.r === 8 || move.c === 0 || move.c === 8;
      expect(onEdge).toBe(false);
    }
  });

  it("should capture an opponent stone in atari", () => {
    const game = new GoGame(9, 3.5);
    // Put white stone at (2, 2), surround on 3 sides with black stones
    // White at (2, 2)
    game.playMove(2, 1, "B"); // left
    game.playMove(2, 2, "W"); // target
    game.playMove(1, 2, "B"); // top
    game.playMove(3, 2, "B"); // bottom
    // Now (2, 3) is the only liberty for white at (2, 2)
    const ataris = game.checkAtari();
    expect(ataris.some((a) => a.color === "W")).toBe(true);

    const bestMove = chooseGoAiMove(game, "B", "hard");
    expect(bestMove).toEqual({ r: 2, c: 3 });
  });

  it("should save friendly stone in atari when possible", () => {
    const game = new GoGame(9, 3.5);
    // Black at (4, 4) in atari
    game.playMove(4, 3, "W");
    game.playMove(4, 4, "B"); // friendly stone
    game.playMove(3, 4, "W");
    game.playMove(5, 4, "W");
    // (4, 5) is the escape liberty
    const ataris = game.checkAtari();
    expect(ataris.some((a) => a.color === "B")).toBe(true);

    const saveMove = chooseGoAiMove(game, "B", "hard");
    expect(saveMove).toEqual({ r: 4, c: 5 });
  });

  it("should support easy, medium, and hard levels", () => {
    const game = new GoGame(9, 3.5);
    game.playMove(2, 2, "B");

    const easyMove = chooseGoAiMove(game, "W", "easy");
    const medMove = chooseGoAiMove(game, "W", "medium");
    const hardMove = chooseGoAiMove(game, "W", "hard");

    expect(easyMove).not.toBeNull();
    expect(medMove).not.toBeNull();
    expect(hardMove).not.toBeNull();
  });
});
