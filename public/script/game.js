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

const playerStats = ([role, playerName, tickets, station]) => {
  const trElement = cloneTemplate("#ticket-row");
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
  const statsTable = cloneTemplate("#stats");
  const tbody = statsTable.querySelector("tbody");
  const tableContainer = document.querySelector("#ticket-table");

  const stats = combineObjects(roles, tickets, positions);

  const tableTicketRows = stats.map(playerStats);

  tbody.append(...tableTicketRows);
  tableContainer.replaceChildren(statsTable);
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
  }, 1000);
};

const printStationDetails = (e) => {
  alert(e.target.id);
  console.log(e.target.getAttribute("x"));
};

const movePlayer = () => {
  const stations = document.querySelectorAll("tspan");
  stations.forEach((station) => {
    station.addEventListener("click", printStationDetails);
  });
};

const renderPawns = (roles, tickets, positions) => {
  const stats = combineObjects(roles, tickets, positions);
  const svg = document.querySelector("body");
  const player = stats[1];
  const position = player.at(-1);
  const rect = document.querySelector(`#station-${position}`);

  const pawn = cloneTemplate("#move-pawn");
  pawn.style.border = "1px solid black";
  pawn.style.position = "absolute";
  pawn.style.left = `${rect.getAttribute("x")}px`;
  pawn.style.top = `${rect.getAttribute("y")}px`;

  svg.appendChild(pawn);
};

const main = async () => {
  const { roles } = await fetchRoles();
  renderPlayer(roles);

  setInterval(async () => {
    const { tickets, positions } = await fetchState();
    renderPlayerTickets(tickets, roles, positions);
  }, 3000);

  renderPawns(roles, tickets, positions);
  movePlayer();
};

globalThis.onload = main;
