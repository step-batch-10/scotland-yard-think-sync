import { Hono } from "hono";
import { Bindings, GameContext, GameHandler, Ticket } from "./models/types.ts";
import { extractPlayerId } from "./game_setup.ts";
import { ScotlandYard } from "./models/scotland.ts";

export function mapToObject<T>(map?: Map<string, T>) {
  if (!map) return {};

  return Object.fromEntries([...map.entries()]);
}

const extractMatchAndPlayerId = (context: GameContext) => {
  const playerId = extractPlayerId(context);
  const { roomId = "" } = context.env.playerRegistry.getPlayerStats(playerId);
  const match = context.env.match.getMatch(roomId);
  return { match, playerId, roomId };
};

const serveMatchInfo: GameHandler = (context: GameContext) => {
  const { match } = extractMatchAndPlayerId(context);

  if (!match) return context.json({ message: "Game not found" }, 404);

  const rolesMap = match.game.getRoles();
  const roles = mapToObject<string>(rolesMap);

  return context.json({ roles });
};

const fetchGameState = (game: ScotlandYard, playerId: string) => {
  const state = game.getGameState(playerId);

  const { roles, currentRole } = state;
  const isYourTurn = roles[currentRole] === playerId;

  return { ...state, isYourTurn };
};

const serveMatchState: GameHandler = (context: GameContext) => {
  const { match, playerId } = extractMatchAndPlayerId(context);

  if (!match) return context.json({ message: "Game not found" }, 404);

  const gameState = fetchGameState(match.game, playerId);

  return context.json(gameState);
};

const servePossibleStations: GameHandler = (context: GameContext) => {
  const { match } = extractMatchAndPlayerId(context);
  const nearbyStations = match?.game.possibleStations();

  return context.json(nearbyStations);
};

const handleMovement: GameHandler = (context: GameContext) => {
  const { match } = extractMatchAndPlayerId(context);
  const { to, mode } = context.req.param() as { to: string; mode: Ticket };

  if (!mode || !to || !match) return context.json({ success: false });

  const success = match.game.useTicket(mode, Number(to));

  return context.json({ success });
};

export const createGameRoutes = (): Hono<{ Bindings: Bindings }> => {
  const gameApp = new Hono<{ Bindings: Bindings }>();
  gameApp.get("/info", serveMatchInfo);
  gameApp.get("/state", serveMatchState);
  gameApp.get("/possible-stations", servePossibleStations);
  gameApp.get("/move/:to/ticket/:mode", handleMovement);

  return gameApp;
};
