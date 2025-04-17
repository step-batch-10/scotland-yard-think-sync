import { Hono } from "hono";
import { Bindings, GameContext, GameHandler } from "./models/types.ts";
import { extractPlayerId } from "./game_setup.ts";

const serveRoles: GameHandler = (context: GameContext) => {
  const playerId = extractPlayerId(context);
  context.env.playerRegistry.getPlayerStats(playerId);

  return context.text("ok");
};

export const createGame = (): Hono<{ Bindings: Bindings }> => {
  const gameApp = new Hono<{ Bindings: Bindings }>();
  gameApp.get("/info", serveRoles);
  return gameApp;
};
