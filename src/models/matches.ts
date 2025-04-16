import { ScotlandYard } from "./scotland.ts";
interface Room {
  id: string;
}

type Game = ScotlandYard;

interface Matches {
  matches: Map<Room["id"], Game>;
  setMatch: (roomId: Room["id"]) => void;
  getMatch: (roomId: Room["id"]) => Game;
}
