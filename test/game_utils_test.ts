import { describe, it } from "testing";
import { assertEquals } from "assert";
import { mapToObject, reverseObject } from "../src/game_utils.ts";

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

describe("reversing a object", () => {
  it("should reverse object and give it back", () => {
    assertEquals(reverseObject({ name: "akshay", age: "none" }), {
      akshay: "name",
      none: "age",
    });
  });

  it("should return empty object if incoming is empty", () => {
    assertEquals(reverseObject({ name: "akshay", age: "none" }), {
      akshay: "name",
      none: "age",
    });
  });
});
