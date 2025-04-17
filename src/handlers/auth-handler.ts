import { getCookie, setCookie } from "hono/cookie";
import { MiddlewareHandler } from "hono/types";
import { HonoRequest } from "hono";
import { GameContext, GameHandler, GameMiddleWare } from "../models/types.ts";
import { extractPlayerId } from "../game_setup.ts";

export const ensureAuthenticated: MiddlewareHandler = async (
  context: GameContext,
  next
) => {
  const playerId = getCookie(context, "playerId") || "";
  const playerRegistry = context.env.playerRegistry;

  if (playerRegistry.isPlayerRegistered(playerId)) {
    return await next();
  }

  return context.redirect("/login", 303);
};

export const extractPlayer = async (request: HonoRequest): Promise<string> => {
  const fd = await request.formData();
  const plyerName = fd.get("playerName");

  return String(plyerName);
};

export const loginHandler: GameHandler = async (context) => {
  const playerName = await extractPlayer(context.req);
  context.env.playerRegistry.createPlayer(playerName);
  setCookie(context, "playerId", playerName);

  return context.redirect("/lobby", 303);
};

export const skipIfAuthenticated: GameMiddleWare = async (context, next) => {
  const playerId = extractPlayerId(context);
  const registry = context.env.playerRegistry;

  if (registry.isPlayerRegistered(playerId)) {
    return context.redirect("/lobby", 303);
  }

  await next();
};
