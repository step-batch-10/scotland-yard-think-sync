import { describe, it } from "testing";
import {
  createAppWithHostedRoom,
  createAppWithPlayers,
} from "./authenticated_test.ts";
import { assertEquals } from "assert/equals";
import { mapToObject } from "../src/game.ts";

describe("serveRoles", () => {
  it("should serve roles if player are present", async () => {
    const allPlayers = ["tes1", "test2", "test3", "test4", "test5", "test6"];
    const [host, ...players] = allPlayers;

    const { app, roomId, bindings } = createAppWithHostedRoom(host, ...players);

    const header = {
      headers: {
        cookie: `playerId=${host}`,
      },
    };

    bindings.rooms.assignGame(roomId, bindings.match);
    const response = await app.request("/game/info", header);

    const actual = await response.json();
    const expected = {
      MrX: "tes1",
      Red: "test2",
      Blue: "test3",
      Green: "test4",
      Yellow: "test5",
      Purple: "test6",
    };

    assertEquals(actual, expected);
  });

  it("should give room not found if roomId is invalid", async () => {
    const allPlayers = ["tes1", "test2", "test3", "test4", "test5", "test6"];
    const [host, ...players] = allPlayers;

    const app = createAppWithPlayers(host, ...players);

    const header = {
      headers: {
        cookie: `playerId=${host}`,
      },
    };

    const response = await app.request("/game/info", header);

    const actual = await response.json();
    const expected = { message: "Game not found" };

    assertEquals(actual, expected);
    assertEquals(response.status, 404);
  });
});

describe("mapToObject", () => {
  it("should return object if map has values", () => {
    const map = new Map();
    map.set("name", "akshay");
    map.set("age", "none");

    assertEquals(mapToObject(map), { name: "akshay", age: "none" });
  });

  it("should return empty object if there is no parameter", () => {
    assertEquals(mapToObject(), {});
  });
});
