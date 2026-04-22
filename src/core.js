/** @namespace ty */
import Render from "./render.js";
import Draw from "./draw.js";

/**
 * @class Core
 * @memberof pp.core
 */
class Core {
  constructor() {
    this.active = false;
    this.render = new Render();
    this.draw = new Draw(this.render);
  }

  init() {
    this.render.init();
    this.draw.init();

    return this;
  }

  dispose() {
    this.draw.dispose();
    this.render.dispose();
  }

  start() {
    this.render.start();
    this.draw.start();
    this.active = true;
  }

  stop() {
    this.active = false;
    this.draw.stop();
    this.render.stop();
  }

  step(dt) {
    if (!this.active) {
      return 1;
    }

    this.render.step(dt);
    this.draw.step(dt);

    return 0;
  }
}

export default Core;
