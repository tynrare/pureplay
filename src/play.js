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
    this.box = this._core.draw.model("box");
    this.box.set_position([0, 1.25, 0]);
    this.box.set_rotation([0, 0, 0, 1]);
    this.box.set_scale([1, 1, 1]);
    this.boxes = this._core.draw.model_instanced("box_instanced");
    this.box_timber = this._core.draw.model_instance("box_timber", this.boxes)?.set_position([-1.25, 0, 0]);
    this.box_floor_tiles = this._core.draw.model_instance("box_floor_tiles", this.boxes)?.set_position([0, 0, 0]);
    this.box_floor_wood = this._core.draw.model_instance("box_floor_wood", this.boxes)?.set_position([1.25, 0, 0]);
  }

  stop() {
  }

  step(dt) {
    this.boxes?.update();
    this.boxes?.draw();
    this.box?.update();
    this.box?.draw();
  }
}

export default Play;
