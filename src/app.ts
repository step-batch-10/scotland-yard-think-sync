import { Hono } from "hono";
import { logger } from "hono/logger";
import { getCookie } from "hono/cookie";
import { serveStatic } from "hono/deno";
import { MiddlewareHandler } from "hono/types";

const ensureAthenticated: MiddlewareHandler = async (context, next) => {
  const cookie = getCookie(context, "playerId");
  if (cookie) {
    return await next();
  }

  return context.redirect("/login", 303);
};

export const createApp = (): Hono => {
  const app = new Hono();

  app.use(logger());
  app.use(ensureAthenticated);
  app.get("/login", serveStatic({ path: "./public/html/login.html" }));
  app.get(serveStatic({ root: "./public" }));

  return app;
};
