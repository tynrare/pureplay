/** @namespace ty */
import Render from "./render.js";
import logger from "./logger.js";
import Model from "./render/model.js";
import ModelInstancedHolder from "./render/model_instanced_holder.js";

/**
 * @class Draw
 * @memberof pp.core
 */
class Draw {
  /**
  * @param {Object} core .
   */
  constructor(core) {
    this._core = core;
    this._render = core.render;
    this._assets = core.assets;
    this.active = false;
    this.texture = null;
  }

  init() {
    this.active = false;

    return this;
  }

  dispose() {
  }

  start() {
    this.active = true;
  }

  stop() {
    this.active = false;
  }

  step(dt) {
  }

  model(name) {
    const conf = this._core.db.get("models").getconfig(name);
    if (!conf) {
      logger.error(`Draw::model config not found: ${name}`);
      return null;
    }

    let model = null;
    const type = conf["type"];
    if (type === "box") {
      const w = conf["w"] ?? 1;
      const h = conf["h"] ?? 1;
      const d = conf["d"] ?? 1;
      model = Model.box(this._render.pgl, w, h, d);
    }

    if (!model) {
      logger.error(`Draw::model unsupported type: ${type}`);
      return null;
    }

    const shader_name = conf["shader"];
    const shader = this._assets.shader(shader_name);
    if (!shader) {
      logger.error(`Draw::model shader not found: ${shader_name}`);
      return null;
    }
    model.start(this._render, shader);
    const texture_name = conf["texture"];
    if (texture_name) {
      const texture = this._assets.texture(texture_name);
      model.set_texture("tex", texture);
    }
    return model;
  }

  model_instanced(name) {
    const conf = this._core.db.get("models_instanced")?.getconfig(name);
    if (!conf) {
      logger.error(`Draw::model_instanced config not found: ${name}`);
      return null;
    }

    let holder = null;
    const type = conf["type"];
    if (type === "box") {
      const w = conf["w"] ?? 1;
      const h = conf["h"] ?? 1;
      const d = conf["d"] ?? 1;
      holder = ModelInstancedHolder.box(this._render.pgl, w, h, d);
    }

    if (!holder) {
      logger.error(`Draw::model_instanced unsupported type: ${type}`);
      return null;
    }

    const shader_name = conf["shader"];
    const shader = this._assets.shader(shader_name);
    if (!shader) {
      logger.error(`Draw::model_instanced shader not found: ${shader_name}`);
      return null;
    }
    holder.start(this._render, shader);

    const texture_array_name = conf["texture_array"];
    if (texture_array_name) {
      const texture = this._assets.texture_array(texture_array_name);
      holder.set_texture("tex", texture);
    }

    return holder;
  }

  model_instance(name, holder = null) {
    const conf = this._core.db.get("models").getconfig(name);
    if (!conf) {
      logger.error(`Draw::model_instance config not found: ${name}`);
      return null;
    }

    const template_name = conf["instanceof"];
    if (!template_name) {
      logger.error(`Draw::model_instance missing instanceof for ${name}`);
      return null;
    }
    const instance_holder = holder ?? this.model_instanced(template_name);
    if (!instance_holder) {
      return null;
    }

    const texture_layer = conf["texture_layer"] ?? 0;
    return instance_holder.create_instance(texture_layer);
  }
}

export default Draw;

export { Draw, Model, ModelInstancedHolder }
