import { createApp } from "../src/app.ts";
import { describe, it } from "testing";
import { assertEquals } from "jsr:@std/assert";

describe("ensure Authentication", () => {
  it("should get redirected to the login page because player is not logined", async () => {
    const app = createApp();
    const res = await app.request("/");

    assertEquals(res.status, 303);
    assertEquals(res.headers.get("location"), "/login");
  });
});
