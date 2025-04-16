import { logger } from "hono/logger";
import { Hono, MiddlewareHandler } from "hono";
import { serveStatic } from "hono/deno";
import { createAuthApp } from "./authonticated.ts";
import { loginHandler } from "./handlers/auth-handler.ts";
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
  // app.use(ensureAthenticated);
  app.get("/login", serveStatic({ path: "./public/html/login.html" }));
  app.route("/setup", createAuthApp());

  app.get("*", serveStatic({ root: "public" }));

  app.post("/login", loginHandler);

  return app;
};
