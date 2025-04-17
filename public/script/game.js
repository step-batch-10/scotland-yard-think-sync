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

const makeTicketRow = (data) => {
  const trElement = cloneTemplate("#ticket-row");
  const rows = trElement.querySelectorAll("td");

  rows[0].textContent = data[0];
  rows[1].textContent = data[1].Taxi;
  rows[2].textContent = data[1].Bus;
  rows[3].textContent = data[1].Metro;
  rows[4].textContent = data[1].All;
  rows[5].textContent = data[1]["2x"];

  return trElement;
};

const renderPlayerInfo = (rolesObject, ticketsObject) => {
  const table = cloneTemplate("#roles-table");
  const popup = document.querySelector("#pop-up");

  const popup1 = table.querySelector(".pop-up-1");
  const popup2 = table.querySelector(".pop-up-2");

  const tbody1 = popup1.querySelector("tbody");
  const tbody2 = popup2.querySelector("tbody");

  const roles = Object.entries(rolesObject);
  const tickets = Object.entries(ticketsObject);
  const tableRoleRows = roles.map(makeRoleRow);
  const tableTicketRows = tickets.map(makeTicketRow);

  tbody1.append(...tableRoleRows);
  tbody2.append(...tableTicketRows);
  popup.appendChild(table);
  console.log(popup, table, tbody1, tbody2);

  setTimeout(() => {
    popup.remove();
  }, 10000);
};

const fetchRoles = () => fetch("/game/info").then((res) => res.json());

const main = async () => {
  const { roles, tickets } = await fetchRoles();
  renderPlayerInfo(roles, tickets);
};

globalThis.onload = main;
