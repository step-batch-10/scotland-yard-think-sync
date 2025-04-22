import { GameMap, MapRoute, Transport } from "../models/types.ts";

const routes: MapRoute = {
  181: [{ to: 182, mode: Transport.Taxi }],

  182: [
    { to: 181, mode: Transport.Taxi },
    { to: 181, mode: Transport.Bus },
    { to: 183, mode: Transport.Taxi },
    { to: 183, mode: Transport.Metro },
    { to: 195, mode: Transport.Taxi },
  ],

  183: [
    { to: 182, mode: Transport.Taxi },
    { to: 182, mode: Transport.Metro },
    { to: 184, mode: Transport.Taxi },
  ],

  184: [
    { to: 183, mode: Transport.Taxi },
    { to: 185, mode: Transport.Taxi },
  ],

  185: [
    { to: 184, mode: Transport.Taxi },
    { to: 186, mode: Transport.Metro },
    { to: 193, mode: Transport.Taxi },
  ],

  186: [
    { to: 185, mode: Transport.Metro },
    { to: 187, mode: Transport.Taxi },
  ],

  187: [
    { to: 186, mode: Transport.Taxi },
    { to: 188, mode: Transport.Metro },
    { to: 188, mode: Transport.Taxi },
  ],

  188: [
    { to: 187, mode: Transport.Taxi },
    { to: 187, mode: Transport.Metro },
    { to: 191, mode: Transport.Metro },
  ],

  189: [{ to: 190, mode: Transport.Taxi }],

  190: [
    { to: 189, mode: Transport.Taxi },
    { to: 191, mode: Transport.Taxi },
  ],

  191: [
    { to: 188, mode: Transport.Metro },
    { to: 190, mode: Transport.Taxi },
    { to: 192, mode: Transport.Taxi },
    { to: 192, mode: Transport.Bus },
  ],

  192: [
    { to: 182, mode: Transport.Taxi },
    { to: 191, mode: Transport.Taxi },
    { to: 191, mode: Transport.Bus },
    { to: 193, mode: Transport.Metro },
  ],

  193: [
    { to: 185, mode: Transport.Metro },
    { to: 192, mode: Transport.Taxi },
  ],
};

export const basicMap: GameMap = {
  startingPositions: [
    181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193,
  ],
  routes,
};
