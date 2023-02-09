#version 300 es
precision highp float;

uniform vec2 resolution;
uniform sampler2D src;

in vec3 vPosition;
in vec3 vNormal;
in vec2 vUV;

out vec4 fragColor;

void main() {
  fragColor = texture(src, vUV);
}
