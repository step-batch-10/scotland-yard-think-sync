import { ScotlandYard } from "./scotland.ts";
import { GameMap, MatchStatus, RandomIndex } from "./types.ts";

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

  setSpecificMatch(roomId: string, game: ScotlandYard) {
    this.matches.set(roomId, {
      game,
      winner: null,
      isGameFinished: false,
    });
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
