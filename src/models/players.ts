import { PlayerStats } from "./types.ts";

export class PlayerRegistry {
  private players;
  constructor() {
    this.players = new Map<string, PlayerStats>();
  }

  createPlayer(playerName: string) {
    this.players.set(playerName, {});
  }

  getPlayerStats(playerName: string): PlayerStats {
    return this.players.get(playerName) || {};
  }

  isPlayerRegistered(playerName: string) {
    return this.players.has(playerName);
  }

  removePlayer(playerName: string) {
    return this.players.delete(playerName);
  }

  assignRoom(playerName: string, roomID: string) {
    const player = this.getPlayerStats(playerName);
    player.matchID = roomID;
    player.status = "waiting";
  }

  resetPlayer(playerName: string) {
    if (!this.isPlayerRegistered(playerName)) return false;

    this.players.set(playerName, {});
    return true;
  }
}
