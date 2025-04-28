import { mapToObject, randomNumber } from "../game_utils.ts";
import { basicMap } from "../maps/half_map.ts";
import { ticketsOf } from "./tickets.ts";
import {
  GameMap,
  Log,
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

const turns = [3, 8, 13, 18, 24];

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
  private totalTurns: number;
  private revealingTurns: Set<number>;
  private lastSeen: number | null;
  private mrXHistory: Log[];
  private isUsing2X: boolean;
  private twoXTurnCount: number;

  constructor(
    players: string[],
    map: GameMap = basicMap,
    totalTurns: number = 25,
    revealingTurns = turns,
  ) {
    this.players = [...players];
    this.assignedRoles = new Map();
    this.tickets = new Map();
    this.currentStations = new Map();
    this.startingStations = map.startingPositions;
    this.gameMap = map;
    this.winner = null;
    this.totalTurns = totalTurns;
    this.revealingTurns = new Set(revealingTurns);
    this.lastSeen = null;
    this.mrXHistory = [];
    this.isUsing2X = false;
    this.twoXTurnCount = 0;

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

  changePlayer() {
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

  getValidTickets() {
    const tickets = this.tickets.get(this.currentRole)!;
    const pairs = Object.entries(tickets).filter(([_, count]) => count !== 0);

    return pairs.flatMap(([ticket]) =>
      ticket === "Wild" ? Transport.Ferry : ticket
    );
  }

  validRoutes = (station: number) => {
    const availableRoutes = this.gameMap.routes[station];
    if (!availableRoutes) return [];

    const validTickets = this.getValidTickets();
    const detectivesPos = this.getDetectivePositions();

    const possibleRoutes = availableRoutes.filter(({ mode }) => {
      return validTickets.includes(mode.toString());
    });

    return possibleRoutes.filter(({ to }) => !detectivesPos.includes(to));
  };

  private static addBlackTicket(station: Route): Route[] {
    return [station, { to: station.to, mode: Transport.Ferry }];
  }

  private hasTickets(ticket: Ticket): boolean {
    const tickets = this.tickets.get(this.currentRole)!;
    return tickets[ticket] > 0;
  }

  private hasTwoXCard(): boolean {
    return this.hasTickets(Ticket["2x"]);
  }

  hasBlackTickets(): boolean {
    return this.hasTickets(Ticket.Black);
  }

  possibleStations(): Route[] {
    const station = this.currentStations.get(this.currentRole)!;
    const routes = this.validRoutes(station);

    if (!this.isMrXTurn()) return routes;

    return routes.flatMap(ScotlandYard.addBlackTicket);
  }

  isMrXCaught() {
    const detectivesPos = this.getDetectivePositions();
    const MrXPosition = this.getCurrentPosition().get(Role.MrX)!;

    return detectivesPos.includes(MrXPosition);
  }

  private isTurnReachedLimit(): boolean {
    return (
      this.mrXHistory.length >= this.totalTurns &&
      (this.currentRole === this.roles.at(-1) || this.isUsing2X)
    );
  }

  private detectivesCannotMove() {
    const detectiveLocations = this.getDetectivePositions();
    const permissibleRoutes = detectiveLocations.map(this.validRoutes);

    return permissibleRoutes.every((validRoutes) => validRoutes.length === 0);
  }

  private hasDetectivesWon() {
    return this.isMrXCaught();
  }

  private hasMrXWon() {
    return this.detectivesCannotMove() || this.isTurnReachedLimit();
  }

  declareWinner() {
    if (this.hasDetectivesWon()) this.winner = "Detective";
    if (this.hasMrXWon()) this.winner = "MrX";

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

  private isTravelPossible(mode: Ticket, destination: number) {
    const possibleStations = this.possibleStations();
    return possibleStations.some(ScotlandYard.canTravel(mode, destination));
  }

  private reduceTickets(role: Role, mode: Ticket) {
    this.tickets.get(role)![mode] -= 1;
  }

  private fuelMrX(mode: Ticket) {
    const mrXTickets = this.tickets.get(Role.MrX);
    this.reduceTickets(this.currentRole, mode);

    if (this.currentRole === Role.MrX || !mrXTickets) return;

    mrXTickets[mode] += 1;
  }

  updateLog(to: number, mode: Ticket) {
    if (!this.isMrXTurn()) return;

    this.mrXHistory.push({ to, mode });
  }

  private updateState() {
    if (this.twoXTurnCount < 1 && this.isUsing2X) {
      this.twoXTurnCount += 1;
      return;
    }

    this.twoXTurnCount = 0;
    this.isUsing2X = false;

    this.changePlayer();
  }

  useTicket(mode: Ticket, destination: number): boolean {
    if (!this.isTravelPossible(mode, destination)) return false;

    this.updateLog(destination, mode);
    this.movePlayer(destination);
    this.fuelMrX(mode);

    this.updateState();

    this.declareWinner();
    this.updateLastSeen();

    return true;
  }

  private view(positions: Positions) {
    const transport = this.mrXHistory.map((log) => log.mode);

    return {
      tickets: mapToObject<Tickets>(this.tickets),
      roles: mapToObject<string>(this.assignedRoles),
      positions: positions,
      currentRole: this.currentRole,
      isGameOver: this.isGameOver(),
      winner: this.getWinner(),
      lastSeen: this.lastSeen,
      transport,
    };
  }

  private detectivesView() {
    const positions = mapToObject(this.currentStations) as Positions;

    if (positions[Role.MrX]) {
      positions[Role.MrX] = null;
    }

    return this.view(positions);
  }

  private mrXView() {
    const positions = mapToObject(this.currentStations);
    return this.view(positions);
  }

  private shouldReveal() {
    return this.revealingTurns.has(this.mrXHistory.length);
  }

  private updateLastSeen() {
    if (!this.shouldReveal()) return;
    this.lastSeen = this.currentStations.get(Role.MrX) as number;
  }

  enable2X(): boolean {
    if (this.isUsing2X || !this.hasTwoXCard()) return false;

    this.reduceTickets(Role.MrX, Ticket["2x"]);
    return (this.isUsing2X = true);
  }

  getGameState(player: string) {
    const isMrx = this.assignedRoles.get(Role.MrX) === player;

    if (isMrx || this.shouldReveal()) {
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

  getCurrentRole() {
    return this.currentRole;
  }
}
