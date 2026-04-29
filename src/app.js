/** @namespace ty */
import Core from "./core.js";
import Play from "./play.js";
import logger from "./logger.js";
import Loader from "./loader.js";

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

  async start() {
    this.core.start();
    this.active = true;

    await this.core.assets.preload(1);
    this.play.start();
    await this.core.assets.preload(2);
    this.ready = true;
    logger.log("PurePlay App started");
  }

  step(dt) {
    if (!this.active) {
      return 1;
    }

    this.core.step(dt);
    if (this.ready) {
      this.play.step(dt);
    }

    return 0;
  }
}

export default App;
