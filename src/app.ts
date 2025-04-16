import { logger } from "hono/logger";
import { getCookie } from "hono/cookie";
import { MiddlewareHandler } from "hono/types";
import { Hono, HonoRequest } from "hono";
import { serveStatic } from "hono/deno";
import { Handler } from "hono/types";
import { createAuthApp } from "./authonticated.ts";

const ensureAthenticated: MiddlewareHandler = async (context, next) => {
  const cookie = getCookie(context, "playerId");
  if (cookie) {
    return await next();
  }

  return context.redirect("/login", 303);
};

const extractPlayer = async (request: HonoRequest): Promise<string> => {
  const fd = await request.formData();
  const plyerName = fd.get("playerName");

  return String(plyerName);
};

const loginHandler: Handler = async (context) => {
  const playerName = await extractPlayer(context.req);
  console.log(playerName);

  return context;
};

export const createApp = (): Hono => {
  const app = new Hono();

  app.use(logger());
  app.use(ensureAthenticated);
  app.get("/login", serveStatic({ path: "./public/html/login.html" }));
  app.route("/setup", createAuthApp());
  app.get(serveStatic({ root: "./public" }));

  app.post("/login", loginHandler);

  return app;
};
