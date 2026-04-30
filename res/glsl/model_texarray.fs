#version 300 es
precision highp float;

layout(std140, column_major) uniform;

uniform SceneUniforms {
    mat4 viewProj;
    vec4 eyePosition;
};

uniform highp sampler2DArray tex;

in vec3 vPosition;
in vec2 vUV;
in vec3 vNormal;
flat in int vTextureLayer;

out vec4 fragColor;
void main() {
    // 2026-04-30, Codex 5.3: position-independent directional diffuse light [8b6ad1]
    vec3 lightDirection = normalize(vec3(-1.0, -1.0, -0.5));
    vec3 color = texture(tex, vec3(vUV, float(vTextureLayer))).rgb;

    vec3 normal = normalize(vNormal);
    vec3 lightVec = normalize(-lightDirection);
    float diffuse = max(dot(lightVec, normal), 0.0);
    float ambient = 0.1;
    fragColor = vec4(color * (diffuse + ambient), 1.0);
}
// 2026-04-30, Codex 5.3: position-independent directional diffuse light [8b6ad1]
