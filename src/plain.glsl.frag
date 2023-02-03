#version 300 es
precision highp float;

uniform vec2 resolution;

in vec3 normal;
in vec2 vUV;
in vec3 vPosition;

out vec4 fragColor;

void main() {
  fragColor = vec4(1.0);
}
