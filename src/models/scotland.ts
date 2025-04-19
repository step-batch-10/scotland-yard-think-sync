import { mapToObject } from "../game_play.ts";
import { basicMap } from "../maps/game_map.ts";
import { ticketsOf } from "./tickets.ts";
import { GameMap, RandomIndex, Role, Roles, Route, Tickets } from "./types.ts";

const randomNumber: RandomIndex = () => 1;

export class ScotlandYard {
  private readonly players: string[];
  private readonly roles: Role[];
  private assignedRoles: Map<string, string>;
  private tickets: Map<Role, Tickets>;
  private startingStations: number[];
  private currentStations: Map<Role, number>;
  private currentRole: Role;
  private gameMap: GameMap;

  constructor(players: string[], map: GameMap = basicMap) {
    this.players = [...players];
    this.assignedRoles = new Map();
    this.tickets = new Map();
    this.currentStations = new Map();
    this.startingStations = map.startingPositions;
    this.gameMap = map;

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
      this.currentStations.set(role, start);
    }
  }

  changeTurn() {
    const nextPlayerIndex = (this.roles.indexOf(this.currentRole) + 1) % 6;
    this.currentRole = this.roles[nextPlayerIndex];

    return this.currentRole;
  }

  getDetectivePositions() {
    const playerEntries = this.currentStations.entries();
    const detectiveEntries = [...playerEntries].filter(
      ([role]) => role !== "MrX"
    );

    return detectiveEntries.map(([, position]) => position);
  }

  private getValidRoutes = (station: number) => {
    const availableRoutes = this.gameMap.routes[station] || [];
    const detectivesPos = this.getDetectivePositions();

    return availableRoutes.filter(({ to }) => !detectivesPos.includes(to));
  };

  possibleStations(): Route[] {
    const station: number = this.currentStations.get(this.currentRole) || 0;

    return this.getValidRoutes(station);
  }

  getGameState() {
    return {
      tickets: mapToObject<Tickets>(this.tickets),
      roles: mapToObject<string>(this.assignedRoles),
      positions: mapToObject(this.currentStations),
      currentRole: this.currentRole,
    };
  }

  getCurrentPosition() {
    return this.currentStations;
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
