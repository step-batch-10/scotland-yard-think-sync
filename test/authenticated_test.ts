import { createApp } from "../src/app.ts";
import { describe, it } from "testing";
import { assert, assertEquals } from "jsr:@std/assert";
import { PlayerRegistry } from "../src/models/players.ts";
import { Rooms } from "../src/models/rooms.ts";
import { App, Bindings } from "../src/models/types.ts";

interface TestApp {
  (host: string, ...players: string[]): { app: App; roomId: string };
}

const createAppWithPlayers = (...players: string[]): App => {
  const bindings: Bindings = {
    playerRegistry: new PlayerRegistry(),
    rooms: new Rooms(),
  };

  for (const player of players) {
    bindings.playerRegistry.createPlayer(player);
  }

  return createApp(bindings);
};

const createAppWithHostedRoom: TestApp = (host, ...players) => {
  const bindings: Bindings = {
    playerRegistry: new PlayerRegistry(),
    rooms: new Rooms(),
  };

  bindings.playerRegistry.createPlayer(host);
  const roomId = bindings.rooms.addHost(host);
  bindings.playerRegistry.assignRoom(host, roomId);

  for (const player of players) {
    bindings.rooms.addPlayer(player, roomId);
    bindings.playerRegistry.assignRoom(player, roomId);
  }

  const app = createApp(bindings);

  return { app, roomId };
};

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
    const playerName = "testing";

    const { app, roomId } = createAppWithHostedRoom(playerName);
    const response = await app.request("/setup/room-id", {
      headers: { cookie: `playerId=${playerName}` },
    });

    const jsonData = await response.json();
    assertEquals(response.status, 200);
    assertEquals(jsonData.roomId.length, 6);
    assertEquals(roomId, jsonData.roomId);
  });
});

describe("handleJoin ", () => {
  it("should redirect to waiting the user if room id is valid", async () => {
    const playerName = "Gangadhar";
    const { app, roomId } = createAppWithHostedRoom(playerName);

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
    const playerName = "Ramulal";
    const { app } = createAppWithHostedRoom(playerName);

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
    const playerName = "testing";
    const { app } = createAppWithHostedRoom(playerName);

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

describe("servePlayerList", () => {
  it("should return the players if players exists", async () => {
    const playerName = "test";
    const { app } = createAppWithHostedRoom(playerName);

    const response = await app.request("/setup/player-list", {
      headers: { cookie: `playerId=${playerName}` },
    });

    const expected = { isRoomFull: false, players: ["test"] };
    const actual = await response.json();

    assertEquals(actual, expected);
  });

  it("should return the players if players exists", async () => {
    const allPlayers = ["test1", "test2", "test3"];
    const [host, ...players] = allPlayers;
    const { app } = createAppWithHostedRoom(host, ...players);

    const response = await app.request("/setup/player-list", {
      headers: { cookie: `playerId=${host}` },
    });

    const expected = {
      isRoomFull: false,
      players: allPlayers,
    };

    const actual = await response.json();

    assertEquals(actual, expected);
  });

  it("should return Failure if roomId is invalid or there is no room id", async () => {
    const playerName = "faking";
    const app = createAppWithPlayers(playerName);

    const response = await app.request("/setup/player-list", {
      headers: { cookie: `playerId=${playerName}` },
    });

    const actual = await response.json();
    const expected = { success: false };

    assertEquals(response.status, 400);
    assertEquals(actual, expected);
  });
});

describe("removeplayer", () => {
  it("should remove the player if matchId is valid", async () => {
    const playerName = "test1";
    const { app } = createAppWithHostedRoom(playerName);

    const response = await app.request("/setup/remove-player", {
      headers: {
        cookie: `playerId=${playerName}`,
      },
    });

    assertEquals(response.status, 200);
    const data = await response.json();

    assertEquals(data, { success: true });
  });

  it("should not remove the player if matchId is is not present", async () => {
    const playerName = "test1";
    const app = createAppWithPlayers(playerName);

    const response = await app.request("/setup/remove-player", {
      headers: {
        cookie: `playerId=${playerName}`,
      },
    });

    assertEquals(response.status, 200);
    const data = await response.json();

    assertEquals(data, { success: false });
  });
});
