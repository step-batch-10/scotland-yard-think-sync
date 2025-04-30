import { Hono } from "hono";
import {
  Bindings,
  GameContext,
  GameHandler,
  Scenario,
} from "./models/types.ts";
import { ScotlandYard } from "./models/scotland.ts";

export const setScenario = (scenario: Scenario, context: GameContext) => {
  const game = ScotlandYard.loadScenario(scenario);
  const { playerRegistry, rooms, controller } = context.env;
  const [host, ...players] = scenario.players;
  const roomId = rooms.addHost(host, scenario.players.length);
  playerRegistry.assignRoom(roomId, host);

  players.forEach((player) => {
    rooms.addPlayer(roomId, player);
    playerRegistry.assignRoom(roomId, player);
  });
  playerRegistry.joinMatch([...scenario.players]);
  controller.setSpecificMatch(roomId, game);
};

const loadScenario: GameHandler = async (context: GameContext) => {
  const scenarioName = context.req.param("scenarioName");
  try {
    const gameJson = await Deno.readTextFile(`data/${scenarioName}.json`);
    const scenario: Scenario = JSON.parse(gameJson);

    setScenario(scenario, context);

    return context.json({ success: true, message: "loaded successfully" });
  } catch {
    return context.json({ success: false, message: "Failed to load" }, 500);
  }
};

export const createScenarioRoutes = (): Hono<{ Bindings: Bindings }> => {
  const gameApp = new Hono<{ Bindings: Bindings }>();

  gameApp.get("/:scenarioName", loadScenario);
  return gameApp;
};
