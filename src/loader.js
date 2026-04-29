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

  image(path) {
    console.log(`Loader::image loading ${path}`); 
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => { resolve(image) };
      image.onerror = (event) => {
        const is_critical_error =
          event?.type !== "abort" &&
          (!image.complete || image.naturalWidth === 0 || image.naturalHeight === 0);
        resolve(is_critical_error ? null : image);
      };
      image.src = path;
    });
  }

  text(path) {
    return fetch(path)
      .then((response) => {
        if (!response.ok) {
          return null;
        }
        return response.text();
      })
      .catch(() => null);
  }
}

export default Loader;
