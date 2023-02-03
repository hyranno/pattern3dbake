#version 300 es
precision highp float;

uniform vec2 resolution;

in vec3 vPosition;
in vec3 vNormal;
in vec2 vUV;

out vec4 fragColor;

void main() {
  fragColor = vec4(vUV, 0.0, 1.0);
}
