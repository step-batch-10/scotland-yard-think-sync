import { describe, it } from "testing";
import {
  createAppWithHostedRoom,
  createAppWithPlayers,
} from "./game_setup_test.ts";
import { assertEquals } from "assert/equals";
import { Transport } from "../src/models/types.ts";
import { basicMap } from "../src/maps/game_map.ts";
import { assert } from "assert/assert";

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

    bindings.rooms.assignGame(roomId, bindings.controller, basicMap);
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

  it("should redirect if game is not found", async () => {
    const allPlayers = ["tes1", "test2", "test3", "test4", "test5", "test6"];
    const [host, ...players] = allPlayers;

    const app = createAppWithPlayers(host, ...players);

    const header = {
      headers: {
        cookie: `playerId=${host}`,
      },
    };

    const response = await app.request("/game/info", header);

    assertEquals(response.status, 302);
    assertEquals(response.headers.get("location"), "/lobby");
  });
});

describe("gameState", () => {
  it("should return gameState", async () => {
    const allPlayers = ["tes1", "test2", "test3", "test4", "test5", "test6"];
    const [host, ...players] = allPlayers;

    const { app, roomId, bindings } = createAppWithHostedRoom(host, ...players);

    const header = { headers: { cookie: `playerId=${host}` } };

    bindings.rooms.assignGame(roomId, bindings.controller, basicMap);
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

    assertEquals(response.status, 302);
    assertEquals(response.headers.get("location"), "/lobby");
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

    bindings.controller.setMatch(roomId, new Set(allPlayers));

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

    bindings.controller.setMatch(roomId, new Set(allPlayers));

    const response = await app.request("/game/state", header);

    const actual = await response.json();
    const expected = {
      Red: 187,
      Blue: 133,
      Green: 128,
      Yellow: 185,
      Purple: 198,
      MrX: null,
    };

    assertEquals(actual.positions, expected);
  });
});

describe("servePossibleStations", () => {
  it("should return all the possible station with 2x card for mr.x", async () => {
    const allPlayers = ["a", "b", "c", "d", "e", "f"];
    const [host, ...players] = allPlayers;

    const { app, bindings, roomId } = createAppWithHostedRoom(host, ...players);
    bindings.rooms.assignGame(roomId, bindings.controller, basicMap);
    const response = await app.request("/game/possible-stations", {
      headers: { cookie: `playerId=${host}` },
    });

    const expected = [
      { to: 181, mode: Transport.Taxi },
      { to: 181, mode: Transport.Ferry },
      { to: 181, mode: Transport.Bus },
      { to: 195, mode: Transport.Taxi },
      { to: 195, mode: Transport.Ferry },
    ];
    const actual = await response.json();
    assertEquals(actual, expected);
  });

  it("should return all the possible station without 2x remaining", async () => {
    const allPlayers = ["a", "b", "c", "d", "e", "f"];
    const [host, ...players] = allPlayers;

    const { app, bindings, roomId } = createAppWithHostedRoom(host, ...players);
    bindings.rooms.assignGame(roomId, bindings.controller);

    await app.request("/game/move/160/ticket/Taxi", {
      headers: {
        cookie: `playerId=${host}`,
      },
    });

    const response = await app.request("/game/possible-stations", {
      headers: { cookie: `playerId=b` },
    });

    const expected = [
      { to: 172, mode: Transport.Taxi },
      { to: 188, mode: Transport.Taxi },
      { to: 159, mode: Transport.Bus },
    ];

    const actual = await response.json();
    assertEquals(actual, expected);
  });

  it("should not give any possible station if it is not my turn", async () => {
    const allPlayers = ["a", "b", "c", "d", "e", "f"];
    const [host, ...players] = allPlayers;

    const { app, bindings, roomId } = createAppWithHostedRoom(host, ...players);
    bindings.rooms.assignGame(roomId, bindings.controller);

    await app.request("/game/move/160/ticket/Taxi", {
      headers: {
        cookie: `playerId=${host}`,
      },
    });

    const response = await app.request("/game/possible-stations", {
      headers: { cookie: `playerId=b` },
    });

    const expected = [
      { to: 172, mode: Transport.Taxi },
      { to: 188, mode: Transport.Taxi },
      { to: 159, mode: Transport.Bus },
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
    bindings.rooms.assignGame(roomId, bindings.controller, basicMap);

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
    bindings.rooms.assignGame(roomId, bindings.controller, basicMap);

    const response = await app.request("/game/move/ /ticket/Metro", {
      headers: { cookie: `playerId=${host}` },
    });

    const actual = await response.json();
    const expected = { success: false };

    assertEquals(actual, expected);
  });
});

describe("handleMovement", () => {
  it("should play 2x ticket", async () => {
    const allPlayers = ["a", "b", "c", "d", "e", "f"];
    const [host, ...players] = allPlayers;

    const { app, bindings, roomId } = createAppWithHostedRoom(host, ...players);
    bindings.rooms.assignGame(roomId, bindings.controller, basicMap);

    app.request("/game/enable-2x", {
      headers: { cookie: `playerId=${host}` },
    });

    const response1 = await app.request("/game/move/181/ticket/Taxi", {
      headers: { cookie: `playerId=${host}`, isusing2x: "true" },
    });

    const actual = await response1.json();
    const expected = { success: true };

    assertEquals(actual, expected);
  });
});

describe("broadCastMessage", () => {
  it("should give the skip player message when the type is skip", async () => {
    const allPlayers = ["a", "b", "c", "d", "e", "f"];
    const [host, ...players] = allPlayers;

    const { app, bindings, roomId } = createAppWithHostedRoom(host, ...players);
    bindings.rooms.assignGame(roomId, bindings.controller, basicMap);

    const response = await app.request("/game/skip-move", {
      headers: { cookie: `playerId=${host}` },
    });

    const actual = await response.json();
    const expected = { message: `MrX is skipped and nextPlayer is Red` };
    assertEquals(actual, expected);
  });
});

describe("add 2x card", () => {
  it("should change turn after two turns", async () => {
    const allPlayers = ["a", "b", "c", "d", "e", "f"];
    const [host, ...players] = allPlayers;

    const { app, bindings, roomId } = createAppWithHostedRoom(host, ...players);
    bindings.rooms.assignGame(roomId, bindings.controller, basicMap);

    await app.request("/game/enable-2x", {
      headers: { cookie: `playerId=${host}` },
    });

    const response1 = await app.request("/game/move/181/ticket/Taxi", {
      headers: { cookie: `playerId=${host}` },
    });

    await app.request("/game/move/182/ticket/Taxi", {
      headers: { cookie: `playerId=${host}` },
    });

    const actual = await response1.json();
    const expected = { success: true };

    assertEquals(actual, expected);

    const response2 = await app.request("/game/state", {
      headers: { cookie: `playerId=${host}` },
    });

    const state = await response2.json();

    assertEquals(state.currentRole, "Red");
  });

  it("should accept 2x", async () => {
    const allPlayers = ["a", "b", "c", "d", "e", "f"];
    const [host, ...players] = allPlayers;

    const { app, bindings, roomId } = createAppWithHostedRoom(host, ...players);
    bindings.rooms.assignGame(roomId, bindings.controller, basicMap);

    const response = await app.request("/game/enable-2x", {
      headers: { cookie: `playerId=${host}` },
    });

    const actual = await response.json();
    assert(actual.accepted);
  });
});

describe("ensureActiveGame", () => {
  it("It should redirect to the game page if the player is in an active game and tries to access a lobby page.", async () => {
    const allPlayers = ["a", "b", "c", "d", "e", "f"];
    const [host, ...players] = allPlayers;

    const { app, bindings, roomId } = createAppWithHostedRoom(host, ...players);
    bindings.rooms.assignGame(roomId, bindings.controller, basicMap);
    bindings.playerRegistry.joinMatch(allPlayers);

    const response = await app.request("/lobby", {
      headers: { cookie: `playerId=${host}` },
    });

    const location = response.headers.get("location");

    assertEquals(location, "/html/game.html");
  });

  it("It should  serve the requested page if the player is not in the active game session.", async () => {
    const allPlayers = ["a", "b", "c", "d", "e", "f"];
    const [host, ...players] = allPlayers;

    const { app, bindings, roomId } = createAppWithHostedRoom(host, ...players);
    bindings.rooms.assignGame(roomId, bindings.controller, basicMap);

    const response = await app.request("/lobby", {
      headers: { cookie: `playerId=${host}` },
    });

    await response.text();

    assertEquals(response.status, 200);
  });

  it("It should redirect to the game page if the player is in an active game and tries to access a waiting page.", async () => {
    const allPlayers = ["a", "b", "c", "d", "e", "f"];
    const [host, ...players] = allPlayers;

    const { app, bindings, roomId } = createAppWithHostedRoom(host, ...players);
    bindings.rooms.assignGame(roomId, bindings.controller, basicMap);
    bindings.playerRegistry.joinMatch(allPlayers);

    const response = await app.request("/html/waiting.html", {
      headers: { cookie: `playerId=${host}` },
    });

    const location = response.headers.get("location");

    assertEquals(location, "/html/game.html");
  });

  it("It should  serve the waiting page if the player is not in the active game session.", async () => {
    const allPlayers = ["a", "b", "c", "d", "e", "f"];
    const [host, ...players] = allPlayers;

    const { app, bindings, roomId } = createAppWithHostedRoom(host, ...players);
    bindings.rooms.assignGame(roomId, bindings.controller, basicMap);

    const response = await app.request("/lobby", {
      headers: { cookie: `playerId=${host}` },
    });

    await response.text();

    assertEquals(response.status, 200);
  });

  it("It should redirect to the game page if the player is in an active game and tries to access a waiting page.", async () => {
    const allPlayers = ["a", "b", "c", "d", "e", "f"];
    const [host, ...players] = allPlayers;

    const { app, bindings, roomId } = createAppWithHostedRoom(host, ...players);
    bindings.rooms.assignGame(roomId, bindings.controller, basicMap);
    bindings.playerRegistry.joinMatch(allPlayers);

    const response = await app.request("/html/join.html", {
      headers: { cookie: `playerId=${host}` },
    });

    const location = response.headers.get("location");

    assertEquals(location, "/html/game.html");
  });
});
