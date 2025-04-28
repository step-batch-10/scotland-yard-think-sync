import { ScotlandYard } from "./scotland.ts";
import { GameMap, RandomIndex } from "./types.ts";

interface MatchStatus {
  game: ScotlandYard;
  winner: null | string;
  isGameFinished: boolean;
}

export class GameController {
  private matches: Map<string, MatchStatus>;
  constructor() {
    this.matches = new Map();
  }

  private defaultMatchFormat(
    players: string[],
    map?: GameMap,
    random?: RandomIndex,
  ) {
    const game = new ScotlandYard(players, map, 5);
    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions(random);

    return {
      game,
      winner: null,
      isGameFinished: false,
    };
  }

  setMatch(
    roomId: string,
    players: Set<string>,
    map?: GameMap,
    random?: RandomIndex,
  ) {
    this.matches.set(
      roomId,
      this.defaultMatchFormat([...players], map, random),
    );
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
