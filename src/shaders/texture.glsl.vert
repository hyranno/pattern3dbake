#version 300 es
precision highp float;

uniform mat4 worldViewProjection;

in vec3 position;
in vec3 normal;
in vec2 uv;

out vec3 vPosition;
out vec3 vNormal;
out vec2 vUV;

void main() {
  vPosition = position;
  vNormal = vNormal;
  vUV = uv;
  gl_Position = vec4(2.0*uv-vec2(1.0), 0.0, 1.0);
}
