#version 300 es
precision highp float;

uniform mat4 worldViewProjection;

in vec3 position;
in vec2 uv;

out vec2 vUV;
out vec3 vPosition;

void main() {
  vUV = uv;
  vPosition = position;
  gl_Position = worldViewProjection * vec4(position, 1.0);
}
