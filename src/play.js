/** @namespace ty */
import Core from "./core.js";
import { mat4, vec3 } from "./lib/glmatrix.js";
import { v3up } from "./math.js";

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
    this._orbit_time = 0;
    this._orbit_radius = 2.75;
    this._orbit_height = 1.35;
    this._orbit_speed = 0.8;
    this._orbit_position = vec3.create();
  }

  /**
   * @returns {Play}
   */
  init() {
    return this;
  }

  /**
   * @returns {void}
   */
  start() {
    this.box = this._core.draw.model("box");
    this.box.set_position([0, 1.25, 0]);
    this.box.set_rotation([0, 0, 0, 1]);
    this.box.set_scale([1, 1, 1]);
    this.boxes = this._core.draw.model_instanced("box_instanced");
    this.box_timber = this._core.draw.model_instance("box_timber", this.boxes)?.set_position([0, 0, -1.25]);
    this.box_floor_tiles = this._core.draw.model_instance("box_floor_tiles", this.boxes)?.set_position([-1.25, 0, 0]);
    this.box_floor_wood = this._core.draw.model_instance("box_floor_wood", this.boxes)?.set_position([1.25, 0, 0]);
  }

  /**
   * @returns {void}
   */
  stop() {
  }

  /**
   * @param {number} dt
   * @returns {void}
   */
  step(dt) {
    this._update_camera_orbit(dt);
    this.boxes?.update();
    this.boxes?.draw();
    this.box?.update();
    this.box?.draw();
  }

  // 2026-04-30, Codex 5.3: validate play function JSDoc types [e71ac0]
  /**
   * @param {number} dt
   * @returns {void}
   */
  _update_camera_orbit(dt) {
    const camera = this._core?.render?.camera;
    if (!camera?.position || !camera?.target || !camera?.view || !camera?.uniforms) {
      return;
    }

    this._orbit_time += dt * this._orbit_speed;
    const x = Math.cos(this._orbit_time) * this._orbit_radius;
    const z = Math.sin(this._orbit_time) * this._orbit_radius;
    // 2026-04-30, Codex 5.3: animate camera orbit each frame [c0a9d2]
    vec3.set(this._orbit_position, x, this._orbit_height, z);
    vec3.copy(camera.position, this._orbit_position);
    mat4.lookAt(camera.view, camera.position, camera.target, v3up);
    camera.update();
  }
}

export default Play;
// 2026-04-30, Codex 5.3: animate camera orbit each frame [c0a9d2]
// 2026-04-30, Codex 5.3: validate play function JSDoc types [e71ac0]
