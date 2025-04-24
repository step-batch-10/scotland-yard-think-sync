import { createApp } from "../src/app.ts";
import { describe, it } from "testing";
import { assert, assertEquals } from "jsr:@std/assert";
import { Bindings } from "../src/models/types.ts";
import { PlayerRegistry } from "../src/models/players.ts";
import { Rooms } from "../src/models/rooms.ts";
import { GameController } from "../src/models/game_controller.ts";
import { createAppWithPlayers } from "./game_setup_test.ts";

describe("login handler", () => {
  it("should create player stats", async () => {
    const bindings: Bindings = {
      playerRegistry: new PlayerRegistry(),
      rooms: new Rooms(),
      controller: new GameController(),
    };

    const formData = new FormData();
    formData.set("playerName", "akshay");
    const app = createApp(bindings);

    const res = await app.request("/login", { method: "POST", body: formData });

    assertEquals(res.status, 303);
    assertEquals(res.headers.get("location"), "/lobby");
    assert(bindings.playerRegistry.isPlayerRegistered("akshay"));
  });
});

describe("ensureLoggedIn", () => {
  it("should redirect to lobby if player is registered", async () => {
    const playerName = "test1";
    const app = createAppWithPlayers(playerName);

    const res = await app.request("/login", {
      headers: {
        cookie: `playerId=${playerName}`,
      },
    });

    assertEquals(res.status, 303);
    assertEquals(res.headers.get("location"), "/lobby");
  });

  it("should give login page if not logged in", async () => {
    const app = createAppWithPlayers();

    const res = await app.request("/login");
    await res.text();

    assertEquals(res.status, 200);
  });
});
