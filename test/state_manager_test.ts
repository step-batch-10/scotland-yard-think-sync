import { describe, it } from "jsr:@std/testing/bdd";
import { assert, assertEquals, assertFalse } from "jsr:@std/assert";
import { Role } from "../src/models/types.ts";
import { StateManager } from "../src/models/state_manager.ts";
const roles = [
  Role.MrX,
  Role.Red,
  Role.Blue,
  Role.Green,
  Role.Yellow,
  Role.Purple,
];

describe("changePlayer", () => {
  it("should provide next player", () => {
    const manager = new StateManager(roles);

    assertEquals(manager.getCurrentRole(), Role.MrX);
    assertEquals(manager.changePlayer(), Role.Red);
  });
});

describe("declareWinner", () => {
  it("should declare detective as winner when MrX is Caught", () => {
    const manager = new StateManager(roles);
    const isMrXCaught = true;
    assertEquals(
      manager.declareWinner(isMrXCaught, false, false, false),
      "Detective",
    );
    assertEquals(
      manager.declareWinner(isMrXCaught, false, false, false),
      manager.getWinner(),
    );
  });

  it("should declare MrX as winner when turn limit reached", () => {
    const manager = new StateManager(roles);
    const isTurnLimitReached = true;
    assertEquals(
      manager.declareWinner(false, isTurnLimitReached, false, false),
      "MrX",
    );
  });

  it("should declare MrX as winner when all Detectives can't move", () => {
    const manager = new StateManager(roles);
    const detectivesCannotMove = true;
    assertEquals(
      manager.declareWinner(false, false, detectivesCannotMove, false),
      "MrX",
    );
  });

  it("should declare Detective as winner when MrX can't move", () => {
    const manager = new StateManager(roles);
    const mrXCannotMove = true;
    assertEquals(
      manager.declareWinner(false, false, false, mrXCannotMove),
      "Detective",
    );
  });
});

describe("isTurnReachedLimit", () => {
  it("should provide true when turn reached limit", () => {
    const manager = new StateManager(roles, 0);
    assertEquals(manager.getCurrentTurn(), 0);
    manager.updateTurn(Role.MrX);
    assertEquals(manager.getCurrentTurn(), 1);
    assert(manager.isTurnLimitReached());
  });

  it("should provide false when turn not reached limit", () => {
    const manager = new StateManager(roles, 2);
    manager.updateTurn(Role.MrX);
    assertFalse(manager.isTurnLimitReached());
  });
});

describe("isGameOver", () => {
  it("should provide true when won by isMrXCaught", () => {
    const manager = new StateManager(roles, 2);
    const isMrXCaught = true;
    manager.declareWinner(isMrXCaught, false, false, false);
    assert(manager.isGameOver());
  });

  it("should provide true when won by isTurnLimitReached", () => {
    const manager = new StateManager(roles, -1);
    const isTurnLimitReached = true;
    manager.declareWinner(false, isTurnLimitReached, false, false);
    assert(manager.isGameOver());
  });

  it("should provide true when won by detectivesCannotMove", () => {
    const manager = new StateManager(roles, 2);
    const detectivesCannotMove = true;
    manager.declareWinner(false, false, detectivesCannotMove, false);
    assert(manager.isGameOver());
  });

  it("should provide true when won by mrXCannotMove", () => {
    const manager = new StateManager(roles, 2);
    const mrXCannotMove = true;
    manager.declareWinner(false, false, false, mrXCannotMove);
    assert(manager.isGameOver());
  });

  it("should provide false when their is no winner", () => {
    const manager = new StateManager(roles, 1);
    assertFalse(manager.isGameOver());
  });
});

describe("StateManager - Loading Methods", () => {
  it("should set the current role correctly", () => {
    const stateManager = new StateManager(roles, 2);
    stateManager.setCurrentRole(Role.Red);

    assertEquals(stateManager.getCurrentRole(), Role.Red);
  });

  it("should set the current turn correctly", () => {
    const stateManager = new StateManager(roles, 2);
    stateManager.setCurrentTurn(2);

    assertEquals(stateManager.getCurrentTurn(), 2);
  });
});
