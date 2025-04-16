import { assert, assertEquals, assertFalse } from "assert";
import { beforeEach, describe, it } from "testing";
import { Rooms } from "../src/models/rooms.ts";

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

  it("type should be string", () => {
    assertEquals(typeof roomId, "string");
  });

  it("should true if particular is there", () => {
    assert(rooms.getPlayers(roomId)?.has("a"));
  });

  it("should add player", () => {
    rooms.addPlayer("b", roomId);
    assert(rooms.getPlayers(roomId)?.has("b"));
  });

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
