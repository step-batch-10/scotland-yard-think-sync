import { Match } from "./match.ts";

export class Rooms {
  private lobbies: Map<string, Set<string>>;
  private roomId: number;

  constructor() {
    this.lobbies = new Map();
    this.roomId = 100000;
  }

  #generateId() {
    this.roomId++;
    return this.roomId.toString();
  }

  #createRoom() {
    const roomId = this.#generateId();
    this.lobbies.set(roomId, new Set());

    return roomId;
  }

  addHost(player: string) {
    const roomId = this.#createRoom();
    const lobby = this.lobbies.get(roomId);
    lobby?.add(player);

    return roomId;
  }

  addPlayer(roomId: string, player: string) {
    const lobby = this.lobbies.get(roomId);
    lobby?.add(player);
  }

  getPlayers(roomId: string) {
    return this.lobbies.get(roomId);
  }

  isRoomFull(roomId: string) {
    return this.lobbies.get(roomId)?.size === 6;
  }

  hasRoom(roomId: string) {
    return this.lobbies.has(roomId);
  }

  removePlayer(roomId: string, playerName: string): boolean {
    const room = this.lobbies.get(roomId);
    if (!room) return false;

    room.delete(playerName);

    if (room.size === 0) {
      this.lobbies.delete(roomId);
    }

    return true;
  }

  assignGame(roomId: string, match: Match) {
    const players = this.getPlayers(roomId);

    if (!players || match.hasMatch(roomId)) return false;

    match.setMatch(roomId, players);
    return true;
  }
}
