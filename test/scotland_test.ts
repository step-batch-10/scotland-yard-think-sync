import { describe, it } from "testing";
import { assertEquals } from "assert";
import { Role, Roles, ScotlandYard } from "../src/models/scotland.ts";

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
    assertEquals(Object.fromEntries([...assignedRoles.entries()]), roles);
  });

  it("should assign role partially", () => {
    const players = new Set(["a", "b", "c", "d", "e", "f"]);
    const sy = new ScotlandYard([...players]);
    const roles: Roles = { MrX: "b", Blue: "a" };
    sy.assignRole(roles);
    assertEquals(sy.getPlayers(), [...players]);
    assertEquals(sy.getRoles().get("MrX"), "b");
    assertEquals(sy.getRoles().get("Blue"), "a");
  });
});

describe("test ticket distribution", () => {
  it("should provide detective with proper tickets", () => {
    const players = new Set(["a", "b", "c", "d", "e", "f"]);
    const sy = new ScotlandYard([...players]);
    const roles: Roles = { [Role.Red]: "a" };
    sy.assignRole(roles);
    sy.distributeTickets();
  });
});
