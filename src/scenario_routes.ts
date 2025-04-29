/// <reference lib="deno.ns" />
import { Hono } from "hono";
import {
  Bindings,
  GameContext,
  GameHandler,
  Scenario,
} from "./models/types.ts";
import { ScotlandYard } from "./models/scotland.ts";

const loadScenario: GameHandler = async (context: GameContext) => {
  const scenarioName = context.req.param("scenarioName");
  try {
    const gameJson = await Deno.readTextFile(`data/${scenarioName}.json`);
    const scenario: Scenario = JSON.parse(gameJson);

    const game = ScotlandYard.loadScenario(scenario);
    context.env.match = { game, winner: null, isGameFinished: false };

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
