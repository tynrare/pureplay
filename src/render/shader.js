/** @namespace ty */
import { PglProgram } from "../lib/picogl.js";

/**
 * @class Shader
 * @memberof pp.render
 */
class Shader {
  constructor() {
    this.vs = null;
    this.fs = null;
    /** @type {PglProgram} */
    this.program = null;
    this.ready = false;
    this.active = false;
  }

  init(vs, fs) {
    this.vs = vs;
    this.fs = fs;
    this.program = null;
    this.ready = false;
    this.active = false;
    return this;
  }

  start(render) {
    this.active = true;
    this.ready = false;
    return render.pgl.createPrograms([this.vs, this.fs]).then(([program]) => {
      this.program = program;
      this.ready = true;
      return program;
    });
  }

  stop() {
    this.active = false;
    this.ready = false;
    if (this.program) {
      this.program.delete();
      this.program = null;
    }
  }
}

export default Shader;
export { Shader };
