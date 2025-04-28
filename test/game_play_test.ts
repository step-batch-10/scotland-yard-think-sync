import { describe, it } from "testing";
import {
  createAppWithHostedRoom,
  createAppWithPlayers,
} from "./game_setup_test.ts";
import { assertEquals } from "assert/equals";
import { RandomIndex } from "../src/models/types.ts";
import { basicMap } from "../src/maps/game_map.ts";
import { assert } from "assert/assert";
import { Ticket } from "../src/models/types.ts";

const random: RandomIndex = () => 0;
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

    bindings.rooms.assignGame(roomId, bindings.controller, basicMap, random);
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

    bindings.rooms.assignGame(roomId, bindings.controller, basicMap, random);
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

    bindings.controller.setMatch(roomId, new Set(allPlayers), basicMap, random);

    const response = await app.request("/game/state", header);

    const actual = await response.json();
    const expected = {
      Blue: 183,
      Green: 184,
      MrX: 181,
      Purple: 186,
      Red: 182,
      Yellow: 185,
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

    bindings.controller.setMatch(roomId, new Set(allPlayers), basicMap, random);

    const response = await app.request("/game/state", header);

    const actual = await response.json();
    const expected = {
      Blue: 183,
      Green: 184,
      MrX: null,
      Purple: 186,
      Red: 182,
      Yellow: 185,
    };

    assertEquals(actual.positions, expected);
  });
});

describe("servePossibleStations", () => {
  it("should return all the possible station for mr.x", async () => {
    const allPlayers = ["a", "b", "c", "d", "e", "f"];
    const [host, ...players] = allPlayers;
    const { app, bindings, roomId } = createAppWithHostedRoom(host, ...players);
    bindings.rooms.assignGame(roomId, bindings.controller, basicMap, random);
    const response = await app.request("/game/possible-stations", {
      headers: { cookie: `playerId=${host}` },
    });

    const expected = [{ to: 100, tickets: [Ticket.Yellow, Ticket.Black] }];
    const actual = await response.json();
    assertEquals(actual, expected);
  });

  it("should return all the possible station", async () => {
    const allPlayers = ["a", "b", "c", "d", "e", "f"];
    const [host, ...players] = allPlayers;

    const { app, bindings, roomId } = createAppWithHostedRoom(host, ...players);
    bindings.rooms.assignGame(roomId, bindings.controller, basicMap, random);

    await app.request("/game/move/100/ticket/Taxi", {
      headers: {
        cookie: `playerId=${host}`,
      },
    });

    const response = await app.request("/game/possible-stations", {
      headers: { cookie: `playerId=b` },
    });

    const expected = [
      { to: 181, tickets: [Ticket.Yellow, Ticket.Green] },
      { to: 195, tickets: [Ticket.Yellow] },
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
    bindings.rooms.assignGame(roomId, bindings.controller, basicMap, random);

    const response = await app.request("/game/move/100/ticket/Taxi", {
      headers: { cookie: `playerId=${host}` },
    });

    const actual = await response.json();
    const expected = { success: true };

    assertEquals(actual, expected);
  });

  it("should not be able to move if i have used Invalid destination", async () => {
    const allPlayers = ["a", "b", "c", "d", "e", "f"];
    const [host, ...players] = allPlayers;

    const { app, bindings, roomId } = createAppWithHostedRoom(host, ...players);
    bindings.rooms.assignGame(roomId, bindings.controller, basicMap, random);

    const response = await app.request("/game/move/999/ticket/Metro", {
      headers: { cookie: `playerId=${host}` },
    });

    const actual = await response.json();
    const expected = { success: false };

    assertEquals(actual, expected);
  });

  it("should not be able to move if i have used Invalid ticket", async () => {
    const allPlayers = ["a", "b", "c", "d", "e", "f"];
    const [host, ...players] = allPlayers;

    const { app, bindings, roomId } = createAppWithHostedRoom(host, ...players);
    bindings.rooms.assignGame(roomId, bindings.controller, basicMap, random);

    const response = await app.request("/game/move/100/ticket/flight", {
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
    bindings.rooms.assignGame(roomId, bindings.controller, basicMap, random);

    app.request("/game/enable-2x", {
      headers: { cookie: `playerId=${host}` },
    });

    const response1 = await app.request("/game/move/100/ticket/Taxi", {
      headers: { cookie: `playerId=${host}` },
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
    bindings.rooms.assignGame(roomId, bindings.controller, basicMap, random);

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
    bindings.rooms.assignGame(roomId, bindings.controller, basicMap, random);

    await app.request("/game/enable-2x", {
      headers: { cookie: `playerId=${host}` },
    });

    const response1 = await app.request("/game/move/100/ticket/Taxi", {
      headers: { cookie: `playerId=${host}` },
    });

    await app.request("/game/move/181/ticket/Taxi", {
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
    bindings.rooms.assignGame(roomId, bindings.controller, basicMap, random);

    const response = await app.request("/game/enable-2x", {
      headers: { cookie: `playerId=${host}` },
    });

    const actual = await response.json();
    assert(actual.accepted);
  });
});

describe("mrX Travel log", () => {
  it("should return mrX logs as empty because mrX is not moved yet", async () => {
    const allPlayers = ["a", "b", "c", "d", "e", "f"];
    const [host, ...players] = allPlayers;

    const { app, bindings, roomId } = createAppWithHostedRoom(host, ...players);
    bindings.rooms.assignGame(roomId, bindings.controller, basicMap);

    const response = await app.request("/game/mrXlog", {
      headers: {
        cookie: `playerId=${host}`,
      },
    });

    const expected = await response.json();
    assertEquals([], expected);
  });

  it("should return two logs of mrX as he move on played two turn", async () => {
    const allPlayers = ["a", "b", "c", "d", "e", "f"];
    const [host, ...players] = allPlayers;

    const { app, bindings, roomId } = createAppWithHostedRoom(host, ...players);
    bindings.rooms.assignGame(roomId, bindings.controller, basicMap, random);
    const match = bindings.controller.getMatch(roomId)!;
    const game = match.game;

    game.useTicket(Ticket.Yellow, 100);
    game.useTicket(Ticket.Yellow, 181);
    game.useTicket(Ticket.Yellow, 182);
    game.useTicket(Ticket.Yellow, 183);
    game.useTicket(Ticket.Yellow, 184);
    game.useTicket(Ticket.Red, 185);
    game.useTicket(Ticket.Yellow, 101);

    const response = await app.request("/game/mrXlog", {
      headers: {
        cookie: `playerId=${host}`,
      },
    });

    const actual = [
      { to: 100, mode: "Taxi" },
      { to: 101, mode: "Taxi" },
    ];
    const expected = await response.json();

    assertEquals(actual, expected);
  });
});

describe("ensureActiveGame", () => {
  it("It should redirect to the game page if the player is in an active game and tries to access a lobby page.", async () => {
    const allPlayers = ["a", "b", "c", "d", "e", "f"];
    const [host, ...players] = allPlayers;

    const { app, bindings, roomId } = createAppWithHostedRoom(host, ...players);
    bindings.rooms.assignGame(roomId, bindings.controller, basicMap, random);
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
