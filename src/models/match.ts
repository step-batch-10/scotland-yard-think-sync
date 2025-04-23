import { ScotlandYard } from "./scotland.ts";
import { GameMap } from "./types.ts";

interface MatchStatus {
  game: ScotlandYard;
  winner: null | string;
  isGameFinished: boolean;
}
export class Match {
  private matches: Map<string, MatchStatus>;
  constructor() {
    this.matches = new Map();
  }

  private defaultMatchFormat(players: string[], map?: GameMap) {
    const game = new ScotlandYard(players, map, 1);
    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions();

    return {
      game,
      winner: null,
      isGameFinished: false,
    };
  }

  setMatch(roomId: string, players: Set<string>, map?: GameMap) {
    this.matches.set(roomId, this.defaultMatchFormat([...players], map));
  }

  getMatch(roomId: string) {
    return this.matches.get(roomId) || null;
  }

  removeMatch(roomId: string) {
    return this.matches.delete(roomId);
  }

  hasMatch(roomId: string) {
    return this.matches.has(roomId);
  }
}
