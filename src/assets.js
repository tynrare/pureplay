/** @namespace ty */

import Render from "./render.js";
import Loader from "./loader.js";
import logger from "./logger.js";
import { DbList } from "./db.js";
import Shader from "./render/shader.js";
import Texture from "./render/texture.js";

/**
 * @class Assets
 * @memberof pp.core
 */
class Assets {
    /**
     * 
     * @param {DbList} db 
     * @param {Render} render 
     */
  constructor(db, render) {
    this._db = db;
    this._render = render;
    /** @type {Map<string, any>} */
    this.filecache = new Map();
    /** @type {Map<string, Shader>} */
    this.shadercache = new Map();
    /** @type {Map<string, Texture>} */
    this.texturecache = new Map();
  }

  init() {
    return this;
  }
  
  dispose() {
    for (const shader of this.shadercache.values()) {
      shader.stop();
    }
    for (const texture of this.texturecache.values()) {
      texture.stop();
    }
    this.shadercache.clear();
    this.texturecache.clear();
    return this;
  }

  start() {
    return this;
  }

  stop() {
    for (const shader of this.shadercache.values()) {
      shader.stop();
    }
    for (const texture of this.texturecache.values()) {
      texture.stop();
    }
    return this;
  }

  async preload(level) {
    logger.log(`Assets::preload l${level}.`);
    const files = this._db.get("files");
    const filelist = files.getkeys();
    const queue = [];
    const names = [];
    for (const file of filelist) {
      const conf = files.getconfig(file);
      const file_level = conf["preload"] ?? 999;
      if (file_level > level || this.filecache.has(file)) {
        continue;
      }
      const p = this.load_file(conf);
      queue.push(p);
      names.push(conf["name"]);
    }

    await Promise.all(queue);

    const wasntload = [];
    for (const i in names) {
      const n = names[i];
      if (!this.filecache.has(n)) {
        wasntload.push(n);
      }
    }

    if (wasntload.length) {
      logger.error(`Assets:: preload failed for: ${wasntload.toString()}`);
    }

    logger.log(`Assets::preload l${level} done.`);
  }

  /**
   * @param {Object} conf
   * @param {string} conf.path .
   * @param {string} conf.name .
   * @param {boolean?} conf.pixelate .
   */
  async load_file(conf) {
    const path = conf["path"];
    if (path.endsWith(".vs") || path.endsWith(".fs")) {
      return await this.load_file_text(conf);
    }
    if (path.includes("glb") || path.includes("gltf")) {
      //return this.load_file_gltf(conf);
      return null;
    } else {
      return await this.load_file_texture(conf);
    }
  }

  async load_file_texture(conf) {
    const name = conf["name"];
    const path = conf["path"];
    //const pixelate = conf["pixelate"] ?? false;
    const image = await Loader.instance.image(`${path}`);
    if (image) {
        this.filecache.set(name, image);
        const texture = this.texturecache.get(name);
        if (texture) {
          texture.set_source(image, this._render);
        }
        return image;
    } 

    logger.error(`Assets::load_file_texture error loading ${path}`);
    return null;
  }

  async load_file_text(conf) {
    const name = conf["name"];
    const path = conf["path"];
    const text = await Loader.instance.text(`${path}`);
    if (typeof text === "string") {
      this.filecache.set(name, text);
      return text;
    }

    logger.error(`Assets::load_file_text error loading ${path}`);
    return null;
  }

  file(name) {
    return this.filecache.get(name) ?? null;
  }

  shader(name) {
    const cached = this.shadercache.get(name);
    if (cached) {
      return cached;
    }

    const shaders = this._db.get("shaders");
    const conf = shaders?.getconfig(name);
    if (!conf) {
      logger.error(`Assets::shader config not found: ${name}`);
      return null;
    }

    const vs_name = conf["vs"];
    const fs_name = conf["fs"];
    const vs = this.file(vs_name);
    const fs = this.file(fs_name);
    if (!vs || !fs) {
      logger.error(`Assets::shader missing sources for ${name}`);
      return null;
    }

    const shader = new Shader().init(vs, fs);
    this.shadercache.set(name, shader);
    shader.start(this._render).catch((error) => {
      logger.error(`Assets::shader error starting ${name}: ${error}`);
      this.shadercache.delete(name);
    });
    return shader;
  }

  texture(name) {
    const cached = this.texturecache.get(name);
    if (cached) {
      return cached;
    }

    const source = this.file(name);
    if (!source) {
      logger.warn(`Assets::texture source missing, using fallback until loaded: ${name}`);
    }
    const texture = new Texture().init(source ?? null);
    this.texturecache.set(name, texture);
    texture.start(this._render);
    return texture;
  }
}

export default Assets;