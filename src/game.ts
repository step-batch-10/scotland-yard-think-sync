import { Hono } from "hono";
import { Bindings, GameContext, GameHandler } from "./models/types.ts";
import { extractPlayerId } from "./game_setup.ts";

export function mapToObject<T>(map?: Map<string, T>) {
  if (!map) return {};

  return Object.fromEntries([...map.entries()]);
}

const serveMatchInfo: GameHandler = (context: GameContext) => {
  const playerId = extractPlayerId(context);
  const { roomId: matchID = "" } =
    context.env.playerRegistry.getPlayerStats(playerId);

  const match = context.env.match.getMatch(matchID);
  if (!match) return context.json({ message: "Game not found" }, 404);

  const rolesMap = match.game.getRoles();
  const roles = mapToObject<string>(rolesMap);

  return context.json({ roles });
};

const serveMatchState: GameHandler = (context: GameContext) => {
  const playerId = extractPlayerId(context);
  const { roomId: matchID = "" } =
    context.env.playerRegistry.getPlayerStats(playerId);

  const match = context.env.match.getMatch(matchID);
  if (!match) return context.json({ message: "Game not found" }, 404);

  const state = match.game.getGameState();

  return context.json(state);
};

export const createGame = (): Hono<{ Bindings: Bindings }> => {
  const gameApp = new Hono<{ Bindings: Bindings }>();
  gameApp.get("/info", serveMatchInfo);
  gameApp.get("/state", serveMatchState);

  return gameApp;
};
