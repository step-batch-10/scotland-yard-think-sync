import { Hono, HonoRequest } from "hono";
import { getCookie } from "hono/cookie";
import { Bindings, GameContext, GameHandler } from "./models/types.ts";

export const extractPlayerId = (context: GameContext): string => {
  const playerId = getCookie(context, "playerId");

  return String(playerId);
};

const handleCreateRoom = (context: GameContext) => {
  const playerId = extractPlayerId(context);
  const roomId = context.env.rooms.addHost(playerId);
  context.env.playerRegistry.assignRoom(playerId, roomId);

  return context.json({ success: true });
};

const extractRoomId = async (request: HonoRequest): Promise<string> => {
  const fd = await request.formData();
  const roomId = fd.get("roomId") || "";

  return roomId.toString();
};

const handleJoinRoom: GameHandler = async (context: GameContext) => {
  const playerId = extractPlayerId(context);
  const roomId = await extractRoomId(context.req);

  if (!context.env.rooms.hasRoom(roomId)) {
    return context.redirect("/html/join.html", 303);
  }

  context.env.playerRegistry.assignRoom(playerId, roomId);
  context.env.rooms.addPlayer(playerId, roomId);

  return context.redirect("/html/waitingPage.html", 303);
};

const serveRoomId = (context: GameContext) => {
  const playerId = extractPlayerId(context);
  const player = context.env.playerRegistry.getPlayerStats(playerId);

  return context.json({ roomId: player.matchID });
};

const servePlayerList = (context: GameContext) => {
  const playerId = extractPlayerId(context);
  const player = context.env.playerRegistry.getPlayerStats(playerId);
  const matchID = player.matchID || "";

  const players = context.env.rooms.getPlayers(matchID);
  if (!players) return context.json({ success: false }, 400);

  const isRoomFull = context.env.rooms.isRoomFull(matchID);

  return context.json({ isRoomFull, players: [...players] });
};

const removePlayer = (context: GameContext) => {
  const playerId = extractPlayerId(context);
  const player = context.env.playerRegistry.getPlayerStats(playerId);

  if (!player.matchID) return context.json({ success: false });

  context.env.rooms.removePlayer(playerId, player.matchID);

  return context.json({ success: true });
};

export const createAuthApp = (): Hono<{ Bindings: Bindings }> => {
  const app = new Hono<{ Bindings: Bindings }>();

  app.get("/create-room", handleCreateRoom);
  app.get("/room-id", serveRoomId);
  app.get("/player-list", servePlayerList);
  app.post("/join-room", handleJoinRoom);
  app.get("/remove-player", removePlayer);

  return app;
};
