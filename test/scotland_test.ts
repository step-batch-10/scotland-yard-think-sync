import { describe, it } from "testing";
import { assertEquals } from "assert";
import { Role, Roles, ScotlandYard } from "../src/models/scotland.ts";
import { mapToObject } from "../src/game.ts";

describe("test playerNames", () => {
  it("should provide playerNames", () => {
    const players = new Set(["a", "b", "c", "d", "e", "d"]);
    const sy = new ScotlandYard([...players]);
    assertEquals(sy.getPlayers(), [...players]);
  });
});

describe("test assignRole", () => {
  it("should assign role", () => {
    const players = new Set(["a", "b", "c", "d", "e", "f"]);
    const sy = new ScotlandYard([...players]);
    const roles = {
      Red: "b",
      MrX: "a",
      Blue: "c",
      Yellow: "d",
      Purple: "e",
      Green: "f",
    };

    sy.assignRole(roles);
    assertEquals(sy.getPlayers(), [...players]);

    const assignedRoles = sy.getRoles();
    assertEquals(mapToObject(assignedRoles), roles);
  });

  it("should assign multiple role to a player", () => {
    const players = new Set(["a", "b", "c", "d", "e", "f"]);
    const sy = new ScotlandYard([...players]);
    const roles: Roles = { MrX: "b", Blue: "a" };

    sy.assignRole(roles);
    const assignedRoles = sy.getRoles();

    const expected = {
      MrX: "b",
      Blue: "a",
      Red: "b",
      Green: "d",
      Yellow: "e",
      Purple: "f",
    };

    assertEquals(mapToObject(assignedRoles), expected);
  });
});

describe("ticket distribution", () => {
  it("should provide detective with proper tickets", () => {
    const players = new Set(["a", "b", "c", "d", "e", "f"]);
    const sy = new ScotlandYard([...players]);
    const roles: Roles = { [Role.Red]: "a" };
    sy.assignRole(roles);
    sy.distributeTickets();
    const expected = {
      Red: "a",
      MrX: "a",
      Blue: "c",
      Green: "d",
      Yellow: "e",
      Purple: "f",
    };

    const assignedRoles = sy.getRoles();
    assertEquals(mapToObject(assignedRoles), expected);
  });
});
