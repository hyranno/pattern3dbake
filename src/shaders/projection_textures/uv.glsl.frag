#version 300 es
precision highp float;

in vec2 vUV;

out vec4 fragColor;

void main() {
  fragColor = vec4(vUV, 0.0, 1.0);
}
