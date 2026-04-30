/** @namespace ty */
import Texture from "./texture.js";

/**
 * @class TextureArray
 * @memberof pp.render
 */
class TextureArray {
  static _fallback_texture = null;
  static _fallback_owner = null;

  // 2026-04-30, Codex 5.3: validate texture array JSDoc types [22d91b]
  /**
   * @param {Texture[]} textures .
   * @returns {TextureArray}
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

  /**
   * @param {import("../render.js").default} render
   * @returns {import("../lib/picogl.js").PglTexture|null}
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
    if (this._texture && this._texture !== TextureArray._fallback_texture) {
      this._texture.delete();
    }
    this._texture = TextureArray._fallback_texture;
    this._sources_hash = 0;
    this._render = null;
  }

  /**
   * @returns {import("../lib/picogl.js").PglTexture|null}
   */
  get texture() {
    this._ensure_ready_texture();
    return this._texture ?? TextureArray._fallback_texture;
  }

  /**
   * @returns {number}
   */
  get version() {
    this._ensure_ready_texture();
    return this._version;
  }

  /**
   * @returns {void}
   */
  _set_fallback() {
    this._texture = this._render ? TextureArray._fallback(this._render) : TextureArray._fallback_texture;
  }

  /**
   * @returns {import("../lib/picogl.js").PglTexture|null}
   */
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

    const tiles = layers.length;
    const columns = Math.max(1, Math.ceil(Math.sqrt(tiles)));
    const rows = Math.max(1, Math.ceil(tiles / columns));
    const canvas = document.createElement("canvas");
    canvas.width = width * columns;
    canvas.height = height * rows;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      this._set_fallback();
      return this._texture;
    }

    // 2026-04-30, Codex 5.3: square-ish texture array packing [a71f2d9b]
    for (let i = 0; i < tiles; i++) {
      const x = (i % columns) * width;
      const y = Math.floor(i / columns) * height;
      ctx.drawImage(layers[i], x, y);
    }
    const atlas = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const pixel_data = new Uint8Array(width * height * tiles * 4);
    const atlas_stride = canvas.width * 4;
    const layer_stride = width * height * 4;
    const row_stride = width * 4;
    for (let layer = 0; layer < tiles; layer++) {
      const tile_x = (layer % columns) * width;
      const tile_y = Math.floor(layer / columns) * height;
      const layer_offset = layer * layer_stride;
      for (let row = 0; row < height; row++) {
        const src = (tile_y + row) * atlas_stride + tile_x * 4;
        const dst = layer_offset + row * row_stride;
        pixel_data.set(atlas.subarray(src, src + row_stride), dst);
      }
    }

    if (this._texture && this._texture !== TextureArray._fallback_texture) {
      this._texture.delete();
    }

    this._texture = this._render.pgl.createTextureArray(pixel_data, width, height, tiles);
    this._sources_hash = hash;
    this._version += 1;
    return this._texture;
  }

  /**
   * @param {import("../render.js").default} render
   * @returns {import("../lib/picogl.js").PglTexture}
   */
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
// 2026-04-30, Codex 5.3: square-ish texture array packing [a71f2d9b]
// 2026-04-30, Codex 5.3: validate texture array JSDoc types [22d91b]
