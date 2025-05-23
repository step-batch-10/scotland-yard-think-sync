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
import { mapToObject } from "./game_utils.ts";

export const alreadyInGame: GameMiddleWare = async (context, next) => {
  const playerId = extractPlayerId(context);
  const playerStat = context.env.playerRegistry.getPlayerStats(playerId);

  if (playerStat.isPlaying && context.req.path !== "/html/game.html") {
    return context.redirect("/html/game.html");
  }

  return await next();
};

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
  const { match } = context.env;

  const rolesMap = match!.game.getRoles();
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
  const { match, playerId } = context.env;
  const gameState = fetchGameState(match!.game, playerId!);

  return context.json(gameState);
};

const servePossibleStations: GameHandler = (context) => {
  const playerId = extractPlayerId(context);
  const { match } = context.env;
  const { roles, currentRole } = match!.game.getGameState(playerId);
  const isYourTurn = roles[currentRole] === playerId;

  if (!isYourTurn) return context.json([], 401);

  const nearbyStations = match!.game.possibleStations();
  return context.json(nearbyStations);
};

const handleMovement: GameHandler = (context: GameContext) => {
  const { match } = context.env;
  const { to, type } = context.req.param() as { to: string; type: Ticket };

  const success = match!.game.useTicket(type, Number(to));

  return context.json({ success });
};

const createSkipMessage = (game: ScotlandYard) => {
  const currentRole = game.getCurrentRole();
  const newRole = game.changePlayer();

  return `${currentRole} is skipped and nextPlayer is ${newRole}`;
};

const handleSkipPlayer: GameHandler = (context: GameContext) => {
  const { match } = context.env;
  const message = createSkipMessage(match!.game);

  return context.json({ message });
};

const handleEnableTwoX: GameHandler = (context) => {
  const { match } = context.env;
  const accepted = match!.game.enable2X();

  return context.json({ accepted });
};

const handleMrXLog: GameHandler = (context) => {
  const { match } = extractMatchAndPlayerId(context);
  const logs = match.game.getMrXHistoryLog();

  return context.json(logs);
};

const loadGame: GameMiddleWare = async (context, next) => {
  const { match, playerId } = extractMatchAndPlayerId(context);

  context.env.match = match;
  context.env.playerId = playerId;

  return await next();
};

const handlePlayAgain = (context: GameContext) => {
  const { playerId } = extractMatchAndPlayerId(context);
  context.env.playerRegistry.resetPlayer(playerId);

  return context.redirect("/lobby");
};

export const createGameRoutes = (): Hono<{ Bindings: Bindings }> => {
  const gameApp = new Hono<{ Bindings: Bindings }>();

  gameApp.use(loadGame);

  gameApp.get("/info", serveMatchInfo);
  gameApp.get("/state", serveMatchState);
  gameApp.get("/possible-stations", servePossibleStations);
  gameApp.get("/skip-move", handleSkipPlayer);
  gameApp.get("/move/:to/ticket/:type", handleMovement);
  gameApp.get("/enable-2x", handleEnableTwoX);
  gameApp.get("/mrXlog", handleMrXLog);
  gameApp.post("/play-again", handlePlayAgain);

  return gameApp;
};
