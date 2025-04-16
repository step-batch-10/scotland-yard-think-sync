import { Hono } from "hono";
import { serveStatic } from "hono/deno";

export const createApp = (): Hono => {
  const app = new Hono();
  app.get(serveStatic({ root: "./public" }));

  return app;
};
