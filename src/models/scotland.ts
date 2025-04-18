import { mapToObject } from "../game.ts";
import { basicMap } from "../maps/game_map.ts";
import { ticketsOf } from "./tickets.ts";
import { RandomIndex, Role, Tickets, Roles, GameMap } from "./types.ts";

const randomNumber: RandomIndex = () => 1;

export class ScotlandYard {
  private readonly players: string[];
  private readonly roles: Role[];
  private assignedRoles: Map<string, string>;
  private tickets: Map<Role, Tickets>;
  private startingStations: number[];
  private currentPosition: Map<Role, number>;
  private currentRole: Role;

  constructor(players: string[], map: GameMap = basicMap) {
    this.players = [...players];
    this.assignedRoles = new Map();
    this.tickets = new Map();
    this.currentPosition = new Map();
    this.startingStations = map.startingPositions;
    this.roles = [
      Role.MrX,
      Role.Red,
      Role.Blue,
      Role.Green,
      Role.Yellow,
      Role.Purple,
    ];
    this.currentRole = this.roles[0];
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

  distributeTickets(): void {
    for (const index in this.players) {
      const role = this.roles[index];
      this.tickets.set(role, ticketsOf(role));
    }
  }

  assignStartingPositions(random: RandomIndex = randomNumber) {
    const positions = [...this.startingStations];

    for (let index = 0; index < this.roles.length; index++) {
      const role = this.roles[index];

      const randomIndex = random(0, 6) % positions.length;
      const [start] = positions.splice(randomIndex, 1);
      this.currentPosition.set(role, start);
    }
  }

  changeTurn() {
    const nextPlayerIndex = (this.roles.indexOf(this.currentRole) + 1) % 6;
    this.currentRole = this.roles[nextPlayerIndex];

    return this.currentRole;
  }

  getGameState() {
    return {
      tickets: mapToObject<Tickets>(this.tickets),
      roles: mapToObject<string>(this.assignedRoles),
      positions: mapToObject(this.currentPosition),
      currentRole: this.currentRole,
    };
  }

  getCurrentPosition() {
    return this.currentPosition;
  }

  getPlayers(): string[] {
    return this.players;
  }

  getRoles(): Map<string, string> {
    return this.assignedRoles;
  }

  getTickets() {
    return this.tickets;
  }
}
