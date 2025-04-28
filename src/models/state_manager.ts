import { Role, Winner } from "./types.ts";

export class StateManager {
  private currentRole: Role;
  private roles: Role[];
  private turn: number;
  private totalTurns: number;
  private winner: Winner;

  constructor(roles: Role[], totalTurns: number = 24) {
    this.roles = roles;
    this.currentRole = roles[0];
    this.turn = 0;
    this.totalTurns = totalTurns;
    this.winner = null;
  }

  changePlayer(): Role {
    const nextPlayerIndex = (this.roles.indexOf(this.currentRole) + 1) %
      this.roles.length;
    this.currentRole = this.roles[nextPlayerIndex];
    return this.currentRole;
  }

  declareWinner(
    isMrXCaught: boolean,
    isTurnLimitReached: boolean,
    detectivesCannotMove: boolean,
    mrXCannotMove: boolean,
  ): Winner {
    if (isMrXCaught || mrXCannotMove) this.winner = "Detective";
    if (isTurnLimitReached || detectivesCannotMove) this.winner = "MrX";
    return this.winner;
  }

  isTurnLimitReached(): boolean {
    return (
      (this.turn === this.totalTurns &&
        this.currentRole === this.roles.at(-1)) ||
      this.turn > this.totalTurns
    );
  }

  isGameOver(): boolean {
    return Boolean(this.winner);
  }

  updateTurn(role: Role): void {
    if (role === Role.MrX) this.turn += 1;
  }

  getCurrentRole(): Role {
    return this.currentRole;
  }

  getWinner(): Winner {
    return this.winner;
  }

  getCurrentTurn() {
    return this.turn;
  }
}
