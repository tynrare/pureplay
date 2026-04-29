/** @namespace ty */
import { PglTexture } from "../lib/picogl.js";

/**
 * @class Texture
 * @memberof pp.render
 */
class Texture {
  static _fallback_texture = null;
  static _fallback_owner = null;

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

  init(source) {
    this.source = source;
    this._texture = null;
    this._ready = false;
    this.active = false;
    this._render = null;
    this._version = 0;
    return this;
  }

  start(render) {
    this.active = true;
    this._render = render;
    this._set_fallback();
    return this._ensure_ready_texture();
  }

  stop() {
    this.active = false;
    this._delete_texture();
    this._texture = Texture._fallback_texture;
    this._ready = false;
    this._render = null;
  }

  set_source(source, render = null) {
    this.source = source;
    this._version += 1;
    if (this.active && render) {
      this.start(render);
    }
  }

  get version() {
    return this._version;
  }

  get ready() {
    return this._ready && this._is_source_ready();
  }

  get texture() {
    this._ensure_ready_texture();
    return this._texture ?? Texture._fallback_texture;
  }

  _is_source_ready() {
    if (!this.source) {
      return false;
    }
    return this.source.complete && this.source.naturalWidth > 0 && this.source.naturalHeight > 0;
  }

  _delete_texture() {
    if (this._texture && this._texture !== Texture._fallback_texture) {
      this._texture.delete();
    }
  }

  _set_fallback() {
    this._ready = false;
    this._texture = this._render ? Texture._fallback(this._render) : Texture._fallback_texture;
  }

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
