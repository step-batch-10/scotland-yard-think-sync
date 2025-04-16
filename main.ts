import { createApp } from "./src/app.ts";

const main = () => {
  const port = 8000;
  const app = createApp();

  Deno.serve({ port }, app.fetch);
};

main();
