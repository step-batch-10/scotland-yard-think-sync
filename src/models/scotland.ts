import { mapToObject } from "../game_utils.ts";
import { PlayerManager } from "./player_manager.ts";
import { TicketManager } from "./ticket_manager.ts";
import { MapManager } from "./map_manager.ts";
import { StateManager } from "./state_manager.ts";
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
} from "./types.ts";
import { basicMap } from "../maps/half_map.ts";

export class ScotlandYard {
  private playerManager: PlayerManager;
  private ticketManager: TicketManager;
  private mapManager: MapManager;
  private stateManager: StateManager;
  private roles: Role[];
  private mrXHistory: Log[];
  private isUsing2X: boolean;
  private twoXTurnCount: number;

  constructor(
    players: string[],
    map: GameMap = basicMap,
    totalTurns: number = 25,
    revealingTurns?: number[],
  ) {
    this.roles = [
      Role.MrX,
      Role.Red,
      Role.Blue,
      Role.Green,
      Role.Yellow,
      Role.Purple,
    ];
    this.playerManager = new PlayerManager(players, this.roles);
    this.ticketManager = new TicketManager(this.roles);
    this.mapManager = new MapManager(map, this.roles, revealingTurns);
    this.stateManager = new StateManager(this.roles, totalTurns);
    this.mrXHistory = [];
    this.isUsing2X = false;
    this.twoXTurnCount = 0;
  }

  assignRole(roles?: Roles): void {
    this.playerManager.assignRole(roles);
  }

  distributeTickets(): void {
    this.ticketManager.distributeTickets();
  }

  assignStartingPositions(random?: RandomIndex) {
    this.mapManager.assignStartingPositions(random);
  }

  changePlayer() {
    return this.stateManager.changePlayer();
  }

  getDetectivePositions() {
    return this.mapManager.getDetectivePositions();
  }

  getValidTickets() {
    return this.ticketManager.getValidTickets(
      this.stateManager.getCurrentRole(),
    );
  }

  validRoutes(station: number) {
    const validTickets = this.getValidTickets();
    const detectivesPos = this.getDetectivePositions();
    return this.mapManager.validRoutes(station, validTickets, detectivesPos);
  }

  hasTwoXCard(): boolean {
    return this.ticketManager.hasTickets(
      this.stateManager.getCurrentRole(),
      Ticket["2x"],
    );
  }

  hasBlackTickets(): boolean {
    return this.ticketManager.hasTickets(
      this.stateManager.getCurrentRole(),
      Ticket.Black,
    );
  }

  isMrXTurn(): boolean {
    return this.stateManager.getCurrentRole()! === Role.MrX;
  }

  possibleStations(): Route[] {
    const currentRole = this.stateManager.getCurrentRole();
    const station = this.mapManager.getCurrentStations().get(currentRole)!;
    const routes = this.validRoutes(station);

    if (!this.isMrXTurn()) return routes;

    return routes.flatMap(TicketManager.addBlackTicket);
  }

  getCurrentPosition() {
    return this.mapManager.getCurrentStations();
  }

  isMrXCaught(): boolean {
    const detectivesPos = this.getDetectivePositions();
    const MrXPosition = this.getCurrentPosition().get(Role.MrX)!;

    return detectivesPos.includes(MrXPosition);
  }

  private detectivesCannotMove() {
    const detectivesPositions = this.getDetectivePositions();
    const allValidRoutes = detectivesPositions.map((position) => {
      return this.validRoutes(position);
    });

    return allValidRoutes.every((validRoutes) => validRoutes.length === 0);
  }

  private mrXCannotMove() {
    if (!this.isMrXTurn()) return false;
    return this.possibleStations().length === 0;
  }

  declareWinner() {
    return this.stateManager.declareWinner(
      this.isMrXCaught(),
      this.stateManager.isTurnLimitReached(),
      this.detectivesCannotMove(),
      this.mrXCannotMove(),
    );
  }

  isGameOver() {
    return this.stateManager.isGameOver();
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

  private isTravelPossible(mode: Ticket, destination: number) {
    const possibleStations = this.possibleStations();
    return possibleStations.some(TicketManager.canTravel(mode, destination));
  }

  getCurrentTurn() {
    return this.stateManager.getCurrentTurn();
  }

  useTicket(mode: Ticket, destination: number): boolean {
    if (!this.isTravelPossible(mode, destination)) return false;

    this.updateLog(destination, mode);
    const currentRole = this.stateManager.getCurrentRole();
    this.mapManager.movePlayer(currentRole, destination);
    this.ticketManager.fuelMrX(currentRole, mode);

    this.stateManager.updateTurn(currentRole);
    this.updateState();

    this.declareWinner();
    this.mapManager.updateLastSeen(this.getCurrentTurn());

    return true;
  }

  private view() {
    const transport = this.mrXHistory.map((log) => log.mode);

    return {
      tickets: mapToObject<Tickets>(this.getTickets()),
      roles: mapToObject<string>(this.getRoles()),
      positions: mapToObject<number>(this.getCurrentPosition()) as Positions,
      currentRole: this.getCurrentRole(),
      isGameOver: this.isGameOver(),
      winner: this.getWinner(),
      lastSeen: this.mapManager.getLastSeenOfMrX(),
      transport,
    };
  }

  private detectivesView() {
    const newView = this.view();
    if (newView.positions.MrX) newView.positions.MrX = null;

    return newView;
  }

  private mrXView() {
    return this.view();
  }

  enable2X(): boolean {
    if (this.isUsing2X || !this.hasTwoXCard()) return false;

    this.ticketManager.reduceTickets(Role.MrX, Ticket["2x"]);
    return (this.isUsing2X = true);
  }

  getGameState(player: string) {
    const role = this.playerManager.findRole(player) as Role;

    if (
      role === Role.MrX ||
      this.mapManager.shouldReveal(this.stateManager.getCurrentTurn())
    ) {
      return this.mrXView();
    }

    return this.detectivesView();
  }

  getPlayers(): string[] {
    return this.playerManager.getPlayers();
  }

  getRoles(): Map<string, string> {
    return this.playerManager.getAssignedRoles();
  }

  getTickets() {
    return this.ticketManager.getTickets();
  }

  getWinner() {
    return this.stateManager.getWinner();
  }

  getCurrentRole() {
    return this.stateManager.getCurrentRole();
  }
}
