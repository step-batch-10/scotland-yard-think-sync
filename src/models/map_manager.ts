import { GameMap, Positions, Role, Route, Transport } from "./types.ts";
const randomInRange = (start: number, end: number) =>
  start + (Math.random() - 0.5) * end;
const turns = [3, 8, 13, 18, 24];

export class MapManager {
  private gameMap: GameMap;
  private currentStations: Map<Role, number>;
  private roles: Role[];
  private startingStations: number[];
  private revealingTurns: Set<number>;
  private lastSeen: number | null;

  constructor(gameMap: GameMap, roles: Role[], revealingTurns = turns) {
    this.gameMap = gameMap;
    this.roles = roles;
    this.currentStations = new Map();
    this.startingStations = gameMap.startingPositions;
    this.revealingTurns = new Set(revealingTurns);
    this.lastSeen = null;
  }

  assignStartingPositions(random = randomInRange): void {
    const positions = [...this.startingStations];
    for (const role of this.roles.values()) {
      const randomIndex = Math.floor(random(0, positions.length)) %
        positions.length;
      const [start] = positions.splice(randomIndex, 1);
      this.currentStations.set(role, start);
    }
  }

  getDetectivePositions(): number[] {
    const playerIterator = this.currentStations.entries();
    const detectiveEntries = [...playerIterator].filter(
      ([role]) => role !== "MrX",
    );

    return detectiveEntries.map(([, position]) => position);
  }

  validRoutes(
    station: number,
    validTickets: string[],
    detectivesPos: number[],
  ): Route[] {
    const availableRoutes = this.gameMap.routes[station] || [];
    return availableRoutes.filter(({ mode, to }) => {
      return (
        (validTickets.includes(mode.toString()) || mode === Transport.Ferry) &&
        !detectivesPos.includes(to)
      );
    });
  }

  shouldReveal(currentTurn: number) {
    return this.revealingTurns.has(currentTurn);
  }

  updateLastSeen(currentTurn: number) {
    if (!this.shouldReveal(currentTurn)) return;
    this.lastSeen = this.currentStations.get(Role.MrX) as number;
  }

  movePlayer(role: Role, destination: number): void {
    this.currentStations.set(role, destination);
  }

  getCurrentStations(): Map<Role, number> {
    return this.currentStations;
  }

  getLastSeenOfMrX() {
    return this.lastSeen;
  }

  setPositions(positions: Positions): void {
    this.currentStations.clear();
    for (const [role, position] of Object.entries(positions)) {
      if (position !== null) {
        this.currentStations.set(role as Role, position);
      }
    }
  }
}
