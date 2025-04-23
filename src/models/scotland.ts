import { mapToObject } from "../game_play.ts";
import { basicMap } from "../maps/half_map.ts";
import { ticketsOf } from "./tickets.ts";
import {
  GameMap,
  Positions,
  RandomIndex,
  Role,
  Roles,
  Route,
  Ticket,
  Tickets,
  Transport,
  Winner,
} from "./types.ts";

const randomNumber: RandomIndex = () => 1;

const reverseObject = (obj: { [key: string]: any }) => {
  const reversedArray = Object.entries(obj).map(([k, v]) => [v, k]);
  return Object.fromEntries(reversedArray);
};

export class ScotlandYard {
  private readonly players: string[];
  private readonly roles: Role[];
  private assignedRoles: Map<string, string>;
  private tickets: Map<Role, Tickets>;
  private startingStations: number[];
  private currentStations: Map<Role, number>;
  private currentRole: Role;
  private gameMap: GameMap;
  private winner: Winner;
  private turnCount: number;
  private totalTurns: number;

  constructor(
    players: string[],
    map: GameMap = basicMap,
    totalTurns: number = 25,
  ) {
    this.players = [...players];
    this.assignedRoles = new Map();
    this.tickets = new Map();
    this.currentStations = new Map();
    this.startingStations = map.startingPositions;
    this.gameMap = map;
    this.winner = null;
    this.turnCount = 0;
    this.totalTurns = totalTurns;

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
      const player = this.assignedRoles.get(role) || this.players[index];

      this.assignedRoles.set(role, player);
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
    const playerIterator = this.currentStations.entries();
    const detectiveEntries = [...playerIterator].filter(
      ([role]) => role !== "MrX",
    );

    return detectiveEntries.map(([, position]) => position);
  }

  validRoutes = (station: number) => {
    const availableRoutes = this.gameMap.routes[station];
    if (!availableRoutes) return [];

    const detectivesPos = this.getDetectivePositions();

    return availableRoutes.filter(({ to }) => !detectivesPos.includes(to));
  };

  possibleStations(): Route[] {
    const station = this.currentStations.get(this.currentRole) || 0;

    return this.validRoutes(station);
  }

  isMrXCaught() {
    const detectivesPos = this.getDetectivePositions();
    const MrXPosition = this.getCurrentPosition().get(Role.MrX) || 0;

    return detectivesPos.includes(MrXPosition);
  }

  isTurnCount(): boolean {
    if (this.isMrXTurn()) {
      this.turnCount += 1;
    }

    return this.turnCount >= this.totalTurns;
  }

  declareWinner() {
    const hasDetectivesWon = this.isMrXCaught();
    const hasMrXWon = this.isTurnCount();

    if (hasDetectivesWon) this.winner = "Detective";
    if (hasMrXWon) this.winner = "MrX";

    return this.winner;
  }

  isGameOver() {
    return Boolean(this.winner);
  }

  isMrXTurn(): boolean {
    return this.currentRole === Role.MrX;
  }

  static validTicket(ticket: Ticket, mode: Transport): boolean {
    if (Ticket.Black === ticket) return mode in Transport;

    return ticket.toString() === mode.toString();
  }

  static canTravel(ticket: Ticket, destination: number) {
    return function ({ to, mode }: Route) {
      return to === destination && ScotlandYard.validTicket(ticket, mode);
    };
  }

  private movePlayer(destination: number) {
    this.currentStations.set(this.currentRole, destination);
  }

  private isPossibleStation(mode: Ticket, destination: number) {
    const possibleStations = this.possibleStations();
    return possibleStations.some(ScotlandYard.canTravel(mode, destination));
  }

  private fuelMrX(tickets: Tickets, mode: Ticket) {
    const mrXTickets = this.tickets.get(Role.MrX);
    tickets[mode] -= 1;

    if (this.currentRole === Role.MrX || !mrXTickets) return;

    mrXTickets[mode] += 1;
  }

  useTicket(mode: Ticket, destination: number): boolean {
    if (!this.isPossibleStation(mode, destination)) return false;

    const tickets = this.tickets.get(this.currentRole);
    if (!tickets || !tickets[mode]) return false;

    this.movePlayer(destination);
    this.fuelMrX(tickets, mode);
    this.changeTurn();
    this.declareWinner();

    return true;
  }

  private view(positions: Positions) {
    return {
      tickets: mapToObject<Tickets>(this.tickets),
      roles: mapToObject<string>(this.assignedRoles),
      positions: positions,
      currentRole: this.currentRole,
      isGameOver: this.isGameOver(),
      winner: this.getWinner(),
    };
  }

  private detectivesView() {
    const positions = mapToObject(this.currentStations);
    delete positions["MrX"];

    return this.view(positions);
  }

  private mrXView() {
    const positions = mapToObject(this.currentStations);
    return this.view(positions);
  }

  findRole(player: string): Role | null {
    const playerRoles = mapToObject<string>(this.assignedRoles);
    const reversed = reverseObject(playerRoles);

    if (!reversed[player]) return null;

    return reversed[player] as Role;
  }

  getGameState(player: string) {
    const role = this.findRole(player) as Role;
    if (role === Role.MrX) {
      return this.mrXView();
    }

    return this.detectivesView();
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

  getWinner() {
    return this.winner;
  }
}
