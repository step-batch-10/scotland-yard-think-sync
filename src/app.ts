import { logger } from "hono/logger";
import { Hono, MiddlewareHandler } from "hono";
import { serveStatic } from "hono/deno";
import { createGameSetup } from "./game_setup.ts";
import {
  ensureAuthenticated,
  skipIfAuthenticated,
  loginHandler,
} from "./handlers/auth-handler.ts";
import { Bindings } from "./models/types.ts";
import { createGame } from "./game.ts";

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

  app.use("/login", skipIfAuthenticated);
  app.post("/login", loginHandler);
  app.get("/login", serveStatic({ path: "./public/html/login.html" }));
  app.get("/css/*", serveStatic({ root: "./public" }));

  app.use(ensureAuthenticated);
  app.get("/lobby", serveStatic({ path: "./public/html/lobby.html" }));

  app.route("/setup", createGameSetup());
  app.route("/game", createGame());

  app.get("*", serveStatic({ root: "public" }));

  return app;
};
