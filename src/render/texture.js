/** @namespace ty */
import { PglTexture } from "../lib/picogl.js";

/**
 * @class Texture
 * @memberof pp.render
 */
class Texture {
  static _fallback_texture = null;
  static _fallback_owner = null;

  // 2026-04-30, Codex 5.3: validate texture function JSDoc types [13ceaa]
  /**
   * @constructor
   */
  constructor() {
    /** @type {HTMLImageElement} */
    this.source = null;
    /** @type {PglTexture} */
    this._texture = null;
    /** @type {boolean} */
    this._ready = false;
    /** @type {boolean} */
    this.active = false;
    this._render = null;
    this._version = 0;
  }

  /**
   * @param {HTMLImageElement|null} source
   * @returns {Texture}
   */
  init(source) {
    this.source = source;
    this._texture = null;
    this._ready = false;
    this.active = false;
    this._render = null;
    this._version = 0;
    return this;
  }

  /**
   * @param {import("../render.js").default} render
   * @returns {PglTexture|null}
   */
  start(render) {
    this.active = true;
    this._render = render;
    this._set_fallback();
    return this._ensure_ready_texture();
  }

  /**
   * @returns {void}
   */
  stop() {
    this.active = false;
    this._delete_texture();
    this._texture = Texture._fallback_texture;
    this._ready = false;
    this._render = null;
  }

  /**
   * @param {HTMLImageElement|null} source
   * @param {import("../render.js").default|null} [render=null]
   * @returns {void}
   */
  set_source(source, render = null) {
    this.source = source;
    this._version += 1;
    if (this.active && render) {
      this.start(render);
    }
  }

  /**
   * @returns {number}
   */
  get version() {
    return this._version;
  }

  /**
   * @returns {boolean}
   */
  get ready() {
    return this._ready && this._is_source_ready();
  }

  /**
   * @returns {PglTexture|null}
   */
  get texture() {
    this._ensure_ready_texture();
    return this._texture ?? Texture._fallback_texture;
  }

  /**
   * @returns {boolean}
   */
  _is_source_ready() {
    if (!this.source) {
      return false;
    }
    return this.source.complete && this.source.naturalWidth > 0 && this.source.naturalHeight > 0;
  }

  /**
   * @returns {void}
   */
  _delete_texture() {
    if (this._texture && this._texture !== Texture._fallback_texture) {
      this._texture.delete();
    }
  }

  /**
   * @returns {void}
   */
  _set_fallback() {
    this._ready = false;
    this._texture = this._render ? Texture._fallback(this._render) : Texture._fallback_texture;
  }

  /**
   * @returns {PglTexture|null}
   */
  _ensure_ready_texture() {
    if (!this._render || !this._is_source_ready()) {
      this._set_fallback();
      return this._texture;
    }
    if (this._ready && this._texture && this._texture !== Texture._fallback_texture) {
      return this._texture;
    }
    this._delete_texture();
    this._texture = this._render.pgl.createTexture2D(this.source, this.source.width, this.source.height);
    this._ready = true;
    this._version += 1;
    return this._texture;
  }

  /**
   * @param {import("../render.js").default} render
   * @returns {PglTexture}
   */
  static _fallback(render) {
    if (Texture._fallback_texture && Texture._fallback_owner === render.pgl) {
      return Texture._fallback_texture;
    }
    const white_pixel = new Uint8Array([255, 255, 255, 255]);
    Texture._fallback_texture = render.pgl.createTexture2D(white_pixel, 1, 1);
    Texture._fallback_owner = render.pgl;
    return Texture._fallback_texture;
  }
}

export default Texture;
export { Texture };
// 2026-04-30, Codex 5.3: validate texture function JSDoc types [13ceaa]
