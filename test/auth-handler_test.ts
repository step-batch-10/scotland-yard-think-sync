import { createApp } from "../src/app.ts";
import { describe, it } from "testing";
import { assertEquals } from "jsr:@std/assert";
import { Bindings } from "../src/models/types.ts";
import { PlayerRegistry } from "../src/models/players.ts";
import { Rooms } from "../src/models/rooms.ts";

describe("login handler", () => {
  it("should create player stats", async () => {
    const bindings: Bindings = {
      playerRegistry: new PlayerRegistry(),
      rooms: new Rooms(),
    };

    const formData = new FormData();
    formData.set("playerName", "akshay");

    const app = createApp(bindings);

    const res = await app.request("/login", { method: "POST", body: formData });

    assertEquals(res.status, 303);
    assertEquals(res.headers.get("location"), "/lobby");
  });
});
