/** @namespace ty */
import { mat4, quat, vec3 } from "../lib/glmatrix.js";
import { transform } from "../math.js";

class ModelInstance {
  // 2026-04-30, Codex 5.3: validate model instance JSDoc types [53d8ac]
  /**
   * @param {import("./model_instanced_holder.js").default} holder
   * @param {number} index
   * @param {number} [layer=0]
   */
  constructor(holder, index, layer = 0) {
    this.holder = holder;
    this.index = index;
    this._layer = layer;
    this.matrix = mat4.create();
    this.position = vec3.create();
    this.rotation = quat.create();
    this.scale = vec3.fromValues(1, 1, 1);
  }

  /**
   * @returns {number}
   */
  get layer() {
    return this._layer;
  }

  /**
   * @param {number} i
   */
  set layer(i) {
    this._layer = i;
    this.holder.update_layer(this.index);
  }

  /**
   * @param {vec3} v .
   * @param {boolean} update_matrix .
   * @returns {ModelInstance} .
   */
  set_position(v, update_matrix = true) {
    this.position[0] = v[0];
    this.position[1] = v[1];
    this.position[2] = v[2];
    if (update_matrix) {
      this.update_matrix();
    }
    return this;
  }

  /**
   * @param {quat} v .
   * @param {boolean} update_matrix .
   * @returns {ModelInstance} .
   */
  set_rotation(v, update_matrix = true) {
    this.rotation[0] = v[0];
    this.rotation[1] = v[1];
    this.rotation[2] = v[2];
    this.rotation[3] = v[3];
    if (update_matrix) {
      this.update_matrix();
    }
    return this;
  }

  /**
   * @param {vec3} v .
   * @param {boolean} update_matrix .
   * @returns {ModelInstance} .
   */
  set_scale(v, update_matrix = true) {
    this.scale[0] = v[0];
    this.scale[1] = v[1];
    this.scale[2] = v[2];
    if (update_matrix) {
      this.update_matrix();
    }
    return this;
  }

  /**
   * @returns {ModelInstance}
   */
  update_matrix() {
    transform(this.matrix, this.position, this.rotation, this.scale);
    this.holder.update_matrix(this.index);
    return this;
  }
}

export default ModelInstance;
export { ModelInstance };
// 2026-04-30, Codex 5.3: validate model instance JSDoc types [53d8ac]
