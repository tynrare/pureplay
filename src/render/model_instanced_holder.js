/** @namespace ty */
import Render from "../render.js";
import { PicoGL, PglApp, DrawCall, VertexArray, VertexBuffer } from "../lib/picogl.js";
import { createBox } from "../lib/pglutils.js";
import { mat4 } from "../lib/glmatrix.js";
import { transform } from "../math.js";
import Shader from "./shader.js";
import ModelInstance from "./model_instance.js";

class ModelInstancedHolder {
  constructor() {
    /** @type {VertexArray} */
    this.array = null;
    /** @type {DrawCall} */
    this.dc = null;
    /** @type {Render} */
    this._render = null;
    /** @type {Shader} */
    this._shader = null;
    this._texture_uniform = null;
    this._texture = null;
    this._texture_bound = false;
    this._bound_texture_ref = null;
    this._bound_texture_hash = -1;
    /** @type {ModelInstance[]} */
    this.instances = [];
    /** @type {VertexBuffer} */
    this._instance_matrices = null;
    /** @type {VertexBuffer} */
    this._instance_layers = null;
    this._instance_dirty = true;
    this._synced_instance_count = 0;
  }

  init(array) {
    this.array = array;
    this.dc = null;
    this.instances.length = 0;
    this._instance_dirty = true;
    this._synced_instance_count = 0;
    this._instance_matrices = null;
    this._instance_layers = null;
    return this;
  }

  start(render, shader) {
    this._render = render;
    this._shader = shader;
    this._ensure_drawcall();
  }

  stop() {
    this.dc = null;
    this._render = null;
    this._shader = null;
    this._texture_uniform = null;
    this._texture = null;
    this._texture_bound = false;
    this._bound_texture_ref = null;
    this._bound_texture_hash = -1;
    this.instances.length = 0;
    if (this._instance_matrices) {
      this._instance_matrices.delete();
      this._instance_matrices = null;
    }
    if (this._instance_layers) {
      this._instance_layers.delete();
      this._instance_layers = null;
    }
    this._instance_dirty = true;
    this._synced_instance_count = 0;
  }

  dispose() {
    this.stop();
    if (this.array) {
      this.array.delete();
      this.array = null;
    }
  }

  set_texture(uniform, texture) {
    this._texture_uniform = uniform;
    this._texture = texture;
    this._texture_bound = false;
    this._bound_texture_ref = null;
    this._bound_texture_hash = -1;
    this._ensure_texture_binding();
  }

  create_instance(layer = 0) {
    const instance = new ModelInstance(this, this.instances.length, layer);
    this.instances.push(instance);
    this._instance_dirty = true;
    this._synced_instance_count = 0;
    return instance;
  }

  update() {
    this._ensure_drawcall();
    if (!this.dc) {
      return;
    }
    if (this._instance_dirty || this._synced_instance_count !== this.instances.length) {
      this._sync_instances_full();
    }
    const texture_hash = this._texture?.version ?? 0;
    if (
      !this._texture_bound ||
      (this._texture && this._bound_texture_ref !== this._texture.texture) ||
      (this._texture && this._bound_texture_hash !== texture_hash)
    ) {
      this._ensure_texture_binding();
    }
  }

  draw() {
    if (!this.dc || this.instances.length === 0) {
      return;
    }
    this.dc.draw();
  }

  _sync_instances_full() {
    if (!this._render || this.instances.length === 0) {
      this._instance_dirty = false;
      this._synced_instance_count = this.instances.length;
      return;
    }

    const matrix_data = new Float32Array(this.instances.length * 16);
    const layer_data = new Float32Array(this.instances.length);
    for (let i = 0; i < this.instances.length; i++) {
      const instance = this.instances[i];
      transform(instance.matrix, instance.position, instance.rotation, instance.scale);
      matrix_data.set(instance.matrix, i * 16);
      layer_data[i] = instance.layer;
    }

    if (this._instance_matrices) {
      this._instance_matrices.delete();
    }
    if (this._instance_layers) {
      this._instance_layers.delete();
    }

    this._instance_matrices = this._render.pgl.createMatrixBuffer(PicoGL.FLOAT_MAT4, matrix_data, PicoGL.DYNAMIC_DRAW);
    this._instance_layers = this._render.pgl.createVertexBuffer(PicoGL.FLOAT, 1, layer_data, PicoGL.DYNAMIC_DRAW);

    this.array
      .instanceAttributeBuffer(3, this._instance_matrices)
      .instanceAttributeBuffer(7, this._instance_layers);

    this._instance_dirty = false;
    this._synced_instance_count = this.instances.length;
  }

  update_matrix(index) {
    if (
      index < 0 ||
      !this._render ||
      !this._instance_matrices ||
      this._synced_instance_count !== this.instances.length
    ) {
      return;
    }
    const instance = this.instances[index];
    if (!instance) {
      return;
    }
    transform(instance.matrix, instance.position, instance.rotation, instance.scale);
    this._instance_matrices.data(instance.matrix, index * 16 * 4);
  }

  update_layer(index) {
    if (
      index < 0 ||
      !this._render ||
      !this._instance_layers ||
      this._synced_instance_count !== this.instances.length
    ) {
      return;
    }
    const instance = this.instances[index];
    if (!instance) {
      return;
    }
    this._instance_layers.data(new Float32Array([instance.layer]), index * 4);
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
    const texture_hash = this._texture.version ?? 0;
    if (this._texture_bound && this._bound_texture_ref === texture_ref && this._bound_texture_hash === texture_hash) {
      return;
    }
    this.dc.texture(this._texture_uniform, texture_ref);
    this._texture_bound = true;
    this._bound_texture_ref = texture_ref;
    this._bound_texture_hash = texture_hash;
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
      .vertexAttributeBuffer(2, normals);

    return new ModelInstancedHolder().init(array);
  }

  /**
   * @param {PglApp} pgl .
   */
  static box(pgl, w = 1, h = 1, d = 1) {
    const box = createBox({ dimensions: [w, h, d] });
    const positions = pgl.createVertexBuffer(PicoGL.FLOAT, 3, box.positions);
    const uvs = pgl.createVertexBuffer(PicoGL.FLOAT, 2, box.uvs);
    const normals = pgl.createVertexBuffer(PicoGL.FLOAT, 3, box.normals);
    return ModelInstancedHolder.create(pgl, positions, uvs, normals);
  }
}

export default ModelInstancedHolder;
export { ModelInstancedHolder };
