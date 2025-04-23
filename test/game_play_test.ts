import { describe, it } from "testing";
import {
  createAppWithHostedRoom,
  createAppWithPlayers,
} from "./game_setup_test.ts";
import { assertEquals } from "assert/equals";
import { mapToObject } from "../src/game_play.ts";
import { Transport } from "../src/models/types.ts";
import { basicMap } from "../src/maps/game_map.ts";

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

    bindings.rooms.assignGame(roomId, bindings.match, basicMap);
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

    assertEquals(actual.roles, expected);
  });

  it("should give game not found if roomId is invalid", async () => {
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

    bindings.rooms.assignGame(roomId, bindings.match, basicMap);
    const response = await app.request("/game/state", header);

    const actual = await response.json();
    const expected = {
      MrX: { Bus: 3, Taxi: 4, Metro: 3, Wild: 5, "2x": 2 },
      Red: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Blue: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Green: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Yellow: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Purple: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
    };

    assertEquals(actual.tickets, expected);
  });

  it("should give Game not found if roomId is invalid", async () => {
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

  it("should positions of all player positions for MrX", async () => {
    const allPlayers = ["tes1", "test2", "test3", "test4", "test5", "test6"];
    const [host, ...players] = allPlayers;

    const { app, bindings, roomId } = createAppWithHostedRoom(host, ...players);

    const header = {
      headers: {
        cookie: `playerId=${host}`,
      },
    };

    bindings.match.setMatch(roomId, new Set(allPlayers));

    const response = await app.request("/game/state", header);

    const actual = await response.json();
    const expected = {
      Red: 187,
      Blue: 133,
      Green: 128,
      Yellow: 185,
      Purple: 198,
      MrX: 173,
    };

    assertEquals(actual.positions, expected);
  });

  it("should give positions as per detective", async () => {
    const allPlayers = ["tes1", "test2", "test3", "test4", "test5", "test6"];
    const [host, ...players] = allPlayers;

    const { app, bindings, roomId } = createAppWithHostedRoom(host, ...players);

    const header = {
      headers: {
        cookie: `playerId=${players[1]}`,
      },
    };

    bindings.match.setMatch(roomId, new Set(allPlayers));

    const response = await app.request("/game/state", header);

    const actual = await response.json();
    const expected = {
      Red: 187,
      Blue: 133,
      Green: 128,
      Yellow: 185,
      Purple: 198,
    };

    assertEquals(actual.positions, expected);
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

describe("servePossibleStations", () => {
  it("should return all the possible station based on the given station", async () => {
    const allPlayers = ["a", "b", "c", "d", "e", "f"];
    const [host, ...players] = allPlayers;

    const { app, bindings, roomId } = createAppWithHostedRoom(host, ...players);
    bindings.rooms.assignGame(roomId, bindings.match, basicMap);
    const response = await app.request("/game/possible-stations", {
      headers: { cookie: `playerId=${host}` },
    });

    const expected = [
      { to: 181, mode: Transport.Taxi },
      { to: 181, mode: Transport.Bus },
      { to: 195, mode: Transport.Taxi },
    ];
    const actual = await response.json();

    assertEquals(actual, expected);
  });
});

describe("handleMovement", () => {
  it("should be able to move if i have used valid ticket and destination", async () => {
    const allPlayers = ["a", "b", "c", "d", "e", "f"];
    const [host, ...players] = allPlayers;

    const { app, bindings, roomId } = createAppWithHostedRoom(host, ...players);
    bindings.rooms.assignGame(roomId, bindings.match, basicMap);

    const response = await app.request("/game/move/181/ticket/Taxi", {
      headers: { cookie: `playerId=${host}` },
    });

    const actual = await response.json();
    const expected = { success: true };

    assertEquals(actual, expected);
  });

  it("should not be able to move if i have used Invalid ticket or destination", async () => {
    const allPlayers = ["a", "b", "c", "d", "e", "f"];
    const [host, ...players] = allPlayers;

    const { app, bindings, roomId } = createAppWithHostedRoom(host, ...players);
    bindings.rooms.assignGame(roomId, bindings.match, basicMap);

    const response = await app.request("/game/move/ /ticket/Metro", {
      headers: { cookie: `playerId=${host}` },
    });

    const actual = await response.json();
    const expected = { success: false };

    assertEquals(actual, expected);
  });

  it("should not be able to move match is not there", async () => {
    const allPlayers = ["a", "b", "c", "d", "e"];
    const [host, ...players] = allPlayers;

    const { app } = createAppWithHostedRoom(host, ...players);

    const response = await app.request("/game/move/123/ticket/Metro", {
      headers: { cookie: `playerId=${host}` },
    });

    const actual = await response.json();
    const expected = { success: false };

    assertEquals(actual, expected);
  });
});
