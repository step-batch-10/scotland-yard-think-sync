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
  cells[0].style.backgroundColor = mapRoleToColor(role);
  const values = ["", playerName, Taxi, Bus, Metro, station];
  values.forEach((value, i) => (cells[i].textContent = value));

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
  const scrollLeft = globalThis.pageXOffset ||
    document.documentElement.scrollLeft;
  const scrollTop = globalThis.pageYOffset ||
    document.documentElement.scrollTop;

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

  return { clonedCard: card, to };
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
  if (!nodes) return;

  nodes.forEach((node) => {
    document.body.removeChild(node);
  });
};

const highLightDestinations = (stations, role) => {
  deleteNodeBySelector(".highlight-station");

  stations.forEach(({ to }) => {
    const station = document.getElementById(`station-${to}`);
    const highlighter = createHighlighter("highlight-station", role);
    addCoordinate(highlighter, station, -8, -6);
    document.body.appendChild(highlighter);
  });
};

const showMessage = async () => {
  const { message } = await fetchJson(`/game/skip-move`);

  return alertUser(message, "#turn-indicator");
};

const displayTravelOptions = async (role) => {
  const possibleStation = await fetchPossibleStations();

  if (possibleStation.length === 0) return showMessage("skip");
  highLightDestinations(possibleStation, role);

  const stations = possibleStation.map(({ to }) => to);
  possibleStation.forEach(({ to, tickets }) => {
    const station = document.getElementById(`station-${to}`);
    station.onclick = renderTickets(tickets, to, stations);
  });
};

const generateStationId = (station) => `#station-${station}`;

const movePawnToStation = (pawn, stationId) => {
  const tspan = document.querySelector(stationId);

  addCoordinate(pawn, tspan, -6, -70);
  return pawn;
};

const changeColor = (elements, color) =>
  elements.forEach((e) => (e.style.fill = color));

const makePawn = (color) => {
  const pawn = cloneTemplate("pawn");
  const rects = pawn.querySelectorAll(".body-parts rect");
  pawn.id = color;
  changeColor(rects, color);

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

const createHighlighter = (className, role) => {
  const element = document.createElement("div");
  element.classList.add(className);
  const color = mapRoleToColor(role);
  element.style.boxShadow = `0 0 2px 1px ${color}`;

  return element;
};

const highlightPawn = (role) => {
  const color = mapRoleToColor(role);
  const pawn = document.querySelector(`#${color}`);
  document.getElementById("turn-indicator").style.backgroundColor = color;

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

const blurPawnsAndSideBar = () => {
  document.querySelector(".side-bar").style.filter = "blur(10px)";
  const pawns = document.querySelectorAll(".pawn");
  pawns.forEach((pawn) => {
    pawn.style.filter = "blur(10px)";
  });
};

const renderGameOver = ({ winner }) => {
  blurPawnsAndSideBar();
  const banner = cloneTemplate("winner-banner");
  banner.querySelector("h4").textContent = winningMessage(winner);
  const prevBanner = document.querySelector(".banner");
  prevBanner?.remove();
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

  if (isYourTurn) displayTravelOptions(currentRole);
};

const autoFocus = (stationId) => {
  const element = document.querySelector(`#station-${stationId}`);

  element.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "center",
  });
};

const startPolling = () => {
  let previousPlayerPosition = null;

  const intervalId = setInterval(async () => {
    const data = await fetchState();

    if (!data.isGameOver) playGame(data);

    const currentPlayerPosition = data.positions[data.currentRole];

    if (previousPlayerPosition !== currentPlayerPosition) {
      previousPlayerPosition = currentPlayerPosition;
      autoFocus(currentPlayerPosition);
    }

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
      { once: true },
    );
  });
};

const alertMessage = (msg, color = "black") => {
  const container = cloneTemplate("alert-msg");
  container.querySelector("p").textContent = msg;
  container.style.backgroundColor = color;

  document.body.append(container);
  setTimeout(() => {
    container.remove();
  }, 3000);
};

const enable2X = async () => {
  const response = await fetch("/game/enable-2x");
  const json = await response.json();

  const msg = json.accepted ? "You are in 2x mode" : "Your 2X is rejected";
  alertMessage(msg);
};

const main = () => {
  playAudio();
  startPolling();

  document.querySelector("#two-x").onclick = enable2X;
};

globalThis.onload = main;
