import { describe, it } from "testing";
import { assertEquals } from "assert";
import { ScotlandYard } from "../src/models/scotland.ts";
import { mapToObject } from "../src/game_play.ts";
import {
  GameMap,
  RandomIndex,
  Role,
  Roles,
  Route,
  Tickets,
  Transport,
} from "../src/models/types.ts";

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

    const assignedRoles = sy.getRoles();

    assertEquals(sy.getPlayers(), [...players]);
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
      MrX: { Bus: 3, Taxi: 4, Metro: 3, Wild: 5, "2x": 2 },
      Red: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Blue: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Green: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Yellow: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Purple: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
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
    game.assignStartingPositions(random);

    const actual = game.getCurrentPosition();

    const expected = {
      MrX: 181,
      Red: 182,
      Blue: 183,
      Green: 184,
      Yellow: 185,
      Purple: 186,
    };

    assertEquals(mapToObject(actual), expected);
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
    game.assignStartingPositions(random);

    const actual = game.getCurrentPosition();

    const expected = {
      Blue: 193,
      Green: 181,
      Purple: 185,
      Red: 192,
      Yellow: 183,
      MrX: 191,
    };

    assertEquals(mapToObject(actual), expected);
  });
});

describe("game state", () => {
  it("should provide tickets in the game state", () => {
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
    sy.distributeTickets();

    const expected = {
      MrX: { Bus: 3, Taxi: 4, Metro: 3, Wild: 5, "2x": 2 },
      Red: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Blue: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Green: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Yellow: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Purple: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
    };

    const { tickets } = sy.getGameState();

    assertEquals(tickets, expected);
  });

  it("should provide starting positions in game state", () => {
    const players = new Set(["a", "b", "c", "d", "e", "f"]);
    const sy = new ScotlandYard([...players]);
    sy.assignRole();
    sy.distributeTickets();
    sy.assignStartingPositions();
    const expected = {
      MrX: 182,
      Red: 183,
      Blue: 184,
      Yellow: 186,
      Purple: 187,
      Green: 185,
    };
    const { positions } = sy.getGameState();

    assertEquals(positions, expected);
  });

  it("should provide empty starting positions if starting position is not assigned", () => {
    const players = new Set(["a", "b", "c", "d", "e", "f"]);
    const sy = new ScotlandYard([...players]);
    sy.assignRole();
    sy.distributeTickets();

    const { positions } = sy.getGameState();

    assertEquals(positions, {});
  });

  it("should have current role", () => {
    const players = new Set(["a", "b", "c", "d", "e", "f"]);
    const sy = new ScotlandYard([...players]);
    sy.assignRole();
    sy.distributeTickets();

    const { currentRole } = sy.getGameState();

    assertEquals(currentRole, "MrX");
  });
});

describe("change turn", () => {
  it("should be next player", () => {
    const players = new Set(["a", "b", "c", "d", "e", "f"]);
    const sy = new ScotlandYard([...players]);
    sy.assignRole();
    sy.distributeTickets();
    sy.assignStartingPositions();
    const nextPlayer = sy.changeTurn();

    assertEquals(nextPlayer, "Red");
  });

  it("should rotate the turn to the next player in circular order", () => {
    const players = new Set(["a", "b", "c", "d", "e", "f"]);
    const sy = new ScotlandYard([...players]);
    sy.assignRole();
    sy.distributeTickets();
    sy.assignStartingPositions();
    sy.changeTurn();
    sy.changeTurn();
    sy.changeTurn();
    sy.changeTurn();
    sy.changeTurn();
    const nextPlayer = sy.changeTurn();

    assertEquals(nextPlayer, "MrX");
  });
});

describe("possible stations", () => {
  it("should return possible stations if possible", () => {
    const game = new ScotlandYard([
      "test1",
      "test2",
      "test3",
      "test4",
      "test5",
      "test6",
    ]);
    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions();
    const actual = game.possibleStations();
    const expected = [
      { to: 181, mode: Transport.Taxi },
      { to: 192, mode: Transport.Taxi },
    ];

    assertEquals(actual, expected);
  });

  it("should return no station if not possible", () => {
    const game = new ScotlandYard([
      "test1",
      "test2",
      "test3",
      "test4",
      "test5",
      "test6",
    ]);
    const actual = game.possibleStations();
    const expected: Route[] = [];

    assertEquals(actual, expected);
  });
});

describe("positionOfDetectives", () => {
  it("should provide positions of all detectives", () => {
    const game = new ScotlandYard([
      "test1",
      "test2",
      "test3",
      "test4",
      "test5",
      "test6",
    ]);

    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions();

    assertEquals(game.getDetectivePositions(), [183, 184, 185, 186, 187]);
  });

  it("should not provide positions of all detectives when station is not assigned", () => {
    const game = new ScotlandYard([
      "test1",
      "test2",
      "test3",
      "test4",
      "test5",
      "test6",
    ]);

    assertEquals(game.getDetectivePositions(), []);
  });
});

describe("getValidRoutes", () => {
  it("it should return valid routes", () => {
    const players = ["test1", "test2", "test3", "test4", "test5", "test6"];
    const route = [{ to: 1, mode: Transport.Bus }];
    const fakeMap: GameMap = {
      startingPositions: [1, 2],
      routes: {
        1: [{ to: 1, mode: Transport.Bus }],
      },
    };
    const game = new ScotlandYard(players, fakeMap);
    game.assignRole();
    game.distributeTickets();

    assertEquals(game.validRoutes(1), route);
  });

  it("it should return empty array if there is no valid route", () => {
    const players = ["test1", "test2", "test3", "test4", "test5", "test6"];

    const fakeMap: GameMap = {
      startingPositions: [1, 2],
      routes: {
        1: [{ to: 1, mode: Transport.Bus }],
      },
    };

    const game = new ScotlandYard(players, fakeMap);
    game.assignRole();
    game.distributeTickets();

    assertEquals(game.validRoutes(10), []);
  });
});
