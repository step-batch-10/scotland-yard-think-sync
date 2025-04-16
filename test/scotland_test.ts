import { describe, it } from "testing";
import { assertEquals } from "assert";
import { Detective, Roles, ScotlandYard } from "../src/models/scotland.ts";

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
    const roles: Roles = {
      a: "Mr.X",
      b: Detective.Red,
      c: Detective.Blue,
      d: Detective.Yellow,
      e: Detective.Purple,
      f: Detective.Green,
    };
    sy.assignRole(roles);
    assertEquals(sy.getPlayers(), [...players]);
    assertEquals(sy.getRoles(), roles);
  });
});
