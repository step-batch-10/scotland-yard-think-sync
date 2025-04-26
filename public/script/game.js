import { combineObjects } from "./game_utils.js";

const fetchJson = (route) => fetch(route).then((res) => res.json());

const fetchState = () => fetchJson("/game/state");
const fetchPossibleStations = () => fetchJson("/game/possible-stations");

const cloneTemplate = (targetId) => {
  const template = document.querySelector(targetId);
  return template.content.firstElementChild.cloneNode(true);
};

const mapRoleToColor = (role) => {
  const tokenColors = {
    Red: "Red",
    Yellow: "Magenta",
    Blue: "Blue",
    Green: "Green",
    Purple: "Purple",
    MrX: "Black",
  };

  return tokenColors[role];
};

const addTextContent = (values, cells) =>
  values.forEach((value, i) => (cells[i].textContent = value));

const playerStats = (trElement, [role, playerName, tickets, station]) => {
  const cells = trElement.querySelectorAll("td");
  const { Taxi, Bus, Metro } = tickets;
  const values = [mapRoleToColor(role), playerName, Taxi, Bus, Metro, station];

  addTextContent(values, cells);
  return trElement;
};

const mrXStats = (trElement, [role, playerName, tickets, station]) => {
  const cells = trElement.querySelectorAll("td");
  const { Taxi, Bus, Metro, Wild, ["2x"]: twox } = tickets;
  const values = [role, playerName, Taxi, Bus, Metro, Wild, twox, station];

  addTextContent(values, cells);
  return trElement;
};

const renderMrXTransportLog = (transports) => {
  const log = document.querySelectorAll(".transport-modes-log .log");

  transports.forEach((transport, index) => {
    const span = document.createElement("span");
    span.textContent = `${index}`;

    const icon = cloneTemplate(`#${transport}-icon`);
    icon.style.height = getComputedStyle(log[index]).height;
    icon.style.width = "5vw";
    icon.style.marginLeft = "10px";

    log[index].style.textAlign = "start";
    log[index].replaceChildren(span, icon);
  });
};

const renderMrxTickets = (stats) => {
  const mrXStatTable = document.querySelector(".mrX-stats table");
  const tbody = mrXStatTable.querySelector("tbody");
  const row = tbody.children;

  mrXStats(row[0], stats);
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
  pairs.forEach(([to]) => {
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
  removeAllContainers();
  removeListeners(pairs);
};

const createCard = ({ to, mode }, container) => {
  const card = document.createElement("div");
  const ticketType = mode === "Ferry" ? "Wild" : mode;
  card.id = ticketType;

  const icon = cloneTemplate(`#${ticketType}-icon`);
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

const renderTickets = (options, pairs) => (e) => {
  removeAllContainers();
  const cardsContainer = cloneTemplate("#ticket-hover-card");
  const closeBtn = cardsContainer.querySelector("#close-btn");
  const card = cardsContainer.querySelector(".card");
  const elements = options.map((option) => createCard(option, card));
  closeBtn.addEventListener("click", removeContainer);
  alignCard(cardsContainer, getDimensions(e.currentTarget));
  addListeners(elements, card, pairs);

  document.body.appendChild(cardsContainer);
};

const pairTicketToStation = (availableRoutes) => {
  const groupedRoutes = Object.groupBy(availableRoutes, ({ to }) => to);

  return Object.entries(groupedRoutes);
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
  const pairs = pairTicketToStation(possibleStation);

  pairs.forEach(([to, options]) => {
    const station = document.getElementById(`station-${to}`);
    station.onclick = renderTickets(options, pairs);
  });
};

const generateStationId = (station) => `#station-${station}`;

const movePawnToStation = (pawn, stationId) => {
  const tspan = document.querySelector(stationId);

  addCoordinate(pawn, tspan, 0, -45);

  return pawn;
};

const makePawn = (color) => {
  const pawn = cloneTemplate("#pawn");
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

  const banner = cloneTemplate("#winner-banner");
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

    if (data.isGameOver) return renderGameOver(data, intervalId);

    return playGame(data);
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

const main = () => {
  playAudio();
  startPolling();

  document.querySelector("#two-x").onclick = enable2X;
};

globalThis.onload = main;
