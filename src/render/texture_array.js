/** @namespace ty */
import Texture from "./texture.js";

/**
 * @class TextureArray
 * @memberof pp.render
 */
class TextureArray {
  static _fallback_texture = null;
  static _fallback_owner = null;

  /**
   * @param {Texture[]} textures .
   */
  init(textures) {
    /** @type {Texture[]} */
    this.textures = textures ?? [];
    this._texture = null;
    this._version = 0;
    this._sources_hash = 0;
    this.active = false;
    this._render = null;
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
    if (this._texture && this._texture !== TextureArray._fallback_texture) {
      this._texture.delete();
    }
    this._texture = TextureArray._fallback_texture;
    this._sources_hash = 0;
    this._render = null;
  }

  get texture() {
    this._ensure_ready_texture();
    return this._texture ?? TextureArray._fallback_texture;
  }

  get version() {
    this._ensure_ready_texture();
    return this._version;
  }

  _set_fallback() {
    this._texture = this._render ? TextureArray._fallback(this._render) : TextureArray._fallback_texture;
  }

  _ensure_ready_texture() {
    if (!this._render || !this.textures.length) {
      this._set_fallback();
      return this._texture;
    }

    const layers = [];
    let hash = 2166136261;
    for (const texture of this.textures) {
      const source = texture?.source;
      if (!source || !source.complete || source.naturalWidth <= 0 || source.naturalHeight <= 0) {
        this._set_fallback();
        return this._texture;
      }
      layers.push(source);
      const version = texture.version ?? 0;
      // Lightweight integer-only rolling hash (FNV-like mix).
      hash ^= version + (source.width << 8) + source.height;
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    if (this._texture && this._texture !== TextureArray._fallback_texture && hash === this._sources_hash) {
      return this._texture;
    }

    const width = layers[0].width;
    const height = layers[0].height;
    if (layers.some((image) => image.width !== width || image.height !== height)) {
      this._set_fallback();
      return this._texture;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height * layers.length;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      this._set_fallback();
      return this._texture;
    }

    for (let i = 0; i < layers.length; i++) {
      ctx.drawImage(layers[i], 0, i * height);
    }
    const packed = canvas;

    if (this._texture && this._texture !== TextureArray._fallback_texture) {
      this._texture.delete();
    }

    this._texture = this._render.pgl.createTextureArray(packed, width, height, layers.length);
    this._sources_hash = hash;
    this._version += 1;
    return this._texture;
  }

  static _fallback(render) {
    if (TextureArray._fallback_texture && TextureArray._fallback_owner === render.pgl) {
      return TextureArray._fallback_texture;
    }
    const white_pixel = new Uint8Array([255, 255, 255, 255]);
    TextureArray._fallback_texture = render.pgl.createTextureArray(white_pixel, 1, 1, 1);
    TextureArray._fallback_owner = render.pgl;
    return TextureArray._fallback_texture;
  }
}

export default TextureArray;
export { TextureArray };
