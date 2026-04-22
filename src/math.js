import { mat4, vec3 } from "./lib/glmatrix.js";

export const v3up = vec3.fromValues(0, 1, 0);
export const vzero = vec3.fromValues(0, 0, 0);
export const vone = vec3.fromValues(1, 1, 1);

const translateMat = mat4.create();
const rotateXMat = mat4.create();
const rotateYMat = mat4.create();
const rotateZMat = mat4.create();
const scaleMat = mat4.create();

export function transform(matrix, translate, rotate, scale) {
  const _translate = translate ?? vzero;
  const _rotate = rotate ?? vzero;
  const _scale = scale ?? vone;

  mat4.fromTranslation(translateMat, _translate);
  mat4.fromXRotation(rotateXMat, _rotate[0]);
  mat4.fromYRotation(rotateYMat, _rotate[1]);
  mat4.fromZRotation(rotateZMat, _rotate[2]);
  mat4.fromScaling(scaleMat, _scale);

  mat4.multiply(matrix, rotateXMat, scaleMat);
  mat4.multiply(matrix, rotateYMat, matrix);
  mat4.multiply(matrix, rotateZMat, matrix);
  mat4.multiply(matrix, translateMat, matrix);

  return matrix;
}
