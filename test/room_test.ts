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
    it("should be true if particular player is present", () => {
      assert(rooms.getPlayers(roomId)?.has("a"));
    });

    it("should add player", () => {
      rooms.addPlayer(roomId, "b");
      assert(rooms.getPlayers(roomId)?.has("b"));
    });
  });

  describe("isRoomFull", () => {
    it("should be false when room is not full", () => {
      assertFalse(rooms.isRoomFull(roomId));
    });

    it("should be true when room is full", () => {
      rooms.addPlayer(roomId, "b");
      rooms.addPlayer(roomId, "c");
      rooms.addPlayer(roomId, "d");
      rooms.addPlayer(roomId, "e");
      rooms.addPlayer(roomId, "f");

      assert(rooms.isRoomFull(roomId));
    });
  });

  describe("hasRoom", () => {
    it("should be true if room is present", () => {
      assert(rooms.hasRoom(roomId));
    });

    it("should be false if room is not present", () => {
      assertFalse(rooms.hasRoom("9808"));
    });
  });

  describe("removePlayer", () => {
    it("should remove player from room if player present", () => {
      rooms.addPlayer(roomId, "test1");
      rooms.addPlayer(roomId, "test2");
      rooms.removePlayer(roomId, "test1");

      const roomMembers = rooms.getPlayers(roomId) || [];
      const expected = ["a", "test2"];

      assertEquals([...roomMembers], expected);
    });

    it("should remove the room if no players remain", () => {
      rooms.removePlayer(roomId, "a");

      const roomMembers = rooms.getPlayers(roomId) || [];

      assertEquals([...roomMembers], []);
      assertFalse(rooms.hasRoom(roomId));
    });
  });

  describe("assignGame", () => {
    it("should assign game if the roomId is valid", () => {
      rooms.addPlayer(roomId, "b");
      rooms.addPlayer(roomId, "c");
      rooms.addPlayer(roomId, "d");
      rooms.addPlayer(roomId, "e");
      rooms.addPlayer(roomId, "f");

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
      rooms.addPlayer(roomId, "b");
      rooms.addPlayer(roomId, "c");
      rooms.addPlayer(roomId, "d");
      rooms.addPlayer(roomId, "e");
      rooms.addPlayer(roomId, "f");

      const match = new Match();

      assert(rooms.assignGame(roomId, match));
      assert(match.hasMatch(roomId));
      assertFalse(rooms.assignGame(roomId, match));
    });
  });
});
