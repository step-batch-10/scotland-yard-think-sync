import { ScotlandYard } from "./scotland.ts";

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

  private defaltMatchFormat(players: string[]) {
    return {
      game: new ScotlandYard(players),
      winner: null,
      isGameFinished: false,
    };
  }

  setMatch(roomId: string, players: Set<string>) {
    this.matches.set(roomId, this.defaltMatchFormat([...players]));
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
