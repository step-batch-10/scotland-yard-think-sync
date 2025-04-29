import { redirectTo } from "./waiting.js";

const joinGame = () => redirectTo("/html/join.html");

const renderPopUp = () => {
  document.querySelector("#popup-container").style.display = "block";
}

const fetchHost = async (body) => {
  const { success } = await fetch('/setup/create-room', {
    method: "POST",
    body
  }).then(res => res.json())

  return success
}

const main = () => {
  const host = document.getElementById("host");
  const join = document.getElementById("join");
  const buttons = document.querySelectorAll(".player-selection");
  
  buttons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const id = event.target.id;
      const body = new FormData();
      body.set("playerCount", id);

      const result = await fetchHost(body);

      if (result) redirectTo("/html/waiting.html");
    })
  })

  host.addEventListener("click", renderPopUp);
  join.addEventListener("click", joinGame);
  
};

globalThis.onload = main;
