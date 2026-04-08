/** @namespace */

class App {
  constructor() {
    this.active = false;
  }

  init() {
    return this;
  }

  run() {
    this.active = true;
  }

  stop() {
    this.active = false;
  }

  step(dt) {
    if (!this.active) {
      return 1;
    }

    return 0;
  }
}

export default App;
