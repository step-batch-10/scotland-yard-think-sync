import { describe, it } from "testing";
import { assertEquals } from "assert";
import { Role } from "../src/models/types.ts";
import { ticketsOf } from "../src/models/tickets.ts";

describe("Distribute tickets based on roles", () => {
  it("should give detectives tickets if role tis detective", () => {
    const role = Role.Blue;
    const expected = {
      Bus: 8,
      Taxi: 10,
      Metro: 4,
      Wild: 0,
      "2x": 0,
    };

    assertEquals(ticketsOf(role), expected);
  });

  it("should give spies tickets if role tis Mr.X", () => {
    const role = Role.MrX;
    const expected = {
      Bus: 3,
      Taxi: 4,
      Metro: 3,
      Wild: 5,
      "2x": 2,
    };

    assertEquals(ticketsOf(role), expected);
  });
});
