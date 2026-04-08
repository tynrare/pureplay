/** @namespace ty */

/**
 * @class Core
 * @memberof pp.core
 */
class Core {
  constructor() {
    this.active = false;
  }

  init() {
    return this;
  }

  start() {
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

export default Core;
