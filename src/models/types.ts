import { Context, Hono } from "hono";
import { PlayerRegistry } from "./players.ts";
import { Handler } from "hono/types";
import { Rooms } from "./rooms.ts";
import { Match } from "./match.ts";

export interface PlayerStats {
  matchID?: string;
  status?: "waiting" | "playing";
}

export type Bindings = {
  playerRegistry: PlayerRegistry;
  rooms: Rooms;
  match: Match;
};

export type GameContext = Context<{ Bindings: Bindings }>;
export type GameHandler = Handler<{ Bindings: Bindings }>;
export type App = Hono<{ Bindings: Bindings }>;
