import { combineObjects } from "./game_utils.js";

const fetchJson = (route) => fetch(route).then((res) => res.json());

const fetchState = () => fetchJson("/game/state");
const fetchPossibleStations = () => fetchJson("/game/possible-stations");

const cloneTemplate = (targetId) => {
  const template = document.getElementById(targetId);
  return template.content.firstElementChild.cloneNode(true);
};

const mapRoleToColor = (role) => {
  const tokenColors = {
    Red: "Red",
    Yellow: "Goldenrod",
    Blue: "Blue",
    Green: "Green",
    Purple: "Purple",
    MrX: "Black",
  };

  return tokenColors[role];
};

const playerStats = (trElement, [role, playerName, tickets, station]) => {
  const cells = trElement.querySelectorAll("td");
  const { Taxi, Bus, Metro } = tickets;
  const values = ["", playerName, Taxi, Bus, Metro, station];
  values.forEach((value, i) => (cells[i].textContent = value));
  cells[0].style.backgroundColor = mapRoleToColor(role);

  return trElement;
};

const removeTag = (id) => {
  const tag = document.getElementById(id);
  if (tag) tag.remove();
};

const mrXStats = (ticketsTag, [playerName, tickets, station]) => {
  const keys = Object.keys(tickets);

  keys.forEach((key, index) => {
    const svg = cloneTemplate(`${key}-icon`);
    removeTag(`${key}`);
    ticketsTag[index].appendChild(svg);
    const count = ticketsTag[index].querySelector(".count");
    count.textContent = tickets[key];
  });

  document.getElementById("last-seen").textContent = station;
  document.querySelector("#bio p").textContent = playerName;
  return ticketsTag;
};

const renderMrXTransportLog = (transports) => {
  const log = document.querySelectorAll(".transport-modes-log .log");

  transports.forEach((transport, index) => {
    const span = document.createElement("span");
    span.textContent = `${index + 1}`;
    span.classList.add("log-text");

    const icon = cloneTemplate(`${transport}-icon`);
    icon.style.height = getComputedStyle(log[index]).height;
    icon.style.width = "5vw";
    icon.style.marginLeft = "10px";

    log[index].style.textAlign = "start";
    log[index].replaceChildren(span, icon);
  });
};

const renderMrxTickets = (stats) => {
  const mrXStatTable = document.querySelector(".mrX-stats #types");
  const tickets = mrXStatTable.querySelectorAll(".ticket");

  mrXStats(tickets, stats.slice(1));
};

const renderPlayerTickets = (stats, lastSeen) => {
  const playerStatTable = document.querySelector(".player-stats");
  const tbody = playerStatTable.querySelector("tbody");
  const rows = tbody.children;
  const mrXStat = stats[0];
  mrXStat[3] = lastSeen;

  renderMrxTickets(mrXStat);

  for (let index = 1; index < stats.length; index++) {
    playerStats(rows[index - 1], stats[index]);
  }
};

const addCoordinate = (element, station, offSetX = 0, offSetY = 0) => {
  const [x, y] = getDimensions(station);
  element.style.left = `${x + offSetX}px`;
  element.style.top = `${y + offSetY}px`;
};

const alignCard = (cardsContainer, [x, y]) => {
  cardsContainer.style.position = "absolute";
  cardsContainer.style.left = `${x - 24}px`;
  cardsContainer.style.top = `${y - 54}px`;
};

const getDimensions = (element) => {
  const scrollLeft =
    globalThis.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop =
    globalThis.pageYOffset || document.documentElement.scrollTop;

  const { left, top } = element.getBoundingClientRect();
  return [scrollLeft + left, scrollTop + top];
};

const removeContainer = (e) => e.target.parentNode.parentNode.remove();

const removeListeners = (pairs) => {
  pairs.forEach((to) => {
    const station = document.getElementById(`station-${to}`);
    deleteNodeBySelector(".highlight-station");
    station.onclick = () => {};
  });
};

const removeAllContainers = () => {
  const containers = document.querySelectorAll(".cards-container");
  containers.forEach((container) => container.remove());
};

const ticketSelection = (to, elements, pairs) => (e) => {
  const element = e.target.closest("svg");
  const type = element.id;
  fetch(`/game/move/${to}/ticket/${type}`);

  elements.forEach(({ clonedCard }) => {
    clonedCard.parentNode.parentNode.remove();
  });

  startPolling();
  removeAllContainers();
  removeListeners(pairs);
};

const createCard = (ticket, to, container) => {
  const card = document.createElement("div");
  card.id = ticket;

  const icon = cloneTemplate(`${ticket}-icon`);
  icon.style.height = getComputedStyle(container).height;
  icon.style.width = "1.5vw";

  card.append(icon);

  return { clonedCard: card, to: to };
};

const addListeners = (elements, card, pairs) => {
  elements.forEach(({ clonedCard, to }) => {
    clonedCard.addEventListener("click", ticketSelection(to, elements, pairs));
    card.appendChild(clonedCard);
  });
};

const renderTickets = (tickets, to, stations) => (e) => {
  removeAllContainers();
  const cardsContainer = cloneTemplate("ticket-hover-card");
  const closeBtn = cardsContainer.querySelector("#close-btn");
  const card = cardsContainer.querySelector(".card");

  const elements = tickets.map((ticket) => createCard(ticket, to, card));

  closeBtn.addEventListener("click", removeContainer);
  alignCard(cardsContainer, getDimensions(e.currentTarget));
  addListeners(elements, card, stations);

  document.body.appendChild(cardsContainer);
};

const deleteNodeBySelector = (selector) => {
  const nodes = document.querySelectorAll(selector);
  if (nodes) {
    nodes.forEach((node) => {
      document.body.removeChild(node);
    });
  }
};

const highLightDestinations = (stations) => {
  deleteNodeBySelector(".highlight-station");

  stations.forEach(({ to }) => {
    const station = document.getElementById(`station-${to}`);
    const highlighter = createHighlighter("highlight-station");
    addCoordinate(highlighter, station, -8, -6);
    document.body.appendChild(highlighter);
  });
};

const showMessage = async () => {
  const { message } = await fetchJson(`/game/skip-move`);

  return alertUser(message, "#turn-indicator");
};

const displayTravelOptions = async () => {
  const possibleStation = await fetchPossibleStations();

  if (possibleStation.length === 0) return showMessage("skip");
  highLightDestinations(possibleStation);

  const stations = possibleStation.map(({ to }) => to);
  possibleStation.forEach(({ to, tickets }) => {
    const station = document.getElementById(`station-${to}`);
    station.onclick = renderTickets(tickets, to, stations);
  });
};

const generateStationId = (station) => `#station-${station}`;

const movePawnToStation = (pawn, stationId) => {
  const tspan = document.querySelector(stationId);

  addCoordinate(pawn, tspan, 0, -45);

  return pawn;
};

const makePawn = (color) => {
  const pawn = cloneTemplate("pawn");
  const bodyParts = pawn.querySelectorAll(".body-parts");
  pawn.id = color;

  bodyParts.forEach((part) => {
    part.setAttribute("fill", color);
  });

  return pawn;
};

const createPawn = (player) => {
  const position = player.at(-1);
  const stationId = generateStationId(position);
  const color = mapRoleToColor(player[0]);
  const pawn = makePawn(color);

  return movePawnToStation(pawn, stationId, color);
};

const renderPawns = (stats) => {
  const root = document.querySelector("#pawns-display");
  const pawns = stats.map(createPawn);

  root.replaceChildren(...pawns);
};

const alertUser = (msg, id) => {
  const turnIndicator = document.querySelector(id);
  turnIndicator.textContent = msg;
};

const createHighlighter = (className) => {
  const element = document.createElement("div");
  element.classList.add(className);

  return element;
};

const highlightPawn = (role) => {
  const color = mapRoleToColor(role);
  const pawn = document.querySelector(`#${color}`);

  if (!pawn) return;
  pawn.classList.add("highlight-pawn");
};

const showTurn = (currentRole, isYourTurn) => {
  const turn = isYourTurn ? "Your Turn" : `${currentRole}'s Turn`;

  alertUser(turn, "#turn-indicator");
  highlightPawn(currentRole);
};

const winningMessage = (winner) =>
  winner === "MrX" ? "Mr. X is the winner" : "Detectives are the winner";

const renderGameOver = ({ winner }, id) => {
  clearInterval(id);

  const banner = cloneTemplate("winner-banner");
  banner.querySelector("h4").textContent = winningMessage(winner);
  document.body.appendChild(banner);
};

const render2XTicket = ({ MrX }, currentRole, isYourTurn) => {
  const enableButton = document.querySelector("#two-x");
  const shouldEnable = currentRole === "MrX" && isYourTurn && MrX["2x"];

  enableButton.style.display = shouldEnable ? "block" : "none";
};

const playGame = (data) => {
  const {
    tickets,
    positions,
    roles,
    currentRole,
    isYourTurn,
    lastSeen,
    transport,
  } = data;

  const stats = combineObjects(roles, tickets, positions);
  const detectivesStat = stats.filter((stat) => stat[3]);

  renderPawns(detectivesStat);
  renderPlayerTickets(stats, lastSeen);
  showTurn(currentRole, isYourTurn);

  renderMrXTransportLog(transport);

  render2XTicket(tickets, currentRole, isYourTurn);

  if (isYourTurn) displayTravelOptions();
};

const startPolling = () => {
  const intervalId = setInterval(async () => {
    const data = await fetchState();
    playGame(data);

    if (data.isGameOver) {
      renderGameOver(data);
      clearInterval(intervalId);
    }
  }, 3000);
};

const playAudio = () => {
  const bgAudio = new Audio("/assets/audio/theme-song.mp3");

  bgAudio.autoplay = true;
  bgAudio.loop = true;
  bgAudio.volume = 0.5;

  bgAudio.play().catch(() => {
    document.addEventListener(
      "click",
      () => {
        bgAudio.play();
      },
      { once: true }
    );
  });
};

const enable2X = async () => {
  const response = await fetch("/game/enable-2x");
  const json = await response.json();

  if (json.accepted) alert("you are in 2x mode");
};

const handleZoom = () => {
  const panZoomInstance = svgPanZoom("#svg1", {
    zoomEnabled: true,
    controlIconsEnabled: false,
    fit: true,
    center: true,
    minZoom: 1,
    maxZoom: 10,
    contain: "inside",
    zoomScaleSensitivity: 0.15,
    panEnabled: true,
    dblClickZoomEnabled: false,
  });

  const sizes = panZoomInstance.getSizes();
  const realZoom = sizes.width / sizes.viewBox.width;
  panZoomInstance.setMinZoom(realZoom);
  panZoomInstance.fit();
  panZoomInstance.center();

  document.getElementById("zoom-in").addEventListener("click", function () {
    panZoomInstance.zoomIn();
  });

  document.getElementById("zoom-out").addEventListener("click", function () {
    panZoomInstance.zoomOut();
  });

  document.getElementById("reset").addEventListener("click", function () {
    panZoomInstance.resetZoom();
    panZoomInstance.center();
  });
};

const main = () => {
  playAudio();
  startPolling();

  document.querySelector("#two-x").onclick = enable2X;
};

globalThis.addEventListener("load", main);
globalThis.addEventListener("load", handleZoom);
