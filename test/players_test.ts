import { describe, it } from "testing";
import { assert, assertEquals, assertFalse } from "assert";
import { PlayerRegistry } from "../src/models/players.ts";
import { PlayerStats } from "../src/models/types.ts";

describe("players model", () => {
  describe("createPlayer", () => {
    it("should create a new player with given player name", () => {
      const playerName = "test1";
      const players = new PlayerRegistry();
      players.createPlayer(playerName);

      assertEquals(players.getPlayerStats(playerName), {});
    });
  });

  describe("isPlayerRegistered", () => {
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
    it("should remove the given player", () => {
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
    it("should assign roomId to player", () => {
      const playerName = "test1";
      const roomId = "something";

      const players = new PlayerRegistry();
      players.createPlayer(playerName);
      players.assignRoom(roomId, playerName);

      const expected: PlayerStats = {
        roomId: roomId,
        isPlaying: false,
      };

      assertEquals(players.getPlayerStats(playerName), expected);
    });

    it("should return empty object if player is not registered", () => {
      const playerName = "test1";
      const players = new PlayerRegistry();

      assertEquals(players.getPlayerStats(playerName), {});
    });
  });

  describe("reset player", () => {
    it("should reset player if player exists", () => {
      const playerName = "test1";
      const roomId = "something";

      const players = new PlayerRegistry();
      players.createPlayer(playerName);
      players.assignRoom(roomId, playerName);
      players.resetPlayer(playerName);

      assertEquals(players.getPlayerStats(playerName), {});
    });

    it("should not reset if player is not registered", () => {
      const playerName = "test1";
      const players = new PlayerRegistry();

      assertFalse(players.resetPlayer(playerName));
    });
  });

  describe("join room", () => {
    it("should set the isPlaying status of a player to true.", () => {
      const roomId = "something";
      const players = new PlayerRegistry();
      const playerName = "test1";
      const expected = { roomId, isPlaying: true };

      players.createPlayer(playerName);
      players.assignRoom(roomId, playerName);
      players.joinMatch([playerName]);

      assertEquals(players.getPlayerStats(playerName), expected);
    });

    it("should set the isPlaying status of all players to true.", () => {
      const roomId = "something";
      const players = new PlayerRegistry();
      const playerNames = ["test1", "test2", "test3", "test4"];
      const expected = { roomId, isPlaying: true };

      playerNames.forEach((player) => {
        players.createPlayer(player);
        players.assignRoom(roomId, player);
      });
      players.joinMatch(playerNames);

      playerNames.forEach((player) => {
        assertEquals(players.getPlayerStats(player), expected);
      });
    });
  });
});
