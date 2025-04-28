import { describe, it } from "testing";
import { assertEquals, assertThrows } from "assert";
import { assingnAccordingly, mapToObject } from "../src/game_utils.ts";

describe("mapToObject", () => {
  it("should return object if map has values", () => {
    const map = new Map();
    map.set("name", "akshay");
    map.set("age", "none");

    assertEquals(mapToObject<string>(map), { name: "akshay", age: "none" });
  });

  it("should return empty object if there is no parameter", () => {
    assertEquals(mapToObject(), {});
  });
});

describe("distribue", () => {
  it("should return empty object if key and value are empty", () => {
    const actual = assingnAccordingly([], []);
    assertEquals(actual, []);
  });

  it("should throw error if key is greater than value", () => {
    assertThrows(() => assingnAccordingly([], [1]));
  });

  it("should distribute for two items", () => {
    const actual = assingnAccordingly([1, 2, 3, 4, 5], [1, 2]);
    const expected = [
      [1, 1],
      [2, 1],
      [3, 1],
      [4, 2],
      [5, 2],
    ];

    assertEquals(actual, expected);
  });

  it("should distribute for three items", () => {
    const actual = assingnAccordingly([1, 2, 3, 4, 5], [1, 2, 3]);
    const expected = [
      [1, 1],
      [2, 1],
      [3, 2],
      [4, 2],
      [5, 3],
    ];

    assertEquals(actual, expected);
  });

  it("should distribute for four items", () => {
    const actual = assingnAccordingly([1, 2, 3, 4, 5], [1, 2, 3, 4]);

    const expected = [
      [1, 1],
      [2, 1],
      [3, 2],
      [4, 3],
      [5, 4],
    ];

    assertEquals(actual, expected);
  });

  it("should distribute for five items", () => {
    const actual = assingnAccordingly([1, 2, 3, 4, 5], [1, 2, 3, 4, 5]);
    const expected = [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
      [5, 5],
    ];

    assertEquals(actual, expected);
  });
});
