import { Context, Hono } from "hono";
import { PlayerRegistry } from "./players.ts";
import { Handler, MiddlewareHandler } from "hono/types";
import { Rooms } from "./rooms.ts";
import { GameController } from "./game_controller.ts";
import { ScotlandYard } from "./scotland.ts";

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
  Black = "Wild",
  "2x" = "2x",
}

export type Roles = {
  [key in Role]?: string;
};

export type Positions = {
  [key in Role]?: number | null;
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

export interface MatchStatus {
  game: ScotlandYard;
  winner: null | string;
  isGameFinished: boolean;
}

export type Bindings = {
  playerRegistry: PlayerRegistry;
  rooms: Rooms;
  controller: GameController;
  match?: MatchStatus;
  playerId?: string;
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

export type Winner = null | "Detective" | "MrX";
export interface Log {
  to: number;
  mode: Ticket;
}

export interface Options {
  isTwoX: boolean;
}
