import { Hono } from "hono";
import { Bindings, GameContext, GameHandler } from "./models/types.ts";
import { extractPlayerId } from "./game_setup.ts";

export const mapToObject = (map?: Map<string, string>) => {
  if (!map) return {};

  return Object.fromEntries([...map.entries()]);
};

const serveRoles: GameHandler = (context: GameContext) => {
  const playerId = extractPlayerId(context);
  const { matchID = "" } = context.env.playerRegistry.getPlayerStats(playerId);

  const game = context.env.match.getMatch(matchID);
  if (!game) return context.json({ message: "Game not found" }, 404);

  const rolesMap = game.game.getRoles();
  const roles = mapToObject(rolesMap);

  return context.json(roles);
};

export const createGame = (): Hono<{ Bindings: Bindings }> => {
  const gameApp = new Hono<{ Bindings: Bindings }>();
  gameApp.get("/info", serveRoles);

  return gameApp;
};
