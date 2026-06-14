import { mat4, quat, vec3 } from "./lib/glmatrix.js";

export const v3up = vec3.fromValues(0, 1, 0);
export const vzero = vec3.fromValues(0, 0, 0);
export const vone = vec3.fromValues(1, 1, 1);

export const cachev3 = {
  v0: vec3.fromValues(0, 0, 0),
  v1: vec3.fromValues(0, 0, 0),
  v2: vec3.fromValues(0, 0, 0),
  v3: vec3.fromValues(0, 0, 0),
  v4: vec3.fromValues(0, 0, 0),
  v5: vec3.fromValues(0, 0, 0),
  v6: vec3.fromValues(0, 0, 0),
  v7: vec3.fromValues(0, 0, 0),
  v8: vec3.fromValues(0, 0, 0),
  v9: vec3.fromValues(0, 0, 0),
}

const qidentity = quat.create();

export function transform(matrix, translate, rotate, scale) {
  const _translate = translate ?? vzero;
  const _rotate = rotate ?? qidentity;
  const _scale = scale ?? vone;
  mat4.fromRotationTranslationScale(matrix, _rotate, _translate, _scale);

  return matrix;
}

export function v3(x, y, z, out = cachev3.v0) {
  return vec3.set(out, x, y, z);
}
