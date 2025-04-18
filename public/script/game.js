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

const combine3Object = (obj1, obj2, obj3) => {
  const result = [];

  for (const key in obj1) {
    const value1 = obj1[key];
    const value2 = obj2[key];
    const value3 = obj3[key];

    result.push([key, value1, value2, value3]);
  }

  return result;
};

const renderPlayerTickets = (tickets, roles, positions) => {
  const playerStatTable = document.querySelector(".player-stats");
  const tbody = playerStatTable.querySelector("tbody");
  const stats = combine3Object(roles, tickets, positions);
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
  }, 10000);
};

const main = async () => {
  const { roles } = await fetchRoles();
  const { tickets, positions } = await fetchState();

  renderPlayer(roles);
  renderPlayerTickets(tickets, roles, positions);
};

globalThis.onload = main;
