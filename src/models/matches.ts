interface Room {
  id: string;
}

interface Game {}

interface Matches {
  matches: Map<Room['id'], Game>;
  setMatch: (roomId: Room['id']) => void;
  getMatch: (roomId: Room['id']) => Game;
}
