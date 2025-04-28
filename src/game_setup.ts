import { Hono, HonoRequest } from "hono";
import { getCookie } from "hono/cookie";
import { Bindings, GameContext, GameHandler } from "./models/types.ts";

export const extractPlayerId = (context: GameContext): string => {
  const playerId = getCookie(context, "playerId");

  return String(playerId);
};

export const extractNumberOfPlayers = async (
  request: HonoRequest | Request,
) => {
  const fd = await request.formData();
  return Number(fd.get("playerCount")) || 6;
};

const handleCreateRoom = async (context: GameContext) => {
  const playerId = extractPlayerId(context);
  const numberOfPlayers = await extractNumberOfPlayers(context.req);

  const roomId = context.env.rooms.addHost(playerId, numberOfPlayers);
  context.env.playerRegistry.assignRoom(roomId, playerId);

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
    return context.json({ isJoined: false, message: "Invalid roomId" }, 400);
  }

  if (context.env.rooms.isRoomFull(roomId)) {
    return context.json({ isJoined: false, message: "Room is full" }, 400);
  }

  context.env.playerRegistry.assignRoom(roomId, playerId);
  context.env.rooms.addPlayer(roomId, playerId);

  return context.json({
    isJoined: true,
    location: "/html/waiting.html",
    message: "Successfully joined",
  });
};

const serveRoomId = (context: GameContext) => {
  const playerId = extractPlayerId(context);
  const player = context.env.playerRegistry.getPlayerStats(playerId);

  return context.json({ roomId: player.roomId });
};

const servePlayerList = (context: GameContext) => {
  const playerId = extractPlayerId(context);
  const player = context.env.playerRegistry.getPlayerStats(playerId);
  const roomId = player.roomId || "";

  const players = context.env.rooms.getPlayers(roomId);
  if (!players) return context.json({ isValid: false }, 400);

  const isRoomFull = context.env.rooms.isRoomFull(roomId);

  if (isRoomFull) {
    context.env.rooms.assignGame(roomId, context.env.controller);
  }

  return context.json({ isRoomFull, players: [...players] });
};

const removePlayer = (context: GameContext) => {
  const playerId = extractPlayerId(context);
  const player = context.env.playerRegistry.getPlayerStats(playerId);

  if (!player.roomId) return context.json({ isRemoved: false });

  const isRemoved = context.env.rooms.removePlayer(player.roomId, playerId);

  return context.json({ isRemoved });
};

export const createGameSetup = (): Hono<{ Bindings: Bindings }> => {
  const gameSetup = new Hono<{ Bindings: Bindings }>();

  gameSetup.post("/create-room", handleCreateRoom);
  gameSetup.get("/room-id", serveRoomId);
  gameSetup.get("/player-list", servePlayerList);
  gameSetup.post("/join-room", handleJoinRoom);
  gameSetup.get("/remove-player", removePlayer);

  return gameSetup;
};
