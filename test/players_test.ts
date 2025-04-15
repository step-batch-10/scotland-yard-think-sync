import { describe, it } from "testing";
import { assert, assertEquals, assertFalse } from "assert";
import { Players } from "../src/models/players.ts";

describe("players model", () => {
  it("should create player with player name", () => {
    const playerName = "test1";
    const players = new Players();
    players.createPlayer(playerName);
    const expected = {};

    assertEquals(players.getPlayer(playerName), expected);
  });

  it("should return true if player is registered", () => {
    const playerName = "test1";
    const players = new Players();
    players.createPlayer(playerName);

    assert(players.isPlayerRegistered(playerName));
  });

  it("should return false if player is not registered", () => {
    const playerName = "test1";
    const players = new Players();

    assertFalse(players.isPlayerRegistered(playerName));
  });

  it("should remove player by the player name", () => {
    const playerName = "test1";
    const players = new Players();
    players.createPlayer(playerName);

    assert(players.removePlayer(playerName));
    assertFalse(players.isPlayerRegistered(playerName));
  });

  it("should not crash if non registered player removes", () => {
    const playerName = "test1";
    const players = new Players();

    assertFalse(players.removePlayer(playerName));
    assertFalse(players.isPlayerRegistered(playerName));
  });
});
