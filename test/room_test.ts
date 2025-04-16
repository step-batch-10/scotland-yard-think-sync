import { assertEquals, assert } from "assert";
import { describe, it, beforeEach } from "testing";
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
});
