import { logger } from "hono/logger";
import { Hono, MiddlewareHandler } from "hono";
import { serveStatic } from "hono/deno";
import { createGameSetup } from "./game_setup.ts";
import { Bindings } from "./models/types.ts";
import { createGameRoutes, ensureActiveGame } from "./game_play.ts";
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

const createAuthenticatedRoutes = () => {
  const authApp = new Hono<{ Bindings: Bindings }>();

  authApp
    .use("/lobby", ensureActiveGame)
    .get("/lobby", serveStatic({ path: "./public/html/lobby.html" }));

  authApp.route("/setup", createGameSetup());

  authApp.use("/game/*", ensureActiveGame).route("/game", createGameRoutes());

  authApp.get("*", serveAssets);

  return authApp;
};

const createGuestRoutes = () => {
  const guestApp = new Hono<{ Bindings: Bindings }>();

  guestApp
    .use("/login", skipIfAuthenticated)
    .post(loginHandler)
    .get("/login", serveStatic({ path: "./public/html/login.html" }));

  guestApp.get("/favicon.icon", serveAssets);
  guestApp.get("/assets/*", serveAssets);
  guestApp.get("/css/*", serveAssets);

  return guestApp;
};

export const createApp = (bindings: Bindings): Hono<{ Bindings: Bindings }> => {
  const app = new Hono<{ Bindings: Bindings }>();

  app.use(logger());
  app.use(inject(bindings));

  app.route("/", createGuestRoutes());
  app.use(ensureAuthenticated).route("/", createAuthenticatedRoutes());

  return app;
};
