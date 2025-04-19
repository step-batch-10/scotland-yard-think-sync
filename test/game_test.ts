import { describe, it } from "testing";
import { assertEquals } from "assert";
import { combineObjects } from "../public/script/game_utils.js";

describe("combines objects", () => {
  it("should return array of key values", () => {
    const param1 = { a: 1 };
    const param2 = { a: 2 };
    assertEquals(combineObjects(param1, param2), [["a", 1, 2]]);
  });

  it("should return array of key values in 1 params", () => {
    const param1 = { a: 1 };

    assertEquals(combineObjects(param1), [["a", 1]]);
  });

  it("should return array of key values with multiple params", () => {
    const param1 = { a: 1, b: 2 };

    const param2 = { a: 2, b: 8 };

    const param3 = { b: 5, a: 6 };

    assertEquals(combineObjects(param1, param2, param3), [
      ["a", 1, 2, 6],
      ["b", 2, 8, 5],
    ]);
  });

  it("should return empty array if no param passed", () => {
    assertEquals(combineObjects(), []);
  });
});
