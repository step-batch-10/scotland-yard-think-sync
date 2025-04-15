import { describe, it } from "testing";
import { assertEquals } from "assert";
import { Players } from "../src/models/players.ts";

describe("create player", () => {
  it("should create player with player name", () => {
    const playerName = "test1";
    const players = new Players();
    players.createPlayer(playerName);
    const expected = {};

    assertEquals(players.getPlayer(playerName), expected);
  });
});
