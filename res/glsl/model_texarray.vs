#version 300 es

layout(std140, column_major) uniform;

layout(location=0) in vec4 position;
layout(location=1) in vec2 uv;
layout(location=2) in vec4 normal;
layout(location=3) in mat4 modelMatrix;
layout(location=7) in float textureLayer;

uniform SceneUniforms {
    mat4 viewProj;
    vec4 eyePosition;
};

out vec3 vPosition;
out vec2 vUV;
out vec3 vNormal;
flat out int vTextureLayer;

void main() {
    vec4 worldPosition = modelMatrix * position;
    vPosition = worldPosition.xyz;
    vUV = uv;
    vNormal = (modelMatrix * normal).xyz;
    vTextureLayer = int(textureLayer);
    gl_Position = viewProj * worldPosition;
}
