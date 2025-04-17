import { assert, assertEquals, assertFalse } from "assert";
import { beforeEach, describe, it } from "testing";
import { Rooms } from "../src/models/rooms.ts";
import { Match } from "../src/models/match.ts";

describe("Rooms", () => {
  let rooms: Rooms;
  let roomId: string;

  beforeEach(() => {
    rooms = new Rooms();
    roomId = rooms.addHost("a");
  });

  it("length should be 6", () => {
    assertEquals(roomId.length, 6);
  });

  describe("getPlayers", () => {
    it("should true if particular is there", () => {
      assert(rooms.getPlayers(roomId)?.has("a"));
    });

    it("should add player", () => {
      rooms.addPlayer("b", roomId);
      assert(rooms.getPlayers(roomId)?.has("b"));
    });
  });

  describe("isRoomFull", () => {
    it("should return false when room is not full", () => {
      assertFalse(rooms.isRoomFull(roomId));
    });

    it("should return true when room is full", () => {
      rooms.addPlayer("b", roomId);
      rooms.addPlayer("c", roomId);
      rooms.addPlayer("d", roomId);
      rooms.addPlayer("e", roomId);
      rooms.addPlayer("f", roomId);

      assert(rooms.isRoomFull(roomId));
    });
  });

  describe("hasRoom", () => {
    it("should give true if room is there", () => {
      assert(rooms.hasRoom(roomId));
    });

    it("should give false if room is not there", () => {
      assertFalse(rooms.hasRoom("9808"));
    });
  });

  describe("removePlayer", () => {
    it("should remove player from room if player present", () => {
      rooms.addPlayer("test1", roomId);
      rooms.addPlayer("test2", roomId);

      rooms.removePlayer("test1", roomId);

      const roomMembers = rooms.getPlayers(roomId) || [];

      const expected = ["a", "test2"];
      assertEquals([...roomMembers], expected);
    });

    it("should remove player and lobby from room if player present and host left", () => {
      rooms.removePlayer("a", roomId);

      const roomMembers = rooms.getPlayers(roomId) || [];

      assertEquals([...roomMembers], []);
      assertFalse(rooms.hasRoom(roomId));
    });
  });

  describe("assignGame", () => {
    it("should assign game if there roomId is valid", () => {
      rooms.addPlayer("b", roomId);
      rooms.addPlayer("c", roomId);
      rooms.addPlayer("d", roomId);
      rooms.addPlayer("e", roomId);
      rooms.addPlayer("f", roomId);

      const match = new Match();

      assert(rooms.assignGame(roomId, match));
      assert(match.hasMatch(roomId));
    });

    it("should not assign game if there roomId is invalid", () => {
      const match = new Match();

      assertFalse(rooms.assignGame("123456", match));
      assertFalse(match.hasMatch("123456"));
    });

    it("should not assign game if there game is already assigned", () => {
      rooms.addPlayer("b", roomId);
      rooms.addPlayer("c", roomId);
      rooms.addPlayer("d", roomId);
      rooms.addPlayer("e", roomId);
      rooms.addPlayer("f", roomId);

      const match = new Match();

      assert(rooms.assignGame(roomId, match));
      assert(match.hasMatch(roomId));
      assertFalse(rooms.assignGame(roomId, match));
    });
  });
});
