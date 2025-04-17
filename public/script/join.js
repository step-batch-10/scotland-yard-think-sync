const alertUser = (msg) => alert(msg);
const redirectTo = (loc) => (globalThis.location = loc);

const handleSubmit = async (event) => {
  event.preventDefault();

  const body = new FormData(event.target);
  const response = await fetch("/setup/join-room", {
    method: "POST",
    body,
  });

  const { isJoined, message, location } = await response.json();

  if (!isJoined) return alertUser(message);

  redirectTo(location);
};

const main = () => {
  document.querySelector("form").addEventListener("submit", handleSubmit);
};

globalThis.onload = main;
