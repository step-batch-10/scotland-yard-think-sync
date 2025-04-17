import { assert, assertEquals, assertFalse } from "assert";
import { describe, it } from "testing";
import { Match } from "../src/models/match.ts";

describe("getMatch", () => {
  it("should return the match if match is present", () => {
    const match = new Match();
    const roomId = "123456";
    const players = new Set([
      "ramulal",
      "shamulal",
      "modhu",
      "ram",
      "sham",
      "jodu",
    ]);

    match.setMatch(roomId, players);
    const addedMatch = match.getMatch(roomId);

    assertEquals(addedMatch?.isGameFinished, false);
    assertEquals(addedMatch?.winner, null);
    assertEquals(addedMatch?.game.getPlayers(), [...players]);
  });

  it("should return the null if match is not present", () => {
    const match = new Match();
    const roomId = "123456";

    const addedMatch = match.getMatch(roomId);

    assertEquals(addedMatch, null);
  });
});

describe("hasMatch", () => {
  it("should return true if match is there", () => {
    const match = new Match();
    const roomId = "123456";
    const players = new Set([
      "ramulal",
      "shamulal",
      "modhu",
      "ram",
      "sham",
      "jodu",
    ]);

    match.setMatch(roomId, players);
    assert(match.hasMatch(roomId));
  });

  it("should return false if match is not there", () => {
    const match = new Match();
    const roomId = "123456";

    assertFalse(match.hasMatch(roomId));
  });
});

describe("removeMatch", () => {
  it("should return true if match is deleted", () => {
    const match = new Match();
    const roomId = "123456";
    const players = new Set([
      "ramulal",
      "shamulal",
      "modhu",
      "ram",
      "sham",
      "jodu",
    ]);

    match.setMatch(roomId, players);
    assert(match.removeMatch(roomId));
  });

  it("should return false if match is not there or can't be deleted", () => {
    const match = new Match();
    const roomId = "123456";

    assertFalse(match.removeMatch(roomId));
  });
});
