import { mapToObject } from "../game.ts";
import { RandomIndex, Role, Tickets, Roles, Ticket } from "./types.ts";

const randomNumber: RandomIndex = () => 1;
export class ScotlandYard {
  private readonly players;
  private readonly roles: Role[];
  private assignedRoles: Map<string, string>;
  private tickets: Map<Role, Tickets>;
  private startingStations: number[];
  private currentPostion: Map<Role, number>;

  constructor(players: string[]) {
    this.players = [...players];
    this.assignedRoles = new Map();
    this.tickets = new Map();
    this.currentPostion = new Map();

    this.startingStations = [
      181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193,
    ];

    this.roles = [
      Role.MrX,
      Role.Red,
      Role.Blue,
      Role.Green,
      Role.Yellow,
      Role.Purple,
    ];
  }

  getPlayers(): string[] {
    return this.players;
  }

  private defaultAssignment(): void {
    for (const index in this.players) {
      const role = this.roles[index];
      if (!this.assignedRoles.has(role)) {
        this.assignedRoles.set(role, this.players[index]);
      }
    }
  }

  assignRole(roles?: Roles): void {
    if (roles) this.assignedRoles = new Map(Object.entries(roles));
    this.defaultAssignment();
  }

  getRoles(): Map<string, string> {
    return this.assignedRoles;
  }

  static ticketsOfDetective(): Record<Ticket, number> {
    return {
      [Ticket.Green]: 8,
      [Ticket.Yellow]: 10,
      [Ticket.Red]: 4,
      [Ticket.Black]: 0,
      [Ticket["2x"]]: 0,
    };
  }

  static ticketsOfMrX(): Record<Ticket, number> {
    return {
      [Ticket.Green]: 3,
      [Ticket.Yellow]: 4,
      [Ticket.Red]: 3,
      [Ticket.Black]: 5,
      [Ticket["2x"]]: 2,
    };
  }

  distributeTickets(): void {
    for (const index in this.players) {
      const role = this.roles[index];
      const tickets =
        role === Role.MrX
          ? ScotlandYard.ticketsOfMrX()
          : ScotlandYard.ticketsOfDetective();

      this.tickets.set(role, tickets);
    }
  }

  getTickets() {
    return this.tickets;
  }

  assignStartingPositions(random: RandomIndex = randomNumber) {
    const positions = [...this.startingStations];

    for (let index = 0; index < this.roles.length; index++) {
      const role = this.roles[index];

      const randomIndex = random(0, 6) % positions.length;
      const [start] = positions.splice(randomIndex, 1);
      this.currentPostion.set(role, start);
    }
  }

  getGameState() {
    return {
      tickets: mapToObject<Tickets>(this.tickets),
      roles: mapToObject<string>(this.assignedRoles),
      positions: mapToObject(this.currentPostion),
    };
  }

  getCurrentPostion() {
    return this.currentPostion;
  }
}
