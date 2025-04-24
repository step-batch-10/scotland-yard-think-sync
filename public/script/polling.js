class Polling {
  #intervalId;

  constructor(fn) {
    this.#intervalId = null;
    this.fn = fn;
  }

  start(data) {
    this.#intervalId = setInterval(fn, 3000, data);
  }

  stop() {
    clearInterval(this.#intervalId);
  }
}
