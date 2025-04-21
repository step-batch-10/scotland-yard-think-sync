import { combineObjects } from "./game_utils.js";

const fetchJson = (route) => fetch(route).then((res) => res.json());

const fetchState = () => fetchJson("/game/state");
const fetchRoles = () => fetchJson("/game/info");
const fetchPossiblStations = () => fetchJson("/game/possible-stations");

const cloneTemplate = (targetId) => {
  const template = document.querySelector(targetId);
  return template.content.firstElementChild.cloneNode(true);
};

const makeRoleRow = (data) => {
  const trElement = cloneTemplate("#role-row");
  const rows = trElement.querySelectorAll("td");

  for (const index in data) {
    rows[index].textContent = data[index];
  }

  return trElement;
};

const playerStats = (trElement, [role, playerName, tickets, station]) => {
  const cells = trElement.querySelectorAll("td");

  cells[0].style.backgroundColor = role;

  cells[1].textContent = playerName;
  cells[2].textContent = tickets.Taxi;
  cells[3].textContent = tickets.Bus;
  cells[4].textContent = tickets.Metro;
  cells[5].textContent = station;

  return trElement;
};

const mrXStats = (trElement, [role, playerName, tickets, station]) => {
  const cells = trElement.querySelectorAll("td");

  cells[0].textContent = role;
  cells[1].textContent = playerName;
  cells[2].textContent = tickets.Taxi;
  cells[3].textContent = tickets.Bus;
  cells[4].textContent = tickets.Metro;
  cells[5].textContent = tickets.Wild;
  cells[6].textContent = tickets["2x"];
  cells[7].textContent = station;

  return trElement;
};

const renderMrxTickets = (stats) => {
  const mrXStatTable = document.querySelector(".mrX-stats table");
  const tbody = mrXStatTable.querySelector("tbody");
  const row = tbody.children;

  mrXStats(row[0], stats);
};

const renderPlayerTickets = (stats) => {
  const playerStatTable = document.querySelector(".player-stats");
  const tbody = playerStatTable.querySelector("tbody");
  const rows = tbody.children;

  renderMrxTickets(stats[0]);

  for (let index = 1; index < stats.length; index++) {
    playerStats(rows[index - 1], stats[index]);
  }
};

const renderPlayer = (rolesObject) => {
  const table = cloneTemplate("#roles-table");
  const tbody = table.querySelector("tbody");
  const popup = document.querySelector("#pop-up");

  const roles = Object.entries(rolesObject);
  const tableRoleRows = roles.map(makeRoleRow);

  tbody.append(...tableRoleRows);
  popup.appendChild(table);

  setTimeout(() => {
    popup.remove();
  }, 3000);
};

const addCoordinate = (pawn, dimensions) => {
  pawn.style.left = `${dimensions.x + 65}px`;
  pawn.style.top = `${dimensions.y - 65}px`;
};

const alignCard = (cardsContainer, { x, y }) => {
  cardsContainer.style.position = "absolute";
  cardsContainer.style.left = `${x}px`;
  cardsContainer.style.top = `${y}px`;
};

const getDimensions = (e) => {
  const stationId = e.target.id;
  const station = document.getElementById(stationId);

  return station.getBoundingClientRect();
};

const renderTickets = (mode) => (e) => {
  const cardsContainer = cloneTemplate("#ticket-hover-card");
  const closeBtn = cardsContainer.querySelector("#close-btn");
  const card = cardsContainer.querySelector(".card");
  closeBtn.addEventListener("click", (e) => e.target.parentNode.remove());
  alignCard(cardsContainer, getDimensions(e));

  card.textContent = mode;
  document.body.appendChild(cardsContainer);
};

const showTickets = async () => {
  const possibleStation = await fetchPossiblStations();
  possibleStation.forEach(({ to, mode }) => {
    const station = document.getElementById(`station-${to}`);
    station.addEventListener("click", renderTickets(mode));
  });
};

const generateStationId = (station) => `#station-${station}`;

const movePawnToStation = (pawn, stationId) => {
  const tspan = document.querySelector(stationId);
  const dimensions = tspan.getBoundingClientRect();

  addCoordinate(pawn, dimensions);

  return pawn;
};

const findColor = (name) => name.split(":").at(-1);

const makePawn = (color) => {
  const pawn = cloneTemplate("#pawn");
  const bodyParts = pawn.querySelectorAll(".body-parts");

  bodyParts.forEach((part) => {
    part.setAttribute("fill", color);
  });

  return pawn;
};

const createPawn = (player) => {
  const position = player.at(-1);
  const stationId = generateStationId(position);
  const color = findColor(player[0]);
  const pawn = makePawn(color);

  return movePawnToStation(pawn, stationId, color);
};

const renderPawns = (stats) => {
  const root = document.querySelector("#pawns-display");
  const pawns = stats.map(createPawn);

  root.replaceChildren(...pawns);
};

const showTurn = (currentRole, isYourTurn) => {
  const turn = isYourTurn ? "Your Turn" : "Opponent Turn";
  const turnIndicator = document.querySelector("#turn-indicator");
  turnIndicator.textContent = `${turn} : ${currentRole}`;
};

const startPolling = () => {
  let turn = false;
  setInterval(async () => {
    const { tickets, positions, roles, currentRole, isYourTurn } =
      await fetchState();

    const stats = combineObjects(roles, tickets, positions);

    showTurn(currentRole, isYourTurn);
    renderPlayerTickets(stats);
    renderPawns(stats);

    if (isYourTurn && !turn) {
      showTickets();
    }

    turn = isYourTurn;
  }, 3000);
};

const playAudio = () => {
  const bgAudio = new Audio("/assets/audio/theme-song.mp3");

  bgAudio.autoplay = true;
  bgAudio.loop = true;

  bgAudio.volume = 0.5;

  bgAudio.play().catch(() => {
    alert("Autoplay was blocked. Waiting for user interaction...");

    document.addEventListener(
      "click",
      () => {
        bgAudio.play();
      },
      { once: true }
    );
  });
};

const main = async () => {
  const { roles } = await fetchRoles();

  playAudio();
  renderPlayer(roles);
  startPolling();
};

globalThis.onload = main;
