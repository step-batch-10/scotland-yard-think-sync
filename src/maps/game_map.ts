import { GameMap, Transport } from "../models/types.ts";

export const basicMap: GameMap = {
  181: [{ to: 182, mode: Transport.Taxi }],
  182: [
    { to: 183, mode: Transport.Taxi },
    { to: 183, mode: Transport.Metro },
  ],
  183: [{ to: 184, mode: Transport.Taxi }],
  184: [{ to: 185, mode: Transport.Taxi }],
  185: [
    { to: 193, mode: Transport.Taxi },
    { to: 186, mode: Transport.Metro },
  ],
  186: [{ to: 187, mode: Transport.Taxi }],
  187: [
    { to: 188, mode: Transport.Metro },
    { to: 188, mode: Transport.Taxi },
  ],
  188: [{ to: 191, mode: Transport.Metro }],
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
    { to: 191, mode: Transport.Taxi },
    { to: 182, mode: Transport.Taxi },
    { to: 191, mode: Transport.Bus },
    { to: 193, mode: Transport.Metro },
  ],

  193: [
    { to: 185, mode: Transport.Metro },
    { to: 192, mode: Transport.Taxi },
  ],
};
