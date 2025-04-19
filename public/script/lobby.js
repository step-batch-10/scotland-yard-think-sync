import { redirectTo } from "./waiting.js";

const hostGame = async () => {
  const response = await fetch("/setup/create-room", { method: "POST" });

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
