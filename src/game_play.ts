import { Hono } from "hono";
import {
  Bindings,
  GameContext,
  GameHandler,
  GameMiddleWare,
  Ticket,
} from "./models/types.ts";
import { extractPlayerId } from "./game_setup.ts";
import { ScotlandYard } from "./models/scotland.ts";
import _ from "lodash";

export function mapToObject<T>(map?: Map<string, T>) {
  if (!map) return {};

  return Object.fromEntries([...map.entries()]);
}

export const ensureActiveGame: GameMiddleWare = async (context, next) => {
  const playerId = extractPlayerId(context);
  const playerStat = context.env.playerRegistry.getPlayerStats(playerId);
  const roomId = playerStat?.roomId!;

  if (!context.env.controller.hasMatch(roomId)) {
    return context.redirect("/lobby");
  }

  return await next();
};

const extractMatchAndPlayerId = (context: GameContext) => {
  const playerId = extractPlayerId(context);
  const { roomId = "" } = context.env.playerRegistry.getPlayerStats(playerId);
  const match = context.env.controller.getMatch(roomId);

  return { match: match!, playerId, roomId };
};

const serveMatchInfo: GameHandler = (context: GameContext) => {
  const { match } = extractMatchAndPlayerId(context);

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

  const gameState = fetchGameState(match.game, playerId);

  return context.json(gameState);
};

const servePossibleStations: GameHandler = (context: GameContext) => {
  const { match } = extractMatchAndPlayerId(context);
  const nearbyStations = match.game.possibleStations();

  return context.json(_.uniqWith(nearbyStations, _.isEqual));
};

const handleMovement: GameHandler = (context: GameContext) => {
  const { match } = extractMatchAndPlayerId(context);
  const { to, mode } = context.req.param() as { to: string; mode: Ticket };

  const success = match.game.useTicket(mode, Number(to));

  return context.json({ success });
};

const broadCastSkipped = (game: ScotlandYard) => {
  const currentRole = game.getCurrentRole();
  const newRole = game.changePlayer();

  return `${currentRole} is skipped and nextPlayer is ${newRole}`;
};

const broadCastMessage: GameHandler = (context: GameContext) => {
  // const broadCastType = context.req.param("type");
  const { match } = extractMatchAndPlayerId(context);
  const message = broadCastSkipped(match.game);

  return context.json({ message });
};

export const createGameRoutes = (): Hono<{ Bindings: Bindings }> => {
  const gameApp = new Hono<{ Bindings: Bindings }>();
  gameApp.get("/info", serveMatchInfo);
  gameApp.get("/state", serveMatchState);
  gameApp.get("/possible-stations", servePossibleStations);
  gameApp.get("/move/:to/ticket/:mode", handleMovement);
  gameApp.get("/broadcast/:type", broadCastMessage);

  return gameApp;
};
