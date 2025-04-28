import { GameController } from "./game_controller.ts";
import { GameMap, RandomIndex } from "./types.ts";

interface WaitingRoom {
  room: Set<string>;
  threshold: number;
}
export class Rooms {
  private lobbies: Map<string, WaitingRoom>;
  private roomId: number;

  constructor() {
    this.lobbies = new Map();
    this.roomId = 100000;
  }

  private generateId() {
    this.roomId++;
    return this.roomId.toString();
  }

  private createRoom(threshold: number) {
    const roomId = this.generateId();
    this.lobbies.set(roomId, {
      room: new Set(),
      threshold,
    });

    return roomId;
  }

  addHost(player: string, threshold = 6) {
    const roomId = this.createRoom(threshold);
    const lobby = this.lobbies.get(roomId);
    lobby?.room.add(player);

    return roomId;
  }

  addPlayer(roomId: string, player: string) {
    const lobby = this.lobbies.get(roomId);
    lobby?.room.add(player);
  }

  getPlayers(roomId: string) {
    return this.lobbies.get(roomId)?.room;
  }

  isRoomFull(roomId: string) {
    const room = this.lobbies.get(roomId)!;
    return room.room.size === room.threshold;
  }

  hasRoom(roomId: string) {
    return this.lobbies.has(roomId);
  }

  removePlayer(roomId: string, playerName: string): boolean {
    const waitingRoom = this.lobbies.get(roomId);
    if (!waitingRoom) return false;

    waitingRoom.room.delete(playerName);

    if (waitingRoom.room.size === 0) {
      this.lobbies.delete(roomId);
    }

    return true;
  }

  assignGame(
    roomId: string,
    match: GameController,
    map?: GameMap,
    random?: RandomIndex,
  ) {
    const players = this.getPlayers(roomId);

    if (!players || match.hasMatch(roomId)) return false;

    match.setMatch(roomId, players, map, random);
    return true;
  }
}
