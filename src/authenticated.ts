import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { Bindings, GameContext } from "./models/types.ts";

const handleCreateRoom = (ctx: GameContext) => {
  const playerId = getCookie(ctx, "playerId") || "";
  const roomId = ctx.env.rooms.addHost(playerId);
  ctx.env.playerRegistry.assignRoom(playerId, roomId);

  return ctx.json({ success: true });
};

export const createAuthApp = (): Hono<{ Bindings: Bindings }> => {
  const app = new Hono<{ Bindings: Bindings }>();
  app.get("/setup/createRoom", handleCreateRoom);

  return app;
};
