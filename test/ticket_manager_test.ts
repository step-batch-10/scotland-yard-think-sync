import { describe, it } from "jsr:@std/testing/bdd";
import { assert, assertEquals, assertFalse } from "jsr:@std/assert";
import { TicketManager } from "../src/models/ticket_manager.ts";
import { Role, Ticket, Tickets, Transport } from "../src/models/types.ts";
import { getPlayersAndRoles } from "./player_manager_test.ts";
import { mapToObject } from "../src/game_utils.ts";

describe("validTicket", () => {
  it("should provide true if travel is possible to travel using a ticket", () => {
    assert(TicketManager.validTicket(Ticket.Yellow, Transport.Taxi));

    assert(TicketManager.validTicket(Ticket.Green, Transport.Bus));

    assert(TicketManager.validTicket(Ticket.Red, Transport.Metro));

    assert(TicketManager.validTicket(Ticket.Black, Transport.Taxi));
    assert(TicketManager.validTicket(Ticket.Black, Transport.Bus));
    assert(TicketManager.validTicket(Ticket.Black, Transport.Metro));
    assert(TicketManager.validTicket(Ticket.Black, Transport.Ferry));
  });

  it("should provide false if travel is not possible to travel using a ticket", () => {
    assertFalse(TicketManager.validTicket(Ticket.Yellow, Transport.Bus));
    assertFalse(TicketManager.validTicket(Ticket.Yellow, Transport.Metro));
    assertFalse(TicketManager.validTicket(Ticket.Yellow, Transport.Ferry));

    assertFalse(TicketManager.validTicket(Ticket.Green, Transport.Metro));
    assertFalse(TicketManager.validTicket(Ticket.Green, Transport.Taxi));
    assertFalse(TicketManager.validTicket(Ticket.Green, Transport.Ferry));

    assertFalse(TicketManager.validTicket(Ticket.Red, Transport.Taxi));
    assertFalse(TicketManager.validTicket(Ticket.Red, Transport.Bus));
    assertFalse(TicketManager.validTicket(Ticket.Red, Transport.Ferry));
  });

  it("should provide false if travel is not possible", () => {
    assertFalse(TicketManager.validTicket(Ticket["2x"], Transport.Bus));
  });
});

describe("canTravel", () => {
  it("should provide true if travel is possible to travel using any ticket", () => {
    assert(
      TicketManager.canTravel(
        Ticket.Red,
        123,
      )({ to: 123, mode: Transport.Metro }),
    );
    assert(
      TicketManager.canTravel(
        Ticket.Yellow,
        123,
      )({ to: 123, mode: Transport.Taxi }),
    );
    assert(
      TicketManager.canTravel(
        Ticket.Green,
        123,
      )({ to: 123, mode: Transport.Bus }),
    );
  });
  it("should provide false if destination is deferent", () => {
    assertFalse(
      TicketManager.canTravel(
        Ticket.Red,
        125,
      )({ to: 123, mode: Transport.Metro }),
    );
  });

  it("should provide false if ticket is not valid for this route", () => {
    assertFalse(
      TicketManager.canTravel(
        Ticket.Yellow,
        123,
      )({ to: 123, mode: Transport.Metro }),
    );
    assertFalse(
      TicketManager.canTravel(
        Ticket.Green,
        123,
      )({ to: 123, mode: Transport.Ferry }),
    );
  });
});

describe("distribute tickets", () => {
  it("should provide tickets", () => {
    const { roles } = getPlayersAndRoles();
    const manager = new TicketManager(roles);
    manager.distributeTickets();

    const expected = {
      MrX: { Bus: 3, Taxi: 4, Metro: 3, Wild: 5, "2x": 2 },
      Red: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Blue: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Green: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Yellow: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Purple: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
    };

    const assignedTickets = manager.getTickets();
    assertEquals(mapToObject<Tickets>(assignedTickets), expected);
  });
});

describe("has Ticket", () => {
  it("should provide true when the player has the ticket", () => {
    const { roles } = getPlayersAndRoles();
    const manager = new TicketManager(roles);
    manager.distributeTickets();

    assert(manager.hasTickets(Role.MrX, Ticket.Black));
    assert(manager.hasTickets(Role.MrX, Ticket.Green));
    assert(manager.hasTickets(Role.MrX, Ticket.Yellow));
    assert(manager.hasTickets(Role.MrX, Ticket.Red));
    assert(manager.hasTickets(Role.MrX, Ticket["2x"]));

    assert(manager.hasTickets(Role.Blue, Ticket.Green));
    assert(manager.hasTickets(Role.Blue, Ticket.Yellow));
    assert(manager.hasTickets(Role.Blue, Ticket.Red));
  });

  it("should provide false when the player don't have the ticker", () => {
    const { roles } = getPlayersAndRoles();
    const manager = new TicketManager(roles);
    manager.distributeTickets();

    assertFalse(manager.hasTickets(Role.Blue, Ticket["2x"]));
    assertFalse(manager.hasTickets(Role.Blue, Ticket.Black));
  });
});

describe("Reduce tickets", () => {
  it("should reduce the tickets from total tickets if it is a valid tickets", () => {
    const { roles } = getPlayersAndRoles();
    const manager = new TicketManager(roles);
    manager.distributeTickets();

    manager.reduceTickets(Role.MrX, Ticket["2x"]);
    manager.reduceTickets(Role.MrX, Ticket.Black);
    manager.reduceTickets(Role.MrX, Ticket.Green);
    manager.reduceTickets(Role.MrX, Ticket.Yellow);
    manager.reduceTickets(Role.MrX, Ticket.Red);

    manager.reduceTickets(Role.Red, Ticket.Green);
    manager.reduceTickets(Role.Blue, Ticket.Yellow);
    manager.reduceTickets(Role.Green, Ticket.Red);

    const expected = {
      MrX: { Bus: 2, Taxi: 3, Metro: 2, Wild: 4, "2x": 1 },
      Red: { Bus: 7, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Blue: { Bus: 8, Taxi: 9, Metro: 4, Wild: 0, "2x": 0 },
      Green: { Bus: 8, Taxi: 10, Metro: 3, Wild: 0, "2x": 0 },
      Yellow: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Purple: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
    };

    const assignedTickets = manager.getTickets();
    assertEquals(mapToObject<Tickets>(assignedTickets), expected);
  });
});

describe("Fuel MrX", () => {
  it("should increase the number of tickets of MrX", () => {
    const { roles } = getPlayersAndRoles();
    const manager = new TicketManager(roles);
    manager.distributeTickets();

    manager.fuelMrX(Role.Yellow, Ticket.Yellow);
    manager.fuelMrX(Role.Red, Ticket.Red);
    manager.fuelMrX(Role.Green, Ticket.Green);

    const expected = {
      MrX: { Bus: 4, Taxi: 5, Metro: 4, Wild: 5, "2x": 2 },
      Red: { Bus: 8, Taxi: 10, Metro: 3, Wild: 0, "2x": 0 },
      Blue: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Green: { Bus: 7, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Yellow: { Bus: 8, Taxi: 9, Metro: 4, Wild: 0, "2x": 0 },
      Purple: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
    };

    const assignedTickets = manager.getTickets();
    assertEquals(mapToObject<Tickets>(assignedTickets), expected);
  });
});

describe("get Valid Tickets", () => {
  it("should provide only valid tickets when tickets are present for MrX", () => {
    const { roles } = getPlayersAndRoles();
    const manager = new TicketManager(roles);
    manager.distributeTickets();

    assertEquals(manager.getValidTickets(Role.MrX), [
      "Bus",
      "Taxi",
      "Metro",
      "Wild",
      "2x",
    ]);
  });

  it("should provide only valid tickets when tickets are present for Detectives", () => {
    const { roles } = getPlayersAndRoles();
    const manager = new TicketManager(roles);
    manager.distributeTickets();

    assertEquals(manager.getValidTickets(Role.Red), ["Bus", "Taxi", "Metro"]);
  });

  it("should not provide any tickets if no tickets are available", () => {
    const { roles } = getPlayersAndRoles();
    const manager = new TicketManager(roles);

    assertEquals(manager.getValidTickets(Role.Red), []);
  });
});

describe("Get Valid Ticket Options", () => {
  it("should provide only valid tickets", () => {
    assertEquals(
      TicketManager.validTicketOption(
        [Ticket["2x"], Ticket.Black, Ticket.Green, Ticket.Red, Ticket.Yellow],
        Transport.Bus,
      ),
      [Ticket.Black, Ticket.Green],
    );

    assertEquals(
      TicketManager.validTicketOption(
        [Ticket.Green, Ticket.Red, Ticket.Yellow],
        Transport.Bus,
      ),
      [Ticket.Green],
    );

    assertEquals(
      TicketManager.validTicketOption(
        [Ticket.Green, Ticket.Red, Ticket.Yellow],
        Transport.Ferry,
      ),
      [],
    );

    assertEquals(
      TicketManager.validTicketOption(
        [Ticket["2x"], Ticket.Black, Ticket.Green, Ticket.Red, Ticket.Yellow],
        Transport.Ferry,
      ),
      [Ticket.Black],
    );
  });
});

describe("possibleStationTickets", () => {
  it("should provide station tickets", () => {
    const routes = [{ to: 1, mode: Transport.Bus }];
    const tickets = [Ticket.Green];
    const expected = [{ to: 1, tickets: [Ticket.Green] }];
    assertEquals(
      TicketManager.possibleStationTickets(routes, tickets),
      expected,
    );
  });

  it("should provide station tickets", () => {
    const routes = [{ to: 1, mode: Transport.Bus }];
    const tickets = [Ticket.Green, Ticket.Black, Ticket.Yellow];
    const expected = [{ to: 1, tickets: [Ticket.Green, Ticket.Black] }];
    assertEquals(
      TicketManager.possibleStationTickets(routes, tickets),
      expected,
    );
  });

  it("should provide station tickets", () => {
    const routes = [{ to: 1, mode: Transport.Ferry }];
    const tickets = [Ticket.Green, Ticket.Black, Ticket.Yellow];
    const expected = [{ to: 1, tickets: [Ticket.Black] }];
    assertEquals(
      TicketManager.possibleStationTickets(routes, tickets),
      expected,
    );
  });
});

describe("TicketManager", () => {
  it("should set tickets correctly", () => {
    const { roles } = getPlayersAndRoles();
    const ticketManager = new TicketManager(roles);
    const tickets: Record<Role, Tickets> = {
      MrX: { Bus: 5, Taxi: 5, Metro: 5, Wild: 5, "2x": 2 },
      Red: { Bus: 3, Taxi: 3, Metro: 3, Wild: 0, "2x": 0 },
      Blue: { Bus: 3, Taxi: 3, Metro: 3, Wild: 0, "2x": 0 },
      Green: { Bus: 3, Taxi: 3, Metro: 3, Wild: 0, "2x": 0 },
      Yellow: { Bus: 3, Taxi: 3, Metro: 3, Wild: 0, "2x": 0 },
      Purple: { Bus: 3, Taxi: 3, Metro: 3, Wild: 0, "2x": 0 },
    };

    ticketManager.setTickets(tickets);

    assertEquals(ticketManager.getTickets().get(Role.MrX)?.Bus, 5);
    assertEquals(ticketManager.getTickets().get(Role.Red)?.Taxi, 3);
    assertEquals(ticketManager.getTickets().get(Role.Blue)?.Taxi, 3);
    assertEquals(ticketManager.getTickets().get(Role.Green)?.Taxi, 3);
    assertEquals(ticketManager.getTickets().get(Role.Yellow)?.Taxi, 3);
    assertEquals(ticketManager.getTickets().get(Role.Purple)?.Taxi, 3);
  });
});
