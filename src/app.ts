import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { Handler } from "hono/types";
import { createAuthApp } from "./authonticated.ts";

const loginHandler: Handler = (context) => {
  return context;
};

export const createApp = (): Hono => {
  const app = new Hono();
  const authApp = createAuthApp();
  app.route("/setup", authApp);
  app.get(serveStatic({ root: "./public" }));

  app.post("/login", loginHandler);

  return app;
};
