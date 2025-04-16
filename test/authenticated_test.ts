import { createApp } from "../src/app.ts";
import { describe, it } from "testing";
import { assert, assertEquals } from "jsr:@std/assert";
import { PlayerRegistry } from "../src/models/players.ts";
import { Rooms } from "../src/models/rooms.ts";
import { Bindings } from "../src/models/types.ts";

describe("create room", () => {
  it("should get success if room created", async () => {
    const bindings: Bindings = {
      playerRegistry: new PlayerRegistry(),
      rooms: new Rooms(),
    };
    const app = createApp(bindings);
    const fd = new FormData();
    fd.set("playerName", "a");
    await app.request("/login", { method: "POST", body: fd });
    const res = await app.request("/setup/create-room", {
      headers: { cookie: "playerId=a" },
    });
    const jsonData = await res.json();
    assertEquals(res.status, 200);
    assert(jsonData.success);
  });
});

describe("serveRoomId", () => {
  it("should give room id", async () => {
    const bindings: Bindings = {
      playerRegistry: new PlayerRegistry(),
      rooms: new Rooms(),
    };
    const app = createApp(bindings);
    const fd = new FormData();
    fd.set("playerName", "a");
    await app.request("/login", { method: "POST", body: fd });
    await app.request("/setup/create-room", {
      headers: { cookie: "playerId=a" },
    });

    const response = await app.request("/setup/room-id", {
      headers: { cookie: "playerId=a" },
    });
    const jsonData = await response.json();
    assertEquals(response.status, 200);
    assertEquals(jsonData.roomId.length, 6);
    assert(bindings.rooms.hasRoom(jsonData.roomId));
  });
});
