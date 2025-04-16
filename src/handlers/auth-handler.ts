import { getCookie } from "hono/cookie";
import { MiddlewareHandler } from "hono/types";
import { HonoRequest } from "hono";
import { Handler } from "hono/types";

export const ensureAthenticated: MiddlewareHandler = async (context, next) => {
  const cookie = getCookie(context, "playerId");
  if (cookie) {
    return await next();
  }

  return context.redirect("/login", 303);
};

export const extractPlayer = async (request: HonoRequest): Promise<string> => {
  const fd = await request.formData();
  const plyerName = fd.get("playerName");

  return String(plyerName);
};

export const loginHandler: Handler = async (context) => {
  const playerName = await extractPlayer(context.req);
  console.log(playerName);

  return context;
};
