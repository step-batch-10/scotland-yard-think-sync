const POLLING_TIMEOUT = 1000;

const copyRoomID = () => {
  const copyText = document.querySelector("#roomId");
  navigator.clipboard.writeText(copyText.textContent);
};

const fetchRoomId = () => fetch("/setup/room-id").then((res) => res.json());

const renderId = async () => {
  const roomIdElement = document.querySelector("#roomId");
  const { roomId } = await fetchRoomId();

  roomIdElement.textContent = roomId;
};

const playerRow = (name) => {
  const listElement = document.createElement("li");
  listElement.textContent = name;

  return listElement;
};

const renderPlayers = (names) => {
  const list = document.querySelector("ol");
  const rows = names.map(playerRow);

  list.replaceChildren(...rows);
};

export const redirectTo = (location) => (globalThis.location = location);

const fetchPlayers = () =>
  fetch("/setup/player-list").then((res) => res.json());

const renderPlayerList = () => {
  const intervalId = setInterval(async () => {
    const { players, isRoomFull } = await fetchPlayers();
    renderPlayers(players);

    if (isRoomFull) {
      clearInterval(intervalId);
      redirectTo("/html/game.html");
    }
  }, POLLING_TIMEOUT);
};

const removePlayer = async () => {
  const response = await fetch("/setup/remove-player");
  if (response.ok) return redirectTo("/lobby");
};

const addListeners = () => {
  const copyId = document.querySelector("#copy");
  const leave = document.querySelector("#leave");

  copyId.addEventListener("click", copyRoomID);
  leave.addEventListener("click", removePlayer);
};

const main = async () => {
  await renderId();
  renderPlayerList();
  addListeners();
};

globalThis.onload = main;
