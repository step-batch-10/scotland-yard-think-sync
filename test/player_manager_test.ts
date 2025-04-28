import { describe, it } from "jsr:@std/testing/bdd";
import { assertEquals } from "jsr:@std/assert";
import { PlayerManager } from "../src/models/player_manager.ts";
import { Role } from "../src/models/types.ts";
import { mapToObject } from "../src/game_utils.ts";

export const getPlayersAndRoles = () => {
  const roles = [
    Role.MrX,
    Role.Red,
    Role.Blue,
    Role.Green,
    Role.Yellow,
    Role.Purple,
  ];
  const players = ["a", "b", "c", "d", "e", "f"];

  return { roles, players };
};

describe("get player", () => {
  it("should provide all the players name", () => {
    const expected = {
      Red: "b",
      MrX: "a",
      Blue: "c",
      Green: "d",
      Yellow: "e",
      Purple: "f",
    };
    const { roles, players } = getPlayersAndRoles();
    const manager = new PlayerManager(players, roles);
    const assignedRoles = manager.getAssignedRoles();

    manager.assignRole();
    assertEquals(manager.getPlayers(), [...players]);
    assertEquals(mapToObject(assignedRoles), expected);
  });
});

describe("Assign Roles", () => {
  it("Should assign roles for all the player", () => {
    const expected = {
      Red: "b",
      MrX: "a",
      Blue: "c",
      Green: "d",
      Yellow: "e",
      Purple: "f",
    };
    const { roles, players } = getPlayersAndRoles();
    const manager = new PlayerManager(players, roles);
    const assignedRoles = manager.getAssignedRoles();

    manager.assignRole();
    assertEquals(manager.getPlayers(), [...players]);
    assertEquals(mapToObject(assignedRoles), expected);
  });
});
