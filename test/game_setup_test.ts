import { createApp } from "../src/app.ts";
import { describe, it } from "testing";
import { assert, assertEquals, assertFalse } from "jsr:@std/assert";
import { PlayerRegistry } from "../src/models/players.ts";
import { Rooms } from "../src/models/rooms.ts";
import { App, Bindings } from "../src/models/types.ts";
import { Match } from "../src/models/match.ts";

interface TestApp {
  (host: string, ...players: string[]): {
    app: App;
    roomId: string;
    bindings: Bindings;
  };
}

export const createAppWithPlayers = (...players: string[]): App => {
  const bindings: Bindings = {
    playerRegistry: new PlayerRegistry(),
    rooms: new Rooms(),
    match: new Match(),
  };

  for (const player of players) {
    bindings.playerRegistry.createPlayer(player);
  }

  return createApp(bindings);
};

export const createAppWithHostedRoom: TestApp = (host, ...players) => {
  const bindings: Bindings = {
    playerRegistry: new PlayerRegistry(),
    rooms: new Rooms(),
    match: new Match(),
  };

  bindings.playerRegistry.createPlayer(host);
  const roomId = bindings.rooms.addHost(host);
  bindings.playerRegistry.assignRoom(roomId, host);

  for (const player of players) {
    bindings.rooms.addPlayer(roomId, player);
    bindings.playerRegistry.assignRoom(roomId, player);
  }

  const app = createApp(bindings);

  return { roomId, app, bindings };
};

describe("create room", () => {
  it("should get success if room created", async () => {
    const { app } = createAppWithHostedRoom("a");
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

    const { roomId, app } = createAppWithHostedRoom(playerName);
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
  it("should give valid room message and give location if roomId is valid", async () => {
    const playerName = "Gangadhar";
    const { roomId, app } = createAppWithHostedRoom(playerName);

    const fd = new FormData();
    fd.set("roomId", roomId);

    const response = await app.request("/setup/join-room", {
      headers: { cookie: `playerId=${playerName}` },
      body: fd,
      method: "POST",
    });

    const actual = await response.json();
    const expected = {
      isJoined: true,
      location: "/html/waiting.html",
      message: "Successfully joined",
    };

    assertEquals(response.status, 200);
    assertEquals(actual, expected);
  });

  it("should return false & invalid room id message if room id is invalid", async () => {
    const playerName = "Ramulal";
    const { app } = createAppWithHostedRoom(playerName);

    const fd = new FormData();
    fd.set("roomId", "something");

    const response = await app.request("/setup/join-room", {
      headers: { cookie: `playerId=${playerName}` },
      body: fd,
      method: "POST",
    });

    const actual = await response.json();
    const expected = { isJoined: false, message: "Invalid roomId" };

    assertEquals(response.status, 400);
    assertEquals(actual, expected);
  });

  it("should return false and  invalid room msg if room id is is not present", async () => {
    const playerName = "testing";
    const { app } = createAppWithHostedRoom(playerName);

    const fd = new FormData();

    const response = await app.request("/setup/join-room", {
      headers: { cookie: `playerId=${playerName}` },
      body: fd,
      method: "POST",
    });

    const actual = await response.json();
    const expected = { isJoined: false, message: "Invalid roomId" };

    assertEquals(response.status, 400);
    assertEquals(actual, expected);
  });

  it("should return false and room full message if room is full", async () => {
    const allPlayers = ["test1", "test2", "test3", "test4", "test5", "test6"];
    const [host, ...players] = allPlayers;
    const { roomId, app, bindings } = createAppWithHostedRoom(host, ...players);

    const playerName = "fakeTest";
    bindings.playerRegistry.createPlayer(playerName);

    const fd = new FormData();
    fd.set("roomId", roomId);

    const response = await app.request("/setup/join-room", {
      headers: { cookie: `playerId=${playerName}` },
      body: fd,
      method: "POST",
    });

    const actual = await response.json();
    const expected = { isJoined: false, message: "Room is full" };

    assertEquals(response.status, 400);
    assertEquals(actual, expected);
  });
});

describe("servePlayerList", () => {
  it("should return the player if there is one player", async () => {
    const playerName = "test";
    const { app } = createAppWithHostedRoom(playerName);

    const response = await app.request("/setup/player-list", {
      headers: { cookie: `playerId=${playerName}` },
    });

    const expected = { isRoomFull: false, players: ["test"] };
    const actual = await response.json();

    assertEquals(actual, expected);
  });

  it("should return the players if there are multiple players", async () => {
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
    const expected = { isValid: false };

    assertEquals(response.status, 400);
    assertEquals(actual, expected);
  });

  it("should assign game if room is full", async () => {
    const playerName = "faking";
    const players = ["a", "b", "c", "d", "e"];
    const { app, roomId, bindings } = createAppWithHostedRoom(
      playerName,
      ...players,
    );

    await app.request("/setup/player-list", {
      headers: { cookie: `playerId=${playerName}` },
    });

    assert(bindings.match.hasMatch(roomId));
  });

  it("should not assign game if room is not full", async () => {
    const playerName = "faking";
    const players = ["a", "b", "c", "d"];
    const { app, roomId, bindings } = createAppWithHostedRoom(
      playerName,
      ...players,
    );

    await app.request("/setup/player-list", {
      headers: { cookie: `playerId=${playerName}` },
    });

    assertFalse(bindings.match.hasMatch(roomId));
  });

  it("should not assign a game if the room already has one.", async () => {
    const playerName = "faking";
    const players = ["a", "b", "c", "d", "e"];
    const { app, roomId, bindings } = createAppWithHostedRoom(
      playerName,
      ...players,
    );

    await app.request("/setup/player-list", {
      headers: { cookie: `playerId=${playerName}` },
    });

    assert(bindings.match.hasMatch(roomId));
    assertFalse(bindings.rooms.assignGame(roomId, bindings.match));
  });
});

describe("removePlayer", () => {
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

    assertEquals(data, { isRemoved: true });
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

    assertEquals(data, {
      isRemoved: false,
    });
  });
});
