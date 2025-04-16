import { describe, it } from "testing";
import { assert, assertEquals, assertFalse } from "assert";
import { PlayerRegistry } from "../src/models/players.ts";
import { PlayerStats } from "../src/models/types.ts";

describe("players model", () => {
  describe("createPlayer", () => {
    it("should create player with player name", () => {
      const playerName = "test1";
      const players = new PlayerRegistry();
      players.createPlayer(playerName);
      const expected = {};

      assertEquals(players.getPlayerStats(playerName), expected);
    });
  });

  describe("isPlayerRegistared", () => {
    it("should return true if player is registered", () => {
      const playerName = "test1";
      const players = new PlayerRegistry();
      players.createPlayer(playerName);

      assert(players.isPlayerRegistered(playerName));
    });

    it("should return false if player is not registered", () => {
      const playerName = "test1";
      const players = new PlayerRegistry();

      assertFalse(players.isPlayerRegistered(playerName));
    });
  });

  describe("removePlayer", () => {
    it("should remove player by the player name", () => {
      const playerName = "test1";
      const players = new PlayerRegistry();
      players.createPlayer(playerName);

      assert(players.removePlayer(playerName));
      assertFalse(players.isPlayerRegistered(playerName));
    });

    it("should not crash if non registered player removes", () => {
      const playerName = "test1";
      const players = new PlayerRegistry();

      assertFalse(players.removePlayer(playerName));
      assertFalse(players.isPlayerRegistered(playerName));
    });
  });

  describe("assign room", () => {
    it("should assign roomid to player", () => {
      const playerName = "test1";
      const roomID = "something";

      const players = new PlayerRegistry();
      players.createPlayer(playerName);
      players.assignRoom(playerName, roomID);

      const expected: PlayerStats = {
        matchID: roomID,
        status: "waiting",
      };

      assertEquals(players.getPlayerStats(playerName), expected);
    });

    it("should return empty object if player is not registared", () => {
      const playerName = "test1";
      const players = new PlayerRegistry();
      const expected: PlayerStats = {};

      assertEquals(players.getPlayerStats(playerName), expected);
    });
  });

  describe("reset player", () => {
    it("should reset player if player exists", () => {
      const playerName = "test1";
      const roomID = "something";

      const players = new PlayerRegistry();
      players.createPlayer(playerName);
      players.assignRoom(playerName, roomID);
      players.resetPlayer(playerName);

      const expected: PlayerStats = {};

      assertEquals(players.getPlayerStats(playerName), expected);
    });

    it("should not reset if player is not registared", () => {
      const playerName = "test1";
      const players = new PlayerRegistry();

      assertFalse(players.resetPlayer(playerName));
    });
  });
});
