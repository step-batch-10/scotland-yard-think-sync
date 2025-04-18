import { Ticket, Role } from "./types.ts";

const ticketsOfDetective = (): Record<Ticket, number> => ({
  [Ticket.Green]: 8,
  [Ticket.Yellow]: 10,
  [Ticket.Red]: 4,
  [Ticket.Black]: 0,
  [Ticket["2x"]]: 0,
});
const ticketsOfMrX = (): Record<Ticket, number> => ({
  [Ticket.Green]: 3,
  [Ticket.Yellow]: 4,
  [Ticket.Red]: 3,
  [Ticket.Black]: 5,
  [Ticket["2x"]]: 2,
});

export const ticketsOf = (role: Role): Record<Ticket, number> =>
  role === Role.MrX ? ticketsOfMrX() : ticketsOfDetective();
