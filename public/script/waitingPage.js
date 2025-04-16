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

const main = () => {
  renderId();
  const copyId = document.querySelector("#copy");
  copyId.addEventListener("click", copyText);
};

globalThis.onload = main;
