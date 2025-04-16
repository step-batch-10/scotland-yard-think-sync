import { logger } from "hono/logger";
import { Hono, MiddlewareHandler } from "hono";
import { serveStatic } from "hono/deno";
import { createAuthApp as createGameSetup } from "./authenticated.ts";
import { ensureAuthenticated, loginHandler } from "./handlers/auth-handler.ts";
import { Bindings } from "./models/types.ts";

const inject = (bindings: Bindings): MiddlewareHandler => {
  return async (context, next) => {
    context.env = bindings;
    await next();
  };
};

export const createApp = (bindings: Bindings): Hono<{ Bindings: Bindings }> => {
  const app = new Hono<{ Bindings: Bindings }>();

  app.use(logger());

  app.use(inject(bindings));

  app.post("/login", loginHandler);
  app.get("/login", serveStatic({ path: "./public/html/login.html" }));
  app.get("/css/login.css", serveStatic({ root: "./public" }));

  app.use(ensureAuthenticated);
  app.get("/lobby", serveStatic({ path: "./public/html/lobby.html" }));

  app.route("/", createGameSetup());

  app.get("*", serveStatic({ root: "public" }));

  return app;
};
