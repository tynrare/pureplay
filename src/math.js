import { mat4, quat, vec3 } from "./lib/glmatrix.js";

export const v3up = vec3.fromValues(0, 1, 0);
export const vzero = vec3.fromValues(0, 0, 0);
export const vone = vec3.fromValues(1, 1, 1);

const qidentity = quat.create();

export function transform(matrix, translate, rotate, scale) {
  const _translate = translate ?? vzero;
  const _rotate = rotate ?? qidentity;
  const _scale = scale ?? vone;
  mat4.fromRotationTranslationScale(matrix, _rotate, _translate, _scale);

  return matrix;
}
