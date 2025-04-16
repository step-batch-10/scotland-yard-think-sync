import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { Handler } from "hono/types";

const loginHandler: Handler = (context) => {
  return context;
};

export const createApp = (): Hono => {
  const app = new Hono();
  app.get(serveStatic({ root: "./public" }));

  app.post("/login", loginHandler);

  return app;
};
