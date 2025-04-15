export class ScotlandYard {
  private readonly players;
  constructor(players: string[]) {
    this.players = players;
  }

  getPlayers() {
    return this.players;
  }
}
