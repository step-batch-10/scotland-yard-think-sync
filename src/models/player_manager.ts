import { assignAccordingly } from "../game_utils.ts";
import { Role, Roles } from "./types.ts";

export class PlayerManager {
  private players: string[];
  private roles: Role[];
  private assignedRoles: Map<string, string>;

  constructor(players: string[], roles: Role[]) {
    this.players = players;
    this.roles = roles;
    this.assignedRoles = new Map();
    this.defaultAssignment();
  }

  private defaultAssignment(): void {
    this.assignedRoles.set(Role.MrX, this.players[0]);

    const detectives = this.roles.slice(1);
    const detectivesPlayers = this.players.slice(1);
    const assignedRoles = assignAccordingly(detectives, detectivesPlayers);

    assignedRoles.forEach(([role, player]) => {
      this.assignedRoles.set(role, player);
    });
  }

  assignRole(roles?: Roles): void {
    if (roles) this.assignedRoles = new Map(Object.entries(roles));
    this.defaultAssignment();
  }

  findRole(player: string): Role | null {
    const playerRole = [...this.assignedRoles.entries()].find(
      ([_, name]) => name === player,
    )!;
    return (playerRole?.[0] as Role) || null;
  }

  getAssignedRoles(): Map<string, string> {
    return this.assignedRoles;
  }

  getPlayers(): string[] {
    return this.players;
  }
}
