import { describe, it } from "testing";
import { assert, assertEquals, assertFalse } from "assert";
import { ScotlandYard } from "../src/models/scotland.ts";
import { mapToObject } from "../src/game_play.ts";
import { basicMap } from "../src/maps/game_map.ts";
import {
  GameMap,
  RandomIndex,
  Role,
  Roles,
  Ticket,
  Tickets,
  Transport,
} from "../src/models/types.ts";

const setUpDefaultGame = (): [ScotlandYard, Set<string>] => {
  const players = new Set(["a", "b", "c", "d", "e", "f"]);
  return [new ScotlandYard([...players]), players];
};

describe("test playerNames", () => {
  it("should provide playerNames", () => {
    const [sy, players] = setUpDefaultGame();

    assertEquals(sy.getPlayers(), [...players]);
  });
});

describe("test assignRole", () => {
  it("should assign role", () => {
    const [sy, players] = setUpDefaultGame();
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
    const [sy] = setUpDefaultGame();
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
    const [sy] = setUpDefaultGame();
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

    const game = new ScotlandYard([...players], basicMap);

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

    const game = new ScotlandYard([...players], basicMap);

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
  it("should provide tickets in the game state for detective", () => {
    const [sy] = setUpDefaultGame();
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
      MrX: { "2x": 2, Bus: 3, Metro: 3, Taxi: 4, Wild: 5 },
      Red: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Blue: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Green: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Yellow: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Purple: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
    };

    const { tickets } = sy.getGameState(Role.Blue);

    assertEquals(tickets, expected);
  });

  it("should provide starting positions in game state for detective", () => {
    const fakeMap: GameMap = {
      startingPositions: [1, 2, 3, 4, 5, 6],
      routes: {
        1: [{ to: 1, mode: Transport.Bus }],
      },
    };

    const game = new ScotlandYard(
      ["test1", "test2", "test3", "test4", "test5", "test6"],
      fakeMap,
    );

    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions();

    const expected = {
      Red: 3,
      Blue: 4,
      Green: 5,
      Yellow: 6,
      Purple: 1,
    };
    const { positions } = game.getGameState(Role.Purple);

    assertEquals(positions, expected);
  });

  it("should provide empty starting positions if starting position is not assigned", () => {
    const [sy] = setUpDefaultGame();
    sy.assignRole();
    sy.distributeTickets();

    const { positions } = sy.getGameState(Role.Red);

    assertEquals(positions, {});
  });

  it("should contain current role in game state", () => {
    const [sy] = setUpDefaultGame();
    sy.assignRole();
    sy.distributeTickets();

    const { currentRole } = sy.getGameState(Role.Blue);

    assertEquals(currentRole, "MrX");
  });

  it("should provide only detectives positions", () => {
    const [sy] = setUpDefaultGame();
    sy.assignRole();
    sy.distributeTickets();
    sy.assignStartingPositions();

    const { positions } = sy.getGameState("b");
    const expected = {
      Blue: 133,
      Green: 128,
      Purple: 198,
      Red: 187,
      Yellow: 185,
    };

    assertEquals(positions, expected);
  });

  it("should provide all players position for Mr.X", () => {
    const [sy] = setUpDefaultGame();
    sy.assignRole();
    sy.distributeTickets();
    sy.assignStartingPositions();

    const { positions } = sy.getGameState("a");
    const expected = {
      MrX: 173,
      Blue: 133,
      Green: 128,
      Purple: 198,
      Red: 187,
      Yellow: 185,
    };

    assertEquals(positions, expected);
  });
});

describe("change turn", () => {
  it("should be next player", () => {
    const [sy] = setUpDefaultGame();
    sy.assignRole();
    sy.distributeTickets();
    sy.assignStartingPositions();
    const nextPlayer = sy.changeTurn();

    assertEquals(nextPlayer, "Red");
  });

  it("should rotate the turn to the next player in circular order", () => {
    const [sy] = setUpDefaultGame();
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
    const fakeMap: GameMap = {
      startingPositions: [1, 2, 3, 4, 5, 6, 7],
      routes: {
        2: [{ to: 1, mode: Transport.Bus }],
      },
    };

    const game = new ScotlandYard(
      ["test1", "test2", "test3", "test4", "test5", "test6"],
      fakeMap,
    );

    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions();

    const actual = game.possibleStations();

    const expected = [{ to: 1, mode: Transport.Bus }];

    assertEquals(actual, expected);
  });

  it("should return no station if not possible", () => {
    const fakeMap: GameMap = {
      startingPositions: [1, 2, 3, 4, 5, 6],
      routes: {
        1: [{ to: 1, mode: Transport.Bus }],
      },
    };

    const game = new ScotlandYard(
      ["test1", "test2", "test3", "test4", "test5", "test6"],
      fakeMap,
    );

    const actual = game.possibleStations();

    assertEquals(actual, []);
  });
});

describe("positionOfDetectives", () => {
  it("should provide positions of all detectives", () => {
    const fakeMap: GameMap = {
      startingPositions: [1, 2, 3, 4, 5, 6],
      routes: {
        1: [{ to: 1, mode: Transport.Bus }],
      },
    };

    const game = new ScotlandYard(
      ["test1", "test2", "test3", "test4", "test5", "test6"],
      fakeMap,
    );

    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions();

    assertEquals(game.getDetectivePositions(), [3, 4, 5, 6, 1]);
  });

  it("should not provide positions of all detectives when station is not assigned", () => {
    const fakeMap: GameMap = {
      startingPositions: [1, 2, 3, 4, 5, 6],
      routes: {
        1: [{ to: 1, mode: Transport.Bus }],
      },
    };
    const game = new ScotlandYard(
      ["test1", "test2", "test3", "test4", "test5", "test6"],
      fakeMap,
    );

    assertEquals(game.getDetectivePositions(), []);
  });
});

describe("getValidRoutes", () => {
  it("should return valid routes", () => {
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

  it("should return empty array if there is no valid route", () => {
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

describe("isMrXTurn", () => {
  it("should provide true if its MrX turn", () => {
    const game = new ScotlandYard(
      ["test1", "test2", "test3", "test4", "test5", "test6"],
      basicMap,
    );
    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions();
    assert(game.isMrXTurn());
  });

  it("should provide false if its not MrX turn", () => {
    const game = new ScotlandYard(
      ["test1", "test2", "test3", "test4", "test5", "test6"],
      basicMap,
    );
    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions();
    assert(game.isMrXTurn());
    game.changeTurn();

    assertFalse(game.isMrXTurn());
  });
});

describe("validTicket", () => {
  it("should provide true if travel is possible to travel using a ticket", () => {
    assert(ScotlandYard.validTicket(Ticket.Yellow, Transport.Taxi));

    assert(ScotlandYard.validTicket(Ticket.Green, Transport.Bus));

    assert(ScotlandYard.validTicket(Ticket.Red, Transport.Metro));

    assert(ScotlandYard.validTicket(Ticket.Black, Transport.Taxi));
    assert(ScotlandYard.validTicket(Ticket.Black, Transport.Bus));
    assert(ScotlandYard.validTicket(Ticket.Black, Transport.Metro));
    assert(ScotlandYard.validTicket(Ticket.Black, Transport.Ferry));
  });

  it("should provide false if travel is not possible to travel using a ticket", () => {
    assertFalse(ScotlandYard.validTicket(Ticket.Yellow, Transport.Bus));
    assertFalse(ScotlandYard.validTicket(Ticket.Yellow, Transport.Metro));
    assertFalse(ScotlandYard.validTicket(Ticket.Yellow, Transport.Ferry));

    assertFalse(ScotlandYard.validTicket(Ticket.Green, Transport.Metro));
    assertFalse(ScotlandYard.validTicket(Ticket.Green, Transport.Taxi));
    assertFalse(ScotlandYard.validTicket(Ticket.Green, Transport.Ferry));

    assertFalse(ScotlandYard.validTicket(Ticket.Red, Transport.Taxi));
    assertFalse(ScotlandYard.validTicket(Ticket.Red, Transport.Bus));
    assertFalse(ScotlandYard.validTicket(Ticket.Red, Transport.Ferry));
  });

  it("should provide false if travel is not possible", () => {
    assertFalse(ScotlandYard.validTicket(Ticket["2x"], Transport.Bus));
  });
});

describe("canTravel", () => {
  it("should provide true if travel is possible to travel using a ticket", () => {
    assert(
      ScotlandYard.canTravel(
        Ticket.Red,
        123,
      )({ to: 123, mode: Transport.Metro }),
    );
    assert(
      ScotlandYard.canTravel(
        Ticket.Yellow,
        123,
      )({ to: 123, mode: Transport.Taxi }),
    );
    assert(
      ScotlandYard.canTravel(
        Ticket.Green,
        123,
      )({ to: 123, mode: Transport.Bus }),
    );
  });
  it("should provide false if destination is deferent", () => {
    assertFalse(
      ScotlandYard.canTravel(
        Ticket.Red,
        125,
      )({ to: 123, mode: Transport.Metro }),
    );
  });

  it("should provide false if ticket is not valid for this route", () => {
    assertFalse(
      ScotlandYard.canTravel(
        Ticket.Yellow,
        123,
      )({ to: 123, mode: Transport.Metro }),
    );
    assertFalse(
      ScotlandYard.canTravel(
        Ticket.Green,
        123,
      )({ to: 123, mode: Transport.Ferry }),
    );
  });
});

const makeGame = (map: GameMap = basicMap, round = 25) => {
  const game = new ScotlandYard(["1", "2", "3", "4", "5", "6"], map, round);

  game.assignRole();
  game.assignStartingPositions();
  game.distributeTickets();

  return game;
};
describe("useTicket", () => {
  // it("using a valid ticket and destination should change the turn", () => {
  //   const game = makeGame(basicMap);

  //   assert(game.useTicket(Ticket.Yellow, 181));
  //   const expected = {
  //     MrX: 181,
  //     Red: 183,
  //     Blue: 184,
  //     Green: 185,
  //     Yellow: 186,
  //     Purple: 187,
  //   };

  //   const positions = game.getCurrentPosition();
  //   const gameState = game.getGameState();

  //   assertEquals(mapToObject(positions), expected);
  //   assertEquals(gameState.currentRole, "Red");
  //   assertEquals(gameState.tickets.MrX.Taxi, 3);
  // });

  it("should reject move when ticket type does not match route", () => {
    const game = makeGame(basicMap);
    assertFalse(game.useTicket(Ticket.Red, 182));
  });

  it("should not allow player to use a ticket they don't own", () => {
    const fakeMap: GameMap = {
      startingPositions: [1, 1, 1, 1, 1, 1],
      routes: {
        1: [{ to: 2, mode: Transport.Ferry }],
      },
    };

    const game = makeGame(fakeMap);
    game.changeTurn();

    assertFalse(game.useTicket(Ticket.Black, 2));
  });

  it("should not allow moving to a non-adjacent location", () => {
    const game = makeGame(basicMap);

    assertFalse(game.useTicket(Ticket.Yellow, 999));
  });
});

describe("isMrXCaught", () => {
  it("should provide true if MrX caught", () => {
    const fakeMap: GameMap = {
      startingPositions: [2, 1, 3, 4, 5, 6, 7],
      routes: {
        1: [{ to: 2, mode: Transport.Taxi }],
        3: [{ to: 2, mode: Transport.Taxi }],
      },
    };

    const game = makeGame(fakeMap);
    const destination = 2;
    game.useTicket(Ticket.Yellow, destination); // MrX
    game.useTicket(Ticket.Yellow, destination); // Detective 1
    assert(game.isMrXCaught());
  });

  it("should provide true if MrX caught by second detective", () => {
    const fakeMap: GameMap = {
      startingPositions: [2, 1, 3, 4, 5, 6, 7],
      routes: {
        1: [{ to: 2, mode: Transport.Taxi }],
        3: [{ to: 8, mode: Transport.Taxi }],
        4: [{ to: 2, mode: Transport.Taxi }],
      },
    };

    const game = makeGame(fakeMap);
    const destination = 2;
    game.useTicket(Ticket.Yellow, destination); // MrX
    game.useTicket(Ticket.Yellow, 8); // Detective 1
    game.useTicket(Ticket.Yellow, destination); // Detective 2
    assert(game.isMrXCaught());
  });

  it("should provide false if MrX not caught", () => {
    const fakeMap: GameMap = {
      startingPositions: [2, 1, 3, 4, 5, 6, 7],
      routes: {
        1: [{ to: 2, mode: Transport.Taxi }],
        3: [{ to: 2, mode: Transport.Taxi }],
      },
    };

    const game = makeGame(fakeMap);
    game.useTicket(Ticket.Yellow, 2); // MrX
    assertFalse(game.isMrXCaught());
  });

  it("should provide false if position is not assigned", () => {
    const fakeMap: GameMap = {
      startingPositions: [2, 1, 3, 4, 5, 6, 7],
      routes: {
        1: [{ to: 2, mode: Transport.Taxi }],
        3: [{ to: 2, mode: Transport.Taxi }],
      },
    };

    const game = new ScotlandYard(["1", "2", "3", "4", "5", "6"], fakeMap);
    game.assignRole();

    assertFalse(game.isMrXCaught());
  });
});

describe("checkWinner", () => {
  it("should return true if a detective caught MrX", () => {
    const fakeMap: GameMap = {
      startingPositions: [2, 1, 3, 4, 5, 6, 7],
      routes: {
        1: [{ to: 2, mode: Transport.Taxi }],
        3: [{ to: 2, mode: Transport.Taxi }],
      },
    };

    const game = makeGame(fakeMap);
    const destination = 2;
    game.useTicket(Ticket.Yellow, destination); // MrX
    game.useTicket(Ticket.Yellow, destination); // Detective 1

    assert(game.isGameOver());
    assertEquals(game.getWinner(), "Detective");
  });

  it("should return false if detective not caught mr X", () => {
    const fakeMap: GameMap = {
      startingPositions: [2, 1, 3, 4, 5, 6, 7],
      routes: {
        1: [{ to: 2, mode: Transport.Taxi }],
        3: [{ to: 2, mode: Transport.Taxi }],
      },
    };

    const game = makeGame(fakeMap);
    const destination = 2;
    game.useTicket(Ticket.Yellow, destination); // MrX
    game.useTicket(Ticket.Yellow, 6); // Detective 1

    assertFalse(game.isGameOver());
    assertEquals(game.getWinner(), null);
  });
});

describe("Increment mrX tickets", () => {
  it("should reduce the ticket use by mrX", () => {
    const fakeMap: GameMap = {
      startingPositions: [2, 1, 3, 4, 5, 6, 7],
      routes: {
        1: [{ to: 2, mode: Transport.Taxi }],
        3: [{ to: 1, mode: Transport.Taxi }],
        4: [{ to: 2, mode: Transport.Taxi }],
      },
    };

    const game = makeGame(fakeMap);
    game.useTicket(Ticket.Yellow, 2);
    const updatedTickets = game.getTickets().get(Role.MrX);

    const expected = { Bus: 3, Taxi: 3, Metro: 3, Wild: 5, "2x": 2 };
    assertEquals(updatedTickets, expected);
  });

  it("should reduce the ticket use by player and increment in mrX", () => {
    const fakeMap: GameMap = {
      startingPositions: [2, 1, 3, 4, 5, 6, 7],
      routes: {
        1: [{ to: 2, mode: Transport.Taxi }],
        3: [{ to: 1, mode: Transport.Taxi }],
        4: [{ to: 2, mode: Transport.Taxi }],
      },
    };

    const game = makeGame(fakeMap);
    game.useTicket(Ticket.Yellow, 2);
    game.useTicket(Ticket.Yellow, 1);
    game.useTicket(Ticket.Yellow, 2);
    const updatedTickets = game.getTickets().get(Role.MrX);

    const expected = { Bus: 3, Taxi: 5, Metro: 3, Wild: 5, "2x": 2 };
    assertEquals(updatedTickets, expected);
  });
});

describe("declareWinner", () => {
  it("should declear Detective as winner when MrX is captured", () => {
    const fakeMap: GameMap = {
      startingPositions: [2, 1, 3, 4, 5, 6, 7],
      routes: {
        1: [{ to: 2, mode: Transport.Taxi }],
        3: [{ to: 2, mode: Transport.Taxi }],
      },
    };

    const game = makeGame(fakeMap, 1);
    const destination = 2;
    game.useTicket(Ticket.Yellow, destination); // MrX
    game.useTicket(Ticket.Yellow, destination); // Detective 1
    assertEquals(game.declareWinner(), "Detective");
  });

  it("should declear Mr.X as winner when he escapes for one turn", () => {
    const fakeMap: GameMap = {
      startingPositions: [2, 1, 3, 4, 5, 6, 7],
      routes: {
        1: [{ to: 2, mode: Transport.Taxi }],
        3: [{ to: 1, mode: Transport.Taxi }],
        4: [{ to: 3, mode: Transport.Taxi }],
        5: [{ to: 4, mode: Transport.Taxi }],
        6: [{ to: 5, mode: Transport.Taxi }],
        7: [{ to: 6, mode: Transport.Taxi }],
      },
    };

    const game = makeGame(fakeMap, 1);

    game.useTicket(Ticket.Yellow, 2); // MrX
    game.useTicket(Ticket.Yellow, 1); // Detective 1
    game.useTicket(Ticket.Yellow, 3); // Detective 2
    game.useTicket(Ticket.Yellow, 4); // Detective 3
    game.useTicket(Ticket.Yellow, 5); // Detective 4
    game.useTicket(Ticket.Yellow, 6); // Detective 5

    assertEquals(game.declareWinner(), "MrX");
  });
});

describe("findRole", () => {
  it("should give role based on player", () => {
    const game = makeGame();
    assertEquals(game.findRole("1"), Role.MrX);
    assertEquals(game.findRole("2"), Role.Red);
  });

  it("should give role null if it is not a registared player", () => {
    const game = makeGame();
    assertFalse(game.findRole("akshay "));
  });
});
