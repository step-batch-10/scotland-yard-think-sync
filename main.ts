import { createApp } from "./src/app.ts";
import { PlayerRegistry } from "./src/models/players.ts";
import { Rooms } from "./src/models/rooms.ts";
import { Bindings } from "./src/models/types.ts";

const main = () => {
  const port = 8000;

  const bindings: Bindings = {
    playerRegistry: new PlayerRegistry(),
    rooms: new Rooms(),
  };

  const app = createApp(bindings);
  Deno.serve({ port }, app.fetch);
};

main();
