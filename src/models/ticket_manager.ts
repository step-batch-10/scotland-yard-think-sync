import {
  Role,
  Route,
  Ticket,
  Tickets,
  Transport,
  ValidTickets,
} from "./types.ts";
import { ticketsOf } from "./tickets.ts";

export class TicketManager {
  private roles: Role[];
  private tickets: Map<Role, Tickets>;

  constructor(roles: Role[]) {
    this.tickets = new Map();
    this.roles = roles;
  }

  static validTicket(ticket: Ticket, mode: Transport): boolean {
    if (Ticket.Black === ticket) return mode in Transport;

    return ticket.toString() === mode.toString();
  }

  static canTravel(ticket: Ticket, destination: number) {
    return ({ to, mode }: Route) => {
      return to === destination && TicketManager.validTicket(ticket, mode);
    };
  }

  static validTicketOption(tickets: Ticket[], mode: Transport): Ticket[] {
    return tickets.filter((ticket) => TicketManager.validTicket(ticket, mode));
  }

  static possibleStationTickets(routes: Route[], tickets: Ticket[]) {
    const groupedRoutes = Object.entries(
      Object.groupBy(routes, ({ to }) => to),
    );

    const getvalidTickets: ValidTickets = ({ mode }) =>
      TicketManager.validTicketOption(tickets, mode);

    const pair = groupedRoutes.map(([to, routes]): [number, Ticket[]] => [
      Number(to),
      [...new Set(routes!.flatMap(getvalidTickets))],
    ]);

    return pair.map(([to, tickets]) => ({ to, tickets }));
  }

  distributeTickets(): void {
    this.roles.forEach((role) => {
      this.tickets.set(role, ticketsOf(role));
    });
  }

  hasTickets(role: Role, ticket: Ticket): boolean {
    return this.tickets.get(role)![ticket] > 0;
  }

  reduceTickets(role: Role, mode: Ticket): void {
    this.tickets.get(role)![mode] -= 1;
  }

  fuelMrX(currentRole: Role, mode: Ticket): void {
    const mrXTickets = this.tickets.get(Role.MrX)!;
    this.reduceTickets(currentRole, mode);

    if (currentRole !== Role.MrX) {
      mrXTickets[mode] += 1;
    }
  }

  getValidTickets(currentRole: Role): Ticket[] {
    const tickets = this.tickets.get(currentRole) || {};
    const pairs = Object.entries(tickets).filter(([_, count]) => count !== 0);

    return pairs.map(([ticket]) => ticket as Ticket);
  }

  getTickets(): Map<Role, Tickets> {
    return this.tickets;
  }
}
