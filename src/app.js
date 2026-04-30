/** @namespace ty */
import Core from "./core.js";
import Play from "./play.js";
import logger from "./logger.js";
import Loader from "./loader.js";

/**
 * @class App
 * @memberof pp.app
 */
class App {
  // 2026-04-30, Codex 5.3: validate app function JSDoc types [b3f91e]
  /**
   * @constructor
   */
  constructor() {
    this.active = false;
    this.ready = false;
    this.core = new Core();
    this.play = new Play(this.core);
  }

  /**
   * @returns {App}
   */
  init() {
    this.active = false;
    this.ready = false;

    this.core.init();
    this.play.init();

    return this;
  }

  /**
   * @returns {void}
   */
  dispose() {
    this.core.dispose();
    this.play.dispose();
  }

  /**
   * @returns {Promise<void>}
   */
  async start() {
    this.core.start();
    this.active = true;

    await this.core.assets.preload(1);
    await this.core.assets.preload(2);
    this.play.start();
    this.ready = true;
    logger.log("PurePlay App started");
  }

  /**
   * @param {number} dt
   * @returns {number}
   */
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
// 2026-04-30, Codex 5.3: validate app function JSDoc types [b3f91e]
