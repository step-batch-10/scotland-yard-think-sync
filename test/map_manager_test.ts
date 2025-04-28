import { describe, it } from "jsr:@std/testing/bdd";
import { assert, assertEquals, assertFalse } from "jsr:@std/assert";
import { MapManager } from "../src/models/map_manager.ts";
import { basicMap } from "../src/maps/game_map.ts";
import { Role, Transport } from "../src/models/types.ts";
import { mapToObject } from "../src/game_utils.ts";

const roles = [
  Role.MrX,
  Role.Red,
  Role.Blue,
  Role.Green,
  Role.Yellow,
  Role.Purple,
];
const random = () => 0;
const revealingTurn = [3, 5];

describe("assignStartingPositions", () => {
  it("should assign position based on random function", () => {
    const manager = new MapManager(basicMap, roles, revealingTurn);
    manager.assignStartingPositions(random);
    const actual = manager.getCurrentStations();

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
});

describe("getDetectivePositions", () => {
  it("should provide detectives positions", () => {
    const manager = new MapManager(basicMap, roles, revealingTurn);
    manager.assignStartingPositions(random);
    const actual = manager.getDetectivePositions();
    assertEquals(actual, [182, 183, 184, 185, 186]);
  });
});

describe("validRoutes", () => {
  it("should provide valid Routes", () => {
    const manager = new MapManager(basicMap, roles, revealingTurn);
    manager.assignStartingPositions(random);

    const actual = manager.validRoutes(
      181,
      ["Taxi"],
      [182, 183, 184, 185, 186],
    );
    assertEquals(actual, [{ to: 100, mode: Transport.Taxi }]);
  });

  it("should provide valid Routes", () => {
    const manager = new MapManager(basicMap, roles, revealingTurn);
    manager.assignStartingPositions(random);

    const actual = manager.validRoutes(181, [], [182, 183, 184, 185, 186]);
    assertEquals(actual, []);
  });
});

describe("should reveal", () => {
  it("should provide true when it is a revealing turn", () => {
    const manager = new MapManager(basicMap, roles, revealingTurn);
    manager.assignStartingPositions(random);

    assert(manager.shouldReveal(3));
    assert(manager.shouldReveal(5));
  });
  it("should provide false when it is not a revealing turn", () => {
    const manager = new MapManager(basicMap, roles, revealingTurn);
    manager.assignStartingPositions(random);

    assertFalse(manager.shouldReveal(1));
    assertFalse(manager.shouldReveal(7));
  });
});

describe("last seen", () => {
  it("should provide last seen position of mrX", () => {
    const manager = new MapManager(basicMap, roles, revealingTurn);
    manager.assignStartingPositions(random);
    assertEquals(manager.getLastSeenOfMrX(), null);
    manager.updateLastSeen(3);
    assertEquals(manager.getLastSeenOfMrX(), 181);
  });
});

describe("movePlayer", () => {
  it("should move role to given position", () => {
    const manager = new MapManager(basicMap, roles, revealingTurn);
    manager.assignStartingPositions(random);
    manager.movePlayer(Role.MrX, 100);

    assertEquals(manager.getCurrentStations().get(Role.MrX), 100);
  });
});
