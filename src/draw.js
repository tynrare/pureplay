/** @namespace ty */
import Render from "./render.js";
import Loader from "./loader.js";
import logger from "./logger.js";
import { PicoGL, PglApp, PglProgram, DrawCall, VertexBuffer, VertexArray } from "./lib/picogl.js";
import { basic_fs, basic_vs, model_fs, model_vs } from "./glsl/index.js";
import { createBox } from "./lib/pglutils.js";
import { mat4, vec3 } from "./lib/glmatrix.js";
import { transform } from "./math.js";

class Model {
  constructor() {
    /** @type {VertexArray} */
    this.array = null;
    /** @type {mat4} */
    this.matrix = null;
    /** @type {vec3} */
    this.position = null;
    /** @type {vec3} */
    this.rotation = null;
    /** @type {vec3} */
    this.scale = null;
    /** @type {DrawCall} */
    this.dc = null;
  }

  /**
   * @param {VertexArray} array .
   */
  init(array) {
    this.array = array;
    this.matrix = mat4.create();
    this.position = vec3.create();
    this.rotation = vec3.create();
    this.scale = vec3.create().set(1, 1, 1);

    return this;
  }

  dispose() {
    this.matrix = null;
    this.position = null;
    this.rotation = null;
    this.scale = null;
    this.array.delete();
    this.array = null;
  }

  /**
   * @param {Render} render .
   * @param {PglProgram} program .
   */
  start(render, program) {
    this.dc = render.pgl.createDrawCall(program, this.array);
    this.dc.uniformBlock("SceneUniforms", render.camera.uniforms);
  }

  stop() {
    this.dc = null;
  }

  update() {
    transform(this.matrix, this.position, this.rotation, this.scale);
    this.dc.uniform("uModel", this.matrix);
  }

  draw() {
    this.dc.draw();
  }

  /**
   * @param {PglApp} pgl .
   * @param {VertexBuffer} positions .
   * @param {VertexBuffer} uvs .
   * @param {VertexBuffer} normals .
   */
  static create(pgl, positions, uvs, normals) {
    const array = pgl.createVertexArray()
      .vertexAttributeBuffer(0, positions)
      .vertexAttributeBuffer(1, uvs)
      .vertexAttributeBuffer(2, normals)

    return new Model().init(array);
  }

  /**
   * @param {PglApp} pgl .
   */
  static box(pgl, w = 1, h = 1, d = 1) {
    const box = createBox({dimensions: [w, h, d]})
    const positions = pgl.createVertexBuffer(PicoGL.FLOAT, 3, box.positions);
    const uvs = pgl.createVertexBuffer(PicoGL.FLOAT, 2, box.uvs);
    const normals = pgl.createVertexBuffer(PicoGL.FLOAT, 3, box.normals);

    return Model.create(pgl, positions, uvs, normals);
  }
}

/**
 * @class Draw
 * @memberof pp.core
 */
class Draw {
  /**
   * @param {Render} render .
   */
  constructor(render) {
    this._render = render;
    this.active = false;
    this.ready = false;

    /** @type {Object<string, PglProgram>} */
    this.programs = {
      basic: null,
      model: null
    }
  }

  init() {
    this.active = false;
    this.ready = false;

    return this;
  }

  dispose() {
  }

  start() {
    const p1 = this._render.pgl.createPrograms([basic_vs, basic_fs], [model_vs, model_fs]).then(([basic, model])=>{
      this.programs.basic = basic;
      this.programs.model = model;

    });
    const p2 = Loader.instance.texture("res/tex_white.png").then((image) => {
      this.texture = this._render.pgl.createTexture2D(image);
    });
    Promise.all([p1, p2]).then(() => {
      this.ready = true;
      logger.log("PurePlay draw ready");
    });
    this.active = true;
  }

  stop() {
    this.active = false;
    this.ready = false;

    this.programs.basic.delete();
    this.programs.model.delete();
    this.programs.basic = null;
    this.programs.model = null;
  }

  step(dt) {
  }

  box(w = 1, h = 1, d = 1) {
    const box = Model.box(this._render.pgl, w, h, d);
    box.start(this._render, this.programs.model);

    return box;
  }
}

export default Draw;

export { Draw, Model }
