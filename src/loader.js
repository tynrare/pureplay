/** @namespace ty */

/**
 * @class Play
 * @memberof pp.core
 */
class Loader {
  static _instance;

  /**
   * @returns {Loader} .
   */
  static get instance() {
    if (!Loader._instance) {
      Loader._instance = new Loader();
    }

    return Loader._instance;
  }

  texture(path) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => { resolve(image) };
      image.onerror = reject;
      image.src = path;
    });
  }
}

export default Loader;
