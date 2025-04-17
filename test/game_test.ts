import { describe, it } from "testing";
import {
  createAppWithHostedRoom,
  createAppWithPlayers,
} from "./authenticated_test.ts";
import { assertEquals } from "assert/equals";
import { mapToObject } from "../src/game.ts";

describe("serveMatchInfo", () => {
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
      "Detective:Red": "test2",
      "Detective:Blue": "test3",
      "Detective:Green": "test4",
      "Detective:Yellow": "test5",
      "Detective:Purple": "test6",
    };

    assertEquals(actual.roles, expected);
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

    assertEquals(actual.message, expected.message);
    assertEquals(response.status, 404);
  });
});

describe("gameState", () => {
  it("should return gameState", async () => {
    const allPlayers = ["tes1", "test2", "test3", "test4", "test5", "test6"];
    const [host, ...players] = allPlayers;

    const { app, roomId, bindings } = createAppWithHostedRoom(host, ...players);

    const header = { headers: { cookie: `playerId=${host}` } };

    bindings.rooms.assignGame(roomId, bindings.match);
    const response = await app.request("/game/state", header);

    const actual = await response.json();
    const expected = {
      MrX: { Bus: 3, Taxi: 4, Metro: 3, All: 5, "2x": 2 },
      "Detective:Red": { Bus: 8, Taxi: 10, Metro: 4, All: 0, "2x": 0 },
      "Detective:Blue": { Bus: 8, Taxi: 10, Metro: 4, All: 0, "2x": 0 },
      "Detective:Green": { Bus: 8, Taxi: 10, Metro: 4, All: 0, "2x": 0 },
      "Detective:Yellow": { Bus: 8, Taxi: 10, Metro: 4, All: 0, "2x": 0 },
      "Detective:Purple": { Bus: 8, Taxi: 10, Metro: 4, All: 0, "2x": 0 },
    };

    assertEquals(actual.tickets, expected);
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

    const response = await app.request("/game/state", header);

    const actual = await response.json();
    const expected = { message: "Game not found" };

    assertEquals(actual.message, expected.message);
    assertEquals(response.status, 404);
  });
});

describe("mapToObject", () => {
  it("should return object if map has values", () => {
    const map = new Map();
    map.set("name", "akshay");
    map.set("age", "none");

    assertEquals(mapToObject<string>(map), { name: "akshay", age: "none" });
  });

  it("should return empty object if there is no parameter", () => {
    assertEquals(mapToObject(), {});
  });
});
