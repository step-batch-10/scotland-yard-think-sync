import { logger } from "hono/logger";
import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { createAuthApp } from "./authonticated.ts";
import { ensureAthenticated, loginHandler } from "./handlers/auth-handler.ts";

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
