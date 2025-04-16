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

describe("handleJoin ", () => {
  it("should redirect to waiting the user if room id is valid", async () => {
    const bindings: Bindings = {
      playerRegistry: new PlayerRegistry(),
      rooms: new Rooms(),
    };

    const app = createApp(bindings);

    const playerName = "test";
    bindings.playerRegistry.createPlayer(playerName);
    const roomId = bindings.rooms.addHost(playerName);
    bindings.playerRegistry.assignRoom(playerName, roomId);

    const fd = new FormData();
    fd.set("roomId", roomId);

    const response = await app.request("/setup/join-room", {
      headers: { cookie: `playerId=${playerName}` },
      body: fd,
      method: "POST",
    });

    assertEquals(response.status, 303);
    assertEquals(response.headers.get("location"), "/html/waitingPage.html");
  });

  it("should redirect to joining page the user if room id is invalid", async () => {
    const bindings: Bindings = {
      playerRegistry: new PlayerRegistry(),
      rooms: new Rooms(),
    };

    const app = createApp(bindings);

    const playerName = "test";
    bindings.playerRegistry.createPlayer(playerName);

    const fd = new FormData();
    fd.set("roomId", "something");

    const response = await app.request("/setup/join-room", {
      headers: { cookie: `playerId=${playerName}` },
      body: fd,
      method: "POST",
    });

    assertEquals(response.status, 303);
    assertEquals(response.headers.get("location"), "/html/join.html");
  });

  it("should redirect to joining page the user if room id is is not present", async () => {
    const bindings: Bindings = {
      playerRegistry: new PlayerRegistry(),
      rooms: new Rooms(),
    };

    const app = createApp(bindings);

    const playerName = "test";
    bindings.playerRegistry.createPlayer(playerName);

    const fd = new FormData();

    const response = await app.request("/setup/join-room", {
      headers: { cookie: `playerId=${playerName}` },
      body: fd,
      method: "POST",
    });

    assertEquals(response.status, 303);
    assertEquals(response.headers.get("location"), "/html/join.html");
  });
});
