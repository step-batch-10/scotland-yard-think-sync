import { PlayerStats } from "./types.ts";

export class PlayerRegistry {
  private players;
  constructor() {
    this.players = new Map<string, PlayerStats>();
  }

  createPlayer(playerName: string) {
    this.players.set(playerName, {});
  }

  getPlayer(playerName: string) {
    return this.players.get(playerName);
  }

  isPlayerRegistered(playerName: string) {
    return this.players.has(playerName);
  }

  removePlayer(playerName: string) {
    return this.players.delete(playerName);
  }
}
