import { describe, it } from "testing";
import { assertEquals } from "assert";
import {
  RandomIndex,
  Role,
  Roles,
  ScotlandYard,
  Tickets,
} from "../src/models/scotland.ts";
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
      "Detective:Red": "b",
      MrX: "a",
      "Detective:Blue": "c",
      "Detective:Yellow": "d",
      "Detective:Purple": "e",
      "Detective:Green": "f",
    };

    sy.assignRole(roles);
    assertEquals(sy.getPlayers(), [...players]);

    const assignedRoles = sy.getRoles();
    assertEquals(mapToObject(assignedRoles), roles);
  });

  it("should assign multiple role to a player", () => {
    const players = new Set(["a", "b", "c", "d", "e", "f"]);
    const sy = new ScotlandYard([...players]);
    const roles: Roles = { MrX: "b", "Detective:Blue": "a" };

    sy.assignRole(roles);
    const assignedRoles = sy.getRoles();

    const expected = {
      MrX: "b",
      "Detective:Blue": "a",
      "Detective:Red": "b",
      "Detective:Green": "d",
      "Detective:Yellow": "e",
      "Detective:Purple": "f",
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
      MrX: { Bus: 3, Taxi: 4, Metro: 3, All: 5, "2x": 2 },
      "Detective:Red": { Bus: 8, Taxi: 10, Metro: 4, All: 0, "2x": 0 },
      "Detective:Blue": { Bus: 8, Taxi: 10, Metro: 4, All: 0, "2x": 0 },
      "Detective:Green": { Bus: 8, Taxi: 10, Metro: 4, All: 0, "2x": 0 },
      "Detective:Yellow": { Bus: 8, Taxi: 10, Metro: 4, All: 0, "2x": 0 },
      "Detective:Purple": { Bus: 8, Taxi: 10, Metro: 4, All: 0, "2x": 0 },
    };

    const assignedTickets = sy.getTickets();
    assertEquals(mapToObject<Tickets>(assignedTickets), expected);
  });
});

describe("assignStartingPositions", () => {
  it("should assign position based on random function", () => {
    const random: RandomIndex = () => 0;

    const players = new Set([
      "test1",
      "test2",
      "test3",
      "test4",
      "test5",
      "test6",
    ]);

    const game = new ScotlandYard([...players]);
    game.assignRole();

    const actual = game.assignStartingPositions(random);
    const expected = {
      MrX: 181,
      "Detective:Red": 182,
      "Detective:Blue": 183,
      "Detective:Green": 184,
      "Detective:Yellow": 185,
      "Detective:Purple": 186,
    };

    assertEquals(actual, expected);
  });

  it("should handle if random number is above role number", () => {
    const random: RandomIndex = () => 10;

    const players = new Set([
      "test1",
      "test2",
      "test3",
      "test4",
      "test5",
      "test6",
    ]);

    const game = new ScotlandYard([...players]);
    game.assignRole();

    const actual = game.assignStartingPositions(random);
    const expected = {
      "Detective:Blue": 193,
      "Detective:Green": 181,
      "Detective:Purple": 185,
      "Detective:Red": 192,
      "Detective:Yellow": 183,
      MrX: 191,
    };

    assertEquals(actual, expected);
  });
});

describe("game state", () => {
  it("should provide tickets", () => {
    const players = new Set(["a", "b", "c", "d", "e", "f"]);
    const sy = new ScotlandYard([...players]);
    const roles = {
      "Detective:Red": "b",
      MrX: "a",
      "Detective:Blue": "c",
      "Detective:Yellow": "d",
      "Detective:Purple": "e",
      "Detective:Green": "f",
    };
    sy.assignRole(roles);
    sy.distributeTickets();
    const expected = {
      MrX: { Bus: 3, Taxi: 4, Metro: 3, All: 5, "2x": 2 },
      "Detective:Red": { Bus: 8, Taxi: 10, Metro: 4, All: 0, "2x": 0 },
      "Detective:Blue": { Bus: 8, Taxi: 10, Metro: 4, All: 0, "2x": 0 },
      "Detective:Green": { Bus: 8, Taxi: 10, Metro: 4, All: 0, "2x": 0 },
      "Detective:Yellow": { Bus: 8, Taxi: 10, Metro: 4, All: 0, "2x": 0 },
      "Detective:Purple": { Bus: 8, Taxi: 10, Metro: 4, All: 0, "2x": 0 },
    };

    const { tickets, roles: assignedRoles } = sy.getGameState();
    assertEquals(mapToObject<Tickets>(tickets), expected);
    assertEquals(mapToObject(assignedRoles), roles);
  });
});
