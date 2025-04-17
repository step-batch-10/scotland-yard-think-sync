const cloneTemplate = (targetId) => {
  const template = document.querySelector(targetId);
  return template.content.firstElementChild.cloneNode(true);
};

const makeRow = (data) => {
  const trElement = cloneTemplate("#role-row");
  const rows = trElement.querySelectorAll("td");

  for (const index in data) {
    rows[index].textContent = data[index];
  }

  return trElement;
};

const renderRoles = (rolesObject) => {
  const popup = document.querySelector("#pop-up");

  const table = cloneTemplate("#roles-table");
  const tbody = table.querySelector("tbody");

  const roles = Object.entries(rolesObject);
  const tableRows = roles.map(makeRow);

  tbody.append(...tableRows);
  popup.appendChild(table);

  setTimeout(() => {
    popup.remove();
  }, 10000);
};

const renderTickets = (tickets) => {
  console.log(tickets);
};

const fetchRoles = () => fetch("/game/info").then((res) => res.json());

const main = async () => {
  const { roles, tickets } = await fetchRoles();
  renderRoles(roles);
  renderTickets(tickets);
};

globalThis.onload = main;
