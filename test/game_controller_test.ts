import { assert, assertEquals, assertFalse } from "assert";
import { describe, it } from "testing";
import { GameController } from "../src/models/game_controller.ts";

describe("getMatch", () => {
  it("should return the game status if game is present", () => {
    const gameController = new GameController();
    const roomId = "123456";
    const players = new Set([
      "ramulal",
      "shamulal",
      "modhu",
      "ram",
      "sham",
      "jodu",
    ]);

    gameController.setMatch(roomId, players);
    const addedMatch = gameController.getMatch(roomId);

    assertEquals(addedMatch?.isGameFinished, false);
    assertEquals(addedMatch?.winner, null);
    assertEquals(addedMatch?.game.getPlayers(), [...players]);
  });

  it("should return the null if game is not present", () => {
    const gameController = new GameController();
    const roomId = "123456";

    const addedMatch = gameController.getMatch(roomId);

    assertEquals(addedMatch, null);
  });
});

describe("hasMatch", () => {
  it("should return true if game is present", () => {
    const gameController = new GameController();
    const roomId = "123456";
    const players = new Set([
      "ramulal",
      "shamulal",
      "modhu",
      "ram",
      "sham",
      "jodu",
    ]);

    gameController.setMatch(roomId, players);
    assert(gameController.hasMatch(roomId));
  });

  it("should return false if game is not present", () => {
    const gameController = new GameController();
    const roomId = "123456";

    assertFalse(gameController.hasMatch(roomId));
  });
});

describe("removeMatch", () => {
  it("should return true if game is deleted", () => {
    const gameController = new GameController();
    const roomId = "123456";
    const players = new Set([
      "ramulal",
      "shamulal",
      "modhu",
      "ram",
      "sham",
      "jodu",
    ]);

    gameController.setMatch(roomId, players);
    assert(gameController.removeMatch(roomId));
  });

  it("should return false if game is not present", () => {
    const gameController = new GameController();
    const roomId = "123456";

    assertFalse(gameController.removeMatch(roomId));
  });
});
