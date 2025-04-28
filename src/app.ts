import { logger } from "hono/logger";
import { Hono, MiddlewareHandler } from "hono";
import { serveStatic } from "hono/deno";
import { createGameSetup } from "./game_setup.ts";
import { Bindings } from "./models/types.ts";
import {
  alreadyInGame,
  createGameRoutes,
  ensureActiveGame,
} from "./game_play.ts";
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

  authApp.use("/html/*", alreadyInGame);

  authApp
    .use("/lobby", alreadyInGame)
    .get(serveStatic({ path: "./public/html/lobby.html" }));

  authApp.route("/setup", createGameSetup());
  authApp
    .use("/game/*", ensureActiveGame)
    .route("/game", createGameRoutes());

  authApp.use(serveAssets);

  return authApp;
};

const createGuestRoutes = () => {
  const guestApp = new Hono<{ Bindings: Bindings }>();

  guestApp
    .use("/login", skipIfAuthenticated)
    .post(loginHandler)
    .get("/login", serveStatic({ path: "./public/html/login.html" }));

  guestApp.use("/css/*", serveAssets);
  guestApp.use("/js/*", serveAssets);
  guestApp.use("/assets/*", serveAssets);

  return guestApp;
};

export const createApp = (bindings: Bindings): Hono<{ Bindings: Bindings }> => {
  const app = new Hono<{ Bindings: Bindings }>();

  app.use(logger());
  app.use(inject(bindings));

  app.route("/", createGuestRoutes());
  //when logged in and requested login: redirect to relevant page
  //when hosting, send any other requests to waiting page
  //when waiting, send any other requests to waiting page
  //when not logged in and requested any html, send to login
  // redirect only html not css/js etc

  app
    .use(ensureAuthenticated)
    .route("/", createAuthenticatedRoutes());

  return app;
};
