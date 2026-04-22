/** @namespace ty */
import Core from "./core.js";
import Play from "./play.js";
import logger from "./logger.js";

/**
 * @class Core
 * @memberof pp.core
 */
class App {
  constructor() {
    this.active = false;
    this.ready = false;
    this.core = new Core();
    this.play = new Play(this.core);
  }

  init() {
    this.active = false;
    this.ready = false;

    this.core.init();
    this.play.init();

    return this;
  }

  dispose() {
    this.core.dispose();
    this.play.dispose();
  }

  start() {
    this.core.start();
    this.active = true;
    this.ready = false;
  }

  pstart() {
    this.play.start();
    logger.log("PurePlay started");
  }

  stop() {
    this.core.stop();
    this.play.stop();
    this.active = false;
    this.ready = false;

  }

  step(dt) {
    if (!this.active) {
      return 1;
    }

    if (!this.ready && this.core.draw.ready) {
      this.ready = true;
      this.pstart();
    }

    if (!this.ready) {
      return 0;
    }

    this.core.step(dt);
    this.play.step(dt);

    return 0;
  }
}

export default App;
