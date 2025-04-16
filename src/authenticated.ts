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

const exatractRoomId = async (request: HonoRequest): Promise<string> => {
  const fd = await request.formData();
  const roomId = fd.get("roomId") || "";

  return roomId.toString();
};

const handleJoinRoom: GameHandler = async (context: GameContext) => {
  const playerId = extractPlayerId(context);
  const roomId = await exatractRoomId(context.req);

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

const servePlayerList = (ctx: GameContext) => {
  const playerId = getCookie(ctx, "playerId") || "";
  const player = ctx.env.playerRegistry.getPlayer(playerId);
  const players = ctx.env.rooms.getPlayers(player.matchID || "");
  const isRoomFull = ctx.env.rooms.isRoomFull(player.matchID || "");
  if (!players) return ctx.json({ success: false }, 400);

  return ctx.json({ isRoomFull, players: [...players] });
};

export const createAuthApp = (): Hono<{ Bindings: Bindings }> => {
  const app = new Hono<{ Bindings: Bindings }>();

  app.get("/setup/create-room", handleCreateRoom);
  app.get("/setup/room-id", serveRoomId);
  app.get("/setup/player-list", servePlayerList);
  return app;
};
