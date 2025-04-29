import { assert, assertEquals, assertFalse } from "assert";
import { describe, it } from "testing";
import { GameController } from "../src/models/game_controller.ts";
import { ScotlandYard } from "../src/models/scotland.ts";
import { MatchStatus } from "../src/models/types.ts";

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

Deno.test("setSpecificMatch", () => {
  const controller = new GameController();
  const mockGame = new ScotlandYard(["Player1", "Player2", "Player3"]);

  const roomId = "room1";
  controller.setSpecificMatch(roomId, mockGame);
  const match = controller.getMatch(roomId) as MatchStatus;

  assertEquals(match.game, mockGame);
  assertEquals(match.winner, null);
  assertEquals(match.isGameFinished, false);
});

Deno.test("Overwrite Existing Match", () => {
  const controller = new GameController();
  const mockGame1 = new ScotlandYard(["Player1", "Player2"], undefined, 5);
  const mockGame2 = new ScotlandYard(["Player3", "Player4"], undefined, 5);

  const roomId = "room1";
  controller.setSpecificMatch(roomId, mockGame1);
  controller.setSpecificMatch(roomId, mockGame2);

  const match = controller.getMatch(roomId) as MatchStatus;

  assertEquals(match.game, mockGame2);
  assertEquals(match.winner, null);
  assertEquals(match.isGameFinished, false);
});

Deno.test("Retrieve Non-Existent Match", () => {
  const controller = new GameController();
  const match = controller.getMatch("nonExistentRoom");
  assertEquals(match, null);
});
