const hostGame = async () => {
  const response = await fetch("/setup/create-room");

  if (response.ok) {
    globalThis.location = "/html/waitingPage.html";
  }
};

const joinGame = () => {
  globalThis.location = "/html/join.html";
};

const main = () => {
  const host = document.getElementById("host");
  const join = document.getElementById("join");
  host.addEventListener("click", hostGame);
  join.addEventListener("click", joinGame);
};

globalThis.onload = main;
