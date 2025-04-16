import { Hono, HonoRequest } from "hono";
import { serveStatic } from "hono/deno";
import { Handler } from "hono/types";
import { createAuthApp } from "./authonticated.ts";

const extractPlayer = async (request: HonoRequest): Promise<string> => {
  const fd = await request.formData();
  const plyerName = fd.get("playerName");

  return String(plyerName);
};

const loginHandler: Handler = async (context) => {
  const playerName = await extractPlayer(context.req);
  console.log(playerName);

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
