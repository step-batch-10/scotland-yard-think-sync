import { Hono } from "hono";
import { Bindings, GameContext, GameHandler } from "./models/types.ts";
import { extractPlayerId } from "./game_setup.ts";
import { Tickets } from "./models/scotland.ts";

export function mapToObject<T>(map?: Map<string, T>) {
  if (!map) return {};

  return Object.fromEntries([...map.entries()]);
}

const serveMatchInfo: GameHandler = (context: GameContext) => {
  const playerId = extractPlayerId(context);
  const { matchID = "" } = context.env.playerRegistry.getPlayerStats(playerId);

  const match = context.env.match.getMatch(matchID);
  if (!match) return context.json({ message: "Game not found" }, 404);

  const rolesMap = match.game.getRoles();
  const ticketsMap = match.game.getTickets();
  const roles = mapToObject<string>(rolesMap);
  const tickets = mapToObject<Tickets>(ticketsMap);

  return context.json({ roles, tickets });
};

export const createGame = (): Hono<{ Bindings: Bindings }> => {
  const gameApp = new Hono<{ Bindings: Bindings }>();
  gameApp.get("/info", serveMatchInfo);

  return gameApp;
};
