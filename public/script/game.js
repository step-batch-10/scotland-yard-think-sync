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
  }, 10000);
};

const main = async () => {
  const { roles } = await fetchRoles();
  renderPlayer(roles);

  setInterval(async () => {
    const { tickets, positions, currentRole, isYourTurn } = await fetchState();
    renderPlayerTickets(tickets, roles, positions);
    console.log(currentRole, isYourTurn);
  }, 3000);
};

globalThis.onload = main;
