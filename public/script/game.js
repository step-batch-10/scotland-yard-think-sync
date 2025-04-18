import { combineObjects } from "./game_utils.js";

const fetchState = () => fetch("/game/state").then((res) => res.json());
const fetchRoles = () => fetch("/game/info").then((res) => res.json());

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

  cells[0].textContent = role;
  cells[1].textContent = playerName;
  cells[2].textContent = tickets.Taxi;
  cells[3].textContent = tickets.Bus;
  cells[4].textContent = tickets.Metro;
  cells[5].textContent = tickets.All;
  cells[6].textContent = tickets["2x"];
  cells[7].textContent = station;

  return trElement;
};

const renderPlayerTickets = (tickets, roles, positions) => {
  const playerStatTable = document.querySelector(".player-stats");
  const tbody = playerStatTable.querySelector("tbody");
  const stats = combineObjects(roles, tickets, positions);
  const rows = tbody.children;

  for (let index = 0; index < stats.length; index++) {
    playerStats(rows[index], stats[index]);
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

const printStationDetails = (e) => {
  const [_, id] = e.target.id.split("-");
  const station = document.querySelector(`#station-${id}`);
  const dimensions = station.getBoundingClientRect();
  const pawn = document.querySelector(".pawn");
  const pawnDimension = pawn.getBoundingClientRect();
  console.log(pawnDimension);
  pawn.style.left = `${dimensions.x}px`;
  pawn.style.top = `${dimensions.y}px`;
  console.log(dimensions);
};

const movePlayer = () => {
  const stations = document.querySelectorAll("tspan");
  stations.forEach((station) => {
    station.addEventListener("click", printStationDetails);
  });
};

const renderPawns = (roles, tickets, positions) => {
  const stats = combineObjects(roles, tickets, positions);
  const root = document.querySelector("#pawns-display");

  const template = document.querySelector("#move-pawn");
  const clone = template.content.cloneNode(true);
  const pawns = [...clone.querySelectorAll(".pawn")];

  const playerPawns = pawns.map((pawn, index) => {
    const player = stats[index];
    const position = player.at(-1);
    const rect = document.querySelector(`#station-${position}`);
    const dimensions = rect.getBoundingClientRect();

    const [_, color] = player[0].split(":");
    pawn.style.backgroundColor = color;
    pawn.style.left = `${dimensions.x + 10}px`;
    pawn.style.top = `${dimensions.y - 10}px`;

    return pawn;
  });

  root.replaceChildren(...playerPawns);
};

const whoseTurn = (currentRole, isYourTurn) => {
  const turn = isYourTurn ? "your turn" : "opponent turn";

  const turnIndicator = document.querySelector("#turn-indicator");

  turnIndicator.textContent = `${turn} : ${currentRole}`;
};

const main = async () => {
  const { roles } = await fetchRoles();
  renderPlayer(roles);

  setInterval(async () => {
    const { tickets, positions, roles, currentRole, isYourTurn } =
      await fetchState();
    renderPlayerTickets(tickets, roles, positions);
    whoseTurn(currentRole, isYourTurn);
    renderPawns(roles, tickets, positions);
  }, 3000);

  movePlayer();
};

globalThis.onload = main;
