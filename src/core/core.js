/** @namespace ty */
import Render from "./render.js";
import Draw from "./draw.js";
import Assets from "./assets.js";
import DbList from "./db.js";

/**
 * @class Core
 * @memberof pp.core
 */
class Core {
  constructor() {
    this.active = false;
    this.render = new Render();
    this.db = new DbList(document.getElementById("app"), "#db_pp");
    this.assets = new Assets(this.db, this.render);
    this.draw = new Draw(this);
  }

  init() {
    this.render.init();
    this.db.start();
    this.draw.init();
    this.assets.init();
    return this;
  }

  dispose() {
    this.draw.dispose();
    this.assets.dispose();
    this.render.dispose();
  }

  start() {
    this.render.start();
    this.assets.start();
    this.draw.start();
    this.active = true;
  }

  stop() {
    this.active = false;
    this.draw.stop();
    this.assets.stop();
    this.db.stop();
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
