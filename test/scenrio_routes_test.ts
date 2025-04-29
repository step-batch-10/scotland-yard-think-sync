import { assert, assertEquals } from "assert";
import { Bindings, Role, Scenario } from "../src/models/types.ts";
import { PlayerRegistry } from "../src/models/players.ts";
import { Rooms } from "../src/models/rooms.ts";
import { GameController } from "../src/models/game_controller.ts";
import { createApp } from "../src/app.ts";
import { describe, it } from "testing";

const createAppWithPlayers = (...players: string[]) => {
  const bindings: Bindings = {
    playerRegistry: new PlayerRegistry(),
    rooms: new Rooms(),
    controller: new GameController(),
  };

  for (const player of players) {
    bindings.playerRegistry.createPlayer(player);
  }

  return { app: createApp(bindings), bindings };
};

describe("setScenario", () => {
  it("setScenario - Load Valid Scenario", async () => {
    const [host, ...players] = ["Player1", "Player2", "Player3"];
    const { app, bindings } = createAppWithPlayers(host, ...players);

    const mockScenario: Scenario = {
      players: ["Player1", "Player2", "Player3"],
      turn: 5,
      currentPositions: { MrX: 100, Red: 101, Blue: 102 },
      tickets: {
        MrX: { Bus: 5, Taxi: 5, Metro: 5, Wild: 5, "2x": 2 },
        Red: { Bus: 3, Taxi: 3, Metro: 3, Wild: 0, "2x": 0 },
        Blue: { Bus: 3, Taxi: 3, Metro: 3, Wild: 0, "2x": 0 },
        Green: { Bus: 3, Taxi: 3, Metro: 3, Wild: 0, "2x": 0 },
        Yellow: { Bus: 3, Taxi: 3, Metro: 3, Wild: 0, "2x": 0 },
        Purple: { Bus: 3, Taxi: 3, Metro: 3, Wild: 0, "2x": 0 },
      },
      currentRole: Role.MrX,
      currentTurn: 5,
      logs: [],
    };

    await Deno.writeTextFile(
      "./data/validScenario.json",
      JSON.stringify(mockScenario),
    );

    const header = { headers: { cookie: `playerId=${host}` } };
    const res = await app.request("/scenario/validScenario", header);

    assertEquals(res.status, 200);
    const body = await res.json();
    assertEquals(body.success, true);
    assertEquals(body.message, "loaded successfully");

    const { roomId } = bindings.playerRegistry.getPlayerStats("Player1");
    assertEquals(roomId !== null, true);

    const match = bindings.controller.getMatch(roomId!);
    console.log(match, roomId, bindings);
    assert(match);
    assertEquals(match?.game.getCurrentTurn(), 5);
    assertEquals(match?.game.getCurrentPosition().get(Role.MrX), 100);

    await Deno.remove("./data/validScenario.json");
  });

  it("setScenario - Handle Missing Scenario File", async () => {
    const [host, ...players] = ["Player1", "Player2"];
    const { app } = createAppWithPlayers(host, ...players);

    const header = { headers: { cookie: `playerId=${host}` } };
    const res = await app.request("/scenario/missingScenario", header);

    assertEquals(res.status, 500);
    const body = await res.json();
    assertEquals(body.success, false);
    assertEquals(body.message, "Failed to load");
  });

  it("setScenario - Handle Invalid JSON", async () => {
    const [host, ...players] = ["Player1", "Player2"];
    const { app } = createAppWithPlayers(host, ...players);

    await Deno.writeTextFile("./data/invalidScenario.json", "{ invalid json }");

    const header = { headers: { cookie: `playerId=${host}` } };
    const res = await app.request("/scenario/invalidScenario", header);

    assertEquals(res.status, 500);
    const body = await res.json();
    assertEquals(body.success, false);
    assertEquals(body.message, "Failed to load");

    await Deno.remove("./data/invalidScenario.json");
  });
});
