import { Context, Hono } from "hono";
import { PlayerRegistry } from "./players.ts";
import { Handler, MiddlewareHandler } from "hono/types";
import { Rooms } from "./rooms.ts";
import { Match } from "./match.ts";

export enum Role {
  Red = "Red",
  Blue = "Blue",
  Green = "Green",
  Yellow = "Yellow",
  Purple = "Purple",
  MrX = "MrX",
}

export enum Transport {
  Bus = "Bus",
  Taxi = "Taxi",
  Metro = "Metro",
  Ferry = "Ferry",
}

export enum Ticket {
  Green = "Bus",
  Yellow = "Taxi",
  Red = "Metro",
  Black = "All",
  "2x" = "2x",
}

export type Roles = {
  [key in Role]?: string;
};

export type Positions = {
  [key in Role]?: number;
};

export type AssignedRoles = Map<Role, string>;
export type Tickets = Record<Ticket, number>;
export interface RandomIndex {
  (x: number, y: number): number;
}

export interface PlayerStats {
  roomId?: string;
  isPlaying?: boolean;
}

export type Bindings = {
  playerRegistry: PlayerRegistry;
  rooms: Rooms;
  match: Match;
};

export type GameContext = Context<{ Bindings: Bindings }>;
export type GameHandler = Handler<{ Bindings: Bindings }>;
export type GameMiddleWare = MiddlewareHandler<{ Bindings: Bindings }>;

export type App = Hono<{ Bindings: Bindings }>;

export interface Route {
  to: number;
  mode: Transport;
}

export interface MapRoute {
  [key: number]: Route[];
}
export interface GameMap {
  startingPositions: number[];
  routes: MapRoute;
}
