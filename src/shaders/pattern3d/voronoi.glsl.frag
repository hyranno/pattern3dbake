#version 300 es
precision highp float;

#pragma glslify: import('../modules/voronoi.glsl.frag')

uniform vec2 resolution;
uniform sampler2D src;

uniform float strength;
uniform vec3 scale;

in vec3 vPosition;
in vec3 vNormal;
in vec2 vUV;

out vec4 fragColor;

void main() {
  vec4 baseColor = texture(src, vUV);
  fragColor = vec4(
    baseColor.xyz + strength * vec3(voronoi(vPosition * scale)),
    baseColor.w
  );
}
