import { PlayerStats } from "./types.ts";

export class PlayerRegistry {
  private players;
  constructor() {
    this.players = new Map<string, PlayerStats>();
  }

  createPlayer(playerId: string) {
    this.players.set(playerId, {});
  }

  getPlayerStats(playerId: string): PlayerStats {
    return this.players.get(playerId) || {};
  }

  isPlayerRegistered(playerId: string) {
    return this.players.has(playerId);
  }

  removePlayer(playerId: string) {
    return this.players.delete(playerId);
  }

  assignRoom(roomId: string, playerId: string) {
    const player = this.getPlayerStats(playerId);
    player.roomId = roomId;
    player.isPlaying = false;
  }

  joinMatch(playerIds: string[]) {
    playerIds.forEach((playerId) => {
      this.getPlayerStats(playerId).isPlaying = true;
    });
  }

  resetPlayer(playerId: string) {
    if (!this.isPlayerRegistered(playerId)) return false;

    this.players.set(playerId, {});
    return true;
  }
}
