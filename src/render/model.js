/** @namespace ty */
import Render from "../render.js";
import { PicoGL, PglApp, DrawCall, VertexBuffer, VertexArray } from "../lib/picogl.js";
import { createBox } from "../lib/pglutils.js";
import { mat4, vec3 } from "../lib/glmatrix.js";
import { transform } from "../math.js";
import Shader from "./shader.js";
import Texture from "./texture.js";

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
    /** @type {Render} */
    this._render = null;
    /** @type {Shader} */
    this._shader = null;
    /** @type {Texture} */
    this._texture = null;
    this._texture_uniform = null;
    this._texture_bound = false;
    this._bound_texture_ref = null;
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
   * @param {Shader} shader .
   */
  start(render, shader) {
    this._render = render;
    this._shader = shader;
    this._ensure_drawcall();
  }

  stop() {
    this.dc = null;
    this._render = null;
    this._shader = null;
    this._texture = null;
    this._texture_uniform = null;
    this._texture_bound = false;
    this._bound_texture_ref = null;
  }

  set_texture(uniform, texture) {
    this._texture_uniform = uniform;
    this._texture = texture;
    this._texture_bound = false;
    this._bound_texture_ref = null;
    this._ensure_texture_binding();
  }

  update() {
    this._ensure_drawcall();
    if (!this._texture_bound || (this._texture && this._bound_texture_ref !== this._texture.texture)) {
      this._ensure_texture_binding();
    }
    if (!this.dc) {
      return;
    }
    transform(this.matrix, this.position, this.rotation, this.scale);
    this.dc.uniform("uModel", this.matrix);
  }

  draw() {
    if (!this.dc) {
      return;
    }
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

  _ensure_drawcall() {
    if (this.dc || !this._render || !this._shader || !this._shader.ready || !this._shader.program) {
      return;
    }
    this.dc = this._render.pgl.createDrawCall(this._shader.program, this.array);
    this.dc.uniformBlock("SceneUniforms", this._render.camera.uniforms);
    this._ensure_texture_binding();
  }

  _ensure_texture_binding() {
    if (
      !this.dc ||
      !this._texture_uniform ||
      !this._texture ||
      !this._texture.texture
    ) {
      return;
    }
    const texture_ref = this._texture.texture;
    if (this._texture_bound && this._bound_texture_ref === texture_ref) {
      return;
    }
    this.dc.texture(this._texture_uniform, texture_ref);
    this._texture_bound = true;
    this._bound_texture_ref = texture_ref;
  }
}

export default Model;
export { Model };
