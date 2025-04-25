import { GameMap, MapRoute, Transport } from "../models/types.ts";

const routes: MapRoute = {
  101: [{ to: 109, mode: Transport.Taxi }],
  102: [],
  103: [{ to: 100, mode: Transport.Taxi }],
  104: [],
  105: [],
  106: [],
  100: [],
  109: [],
};

export const deadMap: GameMap = {
  startingPositions: [100, 101, 102, 103, 104, 105, 106],
  routes,
};
