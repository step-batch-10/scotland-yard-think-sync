import { combineObjects } from "./game_utils.js";

const fetchJson = (route) => fetch(route).then((res) => res.json());

const fetchState = () => fetchJson("/game/state");
const fetchPossiblStations = () => fetchJson("/game/possible-stations");

const cloneTemplate = (targetId) => {
  const template = document.querySelector(targetId);
  return template.content.firstElementChild.cloneNode(true);
};

const playerStats = (trElement, [role, playerName, tickets, station]) => {
  const cells = trElement.querySelectorAll("td");

  cells[0].style.backgroundColor = role;
  cells[1].textContent = playerName;
  cells[2].textContent = tickets.Taxi;
  cells[3].textContent = tickets.Bus;
  cells[4].textContent = tickets.Metro;
  cells[5].textContent = station;

  return trElement;
};

const mrXStats = (trElement, [role, playerName, tickets, station]) => {
  const cells = trElement.querySelectorAll("td");

  cells[0].textContent = role;
  cells[1].textContent = playerName;
  cells[2].textContent = tickets.Taxi;
  cells[3].textContent = tickets.Bus;
  cells[4].textContent = tickets.Metro;
  cells[5].textContent = tickets.Wild;
  cells[6].textContent = tickets["2x"];
  cells[7].textContent = station;

  return trElement;
};

const renderMrxTickets = (stats) => {
  const mrXStatTable = document.querySelector(".mrX-stats table");
  const tbody = mrXStatTable.querySelector("tbody");
  const row = tbody.children;

  mrXStats(row[0], stats);
};

const renderPlayerTickets = (stats) => {
  const playerStatTable = document.querySelector(".player-stats");
  const tbody = playerStatTable.querySelector("tbody");
  const rows = tbody.children;

  renderMrxTickets(stats[0]);

  for (let index = 1; index < stats.length; index++) {
    playerStats(rows[index - 1], stats[index]);
  }
};

const addCoordinate = (pawn, station) => {
  const [x, y] = getDimensions(station);
  pawn.style.left = `${x}px`;
  pawn.style.top = `${y - 45}px`;
};

const alignCard = (cardsContainer, [x, y]) => {
  cardsContainer.style.position = "absolute";
  cardsContainer.style.left = `${x}px`;
  cardsContainer.style.top = `${y - 54}px`;
};

const getDimensions = (element) => {
  const scrollLeft =
    globalThis.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop =
    globalThis.pageYOffset || document.documentElement.scrollTop;
  const dimensions = element.getBoundingClientRect();

  const absoluteX = dimensions.left + scrollLeft;
  const absoluteY = dimensions.top + scrollTop;

  return [absoluteX, absoluteY];
};

const removeContainer = (e) => e.target.parentNode.remove();

const removeListners = (pairs) => {
  pairs.forEach(([to]) => {
    const station = document.getElementById(`station-${to}`);
    console.log(to);
    station.onclick = () => {};
  });
};

const ticketSelection = (to, elements, pairs) => (e) => {
  const type = e.target.id;
  fetch(`/game/move/${to}/ticket/${type}`);

  elements.forEach(({ clonedCard }) => {
    clonedCard.parentNode.parentNode.remove();
  });
  removeListners(pairs);
};

const createCard = ({ to, mode }) => {
  const card = document.createElement("div");
  card.id = mode;
  card.textContent = mode;

  return { clonedCard: card, to };
};

const addListners = (elements, card, pairs) => {
  elements.forEach(({ clonedCard, to }) => {
    clonedCard.addEventListener("click", ticketSelection(to, elements, pairs));
    card.appendChild(clonedCard);
  });
};

const renderTickets = (options, pairs) => (e) => {
  const cardsContainer = cloneTemplate("#ticket-hover-card");
  const closeBtn = cardsContainer.querySelector("#close-btn");
  const card = cardsContainer.querySelector(".card");
  const elements = options.map(createCard);

  closeBtn.onclick = removeContainer;
  alignCard(cardsContainer, getDimensions(e.currentTarget));
  addListners(elements, card, pairs);

  document.body.appendChild(cardsContainer);
};

const pairTicketToStaiton = (map) => {
  const pair = Object.groupBy(map, ({ to }) => to);
  return Object.entries(pair);
};

const showTickets = async () => {
  const possibleStation = await fetchPossiblStations();
  const pairs = pairTicketToStaiton(possibleStation);

  pairs.forEach(([to, options]) => {
    const station = document.getElementById(`station-${to}`);
    station.onclick = renderTickets(options, pairs);
  });
};

const generateStationId = (station) => `#station-${station}`;

const movePawnToStation = (pawn, stationId) => {
  const tspan = document.querySelector(stationId);

  addCoordinate(pawn, tspan);

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
  const color = player[0];
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

const createHighlighter = () => {
  const element = document.createElement("div");
  element.classList.add("highlight");

  return element;
};

const highlightPawn = (role) => {
  const pawn = document.querySelector(`#${role}`);

  const highlighter = createHighlighter();
  pawn.appendChild(highlighter);
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

const playGame = ({ tickets, positions, roles, currentRole, isYourTurn }) => {
  const stats = combineObjects(roles, tickets, positions);

  renderPlayerTickets(stats);
  renderPawns(stats);
  showTurn(currentRole, isYourTurn);

  if (isYourTurn) showTickets();
};

const startPolling = () => {
  const intervelId = setInterval(async () => {
    const data = await fetchState();

    if (data.isGameOver) return renderGameOver(data, intervelId);

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

const main = () => {
  playAudio();
  startPolling();
};

globalThis.onload = main;
