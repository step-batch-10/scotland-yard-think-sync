import { Context, Hono } from "hono";

const handleCreateRoom = (ctx: Context) => {
  return ctx.json({ success: true });
};

export const createAuthApp = (): Hono => {
  const app = new Hono();
  app.get("/createRoom", handleCreateRoom);
  return app;
};
