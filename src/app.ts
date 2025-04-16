import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { createAuthApp } from "./authonticated.ts";

export const createApp = (): Hono => {
  const app = new Hono();
  const authApp = createAuthApp();
  app.route("/setup", authApp);
  app.get(serveStatic({ root: "./public" }));

  return app;
};
