export enum Detective {
  Red = "Red",
  Blue = "Blue",
  Green = "Green",
  Yellow = "Yellow",
  Purple = "Purple",
}

type Role = "Mr.X" | Detective;
export type Roles = Record<string, Role>;

export class ScotlandYard {
  private readonly players;
  private readonly roles: Role[];
  private assignedRoles: Roles;

  constructor(players: string[]) {
    this.players = [...players];
    this.assignedRoles = {};
    this.roles = [
      "Mr.X",
      Detective.Red,
      Detective.Blue,
      Detective.Green,
      Detective.Yellow,
      Detective.Purple,
    ];
  }

  getPlayers() {
    return this.players;
  }

  private defaultAssignment() {
    for (const index in this.players) {
      const player = this.players[index];
      this.assignedRoles[player] ||= this.roles[index];
    }
  }

  assignRole(roles?: Roles) {
    this.assignedRoles = { ...roles };
    this.defaultAssignment();
  }

  getRoles() {
    return this.assignedRoles;
  }
}
