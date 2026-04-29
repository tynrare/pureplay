/** @namespace ty */
import { PicoGL, PglApp, UniformBuffer } from "./lib/picogl.js";
import logger from "./logger.js";
import { mat4, vec3 } from "./lib/glmatrix.js";
import { v3up } from "./math.js";

/**
 * @class Camera
 * @memberof pp.core
 */
class Camera {
  constructor() {
    /** @type {mat4} */
    this.projection = null;
    /** @type {mat4} */
    this.view = null;
    /** @type {mat4} */
    this.matrix = null;
    /** @type {vec3} */
    this.position = null;
    /** @type {vec3} */
    this.target = null;
    /** @type {UniformBuffer} */
    this.uniforms = null;
  }

  init() {
    this.projection = mat4.create();
    this.view = mat4.create();
    this.matrix = mat4.create();
    this.position = vec3.fromValues(1, 1, 1);
    this.target = vec3.fromValues(0, 0, 0);
    mat4.lookAt(this.view, this.position, this.target, v3up);
  }

  dispose() {
    this.projection = null;
    this.view = null;
    this.position = null;
    this.target = null;
  }

  /**
   * @param {PglApp} pgl .
   */
  start(pgl) {
    this.uniforms = pgl.createUniformBuffer([
      PicoGL.FLOAT_MAT4,
      PicoGL.FLOAT_VEC4,
    ]);
  }

  stop() {}

  perspective(w, h) {
    mat4.perspective(this.projection, Math.PI / 2, w / h, 0.1, 10.0);
  }

  update() {
    mat4.multiply(this.matrix, this.projection, this.view);

    this.uniforms.set(0, this.matrix).set(1, this.position).update();
  }
}

/**
 * @class Render
 * @memberof pp.core
 */
class Render {
  constructor() {
    /** @type {PglApp} */
    this.pgl = null;

    /** @type {HTMLCanvasElement} */
    this.canvas = null;

    /** @type {Camera} */
    this.camera = new Camera();

    this.scale = 1;
    this._width = 1;
    this._height = 1;
  }

  init() {
    this.camera.init();

    return this;
  }

  dispose() {
    this.camera.dispose();
  }

  start() {
    this.canvas = document.getElementById("canvas_pp");
    this.pgl = PicoGL.createApp(this.canvas);
    this.pgl.clearColor(0, 1, 1, 1);
    this.pgl.enable(PicoGL.DEPTH_TEST);
    this.camera.start(this.pgl);
    this.equalizer();

    logger.log("PicoGL render started");
  }

  stop() {
    this.camera.stop();
    this.pgl = null;
  }

  step(dt) {
    this.equalizer();
    this.pgl.clear();
  }

  equalizer() {
    const rw = document.body.clientWidth;
    const rh = document.body.clientHeight;

    if (rw != this._width || rh != this._height) {
      this._width = rw;
      this._height = rh;

      this.pgl.resize(this.width, this.height);
      this.camera.perspective(this.width, this.height);
      this.camera.update();
    }
  }

  get width() {
    return this._width * this.scale;
  }

  get height() {
    return this._height * this.scale;
  }
}

export default Render;
