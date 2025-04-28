import { redirectTo } from "./waiting.js";

const hostGame = async () => {
  const playerCount = document.querySelector("#playerCount");
  const body = new FormData();
  body.set("playerCount", playerCount.value);

  const response = await fetch("/setup/create-room", { method: "POST", body });

  if (response.ok) {
    redirectTo("/html/waiting.html");
  }
};

const joinGame = () => redirectTo("/html/join.html");

const main = () => {
  const host = document.getElementById("host");
  const join = document.getElementById("join");

  host.addEventListener("click", hostGame);
  join.addEventListener("click", joinGame);
};

globalThis.onload = main;
