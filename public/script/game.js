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
  console.dir(popup);
};

const main = () => {
  const roles = {
    "Blue": "akshay",
    "Red": "Bhagya",
    "Green": "Siddhi",
    "Mr.X": "Athul",
    "Purple": "Suman"
  };

  renderRoles(roles);
};

globalThis.onload = main;
