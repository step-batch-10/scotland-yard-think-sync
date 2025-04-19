import { logger } from "hono/logger";
import { Hono, MiddlewareHandler } from "hono";
import { serveStatic } from "hono/deno";
import { createGameSetup } from "./game_setup.ts";

import { Bindings } from "./models/types.ts";
import { createGameRoutes } from "./game_play.ts";
import {
  ensureAuthenticated,
  loginHandler,
  skipIfAuthenticated,
} from "./handlers/auth_handler.ts";

const inject = (bindings: Bindings): MiddlewareHandler => {
  return async (context, next) => {
    context.env = bindings;
    await next();
  };
};

const serveAssets = serveStatic({ root: "./public/" });

export const createApp = (bindings: Bindings): Hono<{ Bindings: Bindings }> => {
  const app = new Hono<{ Bindings: Bindings }>();

  app.use(logger());
  app.use(inject(bindings));

  app.use("/login", skipIfAuthenticated);
  app.post("/login", loginHandler);
  app.get("/login", serveStatic({ path: "./public/html/login.html" }));

  app.get("/favicon.icon", serveAssets);
  app.get("/assets/*", serveAssets);
  app.get("/css/*", serveAssets);

  app.use(ensureAuthenticated);
  app.get("/lobby", serveStatic({ path: "./public/html/lobby.html" }));

  app.route("/setup", createGameSetup());
  app.route("/game", createGameRoutes());

  app.get("*", serveStatic({ root: "public" }));

  return app;
};
