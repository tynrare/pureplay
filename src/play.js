/** @namespace ty */
import Core from "./core.js";

/**
 * @class Play
 * @memberof pp.play
 */
class Play {
  /**
   * @param {Core} core .
   */
  constructor(core) {
    this._core = core;
  }

  init() {
    return this;
  }

  start() {
    this.box = this._core.draw.box();
    this.box.dc.texture("tex", this._core.draw.texture);
  }

  stop() {
  }

  step(dt) {
    this.box.update();
    this.box.draw();
  }
}

export default Play;
