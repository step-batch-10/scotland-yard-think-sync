const cloneTemplate = (targetId) => {
  const template = document.querySelector(targetId);
  return template.content.cloneNode(true);
};

const makeRoleRow = (data) => {
  const trElement = cloneTemplate("#role-row");
  const rows = trElement.querySelectorAll("td");

  for (const index in data) {
    rows[index].textContent = data[index];
  }

  return trElement;
};

const makeTicketRow = (data, role) => {
  const trElement = cloneTemplate("#ticket-row");
  const rows = trElement.querySelectorAll("td");

  rows[0].textContent = data[0];
  rows[1].textContent = role;
  rows[2].textContent = data[1].Taxi;
  rows[3].textContent = data[1].Bus;
  rows[4].textContent = data[1].Metro;
  rows[5].textContent = data[1].All;
  rows[6].textContent = data[1]["2x"];

  return trElement;
};
const fetchState = () => fetch("/game/state").then((res) => res.json());

const renderPlayerTickets = async () => {
  const { tickets: ticketsObject, roles: rolesObject } = await fetchState();
  const table = cloneTemplate("#stats");
  const ticketTableDiv = document.querySelector(".ticket-table");
  const ticketTable = table.querySelector(".pop-up-2");

  const tbody = ticketTable.querySelector("tbody");
  const roles = Object.entries(rolesObject);
  const tickets = Object.entries(ticketsObject);
  const tableTicketRows = tickets.map((ticket, index) =>
    makeTicketRow(ticket, roles[index][1])
  );

  tbody.append(...tableTicketRows);
  ticketTableDiv.replaceChildren(table);
};

const renderPlayerInfo = (rolesObject) => {
  const table = cloneTemplate("#roles-table");
  const popup = document.querySelector("#pop-up");
  const popup1 = table.querySelector(".pop-up-1");
  const tbody1 = popup1.querySelector("tbody");
  const roles = Object.entries(rolesObject);
  const tableRoleRows = roles.map(makeRoleRow);

  tbody1.append(...tableRoleRows);
  popup.appendChild(table);

  setTimeout(() => {
    popup.remove();
  }, 10000);
};

const fetchRoles = () => fetch("/game/info").then((res) => res.json());

const main = async () => {
  const { roles } = await fetchRoles();
  renderPlayerInfo(roles);
  document
    .querySelector("#ticket-show")
    .addEventListener("click", renderPlayerTickets);
};

globalThis.onload = main;
