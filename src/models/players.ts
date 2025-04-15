interface PlayerStats {
  matchID?: string;
  status?: "waiting" | "playing";
}

export class Players {
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
}
