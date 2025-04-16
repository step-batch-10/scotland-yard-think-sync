export class Rooms {
  private lobbies: Map<string, Set<string>>;

  constructor() {
    this.lobbies = new Map();
  }

  #createRoom() {
    const roomId = Date.now().toString().slice(-6);
    this.lobbies.set(roomId, new Set());

    return roomId;
  }

  addHost(player: string) {
    const roomId = this.#createRoom();
    const lobby = this.lobbies.get(roomId);
    lobby?.add(player);

    return roomId;
  }

  addPlayer(player: string, roomId: string) {
    const lobby = this.lobbies.get(roomId);
    lobby?.add(player);
  }

  getPlayers(roomId: string) {
    return this.lobbies.get(roomId);
  }
}
