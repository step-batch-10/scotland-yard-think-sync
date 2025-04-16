const copyText = () => {
  const copyText = document.getElementById("roomId");
  navigator.clipboard.writeText(copyText.textContent);
};

const renderId = async () => {
  const response = await fetch("/setup/room-id");
  const { roomId } = await response.json();

  const roomIdElement = document.getElementById("roomId");
  roomIdElement.textContent = roomId;
};

const addPlayerNames = (names) => {
  const list = document.querySelector("tbody");
  const rows = names.map((name) => {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.textContent = name;
    tr.appendChild(td);

    return tr;
  });

  list.replaceChildren(...rows);
};

const renderPlayerList = () => {
  const intervalId = setInterval(async () => {
    const response = await fetch("/setup/player-list");
    const jsonData = await response.json();
    if (jsonData.isRoomFull) {
      console.log("room full");
      clearInterval(intervalId);
    }
    addPlayerNames(jsonData.players);
  }, 1000);
};

const removePlayer = async () => {
  const response = await fetch("/setup/remove-player");

  if (response.ok) {
    globalThis.location = "/lobby";
  }
};

const main = async () => {
  await renderId();
  renderPlayerList();
  const copyId = document.querySelector("#copy");
  copyId.addEventListener("click", copyText);
  const leave = document.getElementById("leave");
  leave.addEventListener("click", removePlayer);
};

globalThis.onload = main;
