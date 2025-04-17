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
    return context.json({ isJoined: false, message: "Invalid roomId" }, 400);
  }

  if (context.env.rooms.isRoomFull(roomId)) {
    return context.json({ isJoined: false, message: "Room is full" }, 400);
  }

  context.env.playerRegistry.assignRoom(playerId, roomId);
  context.env.rooms.addPlayer(playerId, roomId);

  return context.json({
    isJoined: true,
    location: "/html/waiting.html",
    message: "Succesfully joined",
  });
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

  if (isRoomFull) {
    context.env.rooms.assignGame(matchID, context.env.match);
  }

  return context.json({ isRoomFull, players: [...players] });
};

const removePlayer = (context: GameContext) => {
  const playerId = extractPlayerId(context);
  const player = context.env.playerRegistry.getPlayerStats(playerId);

  if (!player.matchID) return context.json({ success: false });

  context.env.rooms.removePlayer(playerId, player.matchID);

  return context.json({ success: true });
};

export const createGameSetup = (): Hono<{ Bindings: Bindings }> => {
  const gameSetup = new Hono<{ Bindings: Bindings }>();

  gameSetup.get("/create-room", handleCreateRoom);
  gameSetup.get("/room-id", serveRoomId);
  gameSetup.get("/player-list", servePlayerList);
  gameSetup.post("/join-room", handleJoinRoom);
  gameSetup.get("/remove-player", removePlayer);

  return gameSetup;
};
