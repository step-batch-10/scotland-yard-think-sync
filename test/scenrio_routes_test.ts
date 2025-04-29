import { assertEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import { createAppWithHostedRoom } from "./game_setup_test.ts";

Deno.test("loadScenario - Load Valid Scenario", async () => {
  const [host, ...players] = ["Player1", "Player2"];
  const { app } = createAppWithHostedRoom(host, ...players);
  const mockScenario = {
    players: ["Player1", "Player2"],
    turn: 5,
    currentPositions: { MrX: 100, Red: 101 },
    tickets: {
      MrX: { Bus: 5, Taxi: 5, Metro: 5, Wild: 5, "2x": 2 },
      Red: { Bus: 3, Taxi: 3, Metro: 3, Wild: 0, "2x": 0 },
    },
    currentRole: "MrX",
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
  await Deno.remove("./data/validScenario.json");
});

Deno.test("loadScenario - Handle Missing Scenario File", async () => {
  const [host, ...players] = ["Player1", "Player2"];
  const { app } = createAppWithHostedRoom(host, ...players);
  const header = { headers: { cookie: `playerId=${host}` } };
  const res = await app.request("/scenario/missing", header);

  assertEquals(res.status, 500);
  const body = await res.json();
  assertEquals(body.success, false);
  assertEquals(body.message, "Failed to load");
});

Deno.test("loadScenario - Handle Invalid JSON", async () => {
  const [host, ...players] = ["Player1", "Player2"];
  const { app } = createAppWithHostedRoom(host, ...players);
  const header = { headers: { cookie: `playerId=${host}` } };
  await Deno.writeTextFile("./data/invalidScenario.json", "{ invalid json }");
  const res = await app.request("/scenario/invalidScenario", header);

  assertEquals(res.status, 500);
  const body = await res.json();
  assertEquals(body.success, false);
  assertEquals(body.message, "Failed to load");

  // Clean up
  await Deno.remove("./data/invalidScenario.json");
});
