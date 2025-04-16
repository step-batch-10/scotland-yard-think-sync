import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { createAuthApp } from "./authonticated.ts";

export const createApp = (): Hono => {
  const app = new Hono();
  app.route("/setup", createAuthApp());
  app.get(serveStatic({ root: "./public" }));

  return app;
};
