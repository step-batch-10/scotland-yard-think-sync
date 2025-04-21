import { Hono } from "hono";
import { Bindings, GameContext, GameHandler } from "./models/types.ts";
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

const getGameState = (game: ScotlandYard, playerId: string) => {
  const state = game.getGameState();
  const { roles, currentRole } = state;
  const isYourTurn = roles[currentRole] === playerId;

  return { ...state, isYourTurn };
};

const serveMatchState: GameHandler = (context: GameContext) => {
  const { match, playerId } = extractMatchAndPlayerId(context);

  if (!match) return context.json({ message: "Game not found" }, 404);

  const gameState = getGameState(match.game, playerId);

  return context.json(gameState);
};

const servePossibleStations: GameHandler = (context) => {
  console.log("Inside the servePossibleStations", context);

  const { match } = extractMatchAndPlayerId(context);
  const nearbyStations = match?.game.possibleStations();

  return context.json(nearbyStations);
};

export const createGameRoutes = (): Hono<{ Bindings: Bindings }> => {
  const gameApp = new Hono<{ Bindings: Bindings }>();
  gameApp.get("/info", serveMatchInfo);
  gameApp.get("/state", serveMatchState);
  gameApp.get("/possible-stations", servePossibleStations);

  return gameApp;
};
