import { logger } from "hono/logger";
import { Hono, MiddlewareHandler } from "hono";
import { serveStatic } from "hono/deno";
import { createGameSetup as createSetupRoutes } from "./game_setup.ts";
import {
  ensureAuthenticated,
  loginHandler,
<<<<<<< HEAD
} from "./handlers/auth_handler.ts";
=======
  skipIfAuthenticated,
} from "./handlers/auth-handler.ts";
>>>>>>> 92c3858 ([#29] | Charan/Bhagya | Adds interactivity to map)
import { Bindings } from "./models/types.ts";
import { createGame as createGameRoutes } from "./game_play.ts";

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
  app.get("/assets/*", serveStatic({ root: "./public" }));
  app.get("/css/*", serveStatic({ root: "./public" }));

  app.use(ensureAuthenticated);
  app.get("/lobby", serveStatic({ path: "./public/html/lobby.html" }));

  app.route("/setup", createSetupRoutes());
  app.route("/game", createGameRoutes());

  app.get("*", serveStatic({ root: "public" }));

  return app;
};
